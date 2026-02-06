-- Migration: Add gate-level spending limits
-- Description: Add spending limit tracking fields to gates table for per-gate cost controls

-- Add spending limit fields to gates table
ALTER TABLE gates
ADD COLUMN IF NOT EXISTS spending_limit DECIMAL(10, 2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS spending_limit_period VARCHAR(20) DEFAULT 'monthly' CHECK (spending_limit_period IN ('monthly', 'daily')),
ADD COLUMN IF NOT EXISTS spending_current DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS spending_period_start TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS spending_enforcement VARCHAR(20) DEFAULT 'alert_only' CHECK (spending_enforcement IN ('alert_only', 'block')),
ADD COLUMN IF NOT EXISTS spending_status VARCHAR(20) DEFAULT 'active' CHECK (spending_status IN ('active', 'suspended'));

-- Create index for faster spending queries
CREATE INDEX IF NOT EXISTS idx_gates_spending_status ON gates(spending_status);
CREATE INDEX IF NOT EXISTS idx_gates_spending_period ON gates(spending_period_start);

-- Add comment explaining the fields
COMMENT ON COLUMN gates.spending_limit IS 'Maximum spending allowed per period in USD (NULL = no limit)';
COMMENT ON COLUMN gates.spending_limit_period IS 'Period for spending limit: monthly or daily';
COMMENT ON COLUMN gates.spending_current IS 'Current period spending in USD';
COMMENT ON COLUMN gates.spending_period_start IS 'Start of current spending period';
COMMENT ON COLUMN gates.spending_enforcement IS 'How to enforce limits: alert_only or block';
COMMENT ON COLUMN gates.spending_status IS 'Gate spending status: active or suspended';
