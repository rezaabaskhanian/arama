'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { startAssessment, getAssessmentQuestions, submitAssessment } from '@/lib/api';
import { Heart, ChevronLeft, AlertCircle, Loader2, ClipboardList } from 'lucide-react';

const OPTIONS = [
  { score: 0, label: 'اصلاً', ring: 'hover:border-slate-200', badge: 'bg-slate-100 text-slate-500' },
  { score: 1, label: 'کمی', ring: 'hover:border-calm-200', badge: 'bg-calm-50 text-calm-600' },
  { score: 2, label: 'متوسط', ring: 'hover:border-warm-200', badge: 'bg-warm-50 text-warm-500' },
  { score: 3, label: 'خیلی', ring: 'hover:border-orange-200', badge: 'bg-orange-50 text-orange-500' },
  { score: 4, label: 'فوق‌العاده زیاد', ring: 'hover:border-accent-200', badge: 'bg-accent-50 text-accent-600' },
];

export default function AssessmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [assessmentId, setAssessmentId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    StartAssessment();
  }, []);

  const StartAssessment = async () => {
    try {
      setLoading(true);
      const startRes = await startAssessment();
      setAssessmentId(startRes.assessment_info.id);
      const questionsRes = await getAssessmentQuestions();
      setQuestions(questionsRes.questions);
    } catch (err) {
      setError('خطا در شروع ارزیابی. لطفاً اتصال خود را بررسی کنید.');
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const progress = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const handleAnswer = async (score) => {
    const newAnswers = { ...answers, [currentQuestion.id]: score };
    setAnswers(newAnswers);
    if (isLast) {
      await SubmitAssessment(newAnswers);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const SubmitAssessment = async (Answers) => {
    setSubmitting(true);
    setError('');
    try {
      const response = await submitAssessment(assessmentId, Answers);
      localStorage.setItem('lastAssessmentResult', JSON.stringify(response));
      localStorage.setItem('traumaType', response.trauma_type);
      router.push(`/assessment/result/${response.assessment_id}`);
    } catch (err) {
      setError('خطا در ثبت پاسخ‌ها. لطفاً دوباره تلاش کنید.');
      setSubmitting(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-brand-500 animate-spin mx-auto" />
          <p className="text-slate-500 font-bold">در حال آماده‌سازی ارزیابی...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6" dir="rtl">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100 p-10 text-center max-w-md space-y-5">
          <span className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </span>
          <p className="text-slate-900 font-extrabold text-lg leading-relaxed">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-brand-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-slate-800 pb-24 selection:bg-brand-100" dir="rtl">
      <main className="max-w-2xl mx-auto px-6 sm:px-10 pt-10 space-y-6">
        {/* سرصفحه + نوار پیشرفت */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 p-6">
          <div className="flex justify-between items-end mb-4">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <ClipboardList className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-lg font-black text-slate-900 leading-tight">ارزیابی وضعیت روحی</h1>
                <p className="text-xs font-bold text-slate-400 mt-0.5">سوال {currentIndex + 1} از {questions.length}</p>
              </div>
            </div>
            <span className="bg-brand-50 text-brand-600 px-3 py-1.5 rounded-xl text-xs font-black">{Math.round(progress)}%</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'circOut' }}
              className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full"
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* کارت سوال */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 p-8">
              <div className="flex items-center gap-4 mb-8">
                <span className="p-3 bg-brand-50 text-brand-500 rounded-2xl shrink-0">
                  <Heart className="w-6 h-6 fill-current" />
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  {currentQuestion?.text}
                </h2>
              </div>

              <div className="grid gap-3">
                {OPTIONS.map((option) => (
                  <motion.button
                    key={option.score}
                    whileHover={{ x: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(option.score)}
                    disabled={submitting}
                    className={`w-full p-5 text-right rounded-[1.5rem] border-2 border-slate-100 bg-slate-50/40 transition-all flex justify-between items-center group ${option.ring} hover:bg-white hover:shadow-lg disabled:opacity-60`}
                  >
                    <span className="font-black text-lg text-slate-700">{option.label}</span>
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${option.badge}`}>
                      {option.score}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* دکمه قبلی */}
            <div className="flex justify-between items-center">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handlePrev}
                disabled={currentIndex === 0 || submitting}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-100 text-slate-500 font-bold hover:bg-slate-50 hover:text-slate-900 transition-all disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5 rotate-180" />
                <span>قبلی</span>
              </motion.button>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                یکی از گزینه‌ها را انتخاب کنید
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* پیام ایمنی */}
        <div className="bg-warm-50 border border-warm-100 rounded-[1.75rem] p-6 text-center space-y-2">
          <AlertCircle className="w-6 h-6 text-warm-500 mx-auto" />
          <p className="text-sm font-bold text-warm-900/80 leading-relaxed">
            اگر در حین پاسخ‌گویی احساس ناراحتی کردی، می‌توانی ارزیابی را متوقف کنی.
          </p>
          <p className="text-xs font-medium text-warm-900/60">
            شماره خط کمک: <a href="tel:123" className="font-black underline decoration-warm-500/30 underline-offset-4">۱۲۳</a>
          </p>
        </div>
      </main>

      {/* لودینگ هنگام ارسال */}
      <AnimatePresence>
        {submitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[60] p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-10 text-center shadow-2xl max-w-sm w-full"
            >
              <div className="w-20 h-20 bg-brand-50 text-brand-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Loader2 className="w-10 h-10 animate-spin" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">در حال تحلیل هوشمند</h3>
              <p className="text-slate-500 font-bold text-sm">صبور باش، در حال بررسی پاسخ‌های تو هستیم...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
