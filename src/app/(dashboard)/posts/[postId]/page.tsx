import type { Metadata } from 'next';
import DetailPage from '@/features/posts/pages/DetailPage';

export const metadata: Metadata = {
  title: 'Detail Postingan',
  description: 'Baca detail postingan, beri suka, dan tulis komentar.',
};

export default function Page() {
  return <DetailPage />;
}
