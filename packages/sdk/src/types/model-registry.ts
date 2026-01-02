// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
// Generated at: 2026-01-02T09:52:55.923Z
// Source: Internal Model Registry API
// To update: Run `pnpm sync:registry`
//
// Registry version: 2026-01-02
// Last sync: 2026-01-02T09:52:55.918Z
// Total models: 103

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
  'claude-3-7-sonnet-20250219': {
    type: 'chat' as const,
    provider: 'anthropic' as const,
    displayName: 'Claude Sonnet 3.7',
    description: 'Legacy fast model with extended thinking support',
    pricing: { input: 3, output: 15 },
    benchmarks: {
      intelligence: 49.9,
      coding: 35.8,
      math: 56.3,
      mmluPro: 0.84,
      gpqa: 0.77,
    },
    performance: {
      intelligenceScore: 49.9,
    },
    contextLength: 200000,
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'claude-3-haiku-20240307': {
    type: 'chat' as const,
    provider: 'anthropic' as const,
    displayName: 'Claude Haiku 3',
    description: 'Legacy fast model with 4K token output',
    pricing: { input: 0.25, output: 1.25 },
    benchmarks: {
      intelligence: 1,
      coding: 7.8,
      mmluPro: 0.43,
      gpqa: 0.33,
    },
    performance: {
      intelligenceScore: 1,
    },
    contextLength: 200000,
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'claude-haiku-4-5-20251001': {
    type: 'chat' as const,
    provider: 'anthropic' as const,
    displayName: 'Claude Haiku 4.5',
    description: 'Our fastest model with near-frontier intelligence',
    pricing: { input: 1, output: 5 },
    benchmarks: {
      intelligence: 20.2,
      mmluPro: 0.63,
      gpqa: 0.41,
    },
    performance: {
      intelligenceScore: 20.2,
    },
    contextLength: 200000,
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'claude-opus-4-1-20250805': {
    type: 'chat' as const,
    provider: 'anthropic' as const,
    displayName: 'Claude Opus 4.1',
    description: 'Legacy premium model with moderate latency',
    pricing: { input: 15, output: 75 },
    benchmarks: {
      intelligence: 59.3,
      coding: 46.1,
      math: 80.3,
      mmluPro: 0.88,
      gpqa: 0.81,
    },
    performance: {
      intelligenceScore: 59.3,
    },
    contextLength: 200000,
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'claude-opus-4-5-20251101': {
    type: 'chat' as const,
    provider: 'anthropic' as const,
    displayName: 'Claude Opus 4.5',
    description: 'Premium model combining maximum intelligence with practical performance',
    pricing: { input: 5, output: 25 },
    benchmarks: {
      intelligence: 9.7,
      coding: 14,
      mmluPro: 0.5,
      gpqa: 0.32,
    },
    performance: {
      intelligenceScore: 9.7,
    },
    contextLength: 200000,
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'claude-sonnet-4-20250514': {
    type: 'chat' as const,
    provider: 'anthropic' as const,
    displayName: 'Claude Sonnet 4',
    description: 'Legacy fast model with extended thinking support',
    pricing: { input: 3, output: 15 },
    benchmarks: {
      intelligence: 44.4,
      coding: 35.9,
      math: 38,
      mmluPro: 0.84,
      gpqa: 0.68,
    },
    performance: {
      intelligenceScore: 44.4,
    },
    contextLength: 200000,
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'claude-sonnet-4-5-20250929': {
    type: 'chat' as const,
    provider: 'anthropic' as const,
    displayName: 'Claude Sonnet 4.5',
    description: 'Our smart model for complex agents and coding',
    pricing: { input: 3, output: 15 },
    benchmarks: {
      intelligence: 49.6,
      coding: 42.9,
      math: 37,
      mmluPro: 0.86,
      gpqa: 0.73,
    },
    performance: {
      intelligenceScore: 49.6,
    },
    contextLength: 200000,
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'embedding-001': {
    type: 'embedding' as const,
    provider: 'google' as const,
    displayName: 'Embedding 001',
    description: 'Legacy embedding model for text embeddings',
    pricing: { input: 0.15, output: 0 },
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: false,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gemini-2.0-flash': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemini 2.0 Flash',
    description: 'Second generation workhorse model with 1 million token context window, superior speed, native tool use, and next-gen features',
    pricing: { input: 0.1, output: 0.4 },
    benchmarks: {
      intelligence: 12.8,
      coding: 17.6,
    },
    performance: {
      intelligenceScore: 12.8,
    },
    contextLength: 1048576,
    context: {
      input: {
        text: true,
        audio: true,
        image: true,
        video: true
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gemini-2.0-flash-exp-image-generation': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemini 2.0 Flash Image',
    description: 'Second generation model with image generation capabilities',
    contextLength: 32768,
    context: {
      input: {
        text: true,
        audio: true,
        image: true,
        video: true
      },
      output: {
        text: true,
        audio: false,
        image: true,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gemini-2.0-flash-lite': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemini 2.0 Flash-Lite',
    description: 'Second generation small and powerful model with 1 million token context window, optimized for cost efficiency and low latency',
    pricing: { input: 0.075, output: 0.3 },
    benchmarks: {
      intelligence: 26.8,
      mmluPro: 0.72,
      gpqa: 0.54,
    },
    performance: {
      intelligenceScore: 26.8,
    },
    contextLength: 1048576,
    context: {
      input: {
        text: true,
        audio: true,
        image: true,
        video: true
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gemini-2.5-flash': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemini 2.5 Flash',
    description: 'Fast and intelligent model with best price-performance, versatile features for high-volume tasks',
    pricing: { input: 0.3, output: 2.5 },
    benchmarks: {
      intelligence: 54.4,
      coding: 42.5,
      math: 78.3,
      mmluPro: 0.84,
      gpqa: 0.79,
    },
    performance: {
      intelligenceScore: 54.4,
    },
    contextLength: 1048576,
    context: {
      input: {
        text: true,
        audio: true,
        image: true,
        video: true
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gemini-2.5-flash-image': {
    type: 'image-generation' as const,
    provider: 'google' as const,
    displayName: 'Gemini 2.5 Flash Image',
    description: 'Image generation model for creating images from text and image inputs',
    pricing: { input: 0.3, output: 30 },
    contextLength: 65536,
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: true,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gemini-2.5-flash-lite': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemini 2.5 Flash-Lite',
    description: 'Ultra fast model optimized for cost efficiency and high throughput',
    pricing: { input: 0.1, output: 0.4 },
    benchmarks: {
      intelligence: 40.1,
      coding: 27.6,
      math: 53.3,
      mmluPro: 0.76,
      gpqa: 0.63,
    },
    performance: {
      intelligenceScore: 40.1,
    },
    contextLength: 1048576,
    context: {
      input: {
        text: true,
        audio: true,
        image: true,
        video: true
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gemini-2.5-flash-preview-tts': {
    type: 'tts' as const,
    provider: 'google' as const,
    displayName: 'Gemini 2.5 Flash TTS',
    description: 'Text-to-speech model for audio generation',
    pricing: { input: 0.5, output: 100 },
    contextLength: 8192,
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: false,
        audio: true,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gemini-2.5-pro': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemini 2.5 Pro',
    description: 'Advanced thinking model for complex reasoning in code, math, and STEM, with long context for analyzing large datasets, codebases, and documents',
    pricing: { input: 1.25, output: 10 },
    benchmarks: {
      intelligence: 53.2,
      mmluPro: 0.84,
      gpqa: 0.82,
    },
    performance: {
      intelligenceScore: 53.2,
    },
    contextLength: 1048576,
    context: {
      input: {
        pdf: true,
        text: true,
        audio: true,
        image: true,
        video: true
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gemini-2.5-pro-preview-tts': {
    type: 'tts' as const,
    provider: 'google' as const,
    displayName: 'Gemini 2.5 Pro TTS',
    description: 'Text-to-speech model for audio generation',
    pricing: { input: 1, output: 20 },
    contextLength: 8192,
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: false,
        audio: true,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gemini-3-flash-preview': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemini 3 Flash Preview',
    description: 'Most balanced model designed for speed, scale and the latest AI',
    pricing: { input: 0.5, output: 3 },
    benchmarks: {
      intelligence: 71.3,
      coding: 59.2,
      math: 97,
      mmluPro: 0.89,
      gpqa: 0.9,
    },
    performance: {
      intelligenceScore: 71.3,
    },
    contextLength: 1048576,
    context: {
      input: {
        text: true,
        audio: true,
        image: true,
        video: true
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gemini-3-pro-image-preview': {
    type: 'image-generation' as const,
    provider: 'google' as const,
    displayName: 'Gemini 3 Pro Image Preview',
    description: 'Image generation model for creating images from text and image inputs',
    pricing: { input: 2, output: 12 },
    contextLength: 65536,
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: true,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gemini-3-pro-preview': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemini 3 Pro Preview',
    description: 'Most intelligent model with advanced reasoning, richer visuals and deeper interactions',
    pricing: { input: 2, output: 12 },
    benchmarks: {
      intelligence: 64.5,
      coding: 55.8,
      math: 86.7,
      mmluPro: 0.9,
      gpqa: 0.89,
    },
    performance: {
      intelligenceScore: 64.5,
    },
    contextLength: 1048576,
    context: {
      input: {
        text: true,
        audio: true,
        image: true,
        video: true
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gemini-robotics-er-1.5-preview': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemini Robotics ER 1.5 Preview',
    description: 'Robotics model for embodied reasoning and control tasks',
    pricing: { input: 0.3, output: 2.5 },
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: true
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gemma-3-12b-it': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemma 3 12B IT',
    description: 'Medium instruction-tuned Gemma model',
    pricing: { input: 0, output: 0 },
    benchmarks: {
      intelligence: 20.4,
      coding: 10.6,
      math: 18.3,
      mmluPro: 0.6,
      gpqa: 0.35,
    },
    performance: {
      intelligenceScore: 20.4,
    },
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gemma-3-1b-it': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemma 3 1B IT',
    description: 'Compact instruction-tuned Gemma model',
    pricing: { input: 0, output: 0 },
    benchmarks: {
      intelligence: 12.5,
      mmluPro: 0.48,
      gpqa: 0.28,
    },
    performance: {
      intelligenceScore: 12.5,
    },
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gemma-3-27b-it': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemma 3 27B IT',
    description: 'Large instruction-tuned Gemma model',
    pricing: { input: 0, output: 0 },
    benchmarks: {
      intelligence: 22.1,
      coding: 12.8,
      math: 20.7,
      mmluPro: 0.67,
      gpqa: 0.43,
    },
    performance: {
      intelligenceScore: 22.1,
    },
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gemma-3-4b-it': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemma 3 4B IT',
    description: 'Small instruction-tuned Gemma model',
    pricing: { input: 0, output: 0 },
    benchmarks: {
      intelligence: 15.5,
      coding: 8.3,
      math: 14.3,
      mmluPro: 0.49,
      gpqa: 0.3,
    },
    performance: {
      intelligenceScore: 15.5,
    },
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'imagen-4.0-fast-generate-001': {
    type: 'image-generation' as const,
    provider: 'google' as const,
    displayName: 'Imagen 4.0 Fast',
    description: 'Fast image generation model',
    pricing: { input: 0, output: 0 },
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: false,
        audio: false,
        image: true,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'imagen-4.0-generate-001': {
    type: 'image-generation' as const,
    provider: 'google' as const,
    displayName: 'Imagen 4.0',
    description: 'Image generation model',
    pricing: { input: 0, output: 0 },
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: false,
        audio: false,
        image: true,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'imagen-4.0-ultra-generate-001': {
    type: 'image-generation' as const,
    provider: 'google' as const,
    displayName: 'Imagen 4.0 Ultra',
    description: 'Ultra quality image generation model',
    pricing: { input: 0, output: 0 },
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: false,
        audio: false,
        image: true,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'text-embedding-004': {
    type: 'embedding' as const,
    provider: 'google' as const,
    displayName: 'Text Embedding 004',
    description: 'Text embedding model for semantic similarity and retrieval',
    pricing: { input: 0.6, output: 0 },
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: false,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'veo-2.0-generate-001': {
    type: 'video-generation' as const,
    provider: 'google' as const,
    displayName: 'Veo 2.0',
    description: 'Video generation model',
    pricing: { input: 0, output: 0 },
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: false,
        audio: false,
        image: false,
        video: true
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'veo-3.0-fast-generate-001': {
    type: 'video-generation' as const,
    provider: 'google' as const,
    displayName: 'Veo 3.0 Fast',
    description: 'Fast video generation model',
    pricing: { input: 0, output: 0 },
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: false,
        audio: false,
        image: false,
        video: true
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'veo-3.0-generate-001': {
    type: 'video-generation' as const,
    provider: 'google' as const,
    displayName: 'Veo 3.0',
    description: 'Video generation model',
    pricing: { input: 0, output: 0 },
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: false,
        audio: false,
        image: false,
        video: true
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'veo-3.1-fast-generate-preview': {
    type: 'video-generation' as const,
    provider: 'google' as const,
    displayName: 'Veo 3.1 Fast',
    description: 'Fast video generation model',
    pricing: { input: 0, output: 0 },
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: false,
        audio: false,
        image: false,
        video: true
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'veo-3.1-generate-preview': {
    type: 'video-generation' as const,
    provider: 'google' as const,
    displayName: 'Veo 3.1',
    description: 'Video generation model',
    pricing: { input: 0, output: 0 },
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: false,
        audio: false,
        image: false,
        video: true
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'codestral-2412': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Codestral',
    description: 'Our cutting-edge language model for code completion released end of July 2025.',
    benchmarks: {
      intelligence: 68.5,
      coding: 53.5,
      math: 98.7,
      mmluPro: 0.87,
      gpqa: 0.84,
    },
    performance: {
      intelligenceScore: 68.5,
    },
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'codestral-2508': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Codestral',
    description: 'Our cutting-edge language model for code completion released end of July 2025.',
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'codestral-embed-2505': {
    type: 'embedding' as const,
    provider: 'mistral' as const,
    displayName: 'Codestral Embed',
    description: 'Our state-of-the-art semantic for extracting representation of code extracts',
    pricing: { input: 0.15, output: 0 },
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: false,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'codestral-latest': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Codestral',
    description: 'Our cutting-edge language model for code completion',
    pricing: { input: 0.3, output: 0.9 },
    benchmarks: {
      intelligence: 12.2,
      mmluPro: 0.47,
      gpqa: 0.34,
    },
    performance: {
      intelligenceScore: 12.2,
    },
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'devstral-2512': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Devstral 2',
    description: 'Our frontier code agents model for solving software engineering tasks.',
    benchmarks: {
      intelligence: 19.6,
      mmluPro: 0.63,
      gpqa: 0.43,
    },
    performance: {
      intelligenceScore: 19.6,
    },
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'devstral-latest': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Devstral',
    description: 'Our frontier code agents model for solving software engineering tasks.',
    pricing: { input: 0, output: 0 },
    benchmarks: {
      intelligence: 27.2,
      coding: 18.5,
      math: 29.3,
      mmluPro: 0.62,
      gpqa: 0.41,
    },
    performance: {
      intelligenceScore: 27.2,
    },
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'magistral-medium-2509': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Magistral Medium 1.2',
    description: 'Our frontier-class multimodal reasoning model.',
    benchmarks: {
      intelligence: 33.2,
      coding: 30.3,
      math: 40.3,
      mmluPro: 0.75,
      gpqa: 0.68,
    },
    performance: {
      intelligenceScore: 33.2,
    },
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'magistral-medium-latest': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Magistral Medium',
    description: 'Our frontier-class multimodal reasoning model',
    pricing: { input: 2, output: 5 },
    benchmarks: {
      intelligence: 33.2,
      coding: 30.3,
      math: 40.3,
      mmluPro: 0.75,
      gpqa: 0.68,
    },
    performance: {
      intelligenceScore: 33.2,
    },
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'magistral-small-2509': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Magistral Small 1.2',
    description: 'Our small multimodal reasoning model.',
    benchmarks: {
      intelligence: 43,
      coding: 37.2,
      math: 80.3,
      mmluPro: 0.77,
      gpqa: 0.66,
    },
    performance: {
      intelligenceScore: 43,
    },
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'magistral-small-latest': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Magistral Small',
    description: 'Our small multimodal reasoning model',
    pricing: { input: 0.5, output: 1.5 },
    benchmarks: {
      intelligence: 31.9,
      coding: 26.6,
      math: 41.3,
      mmluPro: 0.75,
      gpqa: 0.64,
    },
    performance: {
      intelligenceScore: 31.9,
    },
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'ministral-14b-2512': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Ministral 3 14B',
    description: 'A powerful model offering best-in-class text and vision capabilities.',
    benchmarks: {
      intelligence: 30.5,
      coding: 21,
      math: 30,
      mmluPro: 0.69,
      gpqa: 0.57,
    },
    performance: {
      intelligenceScore: 30.5,
    },
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'ministral-14b-latest': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Ministral 3 14B',
    description: 'A powerful model offering best-in-class text and vision capabilities.',
    pricing: { input: 0.2, output: 0.2 },
    benchmarks: {
      intelligence: 1,
    },
    performance: {
      intelligenceScore: 1,
    },
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'ministral-3b-2512': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Ministral 3 3B',
    description: 'A tiny and efficient model offering best-in-class text and vision capabilities.',
    benchmarks: {
      intelligence: 21.8,
      coding: 13,
      math: 22,
      mmluPro: 0.52,
      gpqa: 0.36,
    },
    performance: {
      intelligenceScore: 21.8,
    },
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'ministral-3b-latest': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Ministral 3 3B',
    description: 'A tiny and efficient model offering best-in-class text and vision capabilities.',
    pricing: { input: 0.1, output: 0.1 },
    benchmarks: {
      intelligence: 12.7,
      coding: 6.9,
      math: 0.3,
      mmluPro: 0.44,
      gpqa: 0.32,
    },
    performance: {
      intelligenceScore: 12.7,
    },
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'ministral-8b-2512': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Ministral 3 8B',
    description: 'A powerful and efficient model offering best-in-class text and vision capabilities.',
    benchmarks: {
      intelligence: 28.2,
      coding: 18.4,
      math: 31.7,
      mmluPro: 0.64,
      gpqa: 0.47,
    },
    performance: {
      intelligenceScore: 28.2,
    },
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'ministral-8b-latest': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Ministral 3 8B',
    description: 'A powerful and efficient model offering best-in-class text and vision capabilities.',
    pricing: { input: 0.15, output: 0.15 },
    benchmarks: {
      intelligence: 7,
      mmluPro: 0.41,
      gpqa: 0.3,
    },
    performance: {
      intelligenceScore: 7,
    },
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'mistral-embed': {
    type: 'embedding' as const,
    provider: 'mistral' as const,
    displayName: 'Mistral Embed',
    description: 'Our state-of-the-art semantic for extracting representation of code extracts',
    pricing: { input: 0.1, output: 0 },
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: false,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'mistral-large-2512': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Mistral Large 3',
    description: 'A state-of-the-art, open-weight, general-purpose multimodal model.',
    benchmarks: {
      intelligence: 2.6,
      mmluPro: 0.39,
      gpqa: 0.29,
    },
    performance: {
      intelligenceScore: 2.6,
    },
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'mistral-large-latest': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Mistral Large',
    description: 'Top-tier large model for high-complexity tasks.',
    pricing: { input: 0.5, output: 1.5 },
    benchmarks: {
      intelligence: 11.9,
      mmluPro: 0.52,
      gpqa: 0.35,
    },
    performance: {
      intelligenceScore: 11.9,
    },
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'mistral-medium-2508': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Mistral Medium 3.1',
    description: 'Our frontier-class multimodal model released August 2025.',
    benchmarks: {
      intelligence: 33.6,
      coding: 25.6,
      math: 30.3,
      mmluPro: 0.76,
      gpqa: 0.58,
    },
    performance: {
      intelligenceScore: 33.6,
    },
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'mistral-medium-latest': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Mistral Medium 3.1',
    description: 'Our frontier-class multimodal model released August 2025.',
    pricing: { input: 0.4, output: 2 },
    benchmarks: {
      intelligence: 8.4,
      mmluPro: 0.49,
      gpqa: 0.35,
    },
    performance: {
      intelligenceScore: 8.4,
    },
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'mistral-small-2501': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Mistral Small',
    description: 'Efficient model for various tasks.',
    benchmarks: {
      intelligence: 8.5,
      mmluPro: 0.42,
      gpqa: 0.3,
    },
    performance: {
      intelligenceScore: 8.5,
    },
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'mistral-small-2506': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Mistral Small 3.2',
    description: 'An update to our previous small model, released June 2025.',
    benchmarks: {
      intelligence: 24.9,
      coding: 18.3,
      math: 3.7,
      mmluPro: 0.66,
      gpqa: 0.45,
    },
    performance: {
      intelligenceScore: 24.9,
    },
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'mistral-small-latest': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Mistral Small',
    description: 'An efficient model offering best-in-class text and vision capabilities',
    pricing: { input: 0.1, output: 0.3 },
    benchmarks: {
      intelligence: 24.9,
      coding: 18.3,
      math: 3.7,
      mmluPro: 0.66,
      gpqa: 0.45,
    },
    performance: {
      intelligenceScore: 24.9,
    },
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'mistral-tiny-2407': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Mistral Nemo 12B',
    description: 'Our best multilingual open source model released July 2024.',
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'mistral-tiny-latest': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Mistral Tiny',
    description: 'Compact model for efficient inference.',
    pricing: { input: 0.14, output: 0.42 },
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'open-mistral-7b': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Mistral 7B',
    description: 'Open source model for general purpose tasks.',
    benchmarks: {
      intelligence: 1,
      mmluPro: 0.25,
      gpqa: 0.18,
    },
    performance: {
      intelligenceScore: 1,
    },
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'open-mistral-nemo': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Mistral Nemo 12B',
    description: 'Our best multilingual open source model released July 2024.',
    pricing: { input: 0.15, output: 0.15 },
    benchmarks: {
      intelligence: 1,
      mmluPro: 0.25,
      gpqa: 0.18,
    },
    performance: {
      intelligenceScore: 1,
    },
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'pixtral-12b-2409': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Pixtral 12B',
    description: 'Multimodal model with vision capabilities.',
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'pixtral-12b-latest': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Pixtral 12B',
    description: 'Multimodal model with vision capabilities.',
    pricing: { input: 0.15, output: 0.15 },
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'pixtral-large-2411': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Pixtral Large',
    description: 'Our first frontier-class multimodal model released November 2024.',
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'pixtral-large-latest': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Pixtral Large',
    description: 'Our first frontier-class multimodal model released November 2024.',
    pricing: { input: 2, output: 6 },
    benchmarks: {
      intelligence: 25,
      math: 2.3,
      mmluPro: 0.7,
      gpqa: 0.51,
    },
    performance: {
      intelligenceScore: 25,
    },
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'voxtral-mini-2507': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Voxtral Mini',
    description: 'A mini version of our first audio input model.',
    context: {
      input: {
        text: true,
        audio: true,
        image: false,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'voxtral-mini-latest': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Voxtral Mini',
    description: 'A mini version of our first audio input model',
    pricing: { input: 0.04, output: 0.04 },
    context: {
      input: {
        text: true,
        audio: true,
        image: false,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'voxtral-small-2507': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Voxtral Small',
    description: 'Our first model with audio input capabilities for instruct use cases.',
    context: {
      input: {
        text: true,
        audio: true,
        image: false,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'voxtral-small-latest': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Voxtral Small',
    description: 'Our first model with audio input capabilities for instruct use cases',
    pricing: { input: 0.1, output: 0.3 },
    context: {
      input: {
        text: true,
        audio: true,
        image: false,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'dall-e-2': {
    type: 'image' as const,
    provider: 'openai' as const,
    displayName: 'DALL·E 2',
    description: 'Our first image generation model',
    pricing: { input: 0, output: 0 },
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: false,
        audio: false,
        image: true,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'dall-e-3': {
    type: 'image' as const,
    provider: 'openai' as const,
    displayName: 'DALL·E 3',
    description: 'Previous generation image generation model',
    pricing: { input: 0, output: 0 },
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: false,
        audio: false,
        image: true,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gpt-3.5-turbo': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-3.5 Turbo',
    description: 'Legacy GPT model for cheaper chat and non-chat tasks',
    pricing: { input: 0.5, output: 1.5 },
    contextLength: 16385,
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gpt-4-turbo': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4 Turbo',
    description: 'An older high-intelligence GPT model',
    pricing: { input: 10, output: 30 },
    benchmarks: {
      intelligence: 21.5,
      coding: 13.1,
    },
    performance: {
      intelligenceScore: 21.5,
    },
    contextLength: 128000,
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gpt-4.1': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4.1',
    description: 'Smartest non-reasoning model',
    pricing: { input: 2, output: 8 },
    benchmarks: {
      intelligence: 43.4,
      coding: 32.2,
      math: 34.7,
      mmluPro: 0.81,
      gpqa: 0.67,
    },
    performance: {
      intelligenceScore: 43.4,
    },
    contextLength: 128000,
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gpt-4.1-mini': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4.1 mini',
    description: 'Smaller, faster version of GPT-4.1',
    pricing: { input: 0.4, output: 1.6 },
    benchmarks: {
      intelligence: 42.5,
      coding: 31.9,
      math: 46.3,
      mmluPro: 0.78,
      gpqa: 0.66,
    },
    performance: {
      intelligenceScore: 42.5,
    },
    contextLength: 128000,
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gpt-4.1-nano-2025-04-14': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4.1 nano',
    description: 'Fastest, most cost-efficient version of GPT-4.1',
    pricing: { input: 0.1, output: 0.4 },
    benchmarks: {
      intelligence: 27.3,
      coding: 20.7,
      math: 24,
      mmluPro: 0.66,
      gpqa: 0.51,
    },
    performance: {
      intelligenceScore: 27.3,
    },
    contextLength: 128000,
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gpt-4o': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o',
    description: 'Fast, intelligent, flexible GPT model',
    pricing: { input: 2.5, output: 10 },
    benchmarks: {
      intelligence: 26,
      coding: 20.1,
      math: 15.3,
      mmluPro: 0.75,
      gpqa: 0.57,
    },
    performance: {
      intelligenceScore: 26,
    },
    contextLength: 128000,
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gpt-4o-audio-preview': {
    type: 'audio' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o Audio',
    description: 'GPT-4o models capable of audio inputs and outputs',
    pricing: { input: 2.5, output: 10 },
    contextLength: 128000,
    context: {
      input: {
        text: true,
        audio: true,
        image: false,
        video: false
      },
      output: {
        text: true,
        audio: true,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gpt-4o-mini': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o mini',
    description: 'Fast, affordable small model for focused tasks',
    pricing: { input: 0.15, output: 0.6 },
    benchmarks: {
      intelligence: 18.9,
    },
    performance: {
      intelligenceScore: 18.9,
    },
    contextLength: 128000,
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gpt-4o-mini-search-preview': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o mini Search Preview',
    description: 'Fast, affordable small model for web search',
    pricing: { input: 0.15, output: 0.6 },
    contextLength: 128000,
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gpt-4o-mini-transcribe': {
    type: 'audio' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o mini Transcribe',
    description: 'Speech-to-text model powered by GPT-4o mini',
    pricing: { input: 1.25, output: 5 },
    context: {
      input: {
        text: false,
        audio: true,
        image: false,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gpt-4o-mini-transcribe-2025-12-15': {
    type: 'audio' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o mini Transcribe',
    description: 'Speech-to-text model powered by GPT-4o mini',
    pricing: { input: 1.25, output: 5 },
    context: {
      input: {
        text: false,
        audio: true,
        image: false,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gpt-4o-mini-tts': {
    type: 'tts' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o mini TTS',
    description: 'Text-to-speech model powered by GPT-4o mini',
    pricing: { input: 0.6, output: 0 },
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: false,
        audio: true,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gpt-4o-realtime-preview-2025-06-03': {
    type: 'audio' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o Realtime',
    description: 'Model capable of realtime text and audio inputs and outputs',
    pricing: { input: 5, output: 20 },
    contextLength: 128000,
    context: {
      input: {
        text: true,
        audio: true,
        image: false,
        video: false
      },
      output: {
        text: true,
        audio: true,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gpt-4o-search-preview': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o Search Preview',
    description: 'GPT model for web search in Chat Completions',
    pricing: { input: 2.5, output: 10 },
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gpt-4o-transcribe': {
    type: 'audio' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o Transcribe',
    description: 'Speech-to-text model powered by GPT-4o',
    pricing: { input: 2.5, output: 10 },
    context: {
      input: {
        text: false,
        audio: true,
        image: false,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gpt-4o-transcribe-diarize': {
    type: 'audio' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o Transcribe Diarize',
    description: 'Transcription model that identifies who\'s speaking when',
    pricing: { input: 2.5, output: 10 },
    context: {
      input: {
        text: false,
        audio: true,
        image: false,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gpt-5-mini-2025-08-07': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5 mini',
    description: 'A faster, cost-efficient version of GPT-5 for well-defined tasks',
    pricing: { input: 0.25, output: 2 },
    benchmarks: {
      intelligence: 66.4,
      coding: 49.2,
      math: 91.7,
      mmluPro: 0.87,
      gpqa: 0.84,
    },
    performance: {
      intelligenceScore: 66.4,
    },
    contextLength: 128000,
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gpt-5-nano-2025-08-07': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5 nano',
    description: 'Fastest, most cost-efficient version of GPT-5',
    pricing: { input: 0.05, output: 0.4 },
    benchmarks: {
      intelligence: 29.1,
      coding: 27.5,
      math: 27.3,
      mmluPro: 0.56,
      gpqa: 0.43,
    },
    performance: {
      intelligenceScore: 29.1,
    },
    contextLength: 128000,
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gpt-5-search-api-2025-10-14': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5 Search API',
    description: 'GPT-5 model optimized for web search capabilities',
    pricing: { input: 1.25, output: 10 },
    benchmarks: {
      intelligence: 68.5,
      coding: 53.5,
      math: 98.7,
      mmluPro: 0.87,
      gpqa: 0.84,
    },
    performance: {
      intelligenceScore: 68.5,
    },
    contextLength: 128000,
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gpt-5.1-2025-11-13': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5.1',
    description: 'The best model for coding and agentic tasks with configurable reasoning effort',
    pricing: { input: 1.25, output: 10 },
    benchmarks: {
      intelligence: 37,
      coding: 29.2,
      math: 73,
      mmluPro: 0.79,
      gpqa: 0.68,
    },
    performance: {
      intelligenceScore: 37,
    },
    contextLength: 200000,
    context: {
      input: {
        text: true,
        audio: false,
        image: true,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gpt-audio-mini-2025-10-06': {
    type: 'audio' as const,
    provider: 'openai' as const,
    displayName: 'gpt-audio-mini',
    description: 'A cost-efficient version of GPT Audio',
    pricing: { input: 0.6, output: 2.4 },
    contextLength: 128000,
    context: {
      input: {
        text: true,
        audio: true,
        image: false,
        video: false
      },
      output: {
        text: true,
        audio: true,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gpt-audio-mini-2025-12-15': {
    type: 'audio' as const,
    provider: 'openai' as const,
    displayName: 'gpt-audio-mini',
    description: 'A cost-efficient version of GPT Audio',
    pricing: { input: 0.6, output: 2.4 },
    contextLength: 128000,
    context: {
      input: {
        text: true,
        audio: true,
        image: false,
        video: false
      },
      output: {
        text: true,
        audio: true,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gpt-image-1.5': {
    type: 'image' as const,
    provider: 'openai' as const,
    displayName: 'GPT Image 1.5',
    description: 'State-of-the-art image generation model',
    pricing: { input: 5, output: 10 },
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: false,
        audio: false,
        image: true,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gpt-realtime-2025-08-28': {
    type: 'audio' as const,
    provider: 'openai' as const,
    displayName: 'gpt-realtime',
    description: 'Model capable of realtime text and audio inputs and outputs',
    pricing: { input: 4, output: 16 },
    contextLength: 128000,
    context: {
      input: {
        text: true,
        audio: true,
        image: false,
        video: false
      },
      output: {
        text: true,
        audio: true,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'gpt-realtime-mini-2025-10-06': {
    type: 'audio' as const,
    provider: 'openai' as const,
    displayName: 'gpt-realtime-mini',
    description: 'A cost-efficient version of GPT Realtime',
    pricing: { input: 0.6, output: 2.4 },
    contextLength: 128000,
    context: {
      input: {
        text: true,
        audio: true,
        image: false,
        video: false
      },
      output: {
        text: true,
        audio: true,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'text-embedding-3-large': {
    type: 'embedding' as const,
    provider: 'openai' as const,
    displayName: 'text-embedding-3-large',
    description: 'Most capable embedding model',
    pricing: { input: 0.13, output: 0 },
    contextLength: 8191,
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: false,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'text-embedding-3-small': {
    type: 'embedding' as const,
    provider: 'openai' as const,
    displayName: 'text-embedding-3-small',
    description: 'Small embedding model',
    pricing: { input: 0.02, output: 0 },
    contextLength: 8191,
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: false,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'text-embedding-ada-002': {
    type: 'embedding' as const,
    provider: 'openai' as const,
    displayName: 'text-embedding-ada-002',
    description: 'Older embedding model',
    pricing: { input: 0.1, output: 0 },
    contextLength: 8191,
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: false,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'tts-1': {
    type: 'tts' as const,
    provider: 'openai' as const,
    displayName: 'TTS-1',
    description: 'Text-to-speech model optimized for speed',
    pricing: { input: 0, output: 0 },
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: false,
        audio: true,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'tts-1-hd': {
    type: 'tts' as const,
    provider: 'openai' as const,
    displayName: 'TTS-1 HD',
    description: 'Text-to-speech model optimized for quality',
    pricing: { input: 0, output: 0 },
    context: {
      input: {
        text: true,
        audio: false,
        image: false,
        video: false
      },
      output: {
        text: false,
        audio: true,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  },
  'whisper-1': {
    type: 'audio' as const,
    provider: 'openai' as const,
    displayName: 'Whisper',
    description: 'General-purpose speech recognition model',
    pricing: { input: 0, output: 0 },
    context: {
      input: {
        text: false,
        audio: true,
        image: false,
        video: false
      },
      output: {
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-02',
  }
} as const;

export type ModelId = keyof typeof MODEL_REGISTRY;

// Legacy type aliases for backwards compatibility
export type SupportedModel = ModelId;
export type Provider = SupportedProvider;
