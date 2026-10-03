import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/auth/api/authApi');
vi.mock('@/helpers/toolsHelper', () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  showWarningDialog: vi.fn(),
}));

import { getAccessToken } from '@/helpers/apiHelper';
import { showWarningDialog } from '@/helpers/toolsHelper';
import { loginUser } from '@/features/auth/api/authApi';
import LoginPage from '@/features/auth/pages/LoginPage';
import { routerMock } from '@/navigationMock';
import { fail, makeUser, ok, renderWithProviders } from '@/test-utils';

async function fillAndSubmit(email: string, password: string) {
  if (email) await userEvent.type(document.querySelector('#login-email-input')!, email);
  if (password) await userEvent.type(document.querySelector('#login-password-input')!, password);
  await userEvent.click(document.querySelector('#login-submit-button')!);
}

describe('LoginPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('menyediakan elemen dengan selector wajib', () => {
    renderWithProviders(<LoginPage />);
    expect(document.querySelector('#login-email-input')).toBeInTheDocument();
    expect(document.querySelector('#login-password-input')).toBeInTheDocument();
    expect(document.querySelector('#login-submit-button')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Daftar akun baru' })).toHaveAttribute('href', '/auth/register');
  });

  it('memperingatkan bila email tidak valid atau sandi kosong', async () => {
    renderWithProviders(<LoginPage />);
    await fillAndSubmit('bukan-email', 'rahasia');
    await fillAndSubmit('', '');
    expect(showWarningDialog).toHaveBeenCalledTimes(2);
    expect(loginUser).not.toHaveBeenCalled();
  });

  it('login sukses menyimpan token dan menuju dashboard', async () => {
    vi.mocked(loginUser).mockResolvedValue(ok({ user: makeUser(), token: 'tok-9' }));
    renderWithProviders(<LoginPage />);
    await fillAndSubmit('a@b.co', 'rahasia');
    await waitFor(() => expect(routerMock.replace).toHaveBeenCalledWith('/'));
    expect(getAccessToken()).toBe('tok-9');
    expect(loginUser).toHaveBeenCalledWith('a@b.co', 'rahasia');
  });

  it('login gagal tidak berpindah halaman', async () => {
    vi.mocked(loginUser).mockResolvedValue(fail('Kredensial akun tidak ditemukan'));
    renderWithProviders(<LoginPage />);
    await fillAndSubmit('a@b.co', 'rahasia');
    await waitFor(() => expect(loginUser).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByRole('button', { name: 'Masuk' })).toBeEnabled());
    expect(routerMock.replace).not.toHaveBeenCalled();
  });
});
