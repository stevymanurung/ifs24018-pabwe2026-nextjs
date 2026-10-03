import { describe, expect, it } from 'vitest';
import { createFlagReducer, createValueReducer } from '@/helpers/reducerHelper';

describe('createFlagReducer', () => {
  const reducer = createFlagReducer(['on'], ['off']);
  it('mengatur flag sesuai action', () => {
    expect(reducer(undefined, { type: 'x' })).toBe(false);
    expect(reducer(false, { type: 'on' })).toBe(true);
    expect(reducer(true, { type: 'x' })).toBe(true);
    expect(reducer(true, { type: 'off' })).toBe(false);
  });
});

describe('createValueReducer', () => {
  const reducer = createValueReducer<string[]>([], 'set', ['reset']);
  it('mengisi payload dan mereset ke nilai awal', () => {
    expect(reducer(undefined, { type: 'x' })).toEqual([]);
    expect(reducer([], { type: 'set', payload: ['a'] })).toEqual(['a']);
    expect(reducer(['a'], { type: 'x' })).toEqual(['a']);
    expect(reducer(['a'], { type: 'reset' })).toEqual([]);
  });
});
