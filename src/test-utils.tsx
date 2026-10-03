import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store';
import type { RootState } from '@/store';
import type { ApiResult, Post, PostDetail, User } from '@/types';

export function renderWithProviders(ui: ReactElement, preloadedState?: Partial<RootState>) {
  const store = makeStore(preloadedState);
  return { store, ...render(<Provider store={store}>{ui}</Provider>) };
}

export const ok = <T,>(data?: T, message = 'Berhasil') => ({
  status: 'success' as const,
  message,
  data,
});

export const fail = (message = 'Gagal', data?: Record<string, string[]>): ApiResult<never> => ({
  status: 'fail',
  message,
  data: data as never,
});

export const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  name: 'Stiy Del',
  email: 'ifs24018@del.ac.id',
  photo: null,
  created_at: '2026-10-01T00:00:00.000000Z',
  updated_at: '2026-10-01T00:00:00.000000Z',
  ...overrides,
});

export const makePost = (overrides: Partial<Post> = {}): Post => ({
  id: 10,
  user_id: 2,
  cover: 'http://open-api.delcom.org/img/posts/cover/a.jpeg',
  description: 'Belajar Next.js itu seru',
  created_at: '2026-10-02T03:07:11.000000Z',
  updated_at: '2026-10-02T03:07:11.000000Z',
  author: { name: 'Budi', photo: null },
  likes: [],
  comments: [],
  ...overrides,
});

export const makePostDetail = (overrides: Partial<PostDetail> = {}): PostDetail => ({
  ...makePost(),
  comments: [],
  my_comment: null,
  ...overrides,
});
