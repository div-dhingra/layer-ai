#!/usr/bin/env tsx
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ModelEntry {
  type: string;
  subtype?: string;
  provider: string;
  displayName: string;
  description?: string;
  pricing?: {
    input?: number;
    output?: number;
  };
  unitPricing?: Record<string, any>;
  benchmarks?: {
    intelligence?: number;
    coding?: number;
    math?: number;
    mmluPro?: number;
    gpqa?: number;
  };
  performance?: {
    outputTokensPerSecond?: number;
    timeToFirstToken?: number;
  };
  contextLength?: number;
  context?: {
    window?: number;
    input: {
      text: boolean;
      image: boolean;
      audio: boolean;
      video: boolean;
    };
    output: {
      text: boolean;
      image: boolean;
      audio: boolean;
      video: boolean;
    };
  };
  deprecated?: boolean;
  deprecationDate?: string;
  shutdownDate?: string;
  replacementModel?: string;
  isAvailable?: boolean;
  lastUpdated?: string;
}

interface RegistryResponse {
  version: string;
  generatedAt: string;
  models: {
    [modelId: string]: ModelEntry;
  };
  metadata: {
    totalModels: number;
    lastSync: string;
  };
}

// Helper function to format an object as TypeScript literal (not JSON)
function formatObjectLiteral(obj: any, indent: string = '    ', depth: number = 0): string {
  if (obj === null || obj === undefined) {
    return 'undefined';
  }

  if (typeof obj === 'boolean' || typeof obj === 'number') {
    return String(obj);
  }

  if (typeof obj === 'string') {
    return `'${obj}'`;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    const items = obj.map(item => formatObjectLiteral(item, indent, depth + 1)).join(', ');
    return `[${items}]`;
  }

  if (typeof obj === 'object') {
    const keys = Object.keys(obj);
    if (keys.length === 0) return '{}';

    const currentIndent = indent.repeat(depth);
    const nextIndent = indent.repeat(depth + 1);

    const props = keys.map(key => {
      const value = formatObjectLiteral(obj[key], indent, depth + 1);
      // Quote keys that aren't valid JS identifiers (contain hyphens, dots, etc.)
      const formattedKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `'${key}'`;
      return `${nextIndent}${formattedKey}: ${value}`;
    }).join(',\n');

    return `{\n${props}\n${currentIndent}}`;
  }

  return String(obj);
}

function formatModelEntry(model: ModelEntry, indent: string = '    '): string {
  const lines: string[] = [];

  // Helper to escape single quotes in strings
  const escapeString = (str: string | null | undefined) => (str ?? '').replace(/'/g, "\\'");

  lines.push(`${indent}type: '${model.type}' as const,`);
  lines.push(`${indent}provider: '${model.provider}' as const,`);
  lines.push(`${indent}displayName: '${escapeString(model.displayName)}',`);

  if (model.subtype) {
    lines.push(`${indent}subtype: '${escapeString(model.subtype)}',`);
  }

  if (model.description) {
    lines.push(`${indent}description: '${escapeString(model.description)}',`);
  }

  if (model.pricing) {
    lines.push(`${indent}pricing: { ${model.pricing.input !== undefined ? `input: ${model.pricing.input}` : ''}${model.pricing.input !== undefined && model.pricing.output !== undefined ? ', ' : ''}${model.pricing.output !== undefined ? `output: ${model.pricing.output}` : ''} },`);
  }

  if (model.unitPricing !== undefined) {
    const unitPricingLiteral = formatObjectLiteral(model.unitPricing, '  ', 0);
    const formattedPricing = unitPricingLiteral.split('\n').map((line: string, i: number) =>
      i === 0 ? line : `${indent}${line}`
    ).join('\n');
    lines.push(`${indent}unitPricing: ${formattedPricing},`);
  }

  if (model.benchmarks) {
    const benchmarkParts: string[] = [];
    if (model.benchmarks.intelligence !== undefined) benchmarkParts.push(`intelligence: ${model.benchmarks.intelligence}`);
    if (model.benchmarks.coding !== undefined) benchmarkParts.push(`coding: ${model.benchmarks.coding}`);
    if (model.benchmarks.math !== undefined) benchmarkParts.push(`math: ${model.benchmarks.math}`);
    if (model.benchmarks.mmluPro !== undefined) benchmarkParts.push(`mmluPro: ${model.benchmarks.mmluPro}`);
    if (model.benchmarks.gpqa !== undefined) benchmarkParts.push(`gpqa: ${model.benchmarks.gpqa}`);

    if (benchmarkParts.length > 0) {
      lines.push(`${indent}benchmarks: {`);
      benchmarkParts.forEach(part => {
        lines.push(`${indent}  ${part},`);
      });
      lines.push(`${indent}},`);
    }
  }

  if (model.performance) {
    const perfParts: string[] = [];
    if (model.performance.outputTokensPerSecond !== undefined) perfParts.push(`outputTokensPerSecond: ${model.performance.outputTokensPerSecond}`);
    if (model.performance.timeToFirstToken !== undefined) perfParts.push(`timeToFirstToken: ${model.performance.timeToFirstToken}`);

    if (perfParts.length > 0) {
      lines.push(`${indent}performance: {`);
      perfParts.forEach(part => {
        lines.push(`${indent}  ${part},`);
      });
      lines.push(`${indent}},`);
    }
  }

  if (model.contextLength !== undefined) {
    lines.push(`${indent}contextLength: ${model.contextLength},`);
  }

  if (model.context) {
    const contextLiteral = formatObjectLiteral(model.context, '  ', 0);
    const formattedContext = contextLiteral.split('\n').map((line, i) =>
      i === 0 ? line : `${indent}${line}`
    ).join('\n');
    lines.push(`${indent}context: ${formattedContext},`);
  }

  if (model.deprecated !== undefined) {
    lines.push(`${indent}deprecated: ${model.deprecated},`);
  }

  if (model.isAvailable !== undefined) {
    lines.push(`${indent}isAvailable: ${model.isAvailable},`);
  }

  if (model.lastUpdated) {
    lines.push(`${indent}lastUpdated: '${model.lastUpdated}',`);
  }

  return lines.join('\n');
}

function generateTypeScriptFile(data: RegistryResponse): string {
  const modelsEntries = Object.entries(data.models)
    .map(([id, model]) => {
      return `  '${id}': {\n${formatModelEntry(model)}\n  }`;
    })
    .join(',\n');

  return `// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
// Generated at: ${new Date().toISOString()}
// Source: Internal Model Registry API
// To update: Run \`pnpm sync:registry\`
//
// Registry version: ${data.version}
// Last sync: ${data.metadata.lastSync}
// Total models: ${data.metadata.totalModels}

// Providers we support with adapters
export const SUPPORTED_PROVIDERS = ['openai', 'anthropic', 'google', 'mistral'] as const;
export type SupportedProvider = typeof SUPPORTED_PROVIDERS[number];

export type ModelType =
  | 'chat'           // Chat/completion models (GPT-4, Claude, Gemini)
  | 'image'          // Image generation (DALL-E, Stable Diffusion)
  | 'video'          // Video generation
  | 'audio'          // Audio generation (music, sound effects)
  | 'tts'            // Text-to-speech
  | 'stt'            // Speech-to-text (Whisper)
  | 'embeddings'     // Text embeddings
  | 'ocr'            // Document processing (OCR)
  | 'moderation'     // Content moderation
  | 'responses'      // Reasoning models (o3-pro)
  | 'language-completion';  // Legacy completion API

// Base interface for all models
interface BaseModelEntry {
  type: ModelType;
  provider: string;
  displayName: string;
  description?: string;
  subtype?: string;
  pricing?: {
    input?: number;   // Cost per 1M input tokens/units
    output?: number;  // Cost per 1M output tokens/units
  };
  unitPricing?: Record<string, any>;  // Non-token pricing (per_image, per_second, per_video, etc.)
  deprecated?: boolean;           // Model is deprecated, prevent new usage
  deprecationDate?: string;       // When the model was/will be deprecated
  shutdownDate?: string;          // When the model will be shut down
  replacementModel?: string;      // Suggested replacement model ID
  isAvailable?: boolean;          // Available for use (NOT deprecated AND accessible via API)
  lastUpdated?: string;
}

// Chat/completion models with benchmarks and performance
export interface ChatModelEntry extends BaseModelEntry {
  type: 'chat' | 'responses' | 'language-completion';
  contextLength?: number;
  benchmarks?: {
    intelligence?: number;
    coding?: number;
    math?: number;
    mmluPro?: number;
    gpqa?: number;
  };
  performance?: {
    outputTokensPerSecond?: number;
    timeToFirstToken?: number;
  };
  context?: {
    window?: number;
    input: {
      text: boolean;
      image: boolean;
      audio: boolean;
      video: boolean;
    };
    output: {
      text: boolean;
      image: boolean;
      audio: boolean;
      video: boolean;
    };
  };
}

// Image generation models
export interface ImageModelEntry extends BaseModelEntry {
  type: 'image';
}

// Video generation models
export interface VideoModelEntry extends BaseModelEntry {
  type: 'video';
}

// Audio generation models
export interface AudioModelEntry extends BaseModelEntry {
  type: 'audio';
}

// Text-to-speech models
export interface TTSModelEntry extends BaseModelEntry {
  type: 'tts';
}

// Speech-to-text models
export interface STTModelEntry extends BaseModelEntry {
  type: 'stt';
}

// Embeddings models
export interface EmbeddingsModelEntry extends BaseModelEntry {
  type: 'embeddings';
  contextLength?: number;
}

// OCR/document processing models
export interface OCRModelEntry extends BaseModelEntry {
  type: 'ocr';
}

// Content moderation models
export interface ModerationModelEntry extends BaseModelEntry {
  type: 'moderation';
}

// Union type for all model entries
export type ModelEntry =
  | ChatModelEntry
  | ImageModelEntry
  | VideoModelEntry
  | AudioModelEntry
  | TTSModelEntry
  | STTModelEntry
  | EmbeddingsModelEntry
  | OCRModelEntry
  | ModerationModelEntry;

export const MODEL_REGISTRY = {
${modelsEntries}
} as const;

export type ModelId = keyof typeof MODEL_REGISTRY;

// Legacy type aliases for backwards compatibility
export type SupportedModel = ModelId;
export type Provider = SupportedProvider;
`;
}

async function syncRegistry() {
  console.log('🔄 Fetching latest model registry...\n');

  const apiUrl = process.env.API_URL;

  if (!apiUrl) {
    throw new Error('API_URL environment variable is required (e.g. https://api.uselayer.ai)');
  }

  try {
    // 1. Fetch from public registry endpoint
    const response = await fetch(`${apiUrl}/v1/registry`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as RegistryResponse;

    console.log(`✅ Fetched ${data.metadata.totalModels} models`);
    console.log(`📅 Registry version: ${data.version}`);
    console.log(`🕐 Last sync: ${data.metadata.lastSync}\n`);

    // 2. Generate TypeScript file
    const tsContent = generateTypeScriptFile(data);

    // 3. Write to file
    const filePath = path.join(__dirname, '../packages/sdk/src/types/model-registry.ts');
    fs.writeFileSync(filePath, tsContent, 'utf-8');

    console.log('✅ Updated model-registry.ts\n');
    console.log('📋 Next steps:');
    console.log('  1. Review: git diff packages/sdk/src/types/model-registry.ts');
    console.log('  2. Build: pnpm build');
    console.log('  3. Commit: git commit -m "chore: update model registry"');
    console.log('  4. Release: Consider SDK version bump if significant changes\n');
  } catch (error) {
    console.error('❌ Error syncing registry:');
    console.error(error);
    process.exit(1);
  }
}

// Run the sync
syncRegistry();
