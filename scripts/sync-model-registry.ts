// Model Registry Sync - Comprehensive multi-source sync system
//
// Syncs 121 models across 10 different modalities from supported providers
// (OpenAI, Anthropic, Google)
//
// Data flow:
// 1. AIMLAPI: Fetch all models, filter to supported providers (primary source)
// 2. Artificial Analysis: Fetch benchmarks/performance for chat models (enrichment)
// 3. Map AIMLAPI models to AA slugs using LLM
// 4. Merge data sources
// 5. Generate updated model-registry.ts
//
// Required environment variables:
// - AIMLAPI_API_KEY - Model discovery and categorization
// - ARTIFICIAL_ANALYSIS_API_KEY - Chat model benchmarks and performance
// - ANTHROPIC_API_KEY - LLM-based model identifier mapping

import dotenv from 'dotenv';
import { getAIMLAPIModels } from './sync-modules/aimlapi-fetcher';
import { getArtificialAnalysisEnrichment } from './sync-modules/artificial-analysis-enricher';
import { mapAIMLAPIToAAWithLLM, mergeModelsWithEnrichment } from './sync-modules/merger';
import { writeRegistryFile } from './sync-modules/registry-writer';

dotenv.config();

async function syncModelRegistry() {
  console.log('🚀 Starting Model Registry Sync\n');

  // Validate environment variables
  const aimlApiKey = process.env.AIMLAPI_API_KEY;
  const aaApiKey = process.env.ARTIFICIAL_ANALYSIS_API_KEY;
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

  if (!aimlApiKey) {
    throw new Error('AIMLAPI_API_KEY not found in environment');
  }

  if (!aaApiKey) {
    throw new Error('ARTIFICIAL_ANALYSIS_API_KEY not found in environment');
  }

  if (!anthropicApiKey) {
    throw new Error('ANTHROPIC_API_KEY not found in environment');
  }

  try {
    // Step 1: Fetch AIMLAPI models (primary source)
    console.log('📡 Step 1: Fetching models from AIMLAPI...\n');
    const aimlModels = await getAIMLAPIModels(aimlApiKey);
    console.log(`✅ Fetched ${aimlModels.length} models from supported providers\n`);

    // Step 2: Fetch Artificial Analysis enrichment (chat models only)
    console.log('📊 Step 2: Fetching enrichment data from Artificial Analysis...\n');
    const aaEnrichment = await getArtificialAnalysisEnrichment(aaApiKey);
    console.log(`✅ Fetched enrichment for ${aaEnrichment.size} chat models\n`);

    // Step 3: Map AIMLAPI models to AA slugs using LLM
    console.log('🔗 Step 3: Mapping AIMLAPI models to Artificial Analysis...\n');
    const aimlToAAMapping = await mapAIMLAPIToAAWithLLM(aimlModels, aaEnrichment);
    console.log(`✅ Created ${aimlToAAMapping.size} model mappings\n`);

    // Step 4: Merge data sources
    console.log('🔀 Step 4: Merging data sources...\n');
    const registryEntries = mergeModelsWithEnrichment(aimlModels, aaEnrichment, aimlToAAMapping);
    console.log(`✅ Merged data for ${Object.keys(registryEntries).length} models\n`);

    // Step 5: Write updated registry file
    console.log('💾 Step 5: Writing updated registry file...\n');
    const registryPath = './packages/sdk/src/types/model-registry.ts';
    writeRegistryFile(registryEntries, registryPath);

    console.log('\n✨ Sync complete! Model registry has been updated successfully.\n');
  } catch (error) {
    console.error('❌ Sync failed:', error);
    throw error;
  }
}

// Run sync
syncModelRegistry().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
