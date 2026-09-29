import {
  formatRating,
  formatRuntime,
  getImageUrl,
  getReleaseYear,
  mergeUniqueById,
  pickTrailer,
} from './formatters';

describe('formatters', () => {
  test('getImageUrl builds a TMDb URL or returns null', () => {
    expect(getImageUrl('/a.jpg', 'w342')).toBe('https://image.tmdb.org/t/p/w342/a.jpg');
    expect(getImageUrl(null, 'w342')).toBeNull();
  });

  test('getReleaseYear handles valid, empty and malformed dates', () => {
    expect(getReleaseYear('2010-07-15')).toBe('2010');
    expect(getReleaseYear('')).toBe('N/A');
    expect(getReleaseYear(undefined)).toBe('N/A');
    expect(getReleaseYear('abc')).toBe('N/A');
  });

  test('formatRating rounds to one decimal and marks unrated movies', () => {
    expect(formatRating(8.369)).toBe('8.4');
    expect(formatRating(7)).toBe('7.0');
    expect(formatRating(0)).toBe('NR');
  });

  test('formatRuntime formats minutes', () => {
    expect(formatRuntime(148)).toBe('2h 28m');
    expect(formatRuntime(45)).toBe('45m');
    expect(formatRuntime(0)).toBeNull();
  });

  test('pickTrailer prefers official YouTube trailers', () => {
    const videos = [
      { key: 'vimeo', site: 'Vimeo', type: 'Trailer', official: true },
      { key: 'teaser', site: 'YouTube', type: 'Teaser' },
      { key: 'fan', site: 'YouTube', type: 'Trailer', official: false },
      { key: 'official', site: 'YouTube', type: 'Trailer', official: true },
    ];
    expect(pickTrailer(videos).key).toBe('official');
    expect(pickTrailer([videos[1]]).key).toBe('teaser');
    expect(pickTrailer([])).toBeNull();
    expect(pickTrailer(undefined)).toBeNull();
  });

  test('mergeUniqueById appends new items and drops duplicates', () => {
    const merged = mergeUniqueById([{ id: 1 }, { id: 2 }], [{ id: 2 }, { id: 3 }, { id: 3 }]);
    expect(merged.map((m) => m.id)).toEqual([1, 2, 3]);
  });
});
