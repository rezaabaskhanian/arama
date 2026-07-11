'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft, Sparkles } from 'lucide-react';

/**
 * Immersive hero (سبک Bloom): پس‌زمینه‌ی ویدیوییِ متحرک + محتوای وسط‌چین.
 * اگر فایل ویدیو در public/hero.mp4 باشد پخش می‌شود؛ در غیر این صورت گرادیانِ
 * متحرکِ «aurora» نمایش داده می‌شود تا پس‌زمینه همیشه «حرکت» داشته باشد.
 */
export default function VideoHero({ greeting = 'خوش آمدی', userName = '' }) {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] aurora shadow-2xl shadow-brand-900/20 min-h-[68vh] flex">
      {/* ویدیوی پس‌زمینه (اختیاری: public/hero.mp4) */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/hero-poster.jpg"
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>

      {/* لایه‌ی خوانایی */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-900/20 via-brand-900/10 to-brand-900/55" />

      {/* محتوا — وسط‌چین مثل Bloom */}
      <div className="relative z-10 w-full p-8 sm:p-10 flex flex-col items-center justify-center text-center gap-7">
        <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 text-white text-[11px] font-black px-4 py-2 rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          آرامینا
        </span>

        <div className="space-y-3">
          <p className="text-white/85 text-sm font-bold">
            {greeting}{userName ? '، ' + userName + ' عزیز' : ''}
          </p>
          <h2 className="text-white text-4xl sm:text-5xl font-black leading-[1.15] tracking-tight drop-shadow-sm max-w-md">
            با آنچه از سر می‌گذرانی،
            <br />
            رشد کن 🌿
          </h2>
          <p className="text-white/80 text-sm font-medium leading-relaxed max-w-xs mx-auto pt-1">
            هر روز یک قدم کوچک، برای آرامش و بهبودی تو
          </p>
        </div>

        <Link href="/exercises">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn-accent inline-flex items-center gap-3 pr-2 pl-6 py-2.5 rounded-full font-black shadow-xl shadow-brand-900/20"
          >
            <span className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center">
              <ArrowLeft className="w-4 h-4 text-brand-800" />
            </span>
            تمرین امروزت را شروع کن
          </motion.button>
        </Link>
      </div>
    </section>
  );
}
