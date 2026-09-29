import { useMemo } from 'react';
import { Box, Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined';
import { OLDEST_FILTER_YEAR } from '../../config/constants';

const RATING_OPTIONS = [9, 8, 7, 6, 5];

/** Genre / year / minimum-rating filters. */
export default function FilterBar({ filters, genres, onChange, onReset }) {
  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: current - OLDEST_FILTER_YEAR + 1 }, (_, i) => String(current - i));
  }, []);

  const hasActiveFilters = Boolean(filters.genreId || filters.year || filters.minRating);

  const select = (id, label, value, field, options) => (
    <FormControl
      size="small"
      sx={{ minWidth: { xs: 0, sm: 150 }, flex: { xs: '1 1 45%', sm: '0 0 auto' } }}
    >
      <InputLabel id={`${id}-label`}>{label}</InputLabel>
      <Select
        labelId={`${id}-label`}
        id={id}
        value={value}
        label={label}
        onChange={(e) => onChange({ [field]: e.target.value })}
        MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
      >
        <MenuItem value="">
          <em>Any</em>
        </MenuItem>
        {options}
      </Select>
    </FormControl>
  );

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
      {select(
        'filter-genre',
        'Genre',
        filters.genreId,
        'genreId',
        genres.map((g) => (
          <MenuItem key={g.id} value={String(g.id)}>
            {g.name}
          </MenuItem>
        )),
      )}
      {select(
        'filter-year',
        'Year',
        filters.year,
        'year',
        years.map((y) => (
          <MenuItem key={y} value={y}>
            {y}
          </MenuItem>
        )),
      )}
      {select(
        'filter-rating',
        'Rating',
        filters.minRating,
        'minRating',
        RATING_OPTIONS.map((r) => (
          <MenuItem key={r} value={String(r)}>
            {r}+ ★
          </MenuItem>
        )),
      )}
      {hasActiveFilters && (
        <Button onClick={onReset} startIcon={<FilterAltOffOutlinedIcon />} size="small">
          Clear filters
        </Button>
      )}
    </Box>
  );
}
