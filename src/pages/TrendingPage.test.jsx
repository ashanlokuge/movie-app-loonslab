import { screen } from '@testing-library/react';
import { parseTimeWindow } from './TrendingPage';
import MovieCard from '../components/movies/MovieCard';
import { renderWithProviders, sampleMovie } from '../test-utils';

describe('parseTimeWindow', () => {
  test('accepts "day", defaults everything else to "week"', () => {
    expect(parseTimeWindow('day')).toBe('day');
    expect(parseTimeWindow('week')).toBe('week');
    expect(parseTimeWindow(null)).toBe('week');
    expect(parseTimeWindow('<script>')).toBe('week');
  });
});

describe('ranked MovieCard', () => {
  test('shows the rank badge and announces the position to screen readers', () => {
    renderWithProviders(<MovieCard movie={sampleMovie} rank={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^number 3: inception/i })).toBeInTheDocument();
  });

  test('has no rank badge by default', () => {
    renderWithProviders(<MovieCard movie={sampleMovie} />);
    expect(screen.getByRole('link', { name: /^inception/i })).toBeInTheDocument();
  });
});
