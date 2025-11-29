// Internal type (Layer-AI-Internal)
// This feature requires a Layer account and only work with Layer-hosted API
export interface TaskAnalysis {
  primary: string;
  alternatives: string[];
  reasoning: string;
}