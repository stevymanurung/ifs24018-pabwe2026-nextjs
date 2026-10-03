import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/users/api/userApi');
vi.mock('@/helpers/toolsHelper', () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

import { showErrorDialog, showSuccessDialog } from '@/helpers/toolsHelper';
import * as userApi from '@/features/users/api/userApi';
import {
  UserActionType,
  asyncChangeProfile,
  asyncChangeProfilePassword,
  asyncChangeProfilePhoto,
  asyncReceiveProfile,
  asyncReceiveUsers,
  profileMutationActionCreator,
  receiveProfileActionCreator,
  receiveUserActionCreator,
  receiveUsersActionCreator,
} from '@/features/users/states/action';
import { makeStore } from '@/store';
import { fail, makeUser, ok } from '@/test-utils';

const file = new File(['x'], 'p.png', { type: 'image/png' });

beforeEach(() => vi.clearAllMocks());

describe('users action creators', () => {
  it('membuat action', () => {
    const u = makeUser();
    expect(receiveUsersActionCreator([u])).toEqual({ type: UserActionType.RECEIVE_USERS, payload: [u] });
    expect(receiveUserActionCreator(u)).toEqual({ type: UserActionType.RECEIVE_USER, payload: u });
    expect(receiveProfileActionCreator(u)).toEqual({ type: UserActionType.RECEIVE_PROFILE, payload: u });
    expect(profileMutationActionCreator('change', 'request')).toEqual({ type: 'users/change/request' });
  });
});

describe('asyncReceiveUsers', () => {
  it('mengisi daftar pengguna', async () => {
    vi.mocked(userApi.getUsers).mockResolvedValue(ok({ users: [makeUser()] }));
    const store = makeStore();
    await store.dispatch(asyncReceiveUsers());
    expect(store.getState().users).toHaveLength(1);
  });

  it('tidak mengubah state saat gagal', async () => {
    vi.mocked(userApi.getUsers).mockResolvedValue(fail('Gagal'));
    const store = makeStore();
    await store.dispatch(asyncReceiveUsers());
    expect(store.getState().users).toEqual([]);
  });
});

describe('asyncReceiveProfile', () => {
  it('mengisi profil', async () => {
    vi.mocked(userApi.getProfile).mockResolvedValue(ok({ user: makeUser() }));
    const store = makeStore();
    expect(await store.dispatch(asyncReceiveProfile(true))).toBe(true);
    expect(store.getState().isProfile).toBe(true);
    expect(store.getState().profile?.id).toBe(1);
  });

  it('gagal: dialog tampil bila tidak silent', async () => {
    vi.mocked(userApi.getProfile).mockResolvedValue(fail('Unauthenticated.'));
    const store = makeStore();
    expect(await store.dispatch(asyncReceiveProfile(true))).toBe(false);
    expect(showErrorDialog).not.toHaveBeenCalled();
    expect(await store.dispatch(asyncReceiveProfile(false))).toBe(false);
    expect(showErrorDialog).toHaveBeenCalledTimes(1);
  });
});

describe('asyncChangeProfile', () => {
  it('sukses memperbarui profil', async () => {
    vi.mocked(userApi.updateProfile).mockResolvedValue(ok({ user: makeUser({ name: 'Baru' }) }, 'Berhasil mengubah data'));
    const store = makeStore();
    expect(await store.dispatch(asyncChangeProfile('Baru', 'a@b.c'))).toBe(true);
    expect(store.getState().profile?.name).toBe('Baru');
    expect(store.getState().isChangeProfile).toBe(false);
    expect(showSuccessDialog).toHaveBeenCalledWith('Berhasil mengubah data');
  });

  it('gagal', async () => {
    vi.mocked(userApi.updateProfile).mockResolvedValue(fail('Data tidak valid'));
    const store = makeStore();
    expect(await store.dispatch(asyncChangeProfile('Baru', 'a@b.c'))).toBe(false);
    expect(store.getState().profile).toBeNull();
  });
});

describe('asyncChangeProfilePhoto', () => {
  it('sukses memuat ulang profil', async () => {
    vi.mocked(userApi.changeProfilePhoto).mockResolvedValue(ok(undefined, 'Berhasil'));
    vi.mocked(userApi.getProfile).mockResolvedValue(ok({ user: makeUser({ photo: 'img/p.png' }) }));
    const store = makeStore();
    expect(await store.dispatch(asyncChangeProfilePhoto(file))).toBe(true);
    expect(store.getState().profile?.photo).toBe('img/p.png');
  });

  it('gagal', async () => {
    vi.mocked(userApi.changeProfilePhoto).mockResolvedValue(fail('Gagal'));
    const store = makeStore();
    expect(await store.dispatch(asyncChangeProfilePhoto(file))).toBe(false);
    expect(userApi.getProfile).not.toHaveBeenCalled();
  });
});

describe('asyncChangeProfilePassword', () => {
  it('sukses', async () => {
    vi.mocked(userApi.changeProfilePassword).mockResolvedValue(ok(undefined, 'Berhasil mengubah kata sandi'));
    const store = makeStore();
    expect(await store.dispatch(asyncChangeProfilePassword('a', 'b', 'b'))).toBe(true);
    expect(showSuccessDialog).toHaveBeenCalledWith('Berhasil mengubah kata sandi');
  });

  it('gagal', async () => {
    vi.mocked(userApi.changeProfilePassword).mockResolvedValue(fail('Kata sandi salah'));
    const store = makeStore();
    expect(await store.dispatch(asyncChangeProfilePassword('a', 'b', 'b'))).toBe(false);
  });
});
