import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Badge, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useFavorites } from '../../context/FavoritesContext';

/** Bottom-bar height; AppLayout pads the page by this much so content never hides behind it. */
export const MOBILE_NAV_HEIGHT = 56;

/** Which tab is active for the current URL (none on e.g. a movie details page). */
function activeTab(pathname) {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/trending')) return 'trending';
  if (pathname.startsWith('/favorites')) return 'favorites';
  return false;
}

/** Phone-only bottom nav (hidden from 600px up, where the header shows the links). */
export default function MobileNav() {
  const { pathname } = useLocation();
  const { favorites } = useFavorites();

  return (
    <Paper
      component="nav"
      aria-label="Main"
      elevation={0}
      sx={{
        display: { xs: 'block', sm: 'none' },
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: (t) => t.zIndex.appBar,
        borderTop: 1,
        borderColor: 'divider',
        // Keep clear of the iPhone home indicator.
        pb: 'env(safe-area-inset-bottom)',
      }}
    >
      <BottomNavigation value={activeTab(pathname)} showLabels sx={{ height: MOBILE_NAV_HEIGHT }}>
        <BottomNavigationAction
          component={RouterLink}
          to="/"
          value="home"
          label="Home"
          icon={<HomeOutlinedIcon />}
        />
        <BottomNavigationAction
          component={RouterLink}
          to="/trending"
          value="trending"
          label="Trending"
          icon={<TrendingUpIcon />}
        />
        <BottomNavigationAction
          component={RouterLink}
          to="/favorites"
          value="favorites"
          label="Favorites"
          icon={
            <Badge badgeContent={favorites.length} color="primary" max={99}>
              <FavoriteBorderIcon />
            </Badge>
          }
        />
      </BottomNavigation>
    </Paper>
  );
}
