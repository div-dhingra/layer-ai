import type { LayerConfig, RequestOptions } from './types/index.js';
import type { ErrorResponse, LayerRequest, LayerResponse } from './types/index.js';

export class Layer {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: LayerConfig) {
    if (!config.apiKey) {
      throw new Error('Layer API key is required');
    }
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'http://localhost:3001';
  }

  public async request<T>(options: RequestOptions): Promise<T> {
    const { method, path, body } = options;
    const url = `${this.baseUrl}${path}`;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    // Handle 204 No Content responses (e.g., DELETE operations)
    if (response.status === 204) {
      return undefined as T;
    }

    const data = await response.json();

    if (!response.ok) {
      const error = data as ErrorResponse;
      throw new Error(error.message || error.error);
    }

    return data as T;
  }

  async complete(request: LayerRequest): Promise<LayerResponse> {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(request.gate);

    if (!isUUID) {
      console.warn(
        `[Layer SDK] DEPRECATION WARNING: Using gate names is deprecated and will be removed in a future version.\n` +
        `Gate: "${request.gate}"\n` +
        `Please use the gate ID instead. Find your gate ID in the dashboard at https://uselayer.ai/dashboard/gates\n` +
        `Migration: Replace gate: "${request.gate}" with gate: "YOUR_GATE_ID"`
      );
    }

    return this.request<LayerResponse>({
      method: 'POST',
      path: '/v2/complete',
      body: request,
    })
  }
}