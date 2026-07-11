'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { Home, ClipboardList, Wind, BookOpen, User, Lightbulb } from 'lucide-react';

const items = [
  { title: 'خانه', href: '/', icon: Home },
  { title: 'تست', href: '/assessment', icon: ClipboardList },
  { title: 'تمرین', href: '/exercises', icon: Wind },
  { title: 'دفترچه', href: '/journal', icon: BookOpen },
  { title: 'پروفایل', href: '/profile', icon: User },
  { title: 'راهنما', href: '/guide', icon: Lightbulb },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 px-4 pb-4 pt-2 pointer-events-none" dir="rtl">
      <div className="max-w-md mx-auto glass-card rounded-[1.75rem]! flex justify-around items-center px-2 py-2 pointer-events-auto">
        {items.map(({ title, href, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className="relative flex-1">
              <div className="flex flex-col items-center gap-1 py-2">
                {active && (
                  <motion.span
                    layoutId="bottomNavActive"
                    className="absolute inset-1 bg-brand-50 rounded-2xl z-0"
                  />
                )}
                <Icon
                  className={`w-5 h-5 relative z-10 transition-colors ${
                    active ? 'text-brand-600' : 'text-slate-400'
                  }`}
                />
                <span
                  className={`text-[10px] font-black relative z-10 transition-colors ${
                    active ? 'text-brand-600' : 'text-slate-400'
                  }`}
                >
                  {title}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
