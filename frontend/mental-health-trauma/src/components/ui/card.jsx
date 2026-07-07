import { cn } from '@/lib/utils';

// کارت پایه — پیش‌فرض شیشه‌ای مطابق زبان طراحی اپ
export function Card({ className = '', glass = false, children, ...props }) {
  return (
    <div
      className={cn(
        glass
          ? 'glass-card'
          : 'rounded-[2rem] border border-slate-100 bg-white shadow-[0_20px_50px_-15px_rgba(15,23,42,0.08)]',
        'text-slate-800',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }) {
  return (
    <div className={cn('flex flex-col gap-1 p-6 pb-2', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, ...props }) {
  return (
    <h3 className={cn('text-lg font-black text-slate-900', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className = '', children, ...props }) {
  return (
    <div className={cn('p-6 pt-0', className)} {...props}>
      {children}
    </div>
  );
}

export default Card;
