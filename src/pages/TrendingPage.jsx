import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  FormControlLabel,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import MovieGrid from '../components/movies/MovieGrid';
import LoadMoreControl from '../components/movies/LoadMoreControl';
import TrendingSpotlight, {
  TrendingSpotlightSkeleton,
} from '../components/movies/TrendingSpotlight';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { STATUS } from '../context/movieReducer';
import { LOAD_MODES, STORAGE_KEYS } from '../config/constants';
import useLocalStorage from '../hooks/useLocalStorage';
import useDocumentTitle from '../hooks/useDocumentTitle';
import useTrendingMovies from '../hooks/useTrendingMovies';

const WINDOW_LABELS = { day: 'today', week: 'this week' };

/** Accept only known values from the URL; anything else falls back to "week". */
export const parseTimeWindow = (value) => (value === 'day' ? 'day' : 'week');

/** The ranked list for one time window. Remounted (via `key`) when the window changes. */
function TrendingResults({ timeWindow, loadMode }) {
  const { movies, status, error, hasMore, loadMore, retry } = useTrendingMovies(timeWindow);
  const isInitialLoading = status === STATUS.loading || (status === STATUS.idle && !movies.length);
  const hasError = status === STATUS.error;

  if (hasError && movies.length === 0) {
    return <ErrorState title="Couldn't load trending movies" error={error} onRetry={retry} />;
  }
  if (isInitialLoading) {
    return (
      <>
        <TrendingSpotlightSkeleton />
        <MovieGrid movies={[]} loading />
      </>
    );
  }
  if (movies.length === 0) {
    return <EmptyState title="Nothing is trending right now" description="Check back later." />;
  }

  const [top, ...rest] = movies;
  return (
    <>
      <TrendingSpotlight movie={top} timeWindowLabel={WINDOW_LABELS[timeWindow]} />
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        Also trending
      </Typography>
      <MovieGrid
        movies={rest}
        rankStart={2}
        loading={status === STATUS.loadingMore}
        fillRows={hasMore}
      />
      {hasError && <ErrorState title="Couldn't load more movies" error={error} onRetry={retry} />}
      <LoadMoreControl
        mode={loadMode}
        hasMore={hasMore}
        loading={status === STATUS.loadingMore}
        disabled={hasError}
        onLoadMore={loadMore}
      />
    </>
  );
}

export default function TrendingPage() {
  // Time window lives in the URL so the view is shareable and Back works between Today/This week.
  const [searchParams, setSearchParams] = useSearchParams();
  const timeWindow = parseTimeWindow(searchParams.get('window'));
  const [loadMode, setLoadMode] = useLocalStorage(STORAGE_KEYS.loadMode, LOAD_MODES.button);
  useDocumentTitle(`Trending ${WINDOW_LABELS[timeWindow]}`);

  const changeWindow = (_, value) => {
    if (value) setSearchParams(value === 'week' ? {} : { window: value });
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, sm: 4 } }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'flex-start', md: 'flex-end' }}
        justifyContent="space-between"
        sx={{ mb: { xs: 3, sm: 4 } }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
            Trending
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5, maxWidth: 560 }}>
            The movies getting the most attention on TMDb {WINDOW_LABELS[timeWindow]}, ranked.
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center" useFlexGap flexWrap="wrap">
          <ToggleButtonGroup
            size="small"
            exclusive
            value={timeWindow}
            onChange={changeWindow}
            aria-label="Trending time window"
          >
            <ToggleButton value="day">Today</ToggleButton>
            <ToggleButton value="week">This week</ToggleButton>
          </ToggleButtonGroup>
          <FormControlLabel
            control={
              <Switch
                checked={loadMode === LOAD_MODES.infinite}
                onChange={(e) =>
                  setLoadMode(e.target.checked ? LOAD_MODES.infinite : LOAD_MODES.button)
                }
              />
            }
            label="Infinite scroll"
          />
        </Stack>
      </Stack>

      <TrendingResults key={timeWindow} timeWindow={timeWindow} loadMode={loadMode} />
    </Container>
  );
}
