/** App-wide constants, kept in one place so they're easy to find and change. */

export const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

/** Image sizes supported by TMDb, see /configuration endpoint. */
export const IMAGE_SIZES = {
  poster: 'w342',
  posterLarge: 'w500',
  backdrop: 'w1280',
  profile: 'w185',
};

/** Namespaced localStorage keys to avoid collisions with other apps on the same origin. */
export const STORAGE_KEYS = {
  session: 'movie-explorer:session',
  themeMode: 'movie-explorer:theme-mode',
  lastSearch: 'movie-explorer:last-search',
  loadMode: 'movie-explorer:load-mode',
  favorites: (username) => `movie-explorer:favorites:${username}`,
};

/** Demo login credentials; the brief has no backend so auth is simulated client-side. */
export const DEMO_USER = {
  username: 'demo',
  password: 'movies123',
};

/** Debounce delay (ms) applied to the search input to avoid one request per keystroke. */
export const SEARCH_DEBOUNCE_MS = 500;

/** Minimum number of votes a movie needs before a rating filter is meaningful. */
export const MIN_VOTE_COUNT_FOR_RATING_FILTER = 50;

/** How the result grid fetches more pages. */
export const LOAD_MODES = {
  button: 'button',
  infinite: 'infinite',
};

/** Earliest year offered in the year filter. */
export const OLDEST_FILTER_YEAR = 1950;
