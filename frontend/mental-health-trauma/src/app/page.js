'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Wind,
  Loader2,
  ArrowLeft,
  Sparkles,
  HeartHandshake,
  ShieldCheck,
  ClipboardList,
  BookOpen,
  Target,
  Flame,
  ChevronLeft,
  Quote,
  RefreshCw,
} from 'lucide-react';
import {
  getSuggestedExercises,
  getDashboardStats,
  getTodayMood,
  saveTodayMood,
} from '@/lib/api';

const WHY = [
  {
    icon: HeartHandshake,
    color: 'brand',
    title: 'پزشک و درمانگر ناظر ۲۴ ساعته',
    desc: 'امکان پایش عاطفی خودکار در ساعات پایانی شب و انتقال بازخورد حمایتی مستقیم توسط متخصص جهت آرام‌سازی خواب.',
  },
  {
    icon: Wind,
    color: 'calm',
    title: 'تمرین‌های سوماتیک و تنفسی علمی',
    desc: 'پروتکل‌های عضلانی، ضربانی و تمرینات تنفس هولوتروپیک جهت تخلیه هورمون‌های کورتیزول و بازنشانی اعصاب واگ.',
  },
  {
    icon: ShieldCheck,
    color: 'accent',
    title: 'حریم خصوصی صددرصد امن',
    desc: 'ذخیره‌سازی اطلاعات پایش بالینی و یادداشت‌های روزانه با امنیت کامل و بدون دسترسی‌های غیرمجاز.',
  },
];

const GATEWAYS = [
  { icon: Wind, color: 'brand', title: 'کتابخانه تمرین‌های شفابخش', desc: 'تمرینات عضلانی، ریلکسیشن واگ، و تنفس‌های متناوب.', cta: 'ورود به بخش', href: '/exercises' },
  { icon: ClipboardList, color: 'calm', title: 'ارزیابی‌های بالینی', desc: 'پایش مستمر سطح تروما و آگاهی از وضعیت سیستم ایمنی.', cta: 'شروع ارزیابی', href: '/assessment' },
  { icon: BookOpen, color: 'warm', title: 'دفترچه احساسات', desc: 'یادداشت‌برداری روزانه و پایش احساسات جهت ابراز سالم عواطف.', cta: 'ثبت یادداشت جدید', href: '/journal' },
  { icon: Target, color: 'accent', title: 'تعهدات واقعی زندگی', desc: 'اهداف و قراردادهای شفابخشی جهت بازگشت به زندگی اجتماعی.', cta: 'مشاهده تعهدات', href: '/commitments' },
];

const MOODS = [
  { label: 'آرامش عمیق', dot: 'bg-calm-500', value: 4 },
  { label: 'پذیرا و شاداب', dot: 'bg-brand-500', value: 3 },
  { label: 'خنثی و متمرکز', dot: 'bg-slate-400', value: 2 },
  { label: 'دلتنگ یا غمگین', dot: 'bg-sky-500', value: 1 },
  { label: 'بی‌قرار یا ناآرام', dot: 'bg-accent-500', value: 0 },
];

const QUOTES = [
  { text: 'شجاعت یعنی هر روز دوباره انتخاب کنی که خودت را دوست داشته باشی.', by: 'برنه براون' },
  { text: 'شفا به این معنا نیست که آسیب هرگز رخ نداده؛ یعنی دیگر کنترل زندگی‌ات را در دست ندارد.', by: 'خرد درون تو' },
  { text: 'تو مجبور نیستی طوفان را کنترل کنی؛ کافی است یاد بگیری در دلش آرام بمانی.', by: 'ناشناس' },
  { text: 'هر نفس عمیق، پیامی است به بدن تو: اکنون در امان هستی.', by: 'آرامینا' },
];

const COLOR = {
  brand: { text: 'text-brand-600', bg: 'bg-brand-50', bar: 'bg-brand-500' },
  calm: { text: 'text-calm-600', bg: 'bg-calm-50', bar: 'bg-calm-500' },
  warm: { text: 'text-warm-500', bg: 'bg-warm-50', bar: 'bg-warm-400' },
  accent: { text: 'text-accent-500', bg: 'bg-accent-50', bar: 'bg-accent-500' },
};

export default function DashboardPage() {
  const [userName, setUserName] = useState('');
  const [greeting, setGreeting] = useState('صبح بخیر');
  const [loadingData, setLoadingData] = useState(true);
  const [suggestedExercises, setSuggestedExercises] = useState([]);
  const [hasAssessment, setHasAssessment] = useState(true);
  const [selectedMood, setSelectedMood] = useState(null);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [stats, setStats] = useState({
    completed_exercises: 0,
    total_exercises: 0,
    journal_entries: 0,
    streak: 0,
    last_assessment_date: null,
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('صبح بخیر');
    else if (hour < 18) setGreeting('عصر بخیر');
    else setGreeting('شب بخیر');

    const savedName = localStorage.getItem('userName');
    if (savedName) setUserName(savedName);

    async function fetchData() {
      try {
        setLoadingData(true);
        const traumaType = localStorage.getItem('traumaType');
        const assessed = !!traumaType;
        setHasAssessment(assessed);
        const [exercisesData, dash, mood] = await Promise.all([
          assessed ? getSuggestedExercises(2) : Promise.resolve([]),
          getDashboardStats(traumaType || 'mild'),
          getTodayMood(),
        ]);
        if (exercisesData) setSuggestedExercises(exercisesData.slice(0, 2));
        if (dash) setStats(dash);
        if (mood && mood.mood !== undefined && mood.mood !== null) setSelectedMood(mood.mood);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, []);

  const handleMood = async (value) => {
    setSelectedMood(value);
    try {
      await saveTodayMood(value);
    } catch (err) {
      console.error('Error saving mood:', err);
    }
  };

  const formatAssessment = (dateStr) => {
    if (!dateStr) return 'ثبت نشده';
    const d = new Date(dateStr);
    const today = new Date();
    const isSame = d.toDateString() === today.toDateString();
    if (isSame) return 'امروز';
    try {
      return new Intl.DateTimeFormat('fa-IR', { month: 'long', day: 'numeric' }).format(d);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-surface text-slate-800 selection:bg-brand-100" dir="rtl">
      {/* ============ HERO تمام‌صفحه با عکس پس‌زمینه ============ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <img src="/hero.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-900/45 via-brand-900/25 to-brand-900/70" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative z-10 text-center px-6 max-w-3xl mx-auto flex flex-col items-center gap-8 pt-20"
        >
          <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-black px-4 py-2 rounded-full">
            <Sparkles className="w-4 h-4" />
            {greeting}{userName ? '، ' + userName + ' عزیز' : ''}
          </span>

          <h1 className="text-white text-5xl sm:text-7xl font-black leading-[1.1] tracking-tight drop-shadow-sm">
            با آنچه از سر می‌گذرانی،
            <br />
            رشد کن 🌿
          </h1>

          <p className="text-white/85 text-base sm:text-lg font-medium leading-relaxed max-w-xl">
            آرامینا همراه توست در مسیر بهبودی؛ هر روز یک قدم کوچک برای آرامش و رشد.
          </p>

          <Link href="/exercises">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn-accent inline-flex items-center gap-3 pr-2 pl-7 py-3 rounded-full font-black text-base shadow-2xl shadow-brand-900/30"
            >
              <span className="w-10 h-10 rounded-full bg-white/85 flex items-center justify-center">
                <ArrowLeft className="w-5 h-5 text-accent-600" />
              </span>
              تمرین امروزت را شروع کن
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* ============ چرا آرامینا ============ */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-black text-brand-500 mb-3">چرا مراجعین آرامینا را انتخاب می‌کنند؟</p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-snug">
            اصول درمانی و پشتیبانی هوشمند آرامینا
          </h2>
          <div className="h-1 w-16 bg-brand-400 rounded-full mx-auto mt-5" />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {WHY.map((c, i) => {
            const col = COLOR[c.color];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 p-8 text-center flex flex-col items-center gap-4"
              >
                <span className={`w-14 h-14 rounded-2xl ${col.bg} ${col.text} flex items-center justify-center`}>
                  <c.icon className="w-7 h-7" />
                </span>
                <h3 className="text-lg font-black text-slate-900">{c.title}</h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">{c.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* نوار آماری */}
        <div className="mt-8 bg-white/70 backdrop-blur-md rounded-[2rem] border border-white/80 shadow-xl shadow-slate-100 grid grid-cols-2 md:grid-cols-4 divide-x divide-x-reverse divide-slate-100">
          {[
            { value: stats.completed_exercises, label: 'تمرین‌های تکمیل‌شده' },
            { value: stats.streak, label: 'روز استمرار و پایداری', flame: true },
            { value: stats.journal_entries, label: 'یادداشت ثبت احساس' },
            { value: formatAssessment(stats.last_assessment_date), label: 'آخرین وضعیت پایش', badge: true },
          ].map((s, i) => (
            <div key={i} className="p-7 flex flex-col items-center gap-1.5 text-center">
              {s.badge ? (
                <span className="bg-brand-100 text-brand-700 text-sm font-black px-4 py-1.5 rounded-full">{s.value}</span>
              ) : (
                <p className="text-3xl font-black text-slate-900 flex items-center gap-1.5">
                  {s.value}
                  {s.flame && <Flame className="w-5 h-5 text-accent-500" />}
                </p>
              )}
              <p className="text-[11px] font-bold text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ تمرین‌های پیشنهادی ============ */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 pb-8 space-y-10">
        <div className="flex flex-wrap gap-4 justify-between items-end">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">پیشنهادهای مخصوص تو</h2>
            <p className="text-sm font-bold text-slate-400 mt-2">منتخب بر اساس وضعیت روحی شما</p>
          </div>
          <Link href="/exercises" className="text-brand-600 text-sm font-black hover:underline px-5 py-2.5 bg-brand-50 rounded-full transition-colors">
            مشاهده همه
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {loadingData ? (
            <div className="flex justify-center p-16 md:col-span-2">
              <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            </div>
          ) : suggestedExercises.length > 0 ? (
            suggestedExercises.map((ex, i) => {
              const info = ex.exercise_info || ex;
              return (
                <motion.div
                  key={info.id || i}
                  whileHover={{ y: -6 }}
                  className="group relative bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 flex justify-between items-center transition-all overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-2 h-full bg-gradient-to-b opacity-20 ${info.is_completed ? 'from-emerald-500 to-teal-600' : 'from-brand-500 to-brand-700'}`} />
                  <div className="flex items-center gap-5 relative z-10">
                    <div className={`p-4 rounded-[1.5rem] shadow-inner group-hover:rotate-12 transition-transform duration-500 ${info.is_completed ? 'bg-emerald-50 text-emerald-500' : 'bg-brand-50 text-brand-600'}`}>
                      <Wind className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-lg font-extrabold text-slate-900">{info.title}</h4>
                        {info.is_completed && (
                          <span className="bg-emerald-100/60 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-full">انجام شده</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{info.duration} دقیقه</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{info.trauma_type}</span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/exercises/${info.id}`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-brand-500 to-brand-700 text-white px-7 py-3 rounded-2xl text-xs font-black shadow-lg shadow-brand-200 group-hover:shadow-brand-300 transition-all"
                    >
                      {info.is_completed ? 'بازبینی' : 'شروع'}
                    </motion.button>
                  </Link>
                </motion.div>
              );
            })
          ) : !hasAssessment ? (
            <div className="md:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 p-10 text-center flex flex-col items-center gap-4">
              <span className="w-16 h-16 rounded-[1.5rem] bg-brand-50 text-brand-500 flex items-center justify-center">
                <ClipboardList className="w-8 h-8" />
              </span>
              <h3 className="text-lg font-black text-slate-900">ابتدا ارزیابی را انجام بده</h3>
              <p className="text-sm font-bold text-slate-400 max-w-md leading-relaxed">
                تمرین‌های شفابخش تا وقتی ارزیابی وضعیت را کامل نکرده‌ای باز نمی‌شوند. با یک ارزیابی کوتاه، مسیر شخصی تو ساخته می‌شود.
              </p>
              <Link href="/assessment" className="btn-accent inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-black shadow-lg shadow-accent-500/20">
                <ClipboardList className="w-5 h-5" />
                شروع ارزیابی
              </Link>
            </div>
          ) : (
            <p className="text-center text-slate-400 text-sm py-16 bg-white/40 rounded-[2rem] border border-dashed border-slate-200 md:col-span-2">
              تمرینی برای نمایش وجود ندارد
            </p>
          )}
        </div>
      </section>

      {/* ============ درگاه‌های منو ============ */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 py-16 space-y-8">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 bg-brand-500 rounded-full" />
          بخش‌های شفابخش و درگاه‌های منو
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {GATEWAYS.map((g, i) => {
            const col = COLOR[g.color];
            return (
              <Link href={g.href} key={i} className="block">
                <motion.div
                  whileHover={{ y: -6 }}
                  className="h-full bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 p-7 flex flex-col gap-4 group"
                >
                  <span className={`w-[3.25rem] h-[3.25rem] rounded-2xl ${col.bg} ${col.text} flex items-center justify-center`}>
                    <g.icon className="w-6 h-6" />
                  </span>
                  <div className="flex-1">
                    <h3 className="text-base font-black text-slate-900">{g.title}</h3>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed mt-2">{g.desc}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs font-black ${col.text} group-hover:gap-2 transition-all`}>
                    <ChevronLeft className="w-4 h-4" />
                    {g.cta}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ============ مود امروز + پیام خودمراقبتی + نقل‌قول ============ */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 pb-24 space-y-8">
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 bg-brand-500 rounded-full" />
            وضعیت انرژی و عواطف امروز شما چطور است؟
          </h2>
          <span className="bg-brand-50 text-brand-600 text-[11px] font-black px-3.5 py-1.5 rounded-full">پایش عاطفی روزانه</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* مود + پیام خودمراقبتی */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {MOODS.map((m) => {
                const active = selectedMood === m.value;
                return (
                  <motion.button
                    key={m.value}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleMood(m.value)}
                    className={`flex flex-col items-center gap-2.5 py-5 rounded-[1.5rem] border transition-all ${
                      active
                        ? 'bg-white border-brand-300 ring-4 ring-brand-100 shadow-xl shadow-slate-200'
                        : 'bg-white/60 border-slate-100 hover:bg-white hover:shadow-lg'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full ${m.dot} ${active ? 'ring-4 ring-white' : ''}`} />
                    <span className={`text-xs font-black ${active ? 'text-slate-800' : 'text-slate-500'}`}>{m.label}</span>
                    <span className={`text-[9px] font-black tracking-widest ${active ? 'text-brand-600' : 'text-slate-300'}`}>
                      {active ? 'فعال' : 'انتخاب'}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 p-7 flex items-start gap-5">
              <span className="shrink-0 w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <HeartHandshake className="w-6 h-6" />
              </span>
              <div>
                <p className="text-xs font-black text-brand-600 mb-1.5">پیام خودمراقبتی آرامینا:</p>
                <p className="text-sm font-bold text-slate-600 leading-relaxed">
                  {selectedMood !== null && selectedMood <= 1
                    ? `${userName ? userName + ' جان، ' : ''}می‌دانم امروز حالت سنگین است. لازم نیست قوی باشی؛ فقط یک نفس عمیق بکش و بگذار این لحظه بگذرد. ما کنارت هستیم. 💜`
                    : `${userName ? userName + ' جان، ' : ''}خوشحالیم که امروز حس شادابی و پذیرش داری. آماده‌ای یک تمرین خودمراقبتیِ لذت‌بخش انجام دهی تا این جریان نشاط تقویت شود؟`}
                </p>
              </div>
            </div>
          </div>

          {/* نقل‌قول */}
          <div className="relative bg-brand-600 rounded-[2rem] p-8 text-white shadow-2xl shadow-brand-900/20 overflow-hidden flex flex-col justify-between">
            <Quote className="absolute -top-3 -left-3 w-24 h-24 text-white/10" />
            <div className="relative z-10 space-y-4">
              <Quote className="w-8 h-8 text-white/40" />
              <motion.p
                key={quoteIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg font-bold leading-relaxed italic"
              >
                «{QUOTES[quoteIdx].text}»
              </motion.p>
              <p className="text-sm font-black text-brand-100">— {QUOTES[quoteIdx].by}</p>
            </div>
            <button
              onClick={() => setQuoteIdx((i) => (i + 1) % QUOTES.length)}
              className="relative z-10 mt-6 inline-flex items-center gap-2 self-start bg-white/15 hover:bg-white/25 border border-white/20 px-4 py-2 rounded-full text-xs font-black transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              جمله بعدی
            </button>
          </div>
        </div>
      </section>

      {/* فوتر */}
      <footer className="border-t border-slate-200/60 py-10 flex flex-col items-center gap-3 opacity-50">
        <span className="text-xl font-black text-slate-400">آرامینا</span>
        <span className="text-[10px] font-black uppercase tracking-[.25em] text-slate-400">Mindful Recovery</span>
      </footer>
    </div>
  );
}
