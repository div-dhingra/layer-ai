# @layer-ai/sdk

TypeScript/JavaScript SDK for Layer AI - Intelligent LLM inference with smart routing and fallbacks.

> **v1.0.0**: This package is now **inference-only**. For admin operations (managing gates, keys, logs), use [`@layer-ai/admin`](../admin).

## Installation

```bash
npm install @layer-ai/sdk
# or
pnpm add @layer-ai/sdk
# or
yarn add @layer-ai/sdk
```

## Quick Start

```typescript
import { Layer } from '@layer-ai/sdk';

const layer = new Layer({
  apiKey: process.env.LAYER_API_KEY
});

// Make an inference request through a gate
const response = await layer.complete({
  gate: '435282da-4548-4e08-8f9e-a6104803fb8a',  // Gate ID (UUID)
  data: {
    messages: [
      { role: 'user', content: 'Explain quantum computing in simple terms' }
    ]
  }
});

console.log(response.content);
```

## Migrating from v0.x?

See the [Migration Guide](../../MIGRATION_V1.md) for detailed upgrade instructions.

**Key Changes:**
- SDK is now inference-only - use `@layer-ai/admin` for management operations
- Gate IDs (UUIDs) required instead of gate names
- Request format changed to include `data` wrapper

## Configuration

### Constructor Options

```typescript
const layer = new Layer({
  apiKey: string;        // Required: Your Layer API key
  baseUrl?: string;      // Optional: API base URL (default: https://api.uselayer.ai)
});
```

## API Reference

### `layer.complete(request)`

Send a completion request through a gate.

**Parameters:**

```typescript
{
  gate: string;          // Required: Gate ID (UUID)
  data: {
    messages: Message[]; // Required: Conversation messages
    temperature?: number;  // Optional: Override gate temperature
    maxTokens?: number;    // Optional: Override max tokens
    topP?: number;         // Optional: Override top-p sampling
  };
  model?: string;        // Optional: Override gate model
  type?: 'chat';        // Optional: Request type (default: 'chat')
}
```

**Response:**

```typescript
{
  content: string;       // Generated text
  model: string;         // Model used (may differ from requested if fallback occurred)
  finishReason: string;  // Why generation stopped
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: number;          // Cost in USD
  latencyMs: number;     // Request latency
}
```

**Example:**

```typescript
const response = await layer.complete({
  gate: '435282da-4548-4e08-8f9e-a6104803fb8a',
  data: {
    messages: [
      { role: 'system', content: 'You are a helpful coding assistant' },
      { role: 'user', content: 'Write a hello world function in Python' }
    ],
    temperature: 0.7,
    maxTokens: 500
  }
});

console.log(response.content);
console.log(`Cost: $${response.cost.toFixed(6)}`);
console.log(`Tokens: ${response.usage.totalTokens}`);
```

### `layer.models`

Access to the model registry utilities.

```typescript
// Get all available models
const models = layer.models.getAll();

// Get models by provider
const openaiModels = layer.models.getByProvider('openai');

// Get model metadata
const model = layer.models.get('gpt-4o');
```

## Smart Routing & Fallbacks

Layer AI automatically handles model fallbacks when configured:

```typescript
// If your gate has fallback models configured:
// Primary: gpt-4o
// Fallbacks: [claude-sonnet-4, gemini-2.0-flash-exp]

const response = await layer.complete({
  gate: 'my-gate-id',
  data: { messages: [...] }
});

// If gpt-4o fails, automatically tries claude-sonnet-4
// If that fails, tries gemini-2.0-flash-exp
// Returns the first successful response
```

## Parameter Overrides

Gates can allow or restrict parameter overrides:

```typescript
// If gate allows temperature overrides
const response = await layer.complete({
  gate: 'my-gate-id',
  data: {
    messages: [...],
    temperature: 0.9  // Override gate's default
  }
});

// If override not allowed, gate's default is used
```

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type {
  Gate,
  GateConfig,
  Log,
  ApiKey,
  SupportedModel,
  LayerRequest,
  LayerResponse
} from '@layer-ai/sdk';
```

## Error Handling

```typescript
try {
  const response = await layer.complete({
    gate: 'my-gate-id',
    data: { messages: [...] }
  });
} catch (error) {
  if (error instanceof Error) {
    console.error('Layer error:', error.message);
    // Handle: authentication, rate limits, model failures, etc.
  }
}
```

## Examples

### Basic Chatbot

```typescript
import { Layer } from '@layer-ai/sdk';

const layer = new Layer({ apiKey: process.env.LAYER_API_KEY });

async function chat(userMessage: string) {
  const response = await layer.complete({
    gate: process.env.CHATBOT_GATE_ID!,
    data: {
      messages: [
        { role: 'user', content: userMessage }
      ]
    }
  });

  return response.content;
}

const answer = await chat('What is the capital of France?');
console.log(answer);
```

### Multi-turn Conversation

```typescript
const messages = [
  { role: 'user', content: 'Hello!' },
  { role: 'assistant', content: 'Hi! How can I help you today?' },
  { role: 'user', content: 'Tell me about quantum computing' }
];

const response = await layer.complete({
  gate: 'chat-gate-id',
  data: { messages }
});

messages.push({
  role: 'assistant',
  content: response.content
});
```

### With Model Override

```typescript
const response = await layer.complete({
  gate: 'my-gate-id',
  model: 'claude-sonnet-4',  // Override gate's default model
  data: {
    messages: [
      { role: 'user', content: 'Explain relativity' }
    ]
  }
});
```

## Admin Operations

For managing gates, API keys, and logs, use the separate admin package:

```bash
npm install @layer-ai/admin
```

```typescript
import { LayerAdmin } from '@layer-ai/admin';

const admin = new LayerAdmin({ apiKey: process.env.LAYER_ADMIN_KEY });

// Create a gate
const gate = await admin.gates.create({
  name: 'my-gate',
  model: 'gpt-4o-mini',
  systemPrompt: 'You are a helpful assistant'
});

// Use the gate ID for completions
const response = await layer.complete({
  gate: gate.id,
  data: { messages: [...] }
});
```

See the [`@layer-ai/admin` documentation](../admin) for details.

## Database Migrations

If you're self-hosting Layer AI, the SDK includes database migrations:

```bash
# Run migrations
cd node_modules/@layer-ai/core
npm run migrate
```

Migrations are located in `@layer-ai/core/dist/lib/db/migrations/`

## Related Packages

- [`@layer-ai/admin`](../admin) - Admin SDK for managing gates, keys, and logs
- [`@layer-ai/core`](../core) - Core API implementation (for self-hosting)

## License

MIT
