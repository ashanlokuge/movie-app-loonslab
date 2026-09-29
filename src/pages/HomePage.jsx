import { Box, Container, FormControlLabel, Stack, Switch, Typography } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import SearchBar from '../components/movies/SearchBar';
import FilterBar from '../components/movies/FilterBar';
import MovieGrid from '../components/movies/MovieGrid';
import TrendingRow from '../components/movies/TrendingRow';
import LoadMoreControl from '../components/movies/LoadMoreControl';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { useMovies } from '../context/MoviesContext';
import { STATUS } from '../context/movieReducer';
import { LOAD_MODES, STORAGE_KEYS } from '../config/constants';
import useLocalStorage from '../hooks/useLocalStorage';
import useDocumentTitle from '../hooks/useDocumentTitle';

/** Heading for the results section, which depends on what the user is browsing. */
function SectionTitle({ mode, query, totalResults }) {
  if (mode === 'search') {
    return (
      <>
        Results for “{query}”
        <Typography component="span" color="text.secondary" sx={{ ml: 1, fontSize: '0.6em' }}>
          {totalResults.toLocaleString()} found
        </Typography>
      </>
    );
  }
  if (mode === 'discover') return 'Discover movies';
  return 'Popular right now';
}

export default function HomePage() {
  const {
    query,
    filters,
    genres,
    mode,
    movies,
    status,
    error,
    totalResults,
    hasMore,
    setQuery,
    setFilters,
    resetFilters,
    loadMore,
    retry,
  } = useMovies();
  const [loadMode, setLoadMode] = useLocalStorage(STORAGE_KEYS.loadMode, LOAD_MODES.button);
  useDocumentTitle(query ? `Search: ${query}` : null);

  const isInitialLoading = status === STATUS.loading;
  const hasError = status === STATUS.error;
  const isEmpty = status === STATUS.success && movies.length === 0;

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, sm: 4 } }}>
      <Box sx={{ maxWidth: 720, mx: 'auto', mb: { xs: 3, sm: 5 }, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Find your next favorite movie
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Search millions of titles, browse what's trending, and build your watchlist.
        </Typography>
        <SearchBar value={query} onSearch={setQuery} />
      </Box>

      {/* Always visible, independent of the search/filter grid below. */}
      <TrendingRow />

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Typography variant="h5" component="h2" aria-live="polite">
          <SectionTitle mode={mode} query={query} totalResults={totalResults} />
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
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

      <Box sx={{ mb: 3 }}>
        <FilterBar filters={filters} genres={genres} onChange={setFilters} onReset={resetFilters} />
        {mode === 'search' && (filters.genreId || filters.minRating) && (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            Genre and rating filters are applied to search results as they load.
          </Typography>
        )}
      </Box>

      {hasError && movies.length === 0 ? (
        <ErrorState title="Couldn't load movies" error={error} onRetry={retry} />
      ) : isEmpty ? (
        <EmptyState
          icon={SearchOffIcon}
          title="No movies found"
          description={
            mode === 'search'
              ? 'Try a different title or loosen your filters.'
              : 'No movies match these filters. Try widening them.'
          }
        />
      ) : (
        <>
          <MovieGrid
            movies={movies}
            loading={isInitialLoading || status === STATUS.loadingMore}
            fillRows={hasMore}
          />
          {/* Errors while loading *more* keep existing results visible. */}
          {hasError && (
            <ErrorState title="Couldn't load more movies" error={error} onRetry={retry} />
          )}
          {!isInitialLoading && movies.length > 0 && (
            <LoadMoreControl
              mode={loadMode}
              hasMore={hasMore}
              loading={status === STATUS.loadingMore}
              disabled={hasError}
              onLoadMore={loadMore}
            />
          )}
        </>
      )}
    </Container>
  );
}
