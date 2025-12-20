// Merger - Combines AIMLAPI data with Artificial Analysis enrichment
// Uses LLM to map model identifiers between systems

import Anthropic from '@anthropic-ai/sdk';
import type { TransformedModel } from './aimlapi-fetcher';
import type { EnrichedModelData } from './artificial-analysis-enricher';
import type { ModelEntry, ChatModelEntry } from '../../packages/sdk/src/types/model-registry';

// Initialize Anthropic client
let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not found in environment');
    }
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

// Map AIMLAPI model IDs to AA slugs using LLM
export async function mapAIMLAPIToAAWithLLM(
  aimlModels: TransformedModel[],
  aaEnrichment: Map<string, EnrichedModelData>
): Promise<Map<string, string>> {
  const chatModels = aimlModels.filter(m =>
    m.type === 'chat' || m.type === 'responses' || m.type === 'language-completion'
  );

  if (chatModels.length === 0) {
    console.log('   No chat models to map to Artificial Analysis');
    return new Map();
  }

  console.log('🤖 Using Claude to map AIMLAPI models to Artificial Analysis slugs...');

  const aimlInfo = chatModels.map(m => ({
    modelId: m.modelId,
    displayName: m.displayName,
    provider: m.provider,
  }));

  const aaInfo = Array.from(aaEnrichment.keys());

  const prompt = `You are mapping model identifiers from AIMLAPI to Artificial Analysis slugs.

**AIMLAPI models (modelId, displayName, provider):**
${aimlInfo.map(m => `- ID: "${m.modelId}" | Name: "${m.displayName}" | Provider: "${m.provider}"`).join('\n')}

**Artificial Analysis slugs:**
${aaInfo.map(slug => `- ${slug}`).join('\n')}

**Task:**
Create a JSON mapping object where keys are AIMLAPI modelIds and values are AA slugs.

**Rules:**
1. Match based on model name and provider
2. OpenAI models: "gpt-4o" → "gpt-4o", "gpt-4o-mini" → "gpt-4o-mini"
3. Anthropic models: "claude-sonnet-4-5-20250929" → "claude-4-5-sonnet"
4. Google models: "gemini-2.5-pro" → "gemini-2-5-pro" (note: dot vs hyphen)
5. Ignore versioning differences like dates/timestamps
6. Return ONLY the JSON object, no markdown
7. If no matches, return empty object: {}

**Example:**
{
  "gpt-4o": "gpt-4o",
  "claude-sonnet-4-5-20250929": "claude-4-5-sonnet",
  "gemini-2.5-pro": "gemini-2-5-pro"
}

Return only valid JSON:`;

  const anthropic = getAnthropicClient();

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  });

  const textContent = response.content[0];
  if (textContent.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  let jsonText = textContent.text.trim();

  // Remove markdown code fences if present
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  const mapping = JSON.parse(jsonText);

  if (typeof mapping !== 'object' || Array.isArray(mapping)) {
    throw new Error('Invalid mapping format: expected object');
  }

  console.log(`   Mapped ${Object.keys(mapping).length} models to AA slugs`);

  return new Map(Object.entries(mapping));
}

// Merge AIMLAPI models with AA enrichment
export function mergeModelsWithEnrichment(
  aimlModels: TransformedModel[],
  aaEnrichment: Map<string, EnrichedModelData>,
  aimlToAAMapping: Map<string, string>
): Record<string, Partial<ModelEntry>> {
  const mergedModels: Record<string, Partial<ModelEntry>> = {};

  for (const aimlModel of aimlModels) {
    const baseEntry: Partial<ModelEntry> = {
      type: aimlModel.type as any,
      provider: aimlModel.provider,
      displayName: aimlModel.displayName,
      description: aimlModel.description,
      pricing: aimlModel.pricing,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    // For chat models, try to enrich with AA data
    if (
      (aimlModel.type === 'chat' ||
        aimlModel.type === 'responses' ||
        aimlModel.type === 'language-completion') &&
      aimlToAAMapping.has(aimlModel.modelId)
    ) {
      const aaSlug = aimlToAAMapping.get(aimlModel.modelId)!;
      const enrichment = aaEnrichment.get(aaSlug);

      if (enrichment) {
        const chatEntry: Partial<ChatModelEntry> = {
          ...baseEntry,
          type: aimlModel.type as any,
          contextLength: aimlModel.contextLength,
          benchmarks: enrichment.benchmarks,
          performance: enrichment.performance,
        };

        // Prefer AA pricing over AIMLAPI pricing for chat models
        if (enrichment.pricing) {
          chatEntry.pricing = enrichment.pricing;
        }

        mergedModels[aimlModel.modelId] = chatEntry;
        continue;
      }
    }

    // For non-chat models or chat models without AA data
    if (aimlModel.type === 'embeddings') {
      mergedModels[aimlModel.modelId] = {
        ...baseEntry,
        contextLength: aimlModel.contextLength,
      };
    } else {
      mergedModels[aimlModel.modelId] = baseEntry;
    }
  }

  return mergedModels;
}
