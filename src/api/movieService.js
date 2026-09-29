/** Movie service: the only module that knows TMDb endpoint shapes. */
import tmdbClient from './tmdbClient';
import { MIN_VOTE_COUNT_FOR_RATING_FILTER } from '../config/constants';

/** Normalise TMDb's paginated response shape into camelCase. */
const toPage = ({ results = [], page = 1, total_pages = 0, total_results = 0 }) => ({
  results,
  page,
  // TMDb refuses page numbers above 500, even if total_pages is larger.
  totalPages: Math.min(total_pages, 500),
  totalResults: total_results,
});

// In-memory caches for data that rarely changes during a session.
let genresCache = null;
const detailsCache = new Map();
const trendingCache = new Map(); // key: `${timeWindow}:${page}`

export async function getTrendingMovies({ page = 1, timeWindow = 'week', signal } = {}) {
  // Cached for the session: TrendingRow re-mounts every time the user returns to Home.
  const key = `${timeWindow}:${page}`;
  if (trendingCache.has(key)) return trendingCache.get(key);

  const { data } = await tmdbClient.get(`/trending/movie/${timeWindow}`, {
    params: { page },
    signal,
  });
  const result = toPage(data);
  trendingCache.set(key, result);
  return result;
}

/** Popular movies: the default grid when nothing is searched or filtered. */
export async function getPopularMovies({ page = 1, signal } = {}) {
  const { data } = await tmdbClient.get('/movie/popular', { params: { page }, signal });
  return toPage(data);
}

/** Search by title. The endpoint only filters by year; genre/rating are applied by the caller. */
export async function searchMovies({ query, page = 1, year, signal }) {
  const { data } = await tmdbClient.get('/search/movie', {
    params: {
      query,
      page,
      include_adult: false,
      ...(year && { primary_release_year: year }),
    },
    signal,
  });
  return toPage(data);
}

/** Discover movies with server-side filters (used when filters are set without a query). */
export async function discoverMovies({ page = 1, genreId, year, minRating, signal } = {}) {
  const { data } = await tmdbClient.get('/discover/movie', {
    params: {
      page,
      include_adult: false,
      sort_by: 'popularity.desc',
      ...(genreId && { with_genres: genreId }),
      ...(year && { primary_release_year: year }),
      ...(minRating && {
        'vote_average.gte': minRating,
        // Avoid obscure titles rated 10/10 by a single voter.
        'vote_count.gte': MIN_VOTE_COUNT_FOR_RATING_FILTER,
      }),
    },
    signal,
  });
  return toPage(data);
}

/** Full movie details + cast + videos in one request via `append_to_response`. */
export async function getMovieDetails(movieId, { signal } = {}) {
  const key = String(movieId);
  if (detailsCache.has(key)) return detailsCache.get(key);

  const { data } = await tmdbClient.get(`/movie/${key}`, {
    params: { append_to_response: 'credits,videos' },
    signal,
  });
  detailsCache.set(key, data);
  return data;
}

/** Official list of movie genres, e.g. [{ id: 28, name: 'Action' }]. Cached per session. */
export async function getGenres() {
  if (genresCache) return genresCache;
  const { data } = await tmdbClient.get('/genre/movie/list');
  genresCache = data.genres || [];
  return genresCache;
}
