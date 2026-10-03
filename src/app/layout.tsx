import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';
import Providers from '@/components/Providers';
import './globals.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Ruang Post', template: '%s | Ruang Post' },
  description:
    'Ruang Post adalah aplikasi postingan untuk membagikan cerita bergambar, memberi suka, dan berkomentar.',
  applicationName: 'Ruang Post',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b6b8a',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={bricolage.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
