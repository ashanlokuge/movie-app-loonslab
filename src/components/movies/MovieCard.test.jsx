import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MovieCard from './MovieCard';
import { renderWithProviders, sampleMovie } from '../../test-utils';

describe('MovieCard', () => {
  test('shows title, release year and rating, and links to the details page', () => {
    renderWithProviders(<MovieCard movie={sampleMovie} />);

    expect(screen.getByRole('heading', { name: 'Inception' })).toBeInTheDocument();
    expect(screen.getByText('2010')).toBeInTheDocument();
    expect(screen.getByText('8.4')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /inception \(2010\)/i })).toHaveAttribute(
      'href',
      '/movie/27205',
    );
  });

  test('toggling the heart saves the movie to localStorage', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MovieCard movie={sampleMovie} />);

    await user.click(screen.getByRole('button', { name: /add inception to favorites/i }));

    const stored = JSON.parse(localStorage.getItem('movie-explorer:favorites:guest'));
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({ id: 27205, title: 'Inception' });
    expect(
      screen.getByRole('button', { name: /remove inception from favorites/i }),
    ).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: /remove inception from favorites/i }));
    expect(JSON.parse(localStorage.getItem('movie-explorer:favorites:guest'))).toEqual([]);
  });

  test('renders a placeholder when the movie has no poster', () => {
    renderWithProviders(
      <MovieCard movie={{ ...sampleMovie, poster_path: null, vote_average: 0 }} />,
    );
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('NR')).toBeInTheDocument();
  });
});
