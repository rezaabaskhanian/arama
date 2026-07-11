'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { getJournalEntries, deleteJournalEntry } from '@/lib/api';
import { BookOpen, Plus, Trash2, Edit3, Loader2, AlertCircle } from 'lucide-react';

const MOOD_EMOJI = { 1: '😞', 2: '😕', 3: '😐', 4: '🙂', 5: '😄' };

function relDate(dateString) {
  const d = new Date(dateString);
  const now = new Date();
  const time = d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
  const days = Math.floor((now.setHours(0, 0, 0, 0) - new Date(dateString).setHours(0, 0, 0, 0)) / 86400000);
  if (days <= 0) return `امروز، ${time}`;
  if (days === 1) return `دیروز، ${time}`;
  return `${days} روز پیش`;
}

function titleOf(content) {
  const first = (content || '').trim().split('\n')[0];
  return first.length > 40 ? first.slice(0, 40) + '…' : first || 'بدون عنوان';
}

export default function JournalPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const data = await getJournalEntries();
      setEntries(data || []);
      if (data && data.length) setSelected(data[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    if (!confirm('آیا مطمئنی می‌خواهی این یادداشت را حذف کنی؟')) return;
    setDeleteLoading(id);
    try {
      await deleteJournalEntry(id);
      const rest = entries.filter((x) => x.id !== id);
      setEntries(rest);
      if (selected?.id === id) setSelected(rest[0] || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center" dir="rtl">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-slate-800 pb-24 selection:bg-brand-100" dir="rtl">
      <main className="max-w-6xl mx-auto px-6 sm:px-10 pt-10">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* ستون لیست */}
          <section className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 p-6 flex flex-col">
            <div className="flex items-center justify-between gap-3 pb-5 border-b border-slate-100">
              <h1 className="text-lg font-black text-slate-900 flex items-center gap-3">
                <span className="w-11 h-11 rounded-2xl bg-brand-900 text-white flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </span>
                یادداشت‌های عاطفی
              </h1>
              <Link href="/journal/new" className="btn-accent inline-flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm font-black shadow-lg shadow-accent-500/20">
                <Plus className="w-4 h-4" />
                یادداشت جدید
              </Link>
            </div>

            {error && (
              <div className="mt-5 bg-red-50 border border-red-100 rounded-2xl p-4 text-red-600 text-sm font-bold flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> {error}
              </div>
            )}

            <div className="mt-5 space-y-4 flex-1">
              {entries.length === 0 ? (
                <p className="text-center text-slate-400 text-sm font-bold py-12">هنوز یادداشتی ننوشتی.</p>
              ) : (
                entries.map((entry) => {
                  const active = selected?.id === entry.id;
                  return (
                    <button
                      key={entry.id}
                      onClick={() => setSelected(entry)}
                      className={`w-full text-right rounded-[1.5rem] p-5 border transition-all ${
                        active ? 'bg-white border-brand-300 ring-2 ring-brand-100 shadow-lg' : 'bg-slate-50/60 border-transparent hover:bg-white hover:border-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2.5 font-black text-slate-800">
                          <span className="text-xl">{MOOD_EMOJI[entry.mood] || '😐'}</span>
                          {titleOf(entry.content)}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 shrink-0">{relDate(entry.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100/70">
                        <Link
                          href={`/journal/edit/${entry.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 text-xs font-black text-slate-400 hover:text-brand-600 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> ویرایش
                        </Link>
                        <button
                          onClick={(e) => handleDelete(entry.id, e)}
                          disabled={deleteLoading === entry.id}
                          className="inline-flex items-center gap-1.5 text-xs font-black text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
                        >
                          {deleteLoading === entry.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          حذف
                        </button>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          {/* ستون جزئیات */}
          <section className="lg:col-span-3 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 p-8 min-h-[60vh] flex flex-col">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col h-full"
                >
                  <div className="flex items-center justify-between gap-4 pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{MOOD_EMOJI[selected.mood] || '😐'}</span>
                      <div>
                        <h2 className="text-xl font-black text-slate-900">{titleOf(selected.content)}</h2>
                        <p className="text-xs font-bold text-slate-400 mt-1">{relDate(selected.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/journal/edit/${selected.id}`} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-brand-600 flex items-center justify-center transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </Link>
                      <button onClick={(e) => handleDelete(selected.id, e)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-6 text-slate-700 leading-loose font-medium whitespace-pre-wrap break-words flex-1">
                    {selected.content}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col items-center justify-center text-center gap-4"
                >
                  <span className="w-20 h-20 rounded-[2rem] bg-slate-50 text-slate-300 flex items-center justify-center">
                    <BookOpen className="w-10 h-10" />
                  </span>
                  <h2 className="text-2xl font-black text-slate-900">مکانی امن برای عواطف شما</h2>
                  <p className="text-sm font-bold text-slate-400 leading-relaxed max-w-sm">
                    یک یادداشت را از لیست سمت راست انتخاب کنید تا جزئیات آن بارگذاری گردد، یا دکمه‌ی «یادداشت جدید» را برای ثبت بفشارید.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>
    </div>
  );
}
