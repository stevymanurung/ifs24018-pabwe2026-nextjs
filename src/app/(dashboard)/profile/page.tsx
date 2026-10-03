import type { Metadata } from 'next';
import ProfilePage from '@/features/users/pages/ProfilePage';

export const metadata: Metadata = {
  title: 'Profil Saya',
  description: 'Kelola profil, foto, dan kata sandi akun Ruang Post Anda.',
};

export default function Page() {
  return <ProfilePage />;
}
