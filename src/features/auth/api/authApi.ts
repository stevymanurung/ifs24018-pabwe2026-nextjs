import { apiFetch } from '@/helpers/apiHelper';
import type { User } from '@/types';

export function loginUser(email: string, password: string) {
  return apiFetch<{ user: User; token: string }>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function registerUser(name: string, email: string, password: string) {
  return apiFetch('/auth/register', { method: 'POST', body: { name, email, password } });
}

export function logoutUser() {
  return apiFetch('/auth/logout', { method: 'POST' });
}
