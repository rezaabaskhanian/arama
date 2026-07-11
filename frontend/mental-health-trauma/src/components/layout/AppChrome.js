'use client';

import { usePathname } from 'next/navigation';
import TopNav from './TopNav';
import KindNotifications from './KindNotifications';

// مسیرهایی که ناوبری نباید نمایش داده شود
const HIDDEN_PREFIXES = ['/login', '/register', '/reset-password', '/admin'];

export default function AppChrome() {
  const pathname = usePathname() || '/';
  const hidden = HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));

  if (hidden) return null;

  return (
    <>
      <TopNav />
      <KindNotifications />
    </>
  );
}
