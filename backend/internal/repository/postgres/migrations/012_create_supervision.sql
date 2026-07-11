-- +migrate Up
-- نظارت روانشناس: کاربر می‌تواند بخواهد یک روانشناس احوال و تمرین‌هایش را دنبال کند
-- و هر روز پیامی دریافت کند (اگر روانشناس تا ساعت ۸ شب پیام ندهد، سیستم پیام خودکار می‌فرستد).

ALTER TABLE users ADD COLUMN IF NOT EXISTS wants_supervision BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS supervision_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,   -- گیرنده (کاربر)
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,         -- روانشناس/ادمین فرستنده (NULL یعنی پیام خودکارِ سیستم)
    body TEXT NOT NULL,
    is_auto BOOLEAN NOT NULL DEFAULT false,                          -- true یعنی پیام خودکار سیستم
    msg_date DATE NOT NULL DEFAULT CURRENT_DATE,                     -- برای بررسی «پیام امروز فرستاده شده؟»
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supervision_messages_user ON supervision_messages(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_supervision_messages_user_date ON supervision_messages(user_id, msg_date);

-- +migrate Down
DROP TABLE IF EXISTS supervision_messages;
ALTER TABLE users DROP COLUMN IF EXISTS wants_supervision;
