'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { getJournalEntries, deleteJournalEntry } from '@/lib/api';
import DecorativeBlobs from '@/components/layout/DecorativeBlobs';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  Clock,
  Heart,
  AlertCircle,
  Loader2,
  Calendar,
  MessageSquareQuote
} from 'lucide-react';

export default function JournalPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const data = await getJournalEntries();
      setEntries(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('آیا مطمئنی می‌خواهی این یادداشت را حذف کنی؟')) return;

    setDeleteLoading(id);
    try {
      await deleteJournalEntry(id);
      setEntries(entries.filter(entry => entry.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  const getMoodEmoji = (mood) => {
    const moods = {
      1: { emoji: '😞', label: 'خیلی بد', color: 'bg-red-50 text-red-500', ring: 'ring-red-100' },
      2: { emoji: '😕', label: 'بد', color: 'bg-orange-50 text-orange-500', ring: 'ring-orange-100' },
      3: { emoji: '😐', label: 'معمولی', color: 'bg-yellow-50 text-yellow-500', ring: 'ring-yellow-100' },
      4: { emoji: '🙂', label: 'خوب', color: 'bg-green-50 text-green-500', ring: 'ring-green-100' },
      5: { emoji: '😄', label: 'عالی', color: 'bg-teal-50 text-teal-500', ring: 'ring-teal-100' }
    };
    return moods[mood] || { emoji: '😐', label: 'معمولی', color: 'bg-slate-50 text-slate-500', ring: 'ring-slate-100' };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center relative overflow-hidden" dir="rtl">
        <DecorativeBlobs />
        <div className="relative z-10 text-center space-y-4">
          <div className="w-16 h-16 bg-white/50 backdrop-blur-xl rounded-[2rem] flex items-center justify-center shadow-xl border border-white/50 mx-auto animate-pulse">
            <BookOpen className="w-8 h-8 text-teal-500 animate-spin" />
          </div>
          <p className="text-slate-500 font-bold">در حال بارگذاری یادداشت‌ها...</p>
        </div>
      </div>
    );
  }

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
            className="inline-flex p-4 bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white/50 text-teal-500 mb-2"
          >
            <BookOpen className="w-10 h-10" />
          </motion.div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">دفترچه احساسات</h1>
          <p className="text-sm font-bold text-slate-400">احساساتت را بنویس، رهایش کن ✨</p>
        </div>

        {/* دکمه نوشتن یادداشت جدید - بروزرسانی شده به استایل داشبورد */}
        <Link href="/journal/new">
          <motion.button
            whileHover={{ y: -5, shadow: "0 25px 50px -12px rgba(20,184,166,0.2)" }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-tr from-teal-500 to-cyan-600 text-white p-6 rounded-[2.5rem] font-black shadow-xl shadow-teal-100 flex items-center justify-center gap-3 transition-all duration-300"
          >
            <div className="bg-white/20 p-2 rounded-xl">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-lg">نوشتن یادداشت جدید</span>
          </motion.button>
        </Link>

        {/* خطا */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50/50 backdrop-blur-md border border-red-100 rounded-[2rem] p-6 text-center space-y-3"
          >
            <div className="flex justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-700 font-bold text-sm">{error}</p>
            <button
              onClick={fetchEntries}
              className="text-red-500 text-xs font-black uppercase tracking-widest underline underline-offset-4"
            >
              تلاش مجدد
            </button>
          </motion.div>
        )}

        {/* لیست یادداشت‌ها */}
        {entries.length === 0 && !error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/60 backdrop-blur-xl rounded-[3rem] p-16 text-center border border-white/50 shadow-xl"
          >
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
              <MessageSquareQuote className="w-10 h-10" />
            </div>
            <p className="text-slate-500 font-bold mb-2">هنوز یادداشتی ننوشتی.</p>
            <p className="text-slate-400 text-xs font-medium">اولین کلماتت را برای آرامش ثبت کن.</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry, index) => {
              const moodInfo = getMoodEmoji(entry.mood);
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white/80 shadow-xl hover:shadow-2xl hover:shadow-teal-900/5 transition-all duration-500 overflow-hidden"
                >
                  {/* هدر یادداشت */}
                  <div className="p-6 pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl text-[10px] font-black border border-white/50 shadow-sm ${moodInfo.color}`}>
                          <span>{moodInfo.emoji}</span>
                          <span>{moodInfo.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-widest bg-slate-50/50 px-3 py-1.5 rounded-2xl">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(entry.created_at)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/journal/edit/${entry.id}`}
                          className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-900/5 transition-all"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          disabled={deleteLoading === entry.id}
                          className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-100 hover:shadow-lg hover:shadow-red-900/5 transition-all disabled:opacity-50"
                        >
                          {deleteLoading === entry.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="px-8 pb-8 pt-4">
                    <p className="text-slate-700 leading-relaxed font-medium text-lg whitespace-pre-wrap break-words">
                      {entry.content}
                    </p>
                  </div>

                  <div className="px-8 py-4 bg-slate-50/30 border-t border-slate-100/50 flex justify-between items-center">
                    <div className="flex gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5">
                        <PenTool className="w-3.5 h-3.5" />
                        {entry.content.length} کاراکتر
                      </span>
                      {entry.updated_at !== entry.created_at && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          ویرایش شده
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* نقل قول انگیزشی */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-teal-50/50 to-emerald-50/50 backdrop-blur-md border border-teal-100/50 rounded-[2.5rem] p-8 text-center space-y-4 shadow-inner"
        >
          <div className="w-12 h-12 bg-teal-100 text-teal-500 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <p className="text-teal-900/80 font-bold italic leading-relaxed max-w-sm mx-auto">
            "🌸 نوشتن، راهی است برای آشتی با خودت. هر کلمه ای که روی کاغذ می‌آوری، سبک‌تر می‌شوی."
          </p>
          <div className="h-0.5 w-12 bg-teal-200/50 mx-auto rounded-full" />
        </motion.div>
      </motion.main>
    </div>
  );
}