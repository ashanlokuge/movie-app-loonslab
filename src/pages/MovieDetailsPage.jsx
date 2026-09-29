import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Chip, Container, Divider, Skeleton, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import MovieOutlinedIcon from '@mui/icons-material/MovieOutlined';
import { getMovieDetails } from '../api/movieService';
import CastList from '../components/movies/CastList';
import TrailerPlayer from '../components/movies/TrailerPlayer';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { useFavorites } from '../context/FavoritesContext';
import { IMAGE_SIZES } from '../config/constants';
import { isCancelledRequest } from '../utils/errors';
import {
  formatRating,
  formatRuntime,
  getImageUrl,
  getReleaseYear,
  pickTrailer,
} from '../utils/formatters';
import useDocumentTitle from '../hooks/useDocumentTitle';

/** Loads a single movie by id, cancelling the request if the id changes or the page unmounts. */
function useMovieDetails(movieId) {
  const [state, setState] = useState({ status: 'loading', movie: null, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading', movie: null, error: null });

    getMovieDetails(movieId, { signal: controller.signal })
      .then((movie) => setState({ status: 'success', movie, error: null }))
      .catch((error) => {
        if (!isCancelledRequest(error)) setState({ status: 'error', movie: null, error });
      });

    return () => controller.abort();
  }, [movieId, attempt]);

  return { ...state, retry: () => setAttempt((n) => n + 1) };
}

function DetailsSkeleton() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
        <Skeleton
          variant="rounded"
          sx={{
            width: { xs: 200, md: 300 },
            aspectRatio: '2 / 3',
            height: 'auto',
            mx: { xs: 'auto', md: 0 },
          }}
        />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" sx={{ fontSize: '2.5rem' }} width="70%" />
          <Skeleton width="40%" />
          <Skeleton variant="rounded" height={120} sx={{ mt: 3 }} />
        </Box>
      </Stack>
    </Container>
  );
}

export default function MovieDetailsPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { status, movie, error, retry } = useMovieDetails(movieId);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [trailerPlaying, setTrailerPlaying] = useState(false);
  const trailerRef = useRef(null);
  useDocumentTitle(movie?.title);

  // Go back if the user came from inside the app, otherwise go home (e.g. opened from a shared link).
  const goBack = () => (window.history.state?.idx > 0 ? navigate(-1) : navigate('/'));

  const backButton = (
    <Button
      startIcon={<ArrowBackIcon />}
      onClick={goBack}
      color="inherit"
      sx={{ mb: 2, bgcolor: 'background.paper', '&:hover': { bgcolor: 'background.default' } }}
    >
      Back
    </Button>
  );

  if (status === 'loading') return <DetailsSkeleton />;

  if (status === 'error') {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {backButton}
        {error?.status === 404 ? (
          <EmptyState
            title="Movie not found"
            description="This movie may have been removed from TMDb."
          />
        ) : (
          <ErrorState title="Couldn't load this movie" error={error} onRetry={retry} />
        )}
      </Container>
    );
  }

  const trailer = pickTrailer(movie.videos?.results);
  const directors = movie.credits?.crew?.filter((c) => c.job === 'Director') || [];
  const posterUrl = getImageUrl(movie.poster_path, IMAGE_SIZES.posterLarge);
  const backdropUrl = getImageUrl(movie.backdrop_path, IMAGE_SIZES.backdrop);
  const favorite = isFavorite(movie.id);
  const runtime = formatRuntime(movie.runtime);

  /** Hero "Watch trailer": bring the inline player into view and start it. */
  const playTrailerInline = () => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    trailerRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'center',
    });
    setTrailerPlaying(true);
  };

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          backgroundImage: backdropUrl ? `url(${backdropUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: (t) =>
              `linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, ${t.palette.background.default} 100%)`,
          },
        }}
      >
        <Container
          maxWidth="lg"
          sx={{ position: 'relative', zIndex: 1, pt: { xs: 2, md: 4 }, pb: 4 }}
        >
          {backButton}
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 3, md: 5 }}
            alignItems={{ xs: 'center', md: 'flex-end' }}
          >
            <Box
              sx={{
                flexShrink: 0,
                width: { xs: 200, sm: 240, md: 300 },
                aspectRatio: '2 / 3',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: 12,
                bgcolor: 'action.hover',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              {posterUrl ? (
                <Box
                  component="img"
                  src={posterUrl}
                  alt={`${movie.title} poster`}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <MovieOutlinedIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
              )}
            </Box>

            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="h3" component="h1">
                {movie.title}{' '}
                <Typography component="span" variant="h4" color="text.secondary" fontWeight={400}>
                  ({getReleaseYear(movie.release_date)})
                </Typography>
              </Typography>
              {movie.tagline && (
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  fontStyle="italic"
                  sx={{ mt: 0.5 }}
                >
                  {movie.tagline}
                </Typography>
              )}

              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
                justifyContent={{ xs: 'center', md: 'flex-start' }}
                sx={{ mt: 2 }}
              >
                <Chip
                  icon={<StarRoundedIcon />}
                  sx={{ '& .MuiChip-icon': { color: 'secondary.main' } }}
                  label={`${formatRating(movie.vote_average)} / 10 (${(movie.vote_count || 0).toLocaleString()} votes)`}
                />
                {runtime && <Chip label={runtime} variant="outlined" />}
                {movie.release_date && <Chip label={movie.release_date} variant="outlined" />}
              </Stack>

              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
                justifyContent={{ xs: 'center', md: 'flex-start' }}
                sx={{ mt: 1.5 }}
              >
                {movie.genres?.map((g) => (
                  <Chip key={g.id} label={g.name} size="small" color="primary" variant="outlined" />
                ))}
              </Stack>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                justifyContent={{ xs: 'center', md: 'flex-start' }}
                sx={{ mt: 3 }}
              >
                {trailer && (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<PlayArrowRoundedIcon />}
                    onClick={playTrailerInline}
                  >
                    Watch trailer
                  </Button>
                )}
                <Button
                  variant="outlined"
                  size="large"
                  color={favorite ? 'primary' : 'inherit'}
                  startIcon={favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  onClick={() => toggleFavorite(movie)}
                  aria-pressed={favorite}
                >
                  {favorite ? 'In favorites' : 'Add to favorites'}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: 6 }}>
        <Box component="section" sx={{ mt: 2 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Overview
          </Typography>
          <Typography sx={{ maxWidth: 820, lineHeight: 1.7 }}>
            {movie.overview || 'No overview available.'}
          </Typography>
          {directors.length > 0 && (
            <Typography sx={{ mt: 2 }}>
              <strong>Directed by:</strong> {directors.map((d) => d.name).join(', ')}
            </Typography>
          )}
        </Box>

        {trailer && (
          <>
            <Divider sx={{ my: 4 }} />
            <Box component="section" aria-labelledby="trailer-heading">
              <Typography id="trailer-heading" variant="h5" component="h2" gutterBottom>
                Trailer
              </Typography>
              <TrailerPlayer
                ref={trailerRef}
                videoKey={trailer.key}
                title={movie.title}
                poster={backdropUrl}
                playing={trailerPlaying}
                onPlay={() => setTrailerPlaying(true)}
              />
            </Box>
          </>
        )}

        {movie.credits?.cast?.length > 0 && (
          <>
            <Divider sx={{ my: 4 }} />
            <CastList cast={movie.credits.cast} />
          </>
        )}
      </Container>
    </>
  );
}
