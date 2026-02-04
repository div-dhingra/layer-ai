#!/usr/bin/env npx tsx
/**
 * Test structured output at the chat route level
 * Tests that gate configuration flows correctly through resolveFinalRequest
 */

import type { LayerRequest, Gate, ChatRequest } from '@layer-ai/sdk';

// We'll test the resolveFinalRequest function directly
// This simulates what happens in the chat route

console.log('='.repeat(80));
console.log('STRUCTURED OUTPUT - CHAT ROUTE LEVEL TESTS');
console.log('='.repeat(80));
console.log('');

// Mock gate config
const baseGateConfig: Gate = {
  id: 'test-gate-id',
  name: 'Test Gate',
  model: 'gpt-4o',
  taskType: 'chat',
  temperature: 0.7,
  maxTokens: 100,
  topP: 0.9,
  systemPrompt: undefined,
  routingStrategy: 'single',
  responseFormatEnabled: false,
  responseFormatType: 'text',
  responseFormatSchema: undefined,
  // Add other required fields for Gate
  userId: 'test-user',
  createdAt: new Date(),
  updatedAt: new Date(),
};

async function testOpenAIJsonObjectMode() {
  console.log('Test 1: OpenAI - JSON Object Mode (Native)');
  console.log('-'.repeat(80));

  const gateConfig: Gate = {
    ...baseGateConfig,
    model: 'gpt-4o',
    responseFormatEnabled: true,
    responseFormatType: 'json_object',
  };

  const incomingRequest: LayerRequest = {
    gateId: 'test-gate',
    type: 'chat',
    data: {
      messages: [
        { role: 'user', content: 'Generate a user profile' }
      ],
    }
  };

  try {
    // Import the function we need to test
    const { resolveFinalRequest } = await import('../v3/chat.js');
    const resolvedRequest = resolveFinalRequest(gateConfig, incomingRequest);

    console.log('✓ Request resolved');
    console.log('');
    console.log('Resolved request model:', resolvedRequest.model);
    console.log('Resolved request responseFormat:', (resolvedRequest.data as ChatRequest).responseFormat);
    console.log('');

    // Validate
    if ((resolvedRequest.data as ChatRequest).responseFormat !== 'json_object') {
      throw new Error(`Expected responseFormat 'json_object', got: ${(resolvedRequest.data as ChatRequest).responseFormat}`);
    }

    console.log('✅ OpenAI JSON Object Mode: PASSED');
    console.log('');
    return true;
  } catch (error: any) {
    console.log('❌ OpenAI JSON Object Mode: FAILED');
    console.log('Error:', error.message);
    console.log('');
    return false;
  }
}

async function testOpenAIJsonSchemaMode() {
  console.log('Test 2: OpenAI - JSON Schema Mode (Native)');
  console.log('-'.repeat(80));

  const schema = {
    type: 'json_schema' as const,
    json_schema: {
      name: 'user_profile',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
          city: { type: 'string' },
        },
        required: ['name', 'age', 'city'],
        additionalProperties: false,
      },
    },
  };

  const gateConfig: Gate = {
    ...baseGateConfig,
    model: 'gpt-4o',
    responseFormatEnabled: true,
    responseFormatType: 'json_schema',
    responseFormatSchema: schema,
  };

  const incomingRequest: LayerRequest = {
    gateId: 'test-gate',
    type: 'chat',
    data: {
      messages: [
        { role: 'user', content: 'Create a profile for John Doe, age 30, from New York' }
      ],
    }
  };

  try {
    const { resolveFinalRequest } = await import('../v3/chat.js');
    const resolvedRequest = resolveFinalRequest(gateConfig, incomingRequest);

    console.log('✓ Request resolved');
    console.log('');
    console.log('Resolved request model:', resolvedRequest.model);
    console.log('Resolved request responseFormat type:', ((resolvedRequest.data as ChatRequest).responseFormat as any)?.type);
    console.log('');

    // Validate
    const responseFormat = (resolvedRequest.data as ChatRequest).responseFormat as any;
    if (!responseFormat || responseFormat.type !== 'json_schema') {
      throw new Error(`Expected responseFormat.type 'json_schema', got: ${responseFormat?.type}`);
    }

    if (!responseFormat.json_schema) {
      throw new Error('Expected json_schema property in responseFormat');
    }

    console.log('✅ OpenAI JSON Schema Mode: PASSED');
    console.log('');
    return true;
  } catch (error: any) {
    console.log('❌ OpenAI JSON Schema Mode: FAILED');
    console.log('Error:', error.message);
    console.log('');
    return false;
  }
}

async function testAnthropicBetaMode() {
  console.log('Test 3: Anthropic - JSON Object Mode (Beta - Prompt Injection)');
  console.log('-'.repeat(80));

  const gateConfig: Gate = {
    ...baseGateConfig,
    model: 'claude-3-7-sonnet-20250219',
    responseFormatEnabled: true,
    responseFormatType: 'json_object',
  };

  const incomingRequest: LayerRequest = {
    gateId: 'test-gate',
    type: 'chat',
    data: {
      messages: [
        { role: 'user', content: 'Generate a user profile' }
      ],
    }
  };

  try {
    const { resolveFinalRequest } = await import('../v3/chat.js');
    const resolvedRequest = resolveFinalRequest(gateConfig, incomingRequest);

    console.log('✓ Request resolved');
    console.log('');
    console.log('Resolved request model:', resolvedRequest.model);
    console.log('System prompt length:', (resolvedRequest.data as ChatRequest).systemPrompt?.length || 0);
    console.log('');

    // Validate - should have JSON instructions in system prompt
    const systemPrompt = (resolvedRequest.data as ChatRequest).systemPrompt || '';
    if (!systemPrompt.includes('JSON')) {
      throw new Error('Expected JSON instructions in system prompt for beta mode');
    }

    // Should NOT have responseFormat set (beta mode uses prompt injection)
    if ((resolvedRequest.data as ChatRequest).responseFormat && (resolvedRequest.data as ChatRequest).responseFormat !== 'text') {
      throw new Error('Beta mode should not set responseFormat');
    }

    console.log('✓ System prompt contains JSON instructions');
    console.log('System prompt excerpt:');
    console.log(systemPrompt.substring(0, 150) + '...');
    console.log('');
    console.log('✅ Anthropic Beta Mode: PASSED');
    console.log('');
    return true;
  } catch (error: any) {
    console.log('❌ Anthropic Beta Mode: FAILED');
    console.log('Error:', error.message);
    console.log('');
    return false;
  }
}

async function testGoogleBetaMode() {
  console.log('Test 4: Google - JSON Schema Mode (Beta - Prompt Injection)');
  console.log('-'.repeat(80));

  const schema = {
    type: 'json_schema' as const,
    json_schema: {
      name: 'user_profile',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
        required: ['name', 'age'],
        additionalProperties: false,
      },
    },
  };

  const gateConfig: Gate = {
    ...baseGateConfig,
    model: 'gemini-2.0-flash',
    responseFormatEnabled: true,
    responseFormatType: 'json_schema',
    responseFormatSchema: schema,
  };

  const incomingRequest: LayerRequest = {
    gateId: 'test-gate',
    type: 'chat',
    data: {
      messages: [
        { role: 'user', content: 'Create a profile' }
      ],
    }
  };

  try {
    const { resolveFinalRequest } = await import('../v3/chat.js');
    const resolvedRequest = resolveFinalRequest(gateConfig, incomingRequest);

    console.log('✓ Request resolved');
    console.log('');
    console.log('Resolved request model:', resolvedRequest.model);
    console.log('System prompt length:', (resolvedRequest.data as ChatRequest).systemPrompt?.length || 0);
    console.log('');

    // Validate - should have schema in system prompt
    const systemPrompt = (resolvedRequest.data as ChatRequest).systemPrompt || '';
    if (!systemPrompt.includes('JSON')) {
      throw new Error('Expected JSON instructions in system prompt');
    }
    if (!systemPrompt.includes('"name"') || !systemPrompt.includes('"age"')) {
      throw new Error('Expected schema properties in system prompt');
    }

    console.log('✓ System prompt contains schema instructions');
    console.log('✅ Google Beta Mode: PASSED');
    console.log('');
    return true;
  } catch (error: any) {
    console.log('❌ Google Beta Mode: FAILED');
    console.log('Error:', error.message);
    console.log('');
    return false;
  }
}

async function testTextModeNoChanges() {
  console.log('Test 5: Text Mode - No Modifications');
  console.log('-'.repeat(80));

  const gateConfig: Gate = {
    ...baseGateConfig,
    responseFormatEnabled: false,
    responseFormatType: 'text',
  };

  const incomingRequest: LayerRequest = {
    gateId: 'test-gate',
    type: 'chat',
    data: {
      messages: [
        { role: 'user', content: 'Say hello' }
      ],
    }
  };

  try {
    const { resolveFinalRequest } = await import('../v3/chat.js');
    const resolvedRequest = resolveFinalRequest(gateConfig, incomingRequest);

    console.log('✓ Request resolved');
    console.log('');

    // Validate - should NOT have responseFormat or JSON instructions
    if ((resolvedRequest.data as ChatRequest).responseFormat && (resolvedRequest.data as ChatRequest).responseFormat !== 'text') {
      throw new Error(`Expected no responseFormat, got: ${(resolvedRequest.data as ChatRequest).responseFormat}`);
    }

    const systemPrompt = (resolvedRequest.data as ChatRequest).systemPrompt || '';
    if (systemPrompt.includes('JSON')) {
      throw new Error('Should not have JSON instructions for text mode');
    }

    console.log('✓ No response format applied');
    console.log('✅ Text Mode: PASSED');
    console.log('');
    return true;
  } catch (error: any) {
    console.log('❌ Text Mode: FAILED');
    console.log('Error:', error.message);
    console.log('');
    return false;
  }
}

async function runTests() {
  const results: boolean[] = [];

  results.push(await testOpenAIJsonObjectMode());
  results.push(await testOpenAIJsonSchemaMode());
  results.push(await testAnthropicBetaMode());
  results.push(await testGoogleBetaMode());
  results.push(await testTextModeNoChanges());

  console.log('='.repeat(80));
  console.log('RESULTS SUMMARY');
  console.log('='.repeat(80));
  console.log('');

  const passed = results.filter(r => r).length;
  const failed = results.filter(r => !r).length;

  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log('');

  if (failed > 0) {
    console.log('❌ Some tests failed');
    process.exit(1);
  } else {
    console.log('✅ All tests passed!');
  }
}

runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
