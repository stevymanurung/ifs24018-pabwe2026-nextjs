import { describe, expect, it } from 'vitest';
import { AuthActionType } from '@/features/auth/states/action';
import {
  UserActionType,
  profileMutationActionCreator,
  receiveProfileActionCreator,
  receiveUserActionCreator,
  receiveUsersActionCreator,
} from '@/features/users/states/action';
import {
  isChangeProfile,
  isChangeProfilePassword,
  isChangeProfilePhoto,
  isProfile,
  profile,
  user,
  users,
} from '@/features/users/states/reducer';
import { makeUser } from '@/test-utils';

const logout = { type: AuthActionType.LOGOUT };

describe('users reducers', () => {
  it('users', () => {
    const list = [makeUser()];
    expect(users(undefined, { type: 'x' })).toEqual([]);
    expect(users([], receiveUsersActionCreator(list))).toBe(list);
    expect(users(list, logout)).toEqual([]);
  });

  it('user', () => {
    const u = makeUser();
    expect(user(undefined, { type: 'x' })).toBeNull();
    expect(user(null, receiveUserActionCreator(u))).toBe(u);
    expect(user(u, logout)).toBeNull();
  });

  it('profile & isProfile', () => {
    const u = makeUser();
    expect(profile(undefined, { type: UserActionType.RECEIVE_USER })).toBeNull();
    expect(profile(null, receiveProfileActionCreator(u))).toBe(u);
    expect(profile(u, logout)).toBeNull();
    expect(isProfile(false, receiveProfileActionCreator(u))).toBe(true);
    expect(isProfile(true, logout)).toBe(false);
  });

  it.each([
    ['change', isChangeProfile],
    ['changePhoto', isChangeProfilePhoto],
    ['changePassword', isChangeProfilePassword],
  ] as const)('flag proses %s', (name, reducer) => {
    expect(reducer(false, profileMutationActionCreator(name, 'request'))).toBe(true);
    expect(reducer(true, profileMutationActionCreator(name, 'success'))).toBe(false);
    expect(reducer(true, profileMutationActionCreator(name, 'failure'))).toBe(false);
  });
});
