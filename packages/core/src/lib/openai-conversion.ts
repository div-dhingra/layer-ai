import type {
  OpenAIMessage,
  OpenAIChatCompletionRequest,
  OpenAITool,
  OpenAIToolCall,
  OpenAIToolChoice,
  OpenAIResponseFormat,
  OpenAIChatCompletionResponse,
  OpenAIChatCompletionChunk,
  OpenAIUsage,
} from '@layer-ai/sdk';
import type {
  LayerRequest,
  LayerResponse,
  MultimodalMessage,
  Tool,
  ToolCall,
  ToolChoice,
  ResponseFormatType,
  ImageInput,
} from '@layer-ai/sdk';
import { nanoid } from 'nanoid';

function convertMessage(openaiMsg: OpenAIMessage): MultimodalMessage {
  const layerMsg: MultimodalMessage = {
    role: openaiMsg.role as any,
  };

  if (typeof openaiMsg.content === 'string') {
    layerMsg.content = openaiMsg.content;
  } else if (Array.isArray(openaiMsg.content)) {
    const textParts: string[] = [];
    const imageParts: ImageInput[] = [];

    for (const part of openaiMsg.content) {
      if (part.type === 'text') {
        textParts.push(part.text);
      } else if (part.type === 'image_url') {
        imageParts.push({
          url: part.image_url.url,
          detail: part.image_url.detail,
        });
      }
    }

    if (textParts.length > 0) {
      layerMsg.content = textParts.join('\n');
    }
    if (imageParts.length > 0) {
      layerMsg.images = imageParts;
    }
  }

  if (openaiMsg.tool_calls) {
    layerMsg.toolCalls = openaiMsg.tool_calls.map(tc => ({
      id: tc.id,
      type: 'function',
      function: {
        name: tc.function.name,
        arguments: tc.function.arguments,
      },
    }));
  }

  if (openaiMsg.tool_call_id) {
    layerMsg.toolCallId = openaiMsg.tool_call_id;
  }

  if (openaiMsg.name) {
    layerMsg.name = openaiMsg.name;
  }

  return layerMsg;
}

function convertTool(openaiTool: OpenAITool): Tool {
  return {
    type: 'function',
    function: {
      name: openaiTool.function.name,
      description: openaiTool.function.description,
      parameters: openaiTool.function.parameters as any,
    },
  };
}

function convertToolChoice(openaiToolChoice?: OpenAIToolChoice): ToolChoice | undefined {
  if (!openaiToolChoice) return undefined;
  if (typeof openaiToolChoice === 'string') return openaiToolChoice;
  return openaiToolChoice;
}

function convertResponseFormat(openaiFormat?: OpenAIResponseFormat): ResponseFormatType | { type: ResponseFormatType; json_schema?: unknown } | undefined {
  if (!openaiFormat) return undefined;

  if (openaiFormat.type === 'json_schema' && openaiFormat.json_schema) {
    return {
      type: 'json_schema',
      json_schema: openaiFormat.json_schema,
    };
  }

  return openaiFormat.type;
}

export function convertOpenAIRequestToLayer(
  openaiReq: OpenAIChatCompletionRequest,
  gateId: string
): LayerRequest {
  let systemPrompt: string | undefined;
  const messages: MultimodalMessage[] = [];

  for (const msg of openaiReq.messages) {
    if (msg.role === 'system' && typeof msg.content === 'string') {
      systemPrompt = msg.content;
    } else {
      messages.push(convertMessage(msg));
    }
  }

  const layerRequest: LayerRequest = {
    gateId,
    type: 'chat',
    model: openaiReq.model,
    data: {
      messages,
      systemPrompt,
      temperature: openaiReq.temperature,
      maxTokens: openaiReq.max_tokens || openaiReq.max_completion_tokens,
      topP: openaiReq.top_p,
      stream: openaiReq.stream,
      stopSequences: typeof openaiReq.stop === 'string' ? [openaiReq.stop] : openaiReq.stop,
      frequencyPenalty: openaiReq.frequency_penalty,
      presencePenalty: openaiReq.presence_penalty,
      seed: openaiReq.seed,
    },
  };

  if (openaiReq.tools && openaiReq.tools.length > 0) {
    layerRequest.data.tools = openaiReq.tools.map(convertTool);
  }

  if (openaiReq.tool_choice) {
    layerRequest.data.toolChoice = convertToolChoice(openaiReq.tool_choice);
  }

  if (openaiReq.response_format) {
    layerRequest.data.responseFormat = convertResponseFormat(openaiReq.response_format);
  }

  return layerRequest;
}

function convertFinishReason(layerReason?: string): 'stop' | 'length' | 'tool_calls' | 'content_filter' | null {
  if (!layerReason) return null;

  switch (layerReason) {
    case 'completed':
      return 'stop';
    case 'length_limit':
      return 'length';
    case 'tool_call':
      return 'tool_calls';
    case 'filtered':
      return 'content_filter';
    default:
      return 'stop';
  }
}

function convertToolCallsToOpenAI(layerToolCalls?: ToolCall[]): OpenAIToolCall[] | undefined {
  if (!layerToolCalls || layerToolCalls.length === 0) return undefined;

  return layerToolCalls.map(tc => ({
    id: tc.id,
    type: 'function',
    function: {
      name: tc.function.name,
      arguments: tc.function.arguments,
    },
  }));
}

function convertUsage(layerUsage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number }): OpenAIUsage {
  return {
    prompt_tokens: layerUsage?.promptTokens || 0,
    completion_tokens: layerUsage?.completionTokens || 0,
    total_tokens: layerUsage?.totalTokens || 0,
  };
}

export function convertLayerResponseToOpenAI(
  layerResp: LayerResponse,
  requestId?: string
): OpenAIChatCompletionResponse {
  const id = requestId || layerResp.id || `chatcmpl-${nanoid()}`;
  const created = layerResp.created || Math.floor(Date.now() / 1000);

  const message: OpenAIMessage = {
    role: 'assistant',
    content: layerResp.content || undefined,
  };

  const toolCalls = convertToolCallsToOpenAI(layerResp.toolCalls);
  if (toolCalls) {
    message.tool_calls = toolCalls;
  }

  const response: OpenAIChatCompletionResponse = {
    id,
    object: 'chat.completion',
    created,
    model: layerResp.model || 'unknown',
    choices: [
      {
        index: 0,
        message,
        finish_reason: convertFinishReason(layerResp.finishReason),
        logprobs: null,
      },
    ],
    usage: convertUsage(layerResp.usage),
  };

  return response;
}

export function convertLayerChunkToOpenAI(
  layerChunk: LayerResponse,
  requestId: string,
  created: number
): OpenAIChatCompletionChunk {
  const delta: any = {};

  if (layerChunk.content && !layerChunk.finishReason) {
    delta.role = 'assistant';
  }

  if (layerChunk.content) {
    delta.content = layerChunk.content;
  }

  if (layerChunk.toolCalls && layerChunk.toolCalls.length > 0) {
    delta.tool_calls = layerChunk.toolCalls.map((tc, index) => ({
      index,
      id: tc.id,
      type: 'function' as const,
      function: {
        name: tc.function.name,
        arguments: tc.function.arguments,
      },
    }));
  }

  const chunk: OpenAIChatCompletionChunk = {
    id: requestId,
    object: 'chat.completion.chunk',
    created,
    model: layerChunk.model || 'unknown',
    choices: [
      {
        index: 0,
        delta,
        finish_reason: convertFinishReason(layerChunk.finishReason),
        logprobs: null,
      },
    ],
  };

  if (layerChunk.usage && layerChunk.finishReason) {
    chunk.usage = convertUsage(layerChunk.usage);
  }

  return chunk;
}
