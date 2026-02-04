-- Migration: 006_add_response_format_to_gates
-- Description: Add structured output support fields to gates table (OpenAI response_format feature)

ALTER TABLE gates
  ADD COLUMN response_format_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN response_format_type VARCHAR(20),
  ADD COLUMN response_format_schema JSONB;

-- Add index for querying gates with structured output enabled
CREATE INDEX idx_gates_response_format_enabled
  ON gates(response_format_enabled)
  WHERE response_format_enabled = TRUE;

-- Add comments for documentation
COMMENT ON COLUMN gates.response_format_enabled IS 'Whether structured output is enabled for this gate';
COMMENT ON COLUMN gates.response_format_type IS 'Response format type: text, json_object, or json_schema';
COMMENT ON COLUMN gates.response_format_schema IS 'JSON schema for json_schema response format type';
