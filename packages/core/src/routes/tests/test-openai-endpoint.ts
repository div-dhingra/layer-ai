#!/usr/bin/env npx tsx

import type { OpenAIChatCompletionRequest, OpenAIChatCompletionResponse, OpenAIChatCompletionChunk } from '@layer-ai/sdk';

console.log('='.repeat(80));
console.log('OPENAI-COMPATIBLE ENDPOINT TESTS');
console.log('='.repeat(80));
console.log('');

const BASE_URL = process.env.API_URL || 'http://localhost:3004';
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
  console.log('Test 1: Non-streaming basic chat completion');
  console.log('-'.repeat(80));

  const request: OpenAIChatCompletionRequest = {
    model: 'gpt-4o',
    messages: [
      { role: 'user', content: 'Say "test passed" and nothing else.' }
    ],
    max_tokens: 10,
    gateId: GATE_ID,
  };

  const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
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

  const data = await response.json() as OpenAIChatCompletionResponse;

  console.log('  Response ID:', data.id);
  console.log('  Model:', data.model);
  console.log('  Content:', data.choices[0].message.content);
  console.log('  Finish reason:', data.choices[0].finish_reason);
  console.log('  Usage:', data.usage);
  console.log('  ✅ Non-streaming basic test passed\n');
}

async function testNonStreamingWithGateIdInHeader() {
  console.log('Test 2: Non-streaming with gateId in header');
  console.log('-'.repeat(80));

  const request: OpenAIChatCompletionRequest = {
    model: 'gpt-4o',
    messages: [
      { role: 'user', content: 'Say "header test passed" and nothing else.' }
    ],
    max_tokens: 10,
  };

  const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
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

  const data = await response.json() as OpenAIChatCompletionResponse;

  console.log('  Content:', data.choices[0].message.content);
  console.log('  ✅ Header gateId test passed\n');
}

async function testStreamingBasic() {
  console.log('Test 3: Streaming basic chat completion');
  console.log('-'.repeat(80));

  const request: OpenAIChatCompletionRequest = {
    model: 'gpt-4o',
    messages: [
      { role: 'user', content: 'Count from 1 to 3, one number per line.' }
    ],
    max_tokens: 50,
    stream: true,
    gateId: GATE_ID,
  };

  const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
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

  let chunkCount = 0;
  let fullContent = '';
  let finalUsage = null;

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('No response body reader');
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value);
    const lines = text.split('\n').filter(line => line.trim().startsWith('data: '));

    for (const line of lines) {
      const data = line.replace('data: ', '').trim();
      if (data === '[DONE]') {
        continue;
      }

      try {
        const chunk = JSON.parse(data) as OpenAIChatCompletionChunk;
        chunkCount++;

        if (chunk.choices[0].delta.content) {
          fullContent += chunk.choices[0].delta.content;
        }

        if (chunk.usage) {
          finalUsage = chunk.usage;
        }
      } catch (e) {
        // Skip invalid JSON
      }
    }
  }

  console.log('  Chunks received:', chunkCount);
  console.log('  Full content:', fullContent.trim());
  console.log('  Final usage:', finalUsage);
  console.log('  ✅ Streaming basic test passed\n');
}

async function testWithToolCalls() {
  console.log('Test 4: Non-streaming with tool calls');
  console.log('-'.repeat(80));

  const request: OpenAIChatCompletionRequest = {
    model: 'gpt-4o',
    messages: [
      { role: 'user', content: 'What is the weather in Paris?' }
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
                description: 'The city and state, e.g. Paris, France',
              },
            },
            required: ['location'],
          },
        },
      },
    ],
    tool_choice: 'auto',
    gateId: GATE_ID,
  };

  const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
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

  const data = await response.json() as OpenAIChatCompletionResponse;

  console.log('  Finish reason:', data.choices[0].finish_reason);

  if (data.choices[0].message.tool_calls && data.choices[0].message.tool_calls.length > 0) {
    console.log('  Tool calls:', JSON.stringify(data.choices[0].message.tool_calls, null, 2));
    console.log('  ✅ Tool calls test passed\n');
  } else {
    console.log('  ⚠️  No tool calls received (model may have chosen not to use tools)\n');
  }
}

async function testClaudeModel() {
  console.log('Test 5: OpenAI format with Claude model');
  console.log('-'.repeat(80));

  const request: OpenAIChatCompletionRequest = {
    model: 'claude-3-7-sonnet-20250219',
    messages: [
      { role: 'user', content: 'Say "claude via openai format works" and nothing else.' }
    ],
    max_tokens: 20,
    gateId: GATE_ID,
  };

  const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
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

  const data = await response.json() as OpenAIChatCompletionResponse;

  console.log('  Model:', data.model);
  console.log('  Content:', data.choices[0].message.content);
  console.log('  ✅ Claude model test passed\n');
}

async function testGeminiModel() {
  console.log('Test 6: OpenAI format with Gemini model');
  console.log('-'.repeat(80));

  const request: OpenAIChatCompletionRequest = {
    model: 'gemini-2.0-flash',
    messages: [
      { role: 'user', content: 'Say "gemini via openai format works" and nothing else.' }
    ],
    max_tokens: 20,
    gateId: GATE_ID,
  };

  const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
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

  const data = await response.json() as OpenAIChatCompletionResponse;

  console.log('  Model:', data.model);
  console.log('  Content:', data.choices[0].message.content);
  console.log('  ✅ Gemini model test passed\n');
}

async function testMistralModel() {
  console.log('Test 7: OpenAI format with Mistral model');
  console.log('-'.repeat(80));

  const request: OpenAIChatCompletionRequest = {
    model: 'mistral-small-2501',
    messages: [
      { role: 'user', content: 'Say "mistral via openai format works" and nothing else.' }
    ],
    max_tokens: 20,
    gateId: GATE_ID,
  };

  const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
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

  const data = await response.json() as OpenAIChatCompletionResponse;

  console.log('  Model:', data.model);
  console.log('  Content:', data.choices[0].message.content);
  console.log('  ✅ Mistral model test passed\n');
}

(async () => {
  try {
    await testNonStreamingBasic();
    await testNonStreamingWithGateIdInHeader();
    await testStreamingBasic();
    await testWithToolCalls();
    await testClaudeModel();
    await testGeminiModel();
    await testMistralModel();

    console.log('='.repeat(80));
    console.log('✅ ALL OPENAI-COMPATIBLE ENDPOINT TESTS PASSED');
    console.log('='.repeat(80));
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
})();
