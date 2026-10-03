import '@testing-library/jest-dom/vitest';
import { createElement } from 'react';
import { afterEach, vi } from 'vitest';
import { resetNavigation } from '@/navigationMock';

vi.mock('next/navigation', async () => {
  const nav = await import('@/navigationMock');
  return {
    useRouter: () => nav.routerMock,
    usePathname: () => nav.navState.pathname,
    useParams: () => nav.navState.params,
    useSearchParams: () => new URLSearchParams(nav.navState.search),
  };
});

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    onClick,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  }) =>
    createElement(
      'a',
      {
        href,
        onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
          onClick?.(event);
          event.preventDefault(); // cegah navigasi jsdom
        },
        ...rest,
      },
      children,
    ),
}));

Object.defineProperty(URL, 'createObjectURL', { writable: true, value: vi.fn(() => 'blob:preview') });
Object.defineProperty(URL, 'revokeObjectURL', { writable: true, value: vi.fn() });

afterEach(() => {
  localStorage.clear();
  resetNavigation();
  vi.clearAllMocks();
});
