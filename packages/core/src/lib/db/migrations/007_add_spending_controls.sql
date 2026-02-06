-- Migration: Add spending controls to users table
-- This enables monthly spending limits and budget tracking

-- Add spending control fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_spending_limit DECIMAL(10,2);  -- NULL means unlimited
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_month_spending DECIMAL(10,2) DEFAULT 0 NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS spending_period_start TIMESTAMP DEFAULT NOW() NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS alert_threshold_percentage INTEGER DEFAULT 80 NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS limit_enforcement_type VARCHAR(20) DEFAULT 'alert_only' NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_spending_alert_sent_at TIMESTAMP;

-- Add check constraint for valid status values
ALTER TABLE users ADD CONSTRAINT users_status_check
  CHECK (status IN ('active', 'over_limit', 'suspended', 'banned'));

-- Add check constraint for valid enforcement types
ALTER TABLE users ADD CONSTRAINT users_enforcement_type_check
  CHECK (limit_enforcement_type IN ('alert_only', 'block'));

-- Add check constraint for valid alert threshold
ALTER TABLE users ADD CONSTRAINT users_alert_threshold_check
  CHECK (alert_threshold_percentage >= 0 AND alert_threshold_percentage <= 100);

-- Add check constraint for non-negative spending
ALTER TABLE users ADD CONSTRAINT users_spending_check
  CHECK (current_month_spending >= 0);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_spending_period ON users(spending_period_start);
CREATE INDEX IF NOT EXISTS idx_users_over_limit ON users(status) WHERE status = 'over_limit';

-- Add comment for documentation
COMMENT ON COLUMN users.status IS 'User account status: active, over_limit, suspended, banned';
COMMENT ON COLUMN users.monthly_spending_limit IS 'Maximum spending per 30-day period in USD. NULL = unlimited';
COMMENT ON COLUMN users.current_month_spending IS 'Accumulated spending for current 30-day period in USD';
COMMENT ON COLUMN users.spending_period_start IS 'Start of current 30-day billing period';
COMMENT ON COLUMN users.alert_threshold_percentage IS 'Percentage of limit to trigger spending alerts (default 80%)';
COMMENT ON COLUMN users.last_spending_alert_sent_at IS 'Timestamp of last spending alert sent to prevent spam';
COMMENT ON COLUMN users.limit_enforcement_type IS 'How to enforce spending limits: alert_only (warn but allow) or block (prevent requests)';
