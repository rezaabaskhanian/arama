-- +migrate Up
INSERT INTO exercises (id, title, description, trauma_type, duration, order_index) VALUES
('e1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'تنفس عمیق', '۵ ثانیه نفس بکش، ۵ ثانیه نگه دار، ۵ ثانیه بیرون بده. این کار را ۱۰ بار تکرار کن.', 'mild', 5, 1),
('e2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'اسکن بدن', 'از انگشت پا تا بالای سر، هر عضوی را حس کن. جایی که تنش داری، رها کن.', 'mild', 10, 2),
('e3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'تکنیک ۵-۴-۳-۲-۱', '۵ چیزی که می‌بینی، ۴ چیزی که لمس می‌کنی، ۳ چیزی که می‌شناسی، ۲ چیزی که بو می‌کنی، ۱ چیزی که مزه می‌کنی را نام ببر.', 'mild', 8, 3);

-- +migrate Down
DELETE FROM exercises WHERE id IN (
    'e1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
    'e2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2',
    'e3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3'
);