import { cn } from '@/lib/utils';

export function Label({ className = '', icon: Icon, children, ...props }) {
  return (
    <label
      className={cn('flex items-center gap-2 text-sm font-black text-slate-700 mb-2 mr-1', className)}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 text-brand-500" />}
      {children}
    </label>
  );
}

export default Label;
