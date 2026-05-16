-- +migrate Up
CREATE TABLE IF NOT EXISTS journals (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    mood INT NOT NULL CHECK (mood >= 1 AND mood <= 5),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_journals_user_id ON journals(user_id);

-- +migrate Down
DROP TABLE IF EXISTS journals;