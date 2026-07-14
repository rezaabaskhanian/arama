'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { User, Lightbulb, HeartHandshake } from 'lucide-react';

const items = [
  { title: 'خانه', href: '/' },
  { title: 'ارزیابی', href: '/assessment' },
  { title: 'تمرین', href: '/exercises' },
  { title: 'دفترچه', href: '/journal' },
  { title: 'پایش وضعیت', href: '/progress' },
];

export default function TopNav() {
  const pathname = usePathname();
  const onHero = pathname === '/'; // فقط صفحه‌ی هوم هیروِ تمام‌صفحه دارد

  // نوار بالا همیشه پس‌زمینه دارد (سفید/بلور) — دیگر روی هیرو شفاف نمی‌شود
  const transparent = false;

  const iconBtn = (href, title, Icon) => {
    const active = pathname.startsWith(href);
    return (
      <Link
        href={href}
        title={title}
        aria-label={title}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
          transparent
            ? `text-white ${active ? 'bg-white/25' : 'bg-white/10 hover:bg-white/20'}`
            : active
            ? 'bg-brand-100 text-brand-700'
            : 'bg-slate-100 text-slate-500 hover:text-brand-700 hover:bg-brand-50'
        }`}
      >
        <Icon className="w-5 h-5" />
      </Link>
    );
  };

  return (
    <nav
      dir="rtl"
      className={`z-50 transition-all duration-300 px-4 pt-4 pb-2 ${onHero ? 'fixed top-0 inset-x-0' : 'sticky top-0'}`}
    >
      <div className="max-w-7xl mx-auto nav-solid rounded-[2rem]! px-5 sm:px-8 h-16 flex items-center justify-between gap-6">
        {/* برند — فقط متن */}
        <Link
          href="/"
          className={`text-2xl font-black tracking-tight transition-colors ${
            transparent ? 'text-white' : 'text-brand-800'
          }`}
        >
          آرامینا
        </Link>

        {/* لینک‌های متنی (بدون آیکون) */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {items.map(({ title, href }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            const idle = transparent ? 'text-white/75 hover:text-white' : 'text-slate-500 hover:text-brand-700';
            const on = transparent ? 'text-white' : 'text-brand-700';
            return (
              <Link key={href} href={href} className="relative px-3 sm:px-4 py-2 text-sm font-bold whitespace-nowrap">
                <span className={`relative z-10 transition-colors ${active ? on : idle}`}>{title}</span>
                {active && (
                  <motion.span
                    layoutId="navActive"
                    className={`absolute inset-x-3 -bottom-1 h-0.5 rounded-full ${
                      transparent ? 'bg-accent-400' : 'bg-brand-500'
                    }`}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* اکشن‌ها: پروفایل + راهنما (آیکون) و CTA */}
        <div className="flex items-center gap-2">
          {iconBtn('/supervision', 'ناظر روانشناس', HeartHandshake)}
          {iconBtn('/profile', 'پروفایل', User)}
          {iconBtn('/guide', 'راهنما', Lightbulb)}
          <Link
            href="/exercises"
            className={`hidden sm:inline-flex items-center rounded-full px-5 py-2.5 text-sm font-black transition-all ${
              transparent
                ? 'btn-accent shadow-lg shadow-brand-900/20'
                : 'bg-brand-600 text-white hover:bg-brand-700'
            }`}
          >
            شروع تمرین
          </Link>
        </div>
      </div>
    </nav>
  );
}
