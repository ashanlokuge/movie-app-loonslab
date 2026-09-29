import { Avatar, Box, Stack, Typography } from '@mui/material';
import ScrollArrows from '../common/ScrollArrows';
import useHorizontalScroll from '../../hooks/useHorizontalScroll';
import { IMAGE_SIZES } from '../../config/constants';
import { getImageUrl } from '../../utils/formatters';

/** "Top cast" row: same horizontal-scroll behaviour as the Trending row. */
export default function CastList({ cast, limit = 15, heading = 'Top cast' }) {
  const topCast = cast.slice(0, limit);
  const { ref, edges, scrollByPage, onScroll, scrollerSx } = useHorizontalScroll(topCast.length);
  if (topCast.length === 0) return null;

  return (
    <Box component="section" aria-labelledby="cast-heading">
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography id="cast-heading" variant="h5" component="h2">
          {heading}
        </Typography>
        <ScrollArrows label="cast" edges={edges} onScroll={scrollByPage} />
      </Stack>

      <Box
        ref={ref}
        component="ul"
        onScroll={onScroll}
        sx={{ ...scrollerSx, listStyle: 'none', p: 0, m: 0, gap: { xs: 2, sm: 3 } }}
      >
        {topCast.map((person) => (
          <Box
            component="li"
            key={person.credit_id || person.id}
            sx={{ flex: '0 0 auto', width: 104, textAlign: 'center', scrollSnapAlign: 'start' }}
          >
            <Avatar
              src={getImageUrl(person.profile_path, IMAGE_SIZES.profile) || undefined}
              alt={person.name}
              imgProps={{ loading: 'lazy' }}
              sx={{ width: 88, height: 88, mx: 'auto', mb: 1 }}
            >
              {person.name?.[0]}
            </Avatar>
            <Typography variant="body2" fontWeight={600} lineHeight={1.25}>
              {person.name}
            </Typography>
            {person.character && (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                lineHeight={1.25}
                sx={{ mt: 0.25 }}
              >
                {person.character}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
