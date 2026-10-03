'use client';

import type { FormEvent } from 'react';
import ModalShell from '@/components/ModalShell';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useInput } from '@/hooks/useInput';
import { showWarningDialog } from '@/helpers/toolsHelper';
import { asyncChangePost } from '@/features/posts/states/action';

interface ChangeModalProps {
  postId: number;
  description: string;
  onClose: () => void;
  onChanged: () => void;
}

export default function ChangeModal({ postId, description, onClose, onChanged }: ChangeModalProps) {
  const dispatch = useAppDispatch();
  const submitting = useAppSelector((state) => state.isPostChange);
  const [value, onValueChange] = useInput(description);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!value.trim()) {
      await showWarningDialog('Deskripsi postingan tidak boleh kosong.');
      return;
    }
    const success = await dispatch(asyncChangePost(postId, value.trim()));
    if (success) onChanged();
  }

  return (
    <ModalShell title="Ubah Postingan" onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="change-post-description" className="label">
            Deskripsi
          </label>
          <textarea
            id="change-post-description"
            rows={5}
            value={value}
            onChange={onValueChange}
            className="field"
          />
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Batal
          </button>
          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
