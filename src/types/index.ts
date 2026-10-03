export interface ApiResult<T = unknown> {
  status: 'success' | 'fail';
  message: string;
  data?: T;
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string | null;
  photo: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostAuthor {
  name: string;
  photo: string | null;
}

export interface PostComment {
  id: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

/** Postingan pada daftar (GET /posts): likes & comments berupa daftar id. */
export interface Post {
  id: number;
  user_id: number;
  cover: string | null;
  description: string;
  created_at: string;
  updated_at: string;
  author: PostAuthor;
  likes: number[];
  comments: number[];
}

/** Postingan pada detail (GET /posts/:id): comments berupa objek komentar. */
export interface PostDetail extends Omit<Post, 'comments'> {
  comments: PostComment[];
  my_comment?: PostComment | null;
}
