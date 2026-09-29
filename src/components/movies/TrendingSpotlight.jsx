import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Chip, Skeleton, Stack, Typography } from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FavoriteButton from '../common/FavoriteButton';
import { IMAGE_SIZES } from '../../config/constants';
import { formatRating, getImageUrl, getReleaseYear } from '../../utils/formatters';

/**
 * Feature panel for the #1 trending movie; reuses data already in the
 * trending response, so it costs no extra request.
 */
export default function TrendingSpotlight({ movie, timeWindowLabel }) {
  const backdrop = getImageUrl(movie.backdrop_path, IMAGE_SIZES.backdrop);
  const poster = getImageUrl(movie.poster_path, IMAGE_SIZES.posterLarge);

  return (
    <Box
      component="article"
      aria-labelledby="spotlight-title"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 2,
        bgcolor: 'grey.900',
        color: 'common.white',
        mb: { xs: 4, sm: 6 },
      }}
    >
      {backdrop && (
        <Box
          component="img"
          src={backdrop}
          alt=""
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 20%',
          }}
        />
      )}
      {/* Scrim: darker on the text side so the copy stays readable on any backdrop. */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          background: {
            xs: 'linear-gradient(180deg, rgba(8,10,14,0.35) 0%, rgba(8,10,14,0.92) 70%)',
            md: 'linear-gradient(90deg, rgba(8,10,14,0.94) 0%, rgba(8,10,14,0.75) 45%, rgba(8,10,14,0.15) 100%)',
          },
        }}
      />

      <Stack
        direction="row"
        spacing={{ md: 4 }}
        alignItems="flex-end"
        sx={{ position: 'relative', p: { xs: 2.5, sm: 4, md: 5 }, pt: { xs: 18, sm: 24, md: 5 } }}
      >
        {poster && (
          <Box
            component="img"
            src={poster}
            alt=""
            sx={{
              display: { xs: 'none', md: 'block' },
              width: 200,
              aspectRatio: '2 / 3',
              objectFit: 'cover',
              borderRadius: 1.5,
              boxShadow: 12,
              flexShrink: 0,
            }}
          />
        )}

        <Box sx={{ maxWidth: 640, minWidth: 0 }}>
          <Typography
            variant="overline"
            component="p"
            sx={{ color: 'grey.300', fontWeight: 700, letterSpacing: '0.08em', lineHeight: 1.5 }}
          >
            #1 trending {timeWindowLabel}
          </Typography>
          <Typography
            id="spotlight-title"
            variant="h3"
            component="h2"
            sx={{ fontWeight: 800, letterSpacing: '-0.02em', overflowWrap: 'anywhere' }}
          >
            {movie.title}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5 }}>
            <Chip
              size="small"
              icon={<StarRoundedIcon />}
              label={formatRating(movie.vote_average)}
              sx={{
                bgcolor: 'rgba(255,255,255,0.14)',
                color: 'common.white',
                fontWeight: 700,
                '& .MuiChip-icon': { color: 'secondary.main' },
              }}
            />
            <Typography variant="body2" sx={{ color: 'grey.300' }}>
              {getReleaseYear(movie.release_date)}
            </Typography>
          </Stack>

          {movie.overview && (
            <Typography
              sx={{
                mt: 2,
                color: 'grey.200',
                lineHeight: 1.6,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {movie.overview}
            </Typography>
          )}

          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 3 }}>
            <Button
              component={RouterLink}
              to={`/movie/${movie.id}`}
              variant="contained"
              size="large"
              startIcon={<InfoOutlinedIcon />}
            >
              View details
            </Button>
            <FavoriteButton
              movie={movie}
              sx={{
                color: 'common.white',
                border: 1,
                borderColor: 'rgba(255,255,255,0.4)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
              }}
            />
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

/** Placeholder with the spotlight's footprint, so the page doesn't jump when it loads. */
export function TrendingSpotlightSkeleton() {
  return (
    <Skeleton
      variant="rounded"
      sx={{ height: { xs: 360, md: 380 }, mb: { xs: 4, sm: 6 }, borderRadius: 2 }}
    />
  );
}
