import { AuthActionType } from '@/features/auth/states/action';
import { createFlagReducer, createValueReducer } from '@/helpers/reducerHelper';
import {
  UserActionType,
  profileMutationType,
  type ProfileMutation,
} from '@/features/users/states/action';
import type { User } from '@/types';

export const users = createValueReducer<User[]>([], UserActionType.RECEIVE_USERS, [
  AuthActionType.LOGOUT,
]);

export const user = createValueReducer<User | null>(null, UserActionType.RECEIVE_USER, [
  AuthActionType.LOGOUT,
]);

export const profile = createValueReducer<User | null>(null, UserActionType.RECEIVE_PROFILE, [
  AuthActionType.LOGOUT,
]);

/** true setelah profil pengguna aktif berhasil dimuat (dipakai route guard). */
export const isProfile = createFlagReducer(
  [UserActionType.RECEIVE_PROFILE],
  [AuthActionType.LOGOUT],
);

/** Flag "sedang memproses" untuk tiap aksi ubah profil. */
const loading = (name: ProfileMutation) =>
  createFlagReducer(
    [profileMutationType(name, 'request')],
    [profileMutationType(name, 'success'), profileMutationType(name, 'failure')],
  );

export const isChangeProfile = loading('change');
export const isChangeProfilePhoto = loading('changePhoto');
export const isChangeProfilePassword = loading('changePassword');
