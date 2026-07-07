'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone,
  Lock,
  LogIn,
  UserPlus,
  Fingerprint,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { loginUser } from '@/lib/api';
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

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
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

    if (!formData.phone.trim()) {
      setError('شماره موبایل را وارد کنید');
      return;
    }

    if (!formData.password) {
      setError('رمز عبور را وارد کنید');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await loginUser(formData.phone, formData.password);

      if (response.tokens) {
        localStorage.setItem('access_token', response.tokens.access_token);
        localStorage.setItem('refresh_token', response.tokens.refresh_token);
      }
      if (response.user) {
        localStorage.setItem('userId', response.user.id);
        localStorage.setItem('userName', response.user.nickname || '');
        localStorage.setItem('userRole', response.user.role || '');
      }

      router.push('/');

    } catch (err) {
      setError(err.message || 'خطایی در هنگام ورود رخ داده است');
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
        className="w-full max-w-md relative z-10"
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
            className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-indigo-200"
          >
            <ButterflyIcon className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-black text-slate-900 mb-2"
          >
            خوش آمدی ✨
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-500 font-medium"
          >
            وارد حساب کاربری خود شوید
          </motion.p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-white/70 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/50 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 blur-3xl -mr-16 -mt-16 rounded-full" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-100/30 blur-3xl -ml-16 -mb-16 rounded-full" />

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Phone Input */}
            <div className="space-y-2">
              <label className="block text-sm font-black text-slate-700 mr-1 flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-500" />
                شماره موبایل
              </label>
              <div className="relative group">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 focus:bg-white transition-all duration-300 text-slate-800 placeholder:text-slate-400 font-medium"
                  placeholder="۰۹۱۲۱۲۳۴۵۶۷"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="block text-sm font-black text-slate-700 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-500" />
                  رمز عبور
                </label>
                <Link
                  href="/reset-password"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  فراموشی رمز؟
                </Link>
              </div>
              <div className="relative group">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 focus:bg-white transition-all duration-300 text-slate-800 placeholder:text-slate-400 font-medium"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
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
              className="group relative w-full bg-gradient-to-r from-blue-600 via-indigo-700 to-indigo-900 text-white px-6 py-4 rounded-2xl font-black shadow-[0_10px_30px_-10px_rgba(59,130,246,0.5)] hover:shadow-[0_15px_35px_-12px_rgba(59,130,246,0.6)] transition-all duration-300 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>در حال ورود...</span>
                  </>
                ) : (
                  <>
                    <span>ورود به حساب</span>
                    <LogIn className="w-5 h-5 transition-transform group-hover:translate-x-1" />
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

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-slate-600 font-medium">
              هنوز حساب نداری؟{' '}
              <Link
                href="/register"
                className="text-blue-600 font-black hover:underline inline-flex items-center gap-1 group"
              >
                ثبت‌نام رایگان
                <UserPlus className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors text-sm font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            بازگشت به صفحه اصلی
          </Link>
        </motion.div>
      </motion.div>

      {/* Footer Branding */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-12 flex flex-col items-center gap-4 opacity-30"
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