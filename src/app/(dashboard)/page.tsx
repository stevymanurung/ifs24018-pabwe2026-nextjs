import { Suspense } from 'react';
import type { Metadata } from 'next';
import Spinner from '@/components/Spinner';
import HomePage from '@/features/posts/pages/HomePage';

export const metadata: Metadata = {
  title: 'Linimasa Postingan',
  description: 'Lihat linimasa postingan terbaru dari semua pengguna Ruang Post.',
};

export default function Page() {
  return (
    <Suspense fallback={<Spinner label="Memuat postingan..." />}>
      <HomePage />
    </Suspense>
  );
}
