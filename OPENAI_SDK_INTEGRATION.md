# OpenAI SDK + Layer AI Integration Guide

This guide shows how to use the **OpenAI SDK** as a drop-in replacement for Layer AI — **no code changes required**, just configuration.

## Why Use Layer with OpenAI SDK?

- ✅ **Zero Migration** — Change 2 lines, keep all your existing OpenAI code
- ✅ **Smart Routing** — Automatically route to best model based on task
- ✅ **Fallback Support** — Never fail when a model is down
- ✅ **Cost Tracking** — See real-time costs per request
- ✅ **Multi-Provider** — Use GPT, Claude, Gemini, Mistral through one interface
- ✅ **Easy Rollback** — Revert to OpenAI in 30 seconds if needed

---

## Quick Start

### 1. Prerequisites

- Layer AI account ([sign up here](https://uselayer.ai))
- Layer API key (get from dashboard)
- A configured gate (gate UUID)

### 2. Install Dependencies

```bash
npm install openai
# or
pnpm install openai
# or
yarn add openai
```

### 3. Configure Environment Variables

Create a `.env` file:

```bash
LAYER_API_KEY=lyr_your_api_key_here
GATE_ID=your-gate-uuid-here
LAYER_API_URL=https://api.uselayer.ai  # Optional: defaults to production
```

### 4. Initialize the OpenAI Client

**Before (Direct OpenAI):**
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

**After (Layer AI):**
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://api.uselayer.ai/v1',  // ← Add this
  apiKey: process.env.LAYER_API_KEY,      // ← Change this
});
```

### 5. Make Requests

**Option A: Use `gateId` field (recommended)**
```typescript
const response = await openai.chat.completions.create({
  gateId: process.env.GATE_ID,  // ← Layer extension
  messages: [
    { role: 'user', content: 'Hello!' }
  ],
});
```

**Option B: Use `model` field**
```typescript
const response = await openai.chat.completions.create({
  model: process.env.GATE_ID,  // ← Gate UUID as model
  messages: [
    { role: 'user', content: 'Hello!' }
  ],
});
```

**Option C: Use header (set once)**
```typescript
const openai = new OpenAI({
  baseURL: 'https://api.uselayer.ai/v1',
  apiKey: process.env.LAYER_API_KEY,
  defaultHeaders: {
    'X-Layer-Gate-Id': process.env.GATE_ID,
  },
});
```

---

## Full Example (Streaming)

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://api.uselayer.ai/v1',
  apiKey: process.env.LAYER_API_KEY,
});

const stream = await openai.chat.completions.create({
  gateId: process.env.GATE_ID,
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Tell me a joke.' }
  ],
  stream: true,
  max_tokens: 500,
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || '';
  process.stdout.write(content);
}
```

---

## What Works

✅ **Streaming** — `stream: true` fully supported
✅ **Tool/Function Calling** — Works across all providers
✅ **Vision** — Image inputs in messages
✅ **All Message Types** — System, user, assistant, tool
✅ **Standard Parameters** — `temperature`, `max_tokens`, `top_p`, etc.
✅ **Usage Tracking** — `response.usage` with token counts
✅ **Cost Tracking** — Layer adds `cost` field to responses

---

## Migration Guide for Existing Apps

### Step 1: Update OpenAI Client Initialization

Find where you initialize the OpenAI client:

```typescript
// Find this:
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Change to this:
const openai = new OpenAI({
  baseURL: 'https://api.uselayer.ai/v1',
  apiKey: process.env.LAYER_API_KEY,
});
```

### Step 2: Add Gate ID to Requests

Add `gateId` to your completion calls:

```typescript
// Before:
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [...],
});

// After:
const response = await openai.chat.completions.create({
  gateId: process.env.GATE_ID,  // ← Add this
  messages: [...],               // Everything else stays the same
});
```

### Step 3: Update Environment Variables

```bash
# Add to your .env file:
LAYER_API_KEY=lyr_your_key
GATE_ID=your-gate-uuid
```

### Step 4: Test & Deploy

1. Test in development
2. Verify requests appear in Layer dashboard
3. Check cost tracking is working
4. Deploy to production

**Rollback Plan:** If anything breaks, revert the 2 changes (baseURL + apiKey) — takes 30 seconds.

---

## Language Examples

### Python

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://api.uselayer.ai/v1",
    api_key="lyr_your_api_key",
)

response = client.chat.completions.create(
    model="your-gate-uuid",  # or use gateId extension
    messages=[
        {"role": "user", "content": "Hello!"}
    ]
)

print(response.choices[0].message.content)
```

### Node.js (JavaScript)

```javascript
const OpenAI = require('openai');

const openai = new OpenAI({
  baseURL: 'https://api.uselayer.ai/v1',
  apiKey: process.env.LAYER_API_KEY,
});

async function chat() {
  const response = await openai.chat.completions.create({
    gateId: process.env.GATE_ID,
    messages: [
      { role: 'user', content: 'Hello!' }
    ],
  });

  console.log(response.choices[0].message.content);
}

chat();
```

### cURL (REST API)

```bash
curl https://api.uselayer.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer lyr_your_api_key" \
  -d '{
    "gateId": "your-gate-uuid",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

---

## How It Works

1. **You send** — OpenAI SDK request to `https://api.uselayer.ai/v1/chat/completions`
2. **Layer receives** — Validates gate, applies routing rules
3. **Layer routes** — Sends to the model configured in your gate (GPT, Claude, Gemini, etc.)
4. **Provider responds** — Returns response in provider's format
5. **Layer normalizes** — Converts back to OpenAI format
6. **You receive** — Standard OpenAI response with added cost/metadata

**Your code doesn't know the difference.**

---

## Advanced Configuration

### Using Multiple Gates

```typescript
const PRIMARY_GATE = 'uuid-for-gpt-4o';
const FALLBACK_GATE = 'uuid-for-claude';

// Use different gates based on use case
async function complexTask(prompt: string) {
  return await openai.chat.completions.create({
    gateId: PRIMARY_GATE,
    messages: [{ role: 'user', content: prompt }],
  });
}

async function simpleTask(prompt: string) {
  return await openai.chat.completions.create({
    gateId: FALLBACK_GATE,
    messages: [{ role: 'user', content: prompt }],
  });
}
```

### Environment-Specific Configuration

```typescript
const baseURL = process.env.NODE_ENV === 'production'
  ? 'https://api.uselayer.ai/v1'
  : 'http://localhost:3001/v1';  // Local Layer API for dev

const openai = new OpenAI({ baseURL, apiKey: process.env.LAYER_API_KEY });
```

### Error Handling

```typescript
try {
  const response = await openai.chat.completions.create({
    gateId: process.env.GATE_ID,
    messages: [{ role: 'user', content: 'Hello!' }],
  });

  console.log(response.choices[0].message.content);
} catch (error) {
  if (error.status === 404) {
    console.error('Gate not found - check your GATE_ID');
  } else if (error.status === 429) {
    console.error('Rate limit exceeded');
  } else {
    console.error('Request failed:', error.message);
  }
}
```

---

## FAQ

### Do I need to change my code?
No. Just change `baseURL` and `apiKey` in the OpenAI client initialization.

### Can I still use OpenAI directly?
Yes. Just revert `baseURL` and `apiKey` to OpenAI values.

### Does streaming work?
Yes. `stream: true` works exactly like OpenAI.

### Can I use Claude or Gemini?
Yes. Configure your gate to use any model — your code stays the same.

### What about function calling?
Fully supported. Layer handles the conversion across all providers.

### Do I need the Layer SDK?
No. This approach uses only the OpenAI SDK.

### What if Layer is down?
Configure fallback models in your gate, or revert to direct OpenAI.

### Does this work with Vercel AI SDK?
Yes. The Vercel AI SDK's OpenAI adapter works with Layer's OpenAI-compatible endpoint.

---

## Comparison: Layer SDK vs OpenAI SDK

| Feature | OpenAI SDK + Layer | Layer SDK |
|---------|-------------------|-----------|
| **Migration Effort** | 2 lines of code | Full refactor |
| **API Format** | OpenAI format | Layer native format |
| **Use Case** | Drop-in replacement | New projects |
| **Multi-modal** | Chat only | Chat, image, video, audio |
| **Streaming** | ✅ | ✅ |
| **Tool Calling** | ✅ | ✅ |
| **Cost Tracking** | ✅ | ✅ |
| **Admin Operations** | ❌ | ✅ (via Admin SDK) |

**Recommendation:**
- **Existing OpenAI apps** → Use OpenAI SDK + Layer (this guide)
- **New projects** → Use Layer SDK for full feature set

---

## Next Steps

- [Create a Gate](https://uselayer.ai/dashboard/gates/new)
- [View Request Logs](https://uselayer.ai/dashboard/logs)
- [Configure Fallbacks](https://uselayer.ai/dashboard/gates)
- [Set Cost Limits](https://uselayer.ai/dashboard/settings)

## Support

- **Docs:** [Layer AI Documentation](https://docs.uselayer.ai)
- **Dashboard:** [https://uselayer.ai/dashboard](https://uselayer.ai/dashboard)
- **GitHub:** [layer-ai/layer-ai](https://github.com/layer-ai/layer-ai)

---

**Last Updated:** 2026-02-21
