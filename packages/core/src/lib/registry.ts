/**
 * Runtime Model Registry
 *
 * Starts with static SDK data, fetches fresh data from the API
 * at startup. Falls back to SDK data if the API is unreachable or
 * API_URL is not set (e.g., local dev).
 */

import { MODEL_REGISTRY as STATIC_REGISTRY } from '@layer-ai/sdk';

let registry: Record<string, any> = { ...STATIC_REGISTRY };
let refreshTimer: ReturnType<typeof setInterval> | null = null;

interface InitOptions {
  refreshIntervalMs?: number;
}

export async function initializeRegistry(options: InitOptions = {}) {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    console.log('[Registry] No API_URL set, using static SDK data');
    return;
  }

  await fetchRegistry(apiUrl);

  if (options.refreshIntervalMs) {
    refreshTimer = setInterval(() => fetchRegistry(apiUrl), options.refreshIntervalMs);
    // Allow the process to exit even if the timer is active
    refreshTimer.unref();
  }
}

async function fetchRegistry(apiUrl: string) {
  try {
    const res = await fetch(`${apiUrl}/v1/registry`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    registry = data.models;
    console.log(`[Registry] Loaded ${Object.keys(registry).length} models from API`);
  } catch (err) {
    console.warn('[Registry] Fetch failed, using existing data:', err);
  }
}

export function getRegistry(): Record<string, any> {
  return registry;
}

export function getModel(modelId: string): any | undefined {
  return registry[modelId];
}

export function hasModel(modelId: string): boolean {
  return modelId in registry;
}

export function getModelEntries(): [string, any][] {
  return Object.entries(registry);
}
