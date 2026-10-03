import { DELCOM_BASEURL } from '@/lib/config';
import type { ApiResult } from '@/types';

const TOKEN_KEY = 'accessToken';

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function putAccessToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAccessToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, string | number | undefined>;
  body?: unknown;
  formData?: FormData;
}

/**
 * Wrapper fetch untuk REST API Delcom: menangani query parameter,
 * body JSON / multipart dan header Authorization: Bearer <token>.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: ApiRequestOptions,
): Promise<ApiResult<T>> {
  const { method = 'GET', params, body, formData } = options;

  const url = new URL(`${DELCOM_BASEURL}${path}`);
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value));
  });

  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload: BodyInit | undefined;
  if (formData) {
    payload = formData;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  const response = await fetch(url.toString(), { method, headers, body: payload });
  return (await response.json()) as ApiResult<T>;
}

/**
 * Mengubah path aset (foto / cover) dari API menjadi URL absolut HTTPS
 * agar tidak terblokir sebagai mixed content ketika situs berjalan di HTTPS.
 */
export function resolveAssetUrl(path: string | null): string | null {
  if (!path) return null;
  const absolute = /^https?:\/\//.test(path)
    ? path
    : `${new URL(DELCOM_BASEURL).origin}/${path.replace(/^\//, '')}`;
  return absolute.replace(/^http:\/\/(?=[^/]*delcom\.org)/, 'https://');
}
