import { Router, Request, Response } from 'express';
import type { Router as RouterType } from 'express';
import { db } from '../../lib/db/postgres.js';
import { cache } from '../../lib/db/redis.js';
import { authenticate } from '../../middleware/auth.js';
import { OpenAIAdapter } from '../../services/providers/openai-adapter.js';
import { AnthropicAdapter } from '../../services/providers/anthropic-adapter.js';
import { GoogleAdapter } from '../../services/providers/google-adapter.js';
import * as google from '../../services/providers/google.js';
import type { LayerRequest, LayerResponse, Gate, SupportedModel, OverrideConfig } from '@layer-ai/sdk';
import { MODEL_REGISTRY, OverrideField } from '@layer-ai/sdk';


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

async function getGateConfig(userId: string, gateName: string): Promise<Gate | null> {
  let gateConfig = await cache.getGate(userId, gateName);

  if (!gateConfig) {
    gateConfig = await db.getGateByUserAndName(userId, gateName);
    if (gateConfig) {
      await cache.setGate(userId, gateName, gateConfig);
    }
  }

  return gateConfig;
}

function resolveFinalRequest(
  gateConfig: Gate,
  request: LayerRequest
): LayerRequest {
  const finalRequest = { ...request };
  let finalModel = gateConfig.model;

  if (request.model && isOverrideAllowed(gateConfig.allowOverrides, OverrideField.Model) && MODEL_REGISTRY[request.model as SupportedModel]) {
    finalModel = request.model as SupportedModel;
  }
  finalRequest.model = finalModel;

  if (request.type === 'chat') {
    const chatData = { ...request.data };

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

    finalRequest.data = chatData;
  }

  return finalRequest;
}

async function callProvider(request: LayerRequest): Promise<LayerResponse> {
  const provider = MODEL_REGISTRY[request.model as SupportedModel].provider;

  switch (provider) {
    case 'openai': {
      const adapter = new OpenAIAdapter();
      return await adapter.call(request);
    }
    case 'anthropic': {
      const adapter = new AnthropicAdapter();
      return await adapter.call(request);
    }
    case 'google':
      const adapter = new GoogleAdapter();
      return await adapter.call(request);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

function getModelsToTry(gateConfig: Gate, primaryModel: SupportedModel): SupportedModel[] {
  const modelsToTry: SupportedModel[] = [primaryModel];

  if (gateConfig.routingStrategy === 'fallback' && gateConfig.fallbackModels?.length) {
    modelsToTry.push(...gateConfig.fallbackModels);
  }

  return modelsToTry;
}

async function executeWithFallback(request: LayerRequest, modelsToTry: SupportedModel[]): Promise<RoutingResult> {
  let result: LayerResponse | null = null;
  let lastError: Error | null = null;
  let modelUsed: SupportedModel = request.model as SupportedModel;

  for (const modelToTry of modelsToTry) {
    try {
      const modelRequest = { ...request, model: modelToTry };
      result = await callProvider(modelRequest);
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

async function executeWithRoundRobin(gateConfig: Gate, request: LayerRequest): Promise<RoutingResult> {
  if (!gateConfig.fallbackModels?.length) {
    const result = await callProvider(request);
    return { result, modelUsed: request.model as SupportedModel };
  }

  const allModels = [gateConfig.model, ...gateConfig.fallbackModels];
  const modelIndex = Math.floor(Math.random() * allModels.length);
  const selectedModel = allModels[modelIndex];

  const modelRequest = { ...request, model: selectedModel };
  const result = await callProvider(modelRequest);

  return { result, modelUsed: selectedModel };
}

async function executeWithRouting(gateConfig: Gate, request: LayerRequest): Promise<RoutingResult> {
  const modelsToTry = getModelsToTry(gateConfig, request.model as SupportedModel);

  switch (gateConfig.routingStrategy) {
    case 'fallback':
      return await executeWithFallback(request, modelsToTry);

    case 'round-robin':
      return await executeWithRoundRobin(gateConfig, request);

    case 'single':
    default:
      const result = await callProvider(request);
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

  try {
    const request = req.body as LayerRequest;

    if (!request.gate) {
      res.status(400).json({ error: 'bad_request', message: 'Missing required field: gate' });
      return;
    }

    if (!request.type) {
      res.status(400).json({ error: 'bad_request', message: 'Missing required field: type' });
      return;
    }

    // Validate chat-specific requirements
    if (request.type === 'chat') {
      if (!request.data.messages || !Array.isArray(request.data.messages) || request.data.messages.length === 0) {
        res.status(400).json({ error: 'bad_request', message: 'Missing required field: data.messages' });
        return;
      }
    }

    const gateConfig = await getGateConfig(userId, request.gate);
    if (!gateConfig) {
      res.status(404).json({ error: 'not_found', message: `Gate "${request.gate}" not found` });
      return;
    }

    const finalRequest = resolveFinalRequest(gateConfig, request);
    const { result, modelUsed } = await executeWithRouting(gateConfig, finalRequest);

    const latencyMs = Date.now() - startTime;

    // Log request to database
    db.logRequest({
      userId,
      gateId: gateConfig.id,
      gateName: request.gate,
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
      gateId: null,
      gateName: req.body?.gate || null,
      modelRequested: null,
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
    }).catch(err => console.error('Failed to log request:', err));

    console.error('Completion error:', error);
    res.status(500).json({ error: 'internal_error', message: errorMessage });
  }
});

export default router;
