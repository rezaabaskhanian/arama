

CREATE TYPE user_role AS ENUM ('user', 'helper', 'admin');
CREATE TABLE users (
  id UUID PRIMARY KEY,

  nickname TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'user',


  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TABLE crisis (
  id UUID PRIMARY KEY ,
  user_id UUID NOT NULL REFERENCES users(id),

  current_step TEXT NOT NULL,
  risk_level TEXT NOT NULL,

  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,

  result TEXT NOT NULL
);


CREATE TABLE journal_entries (
    -- شناسه یکتا
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- ارتباط با کاربر
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- محتوای یادداشت
    content TEXT NOT NULL,
    
    -- حس و حال (۱ تا ۵)
    mood SMALLINT NOT NULL CHECK (mood >= 1 AND mood <= 5),
    
    -- زمان‌ها
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- ایندکس‌ها برای جستجوی سریع
    INDEX idx_journal_user_id (user_id),
    INDEX idx_journal_created_at (created_at),
    INDEX idx_journal_user_created (user_id, created_at DESC)
);
