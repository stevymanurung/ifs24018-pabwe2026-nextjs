/** Bentuk umum action Redux yang dipakai seluruh reducer. */
export interface AppAction<P = unknown> {
  type: string;
  payload?: P;
  [extra: string]: unknown;
}

/** Fase sebuah aksi mutasi (tambah, ubah, hapus, dst.). */
export type MutationPhase = 'request' | 'success' | 'failure' | 'reset';
