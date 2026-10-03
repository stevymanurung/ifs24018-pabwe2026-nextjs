/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import ModalShell from '@/components/ModalShell';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { showWarningDialog } from '@/helpers/toolsHelper';
import { asyncChangePostCover } from '@/features/posts/states/action';

interface ChangeCoverModalProps {
  postId: number;
  onClose: () => void;
  onChanged: () => void;
}

export default function ChangeCoverModal({ postId, onClose, onChanged }: ChangeCoverModalProps) {
  const dispatch = useAppDispatch();
  const submitting = useAppSelector((state) => state.isPostChangeCover);
  const [file, setFile] = useState<File | null>(null);
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    if (selected && !selected.type.startsWith('image/')) {
      event.target.value = '';
      await showWarningDialog('Berkas harus berupa gambar (JPG, PNG, atau WEBP).');
      return;
    }
    setFile(selected);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      await showWarningDialog('Pilih gambar cover terlebih dahulu.');
      return;
    }
    const success = await dispatch(asyncChangePostCover(postId, file));
    if (success) onChanged();
  }

  return (
    <ModalShell title="Ubah Cover Postingan" onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="change-cover-input" className="label">
            Pilih gambar
          </label>
          <input
            id="change-cover-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="field cursor-pointer file:mr-3 file:rounded-md file:border-0 file:bg-brand-soft file:px-3 file:py-1.5 file:font-semibold file:text-brand-dark"
          />
        </div>
        {preview && (
          <img
            src={preview}
            alt="Pratinjau cover baru"
            width={480}
            height={270}
            className="aspect-video w-full rounded-xl border border-line object-cover"
          />
        )}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Batal
          </button>
          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? 'Mengunggah...' : 'Unggah Cover'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
