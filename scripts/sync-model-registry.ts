import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import { writeFileSync, readFileSync } from 'fs';
import { MODEL_REGISTRY, ModelEntry } from '../packages/sdk/src/types/model-registry';

// TODO: Use a gate for our AI model registry analysis
// TODO: Update ANTHROPIC_API_KEY to use new gate key when we implement gates

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ArtificialAnalysisModel {
  id: string;
  name: string;
  slug: string;
  release_date?: string;
  model_creator: {
    id: string;
    name: string;
    slug: string;
  };
  evaluations?: {
    artificial_analysis_intelligence_index?: number;
    artificial_analysis_coding_index?: number;
    artificial_analysis_math_index?: number;
    mmlu_pro?: number;
    gpqa?: number;
    hle?: number;
    livecodebench?: number;
    scicode?: number;
    math_500?: number;
    aime?: number;
    aime_25?: number;
  };
  pricing?: {
    price_1m_blended_3_to_1?: number;
    price_1m_input_tokens?: number;
    price_1m_output_tokens?: number;
  };
  median_output_tokens_per_second?: number;
  median_time_to_first_token_seconds?: number;
  median_time_to_first_answer_token?: number;
}

interface OpenRouterModel {
  id: string;
  name: string;
  context_length: number;
  architecture?: {
    modality?: string;
    tokenizer?: string;
    instruct_type?: string | null;
  };
  pricing?: {
    prompt: string;
    completion: string;
    request?: string;
    image?: string;
  };
  top_provider?: {
    context_length?: number;
    max_completion_tokens?: number;
    is_moderated?: boolean;
  };
  per_request_limits?: {
    prompt_tokens?: string;
    completion_tokens?: string;
  };
}


async function syncModelRegistry() {
  const apiKey = process.env.ARTIFICIAL_ANALYSIS_API_KEY;

  if (!apiKey) {
    throw new Error('ARTIFICIAL_ANALYSIS_API_KEY not found in environment');
  }

  console.log('🔍 Fetching models from APIs...\n');

  const [aaModels, orModels] = await Promise.all([
    fetchArtificialAnalysisModels(apiKey),
    fetchOpenRouterModels()
  ]);

  console.log(`✅ Fetched ${aaModels.length} models from Artificial Analysis`);
  console.log(`✅ Fetched ${orModels.length} models from OpenRouter\n`);

  console.log('🤖 Using Claude to map model identifiers...\n');
  const ourRegistryKeys = Object.keys(MODEL_REGISTRY);

  const [aaSlugMapping, orSlugMapping] = await Promise.all([
    mapModelsWithLLM(aaModels, ourRegistryKeys),
    mapOpenRouterModelsWithLLM(orModels, ourRegistryKeys)
  ]);

  console.log('✅ Mapping complete!');
  console.log(`   Artificial Analysis: ${Object.keys(aaSlugMapping).length} mapped`);
  console.log(`   OpenRouter: ${Object.keys(orSlugMapping).length} mapped\n`);

  const mappedAAModels = aaModels.filter(m => aaSlugMapping[m.slug]);
  const mappedORModels = orModels.filter(m => orSlugMapping[m.id]);

  console.log('🔄 Transforming and merging model data...');
  const transformedEntries: Record<string, Partial<ModelEntry>> = {};

  let preservedCount = 0;
  for (const [key, value] of Object.entries(MODEL_REGISTRY)) {
    transformedEntries[key] = value as Partial<ModelEntry>;
    preservedCount++;
  }

  let aaUpdatedCount = 0;
  for (const apiModel of mappedAAModels) {
    const registryKey = aaSlugMapping[apiModel.slug];
    const transformed = transformToModelEntry(apiModel, registryKey);
    transformedEntries[registryKey] = transformed;
    aaUpdatedCount++;
  }

  let orEnrichedCount = 0;
  for (const orModel of mappedORModels) {
    const registryKey = orSlugMapping[orModel.id];

    if (!transformedEntries[registryKey]) {
      continue;
    }

    const contextData = parseOpenRouterContext(orModel);
    transformedEntries[registryKey].context = contextData;
    orEnrichedCount++;
  }

  console.log(`   Preserved: ${preservedCount} | Updated: ${aaUpdatedCount} | Enriched: ${orEnrichedCount}\n`);

  console.log('📝 Writing updated MODEL_REGISTRY to file...');
  const registryPath = './packages/sdk/src/types/model-registry.ts';
  const updatedFileContent = generateRegistryFile(transformedEntries);
  writeFileSync(registryPath, updatedFileContent, 'utf-8');

  console.log('✅ Sync complete! MODEL_REGISTRY has been updated.');
  console.log(`📊 Updated ${Object.keys(transformedEntries).length} model entries`);
}

function generateRegistryFile(entries: Record<string, Partial<ModelEntry>>): string {
  const currentFile = readFileSync('./packages/sdk/src/types/model-registry.ts', 'utf-8');
  const headerMatch = currentFile.match(/^(\/\/.*\n)+/);
  const header = headerMatch ? headerMatch[0] : '';

  const interfaceMatch = currentFile.match(/export interface ModelEntry \{[\s\S]*?\n\}/);
  const interfaceCode = interfaceMatch ? interfaceMatch[0] : '';

  let registryCode = 'export const MODEL_REGISTRY = {\n';

  const providerSet = new Set<string>();
  Object.values(entries).forEach(e => {
    if (e.provider) providerSet.add(e.provider);
  });
  const allProviders = Array.from(providerSet);

  const knownProviders = ['openai', 'anthropic', 'google'];
  const otherProviders = allProviders.filter(p => !knownProviders.includes(p)).sort();
  const providers = [...knownProviders.filter(p => allProviders.includes(p)), ...otherProviders];

  for (const provider of providers) {
    const providerModels = Object.entries(entries).filter(
      ([_, entry]) => entry.provider === provider
    );

    if (providerModels.length === 0) continue;

    const providerName = provider!.charAt(0).toUpperCase() + provider!.slice(1);
    registryCode += `  // ${providerName} models\n`;

    for (const [key, entry] of providerModels) {
      registryCode += `  '${key}': {\n`;
      registryCode += `    provider: '${entry.provider}' as const,\n`;
      const escapedDisplayName = entry.displayName?.replace(/'/g, "\\'");
      registryCode += `    displayName: '${escapedDisplayName}',\n`;
      registryCode += `    pricing: { input: ${entry.pricing?.input}, output: ${entry.pricing?.output} },\n`;

      if (entry.benchmarks && Object.values(entry.benchmarks).some(v => v != null)) {
        registryCode += `    benchmarks: {\n`;
        if (entry.benchmarks.intelligence != null) registryCode += `      intelligence: ${entry.benchmarks.intelligence},\n`;
        if (entry.benchmarks.coding != null) registryCode += `      coding: ${entry.benchmarks.coding},\n`;
        if (entry.benchmarks.math != null) registryCode += `      math: ${entry.benchmarks.math},\n`;
        if (entry.benchmarks.mmluPro != null) registryCode += `      mmluPro: ${entry.benchmarks.mmluPro},\n`;
        if (entry.benchmarks.gpqa != null) registryCode += `      gpqa: ${entry.benchmarks.gpqa},\n`;
        registryCode += `    },\n`;
      }

      if (entry.performance && Object.values(entry.performance).some(v => v != null)) {
        registryCode += `    performance: {\n`;
        if (entry.performance.outputTokenPerSecond != null) registryCode += `      outputTokenPerSecond: ${entry.performance.outputTokenPerSecond},\n`;
        if (entry.performance.timeTofirstToken != null) registryCode += `      timeTofirstToken: ${entry.performance.timeTofirstToken},\n`;
        if (entry.performance.intelligenceScore != null) registryCode += `      intelligenceScore: ${entry.performance.intelligenceScore},\n`;
        registryCode += `    },\n`;
      }

      if (entry.context) {
        registryCode += `    context: {\n`;
        if (entry.context.window != null) registryCode += `      window: ${entry.context.window},\n`;
        registryCode += `      input: {\n`;
        registryCode += `        text: ${entry.context.input.text},\n`;
        registryCode += `        image: ${entry.context.input.image},\n`;
        registryCode += `        audio: ${entry.context.input.audio},\n`;
        registryCode += `        video: ${entry.context.input.video},\n`;
        registryCode += `      },\n`;
        registryCode += `      output: {\n`;
        registryCode += `        text: ${entry.context.output.text},\n`;
        registryCode += `        image: ${entry.context.output.image},\n`;
        registryCode += `        audio: ${entry.context.output.audio},\n`;
        registryCode += `        video: ${entry.context.output.video},\n`;
        registryCode += `      },\n`;
        registryCode += `    },\n`;
      }

      if (entry.lastUpdated) registryCode += `    lastUpdated: '${entry.lastUpdated}',\n`;

      registryCode += `  },\n`;
    }

    registryCode += '\n';
  }

  registryCode += '} as const;\n\n';

  registryCode += '// Derive types from registry\n';
  registryCode += 'export type SupportedModel = keyof typeof MODEL_REGISTRY;\n';
  registryCode += 'export type Provider = typeof MODEL_REGISTRY[SupportedModel][\'provider\'];\n';

  return header + '\n' + interfaceCode + '\n\n' + registryCode;
}

function transformToModelEntry(
  apiModel: ArtificialAnalysisModel,
  registryKey: string
): Partial<ModelEntry> {
  const entry: Partial<ModelEntry> = {
    provider: apiModel.model_creator.slug,
    displayName: apiModel.name,
    pricing: {
      input: (apiModel.pricing?.price_1m_input_tokens ?? 0) / 1000,
      output: (apiModel.pricing?.price_1m_output_tokens ?? 0) / 1000,
    },
    lastUpdated: new Date().toISOString().split('T')[0],
  };

  if (apiModel.evaluations) {
    entry.benchmarks = {
      intelligence: apiModel.evaluations.artificial_analysis_intelligence_index,
      coding: apiModel.evaluations.artificial_analysis_coding_index,
      math: apiModel.evaluations.artificial_analysis_math_index,
      mmluPro: apiModel.evaluations.mmlu_pro,
      gpqa: apiModel.evaluations.gpqa,
    };
  }

  if (apiModel.median_output_tokens_per_second ||
      apiModel.median_time_to_first_token_seconds ||
      apiModel.evaluations?.artificial_analysis_intelligence_index) {
    entry.performance = {
      outputTokenPerSecond: apiModel.median_output_tokens_per_second,
      timeTofirstToken: apiModel.median_time_to_first_token_seconds,
      intelligenceScore: apiModel.evaluations?.artificial_analysis_intelligence_index,
    };
  }

  return entry;
}

function parseOpenRouterContext(orModel: OpenRouterModel): ModelEntry['context'] {
  const modality = orModel.architecture?.modality || '';

  const hasTextInput = modality.includes('text') || modality.includes('multimodal');
  const hasImageInput = modality.includes('image') || modality.includes('multimodal');
  const hasAudioInput = modality.includes('audio') || modality.includes('multimodal');
  const hasVideoInput = modality.includes('video') || modality.includes('multimodal');

  const outputPart = modality.split('->')[1] || 'text';
  const hasTextOutput = outputPart.includes('text');
  const hasImageOutput = outputPart.includes('image');
  const hasAudioOutput = outputPart.includes('audio');
  const hasVideoOutput = outputPart.includes('video');

  return {
    window: orModel.context_length,
    input: {
      text: hasTextInput,
      image: hasImageInput,
      audio: hasAudioInput,
      video: hasVideoInput,
    },
    output: {
      text: hasTextOutput,
      image: hasImageOutput,
      audio: hasAudioOutput,
      video: hasVideoOutput,
    },
  };
}

async function mapOpenRouterModelsWithLLM(
  theirModels: OpenRouterModel[],
  ourRegistryKeys: string[]
): Promise<Record<string, string>> {
  const modelInfo = theirModels.map(m => ({
    id: m.id,
    name: m.name,
  }));


  const prompt = `You are helping map model identifiers from the OpenRouter API to our internal MODEL_REGISTRY.

**Our supported models (registry keys):**
${ourRegistryKeys.map(key => `- ${key}`).join('\n')}

**Their models (showing id and name):**
${modelInfo.map(m => `- ID: "${m.id}" | Name: "${m.name}"`).join('\n')}

**Task:**
Create a JSON mapping object where keys are their model IDs and values are our registry keys.

**Rules:**
1. OpenRouter IDs follow pattern "provider/model-name" (e.g., "openai/gpt-4o", "anthropic/claude-3-5-sonnet")
2. Match the model-name part to our registry keys
3. For models with date suffixes in our registry (like "claude-sonnet-4-5-20250929"), match to their base name (like "claude-3-5-sonnet" or "claude-4-5-sonnet")
4. Map "gpt-4o" to "gpt-4o", "gpt-4o-mini" to "gpt-4o-mini", etc.
5. Map gemini models carefully (gemini-2.5-pro vs gemini-2-5-pro format)
6. Return ONLY the JSON object, no explanation or markdown
7. If no matches are found, return an empty object: {}

**Example mappings:**
{
  "openai/gpt-4o": "gpt-4o",
  "openai/gpt-4o-mini": "gpt-4o-mini",
  "anthropic/claude-3-5-sonnet": "claude-3-7-sonnet-20250219",
  "google/gemini-2.5-pro": "gemini-2.5-pro"
}

Return only valid JSON:`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const textContent = response.content[0];
    if (textContent.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    let jsonText = textContent.text.trim();

    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const mapping = JSON.parse(jsonText);

    if (typeof mapping !== 'object' || Array.isArray(mapping)) {
      throw new Error('Invalid mapping format: expected object');
    }

    return mapping;
  } catch (error) {
    console.error('❌ Error in OpenRouter LLM mapping:', error);
    throw new Error(`Failed to map OpenRouter models with LLM: ${error}`);
  }
}

async function mapModelsWithLLM(
  theirModels: ArtificialAnalysisModel[],
  ourRegistryKeys: string[]
): Promise<Record<string, string>> {
  const modelInfo = theirModels.map(m => ({
    slug: m.slug,
    name: m.name,
    creator: m.model_creator.name,
    release_date: m.release_date,
  }));


  const prompt = `You are helping map model identifiers from the Artificial Analysis API to our internal MODEL_REGISTRY.

**Our supported models (registry keys):**
${ourRegistryKeys.map(key => `- ${key}`).join('\n')}

**Their models (showing slug, name, creator, release date):**
${modelInfo.map(m =>
  `- Slug: "${m.slug}" | Name: "${m.name}" | Creator: "${m.creator}" | Released: ${m.release_date || 'unknown'}`
).join('\n')}

**Task:**
Create a JSON mapping object where keys are their slugs and values are our registry keys.

**Rules:**
1. Map models where the base model name matches (e.g., "gpt-4o" maps to "gpt-4o")
2. For models with date suffixes in our registry (like "claude-sonnet-4-5-20250929"), match to their base slug (like "claude-4-5-sonnet")
3. If their slug exactly matches our key, always map it
4. Ignore "reasoning" vs "non-reasoning" variants - map the base model
5. Return ONLY the JSON object, no explanation or markdown
6. If no matches are found, return an empty object: {}

**Example mappings:**
{
  "gpt-4o": "gpt-4o",
  "gpt-4o-mini": "gpt-4o-mini",
  "claude-4-5-sonnet": "claude-sonnet-4-5-20250929",
  "claude-4-5-haiku": "claude-haiku-4-5-20251001",
  "gemini-2-5-pro": "gemini-2.5-pro"
}

Return only valid JSON:`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const textContent = response.content[0];
    if (textContent.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    let jsonText = textContent.text.trim();

    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const mapping = JSON.parse(jsonText);

    if (typeof mapping !== 'object' || Array.isArray(mapping)) {
      throw new Error('Invalid mapping format: expected object');
    }

    return mapping;
  } catch (error) {
    console.error('❌ Error in LLM mapping:', error);
    throw new Error(`Failed to map models with LLM: ${error}`);
  }
}

async function fetchArtificialAnalysisModels(apiKey: string): Promise<ArtificialAnalysisModel[]> {
  const response = await fetch('https://artificialanalysis.ai/api/v2/data/llms/models', {
    headers: {
      'x-api-key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    return data;
  } else if (data.models && Array.isArray(data.models)) {
    return data.models;
  } else if (data.data && Array.isArray(data.data)) {
    return data.data;
  } else {
    throw new Error('Unexpected API response format: ' + JSON.stringify(data).slice(0, 200));
  }
}

async function fetchOpenRouterModels(): Promise<OpenRouterModel[]> {
  const response = await fetch('https://openrouter.ai/api/v1/models');

  if (!response.ok) {
    throw new Error(`OpenRouter API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (data.data && Array.isArray(data.data)) {
    return data.data;
  } else if (Array.isArray(data)) {
    return data;
  } else {
    throw new Error('Unexpected OpenRouter API response format: ' + JSON.stringify(data).slice(0, 200));
  }
}

syncModelRegistry().catch(console.error);