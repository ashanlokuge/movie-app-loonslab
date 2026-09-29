import { memo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Card, CardActionArea, CardContent, Chip, Typography } from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import MovieOutlinedIcon from '@mui/icons-material/MovieOutlined';
import FavoriteButton from '../common/FavoriteButton';
import { IMAGE_SIZES } from '../../config/constants';
import { formatRating, getImageUrl, getReleaseYear } from '../../utils/formatters';

/**
 * Poster card with title, year and rating. Memoised: grids can hold hundreds of cards.
 * @param {number} [rank]  Adds a position badge (trending lists).
 */
function MovieCard({ movie, rank }) {
  const posterUrl = getImageUrl(movie.poster_path, IMAGE_SIZES.poster);
  const year = getReleaseYear(movie.release_date);
  const rating = formatRating(movie.vote_average);

  return (
    <Card
      sx={{
        position: 'relative',
        height: '100%',
        transition: 'transform 150ms ease, box-shadow 150ms ease',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
          '&:hover': { transform: 'none' },
        },
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={`/movie/${movie.id}`}
        aria-label={`${rank ? `Number ${rank}: ` : ''}${movie.title} (${year}), rated ${rating}`}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        <Box sx={{ position: 'relative', aspectRatio: '2 / 3', bgcolor: 'action.hover' }}>
          {posterUrl ? (
            <Box
              component="img"
              src={posterUrl}
              alt=""
              loading="lazy"
              decoding="async"
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <Box
              sx={{ height: '100%', display: 'grid', placeItems: 'center', color: 'text.disabled' }}
            >
              <MovieOutlinedIcon sx={{ fontSize: 48 }} aria-hidden />
            </Box>
          )}

          <Chip
            icon={<StarRoundedIcon />}
            label={rating}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              bgcolor: 'rgba(0,0,0,0.75)',
              color: '#fff',
              fontWeight: 700,
              '& .MuiChip-icon': { color: 'secondary.main' },
            }}
          />

          {rank && (
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                left: 8,
                bottom: 8,
                minWidth: 32,
                height: 32,
                px: 1,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 1,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                fontWeight: 800,
                fontSize: '0.95rem',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {rank}
            </Box>
          )}
        </Box>

        <CardContent sx={{ flexGrow: 1, p: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Typography
            variant="subtitle2"
            component="h3"
            title={movie.title}
            sx={{
              fontWeight: 700,
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {movie.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {year}
          </Typography>
        </CardContent>
      </CardActionArea>

      {/* Outside CardActionArea: nesting interactive elements inside a link is invalid HTML. */}
      <FavoriteButton
        movie={movie}
        size="small"
        sx={{
          position: 'absolute',
          top: 6,
          right: 6,
          bgcolor: 'rgba(0,0,0,0.6)',
          color: '#fff',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
        }}
      />
    </Card>
  );
}

export default memo(MovieCard);
