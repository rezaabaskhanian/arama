'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowRight, User } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

/**
 * سربرگ مشترک صفحات داخلی.
 * props: title, subtitle, back (نمایش دکمه‌ی بازگشت), right (المان سفارشی سمت چپ)
 */
export default function Header({ title, subtitle, back = false, right }) {
  const router = useRouter();

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 px-4 pt-4 pb-2"
    >
      <div className="max-w-3xl mx-auto glass-card rounded-[2rem]! p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {back && (
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-brand-600 transition-colors"
              aria-label="بازگشت"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
          {title ? (
            <div className="leading-tight">
              <h1 className="text-lg font-black text-slate-900">{title}</h1>
              {subtitle && <p className="text-[11px] font-bold text-slate-400">{subtitle}</p>}
            </div>
          ) : (
            <Logo size="md" />
          )}
        </div>

        {right ?? (
          <Link href="/profile">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 bg-linear-to-tr from-brand-100 to-indigo-100 rounded-full border-2 border-white flex items-center justify-center shadow-inner"
            >
              <User className="w-5 h-5 text-brand-600" />
            </motion.div>
          </Link>
        )}
      </div>
    </motion.header>
  );
}
