'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  HeartPulse,
  Info,
  ShieldCheck,
  Sparkles,
  Phone,
  Home,
  Wind
} from 'lucide-react';
import DecorativeBlobs from '@/components/layout/DecorativeBlobs';
import { getAssessmentResult } from "@/lib/api";

export default function AssessmentResultPage() {
  const { id: assessmentId } = useParams();



  const router = useRouter();
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!assessmentId) return;

    const fetchResult = async () => {
      try {
        setLoading(true);
    
        const response = await getAssessmentResult(assessmentId);

       

        if (!response) throw new Error('نتیجه‌ای یافت نشد');



        setResult(response);
      } catch (err) {
        console.error('Error fetching result:', err);
        setError(err.message || 'خطا در دریافت نتیجه');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [assessmentId]);

  const getTraumaTypeDetails = (type) => {
    switch (type) {
      case 'mild': 
        return {
          fa: 'ترومای خفیف',
          color: 'from-emerald-400 to-teal-500',
          text: 'text-emerald-700',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          icon: <ShieldCheck className="w-8 h-8 text-emerald-100" />
        };
      case 'moderate': 
        return {
          fa: 'ترومای متوسط',
          color: 'from-amber-400 to-orange-500',
          text: 'text-amber-700',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          icon: <Activity className="w-8 h-8 text-amber-100" />
        };
      case 'severe': 
        return {
          fa: 'ترومای شدید',
          color: 'from-orange-500 to-red-500',
          text: 'text-orange-700',
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          icon: <HeartPulse className="w-8 h-8 text-orange-100" />
        };
      case 'complex': 
        return {
          fa: 'ترومای پیچیده',
          color: 'from-red-500 to-rose-700',
          text: 'text-red-700',
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: <BrainCircuit className="w-8 h-8 text-red-100" />
        };
      default: 
        return {
          fa: 'نامشخص',
          color: 'from-slate-400 to-slate-500',
          text: 'text-slate-700',
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          icon: <Info className="w-8 h-8 text-slate-100" />
        };
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4" dir="rtl">
        <DecorativeBlobs />
        <div className="relative z-10 flex flex-col items-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full mb-6"
          />
          <p className="text-slate-500 font-medium animate-pulse">در حال تحلیل پاسخ‌های شما...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4" dir="rtl">
        <DecorativeBlobs />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 bg-white/80 backdrop-blur-xl border border-red-100 rounded-3xl p-8 text-center max-w-md shadow-2xl shadow-red-900/5"
        >
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">خطا در دریافت نتیجه</h2>
          <p className="text-slate-500 mb-8">{error}</p>
          <button
            onClick={() => router.push('/assessment')}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white px-6 py-4 rounded-2xl font-medium transition-all shadow-lg shadow-slate-900/20"
          >
            شروع تست جدید
          </button>
        </motion.div>
      </div>
    );
  }


 
  if (!result) return null;

  const traumaDetails = getTraumaTypeDetails(result.trauma_type);

  return (
  
  <div className="min-h-screen bg-[#F8FAFC] text-slate-800 py-12 px-4 selection:bg-blue-100" dir="rtl">
    
    
      {/*
       TODO 
      
      <DecorativeBlobs /> 
      
      */}
      
      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center space-y-2 mb-8">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">گزارش وضعیت تو</h1>
            <p className="text-slate-500 font-medium">تحلیل پاسخ‌های شما با دقت انجام شد</p>
          </motion.div>

          {/* Score Card */}
          <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-md rounded-[2.5rem] border border-white p-8 shadow-xl shadow-slate-200/50 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-60" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -ml-16 -mb-16 opacity-60" />
            
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">امتیاز کلی</p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-7xl font-black text-slate-800 tracking-tighter">
                {result?.total_score}
              </span>
              <span className="text-xl font-bold text-slate-400">/ ۸۰</span>
            </div>
            
            <div className="mt-8 relative h-3 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(result.total_score / 80) * 100}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={`absolute top-0 right-0 h-full bg-gradient-to-l ${traumaDetails?.color} rounded-full`}
              />
            </div>
          </motion.div>

          {/* Trauma Type Card */}
          <motion.div variants={itemVariants} className={`relative overflow-hidden rounded-[2.5rem] p-8 text-white shadow-2xl shadow-${traumaDetails.color.split(' ')[1].replace('to-', '')}/30 bg-gradient-to-br ${traumaDetails.color}`}>
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="relative z-10 flex items-center gap-6">
              <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                {traumaDetails.icon}
              </div>
              <div>
                <p className="text-white/80 text-sm font-bold mb-1 uppercase tracking-wider">تشخیص سیستم</p>
                <h2 className="text-3xl font-black">{traumaDetails?.fa}</h2>
              </div>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white p-8 shadow-xl shadow-slate-200/50">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-indigo-500 rounded-full" />
              تفسیر نتیجه
            </h3>
            <p className="text-slate-600 leading-relaxed font-medium">
              {result.total_score <= 20 && 'علائم خفیف است. به نظر می‌رسد در وضعیت پایداری هستید. تمرین‌های آرام‌سازی و تنفس منظم می‌تواند به حفظ این آرامش کمک کند.'}
              {result.total_score > 20 && result.total_score <= 32 && 'علائم متوسطی را تجربه می‌کنید. احساسات ناخوشایند گاهی سراغتان می‌آیند. نیاز به تمرین‌های تثبیت ذهن و ایجاد احساس ایمنی در بدن دارید.'}
              {result.total_score > 32 && result.total_score <= 50 && 'شما علائم شدیدی را تجربه می‌کنید که احتمالاً روی زندگی روزمره‌تان تاثیر گذاشته است. انجام تمرین‌های تخصصی تروما همراه با دریافت حمایت عاطفی بسیار توصیه می‌شود.'}
              {result.total_score > 50 && 'شما درگیر ترومای پیچیده و علائم بسیار شدیدی هستید که تحمل آن‌ها به تنهایی دشوار است. پیشنهاد می‌شود حتماً با یک روان‌درمانگر متخصص تروما صحبت کنید.'}
            </p>
          </motion.div>

          {/* High Score Warning */}
          {result.total_score > 50 && (
            <motion.div variants={itemVariants} className="bg-red-50 border-2 border-red-100 rounded-[2rem] p-6 shadow-lg shadow-red-100 flex items-start gap-4">
              <div className="bg-red-100 p-3 rounded-xl">
                <Phone className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h4 className="text-red-900 font-bold mb-1">نیاز به حمایت حرفه‌ای</h4>
                <p className="text-red-700 text-sm leading-relaxed mb-3">
                  با توجه به سطح علائم، صحبت با یک متخصص می‌تواند بسیار کمک‌کننده باشد. شما تنها نیستید.
                </p>
                <a href="tel:1480" className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-red-700 transition-colors">
                  تماس با صدای مشاور (۱۴۸۰)
                </a>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <Link href="/exercises" className="block">
              <motion.div 
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between group shadow-xl shadow-slate-900/20"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 p-2 rounded-xl">
                    <Wind className="w-5 h-5" />
                  </div>
                  <span className="font-bold">تمرین‌های پیشنهادی</span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:-translate-x-1 transition-all" />
              </motion.div>
            </Link>
            
            <Link href="/" className="block">
              <motion.div 
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white text-slate-700 border border-slate-200 rounded-2xl p-4 flex items-center justify-between group shadow-lg shadow-slate-100 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-slate-50 p-2 rounded-xl text-slate-400">
                    <Home className="w-5 h-5" />
                  </div>
                  <span className="font-bold">بازگشت به خانه</span>
                </div>
              </motion.div>
            </Link>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}