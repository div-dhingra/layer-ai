import OpenAI from 'openai';
import type { Message, SupportedModel } from '@layer-ai/types';
import { MODEL_REGISTRY } from '@layer-ai/types';

// Lazy-initialize OpenAI client
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export interface OpenAICompletionParams {
  model: string; 
  messages: Message[]; 
  temperature?: number; 
  maxTokens?: number;
  topP?: number;
}

export interface ProviderResponse {
  content: string; 
  promptTokens: number; 
  completionTokens: number; 
  totalTokens: number; 
  costUsd: number;
}

export async function createCompletion(params: OpenAICompletionParams): Promise<ProviderResponse> {
  const startTime = Date.now(); 

  // Call OpenAI API
  const response = await getOpenAIClient().chat.completions.create({
    model: params.model, 
    messages: params.messages.map(msg => ({
      role: msg.role, 
      content: msg.content
    })), 
    temperature: params.temperature,
    max_tokens: params.maxTokens,
    top_p: params.topP, 
  });

  // Extract response data
  const choice = response.choices[0];
  const content = choice.message.content || '';

  // Get token usage
  const promptTokens = response.usage?.prompt_tokens || 0; 
  const completionTokens = response.usage?.completion_tokens || 0; 
  const totalTokens = response.usage?.total_tokens || 0;

  // Calculate cost
  const pricing = MODEL_REGISTRY[params.model as SupportedModel].pricing;
  const costUsd = (promptTokens / 1000 * pricing.input) + (completionTokens / 1000 * pricing.output);

  return {
    content, 
    promptTokens,
    completionTokens,
    totalTokens,
    costUsd
  };
}