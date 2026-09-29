import { IconButton, Tooltip } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useFavorites } from '../../context/FavoritesContext';

/** Heart toggle; stops click propagation so it can sit atop a clickable card. */
export default function FavoriteButton({ movie, size = 'medium', sx }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(movie.id);
  const label = active ? `Remove ${movie.title} from favorites` : `Add ${movie.title} to favorites`;

  const handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite(movie);
  };

  return (
    <Tooltip title={active ? 'Remove from favorites' : 'Add to favorites'}>
      <IconButton
        aria-label={label}
        aria-pressed={active}
        onClick={handleClick}
        size={size}
        sx={{ color: active ? 'primary.main' : 'inherit', ...sx }}
      >
        {active ? <FavoriteIcon fontSize="inherit" /> : <FavoriteBorderIcon fontSize="inherit" />}
      </IconButton>
    </Tooltip>
  );
}
