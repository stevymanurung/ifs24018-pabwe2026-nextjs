'use client';

import { Suspense, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/Spinner';
import { getAccessToken, removeAccessToken } from '@/helpers/apiHelper';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { asyncReceiveProfile } from '@/features/users/states/action';
import NavbarComponent from '@/features/posts/components/NavbarComponent';
import SidebarComponent from '@/features/posts/components/SidebarComponent';

export default function PostLayout({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isProfile = useAppSelector((state) => state.isProfile);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Route guard: verifikasi token lalu muat sesi profil pengguna.
  useEffect(() => {
    if (!getAccessToken()) {
      router.replace('/auth/login');
      return;
    }
    dispatch(asyncReceiveProfile(true)).then((success) => {
      if (!success) {
        removeAccessToken();
        router.replace('/auth/login');
      }
    });
  }, [dispatch, router]);

  if (!isProfile) {
    return (
      <main id="main-content" className="min-h-dvh">
        <Spinner label="Memuat sesi Anda..." />
      </main>
    );
  }

  return (
    <div className="min-h-dvh">
      <a href="#main-content" className="skip-link">
        Lewati ke konten utama
      </a>
      <NavbarComponent onMenuClick={() => setDrawerOpen(true)} />
      <div className="mx-auto flex max-w-7xl">
        <Suspense fallback={null}>
          <SidebarComponent open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        </Suspense>
        <main id="main-content" className="min-w-0 flex-1 px-4 py-8 sm:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
