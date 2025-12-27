// Manual pricing data from official sources
// Last updated: 2025-12-25
// Sources: OpenAI, Google, Mistral, Anthropic official pricing pages

export const MANUAL_PRICING: Record<string, { input: number; output: number }> = {
  // OpenAI - https://openai.com/api/pricing/
  'openai/gpt-5': { input: 1.25, output: 10.0 },
  'openai/gpt-5-mini': { input: 0.25, output: 2.0 },
  'openai/gpt-5-nano': { input: 0.05, output: 0.4 },
  'openai/gpt-4o': { input: 5.0, output: 15.0 },
  'openai/gpt-4o-mini': { input: 0.15, output: 0.6 },
  'openai/gpt-4-turbo': { input: 10.0, output: 30.0 },
  'openai/gpt-4': { input: 30.0, output: 60.0 },
  'openai/gpt-3.5-turbo': { input: 0.5, output: 1.5 },
  'openai/o1': { input: 15.0, output: 60.0 },
  'openai/o1-mini': { input: 3.0, output: 12.0 },
  'openai/o3-mini': { input: 1.1, output: 4.4 },

  // Google Gemini - https://ai.google.dev/gemini-api/docs/pricing
  'google/gemini-2.5-pro': { input: 1.25, output: 10.0 },
  'google/gemini-2.5-flash': { input: 0.15, output: 0.6 },
  'google/gemini-2.0-flash': { input: 0.15, output: 0.6 },
  'google/gemini-2.0-flash-lite': { input: 0.075, output: 0.3 },
  'google/gemini-1.5-pro': { input: 1.25, output: 5.0 },
  'google/gemini-1.5-flash': { input: 0.075, output: 0.3 },

  // Mistral - https://mistral.ai/pricing
  'mistral/mistral-large-latest': { input: 3.0, output: 9.0 },
  'mistral/mistral-large-2': { input: 3.0, output: 9.0 },
  'mistral/mistral-medium-latest': { input: 2.7, output: 8.1 },
  'mistral/mistral-small-latest': { input: 1.0, output: 3.0 },
  'mistral/mistral-nemo': { input: 0.3, output: 0.3 },
  'mistral/codestral': { input: 1.0, output: 3.0 },
  'mistral/mistral-embed': { input: 0.01, output: 0.01 },

  // Anthropic - https://www.anthropic.com/pricing
  'anthropic/claude-3-5-sonnet-20241022': { input: 3.0, output: 15.0 },
  'anthropic/claude-3-5-haiku-20241022': { input: 1.0, output: 5.0 },
  'anthropic/claude-3-opus-20240229': { input: 15.0, output: 75.0 },
  'anthropic/claude-3-sonnet-20240229': { input: 3.0, output: 15.0 },
  'anthropic/claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
};
