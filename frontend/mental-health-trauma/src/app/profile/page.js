'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { getUserProfile } from '@/lib/api';
import DecorativeBlobs from '@/components/layout/DecorativeBlobs';
import {
  User,
  Phone,
  ShieldCheck,
  Edit3,
  LogOut,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Settings
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    id: '',
    nickname: '',
    phone: '',
    role: '',
  });

  const [formData, setFormData] = useState({
    nickname: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }
      const response = await getUserProfile();
      setProfile(response.user);
      setFormData({
        nickname: response.user.nickname || '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'خطا در دریافت اطلاعات');
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSave = async () => {
    if (!formData.nickname.trim()) {
      setError('نام کاربری نمی‌تواند خالی باشد');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      setProfile({
        ...profile,
        nickname: formData.nickname,
      });
      localStorage.setItem('userName', formData.nickname);
      setIsEditing(false);
      setSuccess('اطلاعات با موفقیت به‌روزرسانی شد');
    } catch (err) {
      setError(err.response?.data?.message || 'خطا در به‌روزرسانی');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    router.push('/login');
  };

  const getRoleLabel = (role) => {
    const roles = {
      user: { label: 'کاربر عادی', color: 'text-blue-600 bg-blue-50' },
      admin: { label: 'مدیر', color: 'text-purple-600 bg-purple-50' },
      therapist: { label: 'درمانگر', color: 'text-emerald-600 bg-emerald-50' },
    };
    return roles[role] || { label: role || 'کاربر', color: 'text-slate-600 bg-slate-50' };
  };

  const roleInfo = getRoleLabel(profile.role);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center relative overflow-hidden" dir="rtl">
        <DecorativeBlobs />
        <div className="relative z-10 text-center space-y-4">
          <div className="w-16 h-16 bg-white/50 backdrop-blur-xl rounded-[2rem] flex items-center justify-center shadow-xl border border-white/50 mx-auto">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
          <p className="text-slate-500 font-bold">در حال بارگذاری پروفایل...</p>
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
        {/* هدر پروفایل - پریمیوم شده */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-[3rem] p-8 text-white shadow-2xl shadow-indigo-900/20"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8 text-center sm:text-right">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-white/20 p-6 rounded-[2.5rem] backdrop-blur-xl border border-white/20 shadow-xl"
            >
              <User className="w-12 h-12 text-white" />
            </motion.div>
            <div className="flex-1 space-y-2">
              <h1 className="text-4xl font-black tracking-tight">{profile.nickname}</h1>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-indigo-100 font-bold text-sm">
                <span className="flex items-center gap-2"><Phone className="w-4 h-4 opacity-70" /> {profile.phone}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-black shadow-sm ${roleInfo.color.replace(' text-', ' bg-').replace('text-', 'text-indigo-900')}`}>
                  {roleInfo.label}
                </span>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/20 transition-all"
            >
              <Settings className="w-6 h-6" />
            </motion.button>
          </div>
        </motion.div>

        {/* پیام‌های وضعیت */}
        <AnimatePresence>
          {(error || success) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              {error && (
                <div className="bg-red-50/50 backdrop-blur-md border border-red-100 rounded-[2rem] p-5 text-red-600 text-sm font-bold flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="bg-emerald-50/50 backdrop-blur-md border border-emerald-100 rounded-[2rem] p-5 text-emerald-600 text-sm font-bold flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* فرم اطلاعات - شیشه‌ای */}
        <section className="bg-white/70 backdrop-blur-xl rounded-[3rem] p-8 border border-white/80 shadow-xl shadow-indigo-900/5 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
              اطلاعات حساب کاربری
            </h2>
            {!isEditing ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="bg-indigo-50 text-indigo-600 px-5 py-2.5 rounded-2xl text-xs font-black hover:bg-indigo-100 transition-all flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                ویرایش پروفایل
              </motion.button>
            ) : (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({ nickname: profile.nickname });
                  setError('');
                }}
                className="text-slate-400 text-xs font-black uppercase tracking-widest hover:text-slate-600 transition-colors"
              >
                انصراف
              </button>
            )}
          </div>

          <div className="grid gap-8">
            {/* نام کاربری */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 flex items-center gap-2">
                <User className="w-3.5 h-3.5" />
                نام کاربری شما
              </label>
              {isEditing ? (
                <div className="relative">
                  <input
                    type="text"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleChange}
                    className="w-full bg-white/50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                    placeholder="نام کاربری جدید را وارد کنید"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Edit3 className="w-5 h-5 text-slate-300" />
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-4 font-black text-slate-800 text-lg">
                  {profile.nickname}
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
              {/* شماره موبایل */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" />
                  شماره موبایل
                </label>
                <div className="bg-slate-50/20 border border-slate-50 rounded-2xl px-6 py-4 font-bold text-slate-400 select-none">
                  {profile.phone}
                </div>
              </div>

              {/* نقش کاربر */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  سطح دسترسی
                </label>
                <div className={`border border-inherit rounded-2xl px-6 py-4 font-black text-sm flex items-center gap-3 ${roleInfo.color}`}>
                  <div className="w-2 h-2 rounded-full bg-current" />
                  {roleInfo.label}
                </div>
              </div>
            </div>

            {/* دکمه ذخیره در حالت ویرایش */}
            <AnimatePresence>
              {isEditing && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-gradient-to-tr from-indigo-600 to-blue-600 text-white py-5 rounded-[2rem] font-black shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 transition-all hover:shadow-indigo-200 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-6 h-6" />
                      <span>ذخیره تغییرات نهایی</span>
                    </>
                  )}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* دکمه خروج */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full bg-white/50 border border-red-100 text-red-500 py-6 rounded-[2.5rem] font-black text-lg hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-3 group"
        >
          <div className="bg-red-50 p-2 rounded-xl group-hover:bg-red-100 transition-colors">
            <LogOut className="w-6 h-6" />
          </div>
          خروج از حساب کاربری
        </motion.button>
      </motion.main>
    </div>
  );
}