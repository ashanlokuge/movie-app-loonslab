import {
  ACTIONS,
  EMPTY_FILTERS,
  STATUS,
  createInitialState,
  getBrowseMode,
  movieReducer,
} from './movieReducer';

const page = (ids, pageNum = 1, totalPages = 3) => ({
  results: ids.map((id) => ({ id })),
  page: pageNum,
  totalPages,
  totalResults: 60,
});

describe('movieReducer', () => {
  test('restores the initial query', () => {
    expect(createInitialState('matrix').query).toBe('matrix');
  });

  test('a new query clears previous results', () => {
    const loaded = movieReducer(createInitialState(), {
      type: ACTIONS.fetchSuccess,
      append: false,
      ...page([1, 2]),
    });
    const next = movieReducer(loaded, { type: ACTIONS.setQuery, query: 'alien' });
    expect(next.query).toBe('alien');
    expect(next.movies).toEqual([]);
    expect(next.page).toBe(0);
  });

  test('setting the same query is a no-op (keeps referential equality)', () => {
    const state = createInitialState('alien');
    expect(movieReducer(state, { type: ACTIONS.setQuery, query: 'alien' })).toBe(state);
  });

  test('fetchStart distinguishes first load from load-more', () => {
    const s = createInitialState();
    expect(movieReducer(s, { type: ACTIONS.fetchStart, append: false }).status).toBe(
      STATUS.loading,
    );
    expect(movieReducer(s, { type: ACTIONS.fetchStart, append: true }).status).toBe(
      STATUS.loadingMore,
    );
  });

  test('appending pages merges results without duplicates', () => {
    let s = movieReducer(createInitialState(), {
      type: ACTIONS.fetchSuccess,
      append: false,
      ...page([1, 2]),
    });
    s = movieReducer(s, { type: ACTIONS.fetchSuccess, append: true, ...page([2, 3], 2) });
    expect(s.movies.map((m) => m.id)).toEqual([1, 2, 3]);
    expect(s.page).toBe(2);
    expect(s.status).toBe(STATUS.success);
  });

  test('errors keep already-loaded movies', () => {
    let s = movieReducer(createInitialState(), {
      type: ACTIONS.fetchSuccess,
      append: false,
      ...page([1]),
    });
    s = movieReducer(s, { type: ACTIONS.fetchError, error: new Error('x') });
    expect(s.status).toBe(STATUS.error);
    expect(s.movies).toHaveLength(1);
  });

  test('filters merge partially and can be reset', () => {
    let s = movieReducer(createInitialState(), {
      type: ACTIONS.setFilters,
      filters: { year: '2020' },
    });
    s = movieReducer(s, { type: ACTIONS.setFilters, filters: { genreId: '28' } });
    expect(s.filters).toEqual({ ...EMPTY_FILTERS, year: '2020', genreId: '28' });
    expect(movieReducer(s, { type: ACTIONS.resetFilters }).filters).toEqual(EMPTY_FILTERS);
  });
});

describe('getBrowseMode', () => {
  test('search takes priority, then filters, then popular', () => {
    expect(getBrowseMode({ query: 'x', filters: { ...EMPTY_FILTERS, year: '2020' } })).toBe(
      'search',
    );
    expect(getBrowseMode({ query: '', filters: { ...EMPTY_FILTERS, year: '2020' } })).toBe(
      'discover',
    );
    expect(getBrowseMode({ query: '', filters: EMPTY_FILTERS })).toBe('popular');
  });
});
