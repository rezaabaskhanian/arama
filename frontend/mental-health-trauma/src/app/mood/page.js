'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { ArrowRight, Heart, Activity, Check, Smile } from 'lucide-react';
import DecorativeBlobs from '@/components/layout/DecorativeBlobs';

export default function MoodPage() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [saved, setSaved] = useState(false);

  const moodOptions = [
    { value: 1, icon: <Heart className="w-10 h-10" />, label: 'خیلی بد', color: 'text-red-500', bg: 'bg-red-50', ring: 'ring-red-200' },
    { value: 2, icon: <Heart className="w-10 h-10" />, label: 'بد', color: 'text-orange-500', bg: 'bg-orange-50', ring: 'ring-orange-200' },
    { value: 3, icon: <Heart className="w-10 h-10" />, label: 'معمولی', color: 'text-yellow-500', bg: 'bg-yellow-50', ring: 'ring-yellow-200' },
    { value: 4, icon: <Heart className="w-10 h-10" />, label: 'خوب', color: 'text-emerald-500', bg: 'bg-emerald-50', ring: 'ring-emerald-200' },
    { value: 5, icon: <Heart className="w-10 h-10" />, label: 'عالی', color: 'text-teal-500', bg: 'bg-teal-50', ring: 'ring-teal-200' }
  ];

  const handleSave = () => {
    if (!selectedMood) return;
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 py-12 px-4 selection:bg-teal-100" dir="rtl">
      <DecorativeBlobs />
      
      <div className="max-w-2xl mx-auto relative z-10 space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-200">
                <Smile className="w-6 h-6" />
              </div>
              پایش احساسات
            </h1>
            <p className="text-slate-500 font-medium mt-2">توجه به احساسات، اولین قدم بهبودی است</p>
          </div>
          <Link href="/">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 bg-white/60 backdrop-blur-md border border-slate-200 px-4 py-2.5 rounded-2xl text-slate-600 font-bold hover:bg-white hover:shadow-md transition-all">
              بازگشت
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-2xl shadow-slate-200 rounded-[3rem] p-8 sm:p-12 text-center relative overflow-hidden">
          
          <h2 className="text-2xl font-black text-slate-800 mb-8">همین الان چه حسی داری؟</h2>

          <div className="flex flex-wrap sm:flex-nowrap justify-center gap-4 mb-12">
            {moodOptions.map((option) => (
              <motion.button
                key={option.value}
                type="button"
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedMood(option.value)}
                className={`w-24 flex flex-col items-center gap-4 py-6 rounded-[2rem] transition-all duration-300 ${selectedMood === option.value ? `${option.bg} ${option.color} ring-4 ring-offset-4 ring-white ${option.ring} shadow-xl shadow-slate-200 scale-110` : 'bg-slate-50/50 text-slate-400 hover:bg-white hover:text-slate-600 hover:shadow-lg'}`}
              >
                <span className={`${selectedMood === option.value ? 'drop-shadow-md' : ''} transition-transform`}>
                  {option.icon}
                </span>
                <span className={`text-xs font-black tracking-tight ${selectedMood === option.value ? 'opacity-100' : 'opacity-60'}`}>
                  {option.label}
                </span>
              </motion.button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={!selectedMood || saved}
            className={`w-full max-w-sm mx-auto py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all ${
              saved 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                : !selectedMood
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 text-white shadow-xl shadow-slate-200 hover:bg-slate-800'
            }`}
          >
            {saved ? (
              <>
                <Check className="w-6 h-6" />
                ثبت شد!
              </>
            ) : (
              <>
                <Activity className="w-6 h-6" />
                ثبت احساس امروز
              </>
            )}
          </motion.button>

        </motion.div>
      </div>
    </div>
  );
}
