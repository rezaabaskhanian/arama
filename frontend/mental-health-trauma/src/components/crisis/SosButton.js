'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LifeBuoy, Phone, X, HeartHandshake, Wind } from 'lucide-react';
import Link from 'next/link';

// شماره‌ها و منابع اورژانس (قابل تنظیم)
const EMERGENCY = [
  { label: 'اورژانس اجتماعی', number: '۱۲۳', tel: '123' },
  { label: 'اورژانس پزشکی', number: '۱۱۵', tel: '115' },
  { label: 'خط ملی امید (مشاوره)', number: '۱۴۸۰', tel: '1480' },
];

export default function SosButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* دکمه‌ی شناور SOS */}
      <motion.button
        onClick={() => setOpen(true)}
        whileTap={{ scale: 0.9 }}
        animate={{ boxShadow: ['0 0 0 0 rgba(239,68,68,0.4)', '0 0 0 14px rgba(239,68,68,0)'] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        className="fixed z-50 bottom-28 left-4 w-14 h-14 rounded-full bg-gradient-to-br from-danger-500 to-danger-600 text-white flex flex-col items-center justify-center shadow-xl"
        aria-label="کمک فوری"
      >
        <LifeBuoy className="w-6 h-6" />
        <span className="text-[8px] font-black">SOS</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4" dir="rtl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-br from-danger-500 to-danger-600 p-6 text-white relative">
                <button
                  onClick={() => setOpen(false)}
                  className="absolute top-4 left-4 text-white/80 hover:text-white"
                  aria-label="بستن"
                >
                  <X className="w-5 h-5" />
                </button>
                <HeartHandshake className="w-9 h-9 mb-2" />
                <h3 className="text-xl font-black">تو تنها نیستی</h3>
                <p className="text-sm text-white/85 font-medium mt-1">
                  اگر حالت خیلی بد است، همین حالا کمک بگیر.
                </p>
              </div>

              <div className="p-5 space-y-3">
                {EMERGENCY.map((e) => (
                  <a
                    key={e.tel}
                    href={`tel:${e.tel}`}
                    className="flex items-center justify-between p-4 rounded-2xl bg-danger-50 hover:bg-danger-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-danger-600 shadow-sm">
                        <Phone className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-black text-slate-700">{e.label}</span>
                    </div>
                    <span className="text-lg font-black text-danger-600">{e.number}</span>
                  </a>
                ))}

                <Link
                  href="/breathing"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-calm-50 hover:bg-calm-100 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-calm-600 shadow-sm">
                    <Wind className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-700">تمرین تنفس آرام‌سازی</p>
                    <p className="text-[11px] font-bold text-slate-400">همین حالا آرام شو</p>
                  </div>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
