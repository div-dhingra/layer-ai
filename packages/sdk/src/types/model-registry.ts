// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
// Generated at: 2026-03-01T08:08:28.495Z
// Source: Internal Model Registry API
// To update: Run `pnpm sync:registry`
//
// Registry version: 2026-03-01
// Last sync: 2026-03-01T08:04:21.847Z
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
    lastUpdated: '2026-01-25',
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
    lastUpdated: '2026-01-25',
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
    lastUpdated: '2026-01-25',
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
    lastUpdated: '2026-01-25',
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
    lastUpdated: '2026-01-25',
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
    lastUpdated: '2026-01-25',
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
    lastUpdated: '2026-01-25',
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
    lastUpdated: '2026-01-25',
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
    description: 'Our best model in terms of price-performance, offering well-rounded capabilities. 2.5 Flash is best for large scale processing, low-latency, high volume tasks that require thinking, and agentic use cases.',
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
    lastUpdated: '2026-01-25',
  },
  'gemini-2.5-flash-lite': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemini 2.5 Flash-Lite',
    description: 'Stable version of Gemini 2.5 Flash-Lite, most cost-effective option',
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
  'gemini-2.5-flash-native-audio-latest': {
    type: 'audio' as const,
    provider: 'google' as const,
    displayName: '',
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
    description: 'Our state-of-the-art thinking model, capable of reasoning over complex problems in code, math, and STEM, as well as analyzing large datasets, codebases, and documents using long context.',
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
    lastUpdated: '2026-01-25',
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
  'gemini-3-pro-preview': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemini 3 Pro Preview',
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
  'gemini-3.1-pro-preview': {
    type: 'chat' as const,
    provider: 'google' as const,
    displayName: 'Gemini 3.1 Pro Preview',
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
    lastUpdated: '2026-01-25',
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
    lastUpdated: '2026-01-25',
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
    lastUpdated: '2026-01-25',
  },
  'text-embedding-004': {
    type: 'embeddings' as const,
    provider: 'google' as const,
    displayName: 'Text Embedding 004',
    pricing: { input: 0.15 },
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
    lastUpdated: '2026-01-25',
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
    lastUpdated: '2026-01-25',
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
    lastUpdated: '2026-01-25',
  },
  'codestral-2412': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Codestral (Dec 2024)',
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
    lastUpdated: '2026-01-25',
  },
  'devstral-2512': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Devstral 2 (Dec 2025)',
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
  'magistral-medium-2509': {
    type: 'chat' as const,
    provider: 'mistral' as const,
    displayName: 'Magistral Medium',
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
    lastUpdated: '2026-01-25',
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
    lastUpdated: '2026-01-25',
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
    lastUpdated: '2026-01-25',
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
    lastUpdated: '2026-01-25',
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
    lastUpdated: '2026-01-25',
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
    lastUpdated: '2026-01-25',
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
    lastUpdated: '2026-01-25',
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
    lastUpdated: '2026-01-25',
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
    lastUpdated: '2026-01-25',
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
    lastUpdated: '2026-01-25',
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
    lastUpdated: '2026-01-25',
  },
  'gpt-4o-mini-realtime-preview': {
    type: 'audio' as const,
    provider: 'openai' as const,
    displayName: 'GPT-4o mini Realtime',
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
    lastUpdated: '2026-01-25',
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
    lastUpdated: '2026-01-25',
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
    lastUpdated: '2026-01-25',
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
    lastUpdated: '2026-01-25',
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
    lastUpdated: '2026-01-25',
  },
  'gpt-4o-realtime-preview': {
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
    lastUpdated: '2026-01-25',
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
    lastUpdated: '2026-01-25',
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
    lastUpdated: '2026-01-25',
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
    lastUpdated: '2026-01-25',
  },
  'gpt-5': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5',
    description: 'GPT-5 model',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-5-codex': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: '',
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
    lastUpdated: '2026-01-25',
  },
  'gpt-5-nano': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5 Nano',
    description: 'Smallest and fastest GPT-5 model',
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
  'gpt-5-pro': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5 Pro',
    description: 'Premium GPT-5 model for complex tasks',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-5-pro-2025-10-06': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: '',
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
  'gpt-5.1-codex': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: '',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-5.1-codex-max': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: '',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-5.1-codex-mini': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: '',
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
  'gpt-5.2-pro': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5.2 Pro',
    description: 'Premium GPT-5.2 model for complex tasks',
    pricing: { input: 21, output: 168 },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-5.2-pro-2025-12-11': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: '',
    pricing: { input: 21, output: 168 },
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'gpt-5.3-codex': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT-5.3 Codex',
    description: 'Latest GPT-5.3 code generation model',
    benchmarks: {
      intelligence: 95,
    },
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
  'gpt-realtime-2025-08-28': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT Realtime (Aug 2025)',
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
  'gpt-realtime-mini-2025-12-15': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'GPT Realtime Mini (Dec 2025)',
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
  'o3': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'o3',
    description: 'Advanced reasoning model',
    deprecated: false,
    isAvailable: true,
    lastUpdated: '2026-03-01',
  },
  'o4-mini': {
    type: 'chat' as const,
    provider: 'openai' as const,
    displayName: 'o4-mini',
    description: 'Compact reasoning model',
    pricing: { input: 4, output: 16 },
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
    lastUpdated: '2026-01-25',
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
    lastUpdated: '2026-01-25',
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
    lastUpdated: '2026-01-25',
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
    lastUpdated: '2026-01-25',
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
    lastUpdated: '2026-01-25',
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
    lastUpdated: '2026-01-25',
  }
} as const;

export type ModelId = keyof typeof MODEL_REGISTRY;

// Legacy type aliases for backwards compatibility
export type SupportedModel = ModelId;
export type Provider = SupportedProvider;
