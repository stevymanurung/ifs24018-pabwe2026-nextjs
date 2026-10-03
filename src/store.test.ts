import { describe, expect, it } from 'vitest';
import { makeStore, reducer, store } from '@/store';

describe('store', () => {
  it('menggabungkan seluruh reducer auth, users, dan posts', () => {
    const keys = Object.keys(store.getState()).sort();
    expect(keys).toEqual(Object.keys(reducer).sort());
    expect(keys).toEqual(
      expect.arrayContaining([
        'isAuthLogin',
        'isAuthRegister',
        'isAuthLogout',
        'users',
        'profile',
        'posts',
        'post',
        'isPostLike',
        'isPostDeletedAll',
      ]),
    );
  });

  it('makeStore menerima preloaded state', () => {
    const custom = makeStore({ isProfile: true });
    expect(custom.getState().isProfile).toBe(true);
    expect(custom.getState().posts).toEqual([]);
  });
});
