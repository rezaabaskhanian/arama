'use client';

import { useEffect } from 'react';

// اعلان‌های مهربان آرامینا — یادآورهای خودمراقبتی و تنفس پاراسمپاتیک در طول روز.
// نسخه‌ی سبک سمت‌کلاینت: تا وقتی اپ باز است و کاربر اعلان را روشن کرده باشد،
// هر بازه یک یادآور مهربان با Notification API مرورگر نشان می‌دهد.

const PREF_KEY = 'aramina_prefs';
const INTERVAL_MS = 1000 * 60 * 30; // هر ۳۰ دقیقه

const REMINDERS = [
  'یک نفس عمیق پاراسمپاتیک: ۴ ثانیه دم، ۶ ثانیه بازدم. شانه‌هایت را رها کن 🌿',
  'همین حالا کف پاهایت را روی زمین حس کن. تو همین‌جا، در امانی 💙',
  'یک لیوان آب بنوش و یک لحظه به خودت مهربانی کن ☕️',
  'وقت یک تمرین کوتاه تنفس است؛ ذهنت لیاقت این آرامش را دارد 🍃',
  'به سه چیزی که امروز بابتشان سپاسگزاری فکر کن ✨',
  'اگر تنش داری، دستت را روی قلبت بگذار و با خودت مهربان باش 🤍',
];

function readNotifyPref() {
  try {
    const p = JSON.parse(localStorage.getItem(PREF_KEY));
    // پیش‌فرض روشن است (منطبق با DEFAULT_PREFS در پروفایل)
    return p ? !!p.notify : true;
  } catch {
    return true;
  }
}

export default function KindNotifications() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    let idx = Math.floor(Math.random() * REMINDERS.length);

    const tick = () => {
      if (!readNotifyPref()) return;
      if (Notification.permission !== 'granted') return;
      const body = REMINDERS[idx % REMINDERS.length];
      idx += 1;
      try {
        new Notification('آرامینا 🌿', { body, tag: 'aramina-selfcare' });
      } catch {}
    };

    const id = setInterval(tick, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return null;
}
