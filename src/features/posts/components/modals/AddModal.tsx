'use client';

import type { FormEvent } from 'react';
import ModalShell from '@/components/ModalShell';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useInput } from '@/hooks/useInput';
import { showWarningDialog } from '@/helpers/toolsHelper';
import { asyncAddPost } from '@/features/posts/states/action';

interface AddModalProps {
  onClose: () => void;
  onAdded: (postId: number) => void;
}

export default function AddModal({ onClose, onAdded }: AddModalProps) {
  const dispatch = useAppDispatch();
  const submitting = useAppSelector((state) => state.isPostAdd);
  const [description, onDescriptionChange] = useInput('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!description.trim()) {
      await showWarningDialog('Deskripsi postingan tidak boleh kosong.');
      return;
    }
    const postId = await dispatch(asyncAddPost(description.trim()));
    if (postId !== null) onAdded(postId);
  }

  return (
    <ModalShell title="Tambah Postingan" onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="add-post-description" className="label">
            Deskripsi
          </label>
          <textarea
            id="add-post-description"
            rows={5}
            value={description}
            onChange={onDescriptionChange}
            placeholder="Apa yang ingin Anda bagikan hari ini?"
            className="field"
          />
          <p className="mt-2 text-sm text-muted">
            Gambar cover dapat ditambahkan dari halaman detail setelah postingan dibuat.
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Batal
          </button>
          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? 'Menyimpan...' : 'Publikasikan'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
