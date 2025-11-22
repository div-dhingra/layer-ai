import { Router, Request, Response } from 'express';
import type { Router as RouterType } from 'express';
import { db } from '../lib/db/postgres.js'; 
import { cache } from '../lib/db/redis.js';
import { authenticate } from '../middleware/auth.js';
import * as openai from '../services/providers/openai.js';
import * as anthropic from '../services/providers/anthropic.js'
import type { CompletionRequest, CompletionResponse, Gate, Message, SupportedModel } from '@layer/types';
import { MODEL_REGISTRY } from '@layer/types';

const router: RouterType = Router();

// POST /v1/complete
router.post('/', authenticate, async (req: Request, res: Response) => {
  const startTime = Date.now(); 

  if (!req.userId) {
    res.status(401).json({ error: 'unauthorized', message: 'Missing user ID'});
    return;
  }
  const userId = req.userId;

  try {
    const { gate: gateName, messages, temperature, maxTokens, topP } = req.body as CompletionRequest;

    if (!gateName) {
      res.status(400).json({ error: 'bad_request', message: 'Missing required field: gate'});
      return;
    }
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'bad_request', message: 'Missing or invalid messages array'});
      return;
    }

    let gateConfig = await cache.getGate(userId, gateName);

    if (!gateConfig) {
      gateConfig = await db.getGateByUserAndName(userId, gateName);

      if (!gateConfig) {
        res.status(404).json({ error: 'not_found', message: `Gate "${gateName}" not found`});
        return;
      }

      await cache.setGate(userId, gateName, gateConfig);
    }

    const provider = MODEL_REGISTRY[gateConfig.model as SupportedModel].provider;
    let result: openai.ProviderResponse; 

    const finalParams = {
      model: gateConfig.model, 
      messages,
      temperature: temperature ?? gateConfig.temperature,
      maxTokens: maxTokens ?? gateConfig.maxTokens,
      topP: topP ?? gateConfig.topP,
      systemPrompt: gateConfig.systemPrompt,
    };

    if (provider === 'openai') {
      result = await openai.createCompletion(finalParams);
    } else {
      result = await anthropic.createCompletion(finalParams);
    }

    const latencyMs = Date.now() - startTime;

    // Log request (async, dont await)
    db.logRequest({
      userId, 
      gateId: gateConfig.id, 
      gateName,
      modelRequested: gateConfig.model, 
      modelUsed: gateConfig.model,
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
      totalTokens: result.totalTokens,
      costUsd: result.costUsd,
      latencyMs, 
      success: true,
      errorMessage: null,
      userAgent: req.headers['user-agent'] || null,
      ipAddress: req.ip || null,
    }).catch(err => console.error('Failed to log request:', err));

    const response: CompletionResponse = {
      content: result?.content,
      model: gateConfig.model,
      usage: {
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
        totalTokens: result.totalTokens,
      },
    };

    res.json(response);
  } catch (error) {
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