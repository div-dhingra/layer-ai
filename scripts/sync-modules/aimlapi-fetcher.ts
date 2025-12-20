// AIMLAPI fetcher - Primary source for model discovery and categorization
// Fetches all models from AIMLAPI and filters to supported providers only

import { SUPPORTED_PROVIDERS } from '../../packages/sdk/src/types/model-registry';

// AIMLAPI model response structure
export interface AIMModelInfo {
  name?: string;
  developer?: string;
  description?: string;
  homepage?: string;
  pricing?: {
    modelId?: string;
    provider?: string;
    inputCostPer1k?: number;
    outputCostPer1k?: number;
  };
  contextLength?: number;
}

export interface AIMModel {
  id: string;
  type: string; // 'chat-completion', 'image', 'tts', 'stt', 'video', 'audio', 'embedding', 'document', 'responses', 'language-completion'
  info: AIMModelInfo;
}

export interface AIMAPIResponse {
  models: AIMModel[];
}

// Map AIMLAPI type names to our ModelType enum
const TYPE_MAPPING: Record<string, string> = {
  'chat-completion': 'chat',
  'image': 'image',
  'video': 'video',
  'audio': 'audio',
  'tts': 'tts',
  'stt': 'stt',
  'embedding': 'embeddings',
  'document': 'document',
  'responses': 'responses',
  'language-completion': 'language-completion',
};

// Normalize provider names from AIMLAPI to our supported provider format
function normalizeProviderName(developer: string): string | null {
  const lowerDev = developer.toLowerCase().trim();

  if (lowerDev.includes('open') && lowerDev.includes('ai')) return 'openai';
  if (lowerDev.includes('anthropic')) return 'anthropic';
  if (lowerDev.includes('google')) return 'google';

  return null;
}

// Fetch models from AIMLAPI endpoint
export async function fetchAIMLAPIModels(apiKey: string): Promise<AIMModel[]> {
  const response = await fetch('https://api.aimlapi.com/models', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`AIMLAPI request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Handle different possible response formats
  if (Array.isArray(data)) {
    return data;
  } else if (data.models && Array.isArray(data.models)) {
    return data.models;
  } else if (data.data && Array.isArray(data.data)) {
    return data.data;
  } else {
    console.error('Unexpected response format:', JSON.stringify(data).slice(0, 500));
    throw new Error('Unexpected AIMLAPI response format');
  }
}

// Filter models to only include supported providers
export function filterToSupportedProviders(models: AIMModel[]): AIMModel[] {
  return models.filter(model => {
    const developer = model.info?.developer;
    if (!developer) return false;

    const normalized = normalizeProviderName(developer);
    return normalized && SUPPORTED_PROVIDERS.includes(normalized as any);
  });
}

// Transform AIMLAPI model to our intermediate format
export interface TransformedModel {
  modelId: string;
  provider: string;
  displayName: string;
  type: string;
  description?: string;
  contextLength?: number;
  pricing?: {
    input?: number;
    output?: number;
  };
}

export function transformAIMLAPIModel(model: AIMModel): TransformedModel | null {
  const developer = model.info?.developer;
  if (!developer) return null;

  const provider = normalizeProviderName(developer);
  if (!provider) return null;

  const type = TYPE_MAPPING[model.type] || model.type;

  return {
    modelId: model.id,
    provider,
    displayName: model.info?.name || model.id,
    type,
    description: model.info?.description,
    contextLength: model.info?.contextLength,
    pricing: model.info?.pricing ? {
      input: model.info.pricing.inputCostPer1k,
      output: model.info.pricing.outputCostPer1k,
    } : undefined,
  };
}

// Main function to fetch and transform AIMLAPI models
export async function getAIMLAPIModels(apiKey: string): Promise<TransformedModel[]> {
  console.log('🔍 Fetching models from AIMLAPI...');

  const allModels = await fetchAIMLAPIModels(apiKey);
  console.log(`   Total models fetched: ${allModels.length}`);

  const supportedModels = filterToSupportedProviders(allModels);
  console.log(`   Filtered to supported providers: ${supportedModels.length}`);

  const transformed = supportedModels
    .map(transformAIMLAPIModel)
    .filter((m): m is TransformedModel => m !== null);

  // Show breakdown by provider
  const byProvider = transformed.reduce((acc, m) => {
    acc[m.provider] = (acc[m.provider] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log(`   Breakdown by provider:`);
  Object.entries(byProvider).forEach(([provider, count]) => {
    console.log(`     - ${provider}: ${count} models`);
  });

  // Show breakdown by type
  const byType = transformed.reduce((acc, m) => {
    acc[m.type] = (acc[m.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log(`   Breakdown by type:`);
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`     - ${type}: ${count} models`);
  });

  return transformed;
}
