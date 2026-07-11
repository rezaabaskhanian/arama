'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart3,
  Users,
  Dumbbell,
  Home,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Bell,
  Target,
  HeartHandshake
} from 'lucide-react';
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

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('userRole');

    if (!token || role !== 'admin') {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EEEBF6]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-bold">در حال بارگذاری پنل...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { title: 'داشبورد', href: '/admin', icon: <BarChart3 className="w-5 h-5" /> },
    { title: 'کاربران', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { title: 'تمرین‌ها', href: '/admin/exercises', icon: <Dumbbell className="w-5 h-5" /> },
    { title: 'تمرین‌های واقعی', href: '/admin/commitments', icon: <Target className="w-5 h-5" /> },
    { title: 'نظارت روانشناس', href: '/admin/supervision', icon: <HeartHandshake className="w-5 h-5" /> },
    { title: 'بازگشت به سایت', href: '/', icon: <Home className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#EEEBF6] text-slate-800 flex" dir="rtl">
      <DecorativeBlobs />

      {/* Sidebar - Desktop */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="hidden lg:flex flex-col bg-white/70 backdrop-blur-2xl border-l border-white shadow-2xl z-30 sticky top-0 h-screen overflow-hidden transition-all duration-300"
      >
        <div className="p-6 flex items-center gap-4">
          <div className="bg-gradient-to-tr from-violet-500 to-pink-500 p-2.5 rounded-2xl shadow-lg shadow-violet-100 shrink-0">
            <ButterflyIcon className="w-7 h-7 text-white" />
          </div>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="whitespace-nowrap"
              >
                <h1 className="text-lg font-black text-slate-900 leading-none">پنل مدیریت</h1>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Trauma Shield</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-4 mt-8 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActive
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-200'
                      : 'text-slate-500 hover:bg-white hover:text-violet-600'
                    }`}
                >
                  <div className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-violet-500'} transition-colors`}>
                    {item.icon}
                  </div>
                  <AnimatePresence>
                    {isSidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm font-black whitespace-nowrap"
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && isSidebarOpen && (
                    <motion.div layoutId="activeDot" className="w-1.5 h-1.5 bg-white rounded-full mr-auto" />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-white/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            {isSidebarOpen && <span className="text-sm font-black">خروج از پنل</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-white/50 backdrop-blur-md border-b border-white sticky top-0 z-20 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:flex w-10 h-10 items-center justify-center bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-violet-500 transition-all"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-black text-slate-800 hidden sm:block">
              {menuItems.find(i => i.href === pathname)?.title || 'مدیریت'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-violet-500 transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 left-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-10 w-[1px] bg-slate-200 mx-1 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="text-left hidden sm:block">
                <p className="text-xs font-black text-slate-900 leading-none">مدیر سیستم</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Admin Access</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-tr from-violet-100 to-violet-100 rounded-xl border border-violet-200 flex items-center justify-center shadow-inner">
                <ShieldCheck className="w-6 h-6 text-violet-600" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6 lg:p-8 relative z-10">
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 h-full w-72 bg-white z-50 lg:hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="bg-violet-600 p-2 rounded-xl">
                    <ButterflyIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-black text-slate-900">پنل مدیریت</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 p-1">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                      <div className={`flex items-center gap-4 px-4 py-4 rounded-2xl font-black text-sm ${isActive ? 'bg-violet-50 text-violet-600' : 'text-slate-500'
                        }`}>
                        {item.icon}
                        {item.title}
                      </div>
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-slate-50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-500 font-bold text-sm"
                >
                  <LogOut className="w-5 h-5" />
                  خروج از حساب
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}