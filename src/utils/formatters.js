/** Pure presentation helpers; kept free of React so they're trivial to unit test. */
import { TMDB_IMAGE_BASE_URL } from '../config/constants';

/** Build a full TMDb image URL; null when the movie has no image. */
export function getImageUrl(path, size) {
  return path ? `${TMDB_IMAGE_BASE_URL}/${size}${path}` : null;
}

/** "2023-07-19" → "2023"; missing/invalid dates → "N/A". */
export function getReleaseYear(date) {
  if (!date) return 'N/A';
  const year = date.slice(0, 4);
  return /^\d{4}$/.test(year) ? year : 'N/A';
}

/** 7.456 → "7.5"; 0/undefined → "NR" (not rated). */
export function formatRating(voteAverage) {
  return voteAverage ? Number(voteAverage).toFixed(1) : 'NR';
}

/** 142 → "2h 22m"; 45 → "45m"; falsy → null. */
export function formatRuntime(minutes) {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours ? `${hours}h ${mins}m` : `${mins}m`;
}

/** Pick the best YouTube trailer: official trailer > any trailer > teaser. */
export function pickTrailer(videos = []) {
  const youtube = videos.filter((v) => v.site === 'YouTube');
  return (
    youtube.find((v) => v.type === 'Trailer' && v.official) ||
    youtube.find((v) => v.type === 'Trailer') ||
    youtube.find((v) => v.type === 'Teaser') ||
    null
  );
}

/** Merge a new results page, dropping duplicates (TMDb can repeat a movie across pages). */
export function mergeUniqueById(existing, incoming) {
  const seen = new Set(existing.map((m) => m.id));
  return existing.concat(incoming.filter((m) => !seen.has(m.id) && seen.add(m.id)));
}
