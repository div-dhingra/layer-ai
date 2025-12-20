// Artificial Analysis enricher - Adds benchmarks and performance data for chat models
// Only enriches chat/responses/language-completion type models

export interface ArtificialAnalysisModel {
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

export interface EnrichedModelData {
  benchmarks?: {
    intelligence?: number;
    coding?: number;
    math?: number;
    mmluPro?: number;
    gpqa?: number;
  };
  performance?: {
    outputTokenPerSecond?: number;
    timeTofirstToken?: number;
    intelligenceScore?: number;
  };
  pricing?: {
    input?: number;
    output?: number;
  };
}

// Fetch models from Artificial Analysis API
export async function fetchArtificialAnalysisModels(apiKey: string): Promise<ArtificialAnalysisModel[]> {
  const response = await fetch('https://artificialanalysis.ai/api/v2/data/llms/models', {
    headers: {
      'x-api-key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Artificial Analysis API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    return data;
  } else if (data.models && Array.isArray(data.models)) {
    return data.models;
  } else if (data.data && Array.isArray(data.data)) {
    return data.data;
  } else {
    throw new Error('Unexpected API response format from Artificial Analysis');
  }
}

// Transform AA model to enriched data
export function transformAAModel(aaModel: ArtificialAnalysisModel): EnrichedModelData {
  const enriched: EnrichedModelData = {};

  // Add benchmarks
  if (aaModel.evaluations) {
    enriched.benchmarks = {
      intelligence: aaModel.evaluations.artificial_analysis_intelligence_index,
      coding: aaModel.evaluations.artificial_analysis_coding_index,
      math: aaModel.evaluations.artificial_analysis_math_index,
      mmluPro: aaModel.evaluations.mmlu_pro,
      gpqa: aaModel.evaluations.gpqa,
    };
  }

  // Add performance metrics
  if (
    aaModel.median_output_tokens_per_second ||
    aaModel.median_time_to_first_token_seconds ||
    aaModel.evaluations?.artificial_analysis_intelligence_index
  ) {
    enriched.performance = {
      outputTokenPerSecond: aaModel.median_output_tokens_per_second,
      timeTofirstToken: aaModel.median_time_to_first_token_seconds,
      intelligenceScore: aaModel.evaluations?.artificial_analysis_intelligence_index,
    };
  }

  // Add pricing (convert from per-1M to per-1K)
  if (aaModel.pricing) {
    enriched.pricing = {
      input: aaModel.pricing.price_1m_input_tokens ? aaModel.pricing.price_1m_input_tokens / 1000 : undefined,
      output: aaModel.pricing.price_1m_output_tokens ? aaModel.pricing.price_1m_output_tokens / 1000 : undefined,
    };
  }

  return enriched;
}

// Create enrichment lookup by model slug
export async function getArtificialAnalysisEnrichment(
  apiKey: string
): Promise<Map<string, EnrichedModelData>> {
  console.log('🔍 Fetching enrichment data from Artificial Analysis...');

  const aaModels = await fetchArtificialAnalysisModels(apiKey);
  console.log(`   Fetched ${aaModels.length} chat models with benchmarks`);

  const enrichmentMap = new Map<string, EnrichedModelData>();

  for (const aaModel of aaModels) {
    const enriched = transformAAModel(aaModel);
    enrichmentMap.set(aaModel.slug, enriched);
  }

  return enrichmentMap;
}
