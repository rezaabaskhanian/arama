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
- `ALLOWED_ORIGINS` → `https://ariname.ir`
- `NEXT_PUBLIC_API_URL` → `https://api.ariname.ir/`

---

## ۳) آماده‌سازی Traefik (فقط بار اول)

قبل از اولین `up`، فایل acme.json باید با مجوز درست وجود داشته باشد:

```bash
# اگر کلون تازه است این دستور را اجرا کنید
touch traefik/acme.json
chmod 600 traefik/acme.json
```

> **نکته:** پورت‌های ۸۰ و ۴۴۳ روی VPS باید باز باشند تا Let's Encrypt بتواند گواهی صادر کند.
> ```bash
> sudo ufw allow 80/tcp
> sudo ufw allow 443/tcp
> ```

---

## ۴) بالا آوردن سرویس‌ها

```bash
docker compose up -d --build
```

- بار اول build چند دقیقه طول می‌کشد.
- بک‌اند در اولین اجرا migrationها را اجرا می‌کند (`RUN_MIGRATIONS=true`).
- Traefik به‌طور خودکار از Let's Encrypt گواهی SSL می‌گیرد (چند ثانیه طول می‌کشد).

بررسی وضعیت:
```bash
docker compose ps
docker compose logs -f traefik      # بررسی گرفتن گواهی SSL
docker compose logs -f backend      # مشاهده‌ی لاگ‌ها
curl https://api.ariname.ir/health  # باید {"status":"ok"} بدهد
```

سرویس‌ها (همه از طریق Traefik):
- فرانت: `https://ariname.ir`
- API: `https://api.ariname.ir`
- HTTP به HTTPS redirect می‌شود (خودکار)

---

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
- فایروال VPS: فقط پورت‌های ۲۲ (SSH)، ۸۰ و ۴۴۳ را باز بگذارید. پورت‌های 3000 و 8086 از بیرون بسته هستند (Traefik مدیریت می‌کند).
- فایل `traefik/acme.json` حاوی کلیدهای SSL است — هرگز commit نکنید (در `.gitignore` اضافه کنید).

---

## عیب‌یابی سریع

| مشکل | راه‌حل |
|------|--------|
| فرانت به API وصل نمی‌شود | `NEXT_PUBLIC_API_URL` را چک کنید و فرانت را دوباره build کنید |
| خطای CORS | آدرس فرانت را در `ALLOWED_ORIGINS` قرار دهید |
| جدول‌ها ساخته نشده | مطمئن شوید `RUN_MIGRATIONS=true` است و `docker compose logs backend` را ببینید |
| backend بالا نمی‌آید | `docker compose logs backend` — معمولاً مشکل اتصال به postgres |
