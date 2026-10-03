'use client';

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import Avatar from '@/components/Avatar';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useInput } from '@/hooks/useInput';
import { showWarningDialog } from '@/helpers/toolsHelper';
import {
  asyncChangeProfile,
  asyncChangeProfilePassword,
  asyncChangeProfilePhoto,
} from '@/features/users/states/action';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.profile);
  const savingProfile = useAppSelector((state) => state.isChangeProfile);
  const savingPhoto = useAppSelector((state) => state.isChangeProfilePhoto);
  const savingPassword = useAppSelector((state) => state.isChangeProfilePassword);

  const [name, onNameChange] = useInput(profile?.name ?? '');
  const [email, onEmailChange] = useInput(profile?.email ?? '');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoKey, setPhotoKey] = useState(0);
  const [password, onPasswordChange, setPassword] = useInput('');
  const [newPassword, onNewPasswordChange, setNewPassword] = useInput('');
  const [confirmation, onConfirmationChange, setConfirmation] = useInput('');

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !EMAIL_PATTERN.test(email.trim())) {
      await showWarningDialog('Nama dan email yang valid wajib diisi.');
      return;
    }
    await dispatch(asyncChangeProfile(name.trim(), email.trim()));
  }

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    if (selected && !selected.type.startsWith('image/')) {
      event.target.value = '';
      await showWarningDialog('Berkas harus berupa gambar (JPG, PNG, atau WEBP).');
      return;
    }
    setPhoto(selected);
  }

  async function handlePhotoSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!photo) {
      await showWarningDialog('Pilih foto profil terlebih dahulu.');
      return;
    }
    if (await dispatch(asyncChangeProfilePhoto(photo))) {
      setPhoto(null);
      setPhotoKey((key) => key + 1);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password || newPassword.length < 6) {
      await showWarningDialog('Isi kata sandi saat ini dan kata sandi baru (minimal 6 karakter).');
      return;
    }
    if (newPassword !== confirmation) {
      await showWarningDialog('Konfirmasi kata sandi baru tidak sama.');
      return;
    }
    if (await dispatch(asyncChangeProfilePassword(password, newPassword, confirmation))) {
      setPassword('');
      setNewPassword('');
      setConfirmation('');
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold tracking-tight">Profil Saya</h1>
      <p className="mt-1 text-muted">Perbarui identitas, foto, dan keamanan akun Anda.</p>

      <section aria-labelledby="profile-info-heading" className="card mt-8 p-6 sm:p-8">
        <h2 id="profile-info-heading" className="text-xl font-bold">
          Informasi akun
        </h2>
        <form onSubmit={handleProfileSubmit} noValidate className="mt-5 space-y-5">
          <div>
            <label htmlFor="profile-name-input" className="label">
              Nama lengkap
            </label>
            <input
              id="profile-name-input"
              type="text"
              autoComplete="name"
              value={name}
              onChange={onNameChange}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="profile-email-input" className="label">
              Email
            </label>
            <input
              id="profile-email-input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={onEmailChange}
              className="field"
            />
          </div>
          <button type="submit" disabled={savingProfile} className="btn btn-primary">
            {savingProfile ? 'Menyimpan...' : 'Simpan perubahan'}
          </button>
        </form>
      </section>

      <section aria-labelledby="profile-photo-heading" className="card mt-6 p-6 sm:p-8">
        <h2 id="profile-photo-heading" className="text-xl font-bold">
          Foto profil
        </h2>
        <div className="mt-5 flex flex-wrap items-center gap-6">
          <Avatar name={profile?.name ?? ''} photo={profile?.photo ?? null} size="lg" />
          <form onSubmit={handlePhotoSubmit} noValidate className="min-w-60 flex-1 space-y-4">
            <div>
              <label htmlFor="profile-photo-input" className="label">
                Pilih foto baru
              </label>
              <input
                key={photoKey}
                id="profile-photo-input"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="field cursor-pointer file:mr-3 file:rounded-md file:border-0 file:bg-brand-soft file:px-3 file:py-1.5 file:font-semibold file:text-brand-dark"
              />
            </div>
            <button type="submit" disabled={savingPhoto} className="btn btn-primary">
              {savingPhoto ? 'Mengunggah...' : 'Unggah foto'}
            </button>
          </form>
        </div>
      </section>

      <section aria-labelledby="profile-password-heading" className="card mt-6 p-6 sm:p-8">
        <h2 id="profile-password-heading" className="text-xl font-bold">
          Ubah kata sandi
        </h2>
        <form onSubmit={handlePasswordSubmit} noValidate className="mt-5 space-y-5">
          <div>
            <label htmlFor="profile-password-input" className="label">
              Kata sandi saat ini
            </label>
            <input
              id="profile-password-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={onPasswordChange}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="profile-new-password-input" className="label">
              Kata sandi baru
            </label>
            <input
              id="profile-new-password-input"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={onNewPasswordChange}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="profile-confirmation-input" className="label">
              Ulangi kata sandi baru
            </label>
            <input
              id="profile-confirmation-input"
              type="password"
              autoComplete="new-password"
              value={confirmation}
              onChange={onConfirmationChange}
              className="field"
            />
          </div>
          <button type="submit" disabled={savingPassword} className="btn btn-primary">
            {savingPassword ? 'Menyimpan...' : 'Ubah kata sandi'}
          </button>
        </form>
      </section>
    </div>
  );
}
