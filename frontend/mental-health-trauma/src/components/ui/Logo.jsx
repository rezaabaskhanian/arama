// آیکون و لوگوی برند آرامینا — به‌جای تکرار ButterflyIcon در هر صفحه
'use client';

export function ButterflyIcon({ className = 'w-6 h-6' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M12 10c0-2.5-2-4.5-4.5-4.5S3 7.5 3 10c0 3 4.5 9 9 9s9-6 9-9-2-4.5-4.5-4.5S12 7.5 12 10z" opacity="0.3" />
      <path d="M12 21c-4.5 0-9-6-9-9 0-2.5 2-4.5 4.5-4.5S12 10 12 10s2-2.5 4.5-2.5 4.5 2 4.5 4.5c0 3-4.5 9-9 9z" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 10v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * لوگوی برند با نشان + نام
 * size: 'sm' | 'md' | 'lg'
 */
export function Logo({ size = 'md', showText = true, subtitle = 'همراه آرامش تو' }) {
  const dims = {
    sm: { box: 'p-2 rounded-xl', icon: 'w-5 h-5', title: 'text-sm' },
    md: { box: 'p-2.5 rounded-2xl', icon: 'w-7 h-7', title: 'text-lg' },
    lg: { box: 'p-3.5 rounded-3xl', icon: 'w-10 h-10', title: 'text-2xl' },
  }[size];

  return (
    <div className="flex items-center gap-3">
      <div className={`bg-linear-to-tr from-brand-500 to-pink-500 ${dims.box} shadow-lg shadow-brand-200`}>
        <ButterflyIcon className={`${dims.icon} text-white`} />
      </div>
      {showText && (
        <div className="leading-tight">
          <h1 className={`${dims.title} font-black text-slate-900`}>آرامینا</h1>
          {subtitle && <p className="text-[10px] font-bold text-slate-400">{subtitle}</p>}
        </div>
      )}
    </div>
  );
}

export default Logo;
