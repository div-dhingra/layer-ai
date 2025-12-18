import Anthropic from "@anthropic-ai/sdk";
import { BaseProviderAdapter, ADAPTER_HANDLED } from './base-adapter.js';
import {
  LayerRequest,
  LayerResponse,
  Role,
  FinishReason,
  ToolChoice,
} from '@layer-ai/sdk';

let anthropic: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropic) {
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropic;
}

export class AnthropicAdapter extends BaseProviderAdapter {
  protected provider = 'anthropic';

  protected roleMappings: Record<Role, string> = {
    system: ADAPTER_HANDLED,    // Handled via system parameter
    user: 'user',
    assistant: 'assistant',
    tool: 'user',               // Tool results are user messages in Anthropic
    function: 'user',           // Function results are user messages in Anthropic
    model: 'assistant',
    developer: 'user',
  };

  protected toolChoiceMappings: Record<string, string | object> = {
    auto: { type: 'auto' },
    required: { type: 'any' },
    none: { type: 'none' },
  };

  protected finishReasonMappings: Record<string, FinishReason> = {
    end_turn: 'completed',
    max_tokens: 'length_limit',
    tool_use: 'tool_call',
    stop_sequence: 'completed',
    error_output: 'error',
  };

  protected mapToolChoice(choice: ToolChoice): string | object | undefined {
    // Handle object format: { type: 'function', function: { name: 'foo' } } -> { type: 'tool', name: 'foo' }
    if (typeof choice === 'object' && choice.type === 'function') {
      return {
        type: 'tool',
        name: choice.function.name,
      };
    }

    // Handle string format using base mappings
    return super.mapToolChoice(choice);
  }

  async call(request: LayerRequest): Promise<LayerResponse> {
    switch (request.type) {
      case 'chat':
        return this.handleChat(request);
      case 'image':
        throw new Error('image generation not yet supported by LayerAI');
      case 'embeddings':
        throw new Error('embeddings not yet supported by LayerAI');
      case 'tts':
        throw new Error('tts generation not yet supported by LayerAI');
      case 'video':
        throw new Error('Video generation not yet supported by LayerAI');
      default:
        throw new Error(`Unknown modality: ${(request as any).type}`);
    }
  }

  private async handleChat(request: Extract<LayerRequest, { type: 'chat' }>): Promise<LayerResponse> {
    const startTime = Date.now();
    const client = getAnthropicClient();
    const { data: chat, model } = request;

    if (!model) {
      throw new Error('Model is required for chat completions');
    }

    const systemPrompt = chat.systemPrompt || undefined;
    const messages: Anthropic.MessageParam[] = [];

    for (const msg of chat.messages) {
      // Skip system messages - they're handled via the system parameter
      if (msg.role === 'system') continue;

      const role = this.mapRole(msg.role); 
      
      if (msg.images && msg.images.length > 0) {
        const content: Anthropic.MessageParam['content'] = [];

        if (msg.content) {
          content.push({ type: 'text', text: msg.content });
        }

        for (const image of msg.images) {
          if (image.url) {
            content.push({
              type: 'image',
              source: {
                type: 'url',
                url: image.url,
              }
            });
          } else if (image.base64) {
            content.push({
              type: 'image',
              source: {
                type: 'base64',
                media_type: image.mimeType || 'image/jpeg',
                data: image.base64
              }
            });
          }
        }

        messages.push({ role: role as 'user', content });
      }

      else if (msg.toolCalls) {
        const content: Anthropic.MessageParam['content'] = [];

        if (msg.content) {
          content.push({ type: 'text', text: msg.content });
        }

        for (const toolCall of msg.toolCalls) {
          content.push({
            type: 'tool_use',
            id: toolCall.id,
            name: toolCall.function.name,
            input: JSON.parse(toolCall.function.arguments),
          })
        }
        messages.push({ role: 'assistant', content });
      }

      else if (msg.toolCallId) {
        messages.push({
          role: 'user',
          content: [{
            type: 'tool_result',
            tool_use_id: msg.toolCallId,
            content: msg.content || '',
          }],
        });
      }

      else {
        messages.push({
          role: role as 'user' | 'assistant',
          content: msg.content || '',
        });
      }
    }

    const anthropicRequest: Anthropic.MessageCreateParams = {
      model: model,
      messages,
      max_tokens: chat.maxTokens || 4096,
      ...(systemPrompt && { system: systemPrompt }),
      ...(chat.temperature !== undefined && { temperature: chat.temperature }),
      ...(chat.temperature === undefined && chat.topP !== undefined && { top_p: chat.topP }),
      ...(chat.stopSequences && { stop_sequences: chat.stopSequences }),
      ...(chat.tools && {
        tools: chat.tools.map(tool => ({
          name: tool.function.name,
          description: tool.function.description,
          input_schema: tool.function.parameters || { type: 'object', properties: {} },
        })) as Anthropic.Tool[],
        ...(chat.toolChoice && { tool_choice: this.mapToolChoice(chat.toolChoice) as Anthropic.MessageCreateParams['tool_choice'] }),
      }),
    };

    const response = await client.messages.create(anthropicRequest);

    // Extract text content
    let textContent: string | undefined;
    const textBlock = response.content.find(block => block.type === 'text');
    if (textBlock && textBlock.type === 'text') {
      textContent = textBlock.text;
    }

    // Extract tool calls
    let toolCalls: LayerResponse['toolCalls'];
    const toolUseBlocks = response.content.filter(block => block.type === 'tool_use');
    if (toolUseBlocks.length > 0) {
      toolCalls = toolUseBlocks
        .map(block => {
          if (block.type === 'tool_use') {
            return {
              id: block.id,
              type: 'function' as const,
              function: {
                name: block.name,
                arguments: JSON.stringify(block.input),
              },
            };
          }
          return undefined;
        })
        .filter((call): call is NonNullable<typeof call> => call !== undefined);
    }

    const promptTokens = response.usage.input_tokens;
    const completionTokens = response.usage.output_tokens;
    const totalTokens = promptTokens + completionTokens;
    const cost = this.calculateCost(model, promptTokens, completionTokens);

    return {
      content: textContent,
      toolCalls,
      model: response.model,
      finishReason: this.mapFinishReason(response.stop_reason || 'end_turn'),
      rawFinishReason: response.stop_reason || undefined,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens,
      },
      cost,
      latencyMs: Date.now() - startTime,
      raw: response,
    };
  }
}