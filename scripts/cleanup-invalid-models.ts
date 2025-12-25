// Script to remove models that don't exist (404 errors only)
// Run after validate-models.ts to clean up invalid entries

import fs from 'fs';
import path from 'path';

// Models with 404 errors or invalid names that don't exist
const MODELS_TO_REMOVE = [
  'openai/gpt-5-1',
  'openai/gpt-5-1-chat-latest',
  'openai/gpt-5-2',
  'openai/gpt-5-2-chat-latest',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'google/gemini-2.5-flash-lite-preview',
  'text-multilingual-embedding-002',
  'openai/gpt-image-1-5', // Wrong model name - should be gpt-image-1.5 with a dot
];

async function cleanupInvalidModels() {
  console.log('🧹 Removing models with 404 errors from registry...\n');

  const registryPath = path.join(
    process.cwd(),
    'packages/sdk/src/types/model-registry.ts'
  );
  let registryContent = fs.readFileSync(registryPath, 'utf-8');

  const beforeCount = (registryContent.match(/^  '[^']+': \{/gm) || []).length;

  let removedCount = 0;
  for (const modelId of MODELS_TO_REMOVE) {
    const escapedModelId = modelId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Match pattern: '  'modelId': {\n    ... content ...\n  },\n'
    const regex = new RegExp(
      `  '${escapedModelId}': \\{[\\s\\S]*?^  \\},\\n`,
      'gm'
    );

    if (regex.test(registryContent)) {
      registryContent = registryContent.replace(regex, '');
      removedCount++;
      console.log(`✓ Removed ${modelId}`);
    } else {
      console.log(`⚠ Could not find ${modelId} in registry`);
    }
  }

  fs.writeFileSync(registryPath, registryContent, 'utf-8');

  const afterCount = (registryContent.match(/^  '[^']+': \{/gm) || []).length;

  console.log(`\n✅ Successfully removed ${removedCount} invalid models`);
  console.log(`📊 Model count: ${beforeCount} → ${afterCount}`);
  console.log(`📝 Updated ${registryPath}`);
}

cleanupInvalidModels().catch(console.error);
