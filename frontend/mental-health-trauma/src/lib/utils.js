// ابزارهای کمکی مشترک

// ترکیب کلاس‌های شرطی (نسخه‌ی سبک بدون وابستگی)
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// تبدیل ارقام به فارسی
export function toFa(input) {
  const map = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(input ?? '').replace(/\d/g, (d) => map[+d]);
}

// قالب‌بندی تاریخ به شمسی
export function formatDateFa(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Intl.DateTimeFormat('fa-IR').format(new Date(dateStr));
  } catch {
    return String(dateStr);
  }
}

// برچسب فارسی نوع تروما
export const traumaLabels = {
  mild: 'خفیف',
  moderate: 'متوسط',
  severe: 'شدید',
  complex: 'پیچیده',
};
