import { describe, expect, it } from 'vitest';
import { AuthActionType } from '@/features/auth/states/action';
import {
  PostActionType,
  clearPostActionCreator,
  postMutationActionCreator,
  receivePostActionCreator,
  receivePostsActionCreator,
} from '@/features/posts/states/action';
import * as reducers from '@/features/posts/states/reducer';
import { makePost, makePostDetail } from '@/test-utils';

const logout = { type: AuthActionType.LOGOUT };

describe('posts reducers', () => {
  it('posts', () => {
    const list = [makePost()];
    expect(reducers.posts(undefined, { type: 'x' })).toEqual([]);
    expect(reducers.posts([], receivePostsActionCreator(list))).toBe(list);
    expect(reducers.posts(list, logout)).toEqual([]);
  });

  it('post', () => {
    const detail = makePostDetail();
    expect(reducers.post(undefined, { type: 'x' })).toBeNull();
    expect(reducers.post(null, receivePostActionCreator(detail))).toBe(detail);
    expect(reducers.post(detail, clearPostActionCreator())).toBeNull();
    expect(reducers.post(detail, logout)).toBeNull();
    expect(PostActionType.CLEAR_POST).toBe('posts/clearPost');
  });

  it.each([
    ['fetch', reducers.isPost, undefined],
    ['add', reducers.isPostAdd, reducers.isPostAdded],
    ['change', reducers.isPostChange, reducers.isPostChanged],
    ['changeCover', reducers.isPostChangeCover, reducers.isPostChangedCover],
    ['delete', reducers.isPostDelete, reducers.isPostDeleted],
    ['like', reducers.isPostLike, reducers.isPostLiked],
    ['addComment', reducers.isPostAddComment, reducers.isPostAddedComment],
    ['deleteComment', reducers.isPostDeleteComment, reducers.isPostDeletedComment],
    ['deleteAll', reducers.isPostDeleteAll, reducers.isPostDeletedAll],
  ] as const)('flag %s', (name, loading, done) => {
    const request = postMutationActionCreator(name, 'request');
    const success = postMutationActionCreator(name, 'success');
    const failure = postMutationActionCreator(name, 'failure');
    const reset = postMutationActionCreator(name, 'reset');

    expect(loading(false, request)).toBe(true);
    expect(loading(true, success)).toBe(false);
    expect(loading(true, failure)).toBe(false);

    if (done) {
      expect(done(false, success)).toBe(true);
      expect(done(true, request)).toBe(false);
      expect(done(true, failure)).toBe(false);
      expect(done(true, reset)).toBe(false);
    }
  });
});
