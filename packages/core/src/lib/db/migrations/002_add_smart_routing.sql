-- Add smart routing fields to gates table
-- Date: 2026-01-16
-- Description: Adds routing strategy, fallback models, and performance weights for smart routing

ALTER TABLE gates
ADD COLUMN IF NOT EXISTS task_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS routing_strategy VARCHAR(20) DEFAULT 'fallback',
ADD COLUMN IF NOT EXISTS fallback_models JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS cost_weight DECIMAL(3,2) DEFAULT 0.33,
ADD COLUMN IF NOT EXISTS latency_weight DECIMAL(3,2) DEFAULT 0.33,
ADD COLUMN IF NOT EXISTS quality_weight DECIMAL(3,2) DEFAULT 0.34,
ADD COLUMN IF NOT EXISTS analysis_method VARCHAR(20) DEFAULT 'balanced',
ADD COLUMN IF NOT EXISTS max_cost_per_1k_tokens DECIMAL(10,6),
ADD COLUMN IF NOT EXISTS max_latency_ms INTEGER,
ADD COLUMN IF NOT EXISTS task_analysis JSONB,
ADD COLUMN IF NOT EXISTS reanalysis_period VARCHAR(20) DEFAULT 'never',
ADD COLUMN IF NOT EXISTS auto_apply_recommendations BOOLEAN DEFAULT false;
