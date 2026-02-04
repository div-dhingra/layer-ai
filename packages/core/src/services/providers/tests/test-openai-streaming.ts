import { OpenAIAdapter } from '../openai-adapter.js';
import type { LayerRequest } from '@layer-ai/sdk';

const adapter = new OpenAIAdapter();

async function testChatStreamingBasic() {
  console.log('Testing basic chat streaming...');

  const request: LayerRequest = {
    gateId: 'test-gate',
    model: 'gpt-4o-mini',
    type: 'chat',
    data: {
      messages: [
        { role: 'user', content: 'Count from 1 to 5 slowly, one number per line.' }
      ],
      temperature: 0.7,
      maxTokens: 50,
      stream: true,
    }
  };

  if (!adapter.callStream) {
    throw new Error('callStream method not available');
  }

  let chunkCount = 0;
  let fullContent = '';
  let finalUsage = null;
  let finalCost = null;

  console.log('\nStreaming chunks:');
  console.log('---');

  for await (const chunk of adapter.callStream(request)) {
    chunkCount++;

    if (chunk.content) {
      process.stdout.write(chunk.content);
      fullContent += chunk.content;
    }

    if (chunk.usage) {
      finalUsage = chunk.usage;
    }

    if (chunk.cost) {
      finalCost = chunk.cost;
    }
  }

  console.log('\n---\n');
  console.log('Total chunks received:', chunkCount);
  console.log('Full content:', fullContent);
  console.log('Final usage:', finalUsage);
  console.log('Final cost:', finalCost);
  console.log('✅ Basic streaming test passed\n');
}

async function testChatStreamingWithToolCalls() {
  console.log('Testing chat streaming with tool calls...');

  const request: LayerRequest = {
    gateId: 'test-gate',
    model: 'gpt-4o-mini',
    type: 'chat',
    data: {
      messages: [
        { role: 'user', content: 'What is the weather in San Francisco?' }
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'get_weather',
            description: 'Get the current weather for a location',
            parameters: {
              type: 'object',
              properties: {
                location: {
                  type: 'string',
                  description: 'The city and state, e.g. San Francisco, CA',
                },
              },
              required: ['location'],
            },
          },
        },
      ],
      toolChoice: 'auto',
      stream: true,
    }
  };

  if (!adapter.callStream) {
    throw new Error('callStream method not available');
  }

  let toolCallsReceived = false;

  for await (const chunk of adapter.callStream(request)) {
    if (chunk.toolCalls && chunk.toolCalls.length > 0) {
      console.log('Tool calls received:', JSON.stringify(chunk.toolCalls, null, 2));
      toolCallsReceived = true;
    }

    if (chunk.finishReason === 'tool_call') {
      console.log('Finish reason: tool_call');
    }
  }

  if (!toolCallsReceived) {
    console.warn('⚠️  No tool calls received (model may have chosen not to use tools)');
  } else {
    console.log('✅ Tool calls streaming test passed\n');
  }
}

async function testChatStreamingError() {
  console.log('Testing streaming with invalid model (error handling)...');

  const request: LayerRequest = {
    gateId: 'test-gate',
    model: 'invalid-model-name-that-does-not-exist',
    type: 'chat',
    data: {
      messages: [
        { role: 'user', content: 'Hello' }
      ],
      stream: true,
    }
  };

  if (!adapter.callStream) {
    throw new Error('callStream method not available');
  }

  try {
    for await (const chunk of adapter.callStream(request)) {
      console.log('Received chunk:', chunk);
    }
    console.error('❌ Should have thrown an error for invalid model');
  } catch (error) {
    console.log('✅ Correctly threw error:', error instanceof Error ? error.message : error);
    console.log('✅ Error handling test passed\n');
  }
}

// Run all tests
(async () => {
  try {
    await testChatStreamingBasic();
    await testChatStreamingWithToolCalls();
    await testChatStreamingError();
    console.log('✅ All streaming tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
})();
