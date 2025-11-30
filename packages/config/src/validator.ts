import { z } from 'zod';
import type { LayerConfigFile } from '@layer-ai/types';

const GateConfigSchema = z.object({
  // Required fields
  name: z.string().min(1, 'Gate name cannot be empty'),
  model: z.string().min(1, 'Model cannot be empty'),

  // Optional public fields
  description: z.string().optional(),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),
  topP: z.number().min(0).max(1).optional(),
  routingStrategy: z.enum(['single', 'fallback', 'round-robin']).optional(),
  fallbackModels: z.array(z.string()).optional(),
  allowOverrides: z.union([
    z.boolean(),
    z.record(z.boolean())
  ]).optional(),
  tags: z.array(z.string()).optional(),

  // Internal fields (layer-ai-internal)
  costWeight: z.number().min(0).max(1).optional(),
  latencyWeight: z.number().min(0).max(1).optional(),
  qualityWeight: z.number().min(0).max(1).optional(),
  maxCostPer1kTokens: z.number().positive().optional(),
  maxLatencyMs: z.number().positive().optional(),
  taskAnalysis: z.object({
    primary: z.string(),
    alternatives: z.array(z.string()),
    reasoning: z.string(),
  }).optional(),
});

const LayerConfigFileSchema = z.object({
  gates: z.array(GateConfigSchema).min(1, 'Config must contain at least one gate'),
});

export function validateConfig(data: unknown): LayerConfigFile {
  return LayerConfigFileSchema.parse(data) as LayerConfigFile;
}