import { apiFetch } from '@/helpers/apiHelper';
import type { User } from '@/types';

export function getUsers() {
  return apiFetch<{ users: User[] }>('/users', {});
}

export function getProfile() {
  return apiFetch<{ user: User }>('/users/me', {});
}

export function updateProfile(name: string, email: string) {
  return apiFetch<{ user: User }>('/users/me', { method: 'PUT', body: { name, email } });
}

export function changeProfilePhoto(photo: File) {
  const formData = new FormData();
  formData.append('photo', photo);
  return apiFetch('/users/me/photo', { method: 'POST', formData });
}

export function changeProfilePassword(
  password: string,
  newPassword: string,
  newPasswordConfirmation: string,
) {
  return apiFetch('/users/password', {
    method: 'PUT',
    body: {
      password,
      new_password: newPassword,
      new_password_confirmation: newPasswordConfirmation,
    },
  });
}
