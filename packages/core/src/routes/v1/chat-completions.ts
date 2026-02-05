import { Router, Request, Response } from 'express';
import type { Router as RouterType } from 'express';
import { nanoid } from 'nanoid';
import { db } from '../../lib/db/postgres.js';
import { authenticate } from '../../middleware/auth.js';
import type { OpenAIChatCompletionRequest, OpenAIError, Gate, LayerRequest } from '@layer-ai/sdk';
import {
  convertOpenAIRequestToLayer,
  convertLayerResponseToOpenAI,
  convertLayerChunkToOpenAI,
} from '../../lib/openai-conversion.js';
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
    const error: OpenAIError = {
      error: {
        message: 'Missing user ID',
        type: 'authentication_error',
        code: 'unauthorized',
      },
    };
    res.status(401).json(error);
    return;
  }
  const userId = req.userId;

  let gateConfig: Gate | null = null;
  let layerRequest: LayerRequest | null = null;

  try {
    const openaiReq = req.body as OpenAIChatCompletionRequest;

    const gateId = openaiReq.gateId || req.headers['x-layer-gate-id'] as string;
    if (!gateId) {
      const error: OpenAIError = {
        error: {
          message: 'Missing required field: gateId (provide in request body or X-Layer-Gate-Id header)',
          type: 'invalid_request_error',
          param: 'gateId',
          code: 'missing_field',
        },
      };
      res.status(400).json(error);
      return;
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(gateId);
    if (!isUUID) {
      const error: OpenAIError = {
        error: {
          message: 'gateId must be a valid UUID',
          type: 'invalid_request_error',
          param: 'gateId',
          code: 'invalid_format',
        },
      };
      res.status(400).json(error);
      return;
    }

    gateConfig = await db.getGateByUserAndId(userId, gateId);
    if (!gateConfig) {
      const error: OpenAIError = {
        error: {
          message: `Gate with ID "${gateId}" not found`,
          type: 'invalid_request_error',
          param: 'gateId',
          code: 'not_found',
        },
      };
      res.status(404).json(error);
      return;
    }

    if (!openaiReq.messages || !Array.isArray(openaiReq.messages) || openaiReq.messages.length === 0) {
      const error: OpenAIError = {
        error: {
          message: 'Missing required field: messages (must be a non-empty array)',
          type: 'invalid_request_error',
          param: 'messages',
          code: 'missing_field',
        },
      };
      res.status(400).json(error);
      return;
    }

    if (gateConfig.taskType && gateConfig.taskType !== 'chat') {
      console.warn(
        `[Type Mismatch] Gate "${gateConfig.name}" (${gateConfig.id}) configured for taskType="${gateConfig.taskType}" ` +
        `but received request to /v1/chat/completions endpoint. Processing as chat request.`
      );
    }

    layerRequest = convertOpenAIRequestToLayer(openaiReq, gateId);
    const finalRequest = resolveFinalRequest(gateConfig, layerRequest);
    const isStreaming = finalRequest.data && 'stream' in finalRequest.data && finalRequest.data.stream === true;

    if (isStreaming) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      const requestId = `chatcmpl-${nanoid()}`;
      const created = Math.floor(Date.now() / 1000);

      let promptTokens = 0;
      let completionTokens = 0;
      let totalCost = 0;
      let modelUsed = finalRequest.model;

      try {
        for await (const layerChunk of executeWithRoutingStream(gateConfig, finalRequest, userId)) {
          if (layerChunk.usage) {
            promptTokens = layerChunk.usage.promptTokens || 0;
            completionTokens = layerChunk.usage.completionTokens || 0;
          }
          if (layerChunk.cost) {
            totalCost = layerChunk.cost;
          }
          if (layerChunk.model) {
            modelUsed = layerChunk.model;
          }

          const openaiChunk = convertLayerChunkToOpenAI(layerChunk, requestId, created);
          res.write(`data: ${JSON.stringify(openaiChunk)}\n\n`);
        }

        res.write(`data: [DONE]\n\n`);
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

      } catch (streamError) {
        const errorMessage = streamError instanceof Error ? streamError.message : 'Unknown streaming error';
        const openaiError: OpenAIError = {
          error: {
            message: errorMessage,
            type: 'server_error',
            code: 'stream_error',
          },
        };
        res.write(`data: ${JSON.stringify(openaiError)}\n\n`);
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

    const openaiResponse = convertLayerResponseToOpenAI(result);
    res.json(openaiResponse);

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

    console.error('OpenAI chat completion error:', error);

    const openaiError: OpenAIError = {
      error: {
        message: errorMessage,
        type: 'server_error',
        code: 'internal_error',
      },
    };
    res.status(500).json(openaiError);
  }
});

export default router;
