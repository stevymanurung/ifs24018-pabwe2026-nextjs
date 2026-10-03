# ifs24018-pabwe2026-nextjs — Ruang Post

Aplikasi Postingan (PABWE 2026, tugas 2.2) berbasis **Next.js (App Router) + TypeScript + Tailwind CSS v4**,
memakai REST API Delcom (`https://open-api.delcom.org/api/v1`), state management Redux Toolkit,
SweetAlert2, react-icons, dan Google Font (Bricolage Grotesque).

## Menjalankan di VSCode / lokal

```bash
bun install            # memasang dependensi
bun run dev            # development (Turbopack) -> http://localhost:3000
bun run serve          # launcher src/server.ts, port dari APP_PORT pada .env
bun run build && bun run start   # produksi
bun run lint           # ESLint
bun run test           # Vitest + coverage v8 (threshold 100%)
```

Berkas `.env` (contoh: `.env.example`):

```
NEXT_PUBLIC_DELCOM_BASEURL=https://open-api.delcom.org/api/v1
APP_PORT=3000
```

## Halaman

| Path | Akses | Keterangan |
| --- | --- | --- |
| `/auth/login` | publik | Login (`#login-email-input`, `#login-password-input`, `#login-submit-button`) |
| `/auth/register` | publik | Registrasi akun |
| `/` | login | Linimasa postingan, filter "Milik saya" (`?filter=me`), live search, tambah postingan |
| `/posts/[postId]` | login | Detail, like, komentar, ubah/hapus postingan, ubah cover |
| `/users` | login | Direktori pengguna + pencarian |
| `/profile` | login | Ubah profil, foto, dan kata sandi |

## Deploy ke Netlify

1. Push ke GitHub dengan nama repositori `ifs24018-pabwe2026-nextjs`.
2. Netlify → *Add new site → Import from Git*, pilih repositori tersebut.
3. **Site name** wajib `ifs24018-pabwe2026-nextjs` (URL: `https://ifs24018-pabwe2026-nextjs.netlify.app`).
4. Build command `npm run build` (sudah di `netlify.toml`). Variabel `NEXT_PUBLIC_DELCOM_BASEURL` juga sudah di `netlify.toml`.
