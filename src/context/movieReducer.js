/** Pure reducer for the results grid; separate from the provider so it's testable without React. */
import { mergeUniqueById } from '../utils/formatters';

export const EMPTY_FILTERS = { genreId: '', year: '', minRating: '' };

export const STATUS = {
  idle: 'idle',
  loading: 'loading', // first page of a new query
  loadingMore: 'loadingMore', // subsequent pages
  success: 'success',
  error: 'error',
};

export const ACTIONS = {
  setQuery: 'SET_QUERY',
  setFilters: 'SET_FILTERS',
  resetFilters: 'RESET_FILTERS',
  fetchStart: 'FETCH_START',
  fetchSuccess: 'FETCH_SUCCESS',
  fetchError: 'FETCH_ERROR',
};

export const createInitialState = (query = '') => ({
  query,
  filters: EMPTY_FILTERS,
  movies: [],
  page: 0,
  totalPages: 0,
  totalResults: 0,
  status: STATUS.idle,
  error: null,
});

/** Clears the result list; used whenever the "question" (query/filters) changes. */
const resetResults = (state) => ({
  ...state,
  movies: [],
  page: 0,
  totalPages: 0,
  totalResults: 0,
  error: null,
});

export function movieReducer(state, action) {
  switch (action.type) {
    case ACTIONS.setQuery:
      if (action.query === state.query) return state;
      return resetResults({ ...state, query: action.query });

    case ACTIONS.setFilters:
      return resetResults({ ...state, filters: { ...state.filters, ...action.filters } });

    case ACTIONS.resetFilters:
      return resetResults({ ...state, filters: EMPTY_FILTERS });

    case ACTIONS.fetchStart:
      return {
        ...state,
        status: action.append ? STATUS.loadingMore : STATUS.loading,
        error: null,
      };

    case ACTIONS.fetchSuccess: {
      const { results, page, totalPages, totalResults, append } = action;
      return {
        ...state,
        movies: append ? mergeUniqueById(state.movies, results) : mergeUniqueById([], results),
        page,
        totalPages,
        totalResults,
        status: STATUS.success,
        error: null,
      };
    }

    case ACTIONS.fetchError:
      return { ...state, status: STATUS.error, error: action.error };

    default:
      return state;
  }
}

/**
 * Which data source the grid shows. Trending has its own row (TrendingRow),
 * so with no query/filters this falls back to popular movies.
 */
export function getBrowseMode({ query, filters }) {
  if (query) return 'search';
  if (filters.genreId || filters.year || filters.minRating) return 'discover';
  return 'popular';
}
