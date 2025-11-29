import type { SupportedModel } from "./gates";
import { TaskAnalysis } from "./smart-routing";

// User 
export interface User {
  id: string; 
  email: string; 
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date; 
}

// API Key
export interface ApiKey {
  id: string; 
  userId: string;
  keyHash: string; 
  keyPrefix: string; 
  name: string; 
  isActive: boolean;
  lastUsedAt: Date | null; 
  createdAt: Date;
}

// Gate
export interface GateBase {
  // Required fields
  name: string;
  model: SupportedModel;

  // Optional public fields
  description?: string;
  systemPrompt?: string;
  allowOverrides?: boolean | OverrideConfig;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  tags?: string[];
  routingStrategy?: 'single' | 'fallback' | 'round-robin';
  fallbackModels?: SupportedModel[];

  // Internal fields (layer-ai-internal)
  // These features require a Layer account and only work with Layer-hosted API
  costWeight?: number;
  latencyWeight?: number;
  qualityWeight?: number;
  maxCostPer1kTokens?: number;
  maxLatencyMs?: number;
  taskAnalysis?: TaskAnalysis;
}

export interface Gate extends GateBase {
  id: string;
  userId: string;
  createdAt: Date; 
  updatedAt: Date;
}

export interface OverrideConfig {
  model?: boolean;
  temperature?: boolean;
  maxTokens?: boolean;
  topP?: boolean;
}

export enum OverrideField {
  Model = 'model',
  Temperature = 'temperature',
  MaxTokens = 'maxTokens',
  TopP = 'topP',
}

// Request log
export interface Request {
  id: string; 
  userId: string; 
  gateId: string | null; 
  gateName: string | null; 
  modelRequested: string; 
  modelUsed: string; 
  promptTokens: number; 
  completionTokens: number; 
  totalTokens: number; 
  costUsd: number; 
  latencyMs: number; 
  success: boolean; 
  errorMessage: string | null; 
  createdAt: Date;
  userAgent?: string; 
  ipAddress?: string; 
  duration?: number; 
}