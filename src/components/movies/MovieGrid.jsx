import { Box, useMediaQuery, useTheme } from '@mui/material';
import MovieCard from './MovieCard';
import MovieCardSkeleton from './MovieCardSkeleton';

/** Columns per breakpoint (mobile-first). Kept explicit so the grid knows its row length. */
const COLUMNS = { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 };

/** Current column count, matching the CSS grid below. */
function useColumnCount() {
  const theme = useTheme();
  const sm = useMediaQuery(theme.breakpoints.up('sm'));
  const md = useMediaQuery(theme.breakpoints.up('md'));
  const lg = useMediaQuery(theme.breakpoints.up('lg'));
  const xl = useMediaQuery(theme.breakpoints.up('xl'));
  if (xl) return COLUMNS.xl;
  if (lg) return COLUMNS.lg;
  if (md) return COLUMNS.md;
  if (sm) return COLUMNS.sm;
  return COLUMNS.xs;
}

/**
 * Responsive poster grid.
 * @param {number} [rankStart]  Numbers the cards (2 → "2, 3, 4…") for ranked lists.
 * @param {boolean} [fillRows]  While more pages exist, show only complete rows so the grid
 *   never ends on a half-empty row; pass false on the final page to show everything.
 */
export default function MovieGrid({
  movies,
  loading = false,
  skeletonCount,
  rankStart,
  fillRows = false,
}) {
  const columns = useColumnCount();

  let visible = movies;
  if (fillRows && movies.length >= columns) {
    visible = movies.slice(0, movies.length - (movies.length % columns));
  }

  return (
    <Box
      component="ul"
      aria-busy={loading}
      sx={{
        listStyle: 'none',
        p: 0,
        m: 0,
        display: 'grid',
        gap: { xs: 1.5, sm: 2 },
        gridTemplateColumns: Object.fromEntries(
          Object.entries(COLUMNS).map(([bp, n]) => [bp, `repeat(${n}, minmax(0, 1fr))`]),
        ),
      }}
    >
      {visible.map((movie, index) => (
        <li key={movie.id}>
          <MovieCard movie={movie} rank={rankStart ? rankStart + index : undefined} />
        </li>
      ))}
      {loading &&
        Array.from({ length: skeletonCount ?? columns * 2 }, (_, i) => (
          <li key={`skeleton-${i}`}>
            <MovieCardSkeleton />
          </li>
        ))}
    </Box>
  );
}
