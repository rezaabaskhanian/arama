'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, Heart, Sparkles, Check, Save, X, Edit3 } from 'lucide-react';
import { getJournalEntryById, updateJournalEntry } from '@/lib/api';
import DecorativeBlobs from '@/components/layout/DecorativeBlobs';

export default function EditJournalPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  
  const [content, setContent] = useState('');
  const [mood, setMood] = useState(3);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const moodOptions = [
    { value: 1, icon: <Heart className="w-8 h-8" />, label: 'خیلی بد', color: 'text-red-500', bg: 'bg-red-50', ring: 'ring-red-200' },
    { value: 2, icon: <Heart className="w-8 h-8" />, label: 'بد', color: 'text-orange-500', bg: 'bg-orange-50', ring: 'ring-orange-200' },
    { value: 3, icon: <Heart className="w-8 h-8" />, label: 'معمولی', color: 'text-yellow-500', bg: 'bg-yellow-50', ring: 'ring-yellow-200' },
    { value: 4, icon: <Heart className="w-8 h-8" />, label: 'خوب', color: 'text-emerald-500', bg: 'bg-emerald-50', ring: 'ring-emerald-200' },
    { value: 5, icon: <Heart className="w-8 h-8" />, label: 'عالی', color: 'text-teal-500', bg: 'bg-teal-50', ring: 'ring-teal-200' }
  ];

  useEffect(() => {
    if (id) {
      fetchEntry();
    }
  }, [id]);

  const fetchEntry = async () => {
    try {
      setLoading(true);
      const data = await getJournalEntryById(id);
      setContent(data.content);
      setMood(data.mood);
    } catch (err) {
      console.error('Error fetching entry:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('لطفاً متن یادداشت را وارد کن');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updateJournalEntry(id, content, mood);
      router.push('/journal');
    } catch (err) {
      console.error('Error updating entry:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center" dir="rtl">
        <DecorativeBlobs />
        <div className="relative z-10 flex flex-col items-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full mb-6" />
          <p className="text-slate-500 font-medium animate-pulse">در حال بارگذاری یادداشت...</p>
        </div>
      </div>
    );
  }

  if (error && !content) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4" dir="rtl">
        <DecorativeBlobs />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 bg-white/80 backdrop-blur-xl border border-red-100 rounded-3xl p-8 text-center max-w-md shadow-2xl shadow-red-900/5">
          <p className="text-red-600 font-bold mb-6">{error}</p>
          <Link href="/journal" className="w-full inline-block bg-slate-900 hover:bg-slate-800 text-white px-6 py-4 rounded-2xl font-medium transition-all shadow-lg shadow-slate-900/20">
            بازگشت به دفترچه
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 py-12 px-4 selection:bg-teal-100" dir="rtl">
      <DecorativeBlobs />
      
      <div className="max-w-3xl mx-auto relative z-10 space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <div className="bg-gradient-to-tr from-teal-500 to-emerald-500 p-2.5 rounded-2xl text-white shadow-lg shadow-teal-200">
                <Edit3 className="w-6 h-6" />
              </div>
              ویرایش یادداشت
            </h1>
            <p className="text-slate-500 font-medium mt-2">احساساتت را مرور و ویرایش کن</p>
          </div>
          <Link href="/journal">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 bg-white/60 backdrop-blur-md border border-slate-200 px-4 py-2.5 rounded-2xl text-slate-600 font-bold hover:bg-white hover:shadow-md transition-all">
              بازگشت
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Form */}
        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} onSubmit={handleSubmit} className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-2xl shadow-slate-200 rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden">
          {/* Mood Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-widest mb-4">
              <Heart className="w-4 h-4 text-rose-500" />
              امروز چه حسی داری؟
            </label>
            <div className="flex justify-between gap-3">
              {moodOptions.map((option) => (
                <motion.button
                  key={option.value}
                  type="button"
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMood(option.value)}
                  className={`flex-1 flex flex-col items-center gap-3 py-4 rounded-3xl transition-all duration-300 ${mood === option.value ? `${option.bg} ${option.color} ring-4 ring-offset-4 ring-white ${option.ring} shadow-xl shadow-slate-200` : 'bg-slate-50/50 text-slate-400 hover:bg-white hover:text-slate-600 hover:shadow-lg'}`}
                >
                  <span className={`${mood === option.value ? 'scale-110 drop-shadow-sm' : ''} transition-transform`}>
                    {option.icon}
                  </span>
                  <span className={`text-[10px] font-bold tracking-tight ${mood === option.value ? 'opacity-100' : 'opacity-60'}`}>
                    {option.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div>
            <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-widest mb-4">
              <Sparkles className="w-4 h-4 text-teal-500" />
              یادداشت تو
            </label>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-3xl blur opacity-10 group-focus-within:opacity-30 transition duration-500"></div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="امروز چه اتفاقی افتاد؟ چه احساسی داشتی؟"
                className="relative w-full h-72 p-6 bg-white border border-slate-100 rounded-3xl outline-none focus:ring-0 text-slate-700 leading-relaxed resize-none shadow-inner"
              />
            </div>
            <p className="text-[11px] font-bold text-slate-400 mt-3 text-left">
              {content.length} کاراکتر
            </p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-50 border-2 border-red-100 text-red-600 px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-3">
              <X className="w-5 h-5" />
              {error}
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-slate-100/50">
            <Link href="/journal" className="flex-1">
              <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-black shadow-sm hover:bg-slate-200 transition-colors">
                انصراف
              </motion.button>
            </Link>
            <motion.button 
              type="submit" 
              disabled={saving}
              whileHover={{ scale: 1.02, shadow: "0 20px 25px -5px rgba(20, 184, 166, 0.4)" }} 
              whileTap={{ scale: 0.98 }} 
              className="flex-[2] bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-4 rounded-2xl font-black shadow-xl shadow-teal-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  ذخیره تغییرات
                </>
              )}
            </motion.button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}