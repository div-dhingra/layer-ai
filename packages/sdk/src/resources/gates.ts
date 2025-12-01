import type { Layer } from '../client.js';
import type { Gate, CreateGateRequest, UpdateGateRequest } from '@layer-ai/types';
import type { TaskAnalysis } from '@layer-ai/types';

export class GatesResource {
  constructor(private client: Layer) {}

  /**
   * Create a new gate.
   *
   * Requires `adminMode: true` in Layer constructor.
   *
   * @throws Error if adminMode is not enabled
   * @see https://docs.uselayer.ai/sdk/admin-mode
   */
  async create(data: CreateGateRequest): Promise<Gate> {
    this.client.checkAdminMode();
    return this.client.request<Gate>({
      method: 'POST', 
      path: '/v1/gates',
      body: data,
    });
  }

  /**
   * Lists all gates
   * No admin mode required.
   */
  async list(): Promise<Gate[]> {
    return this.client.request<Gate[]>({
      method: 'GET',
      path: '/v1/gates',
    })
  }

  /**
   * Gets a specific gate by name
   * No admin mode required.
   */
  async get(name: string): Promise<Gate> {
    return this.client.request<Gate>({
      method: 'GET',
      path: `/v1/gates/name/${name}`,
    })
  }

  /**
   * Update an existing gate.
   *
   * ⚠️ Requires `adminMode: true` in Layer constructor.
   *
   * @throws Error if adminMode is not enabled
   * @see https://docs.uselayer.ai/sdk/admin-mode
   */
  async update(name: string, data: UpdateGateRequest): Promise<Gate> {
    this.client.checkAdminMode();
    return this.client.request<Gate>({
      method: 'PATCH',
      path: `/v1/gates/name/${name}`,
      body: data,
    })
  }

  /**
   * Deletes an existing.
   *
   * ⚠️ Requires `adminMode: true` in Layer constructor.
   *
   * @throws Error if adminMode is not enabled
   * @see https://docs.uselayer.ai/sdk/admin-mode
   */
  async delete(name: string): Promise<void> {
    this.client.checkAdminMode();
    await this.client.request<void>({
      method: 'DELETE',
      path: `/v1/gates/name/${name}`,
    })
  }

  /**
   * Get AI-powered model suggestions for a gate.
   * 
   * Layer-AI Internal Feature - returns a 404 on self-hosted public API
   */
  async suggestions(gateName: string): Promise<TaskAnalysis> {
    return this.client.request<TaskAnalysis>({
      method: 'GET',
      path: `/v1/gates/${gateName}/suggestions`,
    });
  }
}