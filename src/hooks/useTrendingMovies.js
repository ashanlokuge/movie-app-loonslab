import { useCallback, useEffect, useReducer, useRef } from 'react';
import { getTrendingMovies } from '../api/movieService';
import { ACTIONS, STATUS, createInitialState, movieReducer } from '../context/movieReducer';
import { isCancelledRequest } from '../utils/errors';

/**
 * Per-time-window list kept in memory for the session, so returning via Back
 * restores exactly where the user left off (works with ScrollRestoration).
 */
const memory = new Map();

/** A snapshot taken mid-request must not come back stuck in a loading state. */
function restore(timeWindow) {
  const saved = memory.get(timeWindow);
  if (!saved) return createInitialState();
  const busy = saved.status === STATUS.loading || saved.status === STATUS.loadingMore;
  return busy ? { ...saved, status: saved.page > 0 ? STATUS.success : STATUS.idle } : saved;
}

/**
 * Paginated trending movies for one time window. Remount the consumer when
 * `timeWindow` changes (e.g. `key={timeWindow}`) for clean per-window state.
 */
export default function useTrendingMovies(timeWindow) {
  const [state, dispatch] = useReducer(movieReducer, timeWindow, restore);
  const abortRef = useRef(null);

  useEffect(() => {
    memory.set(timeWindow, state);
  }, [timeWindow, state]);

  const load = useCallback(
    async (page, append) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      dispatch({ type: ACTIONS.fetchStart, append });
      try {
        const data = await getTrendingMovies({ page, timeWindow, signal: controller.signal });
        dispatch({ type: ACTIONS.fetchSuccess, append, ...data });
      } catch (error) {
        if (!isCancelledRequest(error)) dispatch({ type: ACTIONS.fetchError, error });
      }
    },
    [timeWindow],
  );

  // Only fetch on mount if there is nothing restored from memory.
  const hasData = state.page > 0;
  useEffect(() => {
    if (!hasData) load(1, false);
    return () => abortRef.current?.abort();
    // Mount-only by design: later pages are requested through loadMore().
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasMore = state.page < state.totalPages;
  const isBusy = state.status === STATUS.loading || state.status === STATUS.loadingMore;

  const loadMore = useCallback(() => {
    if (hasMore && !isBusy) load(state.page + 1, true);
  }, [hasMore, isBusy, load, state.page]);

  /** Retry whichever request failed: the next page if we have results, else page 1. */
  const retry = useCallback(() => {
    if (state.page > 0) load(state.page + 1, true);
    else load(1, false);
  }, [load, state.page]);

  return { ...state, hasMore, isBusy, loadMore, retry };
}
