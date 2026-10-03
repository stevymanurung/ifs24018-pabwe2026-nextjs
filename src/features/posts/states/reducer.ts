import { AuthActionType } from '@/features/auth/states/action';
import { createFlagReducer, createValueReducer } from '@/helpers/reducerHelper';
import {
  PostActionType,
  postMutationType,
  type PostMutation,
} from '@/features/posts/states/action';
import type { Post, PostDetail } from '@/types';

export const posts = createValueReducer<Post[]>([], PostActionType.RECEIVE_POSTS, [
  AuthActionType.LOGOUT,
]);

export const post = createValueReducer<PostDetail | null>(null, PostActionType.RECEIVE_POST, [
  AuthActionType.LOGOUT,
  PostActionType.CLEAR_POST,
]);

/** Flag "sedang berjalan" untuk sebuah aksi. */
const loading = (name: PostMutation) =>
  createFlagReducer(
    [postMutationType(name, 'request')],
    [postMutationType(name, 'success'), postMutationType(name, 'failure')],
  );

/** Flag "sudah berhasil" untuk sebuah aksi. */
const done = (name: PostMutation) =>
  createFlagReducer(
    [postMutationType(name, 'success')],
    [postMutationType(name, 'request'), postMutationType(name, 'failure'), postMutationType(name, 'reset')],
  );

export const isPost = loading('fetch');
export const isPostAdd = loading('add');
export const isPostAdded = done('add');
export const isPostChange = loading('change');
export const isPostChanged = done('change');
export const isPostChangeCover = loading('changeCover');
export const isPostChangedCover = done('changeCover');
export const isPostDelete = loading('delete');
export const isPostDeleted = done('delete');
export const isPostLike = loading('like');
export const isPostLiked = done('like');
export const isPostAddComment = loading('addComment');
export const isPostAddedComment = done('addComment');
export const isPostDeleteComment = loading('deleteComment');
export const isPostDeletedComment = done('deleteComment');
export const isPostDeleteAll = loading('deleteAll');
export const isPostDeletedAll = done('deleteAll');
