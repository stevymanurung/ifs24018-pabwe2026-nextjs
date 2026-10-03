import { vi } from 'vitest';

/** State & mock router bersama untuk menggantikan next/navigation pada pengujian. */
export const routerMock = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

export const navState = {
  pathname: '/',
  params: {} as Record<string, string>,
  search: '',
};

export function resetNavigation(): void {
  Object.values(routerMock).forEach((fn) => fn.mockReset());
  navState.pathname = '/';
  navState.params = {};
  navState.search = '';
}
