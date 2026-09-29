import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MovieGrid from '../components/movies/MovieGrid';
import EmptyState from '../components/common/EmptyState';
import { useFavorites } from '../context/FavoritesContext';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function FavoritesPage() {
  useDocumentTitle('Favorites');
  const { favorites, clearFavorites } = useFavorites();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleClear = () => {
    clearFavorites();
    setConfirmOpen(false);
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, sm: 4 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          My favorites
          {favorites.length > 0 && (
            <Typography component="span" color="text.secondary" sx={{ ml: 1, fontSize: '0.6em' }}>
              {favorites.length} {favorites.length === 1 ? 'movie' : 'movies'}
            </Typography>
          )}
        </Typography>
        {favorites.length > 0 && (
          <Button
            color="inherit"
            startIcon={<DeleteOutlineIcon />}
            onClick={() => setConfirmOpen(true)}
          >
            Clear all
          </Button>
        )}
      </Stack>

      {favorites.length === 0 ? (
        <EmptyState
          icon={FavoriteBorderIcon}
          title="No favorites yet"
          description="Tap the heart on any movie to save it here. Your list is stored on this device."
          action={
            <Button component={RouterLink} to="/" variant="contained">
              Browse movies
            </Button>
          }
        />
      ) : (
        <MovieGrid movies={favorites} />
      )}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Clear all favorites?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will remove all {favorites.length} movies from your list. This can't be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleClear} color="error" variant="contained">
            Clear all
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
