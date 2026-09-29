import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from './SearchBar';
import { SEARCH_DEBOUNCE_MS } from '../../config/constants';

describe('SearchBar', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('debounces typing into a single search call', async () => {
    const onSearch = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<SearchBar value="" onSearch={onSearch} />);
    onSearch.mockClear(); // ignore the initial mount call

    await user.type(screen.getByRole('searchbox', { name: /search movies/i }), 'dune');
    expect(onSearch).not.toHaveBeenCalledWith('dune');

    act(() => jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS));
    expect(onSearch).toHaveBeenLastCalledWith('dune');
    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  test('pressing Enter searches immediately and the clear button resets', async () => {
    const onSearch = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<SearchBar value="" onSearch={onSearch} />);

    await user.type(screen.getByRole('searchbox'), 'alien{Enter}');
    expect(onSearch).toHaveBeenLastCalledWith('alien');

    await user.click(screen.getByRole('button', { name: /clear search/i }));
    expect(onSearch).toHaveBeenLastCalledWith('');
    expect(screen.getByRole('searchbox')).toHaveValue('');
  });

  test('pre-fills the last search restored from storage', () => {
    render(<SearchBar value="interstellar" onSearch={jest.fn()} />);
    expect(screen.getByRole('searchbox')).toHaveValue('interstellar');
  });
});
