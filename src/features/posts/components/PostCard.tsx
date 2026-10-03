/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { FiHeart, FiMessageCircle } from 'react-icons/fi';
import Avatar from '@/components/Avatar';
import { resolveAssetUrl } from '@/helpers/apiHelper';
import { formatDate } from '@/helpers/toolsHelper';
import type { Post } from '@/types';

interface PostCardProps {
  post: Post;
  liked: boolean;
  onToggleLike: (post: Post, liked: boolean) => void;
}

export default function PostCard({ post, liked, onToggleLike }: PostCardProps) {
  const cover = resolveAssetUrl(post.cover);

  return (
    <article className="card flex flex-col overflow-hidden">
      {cover ? (
        <img
          src={cover}
          alt={`Cover postingan ${post.author.name}`}
          width={640}
          height={360}
          loading="lazy"
          decoding="async"
          className="aspect-video w-full bg-brand-soft object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex aspect-video w-full items-center justify-center bg-brand-soft text-sm font-medium text-brand-dark"
        >
          Tanpa cover
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-3">
          <Avatar name={post.author.name} photo={post.author.photo} size="md" />
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold">{post.author.name}</h2>
            <p className="text-sm text-muted">{formatDate(post.created_at)}</p>
          </div>
        </div>
        <p className="line-clamp-3 flex-1 whitespace-pre-line text-base">{post.description}</p>
        <div className="flex items-center justify-between gap-2 border-t border-line pt-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-pressed={liked}
              onClick={() => onToggleLike(post, liked)}
              className={`btn btn-ghost px-3 ${liked ? 'text-danger' : ''}`}
            >
              <FiHeart aria-hidden="true" className={`size-5 ${liked ? 'fill-current' : ''}`} />
              <span>{post.likes.length}</span>
              {' '}
              <span className="sr-only">suka</span>
            </button>
            <span className="inline-flex min-h-11 items-center gap-2 px-3 text-sm font-semibold text-muted">
              <FiMessageCircle aria-hidden="true" className="size-5" />
              <span>{post.comments.length}</span>
              {' '}
              <span className="sr-only">komentar</span>
            </span>
          </div>
          <Link
            href={`/posts/${post.id}`}
            className="btn btn-secondary"
            aria-label={`Lihat detail postingan ${post.author.name}`}
          >
            Lihat detail
          </Link>
        </div>
      </div>
    </article>
  );
}
