-- +migrate Up
CREATE TABLE IF NOT EXISTS user_exercises (
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id VARCHAR(36) NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    completed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    rating INT DEFAULT 0,
    PRIMARY KEY (user_id, exercise_id)
);

-- +migrate Down
DROP TABLE IF EXISTS user_exercises;