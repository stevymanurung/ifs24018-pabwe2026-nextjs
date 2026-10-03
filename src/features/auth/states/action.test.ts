import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/auth/api/authApi');
vi.mock('@/helpers/toolsHelper', () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

import { getAccessToken } from '@/helpers/apiHelper';
import { showErrorDialog, showSuccessDialog } from '@/helpers/toolsHelper';
import { loginUser, logoutUser, registerUser } from '@/features/auth/api/authApi';
import {
  AuthActionType,
  asyncLogin,
  asyncLogout,
  asyncRegister,
  loginActionCreator,
  logoutActionCreator,
  registerActionCreator,
} from '@/features/auth/states/action';
import { makeStore } from '@/store';
import { fail, makeUser, ok } from '@/test-utils';

describe('auth action creators', () => {
  it('membuat action dengan tipe yang benar', () => {
    expect(loginActionCreator()).toEqual({ type: AuthActionType.LOGIN });
    expect(registerActionCreator()).toEqual({ type: AuthActionType.REGISTER });
    expect(logoutActionCreator()).toEqual({ type: AuthActionType.LOGOUT });
  });
});

describe('auth thunks', () => {
  beforeEach(() => vi.clearAllMocks());

  it('asyncLogin sukses menyimpan token dan state', async () => {
    vi.mocked(loginUser).mockResolvedValue(ok({ user: makeUser(), token: 'tok-1' }));
    const store = makeStore();
    expect(await store.dispatch(asyncLogin('a@b.c', 'pw'))).toBe(true);
    expect(getAccessToken()).toBe('tok-1');
    expect(store.getState().isAuthLogin).toBe(true);
    expect(store.getState().user?.name).toBe('Stiy Del');
  });

  it('asyncLogin gagal menampilkan galat', async () => {
    vi.mocked(loginUser).mockResolvedValue(fail('Kredensial akun tidak ditemukan'));
    const store = makeStore();
    expect(await store.dispatch(asyncLogin('a@b.c', 'pw'))).toBe(false);
    expect(getAccessToken()).toBeNull();
    expect(showErrorDialog).toHaveBeenCalledWith('Kredensial akun tidak ditemukan');
  });

  it('asyncRegister sukses menampilkan dialog sukses', async () => {
    vi.mocked(registerUser).mockResolvedValue(ok(undefined, 'Berhasil melakukan pendaftaran'));
    const store = makeStore();
    expect(await store.dispatch(asyncRegister('N', 'a@b.c', 'pw'))).toBe(true);
    expect(store.getState().isAuthRegister).toBe(true);
    expect(showSuccessDialog).toHaveBeenCalledWith('Berhasil melakukan pendaftaran');
  });

  it('asyncRegister gagal', async () => {
    vi.mocked(registerUser).mockResolvedValue(fail('Data tidak valid'));
    const store = makeStore();
    expect(await store.dispatch(asyncRegister('N', 'a@b.c', 'pw'))).toBe(false);
    expect(store.getState().isAuthRegister).toBe(false);
  });

  it('asyncLogout menghapus token dan state walau API gagal', async () => {
    vi.mocked(loginUser).mockResolvedValue(ok({ user: makeUser(), token: 'tok-1' }));
    vi.mocked(logoutUser).mockRejectedValue(new Error('offline'));
    const store = makeStore();
    await store.dispatch(asyncLogin('a@b.c', 'pw'));
    await store.dispatch(asyncLogout());
    expect(getAccessToken()).toBeNull();
    expect(store.getState().isAuthLogin).toBe(false);
    expect(store.getState().isAuthLogout).toBe(true);
    expect(store.getState().user).toBeNull();
    expect(showErrorDialog).not.toHaveBeenCalled();
  });
});
