-- +migrate Up

-- الگوهای «تمرین‌های واقعی زندگی» (Real-World / Commitment templates)
CREATE TABLE IF NOT EXISTS commitment_templates (
    id UUID PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(30) NOT NULL,       -- community | nature | family | kindness | travel
    icon VARCHAR(50) NOT NULL DEFAULT 'sparkles',
    duration_hint VARCHAR(60) NOT NULL DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT true,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- تعهدهای کاربر روی یک تمرین واقعی + ثبت بازخورد احساسی
CREATE TABLE IF NOT EXISTS user_commitments (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES commitment_templates(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pledged',  -- pledged | completed | cancelled
    mood_before SMALLINT NOT NULL DEFAULT 0,        -- 0 = ثبت‌نشده، 1..5
    mood_after  SMALLINT NOT NULL DEFAULT 0,        -- 0 = ثبت‌نشده، 1..5
    reflection TEXT NOT NULL DEFAULT '',
    pledged_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_commitments_user ON user_commitments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_commitments_status ON user_commitments(user_id, status);

-- دانه‌ها (Seed): ایده‌های تمرین واقعی زندگی
INSERT INTO commitment_templates (id, title, description, category, icon, duration_hint, order_index) VALUES
('c0000001-0000-0000-0000-000000000001', 'سر زدن به خانه‌ی سالمندان', 'به یک خانه‌ی سالمندان برو، کنار یکی از سالمندان بنشین و به قصه‌اش گوش بده. بعد بیا و حس‌وحالت را اینجا بنویس.', 'community', 'users', 'حدود ۱ ساعت', 1),
('c0000002-0000-0000-0000-000000000002', 'یتیم‌نوازی و شیرخوارگاه', 'به یک شیرخوارگاه یا مرکز نگهداری کودکان بی‌سرپرست سر بزن. یک لبخند و کمی وقت هدیه بده.', 'kindness', 'heart-handshake', 'حدود ۱ ساعت', 2),
('c0000003-0000-0000-0000-000000000003', 'وقت‌گذرانی با حیوانات', 'به یک مزرعه یا باشگاه سوارکاری برو؛ به اسب یا حیوانی رسیدگی کن و آرامش تماس با طبیعت را حس کن.', 'nature', 'trees', 'حدود ۲ ساعت', 3),
('c0000004-0000-0000-0000-000000000004', 'بازی با بچه‌ها در پارک', 'به یک پارک برو و چند دقیقه با بچه‌ها بازی کن یا شادی‌شان را تماشا کن. انرژی کودکانه را به خودت هدیه بده.', 'community', 'sun', 'حدود ۳۰ دقیقه', 4),
('c0000005-0000-0000-0000-000000000005', 'دیدار با ۵ عضو خانواده', 'به دیدن پنج نفر از اعضای خانواده یا نزدیکانت برو یا با آن‌ها تماس بگیر. پیوند دوباره را احساس کن.', 'family', 'phone', 'در طول هفته', 5),
('c0000006-0000-0000-0000-000000000006', 'یک سفر کوچک', 'به یک مقصد تازه سفر کن — حتی یک روستا یا شهر نزدیک. حس مقصد و تغییر فضا را برای ما بنویس.', 'travel', 'plane', 'یک روز', 6),
('c0000007-0000-0000-0000-000000000007', 'کار داوطلبانه', 'در یک فعالیت خیریه یا داوطلبانه شرکت کن؛ کمک به دیگران، تغییر را در خودت جاری می‌کند.', 'kindness', 'hand-heart', 'حدود ۲ ساعت', 7);

-- +migrate Down
DROP TABLE IF EXISTS user_commitments;
DROP TABLE IF EXISTS commitment_templates;
