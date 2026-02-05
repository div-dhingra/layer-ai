import Anthropic from "@anthropic-ai/sdk";
import { BaseProviderAdapter, ADAPTER_HANDLED } from './base-adapter.js';
import {
  LayerRequest,
  LayerResponse,
  Role,
  FinishReason,
  ToolChoice,
} from '@layer-ai/sdk';
import { PROVIDER, type Provider } from "../../lib/provider-constants.js";
import { resolveApiKey } from '../../lib/key-resolver.js';

let anthropic: Anthropic | null = null;

function getAnthropicClient(apiKey?: string): Anthropic {
  if (apiKey) {
    return new Anthropic({ apiKey });
  }

  if (!anthropic) {
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropic;
}

export class AnthropicAdapter extends BaseProviderAdapter {
  protected provider: Provider = PROVIDER.ANTHROPIC;

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

  async call(request: LayerRequest, userId?: string): Promise<LayerResponse> {
    const resolved = await resolveApiKey(this.provider, userId, process.env.ANTHROPIC_API_KEY);

    switch (request.type) {
      case 'chat':
        return this.handleChat(request, resolved.key, resolved.usedPlatformKey);
      case 'image':
        throw new Error('Image generation not yet supported by Anthropic');
      case 'embeddings':
        throw new Error('Embeddings not yet supported by Anthropic');
      case 'tts':
        throw new Error('TTS generation not yet supported by Anthropic');
      case 'video':
        throw new Error('Video generation not yet supported by Anthropic');
      default:
        throw new Error(`Unknown modality: ${(request as any).type}`);
    }
  }

  async *callStream(request: LayerRequest, userId?: string): AsyncIterable<LayerResponse> {
    const resolved = await resolveApiKey(this.provider, userId, process.env.ANTHROPIC_API_KEY);

    switch (request.type) {
      case 'chat':
        yield* this.handleChatStream(request, resolved.key, resolved.usedPlatformKey);
        break;
      default:
        throw new Error(`Streaming not supported for type: ${(request as any).type}`);
    }
  }

  private async handleChat(request: Extract<LayerRequest, { type: 'chat' }>, apiKey: string, usedPlatformKey: boolean): Promise<LayerResponse> {
    const startTime = Date.now();
    const client = getAnthropicClient(apiKey);
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

      // Handle tool responses (mutually exclusive with other content types)
      if (msg.toolCallId) {
        messages.push({
          role: 'user',
          content: [{
            type: 'tool_result',
            tool_use_id: msg.toolCallId,
            content: msg.content || '',
          }],
        });
      }
      // Handle messages with images and/or tool calls
      else if (msg.images?.length || msg.toolCalls?.length) {
        const content: Anthropic.MessageParam['content'] = [];

        // Add text content if present
        if (msg.content) {
          content.push({ type: 'text', text: msg.content });
        }

        // Add images if present
        if (msg.images) {
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
        }

        // Add tool calls if present
        if (msg.toolCalls) {
          for (const toolCall of msg.toolCalls) {
            content.push({
              type: 'tool_use',
              id: toolCall.id,
              name: toolCall.function.name,
              input: JSON.parse(toolCall.function.arguments),
            })
          }
        }

        // Determine role based on content
        const messageRole = msg.images?.length ? 'user' : (msg.toolCalls?.length ? 'assistant' : role as 'user' | 'assistant');
        messages.push({ role: messageRole, content });
      }
      // Handle regular text messages
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
      usedPlatformKey,
      raw: response,
    };
  }

  private async *handleChatStream(
    request: Extract<LayerRequest, { type: 'chat' }>,
    apiKey: string,
    usedPlatformKey: boolean
  ): AsyncIterable<LayerResponse> {
    const startTime = Date.now();
    const client = getAnthropicClient(apiKey);
    const { data: chat, model } = request;

    if (!model) {
      throw new Error('Model is required for chat completions');
    }

    const systemPrompt = chat.systemPrompt || undefined;
    const messages: Anthropic.MessageParam[] = [];

    for (const msg of chat.messages) {
      if (msg.role === 'system') continue;

      const role = this.mapRole(msg.role);

      if (msg.toolCallId) {
        messages.push({
          role: 'user',
          content: [{
            type: 'tool_result',
            tool_use_id: msg.toolCallId,
            content: msg.content || '',
          }],
        });
      }
      else if (msg.images?.length || msg.toolCalls?.length) {
        const content: Anthropic.MessageParam['content'] = [];

        if (msg.content) {
          content.push({ type: 'text', text: msg.content });
        }

        if (msg.images) {
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
        }

        if (msg.toolCalls) {
          for (const toolCall of msg.toolCalls) {
            content.push({
              type: 'tool_use',
              id: toolCall.id,
              name: toolCall.function.name,
              input: JSON.parse(toolCall.function.arguments),
            })
          }
        }

        const messageRole = msg.images?.length ? 'user' : (msg.toolCalls?.length ? 'assistant' : role as 'user' | 'assistant');
        messages.push({ role: messageRole, content });
      }
      else {
        messages.push({
          role: role as 'user' | 'assistant',
          content: msg.content || '',
        });
      }
    }

    const anthropicRequest: Anthropic.MessageStreamParams = {
      model: model,
      messages,
      max_tokens: chat.maxTokens || 4096,
      stream: true,
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

    const stream = client.messages.stream(anthropicRequest);

    let promptTokens = 0;
    let completionTokens = 0;
    let fullContent = '';
    let currentToolCalls: LayerResponse['toolCalls'] = [];
    let stopReason: string | null = null;

    for await (const event of stream) {
      if (event.type === 'content_block_start') {
        const block = event.content_block;
        if (block.type === 'tool_use') {
          currentToolCalls.push({
            id: block.id,
            type: 'function',
            function: {
              name: block.name,
              arguments: '',
            },
          });
        }
      }
      else if (event.type === 'content_block_delta') {
        const delta = event.delta;
        if (delta.type === 'text_delta') {
          fullContent += delta.text;
          yield {
            content: delta.text,
            model: model,
            stream: true,
          };
        }
        else if (delta.type === 'input_json_delta') {
          if (currentToolCalls.length > 0) {
            const lastToolCall = currentToolCalls[currentToolCalls.length - 1];
            lastToolCall.function.arguments += delta.partial_json;
          }
        }
      }
      else if (event.type === 'message_start') {
        promptTokens = event.message.usage.input_tokens;
      }
      else if (event.type === 'message_delta') {
        completionTokens = event.usage.output_tokens;
        stopReason = event.delta.stop_reason || stopReason;
      }
    }

    const cost = this.calculateCost(model, promptTokens, completionTokens);
    const latencyMs = Date.now() - startTime;

    yield {
      content: '',
      model: model,
      toolCalls: currentToolCalls.length > 0 ? currentToolCalls : undefined,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      },
      cost,
      latencyMs,
      usedPlatformKey,
      stream: true,
      finishReason: this.mapFinishReason(stopReason || 'end_turn'),
      rawFinishReason: stopReason || undefined,
    };
  }
}