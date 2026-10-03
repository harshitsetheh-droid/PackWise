import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce any fast-changing value.
 * Commonly used for search inputs, type-to-search autocompletes, and expensive filtering.
 *
 * @param value The value to debounce (e.g. search string)
 * @param delay Milliseconds to delay updating the debounced value (default: 200ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 200): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
