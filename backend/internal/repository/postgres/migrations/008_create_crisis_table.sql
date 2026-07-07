-- +migrate Up

CREATE TABLE IF NOT EXISTS crises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level INT NOT NULL CHECK (level >= 0 AND level <= 3),
    status VARCHAR(20) NOT NULL DEFAULT 'detected',
    triggered_by VARCHAR(20) NOT NULL,
    score INT NOT NULL DEFAULT 0,
    message TEXT NOT NULL,
    resources JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    follow_up_sent_at TIMESTAMPTZ,
    follow_up_count INT NOT NULL DEFAULT 0,
    
    CONSTRAINT fk_crises_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_crises_user_id ON crises(user_id);
CREATE INDEX IF NOT EXISTS idx_crises_status ON crises(status);
CREATE INDEX IF NOT EXISTS idx_crises_level ON crises(level);
CREATE INDEX IF NOT EXISTS idx_crises_created_at ON crises(created_at);
CREATE INDEX IF NOT EXISTS idx_crises_user_status ON crises(user_id, status);

-- +migrate Down
DROP TABLE IF EXISTS crises;