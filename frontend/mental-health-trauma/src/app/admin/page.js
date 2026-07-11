'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Dumbbell,
  ClipboardList,
  ArrowRight,
  UserPlus,
  Activity,
  History,
  TrendingUp,
  Target,
  Loader2
} from 'lucide-react';
import { adminGetStats } from '@/lib/api';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_users: 0,
    total_exercises: 0,
    total_assessments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await adminGetStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'کل کاربران',
      value: stats.total_users,
      icon: <Users className="w-6 h-6" />,
      color: 'from-violet-500 to-violet-600',
      shadow: 'shadow-violet-200',
      trend: '+۱۲٪ این ماه',
      href: '/admin/users'
    },
    {
      title: 'کل تمرین‌ها',
      value: stats.total_exercises,
      icon: <Dumbbell className="w-6 h-6" />,
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-200',
      trend: '+۵ مورد جدید',
      href: '/admin/exercises'
    },
    {
      title: 'کل تست‌ها',
      value: stats.total_assessments,
      icon: <ClipboardList className="w-6 h-6" />,
      color: 'from-purple-500 to-violet-600',
      shadow: 'shadow-purple-200',
      trend: '۸۵٪ تکمیل شده',
      href: '/admin/exercises'
    },
    {
      title: 'تمرین‌های واقعی',
      value: stats.total_commitments ?? 0,
      icon: <Target className="w-6 h-6" />,
      color: 'from-teal-500 to-cyan-600',
      shadow: 'shadow-teal-200',
      trend: 'تعهدهای زندگی',
      href: '/admin/commitments'
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
        <p className="text-slate-400 font-bold">در حال دریافت اطلاعات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">خوش آمدید، مدیر 👋</h1>
          <p className="text-slate-500 font-bold mt-2">خلاصه وضعیت سیستم و فعالیت‌های اخیر را در اینجا مشاهده کنید.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-black text-slate-600">سیستم آنلاین است</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {statCards.map((card, idx) => (
          <Link key={idx} href={card.href} className="block group">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -8 }}
              className="relative overflow-hidden bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/80 shadow-2xl shadow-slate-200/50 transition-all"
            >
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm font-black text-slate-500 mb-1">{card.title}</p>
                  <p className="text-4xl font-black text-slate-900">{card.value}</p>
                </div>
                <div className={`p-4 rounded-3xl bg-gradient-to-tr ${card.color} text-white shadow-lg ${card.shadow} group-hover:rotate-12 transition-transform duration-500`}>
                  {card.icon}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 w-fit px-2.5 py-1 rounded-lg">
                <TrendingUp className="w-3 h-3" />
                {card.trend}
              </div>

              {/* Decorative background shape */}
              <div className={`absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-tr ${card.color} opacity-[0.03] rounded-full blur-2xl`} />
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Quick Actions & Recent Activity Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <section className="bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/80 shadow-2xl shadow-slate-200/50">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-violet-500 rounded-full" />
              دسترسی سریع
            </h2>
            <Activity className="w-5 h-5 text-violet-400" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/admin/users" className="group">
              <div className="p-5 bg-white/80 backdrop-blur-md border border-white/50 rounded-[2.5rem] hover:border-violet-200 hover:shadow-xl hover:shadow-violet-500/10 transition-all">
                <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600 mb-4 group-hover:scale-110 transition-transform">
                  <UserPlus className="w-6 h-6" />
                </div>
                <p className="font-black text-slate-900 tracking-tight">مدیریت کاربران</p>
                <div className="flex items-center gap-2 mt-2 text-xs font-bold text-slate-400">
                  <span>ورود به لیست کاربران</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </Link>

            <Link href="/admin/exercises" className="group">
              <div className="p-5 bg-white/80 backdrop-blur-md border border-white/50 rounded-[2.5rem] hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/10 transition-all">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                  <Dumbbell className="w-6 h-6" />
                </div>
                <p className="font-black text-slate-900 tracking-tight">مدیریت تمرینات</p>
                <div className="flex items-center gap-2 mt-2 text-xs font-bold text-slate-400">
                  <span>ویرایش محتوای سایت</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Recent Activity Placeholder */}
        <section className="bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/80 shadow-2xl shadow-slate-200/50">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-pink-500 rounded-full" />
              فعالیت‌های اخیر
            </h2>
            <History className="w-5 h-5 text-pink-400" />
          </div>

          <div className="space-y-6">
            {[1, 2, 3].map((item, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-slate-200 transition-colors">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-black text-slate-900 truncate">تست جدید توسط کاربر ثبت شد</p>
                    <span className="text-[10px] font-bold text-slate-400 mr-2">۲ ساعت پیش</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-200 w-3/4 rounded-full" />
                  </div>
                </div>
              </div>
            ))}

            <button className="w-full py-4 text-xs font-black text-violet-500 hover:text-violet-600 transition-colors bg-violet-50/50 rounded-2xl hover:bg-violet-50">
              مشاهده تمام فعالیت‌ها
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}