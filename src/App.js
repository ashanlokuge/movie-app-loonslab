/** Application root: global providers (ThemeMode > Auth > Router) + route table. */
import { lazy } from 'react';
import { Outlet, RouterProvider, ScrollRestoration, createBrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeModeProvider } from './context/ThemeModeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
// Code-split: keeps these out of the initial bundle.
const MovieDetailsPage = lazy(() => import('./pages/MovieDetailsPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const TrendingPage = lazy(() => import('./pages/TrendingPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function RootRoute() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
}

export const routes = [
  {
    element: <RootRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { index: true, element: <HomePage /> },
              { path: 'movie/:movieId', element: <MovieDetailsPage /> },
              { path: 'trending', element: <TrendingPage /> },
              { path: 'favorites', element: <FavoritesPage /> },
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
];

/** Opt in to RRv7 behaviour now so a future upgrade is painless. */
const router = createBrowserRouter(routes, {
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  },
});

export default function App() {
  return (
    <ThemeModeProvider>
      <ErrorBoundary>
        <AuthProvider>
          <RouterProvider router={router} future={{ v7_startTransition: true }} />
        </AuthProvider>
      </ErrorBoundary>
    </ThemeModeProvider>
  );
}
