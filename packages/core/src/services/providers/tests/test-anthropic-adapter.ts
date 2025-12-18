import { AnthropicAdapter } from '../anthropic-adapter.js';
import type { LayerRequest } from '@layer-ai/sdk';

const adapter = new AnthropicAdapter();

async function testChatCompletion() {
  console.log('Testing chat completion...');

  const request: LayerRequest = {
    gate: 'test-gate',
    model: 'claude-sonnet-4-5-20250929',
    type: 'chat',
    data: {
      messages: [
        { role: 'user', content: 'Say "Hello World" and nothing else.' }
      ],
      temperature: 0.7,
      maxTokens: 10,
    }
  };

  const response = await adapter.call(request);
  console.log('Response:', response.content);
  console.log('Tokens:', response.usage);
  console.log('Cost:', response.cost);
  console.log('Latency:', response.latencyMs + 'ms');
  console.log('Finish reason:', response.finishReason);
  console.log('✅ Chat completion test passed\n');
}

async function testChatWithVision() {
  console.log('Testing chat with vision...');

  const request: LayerRequest = {
    gate: 'test-gate',
    model: 'claude-sonnet-4-5-20250929',
    type: 'chat',
    data: {
      messages: [
        {
          role: 'user',
          content: 'What color is the sky in this image?',
          images: [{
            url: 'https://images.unsplash.com/photo-1765202659641-9ad9facfe5cf?q=80&w=1364&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          }]
        }
      ],
      maxTokens: 50,
    }
  };

  const response = await adapter.call(request);
  console.log('Response:', response.content);
  console.log('Finish reason:', response.finishReason);
  console.log('✅ Vision test passed\n');
}

async function testToolCalls() {
  console.log('Testing tool calls...');

  const request: LayerRequest = {
    gate: 'test-gate',
    model: 'claude-sonnet-4-5-20250929',
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
      maxTokens: 100,
    }
  };

  const response = await adapter.call(request);
  console.log('Response:', response.content);
  console.log('Tool calls:', response.toolCalls);
  console.log('Finish reason:', response.finishReason);

  if (response.toolCalls && response.toolCalls.length > 0) {
    console.log('✅ Tool calls test passed\n');
  } else {
    throw new Error('Expected tool calls but got none');
  }
}

async function runTests() {
  try {
    await testChatCompletion();
    await testChatWithVision();
    await testToolCalls();

    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

runTests();
