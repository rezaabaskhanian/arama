'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Wind,
  Search,
  Eye,
  PenTool,
  Shield,
  Anchor,
  BrainCircuit,
  Sparkles,
  Loader2,
  Trophy,
  Lock,
  ClipboardList,
} from 'lucide-react';
import {
  getExercisesByTraumaType,
  getUserProgress,
  completeExercise,
  getLatestAssessment,
} from '@/lib/api';

const traumaLabels = {
  mild: 'ترومای خفیف',
  moderate: 'ترومای متوسط',
  severe: 'ترومای شدید',
  complex: 'ترومای پیچیده',
};

function formatNextDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'long' }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function getExerciseIcon(title) {
  const icons = {
    'تنفس عمیق': <Wind className="w-8 h-8" />,
    'اسکن بدن': <Search className="w-8 h-8" />,
    'تکنیک ۵-۴-۳-۲-۱': <Eye className="w-8 h-8" />,
    'نوشتن احساسات': <PenTool className="w-8 h-8" />,
    'جعبه ایمن': <Shield className="w-8 h-8" />,
    'تمرین لنگر': <Anchor className="w-8 h-8" />,
    'مدیتیشن هدایت‌شده': <BrainCircuit className="w-8 h-8" />,
  };
  return icons[title] || <Sparkles className="w-8 h-8" />;
}

// صفحه‌ی قفلِ «ابتدا ارزیابی» — مشترک با لیست تمرین‌ها
function AssessmentGate() {
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

export default function ExerciseDetailPage() {
  const { id } = useParams();

  const [exercise, setExercise] = useState(null);
  const [traumaType, setTraumaType] = useState('mild');
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [locked, setLocked] = useState(false);
  const [gated, setGated] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // گیت ارزیابی: بدون ارزیابیِ کامل‌شده هیچ تمرینی باز نمی‌شود
        const latest = await getLatestAssessment();
        const savedTrauma = localStorage.getItem('traumaType');
        const trauma = latest?.trauma_type || savedTrauma;
        if (!trauma) {
          setGated(true);
          return;
        }
        if (latest?.trauma_type) localStorage.setItem('traumaType', latest.trauma_type);
        setTraumaType(trauma);

        const list = await getExercisesByTraumaType(trauma);
        const found = list.find((item) => item.exercise_info?.id === id);
        if (!found) throw new Error('این تمرین پیدا نشد.');
        setExercise(found.exercise_info);
        setCompleted(!!found.exercise_info.is_completed);
        setLocked(!!found.exercise_info.is_locked);

        const progressData = await getUserProgress(trauma);
        setProgress(progressData);
      } catch (err) {
        setError(err.message || 'خطا در بارگذاری تمرین');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleComplete = async () => {
    try {
      setCompleting(true);
      setError('');
      await completeExercise(id, traumaType);
      const progressData = await getUserProgress(traumaType);
      setProgress(progressData);
      setCompleted(true);
    } catch (err) {
      setError(err.message || 'خطا در ثبت تمرین');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center" dir="rtl">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (gated) return <AssessmentGate />;

  if (error && !exercise) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6" dir="rtl">
        <div className="text-center space-y-6 bg-white rounded-[2.5rem] p-12 border border-slate-100 shadow-xl shadow-slate-100">
          <p className="text-slate-600 font-bold">{error}</p>
          <Link href="/exercises" className="inline-flex bg-brand-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-brand-200">
            بازگشت به تمرین‌ها
          </Link>
        </div>
      </div>
    );
  }

  const progressPercent = progress?.progress_percent || 0;
  const traumaTypeLabel = traumaLabels[traumaType] || 'نامشخص';

  return (
    <div className="min-h-screen bg-surface text-slate-800 pb-24 selection:bg-brand-100" dir="rtl">
      <main className="max-w-3xl mx-auto px-6 sm:px-10 pt-10 space-y-7">
        <Link
          href="/exercises"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-500 font-black text-xs uppercase tracking-widest transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          بازگشت به لیست تمرین‌ها
        </Link>

        {/* کارت تمرین */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 p-8 space-y-6">
          <div className="flex items-center gap-5">
            <div className={`p-5 rounded-[1.5rem] shadow-inner ${completed ? 'bg-emerald-50 text-emerald-500' : 'bg-brand-50 text-brand-600'}`}>
              {getExerciseIcon(exercise.title)}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{exercise.title}</h1>
                {completed && (
                  <span className="bg-emerald-100/50 text-emerald-600 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    انجام شده
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {exercise.duration} دقیقه</span>
                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                <span>سطح: {traumaTypeLabel}</span>
              </div>
            </div>
          </div>

          {exercise.description && (
            <div className="p-6 bg-brand-50/60 border border-brand-100/50 rounded-[1.75rem] space-y-3">
              <h2 className="font-black text-brand-800 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-500" />
                راهنمای گام‌به‌گام
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed font-medium whitespace-pre-line">
                {exercise.description}
              </p>
            </div>
          )}
        </div>

        {/* نوار پیشرفت (فشرده) */}
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-[1.75rem] p-6 text-white shadow-xl shadow-brand-900/20">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-[11px] font-bold text-brand-100 uppercase tracking-widest mb-0.5">پیشرفت شما</p>
              <h2 className="text-2xl font-black">{progressPercent}% کامل شده</h2>
            </div>
            <span className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-black border border-white/20 whitespace-nowrap">
              {progress?.completed_exercises || 0} از {progress?.total_exercises || 0} تمرین
            </span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'circOut' }}
              className="h-full bg-accent-400 rounded-full"
            />
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl p-4 text-sm font-bold text-center">
            {error}
          </div>
        )}

        {/* اکشن پایانی */}
        {completed ? (
          <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Trophy className="w-7 h-7" />
            </div>
            <p className="text-emerald-800 font-black">آفرین! این تمرین با موفقیت ثبت شد. 🌱</p>
            <Link
              href="/exercises"
              className="inline-flex bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-emerald-200 active:scale-95 transition-all"
            >
              بازگشت به تمرین‌ها
            </Link>
          </div>
        ) : locked ? (
          <div className="bg-white border border-slate-100 rounded-[2rem] p-8 text-center space-y-4 shadow-xl shadow-slate-100">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <p className="text-slate-700 font-black">این تمرین هنوز قفل است 🔒</p>
            <p className="text-slate-500 text-sm font-bold leading-relaxed max-w-sm mx-auto">
              {progress?.completed_today
                ? `تمرین امروزت را انجام دادی. تمرین بعدی${progress?.next_available_date ? ' ' + formatNextDate(progress.next_available_date) : ' فردا'} باز می‌شود.`
                : 'برای باز شدن این تمرین، ابتدا باید تمرین‌های قبلی را کامل کنی.'}
            </p>
            <Link
              href="/exercises"
              className="inline-flex bg-slate-100 text-slate-600 px-8 py-4 rounded-2xl font-black hover:bg-slate-200 active:scale-95 transition-all"
            >
              بازگشت به تمرین‌ها
            </Link>
          </div>
        ) : (
          <button
            onClick={handleComplete}
            disabled={completing}
            className="btn-accent w-full py-5 rounded-2xl font-black text-lg shadow-xl shadow-accent-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {completing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                در حال ثبت...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                تمرین را انجام دادم
              </>
            )}
          </button>
        )}
      </main>
    </div>
  );
}
