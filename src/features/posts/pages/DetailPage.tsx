/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft, FiEdit2, FiHeart, FiImage, FiTrash2 } from 'react-icons/fi';
import Avatar from '@/components/Avatar';
import Spinner from '@/components/Spinner';
import { resolveAssetUrl } from '@/helpers/apiHelper';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useInput } from '@/hooks/useInput';
import { formatDate, showConfirmDialog, showWarningDialog } from '@/helpers/toolsHelper';
import ChangeCoverModal from '@/features/posts/components/modals/ChangeCoverModal';
import ChangeModal from '@/features/posts/components/modals/ChangeModal';
import {
  asyncAddComment,
  asyncDeleteComment,
  asyncDeletePost,
  asyncLikePost,
  asyncReceivePost,
  clearPostActionCreator,
} from '@/features/posts/states/action';

type Status = 'loading' | 'ready' | 'missing';

export default function DetailPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const postId = Number(useParams<{ postId: string }>().postId);
  const post = useAppSelector((state) => state.post);
  const profile = useAppSelector((state) => state.profile);
  const sendingComment = useAppSelector((state) => state.isPostAddComment);
  const [status, setStatus] = useState<Status>('loading');
  const [comment, onCommentChange, setComment] = useInput('');
  const [changeOpen, setChangeOpen] = useState(false);
  const [coverOpen, setCoverOpen] = useState(false);

  useEffect(() => {
    dispatch(asyncReceivePost(postId, true)).then((ok) => setStatus(ok ? 'ready' : 'missing'));
    return () => {
      dispatch(clearPostActionCreator());
    };
  }, [dispatch, postId]);

  const refresh = () => dispatch(asyncReceivePost(postId, false));

  if (status === 'missing') {
    return (
      <div className="card p-10 text-center">
        <h1 className="text-2xl font-extrabold">Postingan tidak ditemukan</h1>
        <p className="mt-2 text-muted">Postingan mungkin sudah dihapus atau tidak dapat diakses.</p>
        <Link href="/" className="btn btn-primary mt-6">
          Kembali ke linimasa
        </Link>
      </div>
    );
  }

  if (!post) return <Spinner label="Memuat postingan..." />;

  const cover = resolveAssetUrl(post.cover);
  const myId = profile?.id ?? -1;
  const liked = post.likes.includes(myId);
  const isOwner = post.user_id === myId;

  async function handleLike() {
    await dispatch(asyncLikePost(postId, !liked));
    await refresh();
  }

  async function handleDelete() {
    const confirmed = await showConfirmDialog(
      'Hapus postingan ini?',
      'Postingan yang dihapus tidak dapat dikembalikan.',
    );
    if (confirmed && (await dispatch(asyncDeletePost(postId)))) router.replace('/');
  }

  async function handleAddComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!comment.trim()) {
      await showWarningDialog('Komentar tidak boleh kosong.');
      return;
    }
    if (await dispatch(asyncAddComment(postId, comment.trim()))) {
      setComment('');
      await refresh();
    }
  }

  async function handleDeleteComment() {
    const confirmed = await showConfirmDialog('Hapus komentar Anda?', 'Komentar akan dihapus.');
    if (confirmed && (await dispatch(asyncDeleteComment(postId)))) await refresh();
  }

  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/" className="btn btn-ghost -ml-3 mb-4">
        <FiArrowLeft aria-hidden="true" className="size-5" />
        Kembali ke linimasa
      </Link>
      <h1 className="sr-only">Detail postingan dari {post.author.name}</h1>

      <div className="card overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={`Cover postingan ${post.author.name}`}
            width={960}
            height={540}
            decoding="async"
            className="aspect-video w-full bg-brand-soft object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex aspect-video w-full items-center justify-center bg-brand-soft font-medium text-brand-dark"
          >
            Tanpa cover
          </div>
        )}
        <div className="space-y-5 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <Avatar name={post.author.name} photo={post.author.photo} size="md" />
            <div className="min-w-0">
              <p className="truncate font-bold">{post.author.name}</p>
              <p className="text-sm text-muted">Dipublikasikan {formatDate(post.created_at)}</p>
            </div>
          </div>
          <p className="whitespace-pre-line text-lg leading-relaxed">{post.description}</p>

          <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
            <button
              type="button"
              aria-pressed={liked}
              onClick={handleLike}
              className={`btn btn-secondary ${liked ? 'text-danger' : ''}`}
            >
              <FiHeart aria-hidden="true" className={`size-5 ${liked ? 'fill-current' : ''}`} />
              <span>{post.likes.length}</span>
              {' '}
              <span className="sr-only">suka</span>
            </button>
            {isOwner && (
              <>
                <button type="button" onClick={() => setCoverOpen(true)} className="btn btn-secondary">
                  <FiImage aria-hidden="true" className="size-4" />
                  Ubah cover
                </button>
                <button type="button" onClick={() => setChangeOpen(true)} className="btn btn-secondary">
                  <FiEdit2 aria-hidden="true" className="size-4" />
                  Ubah postingan
                </button>
                <button type="button" onClick={handleDelete} className="btn btn-danger ml-auto">
                  <FiTrash2 aria-hidden="true" className="size-4" />
                  Hapus postingan
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <section aria-labelledby="comments-heading" className="mt-8">
        <h2 id="comments-heading" className="text-xl font-bold">
          Komentar ({post.comments.length})
        </h2>

        <form onSubmit={handleAddComment} noValidate className="card mt-4 space-y-3 p-5">
          <label htmlFor="comment-input" className="label">
            Tulis komentar
          </label>
          <textarea
            id="comment-input"
            rows={3}
            value={comment}
            onChange={onCommentChange}
            placeholder="Bagikan tanggapan Anda"
            className="field"
          />
          <div className="flex justify-end">
            <button type="submit" disabled={sendingComment} className="btn btn-primary">
              {sendingComment ? 'Mengirim...' : 'Kirim komentar'}
            </button>
          </div>
        </form>

        {post.comments.length === 0 ? (
          <p className="mt-4 text-muted">Belum ada komentar. Mulailah percakapan!</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {post.comments.map((item) => {
              const mine = item.id === post.my_comment?.id;
              return (
                <li key={item.id} className="card flex items-start justify-between gap-4 p-5">
                  <div className="min-w-0">
                    <p className="whitespace-pre-line break-words">{item.comment}</p>
                    <p className="mt-1 text-sm text-muted">
                      {mine ? 'Komentar Anda · ' : ''}
                      {formatDate(item.created_at)}
                    </p>
                  </div>
                  {mine && (
                    <button type="button" onClick={handleDeleteComment} className="btn btn-secondary shrink-0 text-danger">
                      <FiTrash2 aria-hidden="true" className="size-4" />
                      Hapus komentar saya
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {changeOpen && (
        <ChangeModal
          postId={postId}
          description={post.description}
          onClose={() => setChangeOpen(false)}
          onChanged={() => {
            setChangeOpen(false);
            refresh();
          }}
        />
      )}
      {coverOpen && (
        <ChangeCoverModal
          postId={postId}
          onClose={() => setCoverOpen(false)}
          onChanged={() => {
            setCoverOpen(false);
            refresh();
          }}
        />
      )}
    </article>
  );
}
