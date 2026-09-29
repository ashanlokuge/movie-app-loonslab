import { ApiError, isCancelledRequest, toApiError } from './errors';

describe('toApiError', () => {
  test('maps known HTTP statuses to friendly messages', () => {
    const err = toApiError({ response: { status: 401 } });
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(401);
    expect(err.message).toMatch(/api key/i);

    expect(toApiError({ response: { status: 429 } }).message).toMatch(/too many requests/i);
    expect(toApiError({ response: { status: 404 } }).status).toBe(404);
  });

  test('maps server errors to a generic TMDb outage message', () => {
    expect(toApiError({ response: { status: 503 } }).message).toMatch(/TMDb is having trouble/);
  });

  test('maps network failures (no response) to a connection message', () => {
    const err = toApiError({ request: {} });
    expect(err.code).toBe('NETWORK');
    expect(err.message).toMatch(/connection/i);
  });

  test('passes ApiError instances through unchanged', () => {
    const original = new ApiError('x', { code: 'CONFIG' });
    expect(toApiError(original)).toBe(original);
  });
});

test('isCancelledRequest detects axios cancellations', () => {
  expect(isCancelledRequest({ name: 'CanceledError' })).toBe(true);
  expect(isCancelledRequest({ code: 'ERR_CANCELED' })).toBe(true);
  expect(isCancelledRequest(new Error('boom'))).toBe(false);
});
