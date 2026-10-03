import { putAccessToken, removeAccessToken } from '@/helpers/apiHelper';
import { callApi } from '@/helpers/thunkHelper';
import { showSuccessDialog } from '@/helpers/toolsHelper';
import { receiveUserActionCreator } from '@/features/users/states/action';
import { loginUser, logoutUser, registerUser } from '@/features/auth/api/authApi';
import type { AppDispatch } from '@/store';
import type { AppAction } from '@/types/action';

export const AuthActionType = {
  LOGIN: 'auth/login',
  REGISTER: 'auth/register',
  LOGOUT: 'auth/logout',
} as const;

export const loginActionCreator = (): AppAction => ({ type: AuthActionType.LOGIN });
export const registerActionCreator = (): AppAction => ({ type: AuthActionType.REGISTER });
export const logoutActionCreator = (): AppAction => ({ type: AuthActionType.LOGOUT });

export function asyncLogin(email: string, password: string) {
  return async (dispatch: AppDispatch): Promise<boolean> => {
    const result = await callApi(() => loginUser(email, password), false);
    if (!result) return false;
    putAccessToken(result.data!.token);
    dispatch(receiveUserActionCreator(result.data!.user));
    dispatch(loginActionCreator());
    return true;
  };
}

export function asyncRegister(name: string, email: string, password: string) {
  return async (dispatch: AppDispatch): Promise<boolean> => {
    const result = await callApi(() => registerUser(name, email, password), false);
    if (!result) return false;
    dispatch(registerActionCreator());
    await showSuccessDialog(result.message);
    return true;
  };
}

export function asyncLogout() {
  return async (dispatch: AppDispatch): Promise<void> => {
    await callApi(() => logoutUser(), true);
    removeAccessToken();
    dispatch(logoutActionCreator());
  };
}
