import type { Metadata } from 'next';
import RegisterPage from '@/features/auth/pages/RegisterPage';

export const metadata: Metadata = {
  title: 'Daftar',
  description: 'Buat akun Ruang Post baru dan mulai membagikan postingan Anda.',
};

export default function Page() {
  return <RegisterPage />;
}
