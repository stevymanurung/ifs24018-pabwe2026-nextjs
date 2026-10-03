import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SidebarComponent from '@/features/posts/components/SidebarComponent';
import { navState } from '@/navigationMock';

function current() {
  return screen
    .getAllByRole('link')
    .filter((link) => link.getAttribute('aria-current') === 'page')
    .map((link) => link.textContent);
}

describe('SidebarComponent', () => {
  it('menampilkan empat rute utama', () => {
    render(<SidebarComponent open={false} onClose={vi.fn()} />);
    expect(screen.getByRole('navigation', { name: 'Navigasi utama' })).toBeInTheDocument();
    expect(screen.getAllByRole('link').map((l) => l.textContent)).toEqual([
      'Semua Postingan',
      'Postingan Saya',
      'Daftar Pengguna',
      'Profil Saya',
    ]);
    expect(screen.getByRole('complementary', { name: 'Menu samping' })).toHaveClass('invisible');
  });

  it.each([
    ['/', '', 'Semua Postingan'],
    ['/', 'filter=me', 'Postingan Saya'],
    ['/users', '', 'Daftar Pengguna'],
    ['/profile', '', 'Profil Saya'],
  ])('menandai rute aktif untuk %s?%s', (pathname, search, label) => {
    navState.pathname = pathname;
    navState.search = search;
    render(<SidebarComponent open={false} onClose={vi.fn()} />);
    expect(current()).toEqual([label]);
  });

  it('drawer terbuka: overlay dan link menutup drawer', async () => {
    const onClose = vi.fn();
    const { container } = render(<SidebarComponent open onClose={onClose} />);
    expect(screen.getByRole('complementary', { name: 'Menu samping' })).toHaveClass('visible');

    await userEvent.click(container.querySelector('[aria-hidden="true"].fixed')!);
    expect(onClose).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole('link', { name: 'Daftar Pengguna' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
