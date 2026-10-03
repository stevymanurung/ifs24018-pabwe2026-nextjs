'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/helpers/apiHelper';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  // Proteksi: pengguna yang sudah punya sesi dialihkan ke dashboard.
  useEffect(() => {
    if (getAccessToken()) router.replace('/');
  }, [router]);

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside
        aria-label="Tentang Ruang Post"
        className="relative hidden flex-col justify-between overflow-hidden bg-brand-dark p-12 text-white lg:flex"
      >
        <p className="text-2xl font-extrabold tracking-tight">Ruang Post</p>
        <svg
          aria-hidden="true"
          viewBox="0 0 320 220"
          className="absolute -right-10 top-1/4 w-[28rem] opacity-90"
        >
          <rect x="40" y="10" width="220" height="130" rx="18" fill="#0b6b8a" />
          <rect x="20" y="50" width="220" height="130" rx="18" fill="#e1f0f5" />
          <circle cx="52" cy="82" r="14" fill="#0b6b8a" />
          <rect x="76" y="72" width="90" height="8" rx="4" fill="#08536b" />
          <rect x="76" y="88" width="60" height="6" rx="3" fill="#7fb4c6" />
          <rect x="38" y="116" width="170" height="8" rx="4" fill="#7fb4c6" />
          <rect x="38" y="134" width="120" height="8" rx="4" fill="#7fb4c6" />
        </svg>
        <div className="relative max-w-md">
          <p className="text-5xl font-extrabold leading-[1.05] tracking-tight">
            Ceritakan harimu, sapa yang lain.
          </p>
          <p className="mt-5 text-lg text-white/90">
            Bagikan postingan bergambar, beri suka, dan balas komentar teman-temanmu dalam satu
            tempat.
          </p>
        </div>
      </aside>
      <main id="main-content" className="flex items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <p className="mb-8 text-2xl font-extrabold tracking-tight text-brand-dark lg:hidden">
            Ruang Post
          </p>
          {children}
        </div>
      </main>
    </div>
  );
}
