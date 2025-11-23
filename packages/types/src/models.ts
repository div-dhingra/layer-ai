import type { SupportedModel } from "./gates";

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
export interface Gate {
  id: string; 
  userId: string;
  name: string; 
  model: SupportedModel; // requiring model at time of creation to prevent issues where model is empty and no responses can go through. of course this can be overriden at runtime
  systemPrompt?: string; 
  messages?: GateMessage[];
  allowOverrides?: boolean | OverrideConfig;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Message in a gate template
export interface GateMessage {
  role: 'system' | 'user' | 'assistant';
  content: string; // can contain placeholders
}

export interface OverrideConfig {
  model?: boolean;
  messages?: boolean;
  temperature?: boolean;
  maxTokens?: boolean; 
  topP?: boolean;
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