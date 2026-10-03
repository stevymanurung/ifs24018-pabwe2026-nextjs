import { screen, waitFor, within } from '@testing-library/react';
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

import { showConfirmDialog, showWarningDialog } from '@/helpers/toolsHelper';
import * as api from '@/features/posts/api/postApi';
import DetailPage from '@/features/posts/pages/DetailPage';
import { navState, routerMock } from '@/navigationMock';
import { fail, makePostDetail, makeUser, ok, renderWithProviders } from '@/test-utils';

const myComment = { id: 7, comment: 'Komentar saya', created_at: '2026-10-02T04:00:00Z', updated_at: '2026-10-02T04:00:00Z' };
const otherComment = { id: 8, comment: 'Komentar orang lain', created_at: '2026-10-02T05:00:00Z', updated_at: '2026-10-02T05:00:00Z' };

const ownerPost = () =>
  makePostDetail({
    id: 10,
    user_id: 1,
    likes: [1],
    comments: [myComment, otherComment],
    my_comment: myComment,
    author: { name: 'Stiy', photo: 'img/profile/s.png' },
  });

function renderDetail(post = ownerPost(), withProfile = true) {
  vi.mocked(api.getPost).mockResolvedValue(ok({ post }));
  return renderWithProviders(<DetailPage />, withProfile ? { profile: makeUser({ id: 1 }) } : undefined);
}

describe('DetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navState.params = { postId: '10' };
  });

  it('menampilkan detail lengkap milik sendiri beserta aksi pemilik', async () => {
    renderDetail();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(await screen.findByText('Belajar Next.js itu seru')).toBeInTheDocument();
    expect(api.getPost).toHaveBeenCalledWith(10);
    expect(screen.getByRole('heading', { level: 1, name: /Detail postingan dari Stiy/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /1 suka/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Ubah cover' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ubah postingan' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hapus postingan' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Komentar (2)' })).toBeInTheDocument();
    expect(screen.getByText(/Komentar Anda/)).toBeInTheDocument();
    expect(screen.getByText('Komentar orang lain')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Hapus komentar saya' })).toHaveLength(1);
  });

  it('postingan orang lain tanpa cover/komentar: tanpa aksi pemilik, bisa suka', async () => {
    vi.mocked(api.likePost).mockResolvedValue(ok());
    renderDetail(makePostDetail({ user_id: 99, cover: null, comments: [], my_comment: undefined }));
    expect(await screen.findByText('Tanpa cover')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ubah cover' })).not.toBeInTheDocument();
    expect(screen.getByText('Belum ada komentar. Mulailah percakapan!')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /0 suka/ }));
    await waitFor(() => expect(api.likePost).toHaveBeenCalledWith(10, true));
  });

  it('membatalkan suka bila sudah suka', async () => {
    vi.mocked(api.likePost).mockResolvedValue(ok());
    renderDetail();
    await userEvent.click(await screen.findByRole('button', { name: /1 suka/ }));
    await waitFor(() => expect(api.likePost).toHaveBeenCalledWith(10, false));
  });

  it('tanpa profil, tidak ada yang dianggap milik sendiri', async () => {
    renderDetail(ownerPost(), false);
    await screen.findByText('Belajar Next.js itu seru');
    expect(screen.queryByRole('button', { name: 'Hapus postingan' })).not.toBeInTheDocument();
  });

  it('menampilkan pesan bila postingan tidak ditemukan', async () => {
    vi.mocked(api.getPost).mockResolvedValue(fail('Data tidak valid'));
    renderWithProviders(<DetailPage />, { profile: makeUser() });
    expect(await screen.findByRole('heading', { name: 'Postingan tidak ditemukan' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Kembali ke linimasa' })).toHaveAttribute('href', '/');
  });

  it('hapus postingan: batal, gagal, lalu sukses menuju beranda', async () => {
    renderDetail();
    const button = await screen.findByRole('button', { name: 'Hapus postingan' });

    vi.mocked(showConfirmDialog).mockResolvedValue(false);
    await userEvent.click(button);
    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalledTimes(1));
    expect(api.deletePost).not.toHaveBeenCalled();

    vi.mocked(showConfirmDialog).mockResolvedValue(true);
    vi.mocked(api.deletePost).mockResolvedValue(fail());
    await userEvent.click(button);
    await waitFor(() => expect(api.deletePost).toHaveBeenCalledTimes(1));
    expect(routerMock.replace).not.toHaveBeenCalled();

    vi.mocked(api.deletePost).mockResolvedValue(ok(undefined, 'Berhasil menghapus data'));
    await userEvent.click(button);
    await waitFor(() => expect(routerMock.replace).toHaveBeenCalledWith('/'));
  });

  it('komentar: validasi kosong, gagal, lalu sukses mengosongkan kolom', async () => {
    renderDetail();
    const submit = await screen.findByRole('button', { name: 'Kirim komentar' });
    await userEvent.click(submit);
    expect(showWarningDialog).toHaveBeenCalledWith('Komentar tidak boleh kosong.');

    await userEvent.type(screen.getByLabelText('Tulis komentar'), ' Mantap ');
    vi.mocked(api.addComment).mockResolvedValue(fail());
    await userEvent.click(submit);
    await waitFor(() => expect(api.addComment).toHaveBeenCalledWith(10, 'Mantap'));
    expect(screen.getByLabelText('Tulis komentar')).toHaveValue(' Mantap ');

    vi.mocked(api.addComment).mockResolvedValue(ok());
    await userEvent.click(submit);
    await waitFor(() => expect(screen.getByLabelText('Tulis komentar')).toHaveValue(''));
  });

  it('hapus komentar: batal, lalu sukses menyegarkan', async () => {
    renderDetail();
    const button = await screen.findByRole('button', { name: 'Hapus komentar saya' });

    vi.mocked(showConfirmDialog).mockResolvedValue(false);
    await userEvent.click(button);
    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalledTimes(1));
    expect(api.deleteComment).not.toHaveBeenCalled();

    vi.mocked(showConfirmDialog).mockResolvedValue(true);
    vi.mocked(api.deleteComment).mockResolvedValue(ok());
    await userEvent.click(button);
    await waitFor(() => expect(api.deleteComment).toHaveBeenCalledWith(10));
    await waitFor(() => expect(vi.mocked(api.getPost).mock.calls.length).toBeGreaterThanOrEqual(2));
  });

  it('hapus komentar gagal tidak menyegarkan', async () => {
    renderDetail();
    const button = await screen.findByRole('button', { name: 'Hapus komentar saya' });
    vi.mocked(showConfirmDialog).mockResolvedValue(true);
    vi.mocked(api.deleteComment).mockResolvedValue(fail());
    const before = vi.mocked(api.getPost).mock.calls.length;
    await userEvent.click(button);
    await waitFor(() => expect(api.deleteComment).toHaveBeenCalled());
    expect(vi.mocked(api.getPost).mock.calls.length).toBe(before);
  });

  it('ubah postingan: modal terbuka, ditutup, lalu disimpan dan data disegarkan', async () => {
    vi.mocked(api.changePost).mockResolvedValue(ok(undefined, 'Berhasil mengubah data'));
    renderDetail();
    await userEvent.click(await screen.findByRole('button', { name: 'Ubah postingan' }));
    let dialog = screen.getByRole('dialog', { name: 'Ubah Postingan' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Batal' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Ubah postingan' }));
    dialog = screen.getByRole('dialog', { name: 'Ubah Postingan' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Simpan Perubahan' }));
    await waitFor(() => expect(api.changePost).toHaveBeenCalledWith(10, 'Belajar Next.js itu seru'));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('ubah cover: modal terbuka, ditutup, lalu diunggah', async () => {
    vi.mocked(api.changePostCover).mockResolvedValue(ok(undefined, 'Berhasil mengubah cover'));
    renderDetail();
    await userEvent.click(await screen.findByRole('button', { name: 'Ubah cover' }));
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Batal' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Ubah cover' }));
    const file = new File(['x'], 'c.png', { type: 'image/png' });
    await userEvent.upload(screen.getByLabelText('Pilih gambar'), file);
    await userEvent.click(screen.getByRole('button', { name: 'Unggah Cover' }));
    await waitFor(() => expect(api.changePostCover).toHaveBeenCalledWith(10, file));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
