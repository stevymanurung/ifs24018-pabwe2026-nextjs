import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/users/api/userApi');
vi.mock('@/helpers/toolsHelper', () => ({ showErrorDialog: vi.fn(), showSuccessDialog: vi.fn() }));

import { getUsers } from '@/features/users/api/userApi';
import UsersPage from '@/features/users/pages/UsersPage';
import { makeUser, ok, renderWithProviders } from '@/test-utils';

describe('UsersPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('menampilkan daftar pengguna dan mencari berdasarkan nama/email', async () => {
    vi.mocked(getUsers).mockResolvedValue(
      ok({
        users: [
          makeUser({ id: 1, name: 'Ani', email: 'ani@del.ac.id' }),
          makeUser({ id: 2, name: 'Budi', email: 'budi@del.ac.id', photo: 'img/b.png' }),
        ],
      }),
    );
    renderWithProviders(<UsersPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Daftar Pengguna' })).toBeInTheDocument();
    expect(await screen.findByText('Ani')).toBeInTheDocument();
    expect(screen.getByText('budi@del.ac.id')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Cari pengguna'), 'BUDI');
    expect(screen.queryByText('Ani')).not.toBeInTheDocument();
    expect(screen.getByText('Budi')).toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText('Cari pengguna'));
    await userEvent.type(screen.getByLabelText('Cari pengguna'), 'tidak-ada');
    expect(screen.getByText('Tidak ada pengguna yang ditemukan.')).toBeInTheDocument();
  });

  it('menampilkan keadaan kosong saat belum ada pengguna', async () => {
    vi.mocked(getUsers).mockResolvedValue(ok({ users: [] }));
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(getUsers).toHaveBeenCalled());
    expect(screen.getByText('Tidak ada pengguna yang ditemukan.')).toBeInTheDocument();
  });
});
