'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Loader2, Bot, Stethoscope } from 'lucide-react';
import { getSupervisionStatus, toggleSupervision } from '@/lib/api';

const DOCTOR = {
  name: 'دکتر مریم احمدی',
  role: 'متخصص روان‌پزشکی بالینی و علوم اعصاب تروما',
  license: 'شماره نظام پزشکی: م-۴۳۳۲۱',
  intro:
    'سلام مراجع گرامی، به مرکز التیام آرامینا خوش آمدید. من دکتر مریم احمدی، ناظر پرونده‌ی بالینی شما هستم. این کانال میان ما کاملاً خصوصی، محلی و رمزگذاری‌شده است. لطفاً هر زمان احساس تنش شدید یا فلاش‌بک کردید، بنویسید.',
};

function formatDate(dateStr) {
  try {
    return new Intl.DateTimeFormat('fa-IR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr));
  } catch {
    return '';
  }
}

export default function SupervisionPage() {
  const [wants, setWants] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getSupervisionStatus();
        setWants(!!data.wants_supervision);
        setMessages(data.messages || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleToggle = async () => {
    try {
      setSaving(true);
      setError('');
      const next = !wants;
      await toggleSupervision(next);
      setWants(next);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const DoctorAvatar = ({ className }) => (
    <span className={`rounded-full bg-brand-900 text-white flex items-center justify-center font-black ${className}`}>م</span>
  );

  return (
    <div className="min-h-screen bg-surface text-slate-800 pb-24 selection:bg-brand-100" dir="rtl">
      <main className="max-w-6xl mx-auto px-6 sm:px-10 pt-10">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* چت پزشک */}
          <section className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 p-8 flex flex-col min-h-[70vh]">
            <div className="flex items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <DoctorAvatar className="w-14 h-14 text-xl" />
                <div>
                  <h1 className="text-xl font-black text-slate-900">{DOCTOR.name}</h1>
                  <p className="text-xs font-black text-calm-600 mt-0.5">پزشک ناظر و همراه روانشناس تخصصی شما</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-2 bg-calm-50 text-calm-600 text-xs font-black px-4 py-2 rounded-full">
                <span className="w-2 h-2 rounded-full bg-calm-500" />
                پاسخگویی فعال
              </span>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
              </div>
            ) : (
              <div className="flex-1 py-6 space-y-5">
                {/* پیام معرفی ثابت */}
                <div className="flex gap-3">
                  <DoctorAvatar className="w-10 h-10 text-sm shrink-0" />
                  <div className="bg-slate-50 rounded-[1.5rem] rounded-tr-md p-5 max-w-xl">
                    <p className="text-slate-700 leading-relaxed font-medium text-sm">{DOCTOR.intro}</p>
                    <p className="text-[11px] font-bold text-slate-400 mt-3">پیام ناظر · {DOCTOR.name}</p>
                  </div>
                </div>

                {/* پیام‌های واقعی */}
                <AnimatePresence>
                  {messages.map((m, i) => (
                    <motion.div
                      key={m.id || i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex gap-3"
                    >
                      <span className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${m.is_auto ? 'bg-brand-100 text-brand-600' : 'bg-brand-900 text-white font-black'}`}>
                        {m.is_auto ? <Bot className="w-5 h-5" /> : 'م'}
                      </span>
                      <div className={`rounded-[1.5rem] rounded-tr-md p-5 max-w-xl ${m.is_auto ? 'bg-brand-50' : 'bg-slate-50'}`}>
                        <p className="text-slate-700 leading-relaxed font-medium text-sm whitespace-pre-wrap">{m.body}</p>
                        <p className="text-[11px] font-bold text-slate-400 mt-3">
                          {m.sender_name || DOCTOR.name} · {formatDate(m.created_at)}
                          {m.is_auto && ' · پیام خودکار آرامینا'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {!wants && messages.length === 0 && (
                  <p className="text-center text-slate-400 text-sm font-bold pt-10">
                    برای دریافت پیام‌های روزانه‌ی ناظر، ابتدا از پنل کناری «دسترسی پزشک معالج» را تأیید کنید.
                  </p>
                )}
              </div>
            )}
          </section>

          {/* پنل کناری */}
          <div className="space-y-6">
            {/* نظارت روان‌پزشک */}
            <section className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 p-7 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-brand-600" />
                  نظارت روان‌پزشک معالج
                </h2>
                <span className="btn-accent text-[11px] font-black px-3 py-1 rounded-full">آنلاین</span>
              </div>
              <p className="text-xs font-bold text-slate-400 leading-relaxed">
                با فعال‌سازی این بخش، سیستم تروما به پزشک ناظر کلینیک اجازه می‌دهد تا روزانه روند تکمیل تمرینات، پایش‌ها و
                دفترچه احساسات شما را رصد نموده و پاسخ صوتی مناسب صادر کند.
              </p>

              <div className="bg-slate-50/60 rounded-[1.5rem] p-5 flex items-center justify-between gap-4">
                <span className="font-black text-slate-800 text-sm">
                  تأیید دسترسی پزشک معالج
                  <span className={`block text-[11px] font-bold mt-0.5 ${wants ? 'text-calm-600' : 'text-slate-400'}`}>
                    {wants ? 'فعال — ناظر می‌تواند روندت را ببیند' : 'خاموش (پیش‌فرض) — کسی به داده‌هایت دسترسی ندارد'}
                  </span>
                </span>
                <button
                  onClick={handleToggle}
                  disabled={saving}
                  role="switch"
                  aria-checked={wants}
                  className={`relative w-14 h-8 rounded-full transition-colors disabled:opacity-60 shrink-0 ${wants ? 'bg-brand-900' : 'bg-slate-200'}`}
                >
                  <motion.span
                    className="absolute top-1 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center"
                    animate={{ left: wants ? '1.75rem' : '0.25rem' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin text-brand-600" />}
                  </motion.span>
                </button>
              </div>

              {error && <p className="text-rose-500 text-xs font-bold text-center">{error}</p>}

              {/* توضیح واضح: این سرویس چیست و چه نیست */}
              <div className="bg-brand-50/60 rounded-2xl p-4 space-y-2">
                <p className="text-[12px] font-black text-brand-700">این بخش چیست؟</p>
                <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                  با روشن‌کردن، ناظر می‌تواند روند مود، دفترچه‌ی احساسات و تمرین‌هایت را ببیند و هر شب برایت پیام بگذارد.
                  اگر تا ساعت ۸ شب پیامی نگذارد، آرامینا خودکار یک پیام دلگرم‌کننده‌ی متناسب با حال آن روزت می‌فرستد.
                </p>
                <p className="text-[12px] font-black text-brand-700 pt-1">چه چیزی نیست؟</p>
                <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                  جایگزین درمان حضوری یا اورژانس روانی نیست و پاسخ فوری تضمین نمی‌شود. در شرایط بحرانی حتماً از دکمه‌ی «کمک فوری» استفاده کن.
                  هر زمان بخواهی می‌توانی این دسترسی را خاموش کنی.
                </p>
              </div>
            </section>

            {/* پروفایل پزشک */}
            <section className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100 p-7 text-center space-y-4">
              <span className="w-20 h-20 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-3xl font-black mx-auto">م</span>
              <div>
                <h3 className="text-lg font-black text-slate-900">{DOCTOR.name}</h3>
                <p className="text-sm font-bold text-brand-600 mt-1">{DOCTOR.role}</p>
              </div>
              <p className="text-xs font-bold text-slate-400 pt-3 border-t border-slate-100">{DOCTOR.license}</p>
              <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-black">
                <Stethoscope className="w-4 h-4" />
                همراه تخصصی مرکز التیام آرامینا
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
