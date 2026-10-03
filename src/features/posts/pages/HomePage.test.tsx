import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/posts/api/postApi');
vi.mock('@/helpers/toolsHelper', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/helpers/toolsHelper')>()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  showWarningDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
}));

import { showConfirmDialog } from '@/helpers/toolsHelper';
import * as api from '@/features/posts/api/postApi';
import HomePage from '@/features/posts/pages/HomePage';
import { navState, routerMock } from '@/navigationMock';
import { fail, makePost, makeUser, ok, renderWithProviders } from '@/test-utils';

const posts = [
  makePost({ id: 1, description: 'Belajar React', author: { name: 'Ani', photo: null }, likes: [1], comments: [3] }),
  makePost({ id: 2, description: 'Makan siang', author: { name: 'Budi', photo: null }, cover: null }),
];

const renderHome = (withProfile = true) =>
  renderWithProviders(<HomePage />, withProfile ? { profile: makeUser({ id: 1 }) } : undefined);

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getPosts).mockResolvedValue(ok({ posts }));
  });

  it('memuat dan menampilkan kartu postingan publik', async () => {
    renderHome();
    expect(screen.getByRole('status')).toHaveTextContent('Memuat postingan...');
    expect(await screen.findByText('Belajar React')).toBeInTheDocument();
    expect(api.getPosts).toHaveBeenCalledWith(false);
    expect(screen.getByRole('heading', { level: 1, name: 'Semua Postingan' })).toBeInTheDocument();
    expect(screen.getByText('Tanpa cover')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /1 suka/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('link', { name: 'Lihat detail postingan Ani' })).toHaveAttribute('href', '/posts/1');
    expect(screen.queryByText('Hapus semua postingan saya')).not.toBeInTheDocument();
  });

  it('live search memfilter dan menampilkan keadaan tanpa hasil', async () => {
    renderHome();
    await screen.findByText('Belajar React');
    await userEvent.type(screen.getByLabelText('Cari postingan'), 'budi');
    expect(screen.queryByText('Belajar React')).not.toBeInTheDocument();
    expect(screen.getByText('Makan siang')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Cari postingan'), 'xyz');
    expect(screen.getByText('Tidak ada postingan yang cocok dengan pencarian Anda.')).toBeInTheDocument();
  });

  it('keadaan kosong tanpa postingan, juga tanpa profil', async () => {
    vi.mocked(api.getPosts).mockResolvedValue(ok({ posts: [] }));
    renderHome(false);
    expect(await screen.findByText(/Belum ada postingan di sini/)).toBeInTheDocument();
  });

  it('tanpa profil, tidak ada postingan yang ditandai disukai', async () => {
    renderHome(false);
    await screen.findByText('Belajar React');
    expect(screen.getAllByRole('button', { name: /suka/ }).every((b) => b.getAttribute('aria-pressed') === 'false')).toBe(true);
  });

  it('filter postingan saya memakai is_me dan menampilkan aksi hapus semua', async () => {
    navState.search = 'filter=me';
    renderHome();
    expect(await screen.findByRole('heading', { level: 1, name: 'Postingan Saya' })).toBeInTheDocument();
    expect(api.getPosts).toHaveBeenCalledWith(true);
    expect(screen.getByRole('link', { name: 'Milik saya' })).toHaveAttribute('aria-current', 'page');
    expect(await screen.findByText('Hapus semua postingan saya')).toBeInTheDocument();
  });

  it('memberi suka lalu menyegarkan daftar; membatalkan suka bila sudah suka', async () => {
    vi.mocked(api.likePost).mockResolvedValue(ok());
    renderHome();
    await screen.findByText('Belajar React');
    await userEvent.click(screen.getByRole('button', { name: /0 suka/ }));
    await waitFor(() => expect(api.likePost).toHaveBeenCalledWith(2, true));
    await userEvent.click(screen.getByRole('button', { name: /1 suka/ }));
    await waitFor(() => expect(api.likePost).toHaveBeenCalledWith(1, false));
    expect(vi.mocked(api.getPosts).mock.calls.length).toBeGreaterThanOrEqual(3);
  });

  it('menghapus semua postingan setelah konfirmasi', async () => {
    navState.search = 'filter=me';
    vi.mocked(showConfirmDialog).mockResolvedValue(true);
    vi.mocked(api.deleteAllPosts).mockResolvedValue(ok());
    renderHome();
    await userEvent.click(await screen.findByText('Hapus semua postingan saya'));
    await waitFor(() => expect(api.deleteAllPosts).toHaveBeenCalled());
    await waitFor(() => expect(vi.mocked(api.getPosts).mock.calls.length).toBeGreaterThanOrEqual(2));
  });

  it('hapus semua dibatalkan atau gagal tidak memuat ulang', async () => {
    navState.search = 'filter=me';
    renderHome();
    const button = await screen.findByText('Hapus semua postingan saya');

    vi.mocked(showConfirmDialog).mockResolvedValue(false);
    await userEvent.click(button);
    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalledTimes(1));
    expect(api.deleteAllPosts).not.toHaveBeenCalled();

    vi.mocked(showConfirmDialog).mockResolvedValue(true);
    vi.mocked(api.deleteAllPosts).mockResolvedValue(fail());
    const callsBefore = vi.mocked(api.getPosts).mock.calls.length;
    await userEvent.click(button);
    await waitFor(() => expect(api.deleteAllPosts).toHaveBeenCalled());
    expect(vi.mocked(api.getPosts).mock.calls.length).toBe(callsBefore);
  });

  it('tambah postingan: buka modal, tutup, lalu berhasil menuju detail', async () => {
    vi.mocked(api.addPost).mockResolvedValue(ok({ post_id: 55 }, 'Berhasil menambahkan data'));
    renderHome();
    await screen.findByText('Belajar React');

    await userEvent.click(screen.getByRole('button', { name: 'Tambah Postingan' }));
    expect(screen.getByRole('dialog', { name: 'Tambah Postingan' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Tambah Postingan' }));
    await userEvent.type(screen.getByLabelText('Deskripsi'), 'Postingan baru');
    await userEvent.click(screen.getByRole('button', { name: 'Publikasikan' }));
    await waitFor(() => expect(routerMock.push).toHaveBeenCalledWith('/posts/55'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
