-- Gate History and Activity Log tables
-- Date: 2026-01-16
-- Description: Adds gate history tracking for rollback and activity audit trail

-- Gate History table (complete snapshots for rollback)
CREATE TABLE gate_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gate_id UUID NOT NULL REFERENCES gates(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  model VARCHAR(50) NOT NULL,
  fallback_models JSONB DEFAULT '[]',
  routing_strategy VARCHAR(20),
  temperature DECIMAL(3,2),
  max_tokens INTEGER,
  top_p DECIMAL(3,2),
  cost_weight DECIMAL(3,2) NOT NULL,
  latency_weight DECIMAL(3,2) NOT NULL,
  quality_weight DECIMAL(3,2) NOT NULL,
  analysis_method VARCHAR(20) NOT NULL,
  task_type VARCHAR(50),
  task_analysis JSONB,
  system_prompt TEXT,
  reanalysis_period VARCHAR(20) NOT NULL,
  auto_apply_recommendations BOOLEAN NOT NULL,
  applied_by VARCHAR(10) NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL,
  changed_fields JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_gate_history_gate_id ON gate_history(gate_id);
CREATE INDEX idx_gate_history_created_at ON gate_history(created_at);

-- Gate Activity Log table (audit trail)
CREATE TABLE gate_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gate_id UUID NOT NULL REFERENCES gates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(20) NOT NULL,
  details JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_gate_activity_log_gate_id ON gate_activity_log(gate_id);
CREATE INDEX idx_gate_activity_log_timestamp ON gate_activity_log(timestamp);
