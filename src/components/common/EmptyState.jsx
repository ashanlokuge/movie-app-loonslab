import { Box, Typography } from '@mui/material';
import MovieFilterOutlinedIcon from '@mui/icons-material/MovieFilterOutlined';

/** Friendly placeholder for empty lists (no results, no favourites, ...). */
export default function EmptyState({
  icon: Icon = MovieFilterOutlinedIcon,
  title,
  description,
  action,
}) {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: { xs: 6, sm: 10 },
        px: 2,
        color: 'text.secondary',
      }}
    >
      <Icon sx={{ fontSize: 64, mb: 2, opacity: 0.6 }} aria-hidden />
      <Typography variant="h6" component="p" color="text.primary" gutterBottom>
        {title}
      </Typography>
      {description && <Typography sx={{ maxWidth: 420, mx: 'auto' }}>{description}</Typography>}
      {action && <Box sx={{ mt: 3 }}>{action}</Box>}
    </Box>
  );
}
