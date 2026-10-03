import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/helpers/toolsHelper', () => ({ showErrorDialog: vi.fn() }));

import { showErrorDialog } from '@/helpers/toolsHelper';
import { callApi, formatApiError, runMutation } from '@/helpers/thunkHelper';
import { fail, ok } from '@/test-utils';

beforeEach(() => vi.mocked(showErrorDialog).mockReset());

describe('formatApiError', () => {
  it('menyertakan pesan validasi per field', () => {
    expect(formatApiError(fail('Data tidak valid', { email: ['Email dipakai'] }))).toBe(
      'Data tidak valid: Email dipakai',
    );
  });
  it('memakai pesan utama bila tidak ada detail', () => {
    expect(formatApiError(fail('Kredensial salah'))).toBe('Kredensial salah');
  });
});

describe('callApi', () => {
  it('mengembalikan hasil sukses', async () => {
    const result = ok({ a: 1 });
    expect(await callApi(async () => result, false)).toBe(result);
  });

  it('menampilkan dialog galat pada respons gagal', async () => {
    expect(await callApi(async () => fail('Gagal total'), false)).toBeNull();
    expect(showErrorDialog).toHaveBeenCalledWith('Gagal total');
  });

  it('tidak menampilkan dialog pada mode silent', async () => {
    expect(await callApi(async () => fail(), true)).toBeNull();
    expect(await callApi(() => Promise.reject(new Error('x')), true)).toBeNull();
    expect(showErrorDialog).not.toHaveBeenCalled();
  });

  it('menangani galat jaringan', async () => {
    expect(await callApi(() => Promise.reject(new Error('Jaringan putus')), false)).toBeNull();
    expect(showErrorDialog).toHaveBeenCalledWith('Jaringan putus');
    expect(await callApi(() => Promise.reject('aneh'), false)).toBeNull();
    expect(showErrorDialog).toHaveBeenLastCalledWith('Terjadi kesalahan pada jaringan.');
  });
});

describe('runMutation', () => {
  const creator = (phase: string) => ({ type: `m/${phase}` });

  it('mengirim request lalu success', async () => {
    const dispatch = vi.fn();
    const result = await runMutation(dispatch, creator as never, async () => ok());
    expect(result).not.toBeNull();
    expect(dispatch.mock.calls.map(([a]) => a.type)).toEqual(['m/request', 'm/success']);
  });

  it('mengirim request lalu failure', async () => {
    const dispatch = vi.fn();
    const result = await runMutation(dispatch, creator as never, async () => fail());
    expect(result).toBeNull();
    expect(dispatch.mock.calls.map(([a]) => a.type)).toEqual(['m/request', 'm/failure']);
  });
});
