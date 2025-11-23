import Anthropic from '@anthropic-ai/sdk/index';
import type { Message, SupportedModel } from '@layer-ai/types';
import { MODEL_REGISTRY } from '@layer-ai/types';

// Lazy-initialize Anthropic client
let anthropic: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropic) {
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropic;
} 

export interface AnthropicCompletionParams {
  model: string; 
  messages: Message[];
  temperature?: number; 
  maxTokens?: number;
  topP?: number;
  systemPrompt?: string;
}

export interface ProviderResponse {
  content: string; 
  promptTokens: number;
  completionTokens: number; 
  totalTokens: number;
  costUsd: number;
}

export async function createCompletion(params: AnthropicCompletionParams): Promise<ProviderResponse> {
  // Separate system message from conversation
  let systemPrompt = params.systemPrompt || ''; 
  const conversationMessages = params.messages.filter(msg => {
    if (msg.role === 'system') {
      systemPrompt = msg.content; 
      return false;
    }
    return true;
  });

  // map to anthropic format
  const anthropicMessages = conversationMessages.map(msg => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }));

  // Call anthropic api
  const response = await getAnthropicClient().messages.create({
    model: params.model,
    max_tokens: params.maxTokens || 1024,
    messages: anthropicMessages,
    ...(systemPrompt && { system: systemPrompt }),
    ...(params.temperature != null && { temperature: params.temperature }),
    ...(params.topP != null && { top_p: params.topP }),
  });

  // Extract response content
  const content = response.content[0].type === 'text' 
    ? response.content[0].text 
    : '';

  // Get token usage
  const promptTokens = response.usage.input_tokens;
  const completionTokens = response.usage.output_tokens;
  const totalTokens = promptTokens + completionTokens;

  // Calculate cost
  const pricing = MODEL_REGISTRY[params.model as SupportedModel].pricing;
  const costUsd = (promptTokens / 1000 * pricing.input) + (completionTokens / 1000 * pricing.output);

  return {
    content,
    promptTokens,
    completionTokens,
    totalTokens,
    costUsd,
  };
}