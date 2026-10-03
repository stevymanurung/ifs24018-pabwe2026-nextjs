import { beforeEach, describe, expect, it, vi } from 'vitest';

const fire = vi.fn();
vi.mock('sweetalert2', () => ({ default: { fire: (...args: unknown[]) => fire(...args) } }));

import {
  formatDate,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
  showWarningDialog,
} from '@/helpers/toolsHelper';

beforeEach(() => {
  fire.mockReset();
  fire.mockResolvedValue({ isConfirmed: true });
});

describe('dialog helpers', () => {
  it.each([
    ['success', showSuccessDialog],
    ['error', showErrorDialog],
    ['warning', showWarningDialog],
  ] as const)('menampilkan dialog %s', async (icon, show) => {
    await show('pesan');
    expect(fire).toHaveBeenCalledWith(expect.objectContaining({ icon, text: 'pesan' }));
  });

  it('mengembalikan hasil konfirmasi', async () => {
    expect(await showConfirmDialog('Judul', 'Isi')).toBe(true);
    fire.mockResolvedValue({ isConfirmed: false });
    expect(await showConfirmDialog('Judul', 'Isi')).toBe(false);
    expect(fire).toHaveBeenCalledWith(
      expect.objectContaining({ icon: 'question', title: 'Judul', showCancelButton: true }),
    );
  });
});

describe('formatDate', () => {
  it('memformat tanggal ke bahasa Indonesia', () => {
    const text = formatDate('2026-10-02T03:07:11.000000Z');
    expect(text).toContain('2026');
    expect(text).toContain('Oktober');
  });
});
