'use client';

import { usePathname } from 'next/navigation';
import BottomNav from './BottomNav';
import SosButton from '@/components/crisis/SosButton';

// مسیرهایی که ناوبری/SOS نباید نمایش داده شود
const HIDDEN_PREFIXES = ['/login', '/register', '/reset-password', '/admin'];

export default function AppChrome() {
  const pathname = usePathname() || '/';
  const hidden = HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));

  if (hidden) return null;

  return (
    <>
      <SosButton />
      <BottomNav />
    </>
  );
}
