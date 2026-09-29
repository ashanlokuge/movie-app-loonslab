import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MovieCard from './MovieCard';
import MovieCardSkeleton from './MovieCardSkeleton';
import ErrorState from '../common/ErrorState';
import ScrollArrows from '../common/ScrollArrows';
import useHorizontalScroll from '../../hooks/useHorizontalScroll';
import { getTrendingMovies } from '../../api/movieService';
import { isCancelledRequest } from '../../utils/errors';

const CARD_WIDTH = { xs: 140, sm: 160, md: 180 };

/**
 * Always-visible "Trending" row on the home page; owns its own data so it
 * stays visible while the user searches/filters the grid below.
 */
export default function TrendingRow() {
  const [timeWindow, setTimeWindow] = useState('week');
  const [state, setState] = useState({ status: 'loading', movies: [], error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, status: 'loading', error: null }));
    getTrendingMovies({ timeWindow, signal: controller.signal })
      .then(({ results }) => setState({ status: 'success', movies: results, error: null }))
      .catch((error) => {
        if (!isCancelledRequest(error)) setState({ status: 'error', movies: [], error });
      });
    return () => controller.abort();
  }, [timeWindow, attempt]);

  // Shared row behaviour; resets to the start whenever the list changes (Today / This week).
  const { ref, edges, scrollByPage, onScroll, scrollerSx } = useHorizontalScroll(state.movies);

  const isLoading = state.status === 'loading';

  return (
    <Box component="section" aria-labelledby="trending-heading" sx={{ mb: { xs: 4, sm: 6 } }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Stack direction="row" alignItems="center" spacing={2} useFlexGap flexWrap="wrap">
          <Typography id="trending-heading" variant="h5" component="h2">
            Trending
          </Typography>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={timeWindow}
            onChange={(_, value) => value && setTimeWindow(value)}
            aria-label="Trending time window"
          >
            <ToggleButton value="day">Today</ToggleButton>
            <ToggleButton value="week">This week</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        <Stack direction="row" spacing={0.5} alignItems="center">
          {/* Early in the tab order, so keyboard users can skip the 20 cards below. */}
          <Button
            component={RouterLink}
            to={timeWindow === 'week' ? '/trending' : '/trending?window=day'}
            variant="outlined"
            color="inherit"
            endIcon={<ArrowForwardIcon />}
            sx={{
              height: 42, // matches the bordered IconButtons (40px + 1px border each side)
              px: 2,
              mr: { md: 1 },
              borderRadius: 999,
              borderColor: 'divider',
              whiteSpace: 'nowrap',
              '&:hover': { borderColor: 'text.primary', bgcolor: 'action.hover' },
            }}
          >
            See all
          </Button>
          <ScrollArrows
            label="trending movies"
            edges={edges}
            onScroll={scrollByPage}
            disabled={isLoading}
          />
        </Stack>
      </Stack>

      {state.status === 'error' ? (
        <ErrorState
          title="Couldn't load trending movies"
          error={state.error}
          onRetry={() => setAttempt((n) => n + 1)}
        />
      ) : (
        <Box
          ref={ref}
          component="ul"
          onScroll={onScroll}
          aria-busy={isLoading}
          sx={{
            ...scrollerSx,
            listStyle: 'none',
            m: 0,
            p: 0,
            // Room for the card hover lift, which overflow-x would otherwise clip.
            pt: 0.75,
            pb: 1.5,
            gap: { xs: 1.5, sm: 2 },
          }}
        >
          {(isLoading ? Array.from({ length: 8 }, (_, i) => ({ id: `s${i}` })) : state.movies).map(
            (movie) => (
              <Box
                component="li"
                key={movie.id}
                sx={{ flex: '0 0 auto', width: CARD_WIDTH, scrollSnapAlign: 'start' }}
              >
                {isLoading ? <MovieCardSkeleton /> : <MovieCard movie={movie} />}
              </Box>
            ),
          )}
        </Box>
      )}
    </Box>
  );
}
