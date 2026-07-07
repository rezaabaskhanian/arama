'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { ArrowRight, Wind, Play, Square, Pause } from 'lucide-react';
import DecorativeBlobs from '@/components/layout/DecorativeBlobs';

export default function BreathingPage() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('idle'); // idle, inhale, hold, exhale, hold2
  const [timer, setTimer] = useState(4);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            // Transition phase
            setPhase((p) => {
              if (p === 'inhale') return 'hold';
              if (p === 'hold') return 'exhale';
              if (p === 'exhale') return 'hold2';
              if (p === 'hold2') {
                setCycles((c) => c + 1);
                return 'inhale';
              }
              return 'inhale';
            });
            return 4; // 4 seconds per phase
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setPhase('idle');
      setTimer(4);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const toggleExercise = () => {
    if (!isActive) {
      setPhase('inhale');
      setTimer(4);
    }
    setIsActive(!isActive);
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return 'نفس عمیق بکش (دم)';
      case 'hold': return 'نگه دار';
      case 'exhale': return 'آرام بیرون بده (بازدم)';
      case 'hold2': return 'صبر کن';
      default: return 'آماده‌ای؟';
    }
  };

  const getCircleAnimation = () => {
    switch (phase) {
      case 'inhale': return { scale: 1.5, opacity: 1, transition: { duration: 4, ease: "linear" } };
      case 'hold': return { scale: 1.5, opacity: 0.8, transition: { duration: 4, ease: "linear" } };
      case 'exhale': return { scale: 1, opacity: 1, transition: { duration: 4, ease: "linear" } };
      case 'hold2': return { scale: 1, opacity: 0.8, transition: { duration: 4, ease: "linear" } };
      default: return { scale: 1, opacity: 0.5 };
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 py-12 px-4 selection:bg-teal-100" dir="rtl">
      <DecorativeBlobs />
      
      <div className="max-w-2xl mx-auto relative z-10 space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <div className="bg-gradient-to-tr from-cyan-500 to-teal-500 p-2.5 rounded-2xl text-white shadow-lg shadow-teal-200">
                <Wind className="w-6 h-6" />
              </div>
              تنفس مربعی (۴-۴-۴-۴)
            </h1>
            <p className="text-slate-500 font-medium mt-2">برای کاهش سریع ضربان قلب و استرس</p>
          </div>
          <Link href="/">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 bg-white/60 backdrop-blur-md border border-slate-200 px-4 py-2.5 rounded-2xl text-slate-600 font-bold hover:bg-white hover:shadow-md transition-all">
              بازگشت
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Breathing Circle */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-2xl shadow-slate-200 rounded-[3rem] p-12 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[500px]">
          
          <div className="absolute top-8 right-8 bg-teal-50 text-teal-600 px-4 py-2 rounded-xl text-sm font-black border border-teal-100 shadow-sm">
            چرخه‌ها: {cycles}
          </div>

          <div className="relative w-64 h-64 flex items-center justify-center my-8">
            <motion.div
              animate={getCircleAnimation()}
              className="absolute w-48 h-48 bg-gradient-to-tr from-teal-400 to-cyan-400 rounded-full blur-xl opacity-50"
            />
            <motion.div
              animate={getCircleAnimation()}
              className="absolute w-48 h-48 bg-gradient-to-tr from-teal-500 to-cyan-500 rounded-full shadow-2xl flex items-center justify-center z-10"
            >
              {isActive ? (
                <span className="text-white text-5xl font-black tabular-nums">{timer}</span>
              ) : (
                <Wind className="w-16 h-16 text-white/80" />
              )}
            </motion.div>
          </div>

          <h2 className="text-2xl font-black text-slate-800 mb-2">{getPhaseText()}</h2>
          <p className="text-slate-500 font-medium mb-12 h-6">
            {isActive ? 'روی تنفس خود تمرکز کنید' : 'با زدن دکمه شروع، تمرین آغاز می‌شود'}
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleExercise}
            className={`px-10 py-4 rounded-2xl font-black shadow-xl flex items-center gap-3 transition-colors ${
              isActive 
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200' 
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-200'
            }`}
          >
            {isActive ? (
              <>
                <Square className="w-5 h-5 fill-current" />
                توقف تمرین
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                شروع تمرین
              </>
            )}
          </motion.button>

        </motion.div>
      </div>
    </div>
  );
}
