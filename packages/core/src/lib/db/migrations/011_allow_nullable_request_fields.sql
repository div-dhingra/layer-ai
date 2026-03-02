-- Allow nullable fields for failed requests (validation errors before model selection)
ALTER TABLE requests ALTER COLUMN model_requested DROP NOT NULL;
ALTER TABLE requests ALTER COLUMN model_used DROP NOT NULL;
ALTER TABLE requests ALTER COLUMN prompt_tokens SET DEFAULT 0;
ALTER TABLE requests ALTER COLUMN completion_tokens SET DEFAULT 0;
ALTER TABLE requests ALTER COLUMN total_tokens SET DEFAULT 0;
ALTER TABLE requests ALTER COLUMN cost_usd SET DEFAULT 0;
ALTER TABLE requests ALTER COLUMN latency_ms SET DEFAULT 0;
