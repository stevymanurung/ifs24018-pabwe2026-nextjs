import { callApi, runMutation } from '@/helpers/thunkHelper';
import { showSuccessDialog } from '@/helpers/toolsHelper';
import {
  changeProfilePassword,
  changeProfilePhoto,
  getProfile,
  getUsers,
  updateProfile,
} from '@/features/users/api/userApi';
import type { AppDispatch } from '@/store';
import type { User } from '@/types';
import type { AppAction, MutationPhase } from '@/types/action';

export const UserActionType = {
  RECEIVE_USERS: 'users/receiveUsers',
  RECEIVE_USER: 'users/receiveUser',
  RECEIVE_PROFILE: 'users/receiveProfile',
} as const;

export type ProfileMutation = 'change' | 'changePhoto' | 'changePassword';

export const profileMutationType = (name: ProfileMutation, phase: MutationPhase) =>
  `users/${name}/${phase}`;

export const receiveUsersActionCreator = (users: User[]): AppAction<User[]> => ({
  type: UserActionType.RECEIVE_USERS,
  payload: users,
});

export const receiveUserActionCreator = (user: User): AppAction<User> => ({
  type: UserActionType.RECEIVE_USER,
  payload: user,
});

export const receiveProfileActionCreator = (profile: User): AppAction<User> => ({
  type: UserActionType.RECEIVE_PROFILE,
  payload: profile,
});

export const profileMutationActionCreator = (
  name: ProfileMutation,
  phase: MutationPhase,
): AppAction => ({ type: profileMutationType(name, phase) });

export function asyncReceiveUsers() {
  return async (dispatch: AppDispatch): Promise<void> => {
    const result = await callApi(() => getUsers(), false);
    if (result) dispatch(receiveUsersActionCreator(result.data!.users));
  };
}

/** Memuat profil pengguna aktif. `silent` = tanpa dialog galat (dipakai route guard). */
export function asyncReceiveProfile(silent: boolean) {
  return async (dispatch: AppDispatch): Promise<boolean> => {
    const result = await callApi(() => getProfile(), silent);
    if (!result) return false;
    dispatch(receiveProfileActionCreator(result.data!.user));
    return true;
  };
}

export function asyncChangeProfile(name: string, email: string) {
  return async (dispatch: AppDispatch): Promise<boolean> => {
    const result = await runMutation(
      dispatch,
      (phase) => profileMutationActionCreator('change', phase),
      () => updateProfile(name, email),
    );
    if (!result) return false;
    dispatch(receiveProfileActionCreator(result.data!.user));
    await showSuccessDialog(result.message);
    return true;
  };
}

export function asyncChangeProfilePhoto(photo: File) {
  return async (dispatch: AppDispatch): Promise<boolean> => {
    const result = await runMutation(
      dispatch,
      (phase) => profileMutationActionCreator('changePhoto', phase),
      () => changeProfilePhoto(photo),
    );
    if (!result) return false;
    await dispatch(asyncReceiveProfile(true));
    await showSuccessDialog(result.message);
    return true;
  };
}

export function asyncChangeProfilePassword(
  password: string,
  newPassword: string,
  newPasswordConfirmation: string,
) {
  return async (dispatch: AppDispatch): Promise<boolean> => {
    const result = await runMutation(
      dispatch,
      (phase) => profileMutationActionCreator('changePassword', phase),
      () => changeProfilePassword(password, newPassword, newPasswordConfirmation),
    );
    if (!result) return false;
    await showSuccessDialog(result.message);
    return true;
  };
}
