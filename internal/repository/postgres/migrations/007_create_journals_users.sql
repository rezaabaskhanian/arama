-- +migrate Up
CREATE TABLE IF NOT EXISTS journal_moods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mood INT NOT NULL CHECK (mood >= 1 AND mood <= 5),
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_date UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_journal_moods_user_id ON journal_moods(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_moods_date ON journal_moods(date);


-- +migrate Down
DROP TABLE IF EXISTS journal_moods;