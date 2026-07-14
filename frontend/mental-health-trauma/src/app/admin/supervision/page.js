'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HeartHandshake, Loader2, Send, X, Bot, UserRound, Zap, RefreshCw, MessageCircle
} from 'lucide-react';
import {
  adminGetSupervisedUsers,
  adminGetUserSupervisionMessages,
  adminSendSupervisionMessage,
  adminRunSupervisionFallback,
} from '@/lib/api';

const MOOD_EMOJI = ['❔', '😞', '😕', '😐', '🙂', '😄'];

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(new Date(dateStr));
  } catch {
    return '—';
  }
}

export default function AdminSupervisionPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);
  const [notice, setNotice] = useState('');

  // پنل گفتگو
  const [active, setActive] = useState(null); // supervised user
  const [messages, setMessages] = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setUsers(await adminGetSupervisedUsers());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const openThread = async (u) => {
    setActive(u);
    setBody('');
    try {
      setMsgLoading(true);
      setMessages(await adminGetUserSupervisionMessages(u.user_id));
    } catch (err) {
      setError(err.message);
    } finally {
      setMsgLoading(false);
    }
  };

  const send = async () => {
    if (!body.trim()) return;
    try {
      setSending(true);
      await adminSendSupervisionMessage(active.user_id, body.trim());
      setBody('');
      setMessages(await adminGetUserSupervisionMessages(active.user_id));
      loadUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const runFallback = async () => {
    try {
      setRunning(true);
      setNotice('');
      const res = await adminRunSupervisionFallback();
      setNotice(`${res.sent} پیام خودکار ارسال شد.`);
      loadUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* هدر */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">نظارت روانشناس</h1>
            <p className="text-slate-500 text-sm mt-0.5">کاربرانی که خواسته‌اند روانشناس همراهشان باشد</p>
          </div>
        </div>
        <button
          onClick={runFallback}
          disabled={running}
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-60"
        >
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          ارسال پیام‌های خودکار امروز
        </button>
      </div>

      {notice && <div className="bg-teal-50 border border-teal-100 text-teal-700 rounded-2xl p-4 text-sm font-bold">{notice}</div>}
      {error && <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl p-4 text-sm font-bold">{error}</div>}

      {/* لیست کاربران */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-10 h-10 text-violet-500 animate-spin" /></div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HeartHandshake className="w-8 h-8" />
          </div>
          <p className="text-slate-500 font-bold">هنوز هیچ کاربری درخواست نظارت نداده است.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {users.map((u) => (
            <button
              key={u.user_id}
              onClick={() => openThread(u)}
              className="text-right bg-white rounded-[1.75rem] border border-slate-100 shadow-sm hover:shadow-lg p-5 transition-all active:scale-[0.99]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                    <UserRound className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-slate-800 truncate">{u.nickname}</p>
                    <p className="text-xs font-bold text-slate-400 truncate">{u.phone}</p>
                  </div>
                </div>
                <div className="text-3xl shrink-0" title="آخرین حال">{MOOD_EMOJI[u.latest_mood] || '❔'}</div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span className="flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" /> {u.message_count} پیام</span>
                <span>آخرین پیام: {formatDate(u.last_message_at)}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* پنل گفتگو */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full sm:max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
                    <UserRound className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-black text-slate-800">{active.nickname}</p>
                    <p className="text-xs font-bold text-slate-400">آخرین حال: {MOOD_EMOJI[active.latest_mood] || '❔'}</p>
                  </div>
                </div>
                <button onClick={() => setActive(null)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {msgLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-7 h-7 text-violet-500 animate-spin" /></div>
                ) : messages.length === 0 ? (
                  <p className="text-center text-slate-400 text-sm font-bold py-8">هنوز پیامی برای این کاربر فرستاده نشده.</p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`rounded-2xl p-4 ${
                        m.from_user
                          ? 'bg-amber-50 border border-amber-200'
                          : m.is_auto
                          ? 'bg-teal-50 border border-teal-100'
                          : 'bg-violet-50 border border-violet-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5 text-[11px] font-black text-slate-500">
                        {m.is_auto ? <Bot className="w-3.5 h-3.5" /> : <UserRound className="w-3.5 h-3.5" />}
                        <span>{m.sender_name}</span>
                        {m.from_user && <span className="bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">مراجع</span>}
                        <span className="text-slate-300">•</span>
                        <span className="font-bold text-slate-400">{formatDate(m.created_at)}</span>
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed font-medium whitespace-pre-wrap">{m.body}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-slate-100 flex items-end gap-2">
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={2}
                  maxLength={1000}
                  placeholder="پیام دلگرم‌کننده‌ات را بنویس..."
                  className="flex-1 resize-none px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-violet-200 text-sm text-slate-700"
                />
                <button
                  onClick={send}
                  disabled={sending || !body.trim()}
                  className="bg-violet-600 hover:bg-violet-700 text-white p-3.5 rounded-2xl shadow-lg shadow-violet-200 transition-all active:scale-95 disabled:opacity-50"
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
