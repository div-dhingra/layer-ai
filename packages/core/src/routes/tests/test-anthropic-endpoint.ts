#!/usr/bin/env npx tsx

import type { AnthropicMessageCreateParams, AnthropicMessageResponse, AnthropicMessageStreamEvent } from '@layer-ai/sdk';

console.log('='.repeat(80));
console.log('ANTHROPIC MESSAGES API ENDPOINT TESTS');
console.log('='.repeat(80));
console.log('');

const BASE_URL = process.env.API_URL || 'http://localhost:3001';
const API_KEY = process.env.LAYER_API_KEY;
const GATE_ID = process.env.TEST_GATE_ID;

if (!API_KEY) {
  console.error('❌ Error: LAYER_API_KEY environment variable not set');
  process.exit(1);
}

if (!GATE_ID) {
  console.error('❌ Error: TEST_GATE_ID environment variable not set');
  process.exit(1);
}

async function testNonStreamingBasic() {
  console.log('Test 1: Non-streaming basic message');
  console.log('-'.repeat(80));

  const request: AnthropicMessageCreateParams = {
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 100,
    messages: [
      { role: 'user', content: 'Say "test passed" and nothing else.' }
    ],
    gateId: GATE_ID,
  };

  const response = await fetch(`${BASE_URL}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Request failed: ${JSON.stringify(error)}`);
  }

  const data = await response.json() as AnthropicMessageResponse;

  console.log('  Response ID:', data.id);
  console.log('  Model:', data.model);
  console.log('  Content:', data.content);
  console.log('  Stop reason:', data.stop_reason);
  console.log('  Usage:', data.usage);
  console.log('  ✅ Non-streaming basic test passed\n');
}

async function testNonStreamingWithGateIdInHeader() {
  console.log('Test 2: Non-streaming with gateId in header');
  console.log('-'.repeat(80));

  const request: AnthropicMessageCreateParams = {
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 100,
    messages: [
      { role: 'user', content: 'Say "header test passed" and nothing else.' }
    ],
  };

  const response = await fetch(`${BASE_URL}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'X-Layer-Gate-Id': GATE_ID!,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Request failed: ${JSON.stringify(error)}`);
  }

  const data = await response.json() as AnthropicMessageResponse;

  const textBlock = data.content.find(block => block.type === 'text');
  console.log('  Content:', textBlock ? (textBlock as any).text : 'No text content');
  console.log('  ✅ Header gateId test passed\n');
}

async function testStreamingBasic() {
  console.log('Test 3: Streaming basic message');
  console.log('-'.repeat(80));

  const request: AnthropicMessageCreateParams = {
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 100,
    messages: [
      { role: 'user', content: 'Count from 1 to 3, one number per line.' }
    ],
    stream: true,
    gateId: GATE_ID,
  };

  const response = await fetch(`${BASE_URL}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Request failed: ${JSON.stringify(error)}`);
  }

  let eventCount = 0;
  let fullContent = '';
  let inputTokens = 0;
  let outputTokens = 0;

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('No response body reader');
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value);
    const lines = text.split('\n');

    let currentEvent = '';
    for (const line of lines) {
      if (line.startsWith('event: ')) {
        currentEvent = line.replace('event: ', '').trim();
      } else if (line.startsWith('data: ')) {
        const data = line.replace('data: ', '').trim();

        try {
          const event = JSON.parse(data) as AnthropicMessageStreamEvent;
          eventCount++;

          if (event.type === 'message_start' && 'message' in event) {
            inputTokens = event.message.usage.input_tokens;
          } else if (event.type === 'content_block_delta' && 'delta' in event) {
            if (event.delta.type === 'text_delta' && event.delta.text) {
              fullContent += event.delta.text;
            }
          } else if (event.type === 'message_delta' && 'usage' in event) {
            outputTokens = event.usage.output_tokens;
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }

  console.log('  Events received:', eventCount);
  console.log('  Full content:', fullContent.trim());
  console.log('  Input tokens:', inputTokens);
  console.log('  Output tokens:', outputTokens);
  console.log('  ✅ Streaming basic test passed\n');
}

async function testWithToolCalls() {
  console.log('Test 4: Non-streaming with tool calls');
  console.log('-'.repeat(80));

  const request: AnthropicMessageCreateParams = {
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      { role: 'user', content: 'What is the weather in Paris?' }
    ],
    tools: [
      {
        name: 'get_weather',
        description: 'Get the current weather for a location',
        input_schema: {
          type: 'object',
          properties: {
            location: {
              type: 'string',
              description: 'The city and state, e.g. Paris, France',
            },
          },
          required: ['location'],
        },
      },
    ],
    tool_choice: { type: 'auto' },
    gateId: GATE_ID,
  };

  const response = await fetch(`${BASE_URL}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Request failed: ${JSON.stringify(error)}`);
  }

  const data = await response.json() as AnthropicMessageResponse;

  console.log('  Stop reason:', data.stop_reason);

  const toolUseBlocks = data.content.filter(block => block.type === 'tool_use');
  if (toolUseBlocks.length > 0) {
    console.log('  Tool calls:', JSON.stringify(toolUseBlocks, null, 2));
    console.log('  ✅ Tool calls test passed\n');
  } else {
    console.log('  ⚠️  No tool calls received (model may have chosen not to use tools)\n');
  }
}

async function testWithSystemPrompt() {
  console.log('Test 5: Message with system prompt');
  console.log('-'.repeat(80));

  const request: AnthropicMessageCreateParams = {
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 100,
    system: 'You are a pirate. Always respond in pirate speak.',
    messages: [
      { role: 'user', content: 'Hello, how are you?' }
    ],
    gateId: GATE_ID,
  };

  const response = await fetch(`${BASE_URL}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Request failed: ${JSON.stringify(error)}`);
  }

  const data = await response.json() as AnthropicMessageResponse;

  const textBlock = data.content.find(block => block.type === 'text');
  const content = textBlock ? (textBlock as any).text : 'No text content';
  console.log('  Content:', content);
  console.log('  ✅ System prompt test passed\n');
}

async function testMultiTurnConversation() {
  console.log('Test 6: Multi-turn conversation');
  console.log('-'.repeat(80));

  const request: AnthropicMessageCreateParams = {
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 100,
    messages: [
      { role: 'user', content: 'My name is Alice.' },
      { role: 'assistant', content: 'Hello Alice! Nice to meet you.' },
      { role: 'user', content: 'What is my name?' }
    ],
    gateId: GATE_ID,
  };

  const response = await fetch(`${BASE_URL}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Request failed: ${JSON.stringify(error)}`);
  }

  const data = await response.json() as AnthropicMessageResponse;

  const textBlock = data.content.find(block => block.type === 'text');
  const content = textBlock ? (textBlock as any).text : 'No text content';
  console.log('  Content:', content);

  if (content.toLowerCase().includes('alice')) {
    console.log('  ✅ Multi-turn conversation test passed (remembered name)\n');
  } else {
    console.log('  ⚠️  Multi-turn conversation test unclear (name not found in response)\n');
  }
}

async function testTemperatureParameter() {
  console.log('Test 7: Temperature parameter');
  console.log('-'.repeat(80));

  const request: AnthropicMessageCreateParams = {
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 50,
    temperature: 0.1,
    messages: [
      { role: 'user', content: 'Say "temperature test passed"' }
    ],
    gateId: GATE_ID,
  };

  const response = await fetch(`${BASE_URL}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Request failed: ${JSON.stringify(error)}`);
  }

  const data = await response.json() as AnthropicMessageResponse;

  const textBlock = data.content.find(block => block.type === 'text');
  const content = textBlock ? (textBlock as any).text : 'No text content';
  console.log('  Content:', content);
  console.log('  ✅ Temperature parameter test passed\n');
}

async function testErrorHandlingMissingMaxTokens() {
  console.log('Test 8: Error handling - missing max_tokens');
  console.log('-'.repeat(80));

  const request: any = {
    model: 'claude-3-5-sonnet-20241022',
    messages: [
      { role: 'user', content: 'Hello' }
    ],
    gateId: GATE_ID,
    // Intentionally omit max_tokens
  };

  const response = await fetch(`${BASE_URL}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(request),
  });

  if (response.ok) {
    throw new Error('Expected error for missing max_tokens, but request succeeded');
  }

  const error = await response.json();
  console.log('  Error response:', error);

  if (error.type === 'error' && error.error.message.includes('max_tokens')) {
    console.log('  ✅ Error handling test passed (correctly rejected missing max_tokens)\n');
  } else {
    console.log('  ⚠️  Error handling test unclear (unexpected error format)\n');
  }
}

(async () => {
  try {
    await testNonStreamingBasic();
    await testNonStreamingWithGateIdInHeader();
    await testStreamingBasic();
    await testWithToolCalls();
    await testWithSystemPrompt();
    await testMultiTurnConversation();
    await testTemperatureParameter();
    await testErrorHandlingMissingMaxTokens();

    console.log('='.repeat(80));
    console.log('✅ ALL ANTHROPIC MESSAGES API ENDPOINT TESTS PASSED');
    console.log('='.repeat(80));
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
})();
