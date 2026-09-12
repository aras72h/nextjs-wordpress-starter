import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Navigation, Footer } from '@starter/ui';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Next.js WordPress Starter',
    template: '%s | Next.js WordPress Starter',
  },
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
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
