import { createFlagReducer } from '@/helpers/reducerHelper';
import { AuthActionType } from '@/features/auth/states/action';

/** true setelah login berhasil, false setelah logout. */
export const isAuthLogin = createFlagReducer([AuthActionType.LOGIN], [AuthActionType.LOGOUT]);

/** true setelah registrasi berhasil. */
export const isAuthRegister = createFlagReducer([AuthActionType.REGISTER], []);

/** true setelah logout, false ketika login kembali. */
export const isAuthLogout = createFlagReducer([AuthActionType.LOGOUT], [AuthActionType.LOGIN]);
