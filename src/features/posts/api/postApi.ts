import { apiFetch } from '@/helpers/apiHelper';
import type { Post, PostDetail } from '@/types';

export function getPosts(isMe: boolean) {
  return apiFetch<{ posts: Post[] }>('/posts', { params: { is_me: isMe ? 1 : undefined } });
}

export function getPost(postId: number) {
  return apiFetch<{ post: PostDetail }>(`/posts/${postId}`, {});
}

export function addPost(description: string) {
  return apiFetch<{ post_id: number }>('/posts', { method: 'POST', body: { description } });
}

export function changePost(postId: number, description: string) {
  return apiFetch(`/posts/${postId}`, { method: 'PUT', body: { description } });
}

export function changePostCover(postId: number, cover: File) {
  const formData = new FormData();
  formData.append('cover', cover);
  return apiFetch(`/posts/${postId}/cover`, { method: 'POST', formData });
}

export function deletePost(postId: number) {
  return apiFetch(`/posts/${postId}`, { method: 'DELETE' });
}

export function likePost(postId: number, like: boolean) {
  return apiFetch(`/posts/${postId}/likes`, { method: 'POST', body: { like: like ? 1 : 0 } });
}

export function addComment(postId: number, comment: string) {
  return apiFetch(`/posts/${postId}/comments`, { method: 'POST', body: { comment } });
}

export function deleteComment(postId: number) {
  return apiFetch(`/posts/${postId}/comments`, { method: 'DELETE' });
}

export function deleteAllPosts() {
  return apiFetch('/posts', { method: 'DELETE' });
}
