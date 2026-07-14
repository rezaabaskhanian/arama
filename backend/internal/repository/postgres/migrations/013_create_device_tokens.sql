-- +migrate Up
-- توکن‌های دستگاه برای ارسال نوتیفیکیشن push (FCM). هر دستگاه یک token دارد؛
-- token یکتاست تا اگر همان دستگاه دوباره ثبت شد فقط user_id/زمانش به‌روز شود.
CREATE TABLE IF NOT EXISTS device_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    platform TEXT NOT NULL DEFAULT 'android',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_device_tokens_user ON device_tokens(user_id);

-- +migrate Down
DROP TABLE IF EXISTS device_tokens;
