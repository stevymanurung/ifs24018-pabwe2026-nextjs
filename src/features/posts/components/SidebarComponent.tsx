'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { FiFileText, FiGrid, FiUser, FiUsers } from 'react-icons/fi';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const ITEMS = [
  { href: '/', label: 'Semua Postingan', icon: FiGrid, match: 'all' },
  { href: '/?filter=me', label: 'Postingan Saya', icon: FiFileText, match: 'me' },
  { href: '/users', label: 'Daftar Pengguna', icon: FiUsers, match: '/users' },
  { href: '/profile', label: 'Profil Saya', icon: FiUser, match: '/profile' },
] as const;

export default function SidebarComponent({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const isMe = useSearchParams().get('filter') === 'me';

  function isActive(match: string) {
    if (match === 'all') return pathname === '/' && !isMe;
    if (match === 'me') return pathname === '/' && isMe;
    return pathname.startsWith(match);
  }

  return (
    <>
      {open && (
        <div
          aria-hidden="true"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
        />
      )}
      <aside
        id="sidebar-drawer"
        aria-label="Menu samping"
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-line bg-white p-4 pt-20 transition-transform lg:sticky lg:top-16 lg:z-0 lg:h-[calc(100dvh-4rem)] lg:translate-x-0 lg:pt-6 lg:visible ${
          open ? 'visible translate-x-0' : 'invisible -translate-x-full'
        }`}
      >
        <nav aria-label="Navigasi utama">
          <ul className="space-y-1">
            {ITEMS.map(({ href, label, icon: Icon, match }) => {
              const active = isActive(match);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onClose}
                    aria-current={active ? 'page' : undefined}
                    className={`btn w-full justify-start ${
                      active ? 'bg-brand-soft text-brand-dark' : 'btn-ghost'
                    }`}
                  >
                    <Icon aria-hidden="true" className="size-5" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
