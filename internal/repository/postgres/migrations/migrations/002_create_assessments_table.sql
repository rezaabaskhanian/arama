-- +migrate Up
CREATE TABLE IF NOT EXISTS assessments (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'in_progress',
    answers JSONB,
    total_score INT NOT NULL DEFAULT 0,
    trauma_type VARCHAR(20),
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE INDEX idx_assessments_user_id ON assessments(user_id);

-- +migrate Down
DROP TABLE IF EXISTS assessments;