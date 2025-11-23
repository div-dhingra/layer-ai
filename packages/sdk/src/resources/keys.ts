import type { Layer } from '../client.js';
import type { ApiKey, CreateKeyRequest, CreateKeyResponse } from '@layer-ai/types';

export class KeysResource {
  constructor(private client: Layer) {}

  async create(data: CreateKeyRequest): Promise<CreateKeyResponse> {
    return this.client.request<CreateKeyResponse> ({
      method: 'POST',
      path: '/v1/keys',
      body: data,
    })
  }

  async list(): Promise<ApiKey[]> {
    return this.client.request<ApiKey[]>({
      method: 'GET', 
      path: '/v1/keys',
    })
  }

  async delete(id: string): Promise<void> {
    await this.client.request<void>({
      method: 'DELETE',
      path: `/v1/keys/${id}`,
    })
  }
}