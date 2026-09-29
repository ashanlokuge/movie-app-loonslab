import { useCallback, useState } from 'react';
import { readStorage, writeStorage } from '../utils/storage';

/**
 * useState persisted to localStorage under `key`. When `key` changes (e.g. a
 * different user logs in), the value is re-read synchronously during render, so
 * there's never a frame where one key's data is shown under another key.
 */
export default function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => ({ key, value: readStorage(key, initialValue) }));

  // "Adjusting state when a prop changes" pattern recommended by the React docs.
  let current = state;
  if (state.key !== key) {
    current = { key, value: readStorage(key, initialValue) };
    setState(current);
  }

  const setValue = useCallback(
    (next) => {
      setState((prev) => {
        const resolved = typeof next === 'function' ? next(prev.value) : next;
        writeStorage(key, resolved);
        return { key, value: resolved };
      });
    },
    [key],
  );

  return [current.value, setValue];
}
