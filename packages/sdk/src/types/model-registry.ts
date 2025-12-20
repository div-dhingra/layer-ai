// Centralized model registry - single source of truth
// Only includes models from supported providers (openai, anthropic, google)
//
// Data sources:
// - AIMLAPI: model discovery, categorization, context lengths (all model types)
// - Artificial Analysis API: pricing, benchmarks, performance metrics (chat models only)
//
// To update: Run `pnpm run sync:models` (requires AIMLAPI_API_KEY and ARTIFICIAL_ANALYSIS_API_KEY in .env)
// APIs:
// - https://api.aimlapi.com/models
// - https://artificialanalysis.ai/api/v2/data/llms/models
// Data attribution: https://aimlapi.com, https://artificialanalysis.ai/

// Providers we support with adapters

export const SUPPORTED_PROVIDERS = ['openai', 'anthropic', 'google'] as const;
export type SupportedProvider = typeof SUPPORTED_PROVIDERS[number];

export type ModelType =
  | 'chat'           // Chat/completion models (GPT-4, Claude, Gemini)
  | 'image'          // Image generation (DALL-E, Stable Diffusion)
  | 'video'          // Video generation
  | 'audio'          // Audio generation (music, sound effects)
  | 'tts'            // Text-to-speech
  | 'stt'            // Speech-to-text (Whisper)
  | 'embeddings'     // Text embeddings
  | 'document'       // Document processing (OCR)
  | 'responses'      // Reasoning models (o3-pro)
  | 'language-completion';  // Legacy completion API

// Base interface for all models
interface BaseModelEntry {
  type: ModelType;
  provider: string;
  displayName: string;
  description?: string;
  pricing?: {
    input?: number;   // Cost per 1K input tokens/units
    output?: number;  // Cost per 1K output tokens/units
  };
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
  maxTokens?: number;
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

// Document processing models
export interface DocumentModelEntry extends BaseModelEntry {
  type: 'document';
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
  | DocumentModelEntry;

export const MODEL_REGISTRY = {
  // Openai models
  'openai/gpt-4o': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT 4o',
    pricing: { input: 0.0025, output: 0.01 },
    benchmarks: {
      intelligence: 27,
      coding: 24,
      math: 6,
      mmluPro: 0.748,
      gpqa: 0.543,
    },
    performance: {
      outputTokenPerSecond: 123.858,
      timeTofirstToken: 0.537,
      intelligenceScore: 27,
    },
    lastUpdated: '2025-12-20',
  },
  'gpt-4o-2024-08-06': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT 4o 2024-08-06',
    pricing: { input: 0.0025, output: 0.01 },
    benchmarks: {
      intelligence: 29,
      gpqa: 0.521,
    },
    performance: {
      outputTokenPerSecond: 89.124,
      timeTofirstToken: 0.568,
      intelligenceScore: 29,
    },
    lastUpdated: '2025-12-20',
  },
  'gpt-4o-2024-05-13': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT 4o 2024-05-13',
    pricing: { input: 0.005, output: 0.015 },
    benchmarks: {
      intelligence: 26.3,
      coding: 24.2,
      mmluPro: 0.74,
      gpqa: 0.526,
    },
    performance: {
      outputTokenPerSecond: 66.624,
      timeTofirstToken: 0.887,
      intelligenceScore: 26.3,
    },
    lastUpdated: '2025-12-20',
  },
  'gpt-4o-mini': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT 4o mini',
    pricing: { input: 0.00015, output: 0.0006 },
    benchmarks: {
      intelligence: 21.2,
      math: 14.7,
      mmluPro: 0.648,
      gpqa: 0.426,
    },
    performance: {
      outputTokenPerSecond: 52.297,
      timeTofirstToken: 0.576,
      intelligenceScore: 21.2,
    },
    lastUpdated: '2025-12-20',
  },
  'gpt-4o-mini-2024-07-18': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT 4o mini 2024-07-18',
    pricing: { input: 0.00015, output: 0.0006 },
    benchmarks: {
      intelligence: 21.2,
      math: 14.7,
      mmluPro: 0.648,
      gpqa: 0.426,
    },
    performance: {
      outputTokenPerSecond: 52.297,
      timeTofirstToken: 0.576,
      intelligenceScore: 21.2,
    },
    lastUpdated: '2025-12-20',
  },
  'chatgpt-4o-latest': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'ChatGPT 4o latest',
    pricing: { input: 0.005, output: 0.015 },
    benchmarks: {
      intelligence: 25.3,
      mmluPro: 0.773,
      gpqa: 0.511,
    },
    performance: {
      outputTokenPerSecond: 165.971,
      timeTofirstToken: 0.461,
      intelligenceScore: 25.3,
    },
    lastUpdated: '2025-12-20',
  },
  'gpt-4-turbo': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT 4 turbo',
    pricing: { input: 0.01, output: 0.03 },
    benchmarks: {
      intelligence: 24.2,
      coding: 21.5,
      mmluPro: 0.694,
    },
    performance: {
      outputTokenPerSecond: 27.301,
      timeTofirstToken: 0.945,
      intelligenceScore: 24.2,
    },
    lastUpdated: '2025-12-20',
  },
  'gpt-4-turbo-2024-04-09': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT 4 turbo 2024-04-09',
    pricing: { input: 0.01, output: 0.03 },
    benchmarks: {
      intelligence: 24.2,
      coding: 21.5,
      mmluPro: 0.694,
    },
    performance: {
      outputTokenPerSecond: 27.301,
      timeTofirstToken: 0.945,
      intelligenceScore: 24.2,
    },
    lastUpdated: '2025-12-20',
  },
  'gpt-4': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT 4',
    pricing: { input: 0.03, output: 0.06 },
    benchmarks: {
      intelligence: 21.5,
      coding: 13.1,
    },
    performance: {
      outputTokenPerSecond: 23.9,
      timeTofirstToken: 0.993,
      intelligenceScore: 21.5,
    },
    lastUpdated: '2025-12-20',
  },
  'gpt-4-0125-preview': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT 4 0125 preview',
    pricing: { input: 0.03, output: 0.06 },
    benchmarks: {
      intelligence: 21.5,
      coding: 13.1,
    },
    performance: {
      outputTokenPerSecond: 23.9,
      timeTofirstToken: 0.993,
      intelligenceScore: 21.5,
    },
    lastUpdated: '2025-12-20',
  },
  'gpt-4-1106-preview': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT 4 1106 preview',
    pricing: { input: 0.03, output: 0.06 },
    benchmarks: {
      intelligence: 21.5,
      coding: 13.1,
    },
    performance: {
      outputTokenPerSecond: 23.9,
      timeTofirstToken: 0.993,
      intelligenceScore: 21.5,
    },
    lastUpdated: '2025-12-20',
  },
  'gpt-3.5-turbo': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT 3.5 turbo',
    pricing: { input: 0.0005, output: 0.0015 },
    benchmarks: {
      intelligence: 8.3,
      coding: 10.7,
      mmluPro: 0.462,
      gpqa: 0.297,
    },
    performance: {
      outputTokenPerSecond: 142.68,
      timeTofirstToken: 0.43,
      intelligenceScore: 8.3,
    },
    lastUpdated: '2025-12-20',
  },
  'gpt-3.5-turbo-0125': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT 3.5 turbo 0125',
    pricing: { input: 0.0005, output: 0.0015 },
    benchmarks: {
      intelligence: 8.3,
      coding: 10.7,
      mmluPro: 0.462,
      gpqa: 0.297,
    },
    performance: {
      outputTokenPerSecond: 142.68,
      timeTofirstToken: 0.43,
      intelligenceScore: 8.3,
    },
    lastUpdated: '2025-12-20',
  },
  'gpt-3.5-turbo-1106': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT 3.5 turbo 1106',
    pricing: { input: 0.0005, output: 0.0015 },
    benchmarks: {
      intelligence: 8.3,
      coding: 10.7,
      mmluPro: 0.462,
      gpqa: 0.297,
    },
    performance: {
      outputTokenPerSecond: 142.68,
      timeTofirstToken: 0.43,
      intelligenceScore: 8.3,
    },
    lastUpdated: '2025-12-20',
  },
  'o3-mini': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'o3 mini',
    pricing: { input: 0.0011, output: 0.0044 },
    benchmarks: {
      intelligence: 48.1,
      coding: 39.4,
      mmluPro: 0.791,
      gpqa: 0.748,
    },
    performance: {
      outputTokenPerSecond: 142.395,
      timeTofirstToken: 18.179,
      intelligenceScore: 48.1,
    },
    lastUpdated: '2025-12-20',
  },
  'gpt-4o-audio-preview': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'Chat GPT 4o audio preview',
    pricing: { input: 0.0025, output: 0.01 },
    benchmarks: {
      intelligence: 27,
      coding: 24,
      math: 6,
      mmluPro: 0.748,
      gpqa: 0.543,
    },
    performance: {
      outputTokenPerSecond: 123.858,
      timeTofirstToken: 0.537,
      intelligenceScore: 27,
    },
    lastUpdated: '2025-12-20',
  },
  'gpt-4o-mini-audio-preview': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'Chat GPT 4o mini audio preview',
    pricing: { input: 0.00015, output: 0.0006 },
    benchmarks: {
      intelligence: 21.2,
      math: 14.7,
      mmluPro: 0.648,
      gpqa: 0.426,
    },
    performance: {
      outputTokenPerSecond: 52.297,
      timeTofirstToken: 0.576,
      intelligenceScore: 21.2,
    },
    lastUpdated: '2025-12-20',
  },
  'openai/gpt-audio': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'Chat GPT audio',
    pricing: { input: 0.0025, output: 0.01 },
    benchmarks: {
      intelligence: 27,
      coding: 24,
      math: 6,
      mmluPro: 0.748,
      gpqa: 0.543,
    },
    performance: {
      outputTokenPerSecond: 123.858,
      timeTofirstToken: 0.537,
      intelligenceScore: 27,
    },
    lastUpdated: '2025-12-20',
  },
  'openai/gpt-audio-mini': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'Chat GPT mini audio',
    pricing: { input: 0.00015, output: 0.0006 },
    benchmarks: {
      intelligence: 21.2,
      math: 14.7,
      mmluPro: 0.648,
      gpqa: 0.426,
    },
    performance: {
      outputTokenPerSecond: 52.297,
      timeTofirstToken: 0.576,
      intelligenceScore: 21.2,
    },
    lastUpdated: '2025-12-20',
  },
  'gpt-4o-search-preview': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'Chat GPT 4o search preview',
    pricing: { input: 0.0025, output: 0.01 },
    benchmarks: {
      intelligence: 27,
      coding: 24,
      math: 6,
      mmluPro: 0.748,
      gpqa: 0.543,
    },
    performance: {
      outputTokenPerSecond: 123.858,
      timeTofirstToken: 0.537,
      intelligenceScore: 27,
    },
    lastUpdated: '2025-12-20',
  },
  'gpt-4o-mini-search-preview': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'Chat GPT 4o mini search preview',
    pricing: { input: 0.00015, output: 0.0006 },
    benchmarks: {
      intelligence: 21.2,
      math: 14.7,
      mmluPro: 0.648,
      gpqa: 0.426,
    },
    performance: {
      outputTokenPerSecond: 52.297,
      timeTofirstToken: 0.576,
      intelligenceScore: 21.2,
    },
    lastUpdated: '2025-12-20',
  },
  'openai/gpt-4.1-2025-04-14': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'Chat GPT 4.1',
    pricing: { input: 0.002, output: 0.008 },
    benchmarks: {
      intelligence: 43.4,
      coding: 32.2,
      math: 34.7,
      mmluPro: 0.806,
      gpqa: 0.666,
    },
    performance: {
      outputTokenPerSecond: 79.153,
      timeTofirstToken: 0.506,
      intelligenceScore: 43.4,
    },
    lastUpdated: '2025-12-20',
  },
  'openai/gpt-4.1-mini-2025-04-14': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'Chat GPT 4.1 mini',
    pricing: { input: 0.0004, output: 0.0016 },
    benchmarks: {
      intelligence: 42.5,
      coding: 31.9,
      math: 46.3,
      mmluPro: 0.781,
      gpqa: 0.664,
    },
    performance: {
      outputTokenPerSecond: 61.523,
      timeTofirstToken: 0.534,
      intelligenceScore: 42.5,
    },
    lastUpdated: '2025-12-20',
  },
  'openai/gpt-4.1-nano-2025-04-14': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'Chat GPT 4.1 nano',
    pricing: { input: 0.0001, output: 0.0004 },
    benchmarks: {
      intelligence: 27.3,
      coding: 20.7,
      math: 24,
      mmluPro: 0.657,
      gpqa: 0.512,
    },
    performance: {
      outputTokenPerSecond: 122.151,
      timeTofirstToken: 0.389,
      intelligenceScore: 27.3,
    },
    lastUpdated: '2025-12-20',
  },
  'openai/o4-mini-2025-04-16': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'o4-mini',
    pricing: { input: 0.0011, output: 0.0044 },
    benchmarks: {
      intelligence: 59.6,
      coding: 48.9,
      math: 90.7,
      mmluPro: 0.832,
      gpqa: 0.784,
    },
    performance: {
      outputTokenPerSecond: 131.538,
      timeTofirstToken: 56.891,
      intelligenceScore: 59.6,
    },
    lastUpdated: '2025-12-20',
  },
  'openai/o3-2025-04-16': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'o3',
    pricing: { input: 0.002, output: 0.008 },
    benchmarks: {
      intelligence: 65.5,
      coding: 52.2,
      math: 88.3,
      mmluPro: 0.853,
      gpqa: 0.827,
    },
    performance: {
      outputTokenPerSecond: 229.799,
      timeTofirstToken: 13.441,
      intelligenceScore: 65.5,
    },
    lastUpdated: '2025-12-20',
  },
  'o1': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'o1',
    pricing: { input: 0.015, output: 0.06 },
    benchmarks: {
      intelligence: 47.2,
      coding: 38.6,
      mmluPro: 0.841,
      gpqa: 0.747,
    },
    performance: {
      outputTokenPerSecond: 162.648,
      timeTofirstToken: 20.052,
      intelligenceScore: 47.2,
    },
    lastUpdated: '2025-12-20',
  },
  'openai/gpt-5-2025-08-07': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5',
    pricing: { input: 0.00125, output: 0.01 },
    benchmarks: {
      intelligence: 68.5,
      coding: 52.7,
      math: 94.3,
      mmluPro: 0.871,
      gpqa: 0.854,
    },
    performance: {
      outputTokenPerSecond: 126.231,
      timeTofirstToken: 98.105,
      intelligenceScore: 68.5,
    },
    lastUpdated: '2025-12-20',
  },
  'openai/gpt-5-mini-2025-08-07': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5 mini',
    pricing: { input: 0.00025, output: 0.002 },
    benchmarks: {
      intelligence: 64.3,
      coding: 51.4,
      math: 90.7,
      mmluPro: 0.837,
      gpqa: 0.828,
    },
    performance: {
      outputTokenPerSecond: 67.754,
      timeTofirstToken: 121.609,
      intelligenceScore: 64.3,
    },
    lastUpdated: '2025-12-20',
  },
  'openai/gpt-5-nano-2025-08-07': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5 nano',
    pricing: { input: 0.00005, output: 0.0004 },
    benchmarks: {
      intelligence: 51,
      coding: 42.3,
      math: 83.7,
      mmluPro: 0.78,
      gpqa: 0.676,
    },
    performance: {
      outputTokenPerSecond: 119.182,
      timeTofirstToken: 137.803,
      intelligenceScore: 51,
    },
    lastUpdated: '2025-12-20',
  },
  'openai/gpt-5-chat-latest': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5 Chat',
    pricing: { input: 0.00125, output: 0.01 },
    benchmarks: {
      intelligence: 41.8,
      coding: 34.7,
      math: 48.3,
      mmluPro: 0.82,
      gpqa: 0.686,
    },
    performance: {
      outputTokenPerSecond: 127.814,
      timeTofirstToken: 0.727,
      intelligenceScore: 41.8,
    },
    lastUpdated: '2025-12-20',
  },
  'openai/gpt-5-1': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5.1',
    pricing: { input: 0.00125, output: 0.01 },
    benchmarks: {
      intelligence: 69.7,
      coding: 57.5,
      math: 94,
      mmluPro: 0.87,
      gpqa: 0.873,
    },
    performance: {
      outputTokenPerSecond: 98.935,
      timeTofirstToken: 41.605,
      intelligenceScore: 69.7,
    },
    lastUpdated: '2025-12-20',
  },
  'openai/gpt-5-1-chat-latest': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5.1 Chat Latest',
    pricing: { input: 0.00125, output: 0.01 },
    benchmarks: {
      intelligence: 41.8,
      coding: 34.7,
      math: 48.3,
      mmluPro: 0.82,
      gpqa: 0.686,
    },
    performance: {
      outputTokenPerSecond: 127.814,
      timeTofirstToken: 0.727,
      intelligenceScore: 41.8,
    },
    lastUpdated: '2025-12-20',
  },
  'openai/gpt-5-2': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5.2',
    pricing: { input: 0.00175, output: 0.014 },
    benchmarks: {
      intelligence: 72.6,
      coding: 61.8,
      math: 98.7,
      mmluPro: 0.874,
      gpqa: 0.903,
    },
    performance: {
      outputTokenPerSecond: 150.843,
      timeTofirstToken: 43.787,
      intelligenceScore: 72.6,
    },
    lastUpdated: '2025-12-20',
  },
  'openai/gpt-5-2-chat-latest': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5.2 Chat Latest',
    pricing: { input: 0.00125, output: 0.01 },
    benchmarks: {
      intelligence: 41.8,
      coding: 34.7,
      math: 48.3,
      mmluPro: 0.82,
      gpqa: 0.686,
    },
    performance: {
      outputTokenPerSecond: 127.814,
      timeTofirstToken: 0.727,
      intelligenceScore: 41.8,
    },
    lastUpdated: '2025-12-20',
  },
  'openai/o3-pro': {
    type: 'responses' as const,
    provider: 'openai' as const,
    displayName: 'o3-pro',
    pricing: { input: 0.02, output: 0.08 },
    benchmarks: {
      intelligence: 65.3,
      gpqa: 0.845,
    },
    performance: {
      outputTokenPerSecond: 38.886,
      timeTofirstToken: 71.827,
      intelligenceScore: 65.3,
    },
    lastUpdated: '2025-12-20',
  },
  'openai/gpt-5-pro': {
    type: 'responses' as const,
    provider: 'openai' as const,
    displayName: 'GPT 5 Pro',
    pricing: { input: 0.00125, output: 0.01 },
    benchmarks: {
      intelligence: 68.5,
      coding: 52.7,
      math: 94.3,
      mmluPro: 0.871,
      gpqa: 0.854,
    },
    performance: {
      outputTokenPerSecond: 126.231,
      timeTofirstToken: 98.105,
      intelligenceScore: 68.5,
    },
    lastUpdated: '2025-12-20',
  },
  'openai/gpt-5-1-codex': {
    type: 'responses' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5.1 Codex',
    pricing: { input: 0.00125, output: 0.01 },
    benchmarks: {
      intelligence: 66.9,
      coding: 52.5,
      math: 95.7,
      mmluPro: 0.86,
      gpqa: 0.86,
    },
    performance: {
      outputTokenPerSecond: 171.555,
      timeTofirstToken: 15.164,
      intelligenceScore: 66.9,
    },
    lastUpdated: '2025-12-20',
  },
  'openai/gpt-5-1-codex-mini': {
    type: 'responses' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5.1 Codex Mini',
    pricing: { input: 0.00025, output: 0.002 },
    benchmarks: {
      intelligence: 62.3,
      coding: 52.5,
      math: 91.7,
      mmluPro: 0.82,
      gpqa: 0.813,
    },
    performance: {
      outputTokenPerSecond: 140.588,
      timeTofirstToken: 10.806,
      intelligenceScore: 62.3,
    },
    lastUpdated: '2025-12-20',
  },
  'openai/gpt-5-2-pro': {
    type: 'responses' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5.2 Pro',
    pricing: { input: 0.00175, output: 0.014 },
    benchmarks: {
      intelligence: 72.6,
      coding: 61.8,
      math: 98.7,
      mmluPro: 0.874,
      gpqa: 0.903,
    },
    performance: {
      outputTokenPerSecond: 150.843,
      timeTofirstToken: 43.787,
      intelligenceScore: 72.6,
    },
    lastUpdated: '2025-12-20',
  },
  'openai/gpt-oss-120b': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT OSS 120B',
    pricing: { input: 0.00015, output: 0.0006 },
    benchmarks: {
      intelligence: 60.5,
      coding: 49.6,
      math: 93.4,
      mmluPro: 0.808,
      gpqa: 0.782,
    },
    performance: {
      outputTokenPerSecond: 334.569,
      timeTofirstToken: 0.439,
      intelligenceScore: 60.5,
    },
    lastUpdated: '2025-12-20',
  },
  'openai/gpt-oss-20b': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT OSS 20B',
    pricing: { input: 0.00007000000000000001, output: 0.0002 },
    benchmarks: {
      intelligence: 52.1,
      coding: 40.7,
      math: 89.3,
      mmluPro: 0.748,
      gpqa: 0.688,
    },
    performance: {
      outputTokenPerSecond: 233.012,
      timeTofirstToken: 0.529,
      intelligenceScore: 52.1,
    },
    lastUpdated: '2025-12-20',
  },
  'dall-e-3': {
    type: 'image' as const,
    provider: 'openai' as const,
    displayName: 'DALL-E 3',
    lastUpdated: '2025-12-20',
  },
  'dall-e-2': {
    type: 'image' as const,
    provider: 'openai' as const,
    displayName: 'DALL-E 2',
    lastUpdated: '2025-12-20',
  },
  'openai/gpt-image-1': {
    type: 'image' as const,
    provider: 'openai' as const,
    displayName: 'GPT Image 1',
    lastUpdated: '2025-12-20',
  },
  'openai/gpt-image-1-mini': {
    type: 'image' as const,
    provider: 'openai' as const,
    displayName: 'GPT Image 1 Mini',
    lastUpdated: '2025-12-20',
  },
  'openai/gpt-image-1-5': {
    type: 'image' as const,
    provider: 'openai' as const,
    displayName: 'GPT-Image-1.5',
    lastUpdated: '2025-12-20',
  },
  'text-embedding-3-small': {
    type: 'embeddings' as const,
    provider: 'openai' as const,
    displayName: 'Text embedding 3 small',
    contextLength: 8000,
    lastUpdated: '2025-12-20',
  },
  'text-embedding-3-large': {
    type: 'embeddings' as const,
    provider: 'openai' as const,
    displayName: 'Text embedding 3 large',
    contextLength: 8000,
    lastUpdated: '2025-12-20',
  },
  'text-embedding-ada-002': {
    type: 'embeddings' as const,
    provider: 'openai' as const,
    displayName: 'Text embedding ada 002',
    contextLength: 8000,
    lastUpdated: '2025-12-20',
  },
  'openai/gpt-4o-transcribe': {
    type: 'stt' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o Transcribe',
    lastUpdated: '2025-12-20',
  },
  'openai/gpt-4o-mini-transcribe': {
    type: 'stt' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o Mini Transcribe',
    lastUpdated: '2025-12-20',
  },
  'openai/gpt-4o-mini-tts': {
    type: 'tts' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o mini TTS',
    lastUpdated: '2025-12-20',
  },
  'openai/tts-1': {
    type: 'tts' as const,
    provider: 'openai' as const,
    displayName: 'TTS-1',
    lastUpdated: '2025-12-20',
  },
  'openai/tts-1-hd': {
    type: 'tts' as const,
    provider: 'openai' as const,
    displayName: 'TTS-1 HD',
    lastUpdated: '2025-12-20',
  },
  'gpt-3.5-turbo-instruct': {
    type: 'language-completion' as const,
    provider: 'openai' as const,
    displayName: 'Gpt 3.5 turbo instruct',
    pricing: { input: 0.0005, output: 0.0015 },
    benchmarks: {
      intelligence: 8.3,
      coding: 10.7,
      mmluPro: 0.462,
      gpqa: 0.297,
    },
    performance: {
      outputTokenPerSecond: 142.68,
      timeTofirstToken: 0.43,
      intelligenceScore: 8.3,
    },
    lastUpdated: '2025-12-20',
  },
  'openai/sora-2-t2v': {
    type: 'video' as const,
    provider: 'openai' as const,
    displayName: 'Sora 2 Text to Video',
    lastUpdated: '2025-12-20',
  },
  'openai/sora-2-i2v': {
    type: 'video' as const,
    provider: 'openai' as const,
    displayName: 'Sora 2 Image to Video',
    lastUpdated: '2025-12-20',
  },
  'openai/sora-2-pro-i2v': {
    type: 'video' as const,
    provider: 'openai' as const,
    displayName: 'Sora 2 Pro Image to Video',
    lastUpdated: '2025-12-20',
  },
  'openai/sora-2-pro-t2v': {
    type: 'video' as const,
    provider: 'openai' as const,
    displayName: 'Sora 2 Pro Text to Video',
    lastUpdated: '2025-12-20',
  },
  'fallback-openai/sora-2-t2v': {
    type: 'video' as const,
    provider: 'openai' as const,
    displayName: 'Sora 2 Text to Video',
    lastUpdated: '2025-12-20',
  },
  'fallback-openai/sora-2-i2v': {
    type: 'video' as const,
    provider: 'openai' as const,
    displayName: 'Sora 2 Image to Video',
    lastUpdated: '2025-12-20',
  },
  'fallback-openai/sora-2-pro-i2v': {
    type: 'video' as const,
    provider: 'openai' as const,
    displayName: 'Sora 2 Pro Image to Video',
    lastUpdated: '2025-12-20',
  },
  'fallback-openai/sora-2-pro-t2v': {
    type: 'video' as const,
    provider: 'openai' as const,
    displayName: 'Sora 2 Pro Text to Video',
    lastUpdated: '2025-12-20',
  },

  // Anthropic models
  'claude-3-opus-20240229': {
    type: 'chat' as const,
    provider: 'anthropic' as const,
    displayName: 'Claude 3 Opus 2024-02-29',
    pricing: { input: 0.015, output: 0.075 },
    benchmarks: {
      intelligence: 20.6,
      coding: 19.5,
      mmluPro: 0.696,
      gpqa: 0.489,
    },
    performance: {
      outputTokenPerSecond: 0,
      timeTofirstToken: 0,
      intelligenceScore: 20.6,
    },
    lastUpdated: '2025-12-20',
  },
  'claude-3-haiku-20240307': {
    type: 'chat' as const,
    provider: 'anthropic' as const,
    displayName: 'Claude 3 Haiku 2024-03-07',
    pricing: { input: 0.00025, output: 0.00125 },
    benchmarks: {
      intelligence: 9.6,
    },
    performance: {
      outputTokenPerSecond: 107.855,
      timeTofirstToken: 0.518,
      intelligenceScore: 9.6,
    },
    lastUpdated: '2025-12-20',
  },
  'claude-3-5-haiku-20241022': {
    type: 'chat' as const,
    provider: 'anthropic' as const,
    displayName: 'Claude 3.5 Haiku 2024-10-22',
    pricing: { input: 0.0008, output: 0.004 },
    benchmarks: {
      intelligence: 20.2,
      mmluPro: 0.634,
      gpqa: 0.408,
    },
    performance: {
      outputTokenPerSecond: 47.469,
      timeTofirstToken: 0.727,
      intelligenceScore: 20.2,
    },
    lastUpdated: '2025-12-20',
  },
  'claude-3-7-sonnet-20250219': {
    type: 'chat' as const,
    provider: 'anthropic' as const,
    displayName: 'Claude 3.7 Sonnet',
    pricing: { input: 0.003, output: 0.015 },
    benchmarks: {
      intelligence: 41.1,
      coding: 32.3,
      math: 21,
      mmluPro: 0.803,
      gpqa: 0.656,
    },
    performance: {
      outputTokenPerSecond: 0,
      timeTofirstToken: 0,
      intelligenceScore: 41.1,
    },
    lastUpdated: '2025-12-20',
  },
  'claude-sonnet-4-20250514': {
    type: 'chat' as const,
    provider: 'anthropic' as const,
    displayName: 'Claude 4 Sonnet',
    pricing: { input: 0.003, output: 0.015 },
    benchmarks: {
      intelligence: 44.4,
      coding: 35.9,
      math: 38,
      mmluPro: 0.837,
      gpqa: 0.683,
    },
    performance: {
      outputTokenPerSecond: 64.597,
      timeTofirstToken: 2.109,
      intelligenceScore: 44.4,
    },
    lastUpdated: '2025-12-20',
  },
  'claude-opus-4-20250514': {
    type: 'chat' as const,
    provider: 'anthropic' as const,
    displayName: 'Claude 4 Opus',
    pricing: { input: 0.015, output: 0.075 },
    benchmarks: {
      intelligence: 42.3,
      math: 36.3,
      mmluPro: 0.86,
      gpqa: 0.701,
    },
    performance: {
      outputTokenPerSecond: 39.264,
      timeTofirstToken: 1.618,
      intelligenceScore: 42.3,
    },
    lastUpdated: '2025-12-20',
  },
  'claude-opus-4-1-20250805': {
    type: 'chat' as const,
    provider: 'anthropic' as const,
    displayName: 'Claude 4.1 Opus',
    pricing: { input: 0.015, output: 0.075 },
    benchmarks: {
      intelligence: 44.6,
    },
    performance: {
      outputTokenPerSecond: 36.026,
      timeTofirstToken: 1.414,
      intelligenceScore: 44.6,
    },
    lastUpdated: '2025-12-20',
  },
  'claude-sonnet-4-5-20250929': {
    type: 'chat' as const,
    provider: 'anthropic' as const,
    displayName: 'Claude 4.5 Sonnet',
    pricing: { input: 0.003, output: 0.015 },
    benchmarks: {
      intelligence: 49.6,
      coding: 42.9,
      math: 37,
      mmluPro: 0.86,
      gpqa: 0.727,
    },
    performance: {
      outputTokenPerSecond: 71.941,
      timeTofirstToken: 1.929,
      intelligenceScore: 49.6,
    },
    lastUpdated: '2025-12-20',
  },
  'claude-haiku-4-5-20251001': {
    type: 'chat' as const,
    provider: 'anthropic' as const,
    displayName: 'Claude 4.5 Haiku',
    pricing: { input: 0.001, output: 0.005 },
    benchmarks: {
      intelligence: 41.7,
      coding: 37,
      math: 39,
      mmluPro: 0.8,
      gpqa: 0.646,
    },
    performance: {
      outputTokenPerSecond: 88.782,
      timeTofirstToken: 1.146,
      intelligenceScore: 41.7,
    },
    lastUpdated: '2025-12-20',
  },
  'claude-opus-4-5-20251101': {
    type: 'chat' as const,
    provider: 'anthropic' as const,
    displayName: 'Claude 4.5 Opus',
    lastUpdated: '2025-12-20',
  },
  'voyage-large-2-instruct': {
    type: 'embeddings' as const,
    provider: 'anthropic' as const,
    displayName: 'Voyage large 2 instruct',
    contextLength: 16000,
    lastUpdated: '2025-12-20',
  },
  'voyage-finance-2': {
    type: 'embeddings' as const,
    provider: 'anthropic' as const,
    displayName: 'Voyage finance 2',
    contextLength: 32000,
    lastUpdated: '2025-12-20',
  },
  'voyage-multilingual-2': {
    type: 'embeddings' as const,
    provider: 'anthropic' as const,
    displayName: 'Voyage multilingual 2',
    contextLength: 32000,
    lastUpdated: '2025-12-20',
  },
  'voyage-law-2': {
    type: 'embeddings' as const,
    provider: 'anthropic' as const,
    displayName: 'Voyage law 2',
    contextLength: 16000,
    lastUpdated: '2025-12-20',
  },
  'voyage-code-2': {
    type: 'embeddings' as const,
    provider: 'anthropic' as const,
    displayName: 'Voyage code 2',
    contextLength: 16000,
    lastUpdated: '2025-12-20',
  },
  'voyage-large-2': {
    type: 'embeddings' as const,
    provider: 'anthropic' as const,
    displayName: 'Voyage large 2',
    contextLength: 16000,
    lastUpdated: '2025-12-20',
  },
  'voyage-2': {
    type: 'embeddings' as const,
    provider: 'anthropic' as const,
    displayName: 'Voyage 2',
    contextLength: 4000,
    lastUpdated: '2025-12-20',
  },

  // Google models
  'google/gemini-2.0-flash-exp': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemini 2.0 Flash Experimental',
    benchmarks: {
      intelligence: 31.8,
      mmluPro: 0.782,
      gpqa: 0.636,
    },
    performance: {
      outputTokenPerSecond: 137.693,
      timeTofirstToken: 0.309,
      intelligenceScore: 31.8,
    },
    lastUpdated: '2025-12-20',
  },
  'google/gemini-2.0-flash': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemini 2.0 Flash',
    pricing: { input: 0.0001, output: 0.0004 },
    benchmarks: {
      intelligence: 33.6,
      coding: 23.4,
      math: 21.7,
      mmluPro: 0.779,
      gpqa: 0.623,
    },
    performance: {
      outputTokenPerSecond: 182.888,
      timeTofirstToken: 0.394,
      intelligenceScore: 33.6,
    },
    lastUpdated: '2025-12-20',
  },
  'google/gemini-2.5-pro': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemini 2.5 Pro',
    pricing: { input: 0.00125, output: 0.01 },
    benchmarks: {
      intelligence: 59.6,
      coding: 49.3,
      math: 87.7,
      mmluPro: 0.862,
      gpqa: 0.844,
    },
    performance: {
      outputTokenPerSecond: 154.828,
      timeTofirstToken: 34.591,
      intelligenceScore: 59.6,
    },
    lastUpdated: '2025-12-20',
  },
  'google/gemini-2.5-flash': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemini 2.5 Flash',
    pricing: { input: 0.0003, output: 0.0025 },
    benchmarks: {
      intelligence: 40.4,
      coding: 30,
      math: 60.3,
      mmluPro: 0.809,
      gpqa: 0.683,
    },
    performance: {
      outputTokenPerSecond: 224.585,
      timeTofirstToken: 0.357,
      intelligenceScore: 40.4,
    },
    lastUpdated: '2025-12-20',
  },
  'google/gemma-3-4b-it': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemma 3 4B',
    benchmarks: {
      intelligence: 14.7,
      coding: 6.4,
      math: 12.7,
      mmluPro: 0.417,
      gpqa: 0.291,
    },
    performance: {
      outputTokenPerSecond: 48.964,
      timeTofirstToken: 1.039,
      intelligenceScore: 14.7,
    },
    lastUpdated: '2025-12-20',
  },
  'google/gemma-3-12b-it': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemma 3 12B',
    benchmarks: {
      intelligence: 20.4,
      coding: 10.6,
      math: 18.3,
      mmluPro: 0.595,
      gpqa: 0.349,
    },
    performance: {
      outputTokenPerSecond: 50.865,
      timeTofirstToken: 3.035,
      intelligenceScore: 20.4,
    },
    lastUpdated: '2025-12-20',
  },
  'google/gemma-3-27b-it': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemma 3 27B',
    benchmarks: {
      intelligence: 22.1,
      coding: 12.8,
      math: 20.7,
      mmluPro: 0.669,
      gpqa: 0.428,
    },
    performance: {
      outputTokenPerSecond: 49.065,
      timeTofirstToken: 0.829,
      intelligenceScore: 22.1,
    },
    lastUpdated: '2025-12-20',
  },
  'google/gemini-2.5-flash-lite-preview': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemini 2.5 Flash Lite Preview',
    pricing: { input: 0.0001, output: 0.0004 },
    benchmarks: {
      intelligence: 41.6,
      coding: 33.2,
      math: 46.7,
      mmluPro: 0.796,
      gpqa: 0.651,
    },
    performance: {
      outputTokenPerSecond: 498.543,
      timeTofirstToken: 0.252,
      intelligenceScore: 41.6,
    },
    lastUpdated: '2025-12-20',
  },
  'google/gemma-3n-e4b-it': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemma 3n 4B',
    pricing: { input: 0.00002, output: 0.00004 },
    benchmarks: {
      intelligence: 15.5,
      coding: 8.3,
      math: 14.3,
      mmluPro: 0.488,
      gpqa: 0.296,
    },
    performance: {
      outputTokenPerSecond: 55.692,
      timeTofirstToken: 0.315,
      intelligenceScore: 15.5,
    },
    lastUpdated: '2025-12-20',
  },
  'google/gemini-3-pro-preview': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemini 3 Pro Preview',
    pricing: { input: 0.002, output: 0.012 },
    benchmarks: {
      intelligence: 72.8,
      coding: 62.3,
      math: 95.7,
      mmluPro: 0.898,
      gpqa: 0.908,
    },
    performance: {
      outputTokenPerSecond: 134.065,
      timeTofirstToken: 31.172,
      intelligenceScore: 72.8,
    },
    lastUpdated: '2025-12-20',
  },
  'google/gemini-3-flash-preview': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemini 3 Flash Preview',
    pricing: { input: 0.0005, output: 0.003 },
    benchmarks: {
      intelligence: 54.5,
      coding: 53.1,
      math: 55.7,
      mmluPro: 0.882,
      gpqa: 0.812,
    },
    performance: {
      outputTokenPerSecond: 187.211,
      timeTofirstToken: 0.729,
      intelligenceScore: 54.5,
    },
    lastUpdated: '2025-12-20',
  },
  'google/gc-document-ai': {
    type: 'document' as const,
    provider: 'google' as const,
    displayName: 'GC document AI',
    lastUpdated: '2025-12-20',
  },
  'imagen-3.0-generate-002': {
    type: 'image' as const,
    provider: 'google' as const,
    displayName: 'Imagen 3.0',
    lastUpdated: '2025-12-20',
  },
  'imagen-4.0-ultra-generate-preview-06-06': {
    type: 'image' as const,
    provider: 'google' as const,
    displayName: 'Imagen 4.0 Ultra',
    lastUpdated: '2025-12-20',
  },
  'google/imagen-4.0-generate-001': {
    type: 'image' as const,
    provider: 'google' as const,
    displayName: 'Imagen 4.0 Generate',
    lastUpdated: '2025-12-20',
  },
  'google/imagen-4.0-fast-generate-001': {
    type: 'image' as const,
    provider: 'google' as const,
    displayName: 'Imagen 4.0 Fast Generate',
    lastUpdated: '2025-12-20',
  },
  'google/imagen-4.0-ultra-generate-001': {
    type: 'image' as const,
    provider: 'google' as const,
    displayName: 'Imagen 4.0 Ultra Generate',
    lastUpdated: '2025-12-20',
  },
  'google/imagen4/preview': {
    type: 'image' as const,
    provider: 'google' as const,
    displayName: 'Imagen 4.0 Generate Preview',
    lastUpdated: '2025-12-20',
  },
  'google/gemini-2.5-flash-image': {
    type: 'image' as const,
    provider: 'google' as const,
    displayName: 'Gemini 2.5 Flash Image',
    lastUpdated: '2025-12-20',
  },
  'google/gemini-2.5-flash-image-edit': {
    type: 'image' as const,
    provider: 'google' as const,
    displayName: 'Gemini 2.5 Flash Image Edit',
    lastUpdated: '2025-12-20',
  },
  'google/gemini-3-pro-image-preview': {
    type: 'image' as const,
    provider: 'google' as const,
    displayName: 'Gemini 3 Pro Image',
    lastUpdated: '2025-12-20',
  },
  'google/nano-banana-pro': {
    type: 'image' as const,
    provider: 'google' as const,
    displayName: 'Nano Banana Pro',
    lastUpdated: '2025-12-20',
  },
  'google/gemini-3-pro-image-preview-edit': {
    type: 'image' as const,
    provider: 'google' as const,
    displayName: 'Gemini 3 Pro Image Edit',
    lastUpdated: '2025-12-20',
  },
  'google/nano-banana-pro-edit': {
    type: 'image' as const,
    provider: 'google' as const,
    displayName: 'Nano Banana Pro Edit',
    lastUpdated: '2025-12-20',
  },
  'text-embedding-004': {
    type: 'embeddings' as const,
    provider: 'google' as const,
    displayName: 'Text embedding 004',
    contextLength: 2000,
    lastUpdated: '2025-12-20',
  },
  'text-multilingual-embedding-002': {
    type: 'embeddings' as const,
    provider: 'google' as const,
    displayName: 'Text multilingual embedding 002',
    contextLength: 2000,
    lastUpdated: '2025-12-20',
  },
  'google/veo-3.1-t2v': {
    type: 'video' as const,
    provider: 'google' as const,
    displayName: 'Veo3.1 Text-To-Video',
    lastUpdated: '2025-12-20',
  },
  'google/veo-3.1-i2v': {
    type: 'video' as const,
    provider: 'google' as const,
    displayName: 'Veo3.1 Image-To-Video',
    lastUpdated: '2025-12-20',
  },
  'google/veo-3.1-first-last-image-to-video': {
    type: 'video' as const,
    provider: 'google' as const,
    displayName: 'Veo3.1 First-Last-Frame-Image-To-Video',
    lastUpdated: '2025-12-20',
  },
  'google/veo-3.1-reference-to-video': {
    type: 'video' as const,
    provider: 'google' as const,
    displayName: 'Veo3.1 Reference-To-Video',
    lastUpdated: '2025-12-20',
  },
  'google/veo-3.1-t2v-fast': {
    type: 'video' as const,
    provider: 'google' as const,
    displayName: 'Veo3.1 Text-To-Video Fast',
    lastUpdated: '2025-12-20',
  },
  'google/veo-3.1-i2v-fast': {
    type: 'video' as const,
    provider: 'google' as const,
    displayName: 'Veo3.1 Image-To-Video Fast',
    lastUpdated: '2025-12-20',
  },
  'google/veo-3.1-first-last-image-to-video-fast': {
    type: 'video' as const,
    provider: 'google' as const,
    displayName: 'Veo3.1 First-Last-Frame-Image-To-Video Fast',
    lastUpdated: '2025-12-20',
  },
  'veo2/image-to-video': {
    type: 'video' as const,
    provider: 'google' as const,
    displayName: 'Veo2 Image-to-Video',
    lastUpdated: '2025-12-20',
  },
  'veo2': {
    type: 'video' as const,
    provider: 'google' as const,
    displayName: 'Veo2 Text-to-Video',
    lastUpdated: '2025-12-20',
  },
  'google/veo3': {
    type: 'video' as const,
    provider: 'google' as const,
    displayName: 'Veo3 Text-to-Video',
    lastUpdated: '2025-12-20',
  },
  'google/veo-3.0-i2v': {
    type: 'video' as const,
    provider: 'google' as const,
    displayName: 'Veo3 Image-to-Video',
    lastUpdated: '2025-12-20',
  },
  'google/veo-3.0-fast': {
    type: 'video' as const,
    provider: 'google' as const,
    displayName: 'Veo3 Text-To-Video Fast',
    lastUpdated: '2025-12-20',
  },
  'google/veo-3.0-i2v-fast': {
    type: 'video' as const,
    provider: 'google' as const,
    displayName: 'Veo3 Image-to-Video Fast',
    lastUpdated: '2025-12-20',
  },
  'google/lyria2': {
    type: 'audio' as const,
    provider: 'google' as const,
    displayName: 'Lyria 2',
    lastUpdated: '2025-12-20',
  },

} as const;

// Derive types from registry
export type SupportedModel = keyof typeof MODEL_REGISTRY;
export type Provider = typeof MODEL_REGISTRY[SupportedModel]['provider'];
