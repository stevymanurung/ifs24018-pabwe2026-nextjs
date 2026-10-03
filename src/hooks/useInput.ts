import { useCallback, useState } from 'react';
import type { ChangeEvent } from 'react';

type InputElement = HTMLInputElement | HTMLTextAreaElement;

/** Hook two-way binding untuk elemen input / textarea. */
export function useInput(defaultValue: string): [
  string,
  (event: ChangeEvent<InputElement>) => void,
  (value: string) => void,
] {
  const [value, setValue] = useState(defaultValue);

  const handleChange = useCallback((event: ChangeEvent<InputElement>) => {
    setValue(event.target.value);
  }, []);

  return [value, handleChange, setValue];
}
