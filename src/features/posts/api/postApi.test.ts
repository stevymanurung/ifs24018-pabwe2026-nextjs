import { describe, expect, it, vi } from 'vitest';

vi.mock('@/helpers/apiHelper', () => ({ apiFetch: vi.fn().mockResolvedValue({ status: 'success' }) }));

import { apiFetch } from '@/helpers/apiHelper';
import * as api from '@/features/posts/api/postApi';

const lastCall = () => vi.mocked(apiFetch).mock.calls.at(-1)!;

describe('postApi', () => {
  it('getPosts semua postingan tanpa is_me', async () => {
    await api.getPosts(false);
    expect(apiFetch).toHaveBeenCalledWith('/posts', { params: { is_me: undefined } });
  });

  it('getPosts milik sendiri dengan is_me=1', async () => {
    await api.getPosts(true);
    expect(apiFetch).toHaveBeenCalledWith('/posts', { params: { is_me: 1 } });
  });

  it('getPost', async () => {
    await api.getPost(7);
    expect(apiFetch).toHaveBeenCalledWith('/posts/7', {});
  });

  it('addPost', async () => {
    await api.addPost('halo');
    expect(apiFetch).toHaveBeenCalledWith('/posts', { method: 'POST', body: { description: 'halo' } });
  });

  it('changePost', async () => {
    await api.changePost(7, 'baru');
    expect(apiFetch).toHaveBeenCalledWith('/posts/7', { method: 'PUT', body: { description: 'baru' } });
  });

  it('changePostCover mengirim FormData', async () => {
    const file = new File(['x'], 'c.png', { type: 'image/png' });
    await api.changePostCover(7, file);
    const [path, options] = lastCall();
    expect(path).toBe('/posts/7/cover');
    expect(options.method).toBe('POST');
    expect(options.formData?.get('cover')).toBe(file);
  });

  it('deletePost', async () => {
    await api.deletePost(7);
    expect(apiFetch).toHaveBeenCalledWith('/posts/7', { method: 'DELETE' });
  });

  it('likePost memberi dan membatalkan suka', async () => {
    await api.likePost(7, true);
    expect(lastCall()).toEqual(['/posts/7/likes', { method: 'POST', body: { like: 1 } }]);
    await api.likePost(7, false);
    expect(lastCall()).toEqual(['/posts/7/likes', { method: 'POST', body: { like: 0 } }]);
  });

  it('addComment', async () => {
    await api.addComment(7, 'keren');
    expect(apiFetch).toHaveBeenCalledWith('/posts/7/comments', { method: 'POST', body: { comment: 'keren' } });
  });

  it('deleteComment', async () => {
    await api.deleteComment(7);
    expect(apiFetch).toHaveBeenCalledWith('/posts/7/comments', { method: 'DELETE' });
  });

  it('deleteAllPosts', async () => {
    await api.deleteAllPosts();
    expect(apiFetch).toHaveBeenCalledWith('/posts', { method: 'DELETE' });
  });
});
