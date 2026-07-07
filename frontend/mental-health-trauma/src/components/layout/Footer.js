'use client';

import { ButterflyIcon } from '@/components/ui/Logo';

export default function Footer() {
  return (
    <footer className="mt-16 pb-28 flex flex-col items-center gap-3 opacity-40">
      <div className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all duration-700 group">
        <div className="w-8 h-8 bg-slate-200 rounded-xl flex items-center justify-center p-1.5 group-hover:bg-brand-100 transition-colors">
          <ButterflyIcon className="w-full h-full text-slate-400 group-hover:text-brand-500 transition-colors" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[.25em] text-slate-500">
          Aramina · آرامینا
        </span>
      </div>
    </footer>
  );
}
