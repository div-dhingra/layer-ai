// Model validation script - Tests all models in registry against provider APIs
// Ensures models actually exist and respond successfully

import { MODEL_REGISTRY, SupportedModel } from '../packages/sdk/src/types/model-registry.js';
import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';
import { Mistral } from '@mistralai/mistralai';

interface ValidationResult {
  modelId: string;
  provider: string;
  type: string;
  status: 'success' | 'failed' | 'skipped';
  error?: string;
  latency?: number;
}

// Initialize provider clients
const clients = {
  openai: process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null,
  anthropic: process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null,
  google: process.env.GOOGLE_API_KEY ? new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY }) : null,
  mistral: process.env.MISTRAL_API_KEY ? new Mistral({ apiKey: process.env.MISTRAL_API_KEY }) : null,
};

// Test chat models
async function testChatModel(modelId: string, provider: string): Promise<ValidationResult> {
  const startTime = Date.now();

  try {
    switch (provider) {
      case 'openai': {
        if (!clients.openai) throw new Error('OpenAI API key not found');

        // Skip audio models - they require audio content
        if (modelId.includes('audio')) {
          return {
            modelId,
            provider,
            type: 'chat',
            status: 'skipped',
            error: 'Audio models require audio content - skipping validation',
          };
        }

        // o3/o1/gpt-5 models use max_completion_tokens instead of max_tokens
        const isReasoningModel = modelId.includes('o1') || modelId.includes('o3') || modelId.includes('o4') ||
                                  modelId.includes('gpt-5-2025') || modelId.includes('gpt-5-mini') || modelId.includes('gpt-5-nano');

        await clients.openai.chat.completions.create({
          model: modelId.replace('openai/', ''),
          messages: [{ role: 'user', content: 'Hi' }],
          ...(isReasoningModel
            ? { max_completion_tokens: 5 }
            : { max_tokens: 5 }
          ),
        });
        break;
      }

      case 'anthropic': {
        if (!clients.anthropic) throw new Error('Anthropic API key not found');
        await clients.anthropic.messages.create({
          model: modelId.replace('anthropic/', ''),
          max_tokens: 5,
          messages: [{ role: 'user', content: 'Hi' }],
        });
        break;
      }

      case 'google': {
        if (!clients.google) throw new Error('Google API key not found');
        await clients.google.models.generateContent({
          model: modelId.replace('google/', ''),
          contents: [{ role: 'user', parts: [{ text: 'Hi' }] }],
          config: { maxOutputTokens: 5 },
        });
        break;
      }

      case 'mistral': {
        if (!clients.mistral) throw new Error('Mistral API key not found');
        await clients.mistral.chat.complete({
          model: modelId.replace('mistral/', ''),
          messages: [{ role: 'user', content: 'Hi' }],
          maxTokens: 5,
        });
        break;
      }

      default:
        throw new Error(`Unknown provider: ${provider}`);
    }

    return {
      modelId,
      provider,
      type: 'chat',
      status: 'success',
      latency: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      modelId,
      provider,
      type: 'chat',
      status: 'failed',
      error: error.message || String(error),
      latency: Date.now() - startTime,
    };
  }
}

// Test embeddings models
async function testEmbeddingsModel(modelId: string, provider: string): Promise<ValidationResult> {
  const startTime = Date.now();

  try {
    switch (provider) {
      case 'openai': {
        if (!clients.openai) throw new Error('OpenAI API key not found');
        await clients.openai.embeddings.create({
          model: modelId.replace('openai/', ''),
          input: 'Test',
        });
        break;
      }

      case 'google': {
        if (!clients.google) throw new Error('Google API key not found');
        await clients.google.models.embedContent({
          model: modelId.replace('google/', ''),
          contents: { parts: [{ text: 'Test' }] },
        });
        break;
      }

      case 'mistral': {
        if (!clients.mistral) throw new Error('Mistral API key not found');
        await clients.mistral.embeddings.create({
          model: modelId.replace('mistral/', ''),
          inputs: ['Test'],
        });
        break;
      }

      default:
        return {
          modelId,
          provider,
          type: 'embeddings',
          status: 'skipped',
          error: 'Provider not supported for embeddings validation',
        };
    }

    return {
      modelId,
      provider,
      type: 'embeddings',
      status: 'success',
      latency: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      modelId,
      provider,
      type: 'embeddings',
      status: 'failed',
      error: error.message || String(error),
      latency: Date.now() - startTime,
    };
  }
}

// Test image generation models
async function testImageModel(modelId: string, provider: string): Promise<ValidationResult> {
  const startTime = Date.now();

  try {
    switch (provider) {
      case 'openai': {
        if (!clients.openai) throw new Error('OpenAI API key not found');

        // Different models support different sizes
        const cleanModelId = modelId.replace('openai/', '');
        let size: '256x256' | '512x512' | '1024x1024' | '1024x1792' | '1792x1024' = '1024x1024';

        // DALL-E 2 supports 256x256, 512x512, 1024x1024
        if (cleanModelId === 'dall-e-2') {
          size = '512x512';
        }
        // DALL-E 3 and gpt-image models support 1024x1024, 1024x1792, 1792x1024

        await clients.openai.images.generate({
          model: cleanModelId,
          prompt: 'A simple test image',
          n: 1,
          size,
        });
        break;
      }

      default:
        return {
          modelId,
          provider,
          type: 'image',
          status: 'skipped',
          error: 'Provider not supported for image generation validation',
        };
    }

    return {
      modelId,
      provider,
      type: 'image',
      status: 'success',
      latency: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      modelId,
      provider,
      type: 'image',
      status: 'failed',
      error: error.message || String(error),
      latency: Date.now() - startTime,
    };
  }
}

// Validate a single model
async function validateModel(modelId: SupportedModel): Promise<ValidationResult> {
  const modelInfo = MODEL_REGISTRY[modelId];
  const { provider, type } = modelInfo;

  // Check if we have API key for this provider
  if (!clients[provider as keyof typeof clients]) {
    return {
      modelId,
      provider,
      type,
      status: 'skipped',
      error: `Missing ${provider.toUpperCase()}_API_KEY environment variable`,
    };
  }

  // Route to appropriate test function based on type
  switch (type) {
    case 'chat':
      return testChatModel(modelId, provider);
    case 'embeddings':
      return testEmbeddingsModel(modelId, provider);
    case 'image':
      return testImageModel(modelId, provider);
    case 'tts':
    case 'stt':
    case 'video':
    case 'audio':
      // Skip complex modalities for now
      return {
        modelId,
        provider,
        type,
        status: 'skipped',
        error: 'Complex modality - validation not implemented yet',
      };
    default:
      return {
        modelId,
        provider,
        type,
        status: 'skipped',
        error: `Unknown type: ${type}`,
      };
  }
}

// Main validation function
async function validateAllModels() {
  console.log('🔍 Starting model validation...\n');

  const allModels = Object.keys(MODEL_REGISTRY) as SupportedModel[];
  const results: ValidationResult[] = [];

  // Check which API keys are available
  console.log('📋 Available API keys:');
  console.log(`   - OpenAI: ${clients.openai ? '✓' : '✗'}`);
  console.log(`   - Anthropic: ${clients.anthropic ? '✓' : '✗'}`);
  console.log(`   - Google: ${clients.google ? '✓' : '✗'}`);
  console.log(`   - Mistral: ${clients.mistral ? '✓' : '✗'}`);
  console.log();

  // Count models by type
  const byType = allModels.reduce((acc, modelId) => {
    const type = MODEL_REGISTRY[modelId].type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('📊 Model breakdown by type:');
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`   - ${type}: ${count} models`);
  });
  console.log();

  console.log(`🧪 Testing ${allModels.length} models...\n`);

  // Validate models with rate limiting (avoid hitting API limits)
  for (const modelId of allModels) {
    const result = await validateModel(modelId);
    results.push(result);

    // Log progress
    const emoji = result.status === 'success' ? '✓' : result.status === 'failed' ? '✗' : '⊘';
    const latency = result.latency ? ` (${result.latency}ms)` : '';
    console.log(`${emoji} ${modelId}${latency}`);

    if (result.status === 'failed') {
      console.log(`  Error: ${result.error}`);
    }

    // Rate limiting: wait 1 second between requests to avoid hitting API limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 VALIDATION SUMMARY');
  console.log('='.repeat(80) + '\n');

  const summary = results.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log(`Total models: ${results.length}`);
  console.log(`✓ Success: ${summary.success || 0}`);
  console.log(`✗ Failed: ${summary.failed || 0}`);
  console.log(`⊘ Skipped: ${summary.skipped || 0}`);
  console.log();

  // Group failures by provider
  const failures = results.filter(r => r.status === 'failed');
  if (failures.length > 0) {
    console.log('❌ FAILED MODELS:\n');

    const failuresByProvider = failures.reduce((acc, r) => {
      if (!acc[r.provider]) acc[r.provider] = [];
      acc[r.provider].push(r);
      return acc;
    }, {} as Record<string, ValidationResult[]>);

    Object.entries(failuresByProvider).forEach(([provider, fails]) => {
      console.log(`${provider.toUpperCase()} (${fails.length} failures):`);
      fails.forEach(f => {
        console.log(`  - ${f.modelId}`);
        console.log(`    Error: ${f.error}`);
      });
      console.log();
    });
  }

  // Group skipped by reason
  const skipped = results.filter(r => r.status === 'skipped');
  if (skipped.length > 0) {
    console.log('⊘ SKIPPED MODELS:\n');

    const skippedByReason = skipped.reduce((acc, r) => {
      const reason = r.error || 'Unknown';
      if (!acc[reason]) acc[reason] = [];
      acc[reason].push(r.modelId);
      return acc;
    }, {} as Record<string, string[]>);

    Object.entries(skippedByReason).forEach(([reason, models]) => {
      console.log(`${reason} (${models.length} models):`);
      console.log(`  ${models.join(', ')}`);
      console.log();
    });
  }

  // Export results to JSON for further analysis
  const fs = await import('fs');
  fs.writeFileSync(
    './validation-results.json',
    JSON.stringify(results, null, 2)
  );
  console.log('💾 Full results saved to validation-results.json\n');
}

// Run validation
validateAllModels().catch(console.error);
