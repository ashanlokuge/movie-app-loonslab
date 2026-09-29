import { NavLink, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useThemeMode } from '../../context/ThemeModeContext';

/** Nav button that highlights when its route is active. Labels collapse to icons on phones. */
function NavButton({ to, icon, label, end }) {
  return (
    <Button
      component={NavLink}
      to={to}
      end={end}
      color="inherit"
      startIcon={icon}
      sx={{
        opacity: 0.8,
        // 44px keeps the icon-only buttons on phones a comfortable touch target.
        minWidth: 44,
        minHeight: 44,
        '&.active': { opacity: 1, color: 'primary.main' },
        '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1.5 } },
      }}
    >
      <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
        {label}
      </Box>
    </Button>
  );
}

export default function AppHeader() {
  const { user, logout } = useAuth();
  const { favorites } = useFavorites();
  const { mode, toggleMode } = useThemeMode();
  const nextMode = mode === 'dark' ? 'light' : 'dark';

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        backdropFilter: 'blur(8px)',
        bgcolor: (t) =>
          t.palette.mode === 'dark' ? 'rgba(13,17,23,0.85)' : 'rgba(255,255,255,0.85)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ gap: { xs: 0.5, sm: 1 } }}>
          <Box
            component={RouterLink}
            to="/"
            aria-label="Movie Explorer home"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: 'inherit',
              textDecoration: 'none',
              mr: 'auto',
              minHeight: 44,
              minWidth: 44,
            }}
          >
            <LocalMoviesIcon color="primary" />
            <Typography variant="h6" component="span" fontWeight={800} noWrap>
              Movie
              <Box component="span" sx={{ color: 'primary.main' }}>
                Explorer
              </Box>
            </Typography>
          </Box>

          {/* Phones use the bottom bar (MobileNav) instead of these links. */}
          <Box component="nav" aria-label="Main" sx={{ display: { xs: 'none', sm: 'flex' } }}>
            <NavButton to="/" end icon={<HomeOutlinedIcon />} label="Home" />
            <NavButton to="/trending" icon={<TrendingUpIcon />} label="Trending" />
            <NavButton
              to="/favorites"
              icon={
                <Badge badgeContent={favorites.length} color="primary" max={99}>
                  <FavoriteBorderIcon />
                </Badge>
              }
              label="Favorites"
            />
          </Box>

          <Tooltip title={`Switch to ${nextMode} mode`}>
            <IconButton
              onClick={toggleMode}
              color="inherit"
              aria-label={`Switch to ${nextMode} mode`}
            >
              {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title={`Log out (${user?.username})`}>
            <IconButton onClick={logout} color="inherit" aria-label="Log out">
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
