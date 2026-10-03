'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/hooks/redux';
import { useInput } from '@/hooks/useInput';
import { showWarningDialog } from '@/helpers/toolsHelper';
import { asyncRegister } from '@/features/auth/states/action';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [name, onNameChange] = useInput('');
  const [email, onEmailChange] = useInput('');
  const [password, onPasswordChange] = useInput('');
  const [confirmation, onConfirmationChange] = useInput('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !EMAIL_PATTERN.test(email.trim())) {
      await showWarningDialog('Nama dan email yang valid wajib diisi.');
      return;
    }
    if (password.length < 6) {
      await showWarningDialog('Kata sandi minimal 6 karakter.');
      return;
    }
    if (password !== confirmation) {
      await showWarningDialog('Konfirmasi kata sandi tidak sama.');
      return;
    }
    setSubmitting(true);
    const success = await dispatch(asyncRegister(name.trim(), email.trim(), password));
    setSubmitting(false);
    if (success) router.push('/auth/login');
  }

  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">Buat akun baru</h1>
      <p className="mt-2 text-muted">Hanya butuh satu menit untuk mulai berbagi.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        <div>
          <label htmlFor="register-name-input" className="label">
            Nama lengkap
          </label>
          <input
            id="register-name-input"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={onNameChange}
            placeholder="Nama Anda"
            className="field"
          />
        </div>
        <div>
          <label htmlFor="register-email-input" className="label">
            Email
          </label>
          <input
            id="register-email-input"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={onEmailChange}
            placeholder="nama@email.com"
            className="field"
          />
        </div>
        <div>
          <label htmlFor="register-password-input" className="label">
            Kata sandi
          </label>
          <input
            id="register-password-input"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={onPasswordChange}
            placeholder="Minimal 6 karakter"
            className="field"
          />
        </div>
        <div>
          <label htmlFor="register-confirmation-input" className="label">
            Ulangi kata sandi
          </label>
          <input
            id="register-confirmation-input"
            name="confirmation"
            type="password"
            autoComplete="new-password"
            required
            value={confirmation}
            onChange={onConfirmationChange}
            placeholder="Ketik ulang kata sandi"
            className="field"
          />
        </div>
        <button
          id="register-submit-button"
          type="submit"
          disabled={submitting}
          className="btn btn-primary w-full"
        >
          {submitting ? 'Memproses...' : 'Daftar'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Sudah punya akun?{' '}
        <Link href="/auth/login" className="font-semibold text-brand-dark underline">
          Masuk di sini
        </Link>
      </p>
    </>
  );
}
