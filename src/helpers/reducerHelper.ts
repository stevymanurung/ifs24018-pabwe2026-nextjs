import type { AppAction } from '@/types/action';

/** Reducer boolean: true pada action `on`, false pada action `off`. */
export function createFlagReducer(on: string[], off: string[]) {
  return (state = false, action: AppAction): boolean => {
    if (on.includes(action.type)) return true;
    if (off.includes(action.type)) return false;
    return state;
  };
}

/** Reducer nilai: diisi payload pada `setType`, kembali ke awal pada `resetTypes`. */
export function createValueReducer<T>(initial: T, setType: string, resetTypes: string[]) {
  return (state: T = initial, action: AppAction): T => {
    if (action.type === setType) return action.payload as T;
    if (resetTypes.includes(action.type)) return initial;
    return state;
  };
}
