import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/users/api/userApi');
vi.mock('@/helpers/toolsHelper', () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  showWarningDialog: vi.fn(),
}));

import { showWarningDialog } from '@/helpers/toolsHelper';
import * as userApi from '@/features/users/api/userApi';
import ProfilePage from '@/features/users/pages/ProfilePage';
import { fail, makeUser, ok, renderWithProviders } from '@/test-utils';

const png = new File(['x'], 'foto.png', { type: 'image/png' });

function setup(profile = makeUser()) {
  return renderWithProviders(<ProfilePage />, { profile, isProfile: true });
}

async function fillPasswords(current: string, next: string, confirm: string) {
  if (current) await userEvent.type(screen.getByLabelText('Kata sandi saat ini'), current);
  if (next) await userEvent.type(screen.getByLabelText('Kata sandi baru'), next);
  if (confirm) await userEvent.type(screen.getByLabelText('Ulangi kata sandi baru'), confirm);
  await userEvent.click(screen.getByRole('button', { name: 'Ubah kata sandi' }));
}

describe('ProfilePage - informasi akun', () => {
  beforeEach(() => vi.clearAllMocks());

  it('menampilkan data profil aktif', () => {
    setup();
    expect(screen.getByLabelText('Nama lengkap')).toHaveValue('Stiy Del');
    expect(screen.getByLabelText('Email')).toHaveValue('ifs24018@del.ac.id');
  });

  it('memakai nilai kosong bila profil belum ada', () => {
    renderWithProviders(<ProfilePage />);
    expect(screen.getByLabelText('Nama lengkap')).toHaveValue('');
  });

  it('menolak data tidak valid', async () => {
    setup();
    await userEvent.clear(screen.getByLabelText('Nama lengkap'));
    await userEvent.click(screen.getByRole('button', { name: 'Simpan perubahan' }));
    expect(showWarningDialog).toHaveBeenCalledWith('Nama dan email yang valid wajib diisi.');
    expect(userApi.updateProfile).not.toHaveBeenCalled();
  });

  it('menyimpan perubahan profil', async () => {
    vi.mocked(userApi.updateProfile).mockResolvedValue(
      ok({ user: makeUser({ name: 'Nama Baru' }) }, 'Berhasil mengubah data'),
    );
    const { store } = setup();
    await userEvent.clear(screen.getByLabelText('Nama lengkap'));
    await userEvent.type(screen.getByLabelText('Nama lengkap'), 'Nama Baru');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan perubahan' }));
    await waitFor(() => expect(store.getState().profile?.name).toBe('Nama Baru'));
    expect(userApi.updateProfile).toHaveBeenCalledWith('Nama Baru', 'ifs24018@del.ac.id');
  });
});

describe('ProfilePage - foto profil', () => {
  beforeEach(() => vi.clearAllMocks());

  it('meminta memilih foto', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Unggah foto' }));
    expect(showWarningDialog).toHaveBeenCalledWith('Pilih foto profil terlebih dahulu.');
  });

  it('menolak berkas non-gambar', () => {
    setup();
    const pdf = new File(['x'], 'a.pdf', { type: 'application/pdf' });
    fireEvent.change(screen.getByLabelText('Pilih foto baru'), { target: { files: [pdf] } });
    expect(showWarningDialog).toHaveBeenCalledWith('Berkas harus berupa gambar (JPG, PNG, atau WEBP).');
  });

  it('mengunggah foto lalu mengosongkan input; boleh batal memilih', async () => {
    vi.mocked(userApi.changeProfilePhoto).mockResolvedValue(ok(undefined, 'Berhasil'));
    vi.mocked(userApi.getProfile).mockResolvedValue(ok({ user: makeUser({ photo: 'img/p.png' }) }));
    setup();
    const input = screen.getByLabelText('Pilih foto baru') as HTMLInputElement;
    await userEvent.upload(input, png);
    await userEvent.upload(input, []);
    await userEvent.click(screen.getByRole('button', { name: 'Unggah foto' }));
    expect(showWarningDialog).toHaveBeenCalledTimes(1);

    await userEvent.upload(screen.getByLabelText('Pilih foto baru'), png);
    await userEvent.click(screen.getByRole('button', { name: 'Unggah foto' }));
    await waitFor(() => expect(userApi.changeProfilePhoto).toHaveBeenCalledWith(png));
    await waitFor(() => expect((screen.getByLabelText('Pilih foto baru') as HTMLInputElement).value).toBe(''));
  });

  it('gagal unggah mempertahankan pilihan', async () => {
    vi.mocked(userApi.changeProfilePhoto).mockResolvedValue(fail());
    setup();
    await userEvent.upload(screen.getByLabelText('Pilih foto baru'), png);
    await userEvent.click(screen.getByRole('button', { name: 'Unggah foto' }));
    await waitFor(() => expect(userApi.changeProfilePhoto).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByRole('button', { name: 'Unggah foto' })).toBeEnabled());
  });
});

describe('ProfilePage - kata sandi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('validasi kolom kosong / pendek', async () => {
    setup();
    await fillPasswords('lama', '123', '123');
    expect(showWarningDialog).toHaveBeenCalledWith(
      'Isi kata sandi saat ini dan kata sandi baru (minimal 6 karakter).',
    );
  });

  it('validasi kata sandi saat ini kosong', async () => {
    setup();
    await fillPasswords('', 'rahasia1', 'rahasia1');
    expect(showWarningDialog).toHaveBeenCalledTimes(1);
  });

  it('validasi konfirmasi berbeda', async () => {
    setup();
    await fillPasswords('lama', 'rahasia1', 'rahasia2');
    expect(showWarningDialog).toHaveBeenCalledWith('Konfirmasi kata sandi baru tidak sama.');
    expect(userApi.changeProfilePassword).not.toHaveBeenCalled();
  });

  it('sukses mengosongkan formulir', async () => {
    vi.mocked(userApi.changeProfilePassword).mockResolvedValue(ok(undefined, 'Berhasil mengubah kata sandi'));
    setup();
    await fillPasswords('lama', 'rahasia1', 'rahasia1');
    await waitFor(() => expect(screen.getByLabelText('Kata sandi baru')).toHaveValue(''));
    expect(userApi.changeProfilePassword).toHaveBeenCalledWith('lama', 'rahasia1', 'rahasia1');
  });

  it('gagal mempertahankan isian', async () => {
    vi.mocked(userApi.changeProfilePassword).mockResolvedValue(fail('Kata sandi salah'));
    setup();
    await fillPasswords('lama', 'rahasia1', 'rahasia1');
    await waitFor(() => expect(userApi.changeProfilePassword).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByRole('button', { name: 'Ubah kata sandi' })).toBeEnabled());
    expect(screen.getByLabelText('Kata sandi baru')).toHaveValue('rahasia1');
  });
});
