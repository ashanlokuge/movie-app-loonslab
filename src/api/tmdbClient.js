/** Axios instance for TMDb v3: attaches auth, sets defaults, normalises errors. */
import axios from 'axios';
import { TMDB_API_BASE_URL } from '../config/constants';
import { ApiError, isCancelledRequest, toApiError } from '../utils/errors';

const readToken = process.env.REACT_APP_TMDB_READ_TOKEN;
const apiKey = process.env.REACT_APP_TMDB_API_KEY;

export const isTmdbConfigured = Boolean(readToken || apiKey);

const tmdbClient = axios.create({
  baseURL: TMDB_API_BASE_URL,
  timeout: 10000,
  params: { language: 'en-US' },
});

tmdbClient.interceptors.request.use((config) => {
  if (!isTmdbConfigured) {
    // Fail fast with a clear message instead of a confusing 401 from TMDb.
    return Promise.reject(
      new ApiError(
        'TMDb API credentials are not configured. Add REACT_APP_TMDB_READ_TOKEN to your .env file.',
        { code: 'CONFIG' },
      ),
    );
  }

  if (readToken) {
    config.headers.Authorization = `Bearer ${readToken}`;
  } else {
    config.params = { ...config.params, api_key: apiKey };
  }
  return config;
});

tmdbClient.interceptors.response.use(
  (response) => response,
  // Cancelled requests are re-thrown untouched so callers can ignore them.
  (error) => Promise.reject(isCancelledRequest(error) ? error : toApiError(error)),
);

export default tmdbClient;
