'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { startAssessment, getAssessmentQuestions, submitAssessment } from '@/lib/api';
import DecorativeBlobs from '@/components/layout/DecorativeBlobs';
import { Heart, ChevronLeft, AlertCircle, Loader2 } from 'lucide-react';

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
      setError('خطا در شروع تست. لطفاً اتصال خود را بررسی کنید.');
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

      console.log(response,"response.trauma_type")

      localStorage.setItem('lastAssessmentResult', JSON.stringify(response));
      localStorage.setItem('traumaType', response.trauma_type);
      router.push(`/assessment/result/${response.assessment_id}`);
    } catch (err) {
      setError('خطا در ثبت پاسخ‌ها. لطفاً دوباره تلاش کنید.');
      setSubmitting(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center relative overflow-hidden" dir="rtl">
        <DecorativeBlobs />
        <div className="relative z-10 text-center space-y-4">
          <div className="w-16 h-16 bg-white/50 backdrop-blur-xl rounded-[2rem] flex items-center justify-center shadow-xl border border-white/50 mx-auto">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
          <p className="text-slate-500 font-bold animate-pulse">در حال آماده‌سازی تست...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
        <DecorativeBlobs />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 bg-white/70 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] p-8 text-center max-w-md shadow-2xl shadow-red-900/5"
        >
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8" />
          </div>
          <p className="text-slate-900 font-extrabold text-lg mb-6 leading-relaxed">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all"
          >
            تلاش مجدد
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 py-12 px-4 relative overflow-hidden" dir="rtl">
      <DecorativeBlobs />

      <div className="max-w-xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* هدر و نوار پیشرفت */}
            <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-6 rounded-[2.5rem] shadow-xl shadow-blue-900/5">
              <div className="flex justify-between items-end mb-4 px-2">
                <div>
                  <h1 className="text-xl font-black text-slate-900 leading-tight">پایش وضعیت روحی</h1>
                  <p className="text-xs font-bold text-slate-400 mt-1">سوال {currentIndex + 1} از {questions.length}</p>
                </div>
                <div className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl text-xs font-black">
                  {Math.round(progress)}%
                </div>
              </div>
              <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 to-teal-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                />
              </div>
            </div>

            {/* کارت سوال */}
            <div className="bg-white/80 backdrop-blur-2xl border border-white border-b-slate-100/50 rounded-[3rem] shadow-2xl shadow-slate-200/50 p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl">
                  <Heart className="w-6 h-6 fill-current" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">
                  {currentQuestion?.text}
                </h2>
              </div>

              <div className="grid gap-3">
                {[
                  { score: 0, label: 'اصلاً', color: 'hover:bg-slate-50 border-slate-100', text: 'text-slate-600', bg: 'bg-slate-50/50' },
                  { score: 1, label: 'کمی', color: 'hover:bg-emerald-50 border-emerald-100', text: 'text-emerald-700', bg: 'bg-emerald-50/50' },
                  { score: 2, label: 'متوسط', color: 'hover:bg-amber-50 border-amber-100', text: 'text-amber-700', bg: 'bg-amber-50/50' },
                  { score: 3, label: 'خیلی', color: 'hover:bg-orange-50 border-orange-100', text: 'text-orange-700', bg: 'bg-orange-50/50' },
                  { score: 4, label: 'فوق‌العاده زیاد', color: 'hover:bg-red-50 border-red-100', text: 'text-red-700', bg: 'bg-red-50/50' },
                ].map((option) => (
                  <motion.button
                    key={option.score}
                    whileHover={{ scale: 1.02, x: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(option.score)}
                    disabled={submitting}
                    className={`w-full p-5 text-right rounded-[2rem] border-2 transition-all duration-300 group flex justify-between items-center ${option.color} ${option.bg}`}
                  >
                    <span className={`font-black text-lg ${option.text}`}>{option.label}</span>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm bg-white shadow-sm border border-inherit group-hover:shadow-md transition-all`}>
                      {option.score}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* دکمه قبلی */}
            <div className="flex justify-between items-center px-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrev}
                disabled={currentIndex === 0 || submitting}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 hover:text-slate-900 transition-all disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5 rotate-180" />
                <span>قبلی</span>
              </motion.button>

              {!isLast && (
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  یکی از گزینه‌ها را انتخاب کنید
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* پیام ایمنی */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 p-6 bg-gradient-to-br from-amber-50/50 to-orange-50/50 backdrop-blur-md border border-amber-100/50 rounded-[2rem] text-amber-900/80 text-center space-y-2 shadow-inner"
        >
          <div className="flex justify-center mb-2">
            <AlertCircle className="w-6 h-6 text-amber-500" />
          </div>
          <p className="text-sm font-bold leading-relaxed">
            اگر در حین پاسخ‌گویی احساس ناراحتی کردی، می‌توانی تست را متوقف کنی.
          </p>
          <p className="text-xs font-medium">
            شماره خط کمک: <a href="tel:123" className="font-black underline decoration-amber-500/30 underline-offset-4">۱۲۳</a>
          </p>
        </motion.div>

        {/* لودینگ هنگام ارسال */}
        <AnimatePresence>
          {submitting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-6"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-[3rem] p-10 text-center shadow-2xl max-w-sm w-full"
              >
                <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Loader2 className="w-10 h-10 animate-spin" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">در حال تحلیل هوشمند</h3>
                <p className="text-slate-500 font-bold text-sm">صبور باشید، در حال بررسی پاسخ‌های شما هستیم...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}