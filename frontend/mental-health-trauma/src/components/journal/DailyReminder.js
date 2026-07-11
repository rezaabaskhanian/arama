'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, X } from 'lucide-react';
import Link from 'next/link';

/**
 * یادآور ملایم روزانه: اگر کاربر امروز حس‌وحالش را ثبت نکرده باشد
 * یک بنر قابل‌بستن نشان می‌دهد (یک‌بار در روز).
 * props: loggedToday (boolean)
 */
export default function DailyReminder({ loggedToday }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (loggedToday) return;
    const today = new Date().toISOString().slice(0, 10);
    const dismissed = localStorage.getItem('reminderDismissed');
    if (dismissed !== today) setShow(true);
  }, [loggedToday]);

  const dismiss = () => {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem('reminderDismissed', today);
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -15, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-l from-brand-50 to-violet-50 border border-brand-100">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand-600 shadow-sm shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-slate-800">حالت را امروز ثبت کن</p>
              <p className="text-[11px] font-bold text-slate-400">ثبت روزانه، streak تو را زنده نگه می‌دارد 🔥</p>
            </div>
            <Link
              href="/mood"
              className="text-xs font-black text-brand-600 bg-white px-4 py-2 rounded-xl shadow-sm hover:bg-brand-50 transition-colors shrink-0"
            >
              ثبت
            </Link>
            <button onClick={dismiss} className="text-slate-300 hover:text-slate-500 shrink-0" aria-label="بستن">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
