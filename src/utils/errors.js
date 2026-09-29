/** Error normalisation: every error leaving the API layer becomes an ApiError. */

/** Normalised app error; message is safe to display to the user. */
export class ApiError extends Error {
  constructor(message, { status = null, code = 'UNKNOWN' } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

const STATUS_MESSAGES = {
  401: 'The TMDb API key is invalid or missing. Please check the app configuration.',
  403: 'Access to this resource was denied by TMDb.',
  404: "We couldn't find what you were looking for.",
  429: 'Too many requests. Please wait a moment and try again.',
};

/** Convert any thrown value (axios error, ApiError, Error) into an ApiError. */
export function toApiError(error) {
  if (error instanceof ApiError) return error;

  // Axios: the server responded with a non-2xx status.
  if (error?.response) {
    const { status } = error.response;
    const message =
      STATUS_MESSAGES[status] ||
      (status >= 500
        ? 'TMDb is having trouble right now. Please try again shortly.'
        : 'Something went wrong while loading movies.');
    return new ApiError(message, { status, code: 'HTTP' });
  }

  // Axios: the request was sent but no response came back (offline, DNS, CORS, timeout).
  if (error?.request || error?.code === 'ECONNABORTED') {
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
    return new ApiError(
      offline
        ? 'You appear to be offline. Check your internet connection and try again.'
        : 'Unable to reach TMDb. Please check your connection and try again.',
      { code: 'NETWORK' },
    );
  }

  return new ApiError(error?.message || 'An unexpected error occurred.');
}

/** True for a cancelled request (e.g. a stale search); should be ignored, not shown to users. */
export function isCancelledRequest(error) {
  return error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED';
}
