import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ChangeEvent } from 'react';
import { useInput } from '@/hooks/useInput';

describe('useInput', () => {
  it('mengikat nilai dan menangani perubahan', () => {
    const { result } = renderHook(() => useInput('awal'));
    expect(result.current[0]).toBe('awal');

    act(() => {
      result.current[1]({ target: { value: 'baru' } } as ChangeEvent<HTMLInputElement>);
    });
    expect(result.current[0]).toBe('baru');

    act(() => result.current[2]('manual'));
    expect(result.current[0]).toBe('manual');
  });
});
