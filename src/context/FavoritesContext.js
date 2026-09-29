/**
 * Favourites, persisted per username so shared browsers keep separate lists.
 * Only the fields a MovieCard needs are stored, keeping storage small.
 */
import { createContext, useCallback, useContext, useMemo } from 'react';
import { STORAGE_KEYS } from '../config/constants';
import useLocalStorage from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

/** Reduce a TMDb movie (list item or full details) to what a MovieCard needs. */
export const toFavoriteSnapshot = (movie) => ({
  id: movie.id,
  title: movie.title,
  poster_path: movie.poster_path,
  release_date: movie.release_date,
  vote_average: movie.vote_average,
  genre_ids: movie.genre_ids || movie.genres?.map((g) => g.id) || [],
  savedAt: Date.now(),
});

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const storageKey = STORAGE_KEYS.favorites(user?.username || 'guest');
  const [favorites, setFavorites] = useLocalStorage(storageKey, []);

  // O(1) lookups for the heart icon rendered on every card.
  const favoriteIds = useMemo(() => new Set(favorites.map((m) => m.id)), [favorites]);

  const isFavorite = useCallback((id) => favoriteIds.has(id), [favoriteIds]);

  const toggleFavorite = useCallback(
    (movie) =>
      setFavorites((prev) =>
        prev.some((m) => m.id === movie.id)
          ? prev.filter((m) => m.id !== movie.id)
          : [toFavoriteSnapshot(movie), ...prev],
      ),
    [setFavorites],
  );

  const clearFavorites = useCallback(() => setFavorites([]), [setFavorites]);

  const value = useMemo(
    () => ({ favorites, isFavorite, toggleFavorite, clearFavorites }),
    [favorites, isFavorite, toggleFavorite, clearFavorites],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within a FavoritesProvider');
  return ctx;
}
