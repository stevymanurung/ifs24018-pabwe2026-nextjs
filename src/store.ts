import { configureStore } from '@reduxjs/toolkit';
import { isAuthLogin, isAuthLogout, isAuthRegister } from '@/features/auth/states/reducer';
import {
  isChangeProfile,
  isChangeProfilePassword,
  isChangeProfilePhoto,
  isProfile,
  profile,
  user,
  users,
} from '@/features/users/states/reducer';
import {
  isPost,
  isPostAdd,
  isPostAddComment,
  isPostAdded,
  isPostAddedComment,
  isPostChange,
  isPostChangeCover,
  isPostChanged,
  isPostChangedCover,
  isPostDelete,
  isPostDeleteAll,
  isPostDeleteComment,
  isPostDeleted,
  isPostDeletedAll,
  isPostDeletedComment,
  isPostLike,
  isPostLiked,
  post,
  posts,
} from '@/features/posts/states/reducer';

export const reducer = {
  // auth
  isAuthLogin,
  isAuthRegister,
  isAuthLogout,
  // users
  users,
  user,
  profile,
  isProfile,
  isChangeProfile,
  isChangeProfilePhoto,
  isChangeProfilePassword,
  // posts
  posts,
  post,
  isPost,
  isPostAdd,
  isPostAdded,
  isPostChange,
  isPostChanged,
  isPostChangeCover,
  isPostChangedCover,
  isPostDelete,
  isPostDeleted,
  isPostLike,
  isPostLiked,
  isPostAddComment,
  isPostAddedComment,
  isPostDeleteComment,
  isPostDeletedComment,
  isPostDeleteAll,
  isPostDeletedAll,
};

export const makeStore = (preloadedState?: Partial<RootState>) =>
  configureStore({ reducer, preloadedState });

export const store = makeStore();

export type RootState = {
  [K in keyof typeof reducer]: ReturnType<(typeof reducer)[K]>;
};
export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = typeof store.dispatch;
