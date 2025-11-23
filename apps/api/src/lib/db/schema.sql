-- Enable UUID extension 
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL, 
  password_hash VARCHAR(255) NOT NULL, 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), 
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
); 

-- API Keys table
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_hash VARCHAR(255) NOT NULL,
  key_prefix VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);

-- Gates table
CREATE TABLE gates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  model VARCHAR(50) NOT NULL,
  system_prompt TEXT,
  allow_overrides JSONB DEFAULT 'true',
  temperature DECIMAL(3,2),
  max_tokens INTEGER,
  top_p DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE INDEX idx_gates_user_id ON gates(user_id);

-- Requests table (for analytics and logging)
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gate_id UUID REFERENCES gates(id) ON DELETE SET NULL,
  gate_name VARCHAR(100),
  model_requested VARCHAR(50) NOT NULL,
  model_used VARCHAR(50) NOT NULL,
  prompt_tokens INTEGER NOT NULL,
  completion_tokens INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,
  cost_usd DECIMAL(10,6) NOT NULL,
  latency_ms INTEGER NOT NULL,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  user_agent VARCHAR(255),
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_requests_user_id ON requests(user_id);
CREATE INDEX idx_requests_gate_id ON requests(gate_id);
CREATE INDEX idx_requests_created_at ON requests(created_at);

-- Session keys table (for dashboard authentication)
CREATE TABLE session_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) on DELETE CASCADE,
  key_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_session_keys_key_hash ON session_keys(key_hash);
CREATE INDEX idx_session_keys_user_id ON session_keys(user_id);
CREATE INDEX idx_session_keys_expires_at ON session_keys(expires_at);

-- Function to update updated_at timestamp 
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN 
  NEW.updated_at = NOW(); 
  RETURN NEW; 
END; 
$$ LANGUAGE plpgsql; 

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 

CREATE TRIGGER update_gates_updated_at BEFORE UPDATE ON gates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 