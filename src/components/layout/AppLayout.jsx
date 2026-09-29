import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CircularProgress, Container, Link, Typography } from '@mui/material';
import AppHeader from './AppHeader';
import MobileNav, { MOBILE_NAV_HEIGHT } from './MobileNav';
import { FavoritesProvider } from '../../context/FavoritesContext';
import { MoviesProvider } from '../../context/MoviesContext';

/**
 * Shell for authenticated pages. Favourites/movies state lives here (not at
 * app root) so browsing data loads only after login and resets on logout.
 */
export default function AppLayout() {
  return (
    <FavoritesProvider>
      <MoviesProvider>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            // Reserve space for the phone bottom bar so it never covers the last content.
            pb: {
              xs: `calc(${MOBILE_NAV_HEIGHT}px + env(safe-area-inset-bottom))`,
              sm: 0,
            },
          }}
        >
          <AppHeader />
          <Box component="main" sx={{ flexGrow: 1 }}>
            {/* Fallback shown while a lazily-loaded page chunk downloads. */}
            <Suspense
              fallback={
                <Box sx={{ display: 'grid', placeItems: 'center', py: 10 }}>
                  <CircularProgress aria-label="Loading page" />
                </Box>
              }
            >
              <Outlet />
            </Suspense>
          </Box>
          <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', mt: 4 }}>
            <Container
              maxWidth="xl"
              sx={{
                py: 3,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Designed and developed by{' '}
                <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
                  Ashan Lokuge
                </Box>
              </Typography>
              {/* TMDb's API terms require crediting TMDb as the data source. */}
              <Typography variant="caption" color="text.secondary">
                Movie data from{' '}
                <Link href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">
                  TMDb
                </Link>
              </Typography>
            </Container>
          </Box>
          <MobileNav />
        </Box>
      </MoviesProvider>
    </FavoritesProvider>
  );
}
