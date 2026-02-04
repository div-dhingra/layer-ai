#!/usr/bin/env npx tsx
/**
 * Focused tests for JSON response format structure
 * Tests ONLY the structured output feature at the adapter level
 */

import { OpenAIAdapter } from '../openai-adapter.js';
import type { LayerRequest } from '@layer-ai/sdk';

const adapter = new OpenAIAdapter();

console.log('='.repeat(80));
console.log('STRUCTURED OUTPUT - ADAPTER LEVEL TESTS');
console.log('='.repeat(80));
console.log('');

async function testJsonObjectMode() {
  console.log('Test 1: JSON Object Mode');
  console.log('-'.repeat(80));

  const request: LayerRequest = {
    gateId: 'test-gate',
    model: 'gpt-4o-mini',
    type: 'chat',
    data: {
      messages: [
        { role: 'user', content: 'Generate a JSON user profile with name, age, and city fields' }
      ],
      responseFormat: 'json_object',
      maxTokens: 100,
    }
  };

  try {
    const response = await adapter.call(request);

    console.log('✓ Request completed');
    console.log('');
    console.log('Raw response content:');
    console.log(response.content);
    console.log('');

    // Try to parse as JSON
    const parsed = JSON.parse(response.content || '');
    console.log('✓ Successfully parsed as JSON');
    console.log('');
    console.log('Parsed structure:');
    console.log(JSON.stringify(parsed, null, 2));
    console.log('');
    console.log('✅ JSON Object Mode: PASSED');
    console.log('');
    return true;
  } catch (error: any) {
    console.log('❌ JSON Object Mode: FAILED');
    console.log('Error:', error.message);
    console.log('');
    return false;
  }
}

async function testJsonSchemaMode() {
  console.log('Test 2: JSON Schema Mode');
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

  const request: LayerRequest = {
    gateId: 'test-gate',
    model: 'gpt-4o',
    type: 'chat',
    data: {
      messages: [
        { role: 'user', content: 'Create a profile for John Doe, age 30, from New York' }
      ],
      responseFormat: schema,
      maxTokens: 100,
    }
  };

  try {
    const response = await adapter.call(request);

    console.log('✓ Request completed');
    console.log('');
    console.log('Raw response content:');
    console.log(response.content);
    console.log('');

    // Try to parse as JSON
    const parsed = JSON.parse(response.content || '');
    console.log('✓ Successfully parsed as JSON');
    console.log('');
    console.log('Parsed structure:');
    console.log(JSON.stringify(parsed, null, 2));
    console.log('');

    // Validate schema fields
    const hasRequiredFields = parsed.name && typeof parsed.age === 'number' && parsed.city;
    if (!hasRequiredFields) {
      throw new Error('Missing required fields from schema');
    }
    console.log('✓ Schema validation passed');
    console.log('');
    console.log('✅ JSON Schema Mode: PASSED');
    console.log('');
    return true;
  } catch (error: any) {
    console.log('❌ JSON Schema Mode: FAILED');
    console.log('Error:', error.message);
    console.log('');
    return false;
  }
}

async function testTextMode() {
  console.log('Test 3: Text Mode (Control Test)');
  console.log('-'.repeat(80));

  const request: LayerRequest = {
    gateId: 'test-gate',
    model: 'gpt-4o-mini',
    type: 'chat',
    data: {
      messages: [
        { role: 'user', content: 'Say hello' }
      ],
      responseFormat: 'text',
      maxTokens: 50,
    }
  };

  try {
    const response = await adapter.call(request);

    console.log('✓ Request completed');
    console.log('');
    console.log('Response content:');
    console.log(response.content);
    console.log('');
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

  results.push(await testJsonObjectMode());
  results.push(await testJsonSchemaMode());
  results.push(await testTextMode());

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
