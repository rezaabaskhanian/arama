import { cn } from '@/lib/utils';

export function Input({ className = '', icon: Icon, ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
      )}
      <input
        className={cn(
          'w-full py-4 bg-slate-50/60 border border-slate-100 rounded-2xl text-slate-800 font-medium placeholder:text-slate-400',
          'focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-400 focus:bg-white transition-all duration-300',
          Icon ? 'px-12' : 'px-5',
          className
        )}
        {...props}
      />
    </div>
  );
}

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={cn(
        'w-full px-5 py-4 bg-slate-50/60 border border-slate-100 rounded-2xl text-slate-800 font-medium placeholder:text-slate-400 resize-none',
        'focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-400 focus:bg-white transition-all duration-300',
        className
      )}
      {...props}
    />
  );
}

export default Input;
