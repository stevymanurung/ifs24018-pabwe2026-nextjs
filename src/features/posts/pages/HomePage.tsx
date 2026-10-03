'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi';
import Spinner from '@/components/Spinner';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useInput } from '@/hooks/useInput';
import { showConfirmDialog } from '@/helpers/toolsHelper';
import PostCard from '@/features/posts/components/PostCard';
import AddModal from '@/features/posts/components/modals/AddModal';
import {
  asyncDeleteAllPosts,
  asyncLikePost,
  asyncReceivePosts,
} from '@/features/posts/states/action';
import type { Post } from '@/types';

export default function HomePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isMe = useSearchParams().get('filter') === 'me';
  const posts = useAppSelector((state) => state.posts);
  const loading = useAppSelector((state) => state.isPost);
  const profile = useAppSelector((state) => state.profile);
  const [query, onQueryChange] = useInput('');
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    dispatch(asyncReceivePosts(isMe, true));
  }, [dispatch, isMe]);

  const keyword = query.trim().toLowerCase();
  const visiblePosts = posts.filter((post) =>
    `${post.description} ${post.author.name}`.toLowerCase().includes(keyword),
  );

  async function handleToggleLike(post: Post, liked: boolean) {
    await dispatch(asyncLikePost(post.id, !liked));
    await dispatch(asyncReceivePosts(isMe, false));
  }

  async function handleDeleteAll() {
    const confirmed = await showConfirmDialog(
      'Hapus semua postingan saya?',
      'Seluruh postingan beserta cover, suka, dan komentarnya akan dihapus permanen.',
    );
    if (!confirmed) return;
    if (await dispatch(asyncDeleteAllPosts())) {
      await dispatch(asyncReceivePosts(isMe, true));
    }
  }

  function renderList() {
    if (loading) return <Spinner label="Memuat postingan..." />;
    if (visiblePosts.length === 0) {
      return (
        <p className="card p-10 text-center text-muted">
          {posts.length === 0
            ? 'Belum ada postingan di sini. Jadilah yang pertama membagikan sesuatu!'
            : 'Tidak ada postingan yang cocok dengan pencarian Anda.'}
        </p>
      );
    }
    return (
      <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {visiblePosts.map((post) => (
          <li key={post.id} className="flex">
            <div className="w-full">
              <PostCard
                post={post}
                liked={post.likes.includes(profile?.id ?? -1)}
                onToggleLike={handleToggleLike}
              />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {isMe ? 'Postingan Saya' : 'Semua Postingan'}
          </h1>
          <p className="mt-1 text-muted">
            {isMe ? 'Kelola postingan yang pernah Anda buat.' : 'Linimasa terbaru dari semua pengguna.'}
          </p>
        </div>
        <button type="button" onClick={() => setAddOpen(true)} className="btn btn-primary">
          <FiPlus aria-hidden="true" className="size-5" />
          Tambah Postingan
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          <Link
            href="/"
            aria-current={isMe ? undefined : 'page'}
            className={`btn ${isMe ? 'btn-secondary' : 'btn-primary'}`}
          >
            Semua
          </Link>
          <Link
            href="/?filter=me"
            aria-current={isMe ? 'page' : undefined}
            className={`btn ${isMe ? 'btn-primary' : 'btn-secondary'}`}
          >
            Milik saya
          </Link>
        </div>
        <div className="relative min-w-60 flex-1 sm:max-w-md">
          <label htmlFor="post-search-input" className="sr-only">
            Cari postingan
          </label>
          <FiSearch
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted"
          />
          <input
            id="post-search-input"
            type="search"
            value={query}
            onChange={onQueryChange}
            placeholder="Cari deskripsi atau nama pembuat"
            className="field pl-10"
          />
        </div>
        {isMe && posts.length > 0 && (
          <button type="button" onClick={handleDeleteAll} className="btn btn-secondary ml-auto text-danger">
            <FiTrash2 aria-hidden="true" className="size-4" />
            Hapus semua postingan saya
          </button>
        )}
      </div>

      <div className="mt-8">{renderList()}</div>

      {addOpen && (
        <AddModal
          onClose={() => setAddOpen(false)}
          onAdded={(postId) => {
            setAddOpen(false);
            router.push(`/posts/${postId}`);
          }}
        />
      )}
    </>
  );
}
