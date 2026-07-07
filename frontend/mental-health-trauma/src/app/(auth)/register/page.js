'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Phone,
  Lock,
  UserPlus,
  ArrowLeft,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { registerUser } from '@/lib/api';
import DecorativeBlobs from '@/components/layout/DecorativeBlobs';

const ButterflyIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 10c0-2.5-2-4.5-4.5-4.5S3 7.5 3 10c0 3 4.5 9 9 9s9-6 9-9-2-4.5-4.5-4.5S12 7.5 12 10z" opacity="0.3" />
    <path d="M12 21c-4.5 0-9-6-9-9 0-2.5 2-4.5 4.5-4.5S12 10 12 10s2-2.5 4.5-2.5 4.5 2 4.5 4.5c0 3-4.5 9-9 9z" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 10v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [formData, setFormData] = useState({
    nickname: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nickname.trim()) {
      setError('نام کاربری را وارد کنید');
      return;
    }

    if (!formData.phone.trim()) {
      setError('شماره موبایل را وارد کنید');
      return;
    }

    if (formData.phone.length < 11) {
      setError('شماره موبایل نامعتبر است');
      return;
    }

    if (!formData.password) {
      setError('رمز عبور را وارد کنید');
      return;
    }

    if (formData.password.length < 6) {
      setError('رمز عبور باید حداقل ۶ کاراکتر باشد');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('رمز عبور و تکرار آن مطابقت ندارند');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await registerUser({
        nickname: formData.nickname,
        phone: formData.phone,
        password: formData.password,
      });

      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      if (response.user_id) {
        localStorage.setItem('userId', response.user_id);
      }
      if (formData.nickname) {
        localStorage.setItem('userName', formData.nickname);
      }

      router.push('/');

    } catch (err) {
      setError(err.message || 'خطایی در هنگام ثبت‌نام رخ داده است');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-center items-center p-4 selection:bg-blue-100 overflow-hidden" dir="rtl">
      <DecorativeBlobs />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isLoaded ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10 my-8"
      >
        {/* Logo and Greeting */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2
            }}
            whileHover={{ rotate: 360, scale: 1.1 }}
            className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-2xl shadow-indigo-200"
          >
            <ButterflyIcon className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-black text-slate-900 mb-1"
          >
            شروع بهبودی ✨
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-500 text-sm font-medium"
          >
            یک حساب جدید بسازید و سفر خود را آغاز کنید
          </motion.p>
        </div>

        {/* Register Card - Slightly larger for more fields */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-white/70 backdrop-blur-2xl p-7 rounded-[2.5rem] border border-white/50 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-100/30 blur-3xl -ml-16 -mt-16 rounded-full" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-teal-100/30 blur-3xl -mr-16 -mb-16 rounded-full" />

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            {/* Nickname Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700 mr-1 flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-blue-500" />
                نام و نام خانوادگی
              </label>
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 focus:bg-white transition-all duration-300 text-slate-800 placeholder:text-slate-400 font-medium"
                placeholder="مثلاً: علی محمدی"
                disabled={loading}
              />
            </div>

            {/* Phone Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700 mr-1 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-500" />
                شماره موبایل
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 focus:bg-white transition-all duration-300 text-slate-800 placeholder:text-slate-400 font-medium"
                placeholder="۰۹۱۲۱۲۳۴۵۶۷"
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700 mr-1 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-blue-500" />
                رمز عبور
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 focus:bg-white transition-all duration-300 text-slate-800 placeholder:text-slate-400 font-medium"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700 mr-1 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                تکرار رمز عبور
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 focus:bg-white transition-all duration-300 text-slate-800 placeholder:text-slate-400 font-medium"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="p-3.5 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-2.5 text-red-600 text-xs font-bold"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative w-full bg-gradient-to-r from-teal-500 via-emerald-600 to-emerald-800 text-white px-6 py-4 rounded-2xl font-black shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)] hover:shadow-[0_15px_35px_-12px_rgba(16,185,129,0.6)] transition-all duration-300 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>در حال ثبت نام...</span>
                  </>
                ) : (
                  <>
                    <span>ایجاد حساب کاربری</span>
                    <UserPlus className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </div>

              {/* Shine effect */}
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full"
              />
            </motion.button>
          </form>

          <div className="mt-6 text-center border-t border-slate-100 pt-5">
            <p className="text-slate-600 text-sm font-medium">
              قبلاً ثبت‌نام کرده‌اید؟{' '}
              <Link
                href="/login"
                className="text-blue-600 font-black hover:underline"
              >
                وارد شوید
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors text-xs font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            بازگشت به صفحه اصلی
          </Link>
        </motion.div>
      </motion.div>

      {/* Footer Branding */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-4 pb-8 flex flex-col items-center gap-4 opacity-30"
      >
        <div className="flex items-center gap-3 grayscale group hover:grayscale-0 transition-all duration-700">
          <div className="w-8 h-8 bg-slate-200 rounded-xl flex items-center justify-center p-1.5 group-hover:bg-indigo-100 transition-colors">
            <ButterflyIcon className="w-full h-full text-slate-400 group-hover:text-indigo-500 transition-colors" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[.25em] text-slate-500">Mindful Recovery</span>
        </div>
      </motion.footer>
    </div>
  );
}