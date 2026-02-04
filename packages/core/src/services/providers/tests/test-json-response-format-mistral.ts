#!/usr/bin/env npx tsx
/**
 * Focused tests for JSON response format structure - Mistral Provider
 * Tests structured output with prompt engineering (beta mode)
 */

import { MistralAdapter } from '../mistral-adapter.js';
import type { LayerRequest } from '@layer-ai/sdk';

const adapter = new MistralAdapter();

console.log('='.repeat(80));
console.log('STRUCTURED OUTPUT - MISTRAL ADAPTER TESTS (BETA MODE)');
console.log('='.repeat(80));
console.log('');

// Helper to extract JSON from markdown or plain text
function extractJSON(content: string): any {
  const codeBlockMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    return JSON.parse(codeBlockMatch[1].trim());
  }
  return JSON.parse(content.trim());
}

async function testJsonObjectModeBeta() {
  console.log('Test 1: JSON Object Mode (Beta - Prompt Engineering)');
  console.log('-'.repeat(80));

  const request: LayerRequest = {
    gateId: 'test-gate',
    model: 'mistral-medium-2508',
    type: 'chat',
    data: {
      messages: [
        { role: 'user', content: 'Generate a user profile with name, age, and city fields' }
      ],
      systemPrompt: 'You MUST respond with ONLY a valid JSON object. Do not include ANY text before or after the JSON. Do not wrap it in markdown code blocks. Do not add explanations. ONLY output the raw JSON object.',
      maxTokens: 150,
    }
  };

  try {
    const response = await adapter.call(request);

    console.log('✓ Request completed');
    console.log('');
    console.log('Raw response content:');
    console.log(response.content);
    console.log('');

    // Try to parse as JSON (with markdown extraction fallback)
    const parsed = extractJSON(response.content || '');
    console.log('✓ Successfully parsed as JSON');
    console.log('');
    console.log('Parsed structure:');
    console.log(JSON.stringify(parsed, null, 2));
    console.log('');
    console.log('✅ JSON Object Mode (Beta): PASSED');
    console.log('');
    return true;
  } catch (error: any) {
    console.log('❌ JSON Object Mode (Beta): FAILED');
    console.log('Error:', error.message);
    console.log('');
    return false;
  }
}

async function testJsonSchemaModeBeta() {
  console.log('Test 2: JSON Schema Mode (Beta - Prompt Engineering)');
  console.log('-'.repeat(80));

  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      age: { type: 'number' },
      city: { type: 'string' },
    },
    required: ['name', 'age', 'city'],
    additionalProperties: false,
  };

  const systemPrompt = `You MUST respond with ONLY a valid JSON object matching this schema. Do not include ANY text before or after the JSON. Do not wrap it in markdown code blocks. Do not add explanations. ONLY output the raw JSON object.

Required JSON Schema:
${JSON.stringify(schema, null, 2)}`;

  const request: LayerRequest = {
    gateId: 'test-gate',
    model: 'mistral-medium-2508',
    type: 'chat',
    data: {
      messages: [
        { role: 'user', content: 'Create data for: name=Bob Williams, age=35, city=Paris' }
      ],
      systemPrompt,
      maxTokens: 150,
    }
  };

  try {
    const response = await adapter.call(request);

    console.log('✓ Request completed');
    console.log('');
    console.log('Raw response content:');
    console.log(response.content);
    console.log('');

    // Try to parse as JSON (with markdown extraction fallback)
    const parsed = extractJSON(response.content || '');
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
    console.log('✅ JSON Schema Mode (Beta): PASSED');
    console.log('');
    return true;
  } catch (error: any) {
    console.log('❌ JSON Schema Mode (Beta): FAILED');
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
    model: 'mistral-medium-2508',
    type: 'chat',
    data: {
      messages: [
        { role: 'user', content: 'Say hello' }
      ],
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

  results.push(await testJsonObjectModeBeta());
  results.push(await testJsonSchemaModeBeta());
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
