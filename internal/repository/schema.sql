

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




CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'in_progress',
    answers JSONB,
    total_score INT NOT NULL DEFAULT 0,
    trauma_type VARCHAR(20),
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    
    CONSTRAINT fk_assessments_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- ایجاد ایندکس‌ها
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessments_user_status ON assessments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_assessments_started_at ON assessments(started_at);




CREATE TABLE user_exercises (
    user_id    VARCHAR(36) NOT NULL,
    exercise_id VARCHAR(36) NOT NULL,
    completed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, exercise_id)
);




-- // ========== تست 1: ببینم اصلاً بت می‌تونیم به دیتابیس وصل بشیم ==========
-- 	var testCount int
-- 	err := e.conn.QueryRow(ctx, "SELECT 1").Scan(&testCount)
-- 	fmt.Println("📡 Database connection test, SELECT 1 result:", testCount, "error:", err)
-- 	if err != nil {
-- 		return nil, err
-- 	}

-- 	// ========== تست 2: بدون هیچ شرطی، همه تمرین‌ها را بیار ==========
-- 	allQuery := `SELECT COUNT(*) FROM exercises`
-- 	var allCount int
-- 	err = e.conn.QueryRow(ctx, allQuery).Scan(&allCount)
-- 	fmt.Println("📊 Total exercises in table (no filter):", allCount, "error:", err)