import './globals.css';

import localFont from 'next/font/local';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import AppChrome from '@/components/layout/AppChrome';

const vazir = localFont({
  src: '../fonts/Vazir.ttf',
  variable: '--font-vazir',
  display: 'swap',
});

export const metadata = {
  title: 'آرامینا | همراه درمان تروما',
  description: 'اپلیکیشن همراه درمان تروما و PTSD با تست PCL-5، تمرین‌ها و دفترچه‌ی روزانه',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" className={vazir.variable}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <ToastProvider>
            {children}
            <AppChrome />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
