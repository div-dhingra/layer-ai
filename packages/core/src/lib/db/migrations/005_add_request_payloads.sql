-- Migration: 005_add_request_payloads
-- Description: Add JSONB payload columns to requests table for full observability

ALTER TABLE requests
  ADD COLUMN request_payload JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN response_payload JSONB;

-- Add indexes for common query patterns
CREATE INDEX idx_requests_success ON requests(success, created_at DESC);
CREATE INDEX idx_requests_user_created ON requests(user_id, created_at DESC);
CREATE INDEX idx_requests_gate_created ON requests(gate_id, created_at DESC) WHERE gate_id IS NOT NULL;

COMMENT ON COLUMN requests.request_payload IS 'Full request payload including messages, system prompts, and metadata';
COMMENT ON COLUMN requests.response_payload IS 'Full response payload including completion text, model used, and usage stats';
