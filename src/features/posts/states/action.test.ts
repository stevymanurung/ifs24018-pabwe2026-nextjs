import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/posts/api/postApi');
vi.mock('@/helpers/toolsHelper', () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

import { showSuccessDialog } from '@/helpers/toolsHelper';
import * as api from '@/features/posts/api/postApi';
import {
  PostActionType,
  asyncAddComment,
  asyncAddPost,
  asyncChangePost,
  asyncChangePostCover,
  asyncDeleteAllPosts,
  asyncDeleteComment,
  asyncDeletePost,
  asyncLikePost,
  asyncReceivePost,
  asyncReceivePosts,
  clearPostActionCreator,
  postMutationActionCreator,
  receivePostActionCreator,
  receivePostsActionCreator,
} from '@/features/posts/states/action';
import { makeStore } from '@/store';
import { fail, makePost, makePostDetail, ok } from '@/test-utils';

const file = new File(['x'], 'c.png', { type: 'image/png' });

beforeEach(() => vi.clearAllMocks());

describe('posts action creators', () => {
  it('membuat action', () => {
    const p = makePost();
    const d = makePostDetail();
    expect(receivePostsActionCreator([p])).toEqual({ type: PostActionType.RECEIVE_POSTS, payload: [p] });
    expect(receivePostActionCreator(d)).toEqual({ type: PostActionType.RECEIVE_POST, payload: d });
    expect(clearPostActionCreator()).toEqual({ type: PostActionType.CLEAR_POST });
    expect(postMutationActionCreator('add', 'request')).toEqual({ type: 'posts/add/request' });
  });
});

describe('asyncReceivePosts', () => {
  it('mengisi daftar postingan (dengan indikator muat)', async () => {
    vi.mocked(api.getPosts).mockResolvedValue(ok({ posts: [makePost()] }));
    const store = makeStore();
    const types: string[] = [];
    store.subscribe(() => types.push(String(store.getState().isPost)));
    await store.dispatch(asyncReceivePosts(true, true));
    expect(api.getPosts).toHaveBeenCalledWith(true);
    expect(store.getState().posts).toHaveLength(1);
    expect(store.getState().isPost).toBe(false);
    expect(types).toContain('true');
  });

  it('refresh senyap tidak menyalakan indikator muat', async () => {
    vi.mocked(api.getPosts).mockResolvedValue(ok({ posts: [] }));
    const store = makeStore();
    const seen: boolean[] = [];
    store.subscribe(() => seen.push(store.getState().isPost));
    await store.dispatch(asyncReceivePosts(false, false));
    expect(seen).not.toContain(true);
  });

  it('gagal membiarkan daftar kosong', async () => {
    vi.mocked(api.getPosts).mockResolvedValue(fail('Gagal'));
    const store = makeStore();
    await store.dispatch(asyncReceivePosts(false, true));
    expect(store.getState().posts).toEqual([]);
    expect(store.getState().isPost).toBe(false);
  });
});

describe('asyncReceivePost', () => {
  it('mengisi detail postingan', async () => {
    vi.mocked(api.getPost).mockResolvedValue(ok({ post: makePostDetail() }));
    const store = makeStore();
    expect(await store.dispatch(asyncReceivePost(10, true))).toBe(true);
    expect(store.getState().post?.id).toBe(10);
  });

  it('gagal / senyap', async () => {
    vi.mocked(api.getPost).mockResolvedValue(fail('Tidak ditemukan'));
    const store = makeStore();
    expect(await store.dispatch(asyncReceivePost(10, false))).toBe(false);
    expect(store.getState().post).toBeNull();
  });
});

describe('asyncAddPost', () => {
  it('mengembalikan id postingan baru', async () => {
    vi.mocked(api.addPost).mockResolvedValue(ok({ post_id: 6 }, 'Berhasil menambahkan data'));
    const store = makeStore();
    expect(await store.dispatch(asyncAddPost('halo'))).toBe(6);
    expect(store.getState().isPostAdded).toBe(true);
    expect(showSuccessDialog).toHaveBeenCalledWith('Berhasil menambahkan data');
  });

  it('gagal mengembalikan null', async () => {
    vi.mocked(api.addPost).mockResolvedValue(fail());
    const store = makeStore();
    expect(await store.dispatch(asyncAddPost('halo'))).toBeNull();
    expect(store.getState().isPostAdded).toBe(false);
  });
});

describe.each([
  ['asyncChangePost', (s: ReturnType<typeof makeStore>) => s.dispatch(asyncChangePost(1, 'x')), api.changePost],
  ['asyncChangePostCover', (s: ReturnType<typeof makeStore>) => s.dispatch(asyncChangePostCover(1, file)), api.changePostCover],
  ['asyncDeletePost', (s: ReturnType<typeof makeStore>) => s.dispatch(asyncDeletePost(1)), api.deletePost],
  ['asyncDeleteAllPosts', (s: ReturnType<typeof makeStore>) => s.dispatch(asyncDeleteAllPosts()), api.deleteAllPosts],
] as const)('%s', (_name, run, apiFn) => {
  it('sukses menampilkan dialog sukses', async () => {
    vi.mocked(apiFn as () => Promise<never>).mockResolvedValue(ok(undefined, 'Berhasil') as never);
    expect(await run(makeStore())).toBe(true);
    expect(showSuccessDialog).toHaveBeenCalledWith('Berhasil');
  });

  it('gagal mengembalikan false', async () => {
    vi.mocked(apiFn as () => Promise<never>).mockResolvedValue(fail() as never);
    expect(await run(makeStore())).toBe(false);
    expect(showSuccessDialog).not.toHaveBeenCalled();
  });
});

describe.each([
  ['asyncLikePost', (s: ReturnType<typeof makeStore>) => s.dispatch(asyncLikePost(1, true)), api.likePost],
  ['asyncAddComment', (s: ReturnType<typeof makeStore>) => s.dispatch(asyncAddComment(1, 'k')), api.addComment],
  ['asyncDeleteComment', (s: ReturnType<typeof makeStore>) => s.dispatch(asyncDeleteComment(1)), api.deleteComment],
] as const)('%s', (_name, run, apiFn) => {
  it('sukses mengembalikan true tanpa dialog', async () => {
    vi.mocked(apiFn as () => Promise<never>).mockResolvedValue(ok() as never);
    expect(await run(makeStore())).toBe(true);
    expect(showSuccessDialog).not.toHaveBeenCalled();
  });

  it('gagal mengembalikan false', async () => {
    vi.mocked(apiFn as () => Promise<never>).mockResolvedValue(fail() as never);
    expect(await run(makeStore())).toBe(false);
  });
});
