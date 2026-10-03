import { callApi, runMutation } from '@/helpers/thunkHelper';
import { showSuccessDialog } from '@/helpers/toolsHelper';
import {
  addComment,
  addPost,
  changePost,
  changePostCover,
  deleteAllPosts,
  deleteComment,
  deletePost,
  getPost,
  getPosts,
  likePost,
} from '@/features/posts/api/postApi';
import type { AppDispatch } from '@/store';
import type { Post, PostDetail } from '@/types';
import type { AppAction, MutationPhase } from '@/types/action';

export const PostActionType = {
  RECEIVE_POSTS: 'posts/receivePosts',
  RECEIVE_POST: 'posts/receivePost',
  CLEAR_POST: 'posts/clearPost',
} as const;

export type PostMutation =
  | 'fetch'
  | 'add'
  | 'change'
  | 'changeCover'
  | 'delete'
  | 'like'
  | 'addComment'
  | 'deleteComment'
  | 'deleteAll';

export const postMutationType = (name: PostMutation, phase: MutationPhase) =>
  `posts/${name}/${phase}`;

export const receivePostsActionCreator = (posts: Post[]): AppAction<Post[]> => ({
  type: PostActionType.RECEIVE_POSTS,
  payload: posts,
});

export const receivePostActionCreator = (post: PostDetail): AppAction<PostDetail> => ({
  type: PostActionType.RECEIVE_POST,
  payload: post,
});

export const clearPostActionCreator = (): AppAction => ({ type: PostActionType.CLEAR_POST });

export const postMutationActionCreator = (name: PostMutation, phase: MutationPhase): AppAction => ({
  type: postMutationType(name, phase),
});

/** Memuat daftar postingan. `showLoading` = tampilkan indikator muat (false saat refresh senyap). */
export function asyncReceivePosts(isMe: boolean, showLoading: boolean) {
  return async (dispatch: AppDispatch): Promise<void> => {
    if (showLoading) dispatch(postMutationActionCreator('fetch', 'request'));
    const result = await callApi(() => getPosts(isMe), false);
    if (result) dispatch(receivePostsActionCreator(result.data!.posts));
    dispatch(postMutationActionCreator('fetch', result ? 'success' : 'failure'));
  };
}

export function asyncReceivePost(postId: number, showLoading: boolean) {
  return async (dispatch: AppDispatch): Promise<boolean> => {
    if (showLoading) dispatch(postMutationActionCreator('fetch', 'request'));
    const result = await callApi(() => getPost(postId), false);
    if (result) dispatch(receivePostActionCreator(result.data!.post));
    dispatch(postMutationActionCreator('fetch', result ? 'success' : 'failure'));
    return result !== null;
  };
}

/** Menambah postingan; mengembalikan id postingan baru atau null bila gagal. */
export function asyncAddPost(description: string) {
  return async (dispatch: AppDispatch): Promise<number | null> => {
    const result = await runMutation(
      dispatch,
      (phase) => postMutationActionCreator('add', phase),
      () => addPost(description),
    );
    if (!result) return null;
    await showSuccessDialog(result.message);
    return result.data!.post_id;
  };
}

export function asyncChangePost(postId: number, description: string) {
  return async (dispatch: AppDispatch): Promise<boolean> => {
    const result = await runMutation(
      dispatch,
      (phase) => postMutationActionCreator('change', phase),
      () => changePost(postId, description),
    );
    if (!result) return false;
    await showSuccessDialog(result.message);
    return true;
  };
}

export function asyncChangePostCover(postId: number, cover: File) {
  return async (dispatch: AppDispatch): Promise<boolean> => {
    const result = await runMutation(
      dispatch,
      (phase) => postMutationActionCreator('changeCover', phase),
      () => changePostCover(postId, cover),
    );
    if (!result) return false;
    await showSuccessDialog(result.message);
    return true;
  };
}

export function asyncDeletePost(postId: number) {
  return async (dispatch: AppDispatch): Promise<boolean> => {
    const result = await runMutation(
      dispatch,
      (phase) => postMutationActionCreator('delete', phase),
      () => deletePost(postId),
    );
    if (!result) return false;
    await showSuccessDialog(result.message);
    return true;
  };
}

/** Memberi (like = true) atau membatalkan (like = false) suka. */
export function asyncLikePost(postId: number, like: boolean) {
  return async (dispatch: AppDispatch): Promise<boolean> => {
    const result = await runMutation(
      dispatch,
      (phase) => postMutationActionCreator('like', phase),
      () => likePost(postId, like),
    );
    return result !== null;
  };
}

export function asyncAddComment(postId: number, comment: string) {
  return async (dispatch: AppDispatch): Promise<boolean> => {
    const result = await runMutation(
      dispatch,
      (phase) => postMutationActionCreator('addComment', phase),
      () => addComment(postId, comment),
    );
    return result !== null;
  };
}

export function asyncDeleteComment(postId: number) {
  return async (dispatch: AppDispatch): Promise<boolean> => {
    const result = await runMutation(
      dispatch,
      (phase) => postMutationActionCreator('deleteComment', phase),
      () => deleteComment(postId),
    );
    return result !== null;
  };
}

export function asyncDeleteAllPosts() {
  return async (dispatch: AppDispatch): Promise<boolean> => {
    const result = await runMutation(
      dispatch,
      (phase) => postMutationActionCreator('deleteAll', phase),
      () => deleteAllPosts(),
    );
    if (!result) return false;
    await showSuccessDialog(result.message);
    return true;
  };
}
