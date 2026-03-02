export interface Log {
  id: string;
  userId: string;
  gateId: string | null;
  gateName: string | null;
  modelRequested: string | null;
  modelUsed: string | null;
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
  latencyMs: number;
  success: number;
  errorMessage: string | null;
  loggedAt: Date;
  requestPayload?: Record<string, any>;
  responsePayload?: Record<string, any>;
}

export interface ListLogOptions {
  limit?: number;
  gate?: string;
  offset?: number;
}