'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiLogOut, FiMenu, FiUser } from 'react-icons/fi';
import Avatar from '@/components/Avatar';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { showConfirmDialog } from '@/helpers/toolsHelper';
import { asyncLogout } from '@/features/auth/states/action';

export default function NavbarComponent({ onMenuClick }: { onMenuClick: () => void }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const profile = useAppSelector((state) => state.profile);
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    setMenuOpen(false);
    const confirmed = await showConfirmDialog('Keluar dari akun?', 'Sesi Anda akan diakhiri.');
    if (!confirmed) return;
    await dispatch(asyncLogout());
    router.replace('/auth/login');
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-8">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Buka menu navigasi"
            aria-controls="sidebar-drawer"
            onClick={onMenuClick}
            className="btn btn-ghost size-11 p-0 lg:hidden"
          >
            <FiMenu aria-hidden="true" className="size-6" />
          </button>
          <Link href="/" className="text-xl font-extrabold tracking-tight text-brand-dark">
            Ruang Post
          </Link>
        </div>

        <div className="relative">
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="account-menu"
            aria-label={`Menu akun ${profile?.name ?? ''}`}
            onClick={() => setMenuOpen((open) => !open)}
            className="btn btn-ghost gap-2 px-2"
          >
            <Avatar name={profile?.name ?? ''} photo={profile?.photo ?? null} size="sm" />
            <span className="hidden max-w-40 truncate sm:inline">{profile?.name}</span>
          </button>
          {menuOpen && (
            <div
              id="account-menu"
              className="absolute right-0 mt-2 w-60 rounded-xl border border-line bg-white p-2 shadow-lg"
            >
              <p className="truncate px-3 py-2 text-sm text-muted">{profile?.email}</p>
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="btn btn-ghost w-full justify-start"
              >
                <FiUser aria-hidden="true" className="size-4" />
                Profil Saya
              </Link>
              <button type="button" onClick={handleLogout} className="btn btn-ghost w-full justify-start">
                <FiLogOut aria-hidden="true" className="size-4" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
