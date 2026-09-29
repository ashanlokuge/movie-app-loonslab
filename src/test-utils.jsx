/** Shared test helper: render a component wrapped with all the providers it needs. */
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ThemeModeProvider } from './context/ThemeModeContext';

/** Opt in to React Router v7 behaviour now (also silences deprecation warnings). */
const ROUTER_FUTURE_FLAGS = { v7_startTransition: true, v7_relativeSplatPath: true };

export function renderWithProviders(ui, { route = '/' } = {}) {
  return render(
    <ThemeModeProvider>
      <AuthProvider>
        <FavoritesProvider>
          <MemoryRouter initialEntries={[route]} future={ROUTER_FUTURE_FLAGS}>
            {ui}
          </MemoryRouter>
        </FavoritesProvider>
      </AuthProvider>
    </ThemeModeProvider>,
  );
}

export const sampleMovie = {
  id: 27205,
  title: 'Inception',
  poster_path: '/inception.jpg',
  release_date: '2010-07-15',
  vote_average: 8.369,
  genre_ids: [28, 878],
};
