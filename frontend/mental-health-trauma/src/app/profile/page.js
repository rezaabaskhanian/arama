'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { getUserProfile, getUserProgress, getDashboardStats, getMyCommitments, getTodayMood } from '@/lib/api';
import { startAmbient, stopAmbient, setAmbientVolume } from '@/lib/ambientSound';
import {
  Settings,
  ShieldCheck,
  Volume2,
  Sun,
  Moon,
  Save,
  RotateCcw,
  Sparkles,
  Loader2,
  CheckCircle2,
  Bot,
  ArrowLeft,
  Play,
  Pause,
} from 'lucide-react';

const TRAUMA_LABELS = { mild: 'خفیف', moderate: 'متوسط', severe: 'شدید', complex: 'پیچیده' };
const PREF_KEY = 'aramina_prefs';
const DEFAULT_PREFS = { notify: true, volume: 75, theme: 'day' };

// نسخه‌ی سمت‌کلاینتِ پیام خودکار ناظر (منطبق با autoMessageForMood در بک‌اند) —
// برای شبیه‌سازیِ پیامی که سیستم بعد از ساعت ۸ شب می‌فرستد.
function previewSupervisorMessage(name, mood) {
  const who = name?.trim() || 'دوست عزیز';
  if (mood == null)
    return `سلام ${who} 🌱 امروز حالت رو ثبت نکردی. فقط می‌خواستم بگم ما همراهتیم؛ اگر فرصت شد چند لحظه به خودت برس و یک تمرین کوتاه انجام بده. فردا هم روز تازه‌ای است.`;
  if (mood <= 2)
    return `سلام ${who} 💙 دیدم امروز حالت خیلی خوب نبوده. اشکالی نداره؛ روزهای سخت هم بخشی از مسیرند. یک تمرین تنفس آرام انجام بده و اگر لازم شد از بخش «کمک فوری» استفاده کن. تنها نیستی.`;
  if (mood === 3)
    return `سلام ${who} 🌿 امروز حالت متعادل بوده. همین که هر روز کنار خودت می‌مانی ارزشمند است. یک تمرین کوچک امروز می‌تواند حالت را یک پله بهتر کند.`;
  return `سلام ${who} ☀️ خوشحالم که این روزها حالت بهتر بوده! این انرژی مثبت را نگه دار و به تمرین‌هایت ادامه بده. بهت افتخار می‌کنم.`;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ nickname: '', phone: '', role: '' });
  const [name, setName] = useState('');
  const [traumaType, setTraumaType] = useState('moderate');
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [report, setReport] = useState({ exercises: 0, commitments: 0 });
  const [mood, setMood] = useState(null);
  const [saved, setSaved] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  // توقف پیش‌نمایش صدا هنگام خروج از صفحه
  useEffect(() => () => stopAmbient(), []);

  const togglePreview = () => {
    if (previewing) {
      stopAmbient();
      setPreviewing(false);
    } else {
      startAmbient(prefs.volume / 100);
      setPreviewing(true);
    }
  };

  const onVolumeChange = (v) => {
    setPrefs((p) => ({ ...p, volume: v }));
    if (previewing) setAmbientVolume(v / 100);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        if (!token) return router.push('/login');

        setTraumaType(localStorage.getItem('traumaType') || 'moderate');
        try {
          const p = JSON.parse(localStorage.getItem(PREF_KEY));
          if (p) setPrefs({ ...DEFAULT_PREFS, ...p });
        } catch {}

        const t = localStorage.getItem('traumaType') || 'mild';
        const [prof, prog, dash, commits, todayMood] = await Promise.all([
          getUserProfile(),
          getUserProgress(t),
          getDashboardStats(t),
          getMyCommitments().catch(() => []),
          getTodayMood().catch(() => null),
        ]);
        if (prof?.user) {
          setProfile(prof.user);
          setName(prof.user.nickname || '');
        }
        const exercises = prog?.completed_exercises ?? dash?.completed_exercises ?? 0;
        const commitments = Array.isArray(commits) ? commits.length : 0;
        setReport({ exercises, commitments });
        const m = todayMood?.mood ?? todayMood?.mood_level ?? todayMood?.value ?? null;
        setMood(typeof m === 'number' ? m : null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  // فعال/غیرفعال کردن اعلان‌های مهربان؛ هنگام روشن‌کردن، اجازه‌ی مرورگر گرفته می‌شود
  const toggleNotify = async () => {
    const next = !prefs.notify;
    setPrefs((p) => ({ ...p, notify: next }));
    if (next && typeof window !== 'undefined' && 'Notification' in window) {
      let perm = Notification.permission;
      if (perm === 'default') perm = await Notification.requestPermission();
      if (perm === 'granted') {
        try {
          new Notification('آرامینا 🌿', {
            body: 'اعلان‌های مهربان فعال شد. در طول روز کنارت هستیم و یادآور تنفس می‌فرستیم 💙',
            tag: 'aramina-selfcare',
          });
        } catch {}
      }
    }
  };

  const handleSave = () => {
    if (name.trim()) {
      localStorage.setItem('userName', name.trim());
      setProfile((p) => ({ ...p, nickname: name.trim() }));
    }
    localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
    flashSaved();
  };

  const handleReset = () => {
    if (!confirm('تنظیمات محلی (اعلان‌ها، صدا و حالت نمایش) به حالت پیش‌فرض بازگردد؟')) return;
    setPrefs(DEFAULT_PREFS);
    localStorage.setItem(PREF_KEY, JSON.stringify(DEFAULT_PREFS));
    flashSaved();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center" dir="rtl">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
      </div>
    );
  }

  const Toggle = ({ on, onClick }) => (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      className={`relative w-14 h-8 rounded-full transition-colors ${on ? 'bg-brand-900' : 'bg-slate-200'}`}
    >
      <motion.span
        className="absolute top-1 w-6 h-6 rounded-full bg-white shadow"
        animate={{ left: on ? '1.75rem' : '0.25rem' }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-surface text-slate-800 pb-24 selection:bg-brand-100" dir="rtl">
      <main className="max-w-6xl mx-auto px-6 sm:px-10 pt-10">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* ستون تنظیمات */}
          <section className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 p-8 space-y-8">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <span className="w-14 h-14 rounded-2xl btn-accent flex items-center justify-center">
                <Settings className="w-7 h-7" />
              </span>
              <div>
                <h1 className="text-2xl font-black text-slate-900">تنظیمات حساب و حریم خصوصی</h1>
                <p className="text-sm font-bold text-slate-400 mt-1">پروفایل کاربری، اعلان‌ها و ابزارهای صوتی</p>
              </div>
            </div>

            {/* نام + سطح تروما */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">نام و نام‌خانوادگی شما</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 font-black text-slate-800 focus:outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">سطح ارزیابی‌شده تروما</label>
                <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-400 select-none">
                  {TRAUMA_LABELS[traumaType] || 'نامشخص'} (تغییر از بخش پایش)
                </div>
              </div>
            </div>

            {/* اعلان‌ها */}
            <div className="bg-slate-50/60 rounded-[1.5rem] p-6 flex items-center justify-between gap-4">
              <div>
                <p className="font-black text-slate-800">اعلان‌های مهربان آرامینا</p>
                <p className="text-xs font-bold text-slate-400 mt-1">ارسال یادآورهای خودمراقبتی و تنفس پاراسمپاتیک در طول روز</p>
              </div>
              <Toggle on={prefs.notify} onClick={toggleNotify} />
            </div>

            {/* اسلایدر امواج آلفا */}
            <div className="bg-slate-50/60 rounded-[1.5rem] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-slate-800">شدت فرکانس‌های امواج صوتی آلفا</p>
                  <p className="text-xs font-bold text-slate-400 mt-1">ولوم ملایم باد، باران و فرکانس‌های مغزی در تمرین‌ها</p>
                </div>
                <Volume2 className="w-6 h-6 text-brand-500" />
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={prefs.volume}
                  onChange={(e) => onVolumeChange(Number(e.target.value))}
                  className="flex-1 accent-brand-600"
                />
                <span className="font-black text-slate-700 w-12 text-left">{prefs.volume}%</span>
              </div>
              <button
                onClick={togglePreview}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm transition-colors ${
                  previewing ? 'bg-rose-50 text-rose-600' : 'bg-brand-50 text-brand-600 hover:bg-brand-100'
                }`}
              >
                {previewing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {previewing ? 'توقف پیش‌نمایش صدا' : 'پخش نمونه‌ی صدای آلفا'}
              </button>
              <p className="text-[11px] font-bold text-slate-400">
                برای تجربه‌ی کامل، این صدا هنگام تمرین تنفس در بخش «تنفس» پخش می‌شود. برای شنیدن امواج آلفا هدفون بگذار.
              </p>
            </div>

            {/* حفاظت داده */}
            <div className="border border-slate-100 rounded-[1.5rem] p-6">
              <p className="font-black text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-calm-500" />
                حفاظت امنیتی داده‌های بالینی
              </p>
              <p className="text-xs font-bold text-slate-400 mt-2 leading-relaxed">
                کلیه عواطف مکتوب شما در دفترچه احساسات و پاسخ‌های ارزیابی روان‌شناختی به‌صورت رمزنگاری‌شده ذخیره می‌شوند و
                هیچ دیتایی برای حریم خصوص شما ارسال نمی‌گردد.
              </p>
            </div>

            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2.5 bg-brand-900 text-white px-7 py-4 rounded-2xl font-black shadow-lg shadow-brand-900/20 hover:bg-brand-800 transition-colors"
            >
              {saved ? <CheckCircle2 className="w-5 h-5 text-accent-400" /> : <Save className="w-5 h-5" />}
              {saved ? 'ذخیره شد' : 'بروزرسانی تغییرات مراجع'}
            </button>
          </section>

          {/* ستون کناری */}
          <div className="space-y-6">
            {/* کارنامه بهبودی */}
            <section className="bg-brand-900 text-white rounded-[2rem] p-7 shadow-2xl shadow-brand-900/30 space-y-5">
              <h2 className="text-lg font-black flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent-400" />
                کارنامه بهبودی شما
              </h2>
              <div className="space-y-4 text-sm">
                {[
                  { label: 'تمرین‌های تنفسی موفق:', value: `${report.exercises} تمرین` },
                  { label: 'عهدهای جاری و وفاشده:', value: `${report.commitments} عهد` },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between pb-4 border-b border-white/10">
                    <span className="font-bold text-brand-100">{r.label}</span>
                    <span className="font-black">{r.value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-100">پرونده فعال تروما:</span>
                  <span className="bg-accent-500/20 text-accent-300 border border-accent-400/30 px-3 py-1 rounded-lg font-black text-xs">
                    {TRAUMA_LABELS[traumaType] || 'نامشخص'}
                  </span>
                </div>
              </div>
            </section>

            {/* شبیه‌ساز پیام ناظر (روز/شب) */}
            <section className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 p-7 space-y-5">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Moon className="w-5 h-5 text-warm-500" />
                شبیه‌ساز پیام ناظر
              </h2>
              <p className="text-xs font-bold text-slate-400 leading-relaxed">
                اگر ناظر تا ساعت ۸ شب پیامی نفرستد، آرامینا به‌صورت خودکار پیامی متناسب با حال امروزت می‌فرستد. برای دیدن نمونه، «حالت شب» را انتخاب کن.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPrefs((p) => ({ ...p, theme: 'day' }))}
                  className={`inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm transition-all ${
                    prefs.theme === 'day' ? 'btn-accent shadow-lg' : 'bg-slate-50 text-slate-500'
                  }`}
                >
                  <Sun className="w-4 h-4" /> حالت روز
                </button>
                <button
                  onClick={() => setPrefs((p) => ({ ...p, theme: 'night' }))}
                  className={`inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm transition-all ${
                    prefs.theme === 'night' ? 'bg-brand-900 text-white shadow-lg' : 'bg-slate-50 text-slate-500'
                  }`}
                >
                  <Moon className="w-4 h-4" /> حالت شب
                </button>
              </div>

              {prefs.theme === 'night' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 pt-1"
                >
                  <span className="w-9 h-9 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </span>
                  <div className="bg-brand-50 rounded-[1.25rem] rounded-tr-md p-4">
                    <p className="text-slate-700 leading-relaxed font-medium text-xs whitespace-pre-wrap">
                      {previewSupervisorMessage(name, mood)}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 mt-2">پیام خودکار آرامینا · شبیه‌سازی ساعت ۲۰:۰۰</p>
                  </div>
                </motion.div>
              )}

              <Link
                href="/supervision"
                className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-800 font-black text-xs transition-colors"
              >
                مشاهده‌ی کامل پیام‌های ناظر
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </section>

            {/* اقدامات اضطراری */}
            <section className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 p-7 space-y-4">
              <h2 className="text-lg font-black text-slate-900">اقدامات اضطراری داده‌ها</h2>
              <p className="text-xs font-bold text-slate-400 leading-relaxed">
                با فشردن کلید زیر، تنظیمات محلی شما (اعلان‌ها، صدا و حالت نمایش) به مقادیر پیش‌فرض باز می‌گردد.
              </p>
              <button
                onClick={handleReset}
                className="w-full inline-flex items-center justify-center gap-2 bg-accent-50 text-accent-600 border border-accent-100 py-4 rounded-2xl font-black hover:bg-accent-100 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                بازنشانی تنظیمات به پیش‌فرض
              </button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
