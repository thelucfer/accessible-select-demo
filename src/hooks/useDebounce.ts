import { useRef } from 'react';

export type FnArguments<T> = T extends (...args: infer U) => never
  ? U extends Array<infer R>
    ? R
    : U
  : never;

export const useDebounce = () => {
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const debounce =
    <T extends (args?: unknown) => void, R extends FnArguments<T>>(callback: T, delay: number) =>
    (args?: R extends undefined ? never : R) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      const timeout = setTimeout(() => callback(args), delay);

      debounceRef.current = timeout;
    };

  return debounce;
};
