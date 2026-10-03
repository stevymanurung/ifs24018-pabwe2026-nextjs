/**
 * Konfigurasi konstanta aplikasi yang terpusat.
 * Nilai dibaca dari .env (NEXT_PUBLIC_DELCOM_BASEURL dan APP_PORT).
 */
export const DELCOM_BASEURL: string = (
  process.env.NEXT_PUBLIC_DELCOM_BASEURL ?? 'https://open-api.delcom.org/api/v1'
).replace(/\/$/, '');

export const APP_PORT: number = Number(process.env.APP_PORT ?? 3000);
