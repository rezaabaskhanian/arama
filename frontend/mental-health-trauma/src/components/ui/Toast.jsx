'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const toneStyles = {
  success: { icon: CheckCircle2, bar: 'bg-calm-500', text: 'text-calm-600' },
  error: { icon: XCircle, bar: 'bg-danger-500', text: 'text-danger-600' },
  info: { icon: Info, bar: 'bg-brand-500', text: 'text-brand-600' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message, tone = 'success', duration = 3200) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, tone }]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 w-[90%] max-w-sm" dir="rtl">
        <AnimatePresence>
          {toasts.map((t) => {
            const style = toneStyles[t.tone] || toneStyles.info;
            const Icon = style.icon;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative flex items-center gap-3 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 overflow-hidden"
              >
                <span className={`absolute top-0 right-0 h-full w-1.5 ${style.bar}`} />
                <Icon className={`w-5 h-5 shrink-0 ${style.text}`} />
                <p className="flex-1 text-sm font-bold text-slate-700">{t.message}</p>
                <button onClick={() => dismiss(t.id)} className="text-slate-300 hover:text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { toast: () => {} };
  return ctx;
}
