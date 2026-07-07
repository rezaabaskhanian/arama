'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// ---- Spinner ----
export function Spinner({ className = 'w-8 h-8', label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <Loader2 className={cn('animate-spin text-brand-500', className)} />
      {label && <p className="text-sm font-bold text-slate-400">{label}</p>}
    </div>
  );
}

// ---- Skeleton ----
export function Skeleton({ className = '' }) {
  return <div className={cn('animate-pulse rounded-2xl bg-slate-100', className)} />;
}

// ---- Badge ----
const badgeTones = {
  brand: 'bg-brand-50 text-brand-700',
  calm: 'bg-calm-50 text-calm-600',
  warm: 'bg-warm-50 text-warm-500',
  danger: 'bg-danger-50 text-danger-600',
  slate: 'bg-slate-100 text-slate-500',
};

export function Badge({ tone = 'brand', className = '', children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black',
        badgeTones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

// ---- EmptyState ----
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-14 px-6 rounded-[2rem] border border-dashed border-slate-200 bg-white/40">
      {Icon && (
        <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h4 className="text-base font-black text-slate-700">{title}</h4>
      {description && <p className="text-sm text-slate-400 font-medium max-w-xs">{description}</p>}
      {action}
    </div>
  );
}
