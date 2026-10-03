import type { Metadata } from 'next';
import UsersPage from '@/features/users/pages/UsersPage';

export const metadata: Metadata = {
  title: 'Daftar Pengguna',
  description: 'Temukan dan cari pengguna yang terdaftar di Ruang Post.',
};

export default function Page() {
  return <UsersPage />;
}
