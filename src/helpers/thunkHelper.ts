import { showErrorDialog } from '@/helpers/toolsHelper';
import type { ApiResult } from '@/types';
import type { AppAction, MutationPhase } from '@/types/action';

/** Menyusun pesan galat dari respons gagal API (termasuk pesan validasi per field). */
export function formatApiError(result: ApiResult<unknown>): string {
  const details = Object.values((result.data ?? {}) as Record<string, string[]>).flat();
  return details.length ? `${result.message}: ${details.join(' ')}` : result.message;
}

/**
 * Menjalankan pemanggilan API. Mengembalikan hasil bila sukses, atau null bila
 * gagal / jaringan bermasalah (dialog galat ditampilkan kecuali `silent`).
 */
export async function callApi<T>(
  fn: () => Promise<ApiResult<T>>,
  silent: boolean,
): Promise<ApiResult<T> | null> {
  try {
    const result = await fn();
    if (result.status !== 'success') {
      if (!silent) await showErrorDialog(formatApiError(result));
      return null;
    }
    return result;
  } catch (error) {
    if (!silent) {
      await showErrorDialog(
        error instanceof Error ? error.message : 'Terjadi kesalahan pada jaringan.',
      );
    }
    return null;
  }
}

/** Menjalankan aksi mutasi sambil mengirim fase request -> success/failure ke store. */
export async function runMutation<T>(
  dispatch: (action: AppAction) => unknown,
  creator: (phase: MutationPhase) => AppAction,
  fn: () => Promise<ApiResult<T>>,
): Promise<ApiResult<T> | null> {
  dispatch(creator('request'));
  const result = await callApi(fn, false);
  dispatch(creator(result ? 'success' : 'failure'));
  return result;
}
