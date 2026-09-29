import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeModeContext';
import { DEMO_USER } from '../config/constants';
import PosterWall from '../components/auth/PosterWall';
import useDocumentTitle from '../hooks/useDocumentTitle';

/** Field-level validation. Returns an object of error messages keyed by field name. */
export function validateLogin({ username, password }) {
  const errors = {};
  if (!username.trim()) errors.username = 'Username is required.';
  if (!password) errors.password = 'Password is required.';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters.';
  return errors;
}

/** Label rendered above its input (instead of MUI's floating label) for a calmer form. */
function FieldLabel({ htmlFor, children }) {
  return (
    <Typography
      component="label"
      htmlFor={htmlFor}
      variant="body2"
      sx={{ display: 'block', fontWeight: 600, mb: 0.75 }}
    >
      {children}
    </Typography>
  );
}

export default function LoginPage() {
  useDocumentTitle('Sign in');
  const { isAuthenticated, login } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();
  // Send users back to the page they originally requested (set by ProtectedRoute).
  const redirectTo = location.state?.from?.pathname || '/';

  const [values, setValues] = useState({ username: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (isAuthenticated) return <Navigate to={redirectTo} replace />;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validateLogin(values);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      await login(values.username, values.password);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setFormError(error.message);
      setSubmitting(false);
    }
  };

  const fillDemo = () => {
    setValues({ username: DEMO_USER.username, password: DEMO_USER.password });
    setFieldErrors({});
    setFormError('');
  };

  const nextMode = mode === 'dark' ? 'light' : 'dark';
  const monoSx = { fontFamily: (t) => t.typography.fontFamilyMono, fontSize: '0.8125rem' };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(420px, 520px)' },
        bgcolor: 'background.paper',
      }}
    >
      {/* Left: poster wall (tablet landscape and up). */}
      <Box
        sx={{ display: { xs: 'none', md: 'block' }, position: 'sticky', top: 0, height: '100vh' }}
      >
        <PosterWall />
      </Box>

      <Box
        component="main"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          px: { xs: 3, sm: 6, lg: 8 },
          py: { xs: 3, sm: 4 },
          borderLeft: { md: 1 },
          borderColor: { md: 'divider' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalMoviesIcon color="primary" aria-hidden />
            <Typography component="span" variant="h6" fontWeight={800} noWrap>
              Movie
              <Box component="span" sx={{ color: 'primary.main' }}>
                Explorer
              </Box>
            </Typography>
          </Box>
          <Tooltip title={`Switch to ${nextMode} mode`}>
            <IconButton onClick={toggleMode} aria-label={`Switch to ${nextMode} mode`} edge="end">
              {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: '100%',
            maxWidth: 380,
            // Centred when the poster wall is hidden; aligned to the panel edge beside it.
            mx: { xs: 'auto', md: 0 },
            py: { xs: 6, md: 4 },
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}
          >
            Sign in
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>
            Pick up where you left off: your searches and favourites are waiting.
          </Typography>

          {formError && (
            <Alert severity="error" variant="outlined" sx={{ mb: 3 }} role="alert">
              {formError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Box sx={{ mb: 2.5 }}>
              <FieldLabel htmlFor="login-username">Username</FieldLabel>
              <TextField
                id="login-username"
                name="username"
                value={values.username}
                onChange={handleChange}
                error={Boolean(fieldErrors.username)}
                helperText={fieldErrors.username}
                autoComplete="username"
                autoFocus
                fullWidth
                size="small"
                inputProps={{ sx: { py: 1.25 } }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <FieldLabel htmlFor="login-password">Password</FieldLabel>
              <TextField
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={values.password}
                onChange={handleChange}
                error={Boolean(fieldErrors.password)}
                helperText={fieldErrors.password}
                autoComplete="current-password"
                fullWidth
                size="small"
                inputProps={{ sx: { py: 1.25 } }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword((s) => !s)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={submitting}
              sx={{ py: 1.25 }}
              startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </Box>

          {/* Demo access: part of the page, not a system alert. */}
          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <Box>
              <Typography variant="body2" fontWeight={600}>
                Demo account
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                <Box component="code" sx={monoSx}>
                  {DEMO_USER.username}
                </Box>
                {' / '}
                <Box component="code" sx={monoSx}>
                  {DEMO_USER.password}
                </Box>
              </Typography>
            </Box>
            <Button variant="outlined" color="inherit" size="small" onClick={fillDemo}>
              Use demo account
            </Button>
          </Box>
        </Box>

        <Typography variant="caption" color="text.secondary">
          Movie data from TMDb. Not endorsed or certified by TMDb.
        </Typography>
      </Box>
    </Box>
  );
}
