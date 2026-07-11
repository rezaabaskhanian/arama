'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Flame } from 'lucide-react';
import { getMoodTrend } from '@/lib/api';
import { Skeleton } from '@/components/ui/feedback';

const MOOD_EMOJI = ['', '😞', '😕', '😐', '🙂', '😄'];

// نمودار میله‌ای سبک روند حس‌وحال (بدون کتابخانه‌ی خارجی)
export default function MoodTrendChart({ days = 14 }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    getMoodTrend(days).then(setData);
  }, [days]);

  if (!data) {
    return <Skeleton className="h-48 w-full" />;
  }

  // API آخرین‌ها را نزولی می‌دهد؛ برای نمایش زمانی، معکوس می‌کنیم
  const moods = [...(data.moods || [])].reverse();
  const avg = moods.length ? (moods.reduce((a, b) => a + b, 0) / moods.length) : 0;

  const barColor = (m) =>
    m <= 1 ? 'bg-danger-400' : m === 2 ? 'bg-warm-400' : m === 3 ? 'bg-warm-300' : m === 4 ? 'bg-calm-400' : 'bg-calm-500';

  return (
    <div className="glass-card p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-6 bg-brand-500 rounded-full" />
          <h2 className="text-lg font-black text-slate-900">روند حال تو</h2>
        </div>
        <div className="flex items-center gap-2">
          {data.streak > 0 && (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-warm-50 text-warm-500 text-[11px] font-black">
              <Flame className="w-3.5 h-3.5" /> {data.streak} روز پیاپی
            </span>
          )}
          <span className="p-2 bg-brand-50 text-brand-600 rounded-xl">
            <TrendingUp className="w-4 h-4" />
          </span>
        </div>
      </div>

      {moods.length === 0 ? (
        <p className="text-center text-slate-400 text-sm font-bold py-10">
          هنوز حس‌وحالی ثبت نشده. از امروز شروع کن!
        </p>
      ) : (
        <>
          <div className="flex items-end justify-center gap-2 h-40">
            {moods.map((m, i) => (
              <div key={i} className="flex-1 max-w-[44px] flex flex-col items-center justify-end gap-1.5 h-full">
                <span className="text-base leading-none">{MOOD_EMOJI[m] || ''}</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(m / 5) * 100}%` }}
                  transition={{ delay: i * 0.03, ease: 'easeOut' }}
                  className={`w-full rounded-lg ${barColor(m)} min-h-[6px]`}
                  title={`${m}/5`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400">{moods.length} ثبت اخیر</span>
            <span className="text-sm font-black text-slate-600">
              میانگین: {MOOD_EMOJI[Math.round(avg)] || '—'} {avg.toFixed(1)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
