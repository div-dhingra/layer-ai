-- Provider Keys table for BYOK (Bring Your Own Keys)
-- Date: 2026-01-16
-- Description: Adds support for users to provide their own provider API keys

CREATE TABLE provider_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  encrypted_key JSONB NOT NULL,
  key_prefix VARCHAR(20) NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

CREATE INDEX idx_provider_keys_user_id ON provider_keys(user_id);
CREATE INDEX idx_provider_keys_provider ON provider_keys(provider);
CREATE INDEX idx_provider_keys_deleted_at ON provider_keys(deleted_at);

-- Add trigger for updated_at
CREATE TRIGGER update_provider_keys_updated_at BEFORE UPDATE ON provider_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
