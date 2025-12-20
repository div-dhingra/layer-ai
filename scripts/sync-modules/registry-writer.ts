// Registry writer - Generates the model-registry.ts file
// Preserves header comments and type definitions, updates MODEL_REGISTRY constant

import { readFileSync, writeFileSync } from 'fs';
import type { ModelEntry, ChatModelEntry, EmbeddingsModelEntry } from '../../packages/sdk/src/types/model-registry';

// Generate the MODEL_REGISTRY TypeScript code
export function generateRegistryFile(
  entries: Record<string, Partial<ModelEntry>>,
  registryPath: string
): string {
  const currentFile = readFileSync(registryPath, 'utf-8');

  // Extract header comments (everything before first export)
  const headerMatch = currentFile.match(/^([\s\S]*?)(?=export)/);
  const header = headerMatch ? headerMatch[1].trim() : '';

  // Extract all type definitions and interfaces (from first export to MODEL_REGISTRY)
  const typeDefsMatch = currentFile.match(/export[\s\S]*?(?=export const MODEL_REGISTRY)/);
  const typeDefs = typeDefsMatch ? typeDefsMatch[0].trim() : '';

  // Generate MODEL_REGISTRY constant
  let registryCode = 'export const MODEL_REGISTRY = {\n';

  // Group by provider
  const providerSet = new Set<string>();
  Object.values(entries).forEach(e => {
    if (e.provider) providerSet.add(e.provider);
  });

  const knownProviders = ['openai', 'anthropic', 'google'];
  const allProviders = Array.from(providerSet);
  const otherProviders = allProviders.filter(p => !knownProviders.includes(p)).sort();
  const providers = [...knownProviders.filter(p => allProviders.includes(p)), ...otherProviders];

  for (const provider of providers) {
    const providerModels = Object.entries(entries).filter(
      ([_, entry]) => entry.provider === provider
    );

    if (providerModels.length === 0) continue;

    const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
    registryCode += `  // ${providerName} models\n`;

    for (const [key, entry] of providerModels) {
      registryCode += `  '${key}': {\n`;
      registryCode += `    type: '${entry.type}' as const,\n`;
      registryCode += `    provider: '${entry.provider}' as const,\n`;

      const escapedDisplayName = entry.displayName?.replace(/'/g, "\\'");
      registryCode += `    displayName: '${escapedDisplayName}',\n`;

      // Add pricing if available
      if (entry.pricing && (entry.pricing.input != null || entry.pricing.output != null)) {
        registryCode += `    pricing: { input: ${entry.pricing.input ?? 0}, output: ${entry.pricing.output ?? 0} },\n`;
      }

      // Add benchmarks for chat models
      const chatEntry = entry as Partial<ChatModelEntry>;
      if (chatEntry.benchmarks && Object.values(chatEntry.benchmarks).some(v => v != null)) {
        registryCode += `    benchmarks: {\n`;
        if (chatEntry.benchmarks.intelligence != null)
          registryCode += `      intelligence: ${chatEntry.benchmarks.intelligence},\n`;
        if (chatEntry.benchmarks.coding != null)
          registryCode += `      coding: ${chatEntry.benchmarks.coding},\n`;
        if (chatEntry.benchmarks.math != null)
          registryCode += `      math: ${chatEntry.benchmarks.math},\n`;
        if (chatEntry.benchmarks.mmluPro != null)
          registryCode += `      mmluPro: ${chatEntry.benchmarks.mmluPro},\n`;
        if (chatEntry.benchmarks.gpqa != null)
          registryCode += `      gpqa: ${chatEntry.benchmarks.gpqa},\n`;
        registryCode += `    },\n`;
      }

      // Add performance for chat models
      if (chatEntry.performance && Object.values(chatEntry.performance).some(v => v != null)) {
        registryCode += `    performance: {\n`;
        if (chatEntry.performance.outputTokenPerSecond != null)
          registryCode += `      outputTokenPerSecond: ${chatEntry.performance.outputTokenPerSecond},\n`;
        if (chatEntry.performance.timeTofirstToken != null)
          registryCode += `      timeTofirstToken: ${chatEntry.performance.timeTofirstToken},\n`;
        if (chatEntry.performance.intelligenceScore != null)
          registryCode += `      intelligenceScore: ${chatEntry.performance.intelligenceScore},\n`;
        registryCode += `    },\n`;
      }

      // Add context for chat models
      if (chatEntry.context) {
        registryCode += `    context: {\n`;
        if (chatEntry.context.window != null)
          registryCode += `      window: ${chatEntry.context.window},\n`;
        registryCode += `      input: {\n`;
        registryCode += `        text: ${chatEntry.context.input.text},\n`;
        registryCode += `        image: ${chatEntry.context.input.image},\n`;
        registryCode += `        audio: ${chatEntry.context.input.audio},\n`;
        registryCode += `        video: ${chatEntry.context.input.video},\n`;
        registryCode += `      },\n`;
        registryCode += `      output: {\n`;
        registryCode += `        text: ${chatEntry.context.output.text},\n`;
        registryCode += `        image: ${chatEntry.context.output.image},\n`;
        registryCode += `        audio: ${chatEntry.context.output.audio},\n`;
        registryCode += `        video: ${chatEntry.context.output.video},\n`;
        registryCode += `      },\n`;
        registryCode += `    },\n`;
      }

      // Add contextLength for embeddings models
      const embeddingsEntry = entry as Partial<EmbeddingsModelEntry>;
      if (entry.type === 'embeddings' && embeddingsEntry.contextLength != null) {
        registryCode += `    contextLength: ${embeddingsEntry.contextLength},\n`;
      }

      // Add lastUpdated
      if (entry.lastUpdated) {
        registryCode += `    lastUpdated: '${entry.lastUpdated}',\n`;
      }

      registryCode += `  },\n`;
    }

    registryCode += '\n';
  }

  registryCode += '} as const;\n\n';

  // Add derived types
  registryCode += '// Derive types from registry\n';
  registryCode += 'export type SupportedModel = keyof typeof MODEL_REGISTRY;\n';
  registryCode += "export type Provider = typeof MODEL_REGISTRY[SupportedModel]['provider'];\n";

  // Combine all parts
  return `${header}\n\n${typeDefs}\n\n${registryCode}`;
}

// Write the updated registry file
export function writeRegistryFile(
  entries: Record<string, Partial<ModelEntry>>,
  registryPath: string
): void {
  console.log('📝 Writing updated MODEL_REGISTRY to file...');

  const updatedContent = generateRegistryFile(entries, registryPath);
  writeFileSync(registryPath, updatedContent, 'utf-8');

  console.log('✅ Registry file updated successfully');
  console.log(`📊 Total model entries: ${Object.keys(entries).length}`);

  // Show breakdown by provider
  const byProvider: Record<string, number> = {};
  Object.values(entries).forEach(e => {
    if (e.provider) {
      byProvider[e.provider] = (byProvider[e.provider] || 0) + 1;
    }
  });

  console.log('   Breakdown by provider:');
  Object.entries(byProvider).forEach(([provider, count]) => {
    console.log(`     - ${provider}: ${count} models`);
  });

  // Show breakdown by type
  const byType: Record<string, number> = {};
  Object.values(entries).forEach(e => {
    if (e.type) {
      byType[e.type] = (byType[e.type] || 0) + 1;
    }
  });

  console.log('   Breakdown by type:');
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`     - ${type}: ${count} models`);
  });
}
