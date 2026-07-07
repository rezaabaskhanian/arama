'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { getExercisesByTraumaType, getUserProgress } from '@/lib/api';
import DecorativeBlobs from '@/components/layout/DecorativeBlobs';
import {
  Wind,
  BrainCircuit,
  Search,
  Eye,
  PenTool,
  Heart,
  Anchor,
  Shield,
  Sparkles,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';

export default function ExercisesPage() {
  const [exercises, setExercises] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [traumaType, setTraumaType] = useState('mild');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const savedTraumaType = localStorage.getItem('traumaType') || 'mild';
      setTraumaType(savedTraumaType);
      const exercisesData = await getExercisesByTraumaType(savedTraumaType);
      setExercises(exercisesData);
      const progressData = await getUserProgress(savedTraumaType);
      setProgress(progressData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTraumaTypeLabel = (type) => {
    const labels = {
      mild: 'ترومای خفیف',
      moderate: 'ترومای متوسط',
      severe: 'ترومای شدید',
      complex: 'ترومای پیچیده'
    };
    return labels[type] || 'نامشخص';
  };

  const toggleDescription = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center relative overflow-hidden" dir="rtl">
        <DecorativeBlobs />
        <div className="relative z-10 text-center space-y-4">
          <div className="w-16 h-16 bg-white/50 backdrop-blur-xl rounded-[2rem] flex items-center justify-center shadow-xl border border-white/50 mx-auto animate-pulse">
            <LayoutGrid className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
          <p className="text-slate-500 font-bold">در حال بارگذاری تمرین‌ها...</p>
        </div>
      </div>
    );
  }

  const progressPercent = progress?.progress_percent || 0;
  const traumaTypeLabel = getTraumaTypeLabel(traumaType);

  const getExerciseIcon = (title) => {
    const icons = {
      'تنفس عمیق': <Wind className="w-6 h-6" />,
      'اسکن بدن': <Search className="w-6 h-6" />,
      'تکنیک ۵-۴-۳-۲-۱': <Eye className="w-6 h-6" />,
      'نوشتن احساسات': <PenTool className="w-6 h-6" />,
      'جعبه ایمن': <Shield className="w-6 h-6" />,
      'تمرین لنگر': <Anchor className="w-6 h-6" />,
      'مدیتیشن هدایت‌شده': <BrainCircuit className="w-6 h-6" />,
    };
    return icons[title] || <Sparkles className="w-6 h-6" />;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 pb-20 relative overflow-hidden" dir="rtl">
      <DecorativeBlobs />

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-2xl mx-auto px-4 pt-12 space-y-8"
      >
        {/* هدر */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex p-4 bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white/50 text-blue-500 mb-2"
          >
            <BrainCircuit className="w-10 h-10" />
          </motion.div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">تمرین‌های شفابخش</h1>
          <div className="flex items-center justify-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">مناسب برای:</span>
            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-black">{traumaTypeLabel}</span>
          </div>
        </div>

        {/* کارت پیشرفت هوشمند */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-900/20"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-blue-100 uppercase tracking-widest mb-1">مسیر یادگیری شما</p>
                <h2 className="text-3xl font-black">{progressPercent}% کامل شده</h2>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-black border border-white/20 whitespace-nowrap">
                {progress?.completed_exercises || 0} از {progress?.total_exercises || 0} تمرین
              </div>
            </div>

            <div className="relative h-4 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full bg-gradient-to-r from-teal-300 to-emerald-400 rounded-full shadow-lg"
              />
            </div>

            <p className="text-sm font-medium text-blue-50 leading-relaxed text-center">
              {progressPercent === 0 && '✨ برای شروع سفر بهبودی، اولین تمرین را انتخاب کنید.'}
              {progressPercent > 0 && progressPercent < 100 && '🌱 با هر تمرین، به آرامش درونی نزدیک‌تر می‌شوید. ادامه دهید!'}
              {progressPercent === 100 && '🏆 تبریک! شما تمام تمرین‌های این مرحله را با موفقیت انجام دادید.'}
            </p>
          </div>
        </motion.div>

        {/* لیست تمرین‌ها */}
        <section className="space-y-5">
          {exercises.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-12 text-center border border-white/50 shadow-xl"
            >
              <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                <LayoutGrid className="w-10 h-10" />
              </div>
              <p className="text-slate-500 font-bold mb-6">هنوز تمرینی برای شما آماده نشده است.</p>
              <Link href="/assessment" className="inline-flex bg-gradient-to-tr from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-blue-200">
                شروع پایش وضعیت
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {exercises.map((exercise, index) => {
                const isExpanded = expandedId === exercise.id;
                const icon = getExerciseIcon(exercise.exercise_info.title);

                return (
                  <motion.div
                    key={exercise.exercise_info.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white/80 shadow-xl hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 overflow-hidden"
                  >
                    <div className="p-6 sm:p-8">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                          <div className={`p-4 rounded-[1.5rem] shadow-inner transition-colors duration-500 ${exercise.exercise_info.is_completed ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'
                            }`}>
                            {icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 flex-wrap mb-1">
                              <h3 className="font-black text-slate-900 text-lg leading-tight">
                                {exercise.exercise_info.title}
                              </h3>
                              {exercise.exercise_info.is_completed && (
                                <span className="bg-emerald-100/50 text-emerald-600 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  انجام شده
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {exercise.exercise_info.duration} دقیقه</span>
                              <span className="w-1 h-1 bg-slate-200 rounded-full" />
                              <span>سطح: {traumaTypeLabel}</span>
                            </div>
                          </div>
                        </div>

                        <Link
                          href={`/exercises/${exercise.exercise_info.id}`}
                          className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl text-xs font-black shadow-lg transition-all flex items-center justify-center gap-2 ${exercise.is_completed
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                              : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-100 hover:shadow-blue-200 active:scale-95'
                            }`}
                        >
                          {exercise.exercise_info.is_completed ? 'بازبینی تمرین' : 'شروع یادگیری'}
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>

                      <button
                        onClick={() => toggleDescription(exercise.id)}
                        className="mt-6 text-[11px] font-black tracking-widest text-slate-400 hover:text-blue-500 transition-colors flex items-center gap-2 uppercase"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        <span>{isExpanded ? 'بستن جزئیات' : 'مشاهده راهنما و نکته‌ها'}</span>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-6 p-6 bg-blue-50/50 border border-blue-100/50 rounded-[2rem] space-y-4">
                              <h4 className="font-black text-blue-900 text-sm flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-blue-500" />
                                راهنمای گام‌به‌گام
                              </h4>
                              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                                {exercise.description}
                              </p>
                              {exercise.exercise_info.description && (
                                <div className="pt-4 border-t border-blue-100/50">
                                  <p className="text-blue-700/70 text-[11px] leading-relaxed font-bold italic">
                                    💡 {exercise.exercise_info.description}
                                  </p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* نقل قول انگیزشی سفارشی */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 backdrop-blur-md border border-amber-100/50 rounded-[2.5rem] p-8 text-center space-y-4 shadow-inner"
        >
          <div className="w-12 h-12 bg-amber-100 text-amber-500 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <p className="text-amber-900/80 font-bold italic leading-relaxed max-w-sm mx-auto">
            "🌈 هیچ قدمی برای بهبودی کوچک نیست. هر تمرینی که انجام می‌دهی، یک لایه جدید از آرامش در وجودت ساخته می‌شود."
          </p>
          <div className="h-0.5 w-12 bg-amber-200/50 mx-auto rounded-full" />
        </motion.div>
      </motion.main>
    </div>
  );
}