'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * فیلد رمز عبور با دکمه‌ی «چشم» برای نمایش/پنهان‌سازی متن رمز.
 * همه‌ی props استاندارد input (name, value, onChange, placeholder, disabled, autoComplete...) پذیرفته می‌شود.
 * در className فیلد، سمت چپ (pl-12) را برای جا دادن آیکون چشم خالی بگذارید.
 */
export function PasswordInput({ className = '', ...props }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative group">
      <input {...props} type={show ? 'text' : 'password'} className={className} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        tabIndex={-1}
        aria-label={show ? 'پنهان کردن رمز عبور' : 'نمایش رمز عبور'}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
      >
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}

export default PasswordInput;
