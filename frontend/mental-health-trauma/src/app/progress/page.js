'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Flame,
  Wind,
  BookOpen,
  ShieldCheck,
  Loader2,
  Sparkles,
  CalendarClock,
  ClipboardList,
  Check,
} from 'lucide-react';
import { getMoodTrend, getDashboardStats, getLatestAssessment } from '@/lib/api';

const MONTH_LABELS = ['۶ ماه پیش', '۵ ماه', '۴ ماه', '۳ ماه', '۲ ماه', 'این ماه'];

// ۴ خوشه‌ی اصلی علائم PTSD برای پالسِ روزانه (هرکدام ۰..۴)
const PULSE_QUESTIONS = [
  'خاطرات مزاحم یا فلاش‌بک',
  'بیش‌گوش‌به‌زنگی و تنش',
  'اجتناب از یادآورها',
  'مشکل خواب یا خلقِ منفی',
];

const SYMPTOM_KEY = 'aramina_symptom_log'; // [{date, scores:[4], index}]
const ASSESS_KEY = 'aramina_assessment_history'; // [{id, score, date}]
const REASSESS_DAYS = 7;

const todayStr = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD (local)

function readJSON(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return Array.isArray(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

function bucketAverages(arr, n) {
  if (!arr.length) return Array(n).fill(0);
  const out = [];
  const size = arr.length / n;
  for (let i = 0; i < n; i++) {
    const slice = arr.slice(Math.floor(i * size), Math.floor((i + 1) * size));
    const valid = slice.filter((v) => v > 0);
    out.push(valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0);
  }
  return out;
}

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [buckets, setBuckets] = useState(Array(6).fill(0));
  const [streak, setStreak] = useState(0);
  const [stats, setStats] = useState({ progress_percent: 0, completed_exercises: 0, total_exercises: 0, journal_entries: 0 });
  const [score, setScore] = useState(null);
  const [daysSinceAssess, setDaysSinceAssess] = useState(null);
  const [assessHistory, setAssessHistory] = useState([]);

  // پالسِ روزانه
  const [symptomLog, setSymptomLog] = useState([]);
  const [pulse, setPulse] = useState([null, null, null, null]);
  const [savedToday, setSavedToday] = useState(false);

  useEffect(() => {
    // بارگذاری لاگِ محلیِ علائم
    const log = readJSON(SYMPTOM_KEY, []);
    setSymptomLog(log);
    const today = log.find((e) => e.date === todayStr());
    if (today) {
      setPulse(today.scores);
      setSavedToday(true);
    }

    async function load() {
      try {
        setLoading(true);
        const traumaType = localStorage.getItem('traumaType') || 'mild';
        const [trend, dash, latest] = await Promise.all([
          getMoodTrend(180),
          getDashboardStats(traumaType),
          getLatestAssessment(),
        ]);
        const chrono = [...(trend?.moods || [])].reverse();
        setBuckets(bucketAverages(chrono, 6));
        setStreak(trend?.streak || 0);
        if (dash) setStats(dash);

        if (latest && typeof latest.total_score === 'number') {
          setScore(latest.total_score);
          // تاریخِ آخرین ارزیابی
          const when = latest.completed_at ? new Date(latest.completed_at) : null;
          if (when) setDaysSinceAssess(Math.floor((Date.now() - when.getTime()) / 86400000));
          // ساختِ تاریخچه‌ی محلیِ نمرات (dedup بر اساس assessment_id)
          const hist = readJSON(ASSESS_KEY, []);
          const id = latest.assessment_id || latest.id;
          if (id && !hist.some((h) => h.id === id)) {
            hist.push({ id, score: latest.total_score, date: latest.completed_at || todayStr() });
            localStorage.setItem(ASSESS_KEY, JSON.stringify(hist));
          }
          setAssessHistory(hist);
        } else {
          setAssessHistory(readJSON(ASSESS_KEY, []));
          setDaysSinceAssess(Infinity); // ارزیابی‌ای ثبت نشده
        }
      } catch (err) {
        console.error('Error loading progress:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const savePulse = () => {
    if (pulse.some((v) => v === null)) return;
    const index = Math.round((pulse.reduce((a, b) => a + b, 0) / (PULSE_QUESTIONS.length * 4)) * 100);
    const rest = symptomLog.filter((e) => e.date !== todayStr());
    const next = [...rest, { date: todayStr(), scores: pulse, index }].sort((a, b) => a.date.localeCompare(b.date));
    setSymptomLog(next);
    localStorage.setItem(SYMPTOM_KEY, JSON.stringify(next));
    setSavedToday(true);
  };

  // مشتقات
  const pct = (m) => Math.max(0, Math.min(100, (m / 4) * 100));
  const filledMood = buckets.filter((b) => b > 0);
  const moodImproved = (filledMood.at(-1) || 0) - (filledMood[0] || 0);

  const last14 = symptomLog.slice(-14);
  const symFirst = last14[0]?.index ?? null;
  const symLast = last14.at(-1)?.index ?? null;
  const symImproved = symFirst !== null && symLast !== null ? symFirst - symLast : 0; // مثبت = بهبود (کاهش شدت)
  const todayIndex = symptomLog.find((e) => e.date === todayStr())?.index ?? null;

  const severity = (s) => {
    if (s === null) return { label: 'ثبت نشده', tone: 'text-slate-400', bar: 'bg-slate-300' };
    if (s <= 20) return { label: 'خفیف', tone: 'text-calm-600', bar: 'bg-calm-500' };
    if (s <= 32) return { label: 'متوسط', tone: 'text-warm-500', bar: 'bg-warm-400' };
    if (s <= 50) return { label: 'شدید', tone: 'text-orange-500', bar: 'bg-orange-500' };
    return { label: 'بسیار شدید', tone: 'text-accent-600', bar: 'bg-accent-500' };
  };
  const sev = severity(score);

  const symColor = (i) => (i <= 33 ? 'from-calm-500 to-calm-400' : i <= 66 ? 'from-warm-400 to-warm-500' : 'from-accent-400 to-accent-500');

  const exercisePct = stats.total_exercises ? Math.round((stats.completed_exercises / stats.total_exercises) * 100) : 0;
  const colorMap = {
    brand: { text: 'text-brand-600', bg: 'bg-brand-50', bar: 'bg-brand-500' },
    calm: { text: 'text-calm-600', bg: 'bg-calm-50', bar: 'bg-calm-500' },
    warm: { text: 'text-warm-500', bg: 'bg-warm-50', bar: 'bg-warm-400' },
  };
  const indicators = [
    { label: 'استمرار تمرین', icon: Wind, value: exercisePct, hint: `${stats.completed_exercises} از ${stats.total_exercises} تمرین`, color: 'calm' },
    { label: 'خودمراقبتی', icon: BookOpen, value: Math.min(100, stats.journal_entries * 10), hint: `${stats.journal_entries} یادداشت`, color: 'warm' },
  ];

  const needsReassess = daysSinceAssess === Infinity || (daysSinceAssess !== null && daysSinceAssess >= REASSESS_DAYS);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center" dir="rtl">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-slate-800 pb-24 selection:bg-brand-100" dir="rtl">
      <main className="max-w-5xl mx-auto px-6 sm:px-10 pt-12 space-y-8">
        {/* سرصفحه */}
        <header className="space-y-2">
          <span className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 text-xs font-black px-4 py-2 rounded-full">
            <Sparkles className="w-4 h-4" />
            مسیر بهبودی تو
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">پایش وضعیت</h1>
          <p className="text-sm font-bold text-slate-400">هر روز علائمت را بسنج تا اثر تمرین‌ها را روی بهبودی‌ات ببینی</p>
        </header>

        {/* یادآور ارزیابی مجدد */}
        {needsReassess && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-brand-900 text-white rounded-[1.75rem] p-6 flex flex-wrap items-center justify-between gap-4 shadow-xl shadow-brand-900/20"
          >
            <div className="flex items-center gap-4">
              <span className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <CalendarClock className="w-6 h-6 text-accent-400" />
              </span>
              <div>
                <p className="font-black">وقتِ ارزیابی مجدد است</p>
                <p className="text-xs font-bold text-brand-100 mt-0.5">
                  {daysSinceAssess === Infinity
                    ? 'هنوز ارزیابیِ کاملی ثبت نکرده‌ای — نمره‌ی پایه‌ات را بگیر.'
                    : `${daysSinceAssess} روز از آخرین ارزیابی گذشته. هر ۱ تا ۲ هفته دوباره بسنج تا روندِ نمره را ببینی.`}
                </p>
              </div>
            </div>
            <Link href="/assessment" className="btn-accent inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-black shadow-lg shadow-accent-500/20">
              <ClipboardList className="w-5 h-5" />
              ارزیابی مجدد
            </Link>
          </motion.div>
        )}

        {/* پالسِ روزانه‌ی علائم */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 p-7 space-y-6"
        >
          <div className="flex flex-wrap gap-3 justify-between items-start">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-brand-500 rounded-full" />
                پایشِ امروزِ علائم
              </h2>
              <p className="text-xs font-bold text-slate-400 mt-1.5">شدت هر مورد را امروز چطور تجربه کردی؟ (۰ = اصلاً، ۴ = خیلی زیاد)</p>
            </div>
            {savedToday && todayIndex !== null && (
              <span className="inline-flex items-center gap-1.5 bg-calm-50 text-calm-600 px-3 py-1.5 rounded-full text-xs font-black">
                <Check className="w-3.5 h-3.5" /> ثبت شد · شاخص امروز {todayIndex}
              </span>
            )}
          </div>

          <div className="space-y-4">
            {PULSE_QUESTIONS.map((q, qi) => (
              <div key={qi} className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm font-black text-slate-700">{q}</span>
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 4].map((v) => {
                    const active = pulse[qi] === v;
                    return (
                      <button
                        key={v}
                        onClick={() => setPulse((p) => p.map((x, i) => (i === qi ? v : x)))}
                        className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${
                          active ? 'bg-brand-600 text-white shadow-lg shadow-brand-200 scale-105' : 'bg-slate-50 text-slate-400 hover:bg-brand-50 hover:text-brand-600'
                        }`}
                      >
                        {v}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={savePulse}
            disabled={pulse.some((v) => v === null)}
            className="btn-accent w-full py-4 rounded-2xl font-black shadow-lg shadow-accent-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {savedToday ? 'به‌روزرسانی پایش امروز' : 'ثبت پایش امروز'}
          </button>
        </motion.section>

        {/* نمودار روند علائم (۱۴ روز) */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 p-7 space-y-6"
        >
          <div className="flex flex-wrap gap-3 justify-between items-start">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-brand-500 rounded-full" />
                روند شدت علائم (۱۴ روز اخیر)
              </h2>
              <p className="text-xs font-bold text-slate-400 mt-1.5">پایین‌تر = بهتر. کاهشِ ستون‌ها یعنی تمرین‌ها اثر کرده‌اند.</p>
            </div>
            {last14.length >= 2 && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black ${symImproved >= 0 ? 'bg-calm-50 text-calm-600' : 'bg-accent-50 text-accent-600'}`}>
                {symImproved >= 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                {symImproved >= 0 ? `${symImproved} واحد کاهش` : `${Math.abs(symImproved)} واحد افزایش`}
              </span>
            )}
          </div>

          {last14.length === 0 ? (
            <p className="text-center text-slate-400 text-sm font-bold py-10">
              هنوز پایشی ثبت نکرده‌ای. با ثبتِ روزانه، روندِ علائمت اینجا شکل می‌گیرد.
            </p>
          ) : (
            <div className="flex items-end justify-between gap-1.5 h-48 pt-4">
              {last14.map((e, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 h-full" title={`${e.date} · ${e.index}`}>
                  <span className="text-[10px] font-black text-slate-400">{e.index}</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(4, e.index)}%` }}
                    transition={{ delay: i * 0.03, ease: 'easeOut' }}
                    className={`w-full rounded-t-xl bg-gradient-to-t ${symColor(e.index)} min-h-[6px]`}
                  />
                  <span className="text-[9px] font-bold text-slate-300">{e.date.slice(5).replace('-', '/')}</span>
                </div>
              ))}
            </div>
          )}
        </motion.section>

        {/* PCL-5: شدت + روند نمره + شاخص‌ها */}
        <div className="grid md:grid-cols-2 gap-6">
          <section className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 p-7 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-600" />
                نمره‌ی ارزیابی (PCL-5)
              </h2>
              <span className={`text-xs font-black px-3 py-1.5 rounded-full bg-slate-50 ${sev.tone}`}>{sev.label}</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black text-slate-900">{score ?? '—'}</span>
              <span className="text-sm font-bold text-slate-400 mb-1.5">از ۸۰</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${score !== null ? (score / 80) * 100 : 0}%` }} transition={{ duration: 1, ease: 'circOut' }} className={`h-full rounded-full ${sev.bar}`} />
            </div>

            {/* روندِ نمره بین ارزیابی‌ها */}
            {assessHistory.length >= 2 ? (
              <div className="pt-2 space-y-2">
                <p className="text-[11px] font-black text-slate-400">روندِ نمره در ارزیابی‌های اخیر:</p>
                <div className="flex items-end gap-1.5 h-16">
                  {assessHistory.slice(-8).map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 h-full" title={`${h.score}`}>
                      <motion.div initial={{ height: 0 }} animate={{ height: `${(h.score / 80) * 100}%` }} transition={{ delay: i * 0.05 }} className="w-full rounded-t bg-brand-400 min-h-[4px]" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs font-bold text-slate-500 leading-relaxed">
                {score === null ? 'هنوز ارزیابی‌ای ثبت نکرده‌ای.' : 'عددِ پایین‌تر یعنی علائم کمتر. بعد از ارزیابیِ بعدی، روندِ نمره‌ات همین‌جا نمایش داده می‌شود.'}
              </p>
            )}
          </section>

          <section className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 p-7 space-y-6">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-600" />
              شاخص‌های بهبودی
            </h2>
            <div className="space-y-5">
              {indicators.map((ind, i) => {
                const c = colorMap[ind.color];
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-black text-slate-700">
                        <ind.icon className={`w-4 h-4 ${c.text}`} />
                        {ind.label}
                      </span>
                      <span className="text-xs font-black text-slate-400">{Math.round(ind.value)}٪</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${ind.value}%` }} transition={{ delay: i * 0.1, duration: 0.8, ease: 'circOut' }} className={`h-full rounded-full ${c.bar}`} />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400">{ind.hint}</p>
                  </div>
                );
              })}
              <div className="flex items-center justify-between pt-1 text-sm">
                <span className="flex items-center gap-2 font-black text-slate-700"><Flame className="w-4 h-4 text-accent-500" /> روزهای پیاپی</span>
                <span className="font-black text-slate-900">{streak}</span>
              </div>
            </div>
          </section>
        </div>

        {/* روند مود ۶ ماهه (مکمل) */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 p-7 space-y-6"
        >
          <div className="flex flex-wrap gap-3 justify-between items-start">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-brand-500 rounded-full" />
                روندِ حال‌وهوا (۶ ماهه)
              </h2>
              <p className="text-xs font-bold text-slate-400 mt-1.5">میانگین حالِ ماهانه (بالاتر = بهتر)</p>
            </div>
            {filledMood.length >= 2 && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black ${moodImproved >= 0 ? 'bg-calm-50 text-calm-600' : 'bg-accent-50 text-accent-600'}`}>
                {moodImproved >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {moodImproved >= 0 ? 'رو به بهبود' : 'نیازمند توجه'}
              </span>
            )}
          </div>
          {filledMood.length === 0 ? (
            <p className="text-center text-slate-400 text-sm font-bold py-10">هنوز حالی ثبت نشده است.</p>
          ) : (
            <div className="flex items-end justify-between gap-3 h-40 pt-4">
              {buckets.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 h-full">
                  <span className="text-xs font-black text-slate-500">{m > 0 ? m.toFixed(1) : '—'}</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${m > 0 ? pct(m) : 2}%` }}
                    transition={{ delay: i * 0.08, ease: 'easeOut' }}
                    className={`w-full rounded-t-2xl min-h-[6px] ${m > 0 ? 'bg-gradient-to-t from-brand-500 to-brand-300' : 'bg-slate-100'}`}
                  />
                  <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{MONTH_LABELS[i]}</span>
                </div>
              ))}
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
}
