// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
// Generated at: 2026-03-01T17:34:12.402Z
// Source: Internal Model Registry API
// To update: Run `pnpm sync:registry`
//
// Registry version: 2026-03-01
// Last sync: 2026-03-01T17:34:12.396Z
// Total models: 198

// Providers we support with adapters
export const SUPPORTED_PROVIDERS = ['openai', 'anthropic', 'google', 'mistral', 'cohere'] as const;
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

export type ModelSubtype = 'reasoning' | 'code' | 'realtime';

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
  'claude-3-haiku-20240307': {
    type: 'chat' as const,
    provider: 'anthropic' as const,
    displayName: 'Claude Haiku 3',
    description: 'Legacy model - recommend migrating to Claude 4.5',
    pricing: { input: 0.25, output: 1.25 },
    benchmarks: {
      intelligence: 1,
      coding: 7.8,
      mmluPro: 0.43,
      gpqa: 0.33,
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
    lastUpdated: '2026-03-01',
  },
  'claude-haiku-4-5-20251001': {
    type: 'chat' as const,
    provider: 'anthropic' as const,
    displayName: 'Claude Haiku 4.5',
    description: 'Our fastest model with near-frontier intelligence',
    pricing: { input: 1, output: 5 },
    benchmarks: {
      intelligence: 7.4,
      coding: 7.8,
      mmluPro: 0.43,
      gpqa: 0.33,
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
    lastUpdated: '2026-03-01',
  },
  'claude-opus-4-1-20250805': {
    type: 'chat' as const,
    provider: 'anthropic' as const,
    displayName: 'Claude Opus 4.1',
    description: 'Legacy model - recommend migrating to Claude 4.5',
    pricing: { input: 15, output: 75 },
    benchmarks: {
      intelligence: 9.3,
      coding: 14,
      mmluPro: 0.5,
      gpqa: 0.32,
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
    lastUpdated: '2026-03-01',
  },
  'claude-opus-4-20250514': {
    type: 'chat' as const,
    provider: 'anthropic' as const,
    displayName: 'Claude Opus 4',
    description: 'Original Claude Opus 4 model',
    pricing: { input: 15, output: 75 },
    contextLength: 200000,
    context: {
      input: {
        text: true,
        image: true
      },
      output: {
        text: true
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'claude-opus-4-5-20251101': {
    type: 'chat' as const,
    provider: 'anthropic' as const,
    displayName: 'Claude Opus 4.5',
    description: 'Premium model combining maximum intelligence with practical performance',
    pricing: { input: 5, output: 25 },
    benchmarks: {
      intelligence: 43,
      coding: 42.9,
      math: 62.7,
      mmluPro: 0.89,
      gpqa: 0.81,
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
    lastUpdated: '2026-03-01',
  },
  'claude-opus-4-6': {
    type: 'chat' as const,
    provider: 'anthropic' as const,
    displayName: 'Claude Opus 4.6',
    description: 'Most intelligent model for building agents and coding',
    pricing: { input: 5, output: 25 },
    benchmarks: {
      intelligence: 93,
      mmluPro: 82,
      gpqa: 91.3,
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
    lastUpdated: '2026-03-01',
  },
  'claude-sonnet-4-20250514': {
    type: 'chat' as const,
    provider: 'anthropic' as const,
    displayName: 'Claude Sonnet 4',
    description: 'Legacy model - recommend migrating to Claude 4.5',
    pricing: { input: 3, output: 15 },
    benchmarks: {
      intelligence: 33,
      coding: 30.6,
      math: 38,
      mmluPro: 0.84,
      gpqa: 0.68,
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
    lastUpdated: '2026-03-01',
  },
  'claude-sonnet-4-5-20250929': {
    type: 'chat' as const,
    provider: 'anthropic' as const,
    displayName: 'Claude Sonnet 4.5',
    description: 'Our smart model for complex agents and coding',
    pricing: { input: 3, output: 15 },
    benchmarks: {
      intelligence: 37.1,
      coding: 33.5,
      math: 37,
      mmluPro: 0.86,
      gpqa: 0.73,
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
    lastUpdated: '2026-03-01',
  },
  'claude-sonnet-4-6': {
    type: 'chat' as const,
    provider: 'anthropic' as const,
    displayName: 'Claude Sonnet 4.6',
    description: 'Optimal balance of intelligence, cost, and speed',
    pricing: { input: 3, output: 15 },
    benchmarks: {
      intelligence: 93,
      mmluPro: 79.1,
      gpqa: 89.9,
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
    lastUpdated: '2026-03-01',
  },
  'deep-research-pro-preview-12-2025': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: '',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gemini-2.0-flash': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemini 2.0 Flash',
    description: 'Gemini 2.0 Flash delivers next-gen features and improved capabilities, including superior speed, native tool use, and a 1M token context window.',
    pricing: { input: 0.15, output: 0.6 },
    benchmarks: {
      intelligence: 12.3,
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
    lastUpdated: '2026-03-01',
  },
  'gemini-2.0-flash-001': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemini 2.0 Flash 001',
    description: 'Stable version of Gemini 2.0 Flash, fast and versatile multimodal model',
    contextLength: 1048576,
    context: {
      input: {
        text: true,
        audio: true,
        image: true,
        video: true
      },
      output: {
        text: true
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gemini-2.0-flash-exp-image-generation': {
    type: 'image' as const,
    provider: 'google' as const,
    displayName: 'Gemini 2.0 Flash Image Generation (Experimental)',
    description: 'Experimental Gemini 2.0 Flash with image generation capabilities',
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
        image: true,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gemini-2.0-flash-lite': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemini 2.0 Flash-Lite',
    description: 'A Gemini 2.0 Flash model optimized for cost efficiency and low latency.',
    pricing: { input: 0.075, output: 0.3 },
    benchmarks: {
      intelligence: 14.7,
      mmluPro: 0.72,
      gpqa: 0.54,
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
    lastUpdated: '2026-03-01',
  },
  'gemini-2.0-flash-lite-001': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemini 2.0 Flash-Lite 001',
    description: 'Stable version of Gemini 2.0 Flash-Lite',
    contextLength: 1048576,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gemini-2.5-computer-use-preview-10-2025': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: '',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gemini-2.5-flash': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemini 2.5 Flash',
    subtype: 'reasoning',
    description: 'Stable version of Gemini 2.5 Flash with thinking capabilities',
    pricing: { input: 0.3, output: 2.5 },
    benchmarks: {
      intelligence: 25.5,
      coding: 22.1,
      math: 56.7,
      mmluPro: 0.84,
      gpqa: 0.77,
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
    lastUpdated: '2026-03-01',
  },
  'gemini-2.5-flash-image': {
    type: 'image' as const,
    provider: 'google' as const,
    displayName: 'Gemini 2.5 Flash Image',
    description: 'Gemini 2.5 Flash with image generation capabilities',
    pricing: { input: 0.3, output: 30 },
    contextLength: 32768,
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
    lastUpdated: '2026-03-01',
  },
  'gemini-2.5-flash-lite': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemini 2.5 Flash-Lite',
    subtype: 'reasoning',
    description: 'Stable version of Gemini 2.5 Flash-Lite with thinking capabilities',
    pricing: { input: 0.1, output: 0.4 },
    benchmarks: {
      intelligence: 17.4,
      coding: 9.5,
      math: 53.3,
      mmluPro: 0.76,
      gpqa: 0.63,
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
    lastUpdated: '2026-03-01',
  },
  'gemini-2.5-flash-lite-preview-09-2025': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemini 2.5 Flash-Lite Preview (Sep 2025)',
    subtype: 'reasoning',
    description: 'Preview release of Gemini 2.5 Flash-Lite, September 2025',
    performance: {
      outputTokensPerSecond: 496,
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
    lastUpdated: '2026-03-01',
  },
  'gemini-2.5-flash-native-audio-latest': {
    type: 'audio' as const,
    provider: 'google' as const,
    displayName: '',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gemini-2.5-flash-native-audio-preview-09-2025': {
    type: 'audio' as const,
    provider: 'google' as const,
    displayName: 'Gemini 2.5 Flash Native Audio Preview (Sep 2025)',
    description: 'Gemini 2.5 Flash native audio preview, September 2025',
    contextLength: 131072,
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
    lastUpdated: '2026-03-01',
  },
  'gemini-2.5-flash-native-audio-preview-12-2025': {
    type: 'audio' as const,
    provider: 'google' as const,
    displayName: 'Gemini 2.5 Flash Native Audio Preview (Dec 2025)',
    description: 'Gemini 2.5 Flash native audio preview, December 2025',
    contextLength: 131072,
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
    lastUpdated: '2026-03-01',
  },
  'gemini-2.5-flash-preview-tts': {
    type: 'tts' as const,
    provider: 'google' as const,
    displayName: 'Gemini 2.5 Flash Preview TTS',
    description: 'Gemini 2.5 Flash Preview TTS',
    pricing: { input: 0.5, output: 10 },
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
    lastUpdated: '2026-03-01',
  },
  'gemini-2.5-pro': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemini 2.5 Pro',
    subtype: 'reasoning',
    description: 'Stable release of Gemini 2.5 Pro with thinking capabilities',
    pricing: { input: 1.25, output: 10 },
    benchmarks: {
      intelligence: 30.3,
      coding: 46.7,
      mmluPro: 0.86,
      gpqa: 0.84,
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
    lastUpdated: '2026-03-01',
  },
  'gemini-2.5-pro-preview-tts': {
    type: 'tts' as const,
    provider: 'google' as const,
    displayName: 'Gemini 2.5 Pro Preview TTS',
    description: 'Gemini 2.5 Pro Preview TTS',
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
    lastUpdated: '2026-03-01',
  },
  'gemini-3-flash-preview': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemini 3 Flash Preview',
    subtype: 'reasoning',
    description: 'Gemini 3 Flash Preview with thinking capabilities',
    pricing: { input: 0.5, output: 3 },
    benchmarks: {
      intelligence: 35.1,
      coding: 37.8,
      math: 55.7,
      mmluPro: 0.88,
      gpqa: 0.81,
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
    lastUpdated: '2026-03-01',
  },
  'gemini-3-pro-image-preview': {
    type: 'image' as const,
    provider: 'google' as const,
    displayName: 'Gemini 3 Pro Image Preview',
    description: 'Gemini 3 Pro with image generation capabilities',
    pricing: { input: 2, output: 12 },
    unitPricing: {
      'output-4k': 240,
      'input-image': 1.1,
      'output-1k-2k': 134
    },
    contextLength: 131072,
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
    lastUpdated: '2026-03-01',
  },
  'gemini-3-pro-preview': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemini 3 Pro Preview',
    subtype: 'reasoning',
    description: 'Gemini 3 Pro Preview with thinking capabilities',
    pricing: { input: 2, output: 12 },
    benchmarks: {
      intelligence: 95,
      mmluPro: 85,
      gpqa: 91.9,
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
        image: true,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gemini-3.1-flash-image-preview': {
    type: 'image' as const,
    provider: 'google' as const,
    displayName: 'Gemini 3.1 Flash Image Preview',
    description: 'Gemini 3.1 Flash with image generation capabilities',
    pricing: { input: 0.5, output: 3 },
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
    lastUpdated: '2026-03-01',
  },
  'gemini-3.1-pro-preview': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemini 3.1 Pro Preview',
    subtype: 'reasoning',
    description: 'Gemini 3.1 Pro Preview with thinking capabilities',
    pricing: { input: 2, output: 12 },
    benchmarks: {
      intelligence: 95,
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
        image: true,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gemini-3.1-pro-preview-customtools': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemini 3.1 Pro Preview Custom Tools',
    subtype: 'reasoning',
    description: 'Gemini 3.1 Pro Preview optimized for custom tool usage',
    pricing: { input: 2, output: 12 },
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
        image: true,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gemini-embedding-001': {
    type: 'embeddings' as const,
    provider: 'google' as const,
    displayName: 'Gemini Embedding 001',
    description: 'Google embedding model for distributed text representations',
    contextLength: 2048,
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
    lastUpdated: '2026-03-01',
  },
  'gemini-robotics-er-1.5-preview': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemini Robotics ER 1.5 Preview',
    pricing: { input: 0.3, output: 2.5 },
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
    lastUpdated: '2026-03-01',
  },
  'gemma-3-12b-it': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemma 3 12B',
    description: 'Google Gemma 3 12B instruction-tuned model',
    pricing: { input: 0, output: 0 },
    benchmarks: {
      intelligence: 20.4,
      coding: 10.6,
      math: 18.3,
      mmluPro: 0.6,
      gpqa: 0.35,
    },
    contextLength: 32768,
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
    lastUpdated: '2026-03-01',
  },
  'gemma-3-1b-it': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemma 3 1B',
    description: 'Google Gemma 3 1B instruction-tuned model',
    pricing: { input: 0, output: 0 },
    benchmarks: {
      intelligence: 12.5,
      mmluPro: 0.48,
      gpqa: 0.28,
    },
    contextLength: 32768,
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
    lastUpdated: '2026-03-01',
  },
  'gemma-3-27b-it': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemma 3 27B',
    description: 'Google Gemma 3 27B instruction-tuned model',
    pricing: { input: 0, output: 0 },
    benchmarks: {
      intelligence: 10.1,
      mmluPro: 0.48,
      gpqa: 0.28,
    },
    contextLength: 131072,
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
    lastUpdated: '2026-03-01',
  },
  'gemma-3-4b-it': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemma 3 4B',
    description: 'Google Gemma 3 4B instruction-tuned model',
    pricing: { input: 0, output: 0 },
    benchmarks: {
      intelligence: 15.5,
      coding: 8.3,
      math: 14.3,
      mmluPro: 0.49,
      gpqa: 0.3,
    },
    contextLength: 32768,
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
    lastUpdated: '2026-03-01',
  },
  'gemma-3n-e2b-it': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemma 3n E2B',
    description: 'Google Gemma 3n E2B instruction-tuned model',
    contextLength: 8192,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gemma-3n-e4b-it': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemma 3n E4B',
    description: 'Google Gemma 3n E4B instruction-tuned model',
    contextLength: 8192,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'imagen-4.0-fast-generate-001': {
    type: 'image' as const,
    provider: 'google' as const,
    displayName: 'Imagen 4.0 Fast',
    unitPricing: 0.02,
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
    lastUpdated: '2026-03-01',
  },
  'imagen-4.0-generate-001': {
    type: 'image' as const,
    provider: 'google' as const,
    displayName: 'Imagen 4',
    description: 'Google Imagen 4.0 image generation model',
    unitPricing: 0.04,
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
    lastUpdated: '2026-03-01',
  },
  'imagen-4.0-ultra-generate-001': {
    type: 'image' as const,
    provider: 'google' as const,
    displayName: 'Imagen 4.0 Ultra',
    unitPricing: 0.06,
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
    lastUpdated: '2026-03-01',
  },
  'veo-2.0-generate-001': {
    type: 'video' as const,
    provider: 'google' as const,
    displayName: 'Veo 2',
    description: 'Google Veo 2 video generation model',
    unitPricing: 0.35,
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
    lastUpdated: '2026-03-01',
  },
  'veo-3.0-fast-generate-001': {
    type: 'video' as const,
    provider: 'google' as const,
    displayName: 'Veo 3 Fast',
    description: 'Google Veo 3 fast video generation model',
    unitPricing: 0.15,
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
    lastUpdated: '2026-03-01',
  },
  'veo-3.0-generate-001': {
    type: 'video' as const,
    provider: 'google' as const,
    displayName: 'Veo 3',
    description: 'Google Veo 3 video generation model',
    unitPricing: 0.4,
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
    lastUpdated: '2026-03-01',
  },
  'veo-3.1-fast-generate-preview': {
    type: 'video' as const,
    provider: 'google' as const,
    displayName: 'Veo 3.1 Fast',
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
    lastUpdated: '2026-03-01',
  },
  'veo-3.1-generate-preview': {
    type: 'video' as const,
    provider: 'google' as const,
    displayName: 'Veo 3.1',
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
    lastUpdated: '2026-03-01',
  },
  'codestral-2412': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Codestral (Dec 2024)',
    subtype: 'code',
    description: 'Code generation model released December 2024',
    pricing: { input: 0.3, output: 0.9 },
    benchmarks: {
      intelligence: 68.5,
      coding: 53.5,
      math: 98.7,
      mmluPro: 0.87,
      gpqa: 0.84,
    },
    contextLength: 256000,
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
    lastUpdated: '2026-03-01',
  },
  'codestral-2508': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Codestral (Aug 2025)',
    subtype: 'code',
    description: 'Cutting-edge language model for coding released August 2025',
    pricing: { input: 0.3, output: 0.9 },
    contextLength: 256000,
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
    lastUpdated: '2026-03-01',
  },
  'codestral-embed-2505': {
    type: 'embeddings' as const,
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
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'devstral-2512': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Devstral 2 (Dec 2025)',
    subtype: 'code',
    description: 'Latest Devstral code-agentic model',
    pricing: { input: 0.4, output: 2 },
    benchmarks: {
      intelligence: 18.6,
      coding: 15.9,
      math: 4.7,
      mmluPro: 0.71,
      gpqa: 0.49,
    },
    contextLength: 262144,
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
    lastUpdated: '2026-03-01',
  },
  'devstral-medium-2507': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Devstral Medium (2507)',
    subtype: 'code',
    description: 'Medium code-agentic model',
    pricing: { input: 0.4, output: 2 },
    contextLength: 131072,
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
    lastUpdated: '2026-03-01',
  },
  'devstral-small-2507': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Devstral Small (2507)',
    subtype: 'code',
    description: 'Small open-source code-agentic model',
    pricing: { input: 0.1, output: 0.3 },
    contextLength: 131072,
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
    lastUpdated: '2026-03-01',
  },
  'labs-devstral-small-2512': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Labs Devstral Small (2512)',
    subtype: 'code',
    description: 'Labs version of Devstral Small with vision support',
    contextLength: 262144,
    context: {
      input: {
        text: true,
        image: true
      },
      output: {
        text: true
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'labs-mistral-small-creative': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Labs Mistral Small Creative',
    description: 'Creative writing optimized Mistral Small model',
    pricing: { input: 0.1, output: 0.3 },
    contextLength: 32768,
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
    lastUpdated: '2026-03-01',
  },
  'magistral-medium-2509': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Magistral Medium',
    subtype: 'reasoning',
    description: 'Frontier-class reasoning model released September 2025',
    pricing: { input: 2, output: 6 },
    benchmarks: {
      intelligence: 18.7,
      coding: 16,
      math: 40.3,
      mmluPro: 0.75,
      gpqa: 0.68,
    },
    contextLength: 131072,
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
    lastUpdated: '2026-03-01',
  },
  'magistral-small-2509': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Magistral Small',
    subtype: 'reasoning',
    description: 'Efficient reasoning model released September 2025',
    pricing: { input: 0.5, output: 1.5 },
    benchmarks: {
      intelligence: 16.8,
      coding: 11.1,
      math: 41.3,
      mmluPro: 0.75,
      gpqa: 0.64,
    },
    contextLength: 131072,
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
    lastUpdated: '2026-03-01',
  },
  'ministral-14b-2512': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Ministral 14B',
    description: 'Ministral 3 (Tinystral) 14B Instruct',
    pricing: { input: 0.2, output: 0.2 },
    benchmarks: {
      intelligence: 16,
      coding: 10.9,
      math: 30,
      mmluPro: 0.69,
      gpqa: 0.57,
    },
    contextLength: 262144,
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
    lastUpdated: '2026-03-01',
  },
  'ministral-3b-2512': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Ministral 3B',
    description: 'Ministral 3 (Tinystral) 3B Instruct',
    pricing: { input: 0.1, output: 0.1 },
    benchmarks: {
      intelligence: 11.2,
      coding: 4.8,
      math: 22,
      mmluPro: 0.52,
      gpqa: 0.36,
    },
    contextLength: 131072,
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
    lastUpdated: '2026-03-01',
  },
  'ministral-8b-2512': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Ministral 8B',
    description: 'Ministral 3 (Tinystral) 8B Instruct',
    pricing: { input: 0.15, output: 0.15 },
    benchmarks: {
      intelligence: 14.6,
      coding: 10,
      math: 31.7,
      mmluPro: 0.64,
      gpqa: 0.47,
    },
    contextLength: 262144,
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
    lastUpdated: '2026-03-01',
  },
  'mistral-embed': {
    type: 'embeddings' as const,
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
        text: true,
        audio: false,
        image: false,
        video: false
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'mistral-large-2411': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Mistral Large (2411)',
    description: 'Top-tier reasoning model for high-complexity tasks, November 2024',
    pricing: { input: 2, output: 6 },
    contextLength: 131072,
    context: {
      input: {
        text: true
      },
      output: {
        text: true
      }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'mistral-large-2512': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Mistral Large 3 (Dec 2025)',
    description: 'Latest Mistral Large model released December 2025',
    pricing: { input: 0.5, output: 1.5 },
    benchmarks: {
      intelligence: 2.6,
      mmluPro: 0.39,
      gpqa: 0.29,
    },
    contextLength: 262144,
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
    lastUpdated: '2026-03-01',
  },
  'mistral-medium-2505': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Mistral Medium 3',
    description: 'Frontier-class multimodal model released May 2025',
    pricing: { input: 0.4, output: 2 },
    contextLength: 131072,
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
    lastUpdated: '2026-03-01',
  },
  'mistral-medium-2508': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Mistral Medium 3.1',
    description: 'Update on Mistral Medium 3 with improved capabilities',
    pricing: { input: 0.4, output: 2 },
    benchmarks: {
      intelligence: 17.6,
      coding: 13.6,
      math: 30.3,
      mmluPro: 0.76,
      gpqa: 0.58,
    },
    contextLength: 131072,
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
    lastUpdated: '2026-03-01',
  },
  'mistral-moderation-latest': {
    type: 'moderation' as const,
    provider: 'mistral' as const,
    displayName: '',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'mistral-ocr-2503': {
    type: 'ocr' as const,
    provider: 'mistral' as const,
    displayName: 'Mistral OCR (2503)',
    description: 'Mistral OCR model, March 2025 version (deprecated)',
    contextLength: 16384,
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
    deprecated: true,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'mistral-ocr-2505': {
    type: 'ocr' as const,
    provider: 'mistral' as const,
    displayName: 'Mistral OCR (2505)',
    description: 'Mistral OCR model, May 2025 version',
    contextLength: 16384,
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
    lastUpdated: '2026-03-01',
  },
  'mistral-ocr-2512': {
    type: 'ocr' as const,
    provider: 'mistral' as const,
    displayName: 'Mistral OCR (2512)',
    description: 'Mistral OCR model, December 2025 version',
    contextLength: 16384,
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
    lastUpdated: '2026-03-01',
  },
  'mistral-ocr-latest': {
    type: 'ocr' as const,
    provider: 'mistral' as const,
    displayName: '',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'mistral-small-2501': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Mistral Small 3',
    description: 'Enterprise-grade small model released January 2025',
    pricing: { input: 0.05, output: 0.08 },
    benchmarks: {
      intelligence: 14,
      coding: 13.9,
      math: 3.7,
      mmluPro: 0.66,
      gpqa: 0.45,
    },
    contextLength: 131072,
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
    lastUpdated: '2026-03-01',
  },
  'mistral-small-2506': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Mistral Small 3.2',
    description: 'Latest enterprise-grade small model released June 2025',
    pricing: { input: 0.06, output: 0.18 },
    benchmarks: {
      intelligence: 24.9,
      coding: 18.3,
      math: 3.7,
      mmluPro: 0.66,
      gpqa: 0.45,
    },
    contextLength: 131072,
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
    lastUpdated: '2026-03-01',
  },
  'mistral-tiny-2407': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Mistral Tiny (Nemo)',
    description: 'Alias for Mistral Nemo',
    pricing: { input: 0.02, output: 0.04 },
    contextLength: 131072,
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
    lastUpdated: '2026-03-01',
  },
  'open-mistral-nemo-2407': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Mistral Nemo',
    description: 'Best multilingual open source model released July 2024',
    pricing: { input: 0.02, output: 0.04 },
    benchmarks: {
      intelligence: 7.4,
      mmluPro: 0.25,
      gpqa: 0.18,
    },
    contextLength: 131072,
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
    lastUpdated: '2026-03-01',
  },
  'pixtral-12b-2409': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Pixtral 12B',
    description: 'Multimodal model with vision capabilities',
    pricing: { input: 0.15, output: 0.15 },
    contextLength: 131072,
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
    lastUpdated: '2026-03-01',
  },
  'pixtral-large-2411': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Pixtral Large',
    description: 'Large multimodal model with vision capabilities',
    pricing: { input: 2, output: 6 },
    benchmarks: {
      intelligence: 14,
      math: 2.3,
      mmluPro: 0.7,
      gpqa: 0.51,
    },
    contextLength: 131072,
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
    lastUpdated: '2026-03-01',
  },
  'voxtral-mini-2507': {
    type: 'stt' as const,
    provider: 'mistral' as const,
    displayName: 'Voxtral Mini (2507)',
    description: 'Voxtral Mini transcription model, July 2025 version',
    contextLength: 16384,
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
    lastUpdated: '2026-03-01',
  },
  'voxtral-mini-2602': {
    type: 'stt' as const,
    provider: 'mistral' as const,
    displayName: 'Voxtral Mini (2602)',
    description: 'Voxtral Mini transcription model, February 2026 version',
    contextLength: 16384,
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
    lastUpdated: '2026-03-01',
  },
  'voxtral-mini-latest': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Voxtral Mini',
    description: 'A mini version of our first audio input model.',
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
    lastUpdated: '2026-03-01',
  },
  'voxtral-mini-transcribe-2507': {
    type: 'stt' as const,
    provider: 'mistral' as const,
    displayName: '',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'voxtral-small-2507': {
    type: 'audio' as const,
    provider: 'mistral' as const,
    displayName: 'Voxtral Small',
    description: 'Small audio understanding model released July 2025',
    pricing: { input: 0.1, output: 0.3 },
    contextLength: 32768,
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
    lastUpdated: '2026-03-01',
  },
  'babbage-002': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'Babbage 002',
    description: 'Legacy GPT-3 Babbage model',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'chatgpt-image-latest': {
    type: 'image' as const,
    provider: 'openai' as const,
    displayName: 'ChatGPT Image Latest',
    description: 'Latest ChatGPT image generation model',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'dall-e-2': {
    type: 'image' as const,
    provider: 'openai' as const,
    displayName: 'DALL-E 2',
    description: 'OpenAI DALL-E 2 image generation',
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
    lastUpdated: '2026-03-01',
  },
  'dall-e-3': {
    type: 'image' as const,
    provider: 'openai' as const,
    displayName: 'DALL·E 3',
    description: 'Previous generation image generation model',
    unitPricing: {
      'hd-1024x1024': 0.08,
      'hd-1024x1792': 0.12,
      'hd-1792x1024': 0.12,
      'standard-1024x1024': 0.04,
      'standard-1024x1792': 0.08,
      'standard-1792x1024': 0.08
    },
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
    lastUpdated: '2026-03-01',
  },
  'davinci-002': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'Davinci 002',
    description: 'Legacy GPT-3 Davinci model',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
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
    lastUpdated: '2026-03-01',
  },
  'gpt-3.5-turbo-0125': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-3.5 Turbo (0125)',
    description: 'GPT-3.5 Turbo January 2024 snapshot',
    contextLength: 16385,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-3.5-turbo-1106': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-3.5 Turbo (1106)',
    description: 'GPT-3.5 Turbo November 2023 snapshot',
    contextLength: 16385,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-3.5-turbo-16k': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-3.5 Turbo',
    description: 'Legacy GPT model for cheaper chat and non-chat tasks',
    pricing: { input: 3, output: 4 },
    contextLength: 16384,
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
    lastUpdated: '2026-03-01',
  },
  'gpt-3.5-turbo-instruct': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-3.5 Turbo Instruct',
    description: 'GPT-3.5 Turbo instruct-tuned model',
    contextLength: 4096,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-3.5-turbo-instruct-0914': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-3.5 Turbo Instruct (0914)',
    description: 'GPT-3.5 Turbo instruct September 2023 snapshot',
    contextLength: 4096,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-4': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4',
    description: 'Original GPT-4 model',
    contextLength: 8192,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-4-0125-preview': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4 Turbo Preview (0125)',
    description: 'GPT-4 Turbo preview, January 2024',
    contextLength: 128000,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-4-0613': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4 (0613)',
    description: 'GPT-4 June 2023 snapshot',
    contextLength: 8192,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-4-1106-preview': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4 Turbo Preview (1106)',
    description: 'GPT-4 Turbo preview, November 2023',
    contextLength: 128000,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-4-turbo': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4 Turbo',
    description: 'An older high-intelligence GPT model',
    pricing: { input: 10, output: 30 },
    benchmarks: {
      intelligence: 12.8,
      coding: 13.1,
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
    lastUpdated: '2026-03-01',
  },
  'gpt-4-turbo-2024-04-09': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4 Turbo (2024-04-09)',
    description: 'GPT-4 Turbo with Vision, April 2024 snapshot',
    contextLength: 128000,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-4-turbo-preview': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4 Turbo Preview',
    description: 'GPT-4 Turbo preview alias',
    contextLength: 128000,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-4.1': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4.1',
    description: 'Smartest non-reasoning model',
    pricing: { input: 3, output: 12 },
    benchmarks: {
      intelligence: 22.4,
      coding: 18.5,
      math: 46.3,
      mmluPro: 0.78,
      gpqa: 0.66,
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
    lastUpdated: '2026-03-01',
  },
  'gpt-4.1-2025-04-14': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4.1 (2025-04-14)',
    description: 'GPT-4.1 April 2025 snapshot',
    pricing: { input: 3, output: 12 },
    contextLength: 1047576,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-4.1-mini': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4.1 Mini',
    description: 'Smaller, faster GPT-4.1 variant',
    pricing: { input: 0.8, output: 3.2 },
    benchmarks: {
      intelligence: 42.5,
      coding: 31.9,
      math: 46.3,
      mmluPro: 0.78,
      gpqa: 0.66,
    },
    contextLength: 1047576,
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
    lastUpdated: '2026-03-01',
  },
  'gpt-4.1-mini-2025-04-14': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4.1 Mini (2025-04-14)',
    description: 'GPT-4.1 Mini April 2025 snapshot',
    pricing: { input: 0.8, output: 3.2 },
    contextLength: 1047576,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-4.1-nano': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4.1 Nano',
    description: 'Smallest, fastest GPT-4.1 variant',
    pricing: { input: 0.2, output: 0.8 },
    contextLength: 1047576,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-4.1-nano-2025-04-14': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4.1 nano',
    description: 'Fastest, most cost-efficient version of GPT-4.1',
    pricing: { input: 0.2, output: 0.8 },
    benchmarks: {
      intelligence: 12.9,
      coding: 11.2,
      math: 24,
      mmluPro: 0.66,
      gpqa: 0.51,
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
    lastUpdated: '2026-03-01',
  },
  'gpt-4o': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o',
    description: 'Fast, intelligent, flexible GPT model',
    pricing: { input: 2.5, output: 10 },
    benchmarks: {
      intelligence: 18.6,
      math: 25.7,
      mmluPro: 0.8,
      gpqa: 0.66,
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
    lastUpdated: '2026-03-01',
  },
  'gpt-4o-2024-05-13': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o (2024-05-13)',
    description: 'GPT-4o May 2024 snapshot',
    contextLength: 128000,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-4o-2024-08-06': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o (2024-08-06)',
    description: 'GPT-4o August 2024 snapshot with structured outputs',
    contextLength: 128000,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-4o-2024-11-20': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o (2024-11-20)',
    description: 'GPT-4o November 2024 snapshot',
    contextLength: 128000,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-4o-audio-preview': {
    type: 'audio' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o Audio',
    description: 'GPT-4o models capable of audio inputs and outputs',
    pricing: { input: 2.5, output: 10 },
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
    lastUpdated: '2026-03-01',
  },
  'gpt-4o-audio-preview-2024-12-17': {
    type: 'audio' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o Audio Preview (2024-12-17)',
    description: 'GPT-4o audio preview, December 2024 snapshot',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-4o-audio-preview-2025-06-03': {
    type: 'audio' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o Audio Preview (2025-06-03)',
    description: 'GPT-4o audio preview, June 2025 snapshot',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-4o-mini': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o Mini',
    description: 'Small, fast, affordable GPT-4o variant',
    pricing: { input: 0.15, output: 0.6 },
    benchmarks: {
      intelligence: 18.9,
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
    lastUpdated: '2026-03-01',
  },
  'gpt-4o-mini-2024-07-18': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o Mini (2024-07-18)',
    description: 'GPT-4o Mini July 2024 snapshot',
    contextLength: 128000,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-4o-mini-audio-preview': {
    type: 'audio' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o mini Audio',
    description: 'Smaller model capable of audio inputs and outputs',
    pricing: { input: 0.15, output: 0.6 },
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
    lastUpdated: '2026-03-01',
  },
  'gpt-4o-mini-audio-preview-2024-12-17': {
    type: 'audio' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o Mini Audio Preview (2024-12-17)',
    description: 'GPT-4o Mini audio preview, December 2024 snapshot',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-4o-mini-realtime-preview': {
    type: 'audio' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o mini Realtime',
    subtype: 'realtime',
    description: 'Smaller realtime model for text and audio inputs and outputs',
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
    lastUpdated: '2026-03-01',
  },
  'gpt-4o-mini-realtime-preview-2024-12-17': {
    type: 'audio' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o Mini Realtime Preview (2024-12-17)',
    subtype: 'realtime',
    description: 'GPT-4o Mini realtime preview, December 2024 snapshot',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-4o-mini-search-preview': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o mini Search Preview',
    description: 'Fast, affordable small model for web search',
    pricing: { input: 0.15, output: 0.6 },
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
    lastUpdated: '2026-03-01',
  },
  'gpt-4o-mini-search-preview-2025-03-11': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o Mini Search Preview (2025-03-11)',
    description: 'GPT-4o Mini with search, March 2025 snapshot',
    contextLength: 128000,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-4o-mini-transcribe': {
    type: 'stt' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o Mini Transcribe',
    description: 'Compact speech-to-text model',
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
    lastUpdated: '2026-03-01',
  },
  'gpt-4o-mini-transcribe-2025-03-20': {
    type: 'stt' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o Mini Transcribe (2025-03-20)',
    description: 'GPT-4o Mini transcription, March 2025 snapshot',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
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
    lastUpdated: '2026-03-01',
  },
  'gpt-4o-mini-tts': {
    type: 'tts' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o mini TTS',
    description: 'Text-to-speech model powered by GPT-4o mini',
    pricing: { input: 0.6 },
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
    lastUpdated: '2026-03-01',
  },
  'gpt-4o-mini-tts-2025-03-20': {
    type: 'tts' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o mini TTS',
    description: 'Text-to-speech model powered by GPT-4o mini',
    pricing: { input: 0.6 },
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
    lastUpdated: '2026-03-01',
  },
  'gpt-4o-mini-tts-2025-12-15': {
    type: 'tts' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o Mini TTS (2025-12-15)',
    description: 'GPT-4o Mini text-to-speech, December 2025 snapshot',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-4o-realtime-preview': {
    type: 'audio' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o Realtime',
    subtype: 'realtime',
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
    lastUpdated: '2026-03-01',
  },
  'gpt-4o-realtime-preview-2024-12-17': {
    type: 'audio' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o Realtime Preview (2024-12-17)',
    subtype: 'realtime',
    description: 'GPT-4o realtime preview, December 2024 snapshot',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-4o-realtime-preview-2025-06-03': {
    type: 'audio' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o Realtime',
    subtype: 'realtime',
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
    lastUpdated: '2026-03-01',
  },
  'gpt-4o-search-preview': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o Search Preview',
    description: 'GPT model for web search in Chat Completions',
    pricing: { input: 2.5, output: 10 },
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
    lastUpdated: '2026-03-01',
  },
  'gpt-4o-search-preview-2025-03-11': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o Search Preview (2025-03-11)',
    description: 'GPT-4o with search, March 2025 snapshot',
    contextLength: 128000,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-4o-transcribe': {
    type: 'stt' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o Transcribe',
    description: 'Speech-to-text transcription model',
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
    lastUpdated: '2026-03-01',
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
    lastUpdated: '2026-03-01',
  },
  'gpt-5': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5',
    description: 'GPT-5 model',
    pricing: { input: 1.25, output: 10 },
    contextLength: 400000,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-5-2025-08-07': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5 (2025-08-07)',
    description: 'GPT-5 August 2025 snapshot',
    pricing: { input: 1.25, output: 10 },
    contextLength: 400000,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-5-chat-latest': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5 Chat Latest',
    description: 'Latest GPT-5 chat model alias',
    pricing: { input: 1.25, output: 10 },
    contextLength: 400000,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-5-codex': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: '',
    subtype: 'code',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-5-mini': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5 Mini',
    description: 'Smaller, faster GPT-5 variant',
    pricing: { input: 0.25, output: 2 },
    contextLength: 400000,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-5-mini-2025-08-07': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5 mini',
    description: 'A faster, cost-efficient version of GPT-5 for well-defined tasks',
    pricing: { input: 0.25, output: 2 },
    benchmarks: {
      intelligence: 11.9,
    },
    contextLength: 400000,
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
    lastUpdated: '2026-03-01',
  },
  'gpt-5-nano': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5 Nano',
    description: 'Smallest and fastest GPT-5 model',
    pricing: { input: 0.05, output: 0.4 },
    contextLength: 400000,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-5-nano-2025-08-07': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5 Nano',
    description: 'Smallest and fastest GPT-5 model',
    pricing: { input: 0.05, output: 0.4 },
    benchmarks: {
      intelligence: 25.7,
      coding: 22.9,
      math: 78.3,
      mmluPro: 0.77,
      gpqa: 0.67,
    },
    contextLength: 400000,
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
    lastUpdated: '2026-03-01',
  },
  'gpt-5-pro': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5 Pro',
    description: 'Premium GPT-5 model for complex tasks',
    pricing: { input: 15, output: 120 },
    contextLength: 400000,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-5-pro-2025-10-06': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: '',
    pricing: { input: 15, output: 120 },
    contextLength: 400000,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-5-search-api': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5 Search API',
    description: 'GPT-5 with web search capabilities',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-5-search-api-2025-10-14': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5 Search API (Oct 2025)',
    description: 'GPT-5 with search capabilities',
    pricing: { input: 1.25, output: 10 },
    benchmarks: {
      intelligence: 68.5,
      coding: 53.5,
      math: 98.7,
      mmluPro: 0.87,
      gpqa: 0.84,
    },
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
    lastUpdated: '2026-03-01',
  },
  'gpt-5.1': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5.1',
    description: 'GPT-5.1 model',
    pricing: { input: 1.25, output: 10 },
    contextLength: 400000,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-5.1-2025-11-13': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5.1 (Nov 2025)',
    description: 'GPT-5.1 model released November 2025',
    pricing: { input: 1.25, output: 10 },
    benchmarks: {
      intelligence: 27.4,
      coding: 27.3,
      math: 38,
      mmluPro: 0.8,
      gpqa: 0.64,
    },
    contextLength: 400000,
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
    lastUpdated: '2026-03-01',
  },
  'gpt-5.1-chat-latest': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5.1 Chat Latest',
    description: 'Latest GPT-5.1 chat model alias',
    pricing: { input: 1.25, output: 10 },
    contextLength: 400000,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-5.1-codex': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: '',
    subtype: 'code',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-5.1-codex-max': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: '',
    subtype: 'code',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-5.1-codex-mini': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: '',
    subtype: 'code',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-5.2': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5.2',
    description: 'Latest GPT-5.2 model',
    pricing: { input: 1.75, output: 14 },
    contextLength: 400000,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-5.2-2025-12-11': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5.2',
    description: 'The best model for coding and agentic tasks across industries',
    pricing: { input: 1.75, output: 14 },
    benchmarks: {
      gpqa: 93.2,
    },
    contextLength: 400000,
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
    lastUpdated: '2026-03-01',
  },
  'gpt-5.2-chat-latest': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5.2 Chat Latest',
    description: 'Latest GPT-5.2 chat model alias',
    pricing: { input: 1.75, output: 14 },
    contextLength: 400000,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-5.2-codex': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5.2 Codex',
    subtype: 'code',
    description: 'GPT-5.2 optimized for code generation via Codex API',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-5.2-pro': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5.2 Pro',
    description: 'Premium GPT-5.2 model for complex tasks',
    pricing: { input: 21, output: 168 },
    contextLength: 400000,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-5.2-pro-2025-12-11': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: '',
    pricing: { input: 21, output: 168 },
    contextLength: 400000,
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-5.3-codex': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5.3 Codex',
    subtype: 'code',
    description: 'Latest GPT-5.3 code generation model',
    benchmarks: {
      intelligence: 95,
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-audio': {
    type: 'audio' as const,
    provider: 'openai' as const,
    displayName: 'GPT Audio',
    description: 'OpenAI audio model',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-audio-1.5': {
    type: 'audio' as const,
    provider: 'openai' as const,
    displayName: 'GPT Audio 1.5',
    description: 'Latest OpenAI audio model',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-audio-2025-08-28': {
    type: 'audio' as const,
    provider: 'openai' as const,
    displayName: 'GPT Audio (2025-08-28)',
    description: 'GPT Audio August 2025 snapshot',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-audio-mini': {
    type: 'audio' as const,
    provider: 'openai' as const,
    displayName: 'GPT Audio Mini',
    description: 'Smaller GPT Audio model',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-audio-mini-2025-10-06': {
    type: 'audio' as const,
    provider: 'openai' as const,
    displayName: 'GPT Audio Mini (Oct 2025)',
    description: 'Compact audio processing model',
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
    lastUpdated: '2026-03-01',
  },
  'gpt-audio-mini-2025-12-15': {
    type: 'audio' as const,
    provider: 'openai' as const,
    displayName: 'GPT Audio Mini (Dec 2025)',
    description: 'Compact audio processing model released December 2025',
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
    lastUpdated: '2026-03-01',
  },
  'gpt-image-1': {
    type: 'image' as const,
    provider: 'openai' as const,
    displayName: 'GPT Image 1',
    description: 'OpenAI image generation model',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-image-1-mini': {
    type: 'image' as const,
    provider: 'openai' as const,
    displayName: 'GPT Image 1 Mini',
    description: 'Smaller OpenAI image generation model',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
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
    lastUpdated: '2026-03-01',
  },
  'gpt-realtime': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT Realtime',
    subtype: 'realtime',
    description: 'OpenAI realtime streaming model',
    pricing: { input: 4, output: 16 },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-realtime-1.5': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT Realtime 1.5',
    subtype: 'realtime',
    description: 'Latest OpenAI realtime model',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-realtime-2025-08-28': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT Realtime (Aug 2025)',
    subtype: 'realtime',
    description: 'Realtime streaming model',
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
    lastUpdated: '2026-03-01',
  },
  'gpt-realtime-mini': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT Realtime Mini',
    subtype: 'realtime',
    description: 'Smaller OpenAI realtime streaming model',
    pricing: { input: 0.6, output: 2.4 },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-realtime-mini-2025-10-06': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT Realtime Mini (2025-10-06)',
    subtype: 'realtime',
    description: 'GPT Realtime Mini October 2025 snapshot',
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
    lastUpdated: '2026-03-01',
  },
  'gpt-realtime-mini-2025-12-15': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT Realtime Mini (Dec 2025)',
    subtype: 'realtime',
    description: 'Compact realtime streaming model',
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
    lastUpdated: '2026-03-01',
  },
  'o1': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'o1',
    subtype: 'reasoning',
    description: 'OpenAI reasoning model',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'o1-2024-12-17': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'o1 (2024-12-17)',
    subtype: 'reasoning',
    description: 'OpenAI o1 reasoning model, December 2024 snapshot',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'o1-pro': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'o1 Pro',
    subtype: 'reasoning',
    description: 'OpenAI o1 Pro reasoning model with enhanced compute',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'o1-pro-2025-03-19': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'o1 Pro (2025-03-19)',
    subtype: 'reasoning',
    description: 'OpenAI o1 Pro reasoning model, March 2025 snapshot',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'o3': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'o3',
    subtype: 'reasoning',
    description: 'Advanced reasoning model',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'o3-2025-04-16': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'o3 (2025-04-16)',
    subtype: 'reasoning',
    description: 'OpenAI o3 reasoning model, April 2025 snapshot',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'o3-mini': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'o3 Mini',
    subtype: 'reasoning',
    description: 'OpenAI o3 mini reasoning model',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'o3-mini-2025-01-31': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'o3 Mini (2025-01-31)',
    subtype: 'reasoning',
    description: 'OpenAI o3 mini reasoning model, January 2025 snapshot',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'o4-mini': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'o4-mini',
    subtype: 'reasoning',
    description: 'Compact reasoning model',
    pricing: { input: 4, output: 16 },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'o4-mini-2025-04-16': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'o4 Mini (2025-04-16)',
    subtype: 'reasoning',
    description: 'OpenAI o4 mini reasoning model, April 2025 snapshot',
    pricing: { input: 4, output: 16 },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'o4-mini-deep-research': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'o4 Mini Deep Research',
    subtype: 'reasoning',
    description: 'OpenAI o4 mini optimized for deep research tasks',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'o4-mini-deep-research-2025-06-26': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'o4 Mini Deep Research (2025-06-26)',
    subtype: 'reasoning',
    description: 'OpenAI o4 mini deep research, June 2025 snapshot',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'omni-moderation-2024-09-26': {
    type: 'moderation' as const,
    provider: 'openai' as const,
    displayName: 'Omni Moderation (2024-09-26)',
    description: 'OpenAI multimodal moderation, September 2024 snapshot',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'omni-moderation-latest': {
    type: 'moderation' as const,
    provider: 'openai' as const,
    displayName: 'Omni Moderation Latest',
    description: 'OpenAI multimodal content moderation',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'sora-2': {
    type: 'video' as const,
    provider: 'openai' as const,
    displayName: 'Sora 2',
    description: 'OpenAI video generation model',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'sora-2-pro': {
    type: 'video' as const,
    provider: 'openai' as const,
    displayName: 'Sora 2 Pro',
    description: 'OpenAI premium video generation model',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'text-embedding-3-large': {
    type: 'embeddings' as const,
    provider: 'openai' as const,
    displayName: 'text-embedding-3-large',
    description: 'Most capable embedding model',
    pricing: { input: 0.13 },
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
    lastUpdated: '2026-03-01',
  },
  'text-embedding-3-small': {
    type: 'embeddings' as const,
    provider: 'openai' as const,
    displayName: 'text-embedding-3-small',
    description: 'Small embedding model',
    pricing: { input: 0.02 },
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
    lastUpdated: '2026-03-01',
  },
  'text-embedding-ada-002': {
    type: 'embeddings' as const,
    provider: 'openai' as const,
    displayName: 'text-embedding-ada-002',
    description: 'Older embedding model',
    pricing: { input: 0.1 },
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
    lastUpdated: '2026-03-01',
  },
  'tts-1': {
    type: 'tts' as const,
    provider: 'openai' as const,
    displayName: 'TTS-1',
    description: 'Text-to-speech model optimized for speed',
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
    lastUpdated: '2026-03-01',
  },
  'tts-1-1106': {
    type: 'tts' as const,
    provider: 'openai' as const,
    displayName: 'TTS-1 (1106)',
    description: 'Text-to-speech model, November 2023 snapshot',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'tts-1-hd': {
    type: 'tts' as const,
    provider: 'openai' as const,
    displayName: 'TTS-1 HD',
    description: 'Text-to-speech model optimized for quality',
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
    lastUpdated: '2026-03-01',
  },
  'tts-1-hd-1106': {
    type: 'tts' as const,
    provider: 'openai' as const,
    displayName: 'TTS-1 HD (1106)',
    description: 'High-definition text-to-speech, November 2023 snapshot',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'whisper-1': {
    type: 'audio' as const,
    provider: 'openai' as const,
    displayName: 'Whisper',
    description: 'General-purpose speech recognition model',
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
    lastUpdated: '2026-03-01',
  },
  'command-r': {
    type: 'chat' as const,
    provider: 'cohere' as const,
    displayName: 'Cohere Command R',
    description: 'A highly scalable, 128k context model optimized for long-context tasks such as retrieval augmented generation (RAG) and using external APIs and tools.',
    pricing: { input: 0.15, output: 0.60 },
    contextLength: 128000,
    context: {
      input: { text: true, audio: false, image: false, video: false },
      output: { text: true, audio: false, image: false, video: false }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-25',
  },
  'command-r-plus': {
    type: 'chat' as const,
    provider: 'cohere' as const,
    displayName: 'Cohere Command R+',
    description: 'A powerful, scalable model for enterprise-grade AI applications, featuring 128k context and high performance across complex reasoning tasks.',
    pricing: { input: 2.50, output: 10.00 },
    contextLength: 128000,
    context: {
      input: { text: true, audio: false, image: false, video: false },
      output: { text: true, audio: false, image: false, video: false }
    },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-01-25',
  }
} as const;

export type ModelId = keyof typeof MODEL_REGISTRY;

// Legacy type aliases for backwards compatibility
export type SupportedModel = ModelId;
export type Provider = SupportedProvider;
