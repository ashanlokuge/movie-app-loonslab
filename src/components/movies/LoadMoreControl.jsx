import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { LOAD_MODES } from '../../config/constants';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';

/** Footer for paginated lists: infinite-scroll sentinel or an explicit "Load more" button. */
export default function LoadMoreControl({ mode, hasMore, loading, disabled = false, onLoadMore }) {
  const sentinelRef = useInfiniteScroll({
    onLoadMore,
    enabled: mode === LOAD_MODES.infinite && hasMore && !loading && !disabled,
  });

  if (!hasMore) {
    return (
      <Typography align="center" color="text.secondary" variant="body2" sx={{ py: 4 }}>
        You've reached the end.
      </Typography>
    );
  }

  return (
    <Box ref={sentinelRef} sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
      {mode === LOAD_MODES.button ? (
        <Button
          variant="outlined"
          size="large"
          onClick={onLoadMore}
          disabled={loading || disabled}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
        >
          {loading ? 'Loading...' : 'Load more'}
        </Button>
      ) : (
        loading && <CircularProgress aria-label="Loading more movies" />
      )}
    </Box>
  );
}
