import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  apiFetch,
  getAccessToken,
  putAccessToken,
  removeAccessToken,
  resolveAssetUrl,
} from '@/helpers/apiHelper';
import { DELCOM_BASEURL } from '@/lib/config';

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({ json: async () => ({ status: 'success', message: 'ok' }) });
  vi.stubGlobal('fetch', fetchMock);
});

describe('token storage', () => {
  it('menyimpan, membaca, dan menghapus token', () => {
    expect(getAccessToken()).toBeNull();
    putAccessToken('abc');
    expect(getAccessToken()).toBe('abc');
    removeAccessToken();
    expect(getAccessToken()).toBeNull();
  });
});

describe('apiFetch', () => {
  it('melakukan GET tanpa token dan tanpa body', async () => {
    const result = await apiFetch('/posts', {});
    expect(result).toEqual({ status: 'success', message: 'ok' });
    expect(fetchMock).toHaveBeenCalledWith(`${DELCOM_BASEURL}/posts`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      body: undefined,
    });
  });

  it('menambahkan query parameter yang terdefinisi saja', async () => {
    await apiFetch('/posts', { params: { is_me: 1, skip: undefined } });
    expect(fetchMock.mock.calls[0][0]).toBe(`${DELCOM_BASEURL}/posts?is_me=1`);
  });

  it('menyertakan bearer token dan body JSON', async () => {
    putAccessToken('tok');
    await apiFetch('/posts', { method: 'POST', body: { description: 'hai' } });
    expect(fetchMock.mock.calls[0][1]).toEqual({
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer tok',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description: 'hai' }),
    });
  });

  it('mengirim FormData tanpa Content-Type manual', async () => {
    const formData = new FormData();
    formData.append('cover', new File(['x'], 'a.png', { type: 'image/png' }));
    await apiFetch('/posts/1/cover', { method: 'POST', formData });
    const init = fetchMock.mock.calls[0][1];
    expect(init.body).toBe(formData);
    expect(init.headers['Content-Type']).toBeUndefined();
  });
});

describe('resolveAssetUrl', () => {
  it('mengembalikan null untuk path kosong', () => {
    expect(resolveAssetUrl(null)).toBeNull();
  });

  it('meningkatkan URL http delcom menjadi https', () => {
    expect(resolveAssetUrl('http://open-api.delcom.org/img/a.png')).toBe(
      'https://open-api.delcom.org/img/a.png',
    );
  });

  it('membiarkan URL absolut lain', () => {
    expect(resolveAssetUrl('http://127.0.0.1:8000/img/a.png')).toBe('http://127.0.0.1:8000/img/a.png');
  });

  it('melengkapi path relatif dengan origin API', () => {
    const origin = new URL(DELCOM_BASEURL).origin;
    expect(resolveAssetUrl('img/profile/a.png')).toBe(`${origin}/img/profile/a.png`);
    expect(resolveAssetUrl('/img/profile/a.png')).toBe(`${origin}/img/profile/a.png`);
  });
});
