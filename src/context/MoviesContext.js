/** Owns browsing state (query/filters) and all list fetching/pagination. */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { discoverMovies, getGenres, getPopularMovies, searchMovies } from '../api/movieService';
import { STORAGE_KEYS } from '../config/constants';
import { isCancelledRequest } from '../utils/errors';
import { readStorage, removeStorage, writeStorage } from '../utils/storage';
import { ACTIONS, STATUS, createInitialState, getBrowseMode, movieReducer } from './movieReducer';

const MoviesContext = createContext(null);

/**
 * Search can't filter by genre/rating server-side, so we filter client-side and
 * keep fetching (up to a limit) so users don't see an empty page while matches exist.
 */
const MAX_PAGES_PER_FILTERED_FETCH = 5;

/** Fetch one logical "page" of movies for the given browsing state. */
async function fetchMoviesPage({ query, filters }, page, signal) {
  const mode = getBrowseMode({ query, filters });

  if (mode === 'popular') return getPopularMovies({ page, signal });
  if (mode === 'discover') return discoverMovies({ page, ...filters, signal });

  const genreId = Number(filters.genreId) || null;
  const minRating = Number(filters.minRating) || 0;
  const matches = (m) =>
    (!genreId || m.genre_ids?.includes(genreId)) && (!minRating || m.vote_average >= minRating);

  let current = page;
  let response;
  let results = [];
  do {
    // eslint-disable-next-line no-await-in-loop -- pages must be fetched sequentially
    response = await searchMovies({ query, page: current, year: filters.year, signal });
    results = results.concat(response.results.filter(matches));
    current += 1;
  } while (
    results.length === 0 &&
    current <= response.totalPages &&
    current - page < MAX_PAGES_PER_FILTERED_FETCH
  );

  // Report the last page actually consumed so "load more" continues from there.
  return { ...response, results, page: current - 1 };
}

export function MoviesProvider({ children }) {
  const [state, dispatch] = useReducer(
    movieReducer,
    undefined,
    // Restore the user's last search so it persists across reloads.
    () => createInitialState(readStorage(STORAGE_KEYS.lastSearch, '')),
  );
  const [genres, setGenres] = useState([]);
  const abortRef = useRef(null);
  const [retryToken, setRetryToken] = useState(0);

  const { query, filters, page, totalPages, status } = state;

  /** Core loader. `append` distinguishes "load more" from a fresh query. */
  const load = useCallback(
    async (targetPage, append) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      dispatch({ type: ACTIONS.fetchStart, append });
      try {
        const data = await fetchMoviesPage({ query, filters }, targetPage, controller.signal);
        dispatch({ type: ACTIONS.fetchSuccess, append, ...data });
      } catch (error) {
        if (isCancelledRequest(error)) return; // superseded by a newer request
        dispatch({ type: ACTIONS.fetchError, error });
      }
    },
    [query, filters],
  );

  // Fetch page 1 whenever the query or filters change (or on retry).
  useEffect(() => {
    load(1, false);
    return () => abortRef.current?.abort();
  }, [load, retryToken]);

  useEffect(() => {
    if (query) writeStorage(STORAGE_KEYS.lastSearch, query);
    else removeStorage(STORAGE_KEYS.lastSearch);
  }, [query]);

  // Genres are needed for the filter dropdown and to label cards; load once.
  useEffect(() => {
    getGenres()
      .then(setGenres)
      .catch(() => setGenres([])); // Non-critical: the filter simply shows no genres.
  }, []);

  const hasMore = page < totalPages;
  const isBusy = status === STATUS.loading || status === STATUS.loadingMore;

  const loadMore = useCallback(() => {
    if (hasMore && !isBusy) load(page + 1, true);
  }, [hasMore, isBusy, load, page]);

  /** Retry the failed request: next page if we already have results, else page 1. */
  const retry = useCallback(() => {
    if (page > 0) load(page + 1, true);
    else setRetryToken((t) => t + 1);
  }, [load, page]);

  const setQuery = useCallback((q) => dispatch({ type: ACTIONS.setQuery, query: q.trim() }), []);
  const setFilters = useCallback((f) => dispatch({ type: ACTIONS.setFilters, filters: f }), []);
  const resetFilters = useCallback(() => dispatch({ type: ACTIONS.resetFilters }), []);

  const value = useMemo(
    () => ({
      ...state,
      mode: getBrowseMode(state),
      genres,
      hasMore,
      isBusy,
      setQuery,
      setFilters,
      resetFilters,
      loadMore,
      retry,
    }),
    [state, genres, hasMore, isBusy, setQuery, setFilters, resetFilters, loadMore, retry],
  );

  return <MoviesContext.Provider value={value}>{children}</MoviesContext.Provider>;
}

export function useMovies() {
  const ctx = useContext(MoviesContext);
  if (!ctx) throw new Error('useMovies must be used within a MoviesProvider');
  return ctx;
}
