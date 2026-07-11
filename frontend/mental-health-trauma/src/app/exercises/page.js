'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { getExercisesByTraumaType, getUserProgress, getLatestAssessment } from '@/lib/api';
import { Search, Plus, Sparkles, Lock, Clock, ChevronLeft, Heart, LayoutGrid, Loader2, ClipboardList } from 'lucide-react';

const IMAGES = ['/ex/1.jpg', '/ex/2.jpg', '/ex/3.jpg', '/ex/4.jpg', '/ex/5.jpg', '/ex/6.jpg'];

// دسته‌بندی‌ها (فیلتر سمتِ کلاینت بر اساس کلیدواژه در عنوان/توضیح)
const CATEGORIES = [
  { key: 'all', label: 'همه تمرین‌ها', kw: [] },
  { key: 'trauma', label: 'تروما', kw: ['تروما', 'لنگر', 'جعبه', 'ایمن', 'فلاش'] },
  { key: 'calm', label: 'آرامش', kw: ['آرام', 'تنفس', 'یوگا', 'ریلکس', 'مدیتیشن'] },
  { key: 'anxiety', label: 'اضطراب', kw: ['اضطراب', 'استرس', '۵-۴-۳', 'ترس'] },
  { key: 'focus', label: 'تمرکز', kw: ['تمرکز', 'اسکن', 'ذهن', 'حضور'] },
  { key: 'sleep', label: 'خواب', kw: ['خواب', 'شب', 'آرام‌سازی'] },
];

const TRAUMA_LABELS = { mild: 'ترومای خفیف', moderate: 'ترومای متوسط', severe: 'ترومای شدید', complex: 'ترومای پیچیده' };

const difficulty = (d) => (d <= 10 ? 'ساده' : d <= 18 ? 'متوسط' : 'پیشرفته');

export default function ExercisesPage() {
  const [exercises, setExercises] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [traumaType, setTraumaType] = useState('mild');
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');
  const [gated, setGated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // گیت ارزیابی: بدون ارزیابیِ کامل‌شده هیچ تمرینی باز نمی‌شود
        const latest = await getLatestAssessment();
        const t = latest?.trauma_type || localStorage.getItem('traumaType');
        if (!t) {
          setGated(true);
          return;
        }
        if (latest?.trauma_type) localStorage.setItem('traumaType', latest.trauma_type);
        setTraumaType(t);
        const [ex, prog] = await Promise.all([getExercisesByTraumaType(t), getUserProgress(t)]);
        setExercises(ex || []);
        setProgress(prog || {});
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const c = CATEGORIES.find((x) => x.key === cat);
    return exercises.filter((e) => {
      const info = e.exercise_info || e;
      const hay = `${info.title || ''} ${info.description || ''}`;
      const matchQ = !query.trim() || hay.includes(query.trim());
      const matchC = cat === 'all' || (c && c.kw.some((k) => hay.includes(k)));
      return matchQ && matchC;
    });
  }, [exercises, query, cat]);

  const traumaLabel = TRAUMA_LABELS[traumaType] || 'نامشخص';

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center" dir="rtl">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (gated) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6" dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100 p-10 sm:p-14 text-center max-w-lg space-y-5"
        >
          <span className="w-20 h-20 rounded-[2rem] bg-brand-50 text-brand-500 flex items-center justify-center mx-auto">
            <Lock className="w-10 h-10" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">ابتدا ارزیابی را انجام بده</h1>
          <p className="text-sm font-bold text-slate-500 leading-relaxed">
            تمرین‌های شفابخش بر اساس سطح ترومای تو شخصی‌سازی می‌شوند. تا وقتی ارزیابی وضعیت را کامل نکرده‌ای،
            هیچ تمرینی باز نمی‌شود. این اولین و مهم‌ترین قدم مسیر توست.
          </p>
          <Link
            href="/assessment"
            className="btn-accent inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-black shadow-lg shadow-accent-500/20"
          >
            <ClipboardList className="w-5 h-5" />
            شروع ارزیابی
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-slate-800 pb-24 selection:bg-brand-100" dir="rtl">
      <main className="max-w-6xl mx-auto px-6 sm:px-10 pt-10 space-y-8">
        {/* جست‌وجو + ایجاد تکنیک */}
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جست‌وجوی تمرین، تکنیک تنفس یا مدیتیشن تروما..."
              className="w-full bg-white rounded-[1.5rem] border border-slate-100 shadow-lg shadow-slate-100 pr-14 pl-6 py-5 font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100 transition-all"
            />
          </div>
          <Link
            href="/commitments"
            className="btn-accent inline-flex items-center gap-2 rounded-[1.5rem] px-7 font-black shadow-lg shadow-accent-500/20 shrink-0"
          >
            <Plus className="w-5 h-5" />
            ایجاد تکنیک شخصی مراجع
          </Link>
        </div>

        {/* دسته‌ها */}
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((c) => {
            const active = cat === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setCat(c.key)}
                className={`px-6 py-3 rounded-full text-sm font-black transition-all ${
                  active ? 'bg-brand-900 text-white shadow-lg shadow-brand-900/20' : 'bg-white text-slate-500 hover:text-brand-600 border border-slate-100'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* قانون پایش زنجیره‌ای */}
        <div className="bg-white/60 border border-white/80 rounded-[2rem] p-6 flex items-start gap-5 shadow-sm">
          <span className="shrink-0 text-brand-500">
            <Sparkles className="w-7 h-7" />
          </span>
          <div>
            <p className="font-black text-slate-800 mb-1.5">قانون پایش زنجیره‌ای خودمراقبتی آرامینا:</p>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">
              تکنیک‌ها به گونه‌ای زنجیره‌ای و پایش‌یافته طراحی شده‌اند تا بار روحی به سیستم عصبی شما تحمیل نشود. با کلیک بر روی هر تمرین آزاد
              و فشردن دکمه‌ی «اتمام تمرین»، تمرین به عنوان انجام‌شده ثبت شده و تکنیک بعد به صورت خودکار باز می‌گردد.
            </p>
          </div>
        </div>

        {/* گرید تمرین‌ها */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 p-16 text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4">
              <LayoutGrid className="w-8 h-8" />
            </div>
            <p className="text-slate-500 font-bold">تمرینی با این فیلتر پیدا نشد.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((exercise, index) => {
              const info = exercise.exercise_info || exercise;
              const completed = info.is_completed;
              const locked = info.is_locked;
              const img = IMAGES[index % IMAGES.length];
              return (
                <motion.div
                  key={info.id || index}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 overflow-hidden flex flex-col"
                >
                  {/* تصویر */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={img}
                      alt=""
                      className={`w-full h-full object-cover transition-all duration-500 ${
                        locked ? 'grayscale blur-[2px] scale-105' : 'group-hover:scale-105'
                      }`}
                    />
                    {locked && <div className="absolute inset-0 bg-slate-500/30" />}
                    {completed && !locked && (
                      <span className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-lg">
                        <Heart className="w-4 h-4 text-accent-500 fill-current" />
                      </span>
                    )}
                    {locked ? (
                      <>
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
                          <Lock className="w-6 h-6 text-slate-500" />
                        </span>
                        <span className="absolute bottom-4 right-4 bg-slate-700/80 text-white text-[11px] font-black px-3 py-1.5 rounded-full backdrop-blur-sm">
                          قفل (فردا باز می‌شود)
                        </span>
                      </>
                    ) : (
                      <span className="absolute bottom-4 left-4 btn-accent text-[11px] font-black px-3 py-1.5 rounded-full shadow-lg">
                        باز (آماده تمرین)
                      </span>
                    )}
                  </div>

                  {/* بدنه */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className={`text-lg font-black leading-tight ${locked ? 'text-slate-400' : 'text-slate-900'}`}>
                        {info.title}
                      </h3>
                      <span className="shrink-0 bg-slate-100 text-slate-500 text-[10px] font-black px-2.5 py-1 rounded-lg">
                        {difficulty(info.duration || 10)}
                      </span>
                    </div>
                    <p className={`text-sm font-medium leading-relaxed mt-3 flex-1 ${locked ? 'text-slate-300' : 'text-slate-500'}`}>
                      {info.description}
                    </p>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                        <Clock className="w-4 h-4" />
                        {info.duration} دقیقه
                      </span>
                      {locked ? (
                        <span className="text-[11px] font-black text-slate-300">تمرین قبلی را انجام دهید</span>
                      ) : (
                        <Link
                          href={`/exercises/${info.id}`}
                          className="inline-flex items-center gap-1 text-sm font-black text-brand-600 group-hover:gap-2 transition-all"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          {completed ? 'بازبینی تمرین' : 'شروع تمرین'}
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <p className="text-center text-xs font-bold text-slate-400 pt-2">
          سطح فعلی شما: <span className="text-brand-600">{traumaLabel}</span>
          {' · '}
          {progress?.completed_exercises || 0} از {progress?.total_exercises || 0} تمرین تکمیل شده
        </p>
      </main>
    </div>
  );
}
