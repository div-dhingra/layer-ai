import { Router, Request, Response } from 'express';
import type { Router as RouterType } from 'express';
import { db } from '../../lib/db/postgres.js';
import { authenticate } from '../../middleware/auth.js';
import { callAdapter, normalizeModelId, getProviderForModel, PROVIDER } from '../../lib/provider-factory.js';
import type { LayerRequest, LayerResponse, Gate, SupportedModel, OverrideConfig, ChatRequest } from '@layer-ai/sdk';
import { OverrideField } from '@layer-ai/sdk';

const router: RouterType = Router();

// MARK:- Types

interface RoutingResult {
  result: LayerResponse;
  modelUsed: SupportedModel;
}

// MARK:- Helper Functions

function isOverrideAllowed(allowOverrides: boolean | OverrideConfig | undefined | null, field: keyof OverrideConfig): boolean {
  if (allowOverrides === undefined || allowOverrides === null || allowOverrides === true) return true;
  if (allowOverrides === false) return false;
  return allowOverrides[field] ?? false;
}

export function resolveFinalRequest(
  gateConfig: Gate,
  request: LayerRequest
): LayerRequest {
  let finalModel = gateConfig.model;

  if (request.model && isOverrideAllowed(gateConfig.allowOverrides, OverrideField.Model)) {
    try {
      finalModel = normalizeModelId(request.model);
    } catch {
      finalModel = gateConfig.model;
    }
  }

  // Since this is v3/chat endpoint, we know the data is ChatRequest
  const chatData: ChatRequest = { ...request.data } as ChatRequest;

  if (!chatData.systemPrompt && gateConfig.systemPrompt) {
    chatData.systemPrompt = gateConfig.systemPrompt;
  }

  if (chatData.temperature === undefined && gateConfig.temperature !== undefined) {
    chatData.temperature = gateConfig.temperature;
  } else if (chatData.temperature !== undefined && !isOverrideAllowed(gateConfig.allowOverrides, OverrideField.Temperature)) {
    chatData.temperature = gateConfig.temperature;
  }

  if (chatData.maxTokens === undefined && gateConfig.maxTokens !== undefined) {
    chatData.maxTokens = gateConfig.maxTokens;
  } else if (chatData.maxTokens !== undefined && !isOverrideAllowed(gateConfig.allowOverrides, OverrideField.MaxTokens)) {
    chatData.maxTokens = gateConfig.maxTokens;
  }

  if (chatData.topP === undefined && gateConfig.topP !== undefined) {
    chatData.topP = gateConfig.topP;
  } else if (chatData.topP !== undefined && !isOverrideAllowed(gateConfig.allowOverrides, OverrideField.TopP)) {
    chatData.topP = gateConfig.topP;
  }

  // Apply structured output (response format) from gate config if enabled
  if (gateConfig.responseFormatEnabled && gateConfig.responseFormatType) {
    const modelProvider = getProviderForModel(finalModel);

    if (modelProvider === PROVIDER.OPENAI) {
      // OpenAI: Use native response_format support
      if (gateConfig.responseFormatType === 'json_schema' && gateConfig.responseFormatSchema) {
        // Schema is already in the correct format from DB
        chatData.responseFormat = gateConfig.responseFormatSchema as { type: 'json_schema'; json_schema: unknown };
      } else {
        chatData.responseFormat = gateConfig.responseFormatType; // 'text' or 'json_object'
      }
    } else {
      // Non-OpenAI providers: Beta mode - inject instructions into system prompt
      if (gateConfig.responseFormatType !== 'text') {
        let schemaInstructions = '';

        if (gateConfig.responseFormatType === 'json_schema' && gateConfig.responseFormatSchema) {
          // Extract just the schema portion if it's the full OpenAI format
          const schemaObj = gateConfig.responseFormatSchema as any;
          const actualSchema = schemaObj.json_schema?.schema || schemaObj;

          schemaInstructions = `\n\nYou MUST respond with ONLY a valid JSON object matching this schema. Do not include ANY text before or after the JSON. Do not wrap it in markdown code blocks. Do not add explanations. ONLY output the raw JSON object.\n\nRequired JSON Schema:\n${JSON.stringify(actualSchema, null, 2)}`;
        } else if (gateConfig.responseFormatType === 'json_object') {
          schemaInstructions = `\n\nYou MUST respond with ONLY a valid JSON object. Do not include ANY text before or after the JSON. Do not wrap it in markdown code blocks. Do not add explanations. ONLY output the raw JSON object.`;
        }

        // Append to existing system prompt or create new one
        chatData.systemPrompt = (chatData.systemPrompt || '') + schemaInstructions;

        // Log info message about beta mode
        console.log(
          `[Layer AI - Structured Output Beta] Gate "${gateConfig.name}" (ID: ${gateConfig.id}) ` +
          `is using structured output with provider "${modelProvider}". This is a beta feature that relies on ` +
          `prompt engineering and may not be as reliable as OpenAI's native support.`
        );
      }
    }
  }

  return {
    ...request,
    type: 'chat',
    model: normalizeModelId(finalModel),
    data: chatData,
  } as LayerRequest;
}

function getModelsToTry(gateConfig: Gate, primaryModel: SupportedModel): SupportedModel[] {
  const modelsToTry: SupportedModel[] = [primaryModel];

  if (gateConfig.routingStrategy === 'fallback' && gateConfig.fallbackModels?.length) {
    modelsToTry.push(...gateConfig.fallbackModels);
  }

  return modelsToTry;
}

async function executeWithFallback(request: LayerRequest, modelsToTry: SupportedModel[], userId?: string): Promise<RoutingResult> {
  let result: LayerResponse | null = null;
  let lastError: Error | null = null;
  let modelUsed: SupportedModel = request.model as SupportedModel;

  for (const modelToTry of modelsToTry) {
    try {
      const modelRequest = { ...request, model: modelToTry };
      result = await callAdapter(modelRequest, userId);
      modelUsed = modelToTry;
      break;
    } catch (error) {
      lastError = error as Error;
      console.log(`Model ${modelToTry} failed, trying next fallback...`, error instanceof Error ? error.message : error);
      continue;
    }
  }

  if (!result) {
    throw lastError || new Error('All models failed');
  }

  return { result, modelUsed };
}

async function executeWithRoundRobin(gateConfig: Gate, request: LayerRequest, userId?: string): Promise<RoutingResult> {
  if (!gateConfig.fallbackModels?.length) {
    const result = await callAdapter(request, userId);
    return { result, modelUsed: request.model as SupportedModel };
  }

  const allModels = [gateConfig.model, ...gateConfig.fallbackModels];
  const modelIndex = Math.floor(Math.random() * allModels.length);
  const selectedModel = allModels[modelIndex];

  const modelRequest = { ...request, model: selectedModel };
  const result = await callAdapter(modelRequest, userId);

  return { result, modelUsed: selectedModel };
}

async function executeWithRouting(gateConfig: Gate, request: LayerRequest, userId?: string): Promise<RoutingResult> {
  const modelsToTry = getModelsToTry(gateConfig, request.model as SupportedModel);

  switch (gateConfig.routingStrategy) {
    case 'fallback':
      return await executeWithFallback(request, modelsToTry, userId);

    case 'round-robin':
      return await executeWithRoundRobin(gateConfig, request, userId);

    case 'single':
    default:
      const result = await callAdapter(request, userId);
      return { result, modelUsed: request.model as SupportedModel };
  }
}

// MARK:- Route Handler

router.post('/', authenticate, async (req: Request, res: Response) => {
  const startTime = Date.now();

  if (!req.userId) {
    res.status(401).json({ error: 'unauthorized', message: 'Missing user ID'});
    return;
  }
  const userId = req.userId;

  let gateConfig: Gate | null = null;
  let request: LayerRequest | null = null;

  try {
    const rawRequest = req.body;

    if (!rawRequest.gateId) {
      res.status(400).json({ error: 'bad_request', message: 'Missing required field: gateId' });
      return;
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawRequest.gateId);
    if (!isUUID) {
      res.status(400).json({ error: 'bad_request', message: 'gateId must be a valid UUID' });
      return;
    }

    gateConfig = await db.getGateByUserAndId(userId, rawRequest.gateId);
    if (!gateConfig) {
      res.status(404).json({ error: 'not_found', message: `Gate with ID "${rawRequest.gateId}" not found` });
      return;
    }

    // Validate chat-specific fields
    if (!rawRequest.data?.messages || !Array.isArray(rawRequest.data.messages) || rawRequest.data.messages.length === 0) {
      res.status(400).json({ error: 'bad_request', message: 'Missing required field: data.messages (must be a non-empty array)' });
      return;
    }

    // Warn if gate is configured for a different task type
    if (gateConfig.taskType && gateConfig.taskType !== 'chat') {
      console.warn(
        `[Type Mismatch] Gate "${gateConfig.name}" (${gateConfig.id}) configured for taskType="${gateConfig.taskType}" ` +
        `but received request to /v3/chat endpoint. Processing as chat request.`
      );
    }

    request = {
      gateId: rawRequest.gateId,
      type: 'chat',
      data: rawRequest.data,
      model: rawRequest.model,
      metadata: rawRequest.metadata
    } as LayerRequest;

    const finalRequest = resolveFinalRequest(gateConfig, request);
    const { result, modelUsed } = await executeWithRouting(gateConfig, finalRequest, userId);

    const latencyMs = Date.now() - startTime;

    // Log request to database
    db.logRequest({
      userId,
      gateId: gateConfig.id,
      gateName: gateConfig.name,
      modelRequested: request.model || gateConfig.model,
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
        gateId: request.gateId,
        type: request.type,
        model: request.model,
        data: request.data,
        metadata: request.metadata,
      },
      responsePayload: {
        content: result.content,
        model: result.model,
        usage: result.usage,
        cost: result.cost,
        finishReason: result.finishReason,
      },
    }).catch(err => console.error('Failed to log request:', err));

    // Return LayerResponse with additional metadata
    const response: LayerResponse = {
      ...result,
      model: modelUsed,
      latencyMs,
    };

    res.json(response);
  } catch(error) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    db.logRequest({
      userId,
      gateId: gateConfig?.id || null,
      gateName: req.body?.gate || null,
      modelRequested: (request?.model || gateConfig?.model) || 'unknown',
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
      requestPayload: request ? {
        gateId: request.gateId,
        type: request.type,
        model: request.model,
        data: request.data,
        metadata: request.metadata,
      } : null,
      responsePayload: null,
    }).catch(err => console.error('Failed to log request:', err));

    console.error('Chat completion error:', error);
    res.status(500).json({ error: 'internal_error', message: errorMessage });
  }
});

export default router;
