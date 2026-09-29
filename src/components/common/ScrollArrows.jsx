import { IconButton, Stack } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const arrowSx = { border: 1, borderColor: 'divider' };

/**
 * Previous/next buttons for a horizontal row; hidden on desktop when the row already fits.
 * @param {string} label  Completes the accessible name, e.g. "Scroll trending movies left".
 */
export default function ScrollArrows({ label, edges, onScroll, disabled = false }) {
  if (edges.atStart && edges.atEnd && !disabled) return null;

  return (
    <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', md: 'flex' } }}>
      <IconButton
        aria-label={`Scroll ${label} left`}
        onClick={() => onScroll(-1)}
        disabled={edges.atStart || disabled}
        sx={arrowSx}
      >
        <ChevronLeftIcon />
      </IconButton>
      <IconButton
        aria-label={`Scroll ${label} right`}
        onClick={() => onScroll(1)}
        disabled={edges.atEnd || disabled}
        sx={arrowSx}
      >
        <ChevronRightIcon />
      </IconButton>
    </Stack>
  );
}
