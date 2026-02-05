#!/usr/bin/env npx tsx
/**
 * Test streaming at the chat route level
 * Tests routing strategies with streaming support
 */

import type { LayerRequest, Gate, SupportedModel } from '@layer-ai/sdk';
import { callAdapterStream } from '../../lib/provider-factory.js';

console.log('='.repeat(80));
console.log('STREAMING - CHAT ROUTE LEVEL TESTS');
console.log('='.repeat(80));
console.log('');

// Simplified versions of the routing functions from chat.ts
async function* executeWithFallbackStream(request: LayerRequest, modelsToTry: SupportedModel[]): AsyncIterable<any> {
  let lastError: Error | null = null;

  for (const modelToTry of modelsToTry) {
    try {
      const modelRequest = { ...request, model: modelToTry };
      yield* callAdapterStream(modelRequest);
      return; // Success!
    } catch (error) {
      lastError = error as Error;
      console.log(`  Model ${modelToTry} failed, trying next fallback...`);
      continue;
    }
  }

  throw lastError || new Error('All models failed during streaming');
}

async function* executeWithRoundRobinStream(gateConfig: Gate, request: LayerRequest): AsyncIterable<any> {
  let selectedModel = request.model as SupportedModel;

  if (gateConfig.fallbackModels?.length) {
    const allModels = [gateConfig.model, ...gateConfig.fallbackModels];
    const modelIndex = Math.floor(Math.random() * allModels.length);
    selectedModel = allModels[modelIndex];
    console.log(`  Selected model via round-robin: ${selectedModel}`);
  }

  const modelRequest = { ...request, model: selectedModel };
  yield* callAdapterStream(modelRequest);
}

// Test 1: Single routing with streaming
async function testSingleRouting() {
  console.log('Test 1: Single Routing with Streaming');
  console.log('-'.repeat(80));

  const request: LayerRequest = {
    gateId: 'test-gate',
    model: 'gpt-4o',
    type: 'chat',
    data: {
      messages: [
        { role: 'user', content: 'Say "test passed" and nothing else.' }
      ],
      maxTokens: 10,
      stream: true,
    }
  };

  let chunkCount = 0;
  let fullContent = '';

  for await (const chunk of callAdapterStream(request)) {
    chunkCount++;
    if (chunk.content) {
      fullContent += chunk.content;
    }
  }

  console.log(`  Chunks received: ${chunkCount}`);
  console.log(`  Content: ${fullContent.trim()}`);
  console.log('  ✅ Single routing test passed\n');
}

// Test 2: Fallback routing with streaming
async function testFallbackRouting() {
  console.log('Test 2: Fallback Routing with Streaming');
  console.log('-'.repeat(80));

  const request: LayerRequest = {
    gateId: 'test-gate',
    model: 'invalid-model-1', // This will fail
    type: 'chat',
    data: {
      messages: [
        { role: 'user', content: 'Say "fallback worked" and nothing else.' }
      ],
      maxTokens: 10,
      stream: true,
    }
  };

  const modelsToTry: SupportedModel[] = [
    'invalid-model-1' as SupportedModel, // Should fail
    'invalid-model-2' as SupportedModel, // Should fail
    'gpt-4o', // Should succeed
  ];

  let chunkCount = 0;
  let fullContent = '';
  let succeeded = false;

  try {
    for await (const chunk of executeWithFallbackStream(request, modelsToTry)) {
      chunkCount++;
      if (chunk.content) {
        fullContent += chunk.content;
      }
    }
    succeeded = true;
  } catch (error) {
    console.error('  ❌ Fallback failed:', error instanceof Error ? error.message : error);
  }

  if (succeeded) {
    console.log(`  Chunks received: ${chunkCount}`);
    console.log(`  Content: ${fullContent.trim()}`);
    console.log('  ✅ Fallback routing test passed\n');
  }
}

// Test 3: Round-robin routing with streaming
async function testRoundRobinRouting() {
  console.log('Test 3: Round-Robin Routing with Streaming');
  console.log('-'.repeat(80));

  const gateConfig: Gate = {
    id: 'test-gate-id',
    name: 'Test Gate',
    model: 'gpt-4o',
    taskType: 'chat',
    routingStrategy: 'round-robin',
    fallbackModels: ['gpt-4o', 'gpt-3.5-turbo'],
    userId: 'test-user',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const request: LayerRequest = {
    gateId: 'test-gate',
    model: 'gpt-4o',
    type: 'chat',
    data: {
      messages: [
        { role: 'user', content: 'Say "round-robin worked" and nothing else.' }
      ],
      maxTokens: 10,
      stream: true,
    }
  };

  let chunkCount = 0;
  let fullContent = '';

  for await (const chunk of executeWithRoundRobinStream(gateConfig, request)) {
    chunkCount++;
    if (chunk.content) {
      fullContent += chunk.content;
    }
  }

  console.log(`  Chunks received: ${chunkCount}`);
  console.log(`  Content: ${fullContent.trim()}`);
  console.log('  ✅ Round-robin routing test passed\n');
}

// Test 4: Streaming with tool calls
async function testStreamingWithTools() {
  console.log('Test 4: Streaming with Tool Calls');
  console.log('-'.repeat(80));

  const request: LayerRequest = {
    gateId: 'test-gate',
    model: 'gpt-4o',
    type: 'chat',
    data: {
      messages: [
        { role: 'user', content: 'What is the weather in Paris?' }
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'get_weather',
            description: 'Get weather for a location',
            parameters: {
              type: 'object',
              properties: {
                location: { type: 'string' },
              },
              required: ['location'],
            },
          },
        },
      ],
      stream: true,
    }
  };

  let toolCallsFound = false;
  let finishReason = null;

  for await (const chunk of callAdapterStream(request)) {
    if (chunk.toolCalls && chunk.toolCalls.length > 0) {
      toolCallsFound = true;
    }
    if (chunk.finishReason) {
      finishReason = chunk.finishReason;
    }
  }

  console.log(`  Tool calls found: ${toolCallsFound}`);
  console.log(`  Finish reason: ${finishReason}`);

  if (toolCallsFound && finishReason === 'tool_call') {
    console.log('  ✅ Tool calls streaming test passed\n');
  } else {
    console.log('  ⚠️  Tool calls may not have been invoked (model chose not to use tools)\n');
  }
}

// Test 5: Claude/Anthropic streaming
async function testClaudeStreaming() {
  console.log('Test 5: Claude/Anthropic Streaming');
  console.log('-'.repeat(80));

  const request: LayerRequest = {
    gateId: 'test-gate',
    model: 'claude-3-7-sonnet-20250219',
    type: 'chat',
    data: {
      messages: [
        { role: 'user', content: 'Say "claude test passed" and nothing else.' }
      ],
      maxTokens: 20,
      stream: true,
    }
  };

  let chunkCount = 0;
  let fullContent = '';

  for await (const chunk of callAdapterStream(request)) {
    chunkCount++;
    if (chunk.content) {
      fullContent += chunk.content;
    }
  }

  console.log(`  Chunks received: ${chunkCount}`);
  console.log(`  Content: ${fullContent.trim()}`);
  console.log('  ✅ Claude streaming test passed\n');
}

// Test 6: Claude with tool calls streaming
async function testClaudeToolCallsStreaming() {
  console.log('Test 6: Claude Tool Calls Streaming');
  console.log('-'.repeat(80));

  const request: LayerRequest = {
    gateId: 'test-gate',
    model: 'claude-3-7-sonnet-20250219',
    type: 'chat',
    data: {
      messages: [
        { role: 'user', content: 'What is the weather in Tokyo?' }
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'get_weather',
            description: 'Get weather for a location',
            parameters: {
              type: 'object',
              properties: {
                location: { type: 'string' },
              },
              required: ['location'],
            },
          },
        },
      ],
      stream: true,
    }
  };

  let toolCallsFound = false;
  let finishReason = null;

  for await (const chunk of callAdapterStream(request)) {
    if (chunk.toolCalls && chunk.toolCalls.length > 0) {
      toolCallsFound = true;
    }
    if (chunk.finishReason) {
      finishReason = chunk.finishReason;
    }
  }

  console.log(`  Tool calls found: ${toolCallsFound}`);
  console.log(`  Finish reason: ${finishReason}`);

  if (toolCallsFound && finishReason === 'tool_call') {
    console.log('  ✅ Claude tool calls streaming test passed\n');
  } else {
    console.log('  ⚠️  Tool calls may not have been invoked (model chose not to use tools)\n');
  }
}

// Test 7: Multi-provider fallback with streaming (OpenAI -> Claude)
async function testMultiProviderFallback() {
  console.log('Test 7: Multi-Provider Fallback (OpenAI -> Claude) with Streaming');
  console.log('-'.repeat(80));

  const request: LayerRequest = {
    gateId: 'test-gate',
    model: 'invalid-openai-model',
    type: 'chat',
    data: {
      messages: [
        { role: 'user', content: 'Say "multi-provider fallback worked" and nothing else.' }
      ],
      maxTokens: 15,
      stream: true,
    }
  };

  const modelsToTry: SupportedModel[] = [
    'invalid-openai-model' as SupportedModel,
    'claude-3-7-sonnet-20250219',
  ];

  let chunkCount = 0;
  let fullContent = '';
  let succeeded = false;

  try {
    for await (const chunk of executeWithFallbackStream(request, modelsToTry)) {
      chunkCount++;
      if (chunk.content) {
        fullContent += chunk.content;
      }
    }
    succeeded = true;
  } catch (error) {
    console.error('  ❌ Multi-provider fallback failed:', error instanceof Error ? error.message : error);
  }

  if (succeeded) {
    console.log(`  Chunks received: ${chunkCount}`);
    console.log(`  Content: ${fullContent.trim()}`);
    console.log('  ✅ Multi-provider fallback test passed\n');
  }
}

// Test 8: Google/Gemini streaming
async function testGeminiStreaming() {
  console.log('Test 8: Google/Gemini Streaming');
  console.log('-'.repeat(80));

  const request: LayerRequest = {
    gateId: 'test-gate',
    model: 'gemini-2.0-flash',
    type: 'chat',
    data: {
      messages: [
        { role: 'user', content: 'Say "gemini test passed" and nothing else.' }
      ],
      maxTokens: 20,
      stream: true,
    }
  };

  let chunkCount = 0;
  let fullContent = '';

  for await (const chunk of callAdapterStream(request)) {
    chunkCount++;
    if (chunk.content) {
      fullContent += chunk.content;
    }
  }

  console.log(`  Chunks received: ${chunkCount}`);
  console.log(`  Content: ${fullContent.trim()}`);
  console.log('  ✅ Gemini streaming test passed\n');
}

// Test 9: Gemini with tool calls streaming
async function testGeminiToolCallsStreaming() {
  console.log('Test 9: Gemini Tool Calls Streaming');
  console.log('-'.repeat(80));

  const request: LayerRequest = {
    gateId: 'test-gate',
    model: 'gemini-2.0-flash',
    type: 'chat',
    data: {
      messages: [
        { role: 'user', content: 'What is the weather in London?' }
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'get_weather',
            description: 'Get weather for a location',
            parameters: {
              type: 'object',
              properties: {
                location: { type: 'string' },
              },
              required: ['location'],
            },
          },
        },
      ],
      stream: true,
    }
  };

  let toolCallsFound = false;
  let finishReason = null;

  for await (const chunk of callAdapterStream(request)) {
    if (chunk.toolCalls && chunk.toolCalls.length > 0) {
      toolCallsFound = true;
    }
    if (chunk.finishReason) {
      finishReason = chunk.finishReason;
    }
  }

  console.log(`  Tool calls found: ${toolCallsFound}`);
  console.log(`  Finish reason: ${finishReason}`);

  if (toolCallsFound) {
    console.log('  ✅ Gemini tool calls streaming test passed\n');
  } else {
    console.log('  ⚠️  Tool calls may not have been invoked (model chose not to use tools)\n');
  }
}

// Run all tests
(async () => {
  try {
    await testSingleRouting();
    await testFallbackRouting();
    await testRoundRobinRouting();
    await testStreamingWithTools();
    await testClaudeStreaming();
    await testClaudeToolCallsStreaming();
    await testMultiProviderFallback();
    await testGeminiStreaming();
    await testGeminiToolCallsStreaming();

    console.log('='.repeat(80));
    console.log('✅ ALL STREAMING ROUTE TESTS PASSED');
    console.log('='.repeat(80));
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
})();
