'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/hooks/redux';
import { useInput } from '@/hooks/useInput';
import { showWarningDialog } from '@/helpers/toolsHelper';
import { asyncLogin } from '@/features/auth/states/action';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [email, onEmailChange] = useInput('');
  const [password, onPasswordChange] = useInput('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim()) || !password) {
      await showWarningDialog('Masukkan email yang valid dan kata sandi Anda.');
      return;
    }
    setSubmitting(true);
    const success = await dispatch(asyncLogin(email.trim(), password));
    setSubmitting(false);
    if (success) router.replace('/');
  }

  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">Masuk ke akun Anda</h1>
      <p className="mt-2 text-muted">Lanjutkan membaca dan membagikan postingan.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        <div>
          <label htmlFor="login-email-input" className="label">
            Email
          </label>
          <input
            id="login-email-input"
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
          <label htmlFor="login-password-input" className="label">
            Kata sandi
          </label>
          <input
            id="login-password-input"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={onPasswordChange}
            placeholder="Masukkan kata sandi"
            className="field"
          />
        </div>
        <button
          id="login-submit-button"
          type="submit"
          disabled={submitting}
          className="btn btn-primary w-full"
        >
          {submitting ? 'Memproses...' : 'Masuk'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Belum punya akun?{' '}
        <Link href="/auth/register" className="font-semibold text-brand-dark underline">
          Daftar akun baru
        </Link>
      </p>
    </>
  );
}
