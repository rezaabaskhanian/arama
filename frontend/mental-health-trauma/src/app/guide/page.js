'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import {
  ArrowRight,
  ClipboardList,
  Wind,
  BookOpen,
  HeartHandshake,
  Sparkles,
  LifeBuoy,
  CalendarClock,
  Lightbulb
} from 'lucide-react';
import DecorativeBlobs from '@/components/layout/DecorativeBlobs';

const steps = [
  {
    icon: ClipboardList,
    color: 'from-brand-500 to-brand-700',
    badge: 'قدم ۱',
    title: 'اول، ارزیابی وضعیت را انجام بده',
    desc: 'با یک ارزیابی کوتاه، سطح ترومایت (خفیف تا پیچیده) مشخص می‌شود. همه‌ی تمرین‌ها و پیشنهادها بر اساس همین نتیجه برایت شخصی‌سازی می‌شوند، پس این اولین و مهم‌ترین قدم است.',
    href: '/assessment',
    cta: 'شروع ارزیابی',
  },
  {
    icon: Wind,
    color: 'from-calm-500 to-calm-600',
    badge: 'قدم ۲',
    title: 'هر روز یک تمرین شفابخش انجام بده',
    desc: 'تمرین‌ها به‌صورت روزانه و مرحله‌به‌مرحله باز می‌شوند — هر روز فقط یک تمرین. این کندی عمدی است تا عادت بسازی و مسیر بهبودی‌ات پایدار بماند. تمرین امروز را از دست نده!',
    href: '/exercises',
    cta: 'رفتن به تمرین‌ها',
  },
  {
    icon: BookOpen,
    color: 'from-brand-400 to-brand-600',
    badge: 'قدم ۳',
    title: 'حالت را ثبت کن و بنویس',
    desc: 'هر روز حال‌وهوایت را ثبت کن و در دفترچه احساسات بنویس. این کار روند حالت را در نمودار نشان می‌دهد و به تو (و در صورت تمایل، روانشناست) کمک می‌کند مسیرت را بهتر ببینی.',
    href: '/journal',
    cta: 'دفترچه احساسات',
  },
  {
    icon: HeartHandshake,
    color: 'from-brand-500 to-brand-700',
    badge: 'قدم ۴',
    title: 'اگر خواستی، همراهی روانشناس را روشن کن',
    desc: 'می‌توانی از یک روانشناس بخواهی احوال و تمرین‌هایت را دنبال کند و هر روز برایت پیام بگذارد. اگر روانشناس تا ساعت ۸ شب پیامی نگذارد، خودِ آرامینا بر اساس حالِ آن روزت برایت پیام دلگرم‌کننده می‌فرستد.',
    href: '/supervision',
    cta: 'همراهی روانشناس',
  },
  {
    icon: Sparkles,
    color: 'from-accent-400 to-accent-500',
    badge: 'قدم ۵',
    title: 'قدم در دنیای واقعی بردار',
    desc: 'بعد از اینکه چند تمرین شفابخش را کامل کردی، «تمرین‌های واقعی زندگی» برایت باز می‌شود: سر زدن به سالمندان، سفر، مهربانی و... . اول کار درونی، بعد قدم در دنیای واقعی.',
    href: '/commitments',
    cta: 'تمرین‌های واقعی',
  },
];

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-[#EEEBF6] text-slate-800 pb-24 relative overflow-hidden" dir="rtl">
      <DecorativeBlobs />

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-2xl mx-auto px-4 pt-12 space-y-8"
      >
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-500 font-black text-xs uppercase tracking-widest transition-colors">
          <ArrowRight className="w-4 h-4" />
          بازگشت به خانه
        </Link>

        {/* هدر */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex p-4 bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white/50 text-amber-500 mb-2"
          >
            <Lightbulb className="w-10 h-10" />
          </motion.div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">راهنمای آرامینا</h1>
          <p className="text-sm font-bold text-slate-400 max-w-md mx-auto leading-relaxed">
            برای بهترین نتیجه، این مسیر ساده را دنبال کن. بهبودی یک اتفاق ناگهانی نیست؛ نتیجه‌ی قدم‌های کوچکِ هرروزه است. 🌱
          </p>
        </div>

        {/* مراحل */}
        <div className="space-y-5">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white/80 shadow-xl p-6 sm:p-7"
              >
                <div className="flex items-start gap-5">
                  <div className={`w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-lg`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="inline-block bg-slate-100 text-slate-500 text-[10px] font-black px-2.5 py-1 rounded-full mb-2">{s.badge}</span>
                    <h3 className="font-black text-slate-900 text-lg leading-snug">{s.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium mt-2">{s.desc}</p>
                    <Link
                      href={s.href}
                      className="inline-flex items-center gap-1.5 mt-4 text-brand-600 text-xs font-black bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-full transition-colors"
                    >
                      {s.cta}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* نکته‌ی تداوم */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-brand-50/60 to-brand-50/60 backdrop-blur-md border border-brand-100/50 rounded-[2.5rem] p-8 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-100 text-brand-500 flex items-center justify-center">
              <CalendarClock className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-800">راز بهترین نتیجه: تداوم</h3>
          </div>
          <ul className="space-y-2 text-sm font-medium text-slate-600 leading-relaxed">
            <li>• هر روز فقط چند دقیقه وقت بگذار؛ کیفیت مهم‌تر از مدت است.</li>
            <li>• حالت را روزانه ثبت کن تا روندش را ببینی.</li>
            <li>• اگر یک روز را از دست دادی، فردا دوباره ادامه بده — قضاوت بی‌قضاوت.</li>
          </ul>
        </motion.div>

        {/* کمک فوری */}
        <Link href="/breathing" className="block">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-gradient-to-br from-accent-400 to-accent-500 rounded-[2.5rem] p-6 text-white shadow-xl flex items-center gap-4"
          >
            <div className="bg-white/15 p-3 rounded-2xl border border-white/20">
              <LifeBuoy className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-black text-lg">در لحظه‌ی سخت، تنها نیستی</h3>
              <p className="text-sm font-medium text-white/90 mt-0.5">هر لحظه که حالت خیلی بد شد، همین کارت را بزن تا سراغ تمرین تنفس آرام‌بخش بروی؛ چند نفس عمیق، بدنت را از حالت هشدار خارج می‌کند.</p>
            </div>
          </motion.div>
        </Link>
      </motion.main>
    </div>
  );
}
