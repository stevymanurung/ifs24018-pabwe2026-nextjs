/* eslint-disable @next/next/no-img-element */
import { resolveAssetUrl } from '@/helpers/apiHelper';

const SIZES = { sm: 'size-8 text-sm', md: 'size-10 text-base', lg: 'size-24 text-3xl' } as const;
const PIXELS = { sm: 32, md: 40, lg: 96 } as const;

interface AvatarProps {
  name: string;
  photo: string | null;
  size: keyof typeof SIZES;
}

/** Foto profil bulat; memakai inisial nama bila foto belum diatur. */
export default function Avatar({ name, photo, size }: AvatarProps) {
  const src = resolveAssetUrl(photo);
  const classes = `${SIZES[size]} shrink-0 rounded-full`;

  if (src) {
    return (
      <img
        src={src}
        alt=""
        width={PIXELS[size]}
        height={PIXELS[size]}
        loading="lazy"
        decoding="async"
        className={`${classes} bg-brand-soft object-cover`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`${classes} inline-flex items-center justify-center bg-brand-soft font-bold text-brand-dark`}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}
