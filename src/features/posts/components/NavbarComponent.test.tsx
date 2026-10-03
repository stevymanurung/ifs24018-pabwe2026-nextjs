import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/auth/api/authApi');
vi.mock('@/helpers/toolsHelper', () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
}));

import { getAccessToken, putAccessToken } from '@/helpers/apiHelper';
import { showConfirmDialog } from '@/helpers/toolsHelper';
import { logoutUser } from '@/features/auth/api/authApi';
import NavbarComponent from '@/features/posts/components/NavbarComponent';
import { routerMock } from '@/navigationMock';
import { makeUser, ok, renderWithProviders } from '@/test-utils';

describe('NavbarComponent', () => {
  beforeEach(() => vi.clearAllMocks());

  it('menampilkan identitas profil aktif dan menu akun', async () => {
    renderWithProviders(<NavbarComponent onMenuClick={vi.fn()} />, { profile: makeUser() });
    expect(screen.getByText('Stiy Del')).toBeInTheDocument();
    expect(screen.queryByText('ifs24018@del.ac.id')).not.toBeInTheDocument();

    const toggle = screen.getByRole('button', { name: 'Menu akun Stiy Del' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('ifs24018@del.ac.id')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Profil Saya' })).toHaveAttribute('href', '/profile');

    await userEvent.click(screen.getByRole('link', { name: 'Profil Saya' }));
    expect(screen.queryByText('ifs24018@del.ac.id')).not.toBeInTheDocument();
  });

  it('tombol hamburger memanggil onMenuClick', async () => {
    const onMenuClick = vi.fn();
    renderWithProviders(<NavbarComponent onMenuClick={onMenuClick} />, { profile: makeUser() });
    await userEvent.click(screen.getByRole('button', { name: 'Buka menu navigasi' }));
    expect(onMenuClick).toHaveBeenCalled();
  });

  it('logout dikonfirmasi: token dihapus dan menuju login', async () => {
    putAccessToken('tok');
    vi.mocked(showConfirmDialog).mockResolvedValue(true);
    vi.mocked(logoutUser).mockResolvedValue(ok(undefined, 'Berhasil logout'));
    const { store } = renderWithProviders(<NavbarComponent onMenuClick={vi.fn()} />, {
      profile: makeUser(),
      isProfile: true,
    });
    await userEvent.click(screen.getByRole('button', { name: 'Menu akun Stiy Del' }));
    await userEvent.click(screen.getByRole('button', { name: 'Keluar' }));
    await waitFor(() => expect(routerMock.replace).toHaveBeenCalledWith('/auth/login'));
    expect(getAccessToken()).toBeNull();
    expect(store.getState().profile).toBeNull();
  });

  it('logout dibatalkan tidak melakukan apa pun', async () => {
    putAccessToken('tok');
    vi.mocked(showConfirmDialog).mockResolvedValue(false);
    renderWithProviders(<NavbarComponent onMenuClick={vi.fn()} />, { profile: makeUser() });
    await userEvent.click(screen.getByRole('button', { name: 'Menu akun Stiy Del' }));
    await userEvent.click(screen.getByRole('button', { name: 'Keluar' }));
    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalled());
    expect(logoutUser).not.toHaveBeenCalled();
    expect(getAccessToken()).toBe('tok');
    expect(routerMock.replace).not.toHaveBeenCalled();
  });

  it('tetap tampil saat profil belum tersedia', async () => {
    renderWithProviders(<NavbarComponent onMenuClick={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Menu akun' })).toBeInTheDocument();
  });
});
