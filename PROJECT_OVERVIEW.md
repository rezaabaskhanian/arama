# آرامینا (Aramina) — اپلیکیشن همراه درمان تروما / PTSD

> مستند کامل شناخت پروژه — تهیه‌شده در ۱۴۰۵/۰۴/۱۶ (۲۰۲۶-۰۷-۰۷)، به‌روزرسانی در ۱۴۰۵/۰۴/۲۳ (۲۰۲۶-۰۷-۱۴)
> این فایل خلاصه‌ی هر چیزی است که از کدبیس فعلی فهمیده شده: معماری، دامنه، APIها، فرانت‌اند، اپ موبایل، و نقاط قابل بهبود.
> آخرین افزوده‌ها: ماژول همراهی روانشناس، تمرین‌های drip روزانه، اپ موبایل React Native، و پوش نوتیفیکیشن FCM (فازهای ۶ تا ۸).

---

## ۱. این اپ چیست؟

**آرامینا** یک اپلیکیشن سلامت روان با تمرکز بر **تروما و PTSD** است (شبیه به مفهوم «PTSD Coach»). جریان اصلی کاربر:

1. کاربر **ثبت‌نام / ورود** می‌کند (با شماره تلفن + رمز).
2. یک **تست استاندارد PCL-5 (۲۰ سؤالی، مقیاس لیکرت ۰ تا ۴)** پر می‌کند.
3. سیستم بر اساس نمره‌ی کل (۰ تا ۸۰) **نوع/شدت تروما** را تشخیص می‌دهد.
4. متناسب با نوع تروما، مجموعه‌ای از **تمرین‌ها** پیشنهاد می‌شود.
5. نتیجه‌ی تست در **پروفایل** کاربر می‌ماند.
6. کاربر یک **دفترچه‌ی روزانه (Journal)** برای ثبت حس‌وحال دارد.
7. سیستم یک ماژول **بحران (Crisis)** دارد که وضعیت پرخطر را تشخیص می‌دهد و منابع کمکی نشان می‌دهد.
8. یک **پنل ادمین** برای مدیریت کاربران و تمرین‌ها وجود دارد.

### تفسیر نمرات PCL-5
| نمره | شدت | راهبرد تمرین |
|------|------|-------------|
| ۰–۲۰ | خفیف (mild) | تمرین‌های سطح پایه |
| ۲۱–۳۲ | متوسط (moderate) | تثبیت و ایمنی |
| ۳۳–۵۰ | شدید (severe) | تمرین‌های تخصصی تروما |
| ۵۱–۸۰ | خیلی شدید (complex) | پیشنهاد مراجعه به متخصص |

آستانه‌ی بالینی احتمال PTSD: نمره‌ی **۳۱–۳۳**.

---

## ۲. ساختار کلی مخزن (Monorepo)

```
aramina/
├── backend/     # سرویس Go (Echo + PostgreSQL) — معماری تمیز/DDD
├── frontend/mental-health-trauma/   # اپ Next.js 16 (App Router) + Tailwind v4
└── mobile/      # اپ موبایل React Native 0.86 (RTL، فونت وزیر، پوش FCM)
```

> نکته: در تاریخ تهیه‌ی این مستند، پروژه تازه از حالت تک‌پوشه به ساختار `backend/` + `frontend/` منتقل شده و این تغییرات هنوز در گیت commit نشده‌اند (وضعیت گیت پر از فایل‌های `D` است که در واقع «جابه‌جا» شده‌اند).

---

## ۳. بک‌اند (Go)

### تکنولوژی‌ها
- زبان: **Go**
- وب‌فریم‌ورک: **Echo v4** (`labstack/echo`)
- دیتابیس: **PostgreSQL** (درایور pgx)
- احراز هویت: **JWT** (Access + Refresh token)
- مهاجرت دیتابیس: مهاجرت‌گر داخلی (`internal/repository/migrator`)

### معماری (Clean Architecture / DDD)
```
backend/
├── cmd/main.go                 # نقطه‌ی ورود؛ wiring سرویس‌ها و ریپازیتوری‌ها
├── data/questions.json         # سؤالات تست PCL-5
├── internal/
│   ├── config/                 # کانفیگ (فعلاً hardcode در main.go)
│   ├── domain/                 # موجودیت‌ها + value objectها (قلب دامنه)
│   │   ├── user/  assessment/  exercise/  journal/  crisis/  session/
│   ├── service/                # منطق کاربردی (use caseها)
│   │   ├── auth/ user/ assessment/ exercise/ journal/ crisis/ dashboard/ admin/ session/
│   ├── repository/postgres/    # پیاده‌سازی ریپازیتوری‌ها + migrations
│   ├── delivery/
│   │   ├── httpserver/         # هندلرها و روت‌های HTTP (به تفکیک ماژول)
│   │   └── middlware/          # میدلورهای Auth و AdminOnly
│   └── pkg/                    # claims, errmesg, richerror (ابزارهای مشترک)
```

الگو: `Handler` → `Service` → `Repository` → `DB`. هر لایه با اینترفیس از لایه‌ی زیرین جدا شده است.

### مدل داده (خلاصه از `schema.sql` و migrations)
- **users**: `id (UUID)`, `nickname`, `password_hash`, `phone (unique)`, `role (enum: user|helper|admin)`, زمان‌ها.
- **assessments**: `id`, `user_id`, `status (in_progress|completed)`, `answers (JSONB)`, `total_score`, `trauma_type`, زمان‌ها.
- **exercises**: `id`, `title`, `description`, `trauma_type`, `media_url`, `duration`, `order`, `is_active`, زمان‌ها.
- **user_exercises**: جدول واسط `(user_id, exercise_id, completed_at)` + امتیاز اختیاری (rating).
- **journal_entries**: `id`, `user_id`, `content`, `mood (1..5)`, زمان‌ها. محدودیت: حداکثر ۱۰۰۰ کلمه و حداکثر ۳ ثبت در روز.
- **crisis**: `id`, `user_id`, `current_step`, `risk_level`, `result`, زمان‌ها. (دامنه غنی‌تر از اسکیماست: level, status, score, resources, followUp).
- **supervision_messages** (migration 012): `id`, `user_id` (گیرنده)، `sender_id` (روانشناس؛ NULL = پیام خودکار سیستم)، `body`, `is_auto`, `msg_date` (برای بررسی «پیام امروز آمده؟»)، `created_at`. به‌علاوه ستون `wants_supervision` روی `users`.
- **device_tokens** (migration 013): توکن‌های FCM هر کاربر برای پوش نوتیفیکیشن.

### فهرست کامل Endpointها

**Users** (`/users`)
- `POST /users/register`
- `POST /users/login`
- `POST /users/reset-pass`
- `GET  /users/profile` 🔒

**Assessment** (`/assessment`) — همه 🔒
- `POST /assessment/start`
- `GET  /assessment/questions`
- `POST /assessment/submit`
- `GET  /assessment/result/:id`
- `GET  /assessment/latest`

**Exercises** (`/exercises`)
- `POST /exercises/create`
- `GET  /exercises/by-trauma/:traumaType`
- `GET  /exercises/by-id/:exerciseID`
- `POST /exercises/:exerciseID/complete` 🔒
- `GET  /exercises/user_progress` 🔒

**Journal** (`/journal`) — همه 🔒
- `POST /journal/create`
- `GET  /journal/user`
- `GET  /journal/:id`
- `PUT  /journal/:id`
- `DELETE /journal/delete/:id`
- `GET  /journal/today-mood`
- `POST /journal/upsert-mood-add`

**Crisis** (`/crisis`) — همه 🔒
- `GET  /crisis/check`
- `GET  /crisis/active`
- `PUT  /crisis/:id/resolve`

**Dashboard** (`/dashboard`) — 🔒
- `GET  /dashboard/stats/:traumaType`

**Admin** (`/admin`) — همه 🔒 + `AdminOnly`
- `GET  /admin/stats`
- `GET  /admin/users`
- `PUT  /admin/users/:id/role`
- `GET  /admin/exercises`
- `POST /admin/exercises`
- `PUT  /admin/exercises/:id`
- `DELETE /admin/exercises/:id`

**Supervision / همراهی** (`/supervision`) — همه 🔒
- `GET  /supervision/status` — آیا کاربر همراهی روانشناس را فعال کرده + پیام امروز آمده یا نه.
- `POST /supervision/toggle` — روشن/خاموش کردن همراهی.
- `GET  /supervision/messages` — صندوق پیام‌های همراهی کاربر (روانشناس + پیام‌های خودکار).

**Supervision (کارکنان)** (`/admin/supervision`) — همه 🔒 + `staffOnly` (helper/admin)
- `GET  /admin/supervision/users` — فهرست کاربرانِ خواهانِ همراهی + آخرین مود.
- `GET  /admin/supervision/users/:id/messages` — تاریخچه‌ی پیام یک کاربر.
- `POST /admin/supervision/users/:id/messages` — ارسال پیام به کاربر (فلگ `urgent` برای کانال بحران/bypass DND).
- `POST /admin/supervision/run-fallback` — اجرای دستی پیام خودکار عصرگاهی (برای تست).

**Devices** (`/devices`) — 🔒
- `POST /devices` — ثبت توکن FCM دستگاه برای دریافت پوش نوتیفیکیشن.

**Session** (`/session`) — تعریف‌شده ولی در `server.go` هنوز رجیستر نشده
- `POST /session/create`

🔒 = نیازمند JWT (میدلور `Auth`).

---

## ۴. فرانت‌اند (Next.js)

### تکنولوژی‌ها
- **Next.js 16.2** (App Router) + **React 19.2**
- **Tailwind CSS v4** (پیکربندی از طریق `@tailwindcss/postcss`)
- **Framer Motion** (`motion`) برای انیمیشن
- **lucide-react** برای آیکون
- **axios** برای ارتباط با API (`src/lib/api.js`)
- فونت فارسی **Vazir** (local font)، جهت **RTL**، زبان `fa`

### ساختار صفحات (`src/app`)
```
/                       داشبورد کاربر (mood tracker, progress, تمرین‌های پیشنهادی)
/(auth)/login           ورود
/(auth)/register        ثبت‌نام
/(auth)/reset-password  بازیابی رمز
/assessment             تست PCL-5
/assessment/result/[id] نتیجه‌ی تست
/exercises              فهرست تمرین‌ها
/exercises/[id]         اجرای یک تمرین (ExercisePlayer)
/journal                فهرست دفترچه
/journal/new            یادداشت جدید
/journal/edit/[id]      ویرایش یادداشت
/mood                   ثبت/نمایش حس‌وحال
/breathing              تمرین تنفس
/profile                پروفایل کاربر
/admin                  داشبورد ادمین
/admin/users            مدیریت کاربران
/admin/exercises        مدیریت تمرین‌ها
```

### کامپوننت‌ها
- `components/ui/` — button, card, input, label, ProgressBar (پایه، ساده)
- `components/layout/` — Header, Sidebar (خالی!), Footer, DecorativeBlobs
- `components/journal/` — JournalList, JournalEntry, EntryForm, MoodSelector
- `components/assessment/` — QuestionCard, AnswerOptions, ResultCard
- `components/exercises/` — ExerciseCard, ExerciseList, ExercisePlayer, ProgressStats
- `components/crisis/` — CrisisCard

### مدیریت وضعیت / احراز هویت
- `context/AuthContext.js` — Provider ساده مبتنی بر localStorage.
- توکن‌ها و نقش کاربر در `localStorage` نگه داشته می‌شوند (`access_token`, `userRole`, `userName`, `traumaType`).
- هوک‌ها: `useAuth`, `useJournal`, `useExercises`, `useAssessment`.

---

## ۴.۵ اپ موبایل (React Native)

### تکنولوژی‌ها
- **React Native 0.86** + **React 19.2** + **TypeScript**
- **@react-native-firebase/app** و **/messaging** برای پوش FCM
- **@react-native-async-storage/async-storage** برای ذخیره‌ی محلی (توکن/نشست)
- **react-native-svg** برای آیکون/نمودار، **react-native-safe-area-context**
- فونت **وزیر** (bundle نیتیو)، چیدمان **RTL**، بدون کتابخانه‌ی ناوبری بیرونی

### ساختار (`mobile/src`)
```
components/   Screen, ui, Gradient, InAppBanner
context/      AuthContext
lib/          api, storage, notifications, banner
navigation/   RootNavigator, AppShell, TabBar, NavigationContext, AuthNavigator
screens/      Splash, Onboarding, Login, Register, Home, Exercises, ExerciseDetail,
              Mood, Journal, Assessment, Progress, Guide, Messages, Settings, Profile, Detail
data/         content.ts   theme/  icons/  assets/fonts
```

> نکات فنی: AsyncStorage داده را persist می‌کند؛ patch سراسری فونت در `App.tsx` روی RN 0.86 اثر ندارد و هر استایل متن باید `fontFamily` را صریح ست کند. پکیج اندروید: `com.aramina`. فایل `google-services.json` کانفیگ کلاینت Firebase است (نه کلید محرمانه‌ی سرور).

---

## ۵. وضعیت فعلی UI/UX (ارزیابی)

**نقاط قوت**
- صفحه‌ی داشبورد و لایوت ادمین طراحی مدرن و «glassmorphism» زیبایی دارند (blur, gradient, motion).
- انیمیشن‌های Framer Motion روان هستند.

**نقاط ضعف / ناهماهنگی‌ها**
- **بی‌ثباتی سیستم طراحی**: `globals.css` تقریباً کاملاً کامنت شده؛ متغیرهای رنگ تعریف‌شده استفاده نمی‌شوند. رنگ‌ها به‌صورت hardcode و پراکنده در هر صفحه تکرار شده‌اند.
- **کامپوننت‌های UI پایه** (`button`, `card`) با استایل indigo ساده هستند و با ظاهر شیشه‌ای داشبورد هماهنگ نیستند → دو زبان طراحی متفاوت.
- `components/layout/Sidebar.js`، `Header.js`، `Footer.js` **خالی‌اند**.
- ناسازگاری در نام‌گذاری کلید توکن (`token` در AuthContext در مقابل `access_token` در api.js و ادمین).
- عدد `mood` در جاهای مختلف بین `0..4` و `1..5` جابه‌جا می‌شود (فرانت از ۰ شروع، دیتابیس از ۱).
- بدون حالت تاریک (dark mode) واقعی، بدون توکن‌سازی طراحی، بدون کامپوننت‌های مشترک قابل‌استفاده‌ی مجدد (toast, modal, skeleton).

---

## ۶. آنچه صاحب پروژه خواسته (از Readme)

**ویژگی‌های فنی مدنظر:**
- Config مناسب (به‌جای hardcode در main.go)، ورژن‌بندی، Migrate، اصول Cloud-Native
- ارتباط gRPC / event-driven یا message-driven
- Validation، Makefile
- Testing (بک و فرانت)، Logging، Rate Limiting (ضد DDoS)، Caching (Redis)
- Monitoring (Prometheus + Grafana)، CI/CD

**ایده‌ی محوری ویژگی جدید — «تمرین‌های واقعیِ زندگی» (Real-World / Commitment Exercises):**
صاحب پروژه می‌خواهد تمرین‌هایی فراتر از تنفس/ذهن‌آگاهی اضافه شوند که کاربر را به کنش در دنیای واقعی دعوت کنند و بعد حس‌وحالش را ثبت کند؛ مثل:
- سر زدن به **خانه‌ی سالمندان**
- رفتن به **شیرخوارگاه / یتیم‌نوازی**
- **پرورش/نگهداری اسب** یا کار با حیوانات
- رفتن به **پارک و بازی با بچه‌ها**
- سر زدن به **۵ عضو خانواده**
- رفتن به یک **سفر** و گزارش حس مقصد

منطق: این کنش‌های نوع‌دوستانه و اجتماعی می‌توانند به بهبود حال کمک کنند و «تغییر را در فرد جاری کنند». هر تمرین باید قابل تبدیل به یک «تعهد» با ثبت بازخورد احساسی باشد.

---

## ۷. فهرست پیشنهادی بهبودها (Backlog)

### الف) طراحی (UI/UX Redesign)
1. تعریف **Design System** واقعی در `globals.css` (توکن رنگ، شعاع، سایه، تایپوگرافی با Tailwind v4 `@theme`).
2. یکدست‌سازی کامپوننت‌های `ui/` با زبان شیشه‌ای/گرادیانی داشبورد.
3. تکمیل `Sidebar`/`Header`/`Footer` و ناوبری پایین موبایل (bottom-nav).
4. حالت تاریک، حالت‌های loading/skeleton، toast و modal مشترک.
5. صفحه‌ی بحران با دسترسی سریع (دکمه‌ی SOS همیشه‌دردسترس).

### ب) ویژگی‌های جدید
1. **ماژول تمرین‌های واقعی زندگی + تعهد (Commitment)** با ثبت بازخورد احساسی (ایده‌ی محوری صاحب پروژه).
2. یادآور/Streak و اعلان.
3. نمودار روند حس‌وحال در طول زمان.
4. منابع و شماره‌های اورژانس در ماژول بحران.

### ج) زیرساخت
Config خارجی (yaml/env)، Validation، Rate Limiting، Logging ساخت‌یافته، Caching با Redis، Testing، Makefile، CI/CD، Monitoring.

### د) پنل ادمین
پنل پایه موجود است (کاربران، تمرین‌ها، آمار). قابل توسعه به: مدیریت تمرین‌های واقعی، مشاهده‌ی بحران‌های فعال، آمار تفصیلی assessmentها، مدیریت نقش helper، لاگ فعالیت.

---

## ۸. نحوه‌ی اجرا (Local Dev)

**بک‌اند:**
```bash
cd backend
go run cmd/main.go        # روی پورت 8086، migrationها در حالت غیرproduction اجرا می‌شوند
```
> نیازمند PostgreSQL روی `localhost:5431` با دیتابیس `mental_health_db` (کانفیگ فعلاً در `cmd/main.go` هاردکد است).

**فرانت‌اند:**
```bash
cd frontend/mental-health-trauma
npm install
npm run dev               # روی پورت 3000؛ به API روی 8086 وصل می‌شود
```

**موبایل (React Native):**
```bash
cd mobile
npm install
npm run android           # نیازمند اندروید SDK؛ google-services.json در android/app/
# npm run ios             # فعلاً فقط اندروید ست شده (APNs/iOS باقی‌مانده)
```
> برای فعال‌شدن پوش، بک‌اند به `FCM_CREDENTIALS_FILE` (service-account فایربیس) نیاز دارد؛ بدون آن push بی‌سروصدا غیرفعال است.

---

## ۹.۵ آنچه در بازطراحی و توسعه اضافه شد (Changelog)

این موارد در ۵ فاز به پروژه اضافه شدند:

### فاز ۱ — سیستم طراحی و ریدیزاین
- `app/globals.css`: سیستم طراحی کامل با توکن‌های Tailwind v4 (`@theme`) — پالت `brand/calm/warm/danger`، سایه، شعاع، فونت، کلاس‌های `.glass-card` و `.bg-brand-gradient`.
- کامپوننت مشترک برند `ui/Logo.jsx` (پایان تکرار ButterflyIcon).
- یکدست‌سازی `ui/button` (۶ variant)، `ui/card` (شیشه‌ای)، `ui/input`+`Textarea`، `ui/label`.
- کامپوننت‌های جدید: `ui/feedback` (Spinner/Skeleton/Badge/EmptyState)، `ui/Modal`، `ui/Toast` (+`useToast`).
- لایوت: `layout/BottomNav`، `Header`، `Footer`، `AppChrome` (ناوبری/SOS فقط در صفحات کاربر).
- رفع باگ: اعمال فونت وزیر روی `body`.

### فاز ۲ — ماژول تمرین‌های واقعی زندگی + تعهد (Commitment)
- **بک‌اند**: دامنه‌ی `commitment` (CommitmentTemplate + UserCommitment با مدل حال قبل/بعد و بازخورد)، سرویس، ریپازیتوری، هندلر، و migration `009` با ۷ الگوی seed (خانه سالمندان، شیرخوارگاه، سفر، دیدار خانواده...).
- Endpointها (`/commitments`): `GET /templates`, `GET /mine`, `POST /pledge`, `POST /:id/complete`, `DELETE /:id`.
- **فرانت**: صفحه‌ی `/commitments` (کشف تمرین‌ها + تعهدهای من + ثبت بازخورد احساسی) و بنر شاخص در خانه.

### فاز ۳ — روند حس‌وحال، SOS، یادآور
- **بک‌اند**: `GET /journal/mood-trend` (moods اخیر + streak).
- **فرانت**: `MoodTrendChart` (نمودار میله‌ای SVG بدون کتابخانه)، `DailyReminder` (یادآور روزانه)، و `crisis/SosButton` شناور با شماره‌های اورژانس.

### فاز ۴ — توسعه‌ی پنل ادمین
- **بک‌اند**: مدیریت CRUD الگوهای تمرین واقعی (`/admin/commitment-templates`) + آمار `total_commitments`.
- **فرانت**: صفحه‌ی `/admin/commitments` (ساخت/ویرایش/حذف با مودال)، لینک نویگیشن و کارت آماری جدید.

### فاز ۵ — زیرساخت (Cloud-Native)
- **Config**: `config.Load()` با رویکرد 12-Factor (env + پیش‌فرض) — اسرار از کد جدا شد؛ `.env.example`.
- **Validation**: پکیج `pkg/validate` (بدون وابستگی) + وصل‌شده به ثبت‌نام.
- **Rate Limiting**: میدلور Echo (۲۰ req/s به‌ازای IP) ضد DDoS.
- **Logging**: `pkg/logger` مبتنی بر `slog` + میدلور لاگ ساخت‌یافته با RequestID.
- **Caching**: `pkg/cache` (اینترفیس `Cache` + پیاده‌سازی درون‌حافظه‌ای TTL، قابل جایگزینی با Redis) — وصل‌شده به لیست تمرین‌ها.
- **Testing**: تست‌های دامنه‌ی commitment، cache و validate (همه سبز).
- **Makefile** + **CI/CD** (`.github/workflows/ci.yml`: build/test بک و build فرانت) + endpoint `/health`.

> باقی‌مانده برای آینده: Redis واقعی (به‌جای in-memory)، Prometheus/Grafana، gRPC/event-driven، افزایش پوشش تست.

### فاز ۶ — همراهی روانشناس (Supervision) + تمرین‌های drip روزانه
- **همراهی (Supervision)**: کاربر می‌تواند بخواهد یک روانشناس هر روز احوال و تمرین‌هایش را دنبال کند و یک پیام دلگرم‌کننده دریافت کند. دامنه‌ی `supervision`، سرویس، ریپازیتوری، هندلر، و migration `012` (جدول `supervision_messages` + ستون `wants_supervision`).
  - اگر روانشناس تا **ساعت ۸ شب** پیامی نفرستاده باشد، یک زمان‌بندِ داخلی در `main.go` (`RunDailyFallback`) بر اساس آخرین مودِ کاربر **پیام خودکار** می‌فرستد.
  - پنل کارکنان (`helper`/`admin`) برای دیدن کاربرانِ همراهی، تاریخچه‌ی پیام و ارسال پیام (با فلگ `urgent` برای موارد بحرانی).
- **تمرین‌های drip روزانه**: گِیت‌کردن تمرین‌ها به‌صورت «هر روز یک تکمیل، به‌ترتیب» (تغییرات در `complete_exercise` و `exercise_repo`)؛ seed تمرین‌های بیشتر (`011`).

### فاز ۷ — اپ موبایل React Native
- اپ **React Native 0.86** (React 19.2، TypeScript) در پوشه‌ی `mobile/` — کاملاً **RTL** با فونت **وزیر** (bundle نیتیو برای اندروید/iOS).
- ناوبری سفارشی بدون کتابخانه: `RootNavigator` + `AppShell` + `TabBar` + `NavigationContext` و `AuthNavigator`.
- احراز هویت: `LoginScreen`/`RegisterScreen`، `AuthContext`، و لایه‌ی `lib/api.ts` + `lib/storage.ts` (AsyncStorage).
- صفحه‌ها: خانه، تمرین‌ها + جزئیات، مود، دفترچه، ارزیابی PCL-5، پیشرفت، راهنما، تنظیمات، پروفایل، پیام‌های همراهی، آنبوردینگ، اسپلش.
- پکیج اندروید از `com.mobile` به **`com.aramina`** تغییر یافت.

> نکات فنی موبایل: AsyncStorage داده را persist می‌کند؛ patch سراسری فونت در `App.tsx` روی RN 0.86 اثر ندارد و **هر استایل متن باید `fontFamily` را صریح ست کند**.

### فاز ۸ — پوش نوتیفیکیشن (FCM)
- **بک‌اند**: سرویس `push` (Firebase Cloud Messaging) + سرویس/ریپازیتوری `device` + اندپوینت `POST /devices` و migration `013` (جدول `device_tokens`). اگر `FCM_CREDENTIALS_FILE` ست نباشد، push بی‌سروصدا غیرفعال می‌ماند.
- ارسال پوش هنگام **پاسخ روانشناس** و **پیام خودکار ۸ شب**؛ کانال بحران (`aramina_crisis`) با فلگ `urgent` برای عبور از حالت مزاحم‌نشوید (DND).
- **موبایل**: `@react-native-firebase/messaging`، ثبت توکن، هندلر foreground/background، کانال `aramina_default`، بنر درون‌اپ (`InAppBanner`)، صندوق `MessagesScreen` و badge زنگوله.
- **پیگیری‌های باقی‌مانده** (در `TODO.md`): تپ روی نوتیف → باز شدن مستقیم صندوق پیام؛ درخواست دسترسی DND؛ راهنمای battery-optimization؛ پشتیبانی iOS/APNs (فعلاً فقط اندروید).

## ۹. نکات فنی مهم برای توسعه‌دهنده‌ی بعدی
- CORS فقط برای `localhost:3000` و `3001` باز است.
- توکن JWT با کلید امضای هاردکد `"jwt_token"` — **باید به env منتقل شود**.
- کلید ذخیره‌ی توکن در فرانت `access_token` است؛ `AuthContext` قدیمی از `token` استفاده می‌کند → باید یکدست شود.
- روت `session` تعریف شده ولی در `server.go` رجیستر نشده.
- مقیاس `mood` بین فرانت (۰–۴) و دیتابیس (۱–۵) ناهماهنگ است.
</content>
</invoke>
