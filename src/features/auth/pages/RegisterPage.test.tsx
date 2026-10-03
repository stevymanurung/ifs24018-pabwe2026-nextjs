import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/auth/api/authApi');
vi.mock('@/helpers/toolsHelper', () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  showWarningDialog: vi.fn(),
}));

import { showWarningDialog } from '@/helpers/toolsHelper';
import { registerUser } from '@/features/auth/api/authApi';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import { routerMock } from '@/navigationMock';
import { fail, ok, renderWithProviders } from '@/test-utils';

async function fill(values: { name?: string; email?: string; password?: string; confirmation?: string }) {
  const { name = '', email = '', password = '', confirmation = '' } = values;
  if (name) await userEvent.type(screen.getByLabelText('Nama lengkap'), name);
  if (email) await userEvent.type(screen.getByLabelText('Email'), email);
  if (password) await userEvent.type(screen.getByLabelText('Kata sandi'), password);
  if (confirmation) await userEvent.type(screen.getByLabelText('Ulangi kata sandi'), confirmation);
  await userEvent.click(screen.getByRole('button', { name: 'Daftar' }));
}

describe('RegisterPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('menolak nama/email tidak valid', async () => {
    renderWithProviders(<RegisterPage />);
    await fill({ name: 'Budi', email: 'salah', password: 'rahasia', confirmation: 'rahasia' });
    expect(showWarningDialog).toHaveBeenCalledWith('Nama dan email yang valid wajib diisi.');
  });

  it('menolak kata sandi pendek', async () => {
    renderWithProviders(<RegisterPage />);
    await fill({ name: 'Budi', email: 'a@b.co', password: '123', confirmation: '123' });
    expect(showWarningDialog).toHaveBeenCalledWith('Kata sandi minimal 6 karakter.');
  });

  it('menolak konfirmasi yang berbeda', async () => {
    renderWithProviders(<RegisterPage />);
    await fill({ name: 'Budi', email: 'a@b.co', password: 'rahasia', confirmation: 'beda-sekali' });
    expect(showWarningDialog).toHaveBeenCalledWith('Konfirmasi kata sandi tidak sama.');
    expect(registerUser).not.toHaveBeenCalled();
  });

  it('registrasi sukses menuju halaman login', async () => {
    vi.mocked(registerUser).mockResolvedValue(ok(undefined, 'Berhasil melakukan pendaftaran'));
    renderWithProviders(<RegisterPage />);
    await fill({ name: 'Budi', email: 'a@b.co', password: 'rahasia', confirmation: 'rahasia' });
    await waitFor(() => expect(routerMock.push).toHaveBeenCalledWith('/auth/login'));
    expect(registerUser).toHaveBeenCalledWith('Budi', 'a@b.co', 'rahasia');
    expect(screen.getByRole('link', { name: 'Masuk di sini' })).toHaveAttribute('href', '/auth/login');
  });

  it('registrasi gagal tetap di halaman', async () => {
    vi.mocked(registerUser).mockResolvedValue(fail('Data tidak valid'));
    renderWithProviders(<RegisterPage />);
    await fill({ name: 'Budi', email: 'a@b.co', password: 'rahasia', confirmation: 'rahasia' });
    await waitFor(() => expect(registerUser).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByRole('button', { name: 'Daftar' })).toBeEnabled());
    expect(routerMock.push).not.toHaveBeenCalled();
  });
});
