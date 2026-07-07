# راهنمای دیپلوی آرامینا روی VPS

این راهنما فرض می‌کند یک VPS با اوبونتو (۲۲.۰۴ یا بالاتر) و دسترسی SSH دارید.
دیپلوی با **Docker Compose** انجام می‌شود (postgres + backend + frontend).

---

## ۰) پیش‌نیازها روی VPS

```bash
# نصب Docker و Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # سپس یک‌بار logout/login کنید

# بررسی نصب
docker --version
docker compose version
```

مشخصات پیشنهادی VPS: **۲ vCPU / ۲–۴ گیگ RAM / ۴۰ گیگ SSD**.
> اگر RAM کم است، برای build فرانت یک swap موقت بسازید:
> ```bash
> sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
> sudo mkswap /swapfile && sudo swapon /swapfile
> ```

---

## ۱) گرفتن کد

```bash
git clone https://github.com/rezaabaskhanian/arama.git aramina
cd aramina
```

---

## ۲) تنظیم متغیرهای محیطی

```bash
cp .env.example .env
nano .env
```

مقادیر مهم:
- `DB_PASSWORD` → یک رمز قوی
- `JWT_SIGN_KEY` → خروجی `openssl rand -hex 32`
- `ALLOWED_ORIGINS` → آدرس عمومی فرانت (مثلاً `https://aramina.example.com`)
- `NEXT_PUBLIC_API_URL` → آدرس عمومی API با اسلش پایانی (مثلاً `https://api.aramina.example.com/`)

> اگر فعلاً دامنه ندارید و با IP تست می‌کنید:
> `ALLOWED_ORIGINS=http://SERVER_IP:3000` و `NEXT_PUBLIC_API_URL=http://SERVER_IP:8086/`

---

## ۳) بالا آوردن سرویس‌ها

```bash
docker compose up -d --build
```

- بار اول build چند دقیقه طول می‌کشد.
- بک‌اند در اولین اجرا migrationها را اجرا می‌کند (`RUN_MIGRATIONS=true`).

بررسی وضعیت:
```bash
docker compose ps
docker compose logs -f backend      # مشاهده‌ی لاگ‌ها
curl http://localhost:8086/health   # باید {"status":"ok"} بدهد
```

سرویس‌ها:
- فرانت: `http://SERVER_IP:3000`
- API: `http://SERVER_IP:8086`

---

## ۴) (توصیه‌شده) Nginx + دامنه + HTTPS

برای production بهتر است backend و frontend پشت Nginx با SSL باشند.
نمونه‌ی بلوک Nginx:

```nginx
# فرانت‌اند
server {
    server_name aramina.example.com;
    location / { proxy_pass http://127.0.0.1:3000; proxy_set_header Host $host; }
}
# API
server {
    server_name api.aramina.example.com;
    location / { proxy_pass http://127.0.0.1:8086; proxy_set_header Host $host; }
}
```

سپس گواهی رایگان با Certbot:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d aramina.example.com -d api.aramina.example.com
```

> بعد از فعال‌شدن HTTPS، در `.env` مقادیر را به `https://...` تغییر دهید و
> `docker compose up -d --build frontend` را دوباره اجرا کنید (چون آدرس API در زمان build فرانت جاسازی می‌شود).

---

## ۵) به‌روزرسانی نسخه

```bash
cd aramina
git pull
docker compose up -d --build
```

---

## ۶) پشتیبان‌گیری از دیتابیس

```bash
# گرفتن بکاپ
docker compose exec postgres pg_dump -U "$DB_USER" "$DB_NAME" > backup_$(date +%F).sql

# بازگردانی
cat backup.sql | docker compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME"
```

---

## نکات امنیتی

- پورت Postgres (`5432`) در docker-compose از بیرون باز **نیست** (فقط شبکه‌ی داخلی). همین‌طور بماند.
- فایل `.env` را هرگز commit نکنید (در `.gitignore` هست).
- در production حتماً `JWT_SIGN_KEY` تصادفی و قوی بگذارید.
- فایروال VPS: فقط پورت‌های ۲۲ (SSH)، ۸۰ و ۴۴۳ را باز بگذارید و ترافیک اپ را از Nginx عبور دهید.

---

## عیب‌یابی سریع

| مشکل | راه‌حل |
|------|--------|
| فرانت به API وصل نمی‌شود | `NEXT_PUBLIC_API_URL` را چک کنید و فرانت را دوباره build کنید |
| خطای CORS | آدرس فرانت را در `ALLOWED_ORIGINS` قرار دهید |
| جدول‌ها ساخته نشده | مطمئن شوید `RUN_MIGRATIONS=true` است و `docker compose logs backend` را ببینید |
| backend بالا نمی‌آید | `docker compose logs backend` — معمولاً مشکل اتصال به postgres |
