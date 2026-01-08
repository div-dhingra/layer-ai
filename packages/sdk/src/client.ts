import type { LayerConfig, RequestOptions } from './types.js';
import type { ErrorResponse, LayerRequest, LayerResponse } from './types/index.js';
import { GatesResource } from './resources/gates.js';
import { KeysResource } from './resources/keys.js';
import { LogsResource } from './resources/logs.js';

export class Layer {
  private apiKey: string; 
  private baseUrl: string;
  private adminMode: boolean;

  public gates: GatesResource;
  public keys: KeysResource;
  public logs: LogsResource;

  constructor(config: LayerConfig) {
    if (!config.apiKey) {
      throw new Error('Layer API key is required');
    }
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'http://localhost:3001';
    this.adminMode = config.adminMode || false;

    this.gates = new GatesResource(this);
    this.keys = new KeysResource(this);
    this.logs = new LogsResource(this);
  }

  /** @internal */
  checkAdminMode(): void {
    if (!this.adminMode) {
      throw new Error(
        'This operation requires adminMode: true in Layer constructor.\n\n' +
        'Example:\n' +
        '   const layer = new Layer({ apiKey: "...", adminMode: true });\n\n' +
        'Admin mode is required for mutation operations:\n'+
        '  - gates.create/update/delete()\n' +
        '  - keys.create/delete()\n\n' +
        'These methods are intended for setup scripts only.\n' +
        'For ongoing managmenent, use CLI or config files.\n\n' +
        'See: https://docs.uselayer.ai/sdk/admin-mode'
      );
    }
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