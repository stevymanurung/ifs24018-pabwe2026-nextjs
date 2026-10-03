import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/users/api/userApi');
vi.mock('@/helpers/toolsHelper', () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
}));

import { getAccessToken, putAccessToken } from '@/helpers/apiHelper';
import { getProfile } from '@/features/users/api/userApi';
import PostLayout from '@/features/posts/layouts/PostLayout';
import { routerMock } from '@/navigationMock';
import { fail, makeUser, ok, renderWithProviders } from '@/test-utils';

describe('PostLayout', () => {
  beforeEach(() => vi.clearAllMocks());

  it('tanpa token: mengalihkan ke login dan menahan konten', () => {
    renderWithProviders(
      <PostLayout>
        <p>Rahasia</p>
      </PostLayout>,
    );
    expect(routerMock.replace).toHaveBeenCalledWith('/auth/login');
    expect(screen.queryByText('Rahasia')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Memuat sesi Anda...');
  });

  it('dengan token valid: memuat profil lalu menampilkan shell dashboard', async () => {
    putAccessToken('tok');
    vi.mocked(getProfile).mockResolvedValue(ok({ user: makeUser() }));
    renderWithProviders(
      <PostLayout>
        <p>Konten Dashboard</p>
      </PostLayout>,
    );
    expect(await screen.findByText('Konten Dashboard')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Navigasi utama' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Lewati ke konten utama' })).toHaveAttribute('href', '#main-content');
    expect(routerMock.replace).not.toHaveBeenCalled();
  });

  it('token tidak valid: token dihapus dan menuju login', async () => {
    putAccessToken('kedaluwarsa');
    vi.mocked(getProfile).mockResolvedValue(fail('Unauthenticated.'));
    renderWithProviders(<PostLayout>x</PostLayout>);
    await waitFor(() => expect(routerMock.replace).toHaveBeenCalledWith('/auth/login'));
    expect(getAccessToken()).toBeNull();
  });

  it('drawer mobile dibuka lewat navbar dan ditutup lewat sidebar', async () => {
    putAccessToken('tok');
    vi.mocked(getProfile).mockResolvedValue(ok({ user: makeUser() }));
    renderWithProviders(<PostLayout>isi</PostLayout>);
    await screen.findByText('isi');

    const drawer = screen.getByRole('complementary', { name: 'Menu samping' });
    expect(drawer).toHaveClass('invisible');
    await userEvent.click(screen.getByRole('button', { name: 'Buka menu navigasi' }));
    expect(drawer).toHaveClass('visible');
    await userEvent.click(screen.getByRole('link', { name: 'Daftar Pengguna' }));
    expect(drawer).toHaveClass('invisible');
  });
});
