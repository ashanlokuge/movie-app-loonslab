import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { getTrendingMovies } from '../../api/movieService';
import { IMAGE_SIZES } from '../../config/constants';
import { getImageUrl } from '../../utils/formatters';
import { isCancelledRequest } from '../../utils/errors';

const POSTER_COUNT = 20; // one full page of trending results

/**
 * Decorative poster wall for sign-in (aria-hidden); falls back to a plain
 * surface if TMDb is unreachable, so sign-in is never blocked by it.
 */
export default function PosterWall() {
  const [posters, setPosters] = useState([]);
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getTrendingMovies({ signal: controller.signal })
      .then(({ results }) =>
        setPosters(results.filter((m) => m.poster_path).slice(0, POSTER_COUNT)),
      )
      .catch((error) => {
        // Cancelled requests must not clear posters set by the request that replaced them.
        if (!isCancelledRequest(error)) setPosters([]);
      });
    return () => controller.abort();
  }, []);

  // Reveal the wall once most posters have decoded, so it doesn't pop in tile by tile.
  const revealed = posters.length > 0 && loadedCount >= Math.ceil(posters.length * 0.6);

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        overflow: 'hidden',
        bgcolor: 'grey.900',
        color: 'common.white',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          gridTemplateColumns: { md: 'repeat(4, minmax(0, 1fr))', xl: 'repeat(5, minmax(0, 1fr))' },
          gridAutoRows: 'min-content',
          gap: 1,
          p: 1,
          opacity: revealed ? 1 : 0,
          transition: 'opacity 600ms cubic-bezier(0.2, 0, 0, 1)',
          '@media (prefers-reduced-motion: reduce)': { transition: 'opacity 150ms linear' },
        }}
      >
        {posters.map((movie) => (
          <Box
            key={movie.id}
            component="img"
            src={getImageUrl(movie.poster_path, IMAGE_SIZES.poster)}
            alt=""
            decoding="async"
            onLoad={() => setLoadedCount((n) => n + 1)}
            onError={() => setLoadedCount((n) => n + 1)}
            sx={{
              width: '100%',
              aspectRatio: '2 / 3',
              objectFit: 'cover',
              display: 'block',
              borderRadius: 1,
            }}
          />
        ))}
      </Box>

      {/* Scrim: keeps the copy legible over any poster. */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(8,10,14,0.45) 0%, rgba(8,10,14,0.4) 40%, rgba(8,10,14,0.88) 68%, rgba(8,10,14,0.97) 100%)',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          p: { md: 5, lg: 7 },
          maxWidth: 560,
        }}
      >
        <Typography
          component="p"
          sx={{
            fontSize: { md: '2.25rem', lg: '2.75rem' },
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          Find the film for tonight.
        </Typography>
        <Typography sx={{ mt: 2, color: 'grey.400', maxWidth: 420 }}>
          Search any title, see what&rsquo;s trending this week, and keep a list of the ones you
          want to watch.
        </Typography>
        {posters.length > 0 && (
          <Typography variant="caption" component="p" sx={{ mt: 4, color: 'grey.500' }}>
            Posters: this week&rsquo;s trending titles on TMDb
          </Typography>
        )}
      </Box>
    </Box>
  );
}
