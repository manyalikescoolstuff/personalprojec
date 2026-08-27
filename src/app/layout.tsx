import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { PwaProvider } from '@/components/pwa/PwaProvider';

const hangyabolyFont = localFont({
  src: '../../public/fonts/Hangyaboly.ttf',
  variable: '--font-hangyaboly',
  display: 'swap',
});

const interFont = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#132A13',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'GetDone // Personal AI Command Center',
  description:
    'A calm, minimal, and intelligent personal AI command center for managing tasks, academic libraries, schedules, and creative ideas.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GetDone',
  },
  icons: {
    icon: '/icons/icon.svg',
    shortcut: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${hangyabolyFont.variable} ${interFont.variable} dark`}
      suppressHydrationWarning
    >
      <body className="bg-[#0A0F0D] text-[#F3F4F1] min-h-screen flex flex-col antialiased selection:bg-[#1E2E23] selection:text-[#9ED8A3]">
        <AppProvider>
          <PwaProvider>{children}</PwaProvider>
        </AppProvider>
      </body>
    </html>
  );
}
