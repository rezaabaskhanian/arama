'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import {
  Users, HeartHandshake, Trees, Sun, Phone, Plane, HandHeart, Sparkles,
  CheckCircle2, Clock, ArrowUpRight, Trash2, Target, Lock,
} from 'lucide-react';
import DecorativeBlobs from '@/components/layout/DecorativeBlobs';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Badge, EmptyState, Spinner } from '@/components/ui/feedback';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import {
  getCommitmentTemplates, getMyCommitments, pledgeCommitment,
  completeCommitment, cancelCommitment,
} from '@/lib/api';

const ICONS = {
  users: Users, 'heart-handshake': HeartHandshake, trees: Trees, sun: Sun,
  phone: Phone, plane: Plane, 'hand-heart': HandHeart, sparkles: Sparkles,
};

const CATEGORY_META = {
  community: { label: 'اجتماعی', tone: 'brand', color: 'from-brand-400 to-brand-600' },
  nature: { label: 'طبیعت', tone: 'calm', color: 'from-calm-400 to-calm-600' },
  family: { label: 'خانواده', tone: 'warm', color: 'from-warm-400 to-warm-500' },
  kindness: { label: 'نوع‌دوستی', tone: 'danger', color: 'from-pink-400 to-rose-500' },
  travel: { label: 'سفر', tone: 'brand', color: 'from-brand-400 to-brand-600' },
};

const MOODS = [
  { emoji: '😞', value: 1 }, { emoji: '😕', value: 2 }, { emoji: '😐', value: 3 },
  { emoji: '🙂', value: 4 }, { emoji: '😄', value: 5 },
];

export default function CommitmentsPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState('discover');
  const [templates, setTemplates] = useState([]);
  const [gate, setGate] = useState({ unlocked: true, completedExercises: 0, requiredExercises: 0 });
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);

  // مودال تعهد
  const [pledgeTarget, setPledgeTarget] = useState(null);
  const [moodBefore, setMoodBefore] = useState(0);

  // مودال انجام
  const [completeTarget, setCompleteTarget] = useState(null);
  const [moodAfter, setMoodAfter] = useState(0);
  const [reflection, setReflection] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [t, m] = await Promise.all([getCommitmentTemplates(), getMyCommitments()]);
      setTemplates(t.templates);
      setGate({ unlocked: t.unlocked, completedExercises: t.completedExercises, requiredExercises: t.requiredExercises });
      setMine(m);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handlePledge = async () => {
    try {
      setSubmitting(true);
      await pledgeCommitment({ templateId: pledgeTarget.id, moodBefore });
      toast('تعهد ثبت شد. موفق باشی! 🌱', 'success');
      setPledgeTarget(null);
      setMoodBefore(0);
      await load();
      setTab('mine');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!moodAfter) { toast('لطفاً حس‌وحالت را انتخاب کن', 'error'); return; }
    try {
      setSubmitting(true);
      await completeCommitment(completeTarget.id, { moodAfter, reflection });
      toast('آفرین! بازخوردت ثبت شد 💚', 'success');
      setCompleteTarget(null);
      setMoodAfter(0);
      setReflection('');
      await load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelCommitment(id);
      toast('تعهد لغو شد', 'info');
      await load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const activeCount = mine.filter((m) => m.status === 'pledged').length;
  const doneCount = mine.filter((m) => m.status === 'completed').length;

  return (
    <div className="min-h-screen bg-surface text-slate-800 pb-24" dir="rtl">
      <DecorativeBlobs />
      <main className="relative z-10 max-w-3xl mx-auto px-6 sm:px-10 pt-10 space-y-6">
        <div className="mb-2">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">تمرین‌های واقعی زندگی</h1>
          <p className="text-sm font-bold text-slate-400 mt-2">قدم‌های کوچک، تغییرهای بزرگ</p>
        </div>

        {/* خلاصه */}
        <section className="grid grid-cols-2 gap-4">
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{activeCount}</p>
              <p className="text-xs font-bold text-slate-400">تعهد فعال</p>
            </div>
          </div>
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-calm-50 flex items-center justify-center text-calm-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{doneCount}</p>
              <p className="text-xs font-bold text-slate-400">انجام‌شده</p>
            </div>
          </div>
        </section>

        {/* تب‌ها */}
        <div className="flex gap-2 bg-white/60 p-1.5 rounded-2xl border border-white">
          {[
            { id: 'discover', label: 'کشف تمرین‌ها' },
            { id: 'mine', label: `تعهدهای من (${mine.length})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${
                tab === t.id ? 'bg-brand-gradient text-white shadow-lg' : 'text-slate-500 hover:bg-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <Spinner label="در حال بارگذاری..." />
        ) : tab === 'discover' ? (
          <section className="grid gap-4">
            {!gate.unlocked && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-[1.75rem] p-6 flex items-start gap-4">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-amber-100 text-amber-500 flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="font-black text-amber-900">تمرین‌های واقعی زندگی هنوز قفل است 🔒</p>
                  <p className="text-amber-800/80 text-sm font-bold mt-1 leading-relaxed">
                    اول کار درونی، بعد قدم در دنیای واقعی. برای باز شدن این بخش، حداقل {gate.requiredExercises} تمرین شفابخش را کامل کن.
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex-1 h-2.5 bg-amber-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all"
                        style={{ width: `${gate.requiredExercises ? Math.min(100, (gate.completedExercises / gate.requiredExercises) * 100) : 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-black text-amber-700 whitespace-nowrap">{gate.completedExercises} از {gate.requiredExercises}</span>
                  </div>
                  <Link href="/exercises" className="inline-flex mt-4 bg-gradient-to-tr from-amber-500 to-orange-500 text-white px-6 py-3 rounded-2xl text-sm font-black shadow-lg shadow-amber-200 active:scale-95 transition-all">
                    رفتن به تمرین‌های شفابخش
                  </Link>
                </div>
              </div>
            )}
            {templates.map((t, i) => {
              const Icon = ICONS[t.icon] || Sparkles;
              const meta = CATEGORY_META[t.category] || CATEGORY_META.community;
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-[1.75rem] border border-slate-100 shadow-card p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-white shadow-lg`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-black text-slate-900">{t.title}</h3>
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed font-medium">{t.description}</p>
                      {t.duration_hint && (
                        <p className="text-[11px] font-bold text-slate-400 mt-2 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {t.duration_hint}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    {gate.unlocked ? (
                      <Button size="sm" onClick={() => { setPledgeTarget(t); setMoodBefore(0); }}>
                        <Target className="w-4 h-4" /> این کار را انجام می‌دهم
                      </Button>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-400 text-sm font-black cursor-not-allowed">
                        <Lock className="w-4 h-4" /> قفل
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </section>
        ) : (
          <section className="grid gap-4">
            {mine.length === 0 ? (
              <EmptyState
                icon={Target}
                title="هنوز تعهدی نداری"
                description="از بخش «کشف تمرین‌ها» یک تمرین واقعی انتخاب کن و به خودت قول بده."
                action={<Button size="sm" className="mt-2" onClick={() => setTab('discover')}>شروع کن</Button>}
              />
            ) : (
              mine.map((c) => {
                const meta = CATEGORY_META[c.category] || CATEGORY_META.community;
                const done = c.status === 'completed';
                const cancelled = c.status === 'cancelled';
                return (
                  <div key={c.id} className={`bg-white rounded-[1.75rem] border border-slate-100 shadow-card p-5 ${cancelled ? 'opacity-50' : ''}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                        <h3 className="font-black text-slate-900 truncate">{c.title}</h3>
                      </div>
                      {done ? (
                        <Badge tone="calm"><CheckCircle2 className="w-3.5 h-3.5" /> انجام‌شد</Badge>
                      ) : cancelled ? (
                        <Badge tone="slate">لغوشده</Badge>
                      ) : (
                        <Badge tone="warm"><Clock className="w-3.5 h-3.5" /> در انتظار</Badge>
                      )}
                    </div>

                    {done && (
                      <div className="mt-3 p-4 rounded-2xl bg-slate-50 space-y-2">
                        {c.reflection && <p className="text-sm text-slate-600 font-medium leading-relaxed">«{c.reflection}»</p>}
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                          <span>حس قبل: {MOODS[c.mood_before - 1]?.emoji || '—'}</span>
                          <span>حس بعد: {MOODS[c.mood_after - 1]?.emoji || '—'}</span>
                          {c.mood_delta > 0 && <span className="text-calm-600">حال بهتر ↑{c.mood_delta}</span>}
                        </div>
                      </div>
                    )}

                    {!done && !cancelled && (
                      <div className="mt-4 flex gap-2 justify-end">
                        <button
                          onClick={() => handleCancel(c.id)}
                          className="p-2.5 rounded-xl text-slate-400 hover:bg-danger-50 hover:text-danger-500 transition-colors"
                          aria-label="لغو"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Button variant="calm" size="sm" onClick={() => { setCompleteTarget(c); setMoodAfter(0); setReflection(''); }}>
                          <ArrowUpRight className="w-4 h-4" /> انجامش دادم
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </section>
        )}
      </main>

      <Footer />

      {/* مودال تعهد */}
      <Modal
        open={!!pledgeTarget}
        onClose={() => setPledgeTarget(null)}
        title="به خودت قول بده"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setPledgeTarget(null)}>انصراف</Button>
            <Button size="sm" loading={submitting} onClick={handlePledge}>ثبت تعهد</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 font-medium mb-4">{pledgeTarget?.title}</p>
        <p className="text-xs font-bold text-slate-400 mb-3">حس‌وحالت همین حالا چطوره؟ (اختیاری)</p>
        <div className="flex justify-between gap-2">
          {MOODS.map((m) => (
            <button
              key={m.value}
              onClick={() => setMoodBefore(m.value)}
              className={`flex-1 py-3 rounded-2xl text-2xl transition-all ${moodBefore === m.value ? 'bg-brand-50 ring-2 ring-brand-400 scale-110' : 'bg-slate-50'}`}
            >
              {m.emoji}
            </button>
          ))}
        </div>
      </Modal>

      {/* مودال انجام + بازخورد */}
      <Modal
        open={!!completeTarget}
        onClose={() => setCompleteTarget(null)}
        title="حالا حست چطوره؟"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setCompleteTarget(null)}>بعداً</Button>
            <Button variant="calm" size="sm" loading={submitting} onClick={handleComplete}>ثبت بازخورد</Button>
          </>
        }
      >
        <p className="text-xs font-bold text-slate-400 mb-3">بعد از انجام این کار چه حسی داری؟</p>
        <div className="flex justify-between gap-2 mb-4">
          {MOODS.map((m) => (
            <button
              key={m.value}
              onClick={() => setMoodAfter(m.value)}
              className={`flex-1 py-3 rounded-2xl text-2xl transition-all ${moodAfter === m.value ? 'bg-calm-50 ring-2 ring-calm-400 scale-110' : 'bg-slate-50'}`}
            >
              {m.emoji}
            </button>
          ))}
        </div>
        <Textarea
          rows={4}
          maxLength={1000}
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="تجربه‌ات را برای ما بنویس... چه چیزی در تو تغییر کرد؟"
        />
      </Modal>
    </div>
  );
}
