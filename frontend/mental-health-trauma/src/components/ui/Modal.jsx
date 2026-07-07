'use client';

import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';

export function Modal({ open, onClose, title, children, footer, maxWidth = 'max-w-md' }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir="rtl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`relative w-full ${maxWidth} bg-white rounded-[2rem] shadow-2xl overflow-hidden`}
          >
            <div className="flex items-center justify-between p-6 pb-2">
              <h3 className="text-lg font-black text-slate-900">{title}</h3>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
                aria-label="بستن"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4">{children}</div>
            {footer && <div className="p-6 pt-2 flex gap-3 justify-end">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Modal;
