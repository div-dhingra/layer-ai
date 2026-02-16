import type {
  AnthropicMessage,
  AnthropicMessageCreateParams,
  AnthropicContentBlock,
  AnthropicTool,
  AnthropicToolChoice,
  AnthropicMessageResponse,
  AnthropicMessageStreamEvent,
  AnthropicSystemContentBlock,
} from '@layer-ai/sdk';
import type {
  LayerRequest,
  LayerResponse,
  MultimodalMessage,
  Tool,
  ToolCall,
  ToolChoice,
  ImageInput,
} from '@layer-ai/sdk';
import { nanoid } from 'nanoid';

/**
 * Convert a single Anthropic message to Layer message format
 */
function convertAnthropicMessageToLayer(msg: AnthropicMessage): MultimodalMessage {
  // Handle string content (simple case)
  if (typeof msg.content === 'string') {
    return {
      role: msg.role,
      content: msg.content,
    };
  }

  // Handle content blocks
  let textContent = '';
  const images: ImageInput[] = [];
  const toolCalls: ToolCall[] = [];
  let toolCallId: string | undefined;

  for (const block of msg.content) {
    if (block.type === 'text') {
      textContent += (textContent ? '\n' : '') + block.text;
    } else if (block.type === 'image') {
      if (block.source.type === 'url' && block.source.url) {
        images.push({ url: block.source.url });
      } else if (block.source.type === 'base64' && block.source.data) {
        images.push({
          base64: block.source.data,
          mimeType: (block.source.media_type || 'image/jpeg') as any,
        });
      }
    } else if (block.type === 'tool_use') {
      toolCalls.push({
        id: block.id,
        type: 'function',
        function: {
          name: block.name,
          arguments: JSON.stringify(block.input),
        },
      });
    } else if (block.type === 'tool_result') {
      toolCallId = block.tool_use_id;
      // Content in tool_result can be string or array
      if (typeof block.content === 'string') {
        textContent = block.content;
      } else if (Array.isArray(block.content)) {
        // Extract text from content blocks
        textContent = block.content
          .filter((c) => c.type === 'text')
          .map((c) => (c as any).text)
          .join('\n');
      }
    }
  }

  return {
    role: msg.role,
    content: textContent || undefined,
    images: images.length > 0 ? images : undefined,
    toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    toolCallId,
  };
}

/**
 * Convert Anthropic tools to Layer tools
 */
function convertAnthropicToolsToLayer(anthropicTools: AnthropicTool[]): Tool[] {
  return anthropicTools.map((tool) => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.input_schema as any,
    },
  }));
}

/**
 * Convert Anthropic tool_choice to Layer tool_choice
 */
function convertAnthropicToolChoiceToLayer(
  anthropicToolChoice?: AnthropicToolChoice
): ToolChoice | undefined {
  if (!anthropicToolChoice) return undefined;

  if (anthropicToolChoice.type === 'auto') {
    return 'auto';
  } else if (anthropicToolChoice.type === 'any') {
    return 'required';
  } else if (anthropicToolChoice.type === 'tool') {
    return {
      type: 'function',
      function: { name: anthropicToolChoice.name },
    };
  }

  return undefined;
}

/**
 * Extract system prompt from Anthropic system parameter
 */
function extractSystemPrompt(
  system?: string | AnthropicSystemContentBlock[]
): string | undefined {
  if (!system) return undefined;

  if (typeof system === 'string') {
    return system;
  }

  // Array of content blocks - concatenate text blocks
  return system
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n');
}

/**
 * Convert Anthropic Messages API request to LayerRequest
 */
export function convertAnthropicRequestToLayer(
  anthropicReq: AnthropicMessageCreateParams,
  gateId: string
): LayerRequest {
  // Extract system prompt
  const systemPrompt = extractSystemPrompt(anthropicReq.system);

  // Convert messages
  const messages = anthropicReq.messages.map((msg) =>
    convertAnthropicMessageToLayer(msg)
  );

  // Convert tools
  const tools = anthropicReq.tools
    ? convertAnthropicToolsToLayer(anthropicReq.tools)
    : undefined;

  // Convert tool_choice
  const toolChoice = convertAnthropicToolChoiceToLayer(anthropicReq.tool_choice);

  return {
    gateId,
    type: 'chat',
    model: anthropicReq.model,
    data: {
      messages,
      systemPrompt,
      tools,
      toolChoice,
      temperature: anthropicReq.temperature,
      maxTokens: anthropicReq.max_tokens,
      topP: anthropicReq.top_p,
      // Note: topK is not supported in Layer's ChatRequest, Anthropic-specific parameter ignored
      stream: anthropicReq.stream,
      stopSequences: anthropicReq.stop_sequences,
    },
  };
}

/**
 * Map Layer finish reason to Anthropic stop_reason
 */
function mapFinishReasonToAnthropic(
  finishReason?: string
): 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use' {
  if (finishReason === 'length_limit') {
    return 'max_tokens';
  } else if (finishReason === 'tool_call') {
    return 'tool_use';
  } else if (finishReason === 'stop_sequence') {
    return 'stop_sequence';
  }
  return 'end_turn';
}

/**
 * Convert LayerResponse to Anthropic Messages API response
 */
export function convertLayerResponseToAnthropic(
  layerResp: LayerResponse
): AnthropicMessageResponse {
  const content: AnthropicContentBlock[] = [];

  // Add text content block
  if (layerResp.content) {
    content.push({
      type: 'text',
      text: layerResp.content,
    });
  }

  // Add tool use blocks
  if (layerResp.toolCalls && layerResp.toolCalls.length > 0) {
    for (const toolCall of layerResp.toolCalls) {
      content.push({
        type: 'tool_use',
        id: toolCall.id,
        name: toolCall.function.name,
        input: JSON.parse(toolCall.function.arguments),
      });
    }
  }

  return {
    id: layerResp.id || `msg-${nanoid()}`,
    type: 'message',
    role: 'assistant',
    content,
    model: layerResp.model || 'claude-3-5-sonnet-20241022',
    stop_reason: mapFinishReasonToAnthropic(layerResp.finishReason),
    stop_sequence: null,
    usage: {
      input_tokens: layerResp.usage?.promptTokens || 0,
      output_tokens: layerResp.usage?.completionTokens || 0,
    },
  };
}

/**
 * State tracker for streaming chunks
 */
interface StreamState {
  messageId: string;
  model: string;
  contentBlockIndex: number;
  hasStartedContentBlock: boolean;
  currentToolCallId?: string;
  currentToolCallName?: string;
  currentToolCallInput: string;
}

/**
 * Convert LayerResponse stream chunks to Anthropic streaming events
 */
export async function* convertLayerStreamToAnthropicEvents(
  chunks: AsyncGenerator<LayerResponse>
): AsyncGenerator<AnthropicMessageStreamEvent> {
  const state: StreamState = {
    messageId: `msg-${nanoid()}`,
    model: 'claude-3-5-sonnet-20241022',
    contentBlockIndex: 0,
    hasStartedContentBlock: false,
    currentToolCallInput: '',
  };

  let isFirstChunk = true;
  let inputTokens = 0;
  let outputTokens = 0;

  for await (const chunk of chunks) {
    // Update model from first chunk
    if (chunk.model) {
      state.model = chunk.model;
    }

    // First chunk: send message_start
    if (isFirstChunk) {
      inputTokens = chunk.usage?.promptTokens || 0;

      yield {
        type: 'message_start',
        message: {
          id: state.messageId,
          type: 'message',
          role: 'assistant',
          content: [],
          model: state.model,
          stop_reason: null,
          stop_sequence: null,
          usage: {
            input_tokens: inputTokens,
            output_tokens: 0,
          },
        },
      };
      isFirstChunk = false;
    }

    // Handle text content
    if (chunk.content) {
      if (!state.hasStartedContentBlock) {
        // Start text content block
        yield {
          type: 'content_block_start',
          index: state.contentBlockIndex,
          content_block: {
            type: 'text',
            text: '',
          },
        };
        state.hasStartedContentBlock = true;
      }

      // Send text delta
      yield {
        type: 'content_block_delta',
        index: state.contentBlockIndex,
        delta: {
          type: 'text_delta',
          text: chunk.content,
        },
      };
    }

    // Handle tool calls
    if (chunk.toolCalls && chunk.toolCalls.length > 0) {
      for (const toolCall of chunk.toolCalls) {
        // Close previous content block if needed
        if (state.hasStartedContentBlock) {
          yield {
            type: 'content_block_stop',
            index: state.contentBlockIndex,
          };
          state.contentBlockIndex++;
          state.hasStartedContentBlock = false;
        }

        // Start tool use block
        yield {
          type: 'content_block_start',
          index: state.contentBlockIndex,
          content_block: {
            type: 'tool_use',
            id: toolCall.id,
            name: toolCall.function.name,
            input: {},
          },
        };

        // Send tool input delta
        yield {
          type: 'content_block_delta',
          index: state.contentBlockIndex,
          delta: {
            type: 'input_json_delta',
            partial_json: toolCall.function.arguments,
          },
        };

        // Close tool use block
        yield {
          type: 'content_block_stop',
          index: state.contentBlockIndex,
        };

        state.contentBlockIndex++;
      }
    }

    // Track output tokens
    if (chunk.usage?.completionTokens) {
      outputTokens = chunk.usage.completionTokens;
    }

    // Last chunk: send message_delta and message_stop
    if (chunk.finishReason) {
      // Close any open content block
      if (state.hasStartedContentBlock) {
        yield {
          type: 'content_block_stop',
          index: state.contentBlockIndex,
        };
      }

      // Send message delta with stop reason
      yield {
        type: 'message_delta',
        delta: {
          stop_reason: mapFinishReasonToAnthropic(chunk.finishReason),
        },
        usage: {
          output_tokens: outputTokens,
        },
      };

      // Send message stop
      yield {
        type: 'message_stop',
      };
    }
  }
}
