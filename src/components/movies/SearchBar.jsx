import { useEffect, useRef, useState } from 'react';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import useDebounce from '../../hooks/useDebounce';
import { SEARCH_DEBOUNCE_MS } from '../../config/constants';

/**
 * Controlled search input: debounces typing, Enter submits immediately, clear button resets.
 * @param {string} value  The committed query (e.g. restored from localStorage).
 */
export default function SearchBar({ value, onSearch }) {
  const [input, setInput] = useState(value);
  const debouncedInput = useDebounce(input, SEARCH_DEBOUNCE_MS);
  // Latest callback in a ref so the debounce effect only fires when the text changes.
  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;

  // Sync when value changes elsewhere; compare trimmed so we don't strip a trailing space mid-type.
  useEffect(() => {
    setInput((prev) => (prev.trim() === value ? prev : value));
  }, [value]);

  useEffect(() => {
    onSearchRef.current(debouncedInput);
  }, [debouncedInput]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(input);
  };

  const handleClear = () => {
    setInput('');
    onSearch('');
  };

  return (
    <form role="search" onSubmit={handleSubmit}>
      <TextField
        fullWidth
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search for a movie…"
        // type="search" stops browsers guessing this is a phone/address field.
        type="search"
        name="movie-search"
        autoComplete="off"
        inputProps={{
          'aria-label': 'Search movies',
          maxLength: 100,
          enterKeyHint: 'search',
          spellCheck: false,
        }}
        sx={{
          // type="search" adds the browser's own clear (×) button; we already render one.
          '& input::-webkit-search-cancel-button': { display: 'none' },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: input && (
            <InputAdornment position="end">
              <IconButton aria-label="Clear search" onClick={handleClear} edge="end">
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </form>
  );
}
