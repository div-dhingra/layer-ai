import { CohereClientV2, Cohere } from 'cohere-ai';
import { BaseProviderAdapter } from './base-adapter.js';
import {
  LayerRequest,
  LayerResponse,
  Role,
  FinishReason, 
  EmbedInputType,
} from '@layer-ai/sdk';
import { PROVIDER, type Provider } from "../../lib/provider-constants.js";
import { resolveApiKey } from '../../lib/key-resolver.js';
import { 
  ChatMessageV2, 
  UserMessageV2Content, 
  ResponseFormatV2, 
  EmbedInput,
} from 'cohere-ai/api/index.js';

let client: CohereClientV2 | null = null;

function getCohereClient(apiKey?: string): CohereClientV2 {
  // If custom API key provided, create new client
  if (apiKey) {
    return new CohereClientV2({ token: apiKey });
  }

  // Otherwise use singleton with platform key
  if (!client) {
    client = new CohereClientV2({
      token: process.env.COHERE_API_KEY || '',
    });
  }
  return client;
}

export class CohereAdapter extends BaseProviderAdapter {
  protected provider: Provider = PROVIDER.COHERE;

  protected roleMappings: Record<Role, string> = {
    system: 'system',
    user: 'user',
    assistant: 'assistant',
    tool: 'tool',
    function: 'tool',
    model: 'assistant',
    developer: 'system',
  };

  // Map Cohere finish reasons to Layer finish reasons
  protected finishReasonMappings: Record<string, FinishReason> = {
    COMPLETE: 'completed',
    STOP_SEQUENCE: 'completed',
    MAX_TOKENS: 'length_limit',
    TOOL_CALL: 'tool_call',
    ERROR: 'error',
    TIMEOUT: 'error'
  };

  protected toolChoiceMappings: Record<string, string> = {
    none: 'NONE',
    required: 'REQUIRED',
  };

  protected embeddingInputTypeMappings: Record<EmbedInputType, string> = {
    'text': 'search_document',     
    'document': 'search_document',
    'query': 'search_query',       
    'image': 'image',              
    'clustering': 'clustering',     
    'classification': 'classification' 
  };

  async call(request: LayerRequest, userId?: string): Promise<LayerResponse> {
    // Resolve API key (BYOK → Platform key)
    const resolved = await resolveApiKey(this.provider, userId, process.env.COHERE_API_KEY);

    switch (request.type) {
      case 'chat':
        return this.handleChat(request, resolved.key, resolved.usedPlatformKey);
      case 'embeddings':
        return this.handleEmbeddings(request, resolved.key, resolved.usedPlatformKey);
      case 'rerank':
        return this.handleRerank(request, resolved.key, resolved.usedPlatformKey);
      case 'image':
        throw new Error('Image generation not supported by Cohere');
      case 'tts':
        throw new Error('Text-to-speech not supported by Cohere');
      case 'video':
        throw new Error('Video generation not supported by Cohere');
      default:
        throw new Error(`Unknown modality: ${(request as any).type}`);
    }
  }

  async *callStream(request: LayerRequest, userId?: string): AsyncIterable<LayerResponse> {
    const resolved = await resolveApiKey(this.provider, userId, process.env.COHERE_API_KEY);

    switch (request.type) {
      case 'chat':
        yield* this.handleChatStream(request, resolved.key, resolved.usedPlatformKey);
        break;
      default:
        throw new Error(`Streaming not supported for type: ${(request as any).type}`);
    }
  }

  private async handleChat(
    request: Extract<LayerRequest, { type: 'chat' }>,
    apiKey: string,
    usedPlatformKey: boolean
  ): Promise<LayerResponse> {
    const startTime = Date.now();
    const cohere = getCohereClient(apiKey);
    const { data: chat, model } = request;

    if (!model) {
      throw new Error('Model is required for chat completion');
    }

    // Build messages array
    const messages: ChatMessageV2[] = [];

    // Handle system prompt
    if (chat.systemPrompt) {
      messages.push({ role: 'system', content: chat.systemPrompt });
    }

    // Convert messages to Cohere format
    for (const msg of chat.messages) {
      const role = this.mapRole(msg.role) as 'system' | 'user' | 'assistant' | 'tool';

      // Handle vision messages (content + images together)
      if (msg.images && msg.images.length > 0 && role === 'user') {
        const content: UserMessageV2Content = [];

        if (msg.content) { // text (from layer req)
          content.push({ type: 'text', text: msg.content });
        }

        for (const image of msg.images) { // images (from layer req)
          const imageUrl =
            image.url || `data:${image.mimeType || 'image/jpeg'};base64,${image.base64}`;
          content.push({
            type: 'image_url',
            imageUrl: {
              url: imageUrl
            },
          });
        }

        messages.push({ role, content });
      }
      // Handle tool responses
      else if (role === 'tool') {
        if (msg.toolCallId) { // tool requires toolCallId
          messages.push({
            role: 'tool',
            content: msg.content || '',
            toolCallId: msg.toolCallId
          });
        }
      }
      // Handle assistant messages with tool calls
      else if (msg.toolCalls && msg.toolCalls.length > 0) {
        messages.push({
          role: 'assistant',
          content: msg.content || '',
          toolCalls: msg.toolCalls.map((tc) => ({
            id: tc.id,
            type: 'function' as const,
            function: {
              name: tc.function.name,
              arguments: tc.function.arguments,
            },
          })),
        });
      }
      // Handle regular text messages
      else {
        messages.push({
          role,
          content: msg.content || '',
        });
      }
    }

    // Convert tools to Cohere format - ensure parameters is always defined
    let tools: Array<{
      type: 'function';
      function: {
        name: string;
        description?: string;
        parameters: Record<string, unknown>;
      };
    }> | undefined;

    if (chat.tools && chat.tools.length > 0) {
      tools = chat.tools.map((tool) => ({
        type: 'function' as const,
        function: {
          name: tool.function.name,
          description: tool.function.description,
          parameters: (tool.function.parameters as Record<string, unknown>) || {},
        },
      }));
    }

    // Map tool choice - Cohere uses 'NONE', 'REQUIRED' (else defaults)
    let toolChoice: 'NONE'| 'REQUIRED' | undefined;
    if (chat.toolChoice) {
      const mapped = this.mapToolChoice(chat.toolChoice);
      if (mapped === 'NONE' || mapped === 'REQUIRED') {
        toolChoice = mapped;
      }
    }

    const responseFormat: ResponseFormatV2 | undefined = 
      chat.responseFormat ? (
        chat.responseFormat === 'text'
          ? { type: chat.responseFormat } 
          : ( typeof chat.responseFormat === 'object' && chat.responseFormat.type === "json_object" 
                ? { 
                    type: chat.responseFormat.type,
                    ...(chat.responseFormat.json_schema ? { jsonSchema: chat.responseFormat.json_schema as Record<string, unknown> } : {})
                  }
                : undefined)
      ) : undefined; 
          
    const response = await cohere.chat({
      model,
      messages,
      ...(chat.temperature !== undefined && { temperature: chat.temperature }),
      ...(chat.maxTokens !== undefined && { maxTokens: chat.maxTokens }),
      ...(chat.topP !== undefined && { p: chat.topP }),
      ...(chat.stopSequences !== undefined && { stopSequences: chat.stopSequences }),
      ...(chat.frequencyPenalty !== undefined && { frequencyPenalty: chat.frequencyPenalty }),
      ...(chat.presencePenalty !== undefined && { presencePenalty: chat.presencePenalty }),
      ...(chat.seed !== undefined && { seed: chat.seed }),
      ...(tools && { tools }),
      ...(toolChoice && { toolChoice }),
      ...(responseFormat && { responseFormat })
    });

    const message = response.message; // Extract response (to map back to LayerAI resp-format)

    // Extract tool calls if present - normalize arguments to string
    const toolCalls = message?.toolCalls?.map((tc) => ({
      id: tc.id || '',
      type: 'function' as const,
      function: {
        name: tc.function?.name || '',
        arguments: typeof tc.function?.arguments === 'string'
          ? tc.function.arguments
          : JSON.stringify(tc.function?.arguments || {}),
      },
    }));

    const promptTokens = response.usage?.tokens?.inputTokens || 0;
    const completionTokens = response.usage?.tokens?.outputTokens || 0;
    const totalTokens = promptTokens + completionTokens;
    const cost = this.calculateCost(model, promptTokens, completionTokens);

    // Extract + format content from ContentChunk array to string 
    let contentStr: string | undefined;
    if (message?.content) {
      // ContentChunk array - extract text parts
      contentStr = message.content
        .map((chunk: any) => chunk.text || chunk.content || '')
        .filter(Boolean)
        .join('');
    }

    // Map back to Layer response format
    return {
      content: contentStr || undefined,
      toolCalls: toolCalls && toolCalls.length > 0 ? toolCalls : undefined,
      model: model,
      finishReason: this.mapFinishReason(response.finishReason),
      rawFinishReason: response.finishReason,
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
    const cohere = getCohereClient(apiKey);
    const { data: chat, model } = request;

    if (!model) {
      throw new Error('Model is required for chat completion');
    }

    // Build messages array (same as non-streaming)
    const messages: ChatMessageV2[] = [];

    // Handle system prompt
    if (chat.systemPrompt) {
      messages.push({ role: 'system', content: chat.systemPrompt });
    }

    // Convert messages to Cohere format
    for (const msg of chat.messages) {
      const role = this.mapRole(msg.role) as 'system' | 'user' | 'assistant' | 'tool';

      // Handle vision messages (content + images together)
      if (msg.images && msg.images.length > 0 && role === 'user') {
        const content: UserMessageV2Content = [];

        if (msg.content) { // text (from layer req)
          content.push({ type: 'text', text: msg.content });
        }

        for (const image of msg.images) { // images (from layer req)
          const imageUrl =
            image.url || `data:${image.mimeType || 'image/jpeg'};base64,${image.base64}`;
          content.push({
            type: 'image_url',
            imageUrl: {
              url: imageUrl
            },
          });
        }

        messages.push({ role, content });
      }
      // Handle tool responses
      else if (role === 'tool') {
        if (msg.toolCallId) { // tool requires toolCallId
          messages.push({
            role: 'tool',
            content: msg.content || '',
            toolCallId: msg.toolCallId
          });
        }
      }

      // Handle assistant messages with tool calls
      else if (msg.toolCalls && msg.toolCalls.length > 0) {
        messages.push({
          role: 'assistant',
          content: msg.content || '',
          toolCalls: msg.toolCalls.map((tc) => ({
            id: tc.id,
            type: 'function' as const,
            function: {
              name: tc.function.name,
              arguments: tc.function.arguments,
            },
          })),
        });
      }
      // Handle regular text messages
      else {
        messages.push({
          role,
          content: msg.content || '',
        });
      }
    }

    // Convert tools to Cohere format - ensure parameters is always defined
    let tools: Array<{
      type: 'function';
      function: {
        name: string;
        description?: string;
        parameters: Record<string, unknown>;
      };
    }> | undefined;

    if (chat.tools && chat.tools.length > 0) {
      tools = chat.tools.map((tool) => ({
        type: 'function' as const,
        function: {
          name: tool.function.name,
          description: tool.function.description,
          parameters: (tool.function.parameters as Record<string, unknown>) || {},
        },
      }));
    }

    // Map tool choice - Cohere uses 'NONE', 'REQUIRED' (else defaults)
    let toolChoice: 'NONE'| 'REQUIRED' | undefined;
    if (chat.toolChoice) {
      const mapped = this.mapToolChoice(chat.toolChoice);
      if (mapped === 'NONE' || mapped === 'REQUIRED') {
        toolChoice = mapped;
      }
    }

    const responseFormat: ResponseFormatV2 | undefined = 
      chat.responseFormat ? (
        chat.responseFormat === 'text'
          ? { type: chat.responseFormat } 
          : ( typeof chat.responseFormat === 'object' && chat.responseFormat.type === "json_object" 
                ? { 
                    type: chat.responseFormat.type,
                    ...(chat.responseFormat.json_schema ? { jsonSchema: chat.responseFormat.json_schema as Record<string, unknown> } : {})
                  }
                : undefined)
      ) : undefined; 
          
    const stream = await cohere.chatStream({
      model,
      messages,
      ...(chat.temperature !== undefined && { temperature: chat.temperature }),
      ...(chat.maxTokens !== undefined && { maxTokens: chat.maxTokens }),
      ...(chat.topP !== undefined && { p: chat.topP }),
      ...(chat.stopSequences !== undefined && { stopSequences: chat.stopSequences }),
      ...(chat.frequencyPenalty !== undefined && { frequencyPenalty: chat.frequencyPenalty }),
      ...(chat.presencePenalty !== undefined && { presencePenalty: chat.presencePenalty }),
      ...(chat.seed !== undefined && { seed: chat.seed }),
      ...(tools && { tools }),
      ...(toolChoice && { toolChoice }),
      ...(responseFormat && { responseFormat })
    });

    // Accumulate across total streamed chunks (tokens) for finalized values 
    let promptTokens = 0;
    let completionTokens = 0;
    let totalTokens = 0;
    let fullContent = ''; 
    let currentToolCalls: LayerResponse['toolCalls'] = [];
    let finishReason: string | null = null;

    // Cohere streams data as events (different types)
    for await (const event of stream) {
      // Handle text / reasoning content
      if (event.type == 'content-delta' && event.delta?.message?.content) {
        const content = event.delta.message.content;
        // Handle visible text
        if (content.text) {
          const contentStr = content.text; 
          fullContent += contentStr; // all text displayed to user
          yield {
            content: contentStr,
            model: model,
            stream: true,
          };
        }
        // Handle internal reasoning ('thinking')
        if (content.thinking) {
          const contentStr = content.thinking; 
          yield {
            content: contentStr,
            model: model,
            stream: true,
          };
        }
      }

      // Handle NEW tool call (initial info: name, init args)
      if (event.type == 'tool-call-start' && event.delta?.message?.toolCalls) {
        if (event.index !== undefined) {
          const tc = event.delta.message.toolCalls; 
          currentToolCalls[event.index] = {
            id: tc.id, 
            type: 'function',
            function: {
              name: tc.function?.name || '',
              arguments: tc.function?.arguments || '',
            },
          }
        }
      }
      // Handle EXISTING tool call (update with new args)
      else if (event.type == 'tool-call-delta' && event.delta?.message?.toolCalls) {
          const tc = event.delta?.message?.toolCalls;
          // Extend existing tool call arguments 
          if (tc.function?.arguments && event.index !== undefined) {
            currentToolCalls[event.index].function.arguments += tc.function.arguments;
          }
      }

      // Handle event completion
      if (event.type === 'message-end') {
        // Handle finish reason
        if (event.delta?.finishReason) {
          finishReason = event.delta.finishReason;
        }
        // Handle usage 
        if (event.delta?.usage) {
          promptTokens = event.delta.usage.tokens?.inputTokens || 0;
          completionTokens = event.delta.usage.tokens?.outputTokens || 0;
          totalTokens = promptTokens + completionTokens; 
        }
      }
    }

    const cost = this.calculateCost(model, promptTokens, completionTokens);
    const latencyMs = Date.now() - startTime;

    // Yield final chunk with metadata
    yield {
      content: '',
      model: model,
      toolCalls: currentToolCalls.length > 0 ? currentToolCalls.filter(Boolean) : undefined, // filter out undefined tool calls
      usage: {
        promptTokens,
        completionTokens,
        totalTokens,
      },
      cost,
      latencyMs,
      usedPlatformKey,
      stream: true,
      finishReason: this.mapFinishReason(finishReason || 'stop'),
      rawFinishReason: finishReason || undefined,
    };
  }

  private async handleEmbeddings(
    request: Extract<LayerRequest, { type: 'embeddings' }>,
    apiKey: string,
    usedPlatformKey: boolean
  ): Promise<LayerResponse> {
    const startTime = Date.now();
    const cohere = getCohereClient(apiKey);
    const { data: embedding, model } = request;

    // Missing Cohere "Embed" model 
    if (!model) {
      throw new Error('Model is required for embeddings');
    }

    const inputs = Array.isArray(embedding.input) ? embedding.input : [embedding.input];

    // Fallback for missing embedding input-type
    const isLikelyImageUrl = (s: string): boolean => (
      /^https?:\/\/.+\.(?:jpe?g|png|gif|webp)(?:\?.*)?$/.test(s)
        || /^data:image\//.test(s)
    );

    // Convert inputs, input type to Cohere format
    let inputType: Cohere.EmbedInputType = 'search_document'; // / default for normal text embeddings OR mixed inputs (image + text embeddings)
    if (embedding.inputType) {
      inputType = this.mapEmbeddingInputType(embedding.inputType) as Cohere.EmbedInputType;
    } else if (inputs.every(isLikelyImageUrl)) { // Handle missing embedding input type (smart fallback)
        inputType = 'image'; 
    }
    const cohereInputs: EmbedInput[] = inputs.map((item: string) => { // text, image, or mixed
      if (inputType === 'image' || isLikelyImageUrl(item)) {
        return { 
          content: [{
            type: 'image_url',
            imageUrl: {
              url: item,
            },
          }]
        }
      } else {
        return {
          content: [{
            type: 'text',
            text: item,
          }]
        }
      }
    });

    const response = await cohere.embed({
      model,
      inputType,
      inputs: cohereInputs,
      ...(embedding.dimensions && { outputDimension: embedding.dimensions }),
      ...(embedding.encodingFormat && { embeddingTypes: [embedding.encodingFormat  as 'float' | 'base64'] }),
    });

    const embeddings = response.embeddings.float 
      || response.embeddings.int8 
      || response.embeddings.uint8
      || response.embeddings.binary
      || response.embeddings.ubinary 
      || response.embeddings.base64
      || [];

    const promptTokens = response.meta?.tokens?.inputTokens || 0;
    const completionTokens = response.meta?.tokens?.outputTokens || 0;
    const totalTokens = promptTokens + completionTokens;
    const cost = this.calculateCost(model, promptTokens, completionTokens);

    return {
      id: response.id,
      embeddings,
      model: model,
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

  private async handleRerank(
    request: Extract<LayerRequest, { type: 'rerank' }>,
    apiKey: string,
    usedPlatformKey: boolean
  ): Promise<LayerResponse> { 
    const startTime = Date.now();
    const cohere = getCohereClient(apiKey);
    const { data: rerank, model } = request;

    // Missing Cohere "Rerank" model 
     if (!model) {
      throw new Error('Model is required for reranking'); 
    }

    const response = await cohere.rerank({
      model,
      query: rerank.query,
      documents: rerank.documents,
      ...(rerank.topN && {topN: rerank.topN}),
      ...(rerank.maxTokensPerDocument && {maxTokensPerDoc: rerank.maxTokensPerDocument}),
      ...(rerank.priority && {priority: rerank.priority}),
    });
    
    const promptTokens = response.meta?.tokens?.inputTokens || 0; 
    const completionTokens = response.meta?.tokens?.outputTokens || 0; 
    const totalTokens = promptTokens + completionTokens;
    const cost = this.calculateCost(model, promptTokens, completionTokens);

    return {
      ...(response.id && { id: response.id }),
      rerank: {
        results: response.results,
      },
      model: model,
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
}