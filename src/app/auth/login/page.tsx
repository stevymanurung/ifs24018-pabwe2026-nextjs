import type { Metadata } from 'next';
import LoginPage from '@/features/auth/pages/LoginPage';

export const metadata: Metadata = {
  title: 'Masuk',
  description: 'Masuk ke akun Ruang Post untuk membaca dan membagikan postingan.',
};

export default function Page() {
  return <LoginPage />;
}
