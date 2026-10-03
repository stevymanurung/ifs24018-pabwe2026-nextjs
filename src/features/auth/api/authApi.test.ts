import { describe, expect, it, vi } from 'vitest';

vi.mock('@/helpers/apiHelper', () => ({ apiFetch: vi.fn().mockResolvedValue({ status: 'success' }) }));

import { apiFetch } from '@/helpers/apiHelper';
import { loginUser, logoutUser, registerUser } from '@/features/auth/api/authApi';

describe('authApi', () => {
  it('login memanggil POST /auth/login', async () => {
    await loginUser('a@b.c', 'rahasia');
    expect(apiFetch).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: { email: 'a@b.c', password: 'rahasia' },
    });
  });

  it('register memanggil POST /auth/register', async () => {
    await registerUser('Nama', 'a@b.c', 'rahasia');
    expect(apiFetch).toHaveBeenCalledWith('/auth/register', {
      method: 'POST',
      body: { name: 'Nama', email: 'a@b.c', password: 'rahasia' },
    });
  });

  it('logout memanggil POST /auth/logout', async () => {
    await logoutUser();
    expect(apiFetch).toHaveBeenCalledWith('/auth/logout', { method: 'POST' });
  });
});
