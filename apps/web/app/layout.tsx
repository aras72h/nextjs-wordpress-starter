import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Next.js WordPress Starter',
  description:
    'A production-ready Next.js 15 + headless WordPress monorepo starter with Docker, CI/CD, and shadcn/ui.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-background text-text-primary`}>
        {children}
      </body>
    </html>
  );
}
