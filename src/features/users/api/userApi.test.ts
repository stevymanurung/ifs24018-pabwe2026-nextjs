import { describe, expect, it, vi } from 'vitest';

vi.mock('@/helpers/apiHelper', () => ({ apiFetch: vi.fn().mockResolvedValue({ status: 'success' }) }));

import { apiFetch } from '@/helpers/apiHelper';
import {
  changeProfilePassword,
  changeProfilePhoto,
  getProfile,
  getUsers,
  updateProfile,
} from '@/features/users/api/userApi';

describe('userApi', () => {
  it('GET /users', async () => {
    await getUsers();
    expect(apiFetch).toHaveBeenCalledWith('/users', {});
  });

  it('GET /users/me', async () => {
    await getProfile();
    expect(apiFetch).toHaveBeenCalledWith('/users/me', {});
  });

  it('PUT /users/me', async () => {
    await updateProfile('Nama', 'a@b.c');
    expect(apiFetch).toHaveBeenCalledWith('/users/me', {
      method: 'PUT',
      body: { name: 'Nama', email: 'a@b.c' },
    });
  });

  it('POST /users/me/photo mengirim FormData', async () => {
    const file = new File(['x'], 'p.png', { type: 'image/png' });
    await changeProfilePhoto(file);
    const [path, options] = vi.mocked(apiFetch).mock.calls.at(-1)!;
    expect(path).toBe('/users/me/photo');
    expect(options.method).toBe('POST');
    expect(options.formData?.get('photo')).toBe(file);
  });

  it('PUT /users/password', async () => {
    await changeProfilePassword('lama', 'baru', 'baru');
    expect(apiFetch).toHaveBeenCalledWith('/users/password', {
      method: 'PUT',
      body: { password: 'lama', new_password: 'baru', new_password_confirmation: 'baru' },
    });
  });
});
