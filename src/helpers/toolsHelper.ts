const BRAND_COLOR = '#0b6b8a';
const DANGER_COLOR = '#b42318';

async function getSwal() {
  // Dimuat secara lazy agar bundle awal tetap kecil (Lighthouse Performance).
  return (await import('sweetalert2')).default;
}

export async function showSuccessDialog(message: string): Promise<void> {
  const Swal = await getSwal();
  await Swal.fire({
    icon: 'success',
    title: 'Berhasil',
    text: message,
    confirmButtonText: 'Tutup',
    confirmButtonColor: BRAND_COLOR,
  });
}

export async function showErrorDialog(message: string): Promise<void> {
  const Swal = await getSwal();
  await Swal.fire({
    icon: 'error',
    title: 'Terjadi Kesalahan',
    text: message,
    confirmButtonText: 'Tutup',
    confirmButtonColor: DANGER_COLOR,
  });
}

export async function showWarningDialog(message: string): Promise<void> {
  const Swal = await getSwal();
  await Swal.fire({
    icon: 'warning',
    title: 'Perhatian',
    text: message,
    confirmButtonText: 'Mengerti',
    confirmButtonColor: BRAND_COLOR,
  });
}

export async function showConfirmDialog(title: string, message: string): Promise<boolean> {
  const Swal = await getSwal();
  const result = await Swal.fire({
    icon: 'question',
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: 'Ya, lanjutkan',
    cancelButtonText: 'Batal',
    confirmButtonColor: DANGER_COLOR,
    cancelButtonColor: '#475569',
    reverseButtons: true,
  });
  return result.isConfirmed;
}

/** Memformat tanggal ISO menjadi tanggal & waktu bahasa Indonesia. */
export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
