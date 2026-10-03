import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/posts/api/postApi');
vi.mock('@/helpers/toolsHelper', () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  showWarningDialog: vi.fn(),
}));

import { showWarningDialog } from '@/helpers/toolsHelper';
import * as api from '@/features/posts/api/postApi';
import AddModal from '@/features/posts/components/modals/AddModal';
import ChangeCoverModal from '@/features/posts/components/modals/ChangeCoverModal';
import ChangeModal from '@/features/posts/components/modals/ChangeModal';
import { fail, ok, renderWithProviders } from '@/test-utils';

beforeEach(() => vi.clearAllMocks());

describe('AddModal', () => {
  it('menolak deskripsi kosong', async () => {
    const onAdded = vi.fn();
    renderWithProviders(<AddModal onClose={vi.fn()} onAdded={onAdded} />);
    await userEvent.click(screen.getByRole('button', { name: 'Publikasikan' }));
    expect(showWarningDialog).toHaveBeenCalledWith('Deskripsi postingan tidak boleh kosong.');
    expect(onAdded).not.toHaveBeenCalled();
  });

  it('sukses memanggil onAdded dengan id baru', async () => {
    vi.mocked(api.addPost).mockResolvedValue(ok({ post_id: 21 }, 'Berhasil menambahkan data'));
    const onAdded = vi.fn();
    renderWithProviders(<AddModal onClose={vi.fn()} onAdded={onAdded} />);
    await userEvent.type(screen.getByLabelText('Deskripsi'), '  Halo dunia  ');
    await userEvent.click(screen.getByRole('button', { name: 'Publikasikan' }));
    await waitFor(() => expect(onAdded).toHaveBeenCalledWith(21));
    expect(api.addPost).toHaveBeenCalledWith('Halo dunia');
  });

  it('gagal tidak memanggil onAdded dan Batal menutup modal', async () => {
    vi.mocked(api.addPost).mockResolvedValue(fail());
    const onAdded = vi.fn();
    const onClose = vi.fn();
    renderWithProviders(<AddModal onClose={onClose} onAdded={onAdded} />);
    await userEvent.type(screen.getByLabelText('Deskripsi'), 'Halo');
    await userEvent.click(screen.getByRole('button', { name: 'Publikasikan' }));
    await waitFor(() => expect(api.addPost).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByRole('button', { name: 'Publikasikan' })).toBeEnabled());
    expect(onAdded).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }));
    expect(onClose).toHaveBeenCalled();
  });
});

describe('ChangeModal', () => {
  const setup = () => {
    const onChanged = vi.fn();
    const onClose = vi.fn();
    renderWithProviders(
      <ChangeModal postId={5} description="Lama" onClose={onClose} onChanged={onChanged} />,
    );
    return { onChanged, onClose };
  };

  it('menampilkan deskripsi saat ini dan menolak yang kosong', async () => {
    const { onChanged } = setup();
    const field = screen.getByLabelText('Deskripsi');
    expect(field).toHaveValue('Lama');
    await userEvent.clear(field);
    await userEvent.click(screen.getByRole('button', { name: 'Simpan Perubahan' }));
    expect(showWarningDialog).toHaveBeenCalled();
    expect(onChanged).not.toHaveBeenCalled();
  });

  it('sukses menyimpan perubahan', async () => {
    vi.mocked(api.changePost).mockResolvedValue(ok(undefined, 'Berhasil mengubah data'));
    const { onChanged } = setup();
    await userEvent.type(screen.getByLabelText('Deskripsi'), ' baru');
    await userEvent.click(screen.getByRole('button', { name: 'Simpan Perubahan' }));
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(api.changePost).toHaveBeenCalledWith(5, 'Lama baru');
  });

  it('gagal tidak memanggil onChanged dan Batal menutup', async () => {
    vi.mocked(api.changePost).mockResolvedValue(fail());
    const { onChanged, onClose } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Simpan Perubahan' }));
    await waitFor(() => expect(api.changePost).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByRole('button', { name: 'Simpan Perubahan' })).toBeEnabled());
    expect(onChanged).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }));
    expect(onClose).toHaveBeenCalled();
  });
});

describe('ChangeCoverModal', () => {
  const image = new File(['x'], 'cover.png', { type: 'image/png' });
  const setup = () => {
    const onChanged = vi.fn();
    const onClose = vi.fn();
    renderWithProviders(<ChangeCoverModal postId={5} onClose={onClose} onChanged={onChanged} />);
    return { onChanged, onClose, input: screen.getByLabelText('Pilih gambar') as HTMLInputElement };
  };

  it('meminta memilih gambar terlebih dahulu', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Unggah Cover' }));
    expect(showWarningDialog).toHaveBeenCalledWith('Pilih gambar cover terlebih dahulu.');
  });

  it('menolak berkas non-gambar', () => {
    const { input } = setup();
    const pdf = new File(['x'], 'a.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [pdf] } });
    expect(showWarningDialog).toHaveBeenCalledWith('Berkas harus berupa gambar (JPG, PNG, atau WEBP).');
    expect(screen.queryByAltText('Pratinjau cover baru')).not.toBeInTheDocument();
  });

  it('menampilkan pratinjau dan mengunggah dengan sukses', async () => {
    vi.mocked(api.changePostCover).mockResolvedValue(ok(undefined, 'Berhasil mengubah cover'));
    const { input, onChanged } = setup();
    await userEvent.upload(input, image);
    expect(await screen.findByAltText('Pratinjau cover baru')).toHaveAttribute('src', 'blob:preview');
    await userEvent.click(screen.getByRole('button', { name: 'Unggah Cover' }));
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(api.changePostCover).toHaveBeenCalledWith(5, image);
  });

  it('batal memilih berkas menghapus pratinjau; gagal unggah tidak memanggil onChanged', async () => {
    vi.mocked(api.changePostCover).mockResolvedValue(fail());
    const { input, onChanged, onClose } = setup();
    await userEvent.upload(input, image);
    expect(await screen.findByAltText('Pratinjau cover baru')).toBeInTheDocument();
    await userEvent.upload(input, []);
    expect(screen.queryByAltText('Pratinjau cover baru')).not.toBeInTheDocument();

    await userEvent.upload(input, image);
    await userEvent.click(screen.getByRole('button', { name: 'Unggah Cover' }));
    await waitFor(() => expect(api.changePostCover).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByRole('button', { name: 'Unggah Cover' })).toBeEnabled());
    expect(onChanged).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }));
    expect(onClose).toHaveBeenCalled();
  });
});
