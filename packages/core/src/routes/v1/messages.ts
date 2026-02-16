import { Router, Request, Response } from 'express';
import type { Router as RouterType } from 'express';
import { nanoid } from 'nanoid';
import { db } from '../../lib/db/postgres.js';
import { authenticate } from '../../middleware/auth.js';
import type { AnthropicMessageCreateParams, AnthropicError, Gate, LayerRequest } from '@layer-ai/sdk';
import { spendingTracker } from '../../lib/spending-tracker.js';
import {
  convertAnthropicRequestToLayer,
  convertLayerResponseToAnthropic,
  convertLayerStreamToAnthropicEvents,
} from '../../lib/anthropic-conversion.js';
import { resolveFinalRequest } from '../v3/chat.js';
import { callAdapter, callAdapterStream } from '../../lib/provider-factory.js';

const router: RouterType = Router();

async function* executeWithRoutingStream(gateConfig: Gate, request: LayerRequest, userId?: string): AsyncIterable<any> {
  yield* callAdapterStream(request, userId);
}

async function executeWithRouting(gateConfig: Gate, request: LayerRequest, userId?: string): Promise<any> {
  const result = await callAdapter(request, userId);
  return { result, modelUsed: request.model };
}

router.post('/', authenticate, async (req: Request, res: Response) => {
  const startTime = Date.now();

  if (!req.userId) {
    const error: AnthropicError = {
      type: 'error',
      error: {
        type: 'authentication_error',
        message: 'Missing user ID',
      },
    };
    res.status(401).json(error);
    return;
  }
  const userId = req.userId;

  let gateConfig: Gate | null = null;
  let layerRequest: LayerRequest | null = null;

  try {
    const anthropicReq = req.body as AnthropicMessageCreateParams;

    // Extract gate ID from multiple possible sources
    let gateId = anthropicReq.gateId || req.headers['x-layer-gate-id'] as string;

    // If not found in body or header, try to extract from model field
    if (!gateId && anthropicReq.model) {
      const modelStr = anthropicReq.model;
      // Try to extract UUID from model field (e.g., "layer/82ab7591-..." or "layer:82ab7591-..." or just "82ab7591-...")
      const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
      const match = modelStr.match(uuidPattern);
      if (match) {
        gateId = match[0];
      }
    }

    if (!gateId) {
      const error: AnthropicError = {
        type: 'error',
        error: {
          type: 'invalid_request_error',
          message: 'Missing required field: gateId (provide in request body, X-Layer-Gate-Id header, or as part of model field)',
        },
      };
      res.status(400).json(error);
      return;
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(gateId);
    if (!isUUID) {
      const error: AnthropicError = {
        type: 'error',
        error: {
          type: 'invalid_request_error',
          message: 'gateId must be a valid UUID',
        },
      };
      res.status(400).json(error);
      return;
    }

    gateConfig = await db.getGateByUserAndId(userId, gateId);
    if (!gateConfig) {
      const error: AnthropicError = {
        type: 'error',
        error: {
          type: 'not_found_error',
          message: `Gate with ID "${gateId}" not found`,
        },
      };
      res.status(404).json(error);
      return;
    }

    if (!anthropicReq.messages || !Array.isArray(anthropicReq.messages) || anthropicReq.messages.length === 0) {
      const error: AnthropicError = {
        type: 'error',
        error: {
          type: 'invalid_request_error',
          message: 'Missing required field: messages (must be a non-empty array)',
        },
      };
      res.status(400).json(error);
      return;
    }

    if (!anthropicReq.max_tokens) {
      const error: AnthropicError = {
        type: 'error',
        error: {
          type: 'invalid_request_error',
          message: 'Missing required field: max_tokens',
        },
      };
      res.status(400).json(error);
      return;
    }

    if (gateConfig.taskType && gateConfig.taskType !== 'chat') {
      console.warn(
        `[Type Mismatch] Gate "${gateConfig.name}" (${gateConfig.id}) configured for taskType="${gateConfig.taskType}" ` +
        `but received request to /v1/messages endpoint. Processing as chat request.`
      );
    }

    layerRequest = convertAnthropicRequestToLayer(anthropicReq, gateId);
    const finalRequest = resolveFinalRequest(gateConfig, layerRequest);
    const isStreaming = finalRequest.data && 'stream' in finalRequest.data && finalRequest.data.stream === true;

    if (isStreaming) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      let promptTokens = 0;
      let completionTokens = 0;
      let totalCost = 0;
      let modelUsed = finalRequest.model;

      try {
        const streamGenerator = executeWithRoutingStream(gateConfig, finalRequest, userId) as AsyncGenerator<any>;

        for await (const event of convertLayerStreamToAnthropicEvents(streamGenerator)) {
          // Track usage from message_start and message_delta events
          if (event.type === 'message_start' && event.message.usage) {
            promptTokens = event.message.usage.input_tokens;
          }
          if (event.type === 'message_delta' && event.usage) {
            completionTokens = event.usage.output_tokens;
          }
          if (event.type === 'message_start') {
            modelUsed = event.message.model;
          }

          // Write event to stream
          res.write(`event: ${event.type}\n`);
          res.write(`data: ${JSON.stringify(event)}\n\n`);
        }

        res.end();

        const latencyMs = Date.now() - startTime;

        db.logRequest({
          userId,
          gateId: gateConfig.id,
          gateName: gateConfig.name,
          modelRequested: layerRequest.model || gateConfig.model,
          modelUsed: modelUsed,
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
          costUsd: totalCost,
          latencyMs,
          success: true,
          errorMessage: null,
          userAgent: req.headers['user-agent'] || null,
          ipAddress: req.ip || null,
          requestPayload: {
            gateId: layerRequest.gateId,
            type: layerRequest.type,
            model: layerRequest.model,
            data: layerRequest.data,
            metadata: layerRequest.metadata,
          },
          responsePayload: {
            streamed: true,
            model: modelUsed,
            usage: { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens },
            cost: totalCost,
          },
        }).catch(err => console.error('Failed to log request:', err));

        spendingTracker.trackSpending(userId, totalCost).catch(err => {
          console.error('Failed to track spending:', err);
        });

      } catch (streamError) {
        const errorMessage = streamError instanceof Error ? streamError.message : 'Unknown streaming error';
        const anthropicError: AnthropicError = {
          type: 'error',
          error: {
            type: 'api_error',
            message: errorMessage,
          },
        };
        res.write(`event: error\n`);
        res.write(`data: ${JSON.stringify(anthropicError)}\n\n`);
        res.end();

        db.logRequest({
          userId,
          gateId: gateConfig.id,
          gateName: gateConfig.name,
          modelRequested: layerRequest.model || gateConfig.model,
          modelUsed: null,
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          costUsd: 0,
          latencyMs: Date.now() - startTime,
          success: false,
          errorMessage,
          userAgent: req.headers['user-agent'] || null,
          ipAddress: req.ip || null,
          requestPayload: {
            gateId: layerRequest.gateId,
            type: layerRequest.type,
            model: layerRequest.model,
            data: layerRequest.data,
            metadata: layerRequest.metadata,
          },
          responsePayload: null,
        }).catch(err => console.error('Failed to log request:', err));
      }

      return;
    }

    const { result, modelUsed } = await executeWithRouting(gateConfig, finalRequest, userId);
    const latencyMs = Date.now() - startTime;

    db.logRequest({
      userId,
      gateId: gateConfig.id,
      gateName: gateConfig.name,
      modelRequested: layerRequest.model || gateConfig.model,
      modelUsed: modelUsed,
      promptTokens: result.usage?.promptTokens || 0,
      completionTokens: result.usage?.completionTokens || 0,
      totalTokens: result.usage?.totalTokens || 0,
      costUsd: result.cost || 0,
      latencyMs,
      success: true,
      errorMessage: null,
      userAgent: req.headers['user-agent'] || null,
      ipAddress: req.ip || null,
      requestPayload: {
        gateId: layerRequest.gateId,
        type: layerRequest.type,
        model: layerRequest.model,
        data: layerRequest.data,
        metadata: layerRequest.metadata,
      },
      responsePayload: {
        content: result.content,
        model: result.model,
        usage: result.usage,
        cost: result.cost,
        finishReason: result.finishReason,
      },
    }).catch(err => console.error('Failed to log request:', err));

    spendingTracker.trackSpending(userId, result.cost || 0).catch(err => {
      console.error('Failed to track spending:', err);
    });

    const anthropicResponse = convertLayerResponseToAnthropic(result);
    res.json(anthropicResponse);

  } catch(error) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    db.logRequest({
      userId,
      gateId: gateConfig?.id || null,
      gateName: gateConfig?.name || null,
      modelRequested: (layerRequest?.model || gateConfig?.model) || 'unknown',
      modelUsed: null,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      costUsd: 0,
      latencyMs,
      success: false,
      errorMessage,
      userAgent: req.headers['user-agent'] || null,
      ipAddress: req.ip || null,
      requestPayload: layerRequest ? {
        gateId: layerRequest.gateId,
        type: layerRequest.type,
        model: layerRequest.model,
        data: layerRequest.data,
        metadata: layerRequest.metadata,
      } : null,
      responsePayload: null,
    }).catch(err => console.error('Failed to log request:', err));

    console.error('Anthropic messages error:', error);

    const anthropicError: AnthropicError = {
      type: 'error',
      error: {
        type: 'api_error',
        message: errorMessage,
      },
    };
    res.status(500).json(anthropicError);
  }
});

export default router;
