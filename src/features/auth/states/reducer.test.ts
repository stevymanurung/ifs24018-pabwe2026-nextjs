import { describe, expect, it } from 'vitest';
import { isAuthLogin, isAuthLogout, isAuthRegister } from '@/features/auth/states/reducer';
import { AuthActionType } from '@/features/auth/states/action';

describe('auth reducers', () => {
  it('isAuthLogin', () => {
    expect(isAuthLogin(undefined, { type: 'x' })).toBe(false);
    expect(isAuthLogin(false, { type: AuthActionType.LOGIN })).toBe(true);
    expect(isAuthLogin(true, { type: AuthActionType.LOGOUT })).toBe(false);
  });

  it('isAuthRegister', () => {
    expect(isAuthRegister(undefined, { type: 'x' })).toBe(false);
    expect(isAuthRegister(false, { type: AuthActionType.REGISTER })).toBe(true);
  });

  it('isAuthLogout', () => {
    expect(isAuthLogout(undefined, { type: 'x' })).toBe(false);
    expect(isAuthLogout(false, { type: AuthActionType.LOGOUT })).toBe(true);
    expect(isAuthLogout(true, { type: AuthActionType.LOGIN })).toBe(false);
  });
});
