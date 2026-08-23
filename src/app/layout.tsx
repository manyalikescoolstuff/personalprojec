import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

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

export const metadata: Metadata = {
  title: 'GetDone // Personal AI Command Center',
  description: 'A calm, minimal, and intelligent personal AI command center for managing tasks, schedules, brain dumps, and daily priorities.',
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
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
