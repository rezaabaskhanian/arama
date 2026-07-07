import { cn } from '@/lib/utils';

const variants = {
  primary:
    'bg-brand-gradient text-white shadow-[0_10px_30px_-10px_rgba(59,99,246,0.5)] hover:shadow-[0_15px_35px_-12px_rgba(59,99,246,0.6)]',
  secondary:
    'bg-white text-brand-700 border border-slate-100 shadow-sm hover:bg-brand-50',
  soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
  calm: 'bg-gradient-to-r from-calm-500 to-calm-600 text-white shadow-lg shadow-calm-200 hover:brightness-105',
  danger:
    'bg-gradient-to-r from-danger-500 to-danger-600 text-white shadow-lg shadow-danger-100 hover:brightness-105',
  ghost: 'bg-transparent text-slate-500 hover:bg-slate-100',
};

const sizes = {
  sm: 'px-4 py-2 text-xs rounded-xl',
  md: 'px-6 py-3.5 text-sm rounded-2xl',
  lg: 'px-8 py-4 text-base rounded-2xl',
};

export function Button({
  className = '',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-black transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}

export default Button;
