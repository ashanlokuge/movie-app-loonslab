/** MUI theme factory: colours, radii and typography in one place. */
import { alpha, createTheme, responsiveFontSizes } from '@mui/material/styles';

/**
 * Brand red, tuned per mode for WCAG AA (4.5:1) text contrast.
 * light #d11f35  4.95:1 bg · 5.31:1 white text on it
 * dark  #ff6474  6.60:1 bg · 6.79:1 dark text on it
 */
const brand = {
  light: { main: '#d11f35', contrastText: '#ffffff' },
  dark: { main: '#ff6474', contrastText: '#140a0c' },
  secondary: '#f5c518', // rating gold
};

/** Minimum touch-target size in px, applied only on touch screens. */
const TOUCH_TARGET = 44;
const COARSE_POINTER = '@media (pointer: coarse)';

export function buildTheme(mode) {
  const isDark = mode === 'dark';

  const theme = createTheme({
    palette: {
      mode,
      primary: isDark ? brand.dark : brand.light,
      secondary: { main: brand.secondary },
      background: isDark
        ? { default: '#0d1117', paper: '#161b22' }
        : { default: '#f6f7f9', paper: '#ffffff' },
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        'Helvetica',
        'Arial',
        'sans-serif',
      ].join(','),
      // Custom key, read via `theme.typography.fontFamilyMono` (credentials, codes).
      fontFamilyMono: 'ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, monospace',
      h1: { fontWeight: 800 },
      h2: { fontWeight: 800 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      // Coarse-pointer screens get a 44px min tap target (Apple HIG / Material); mouse unaffected.
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { [COARSE_POINTER]: { minHeight: TOUCH_TARGET, minWidth: TOUCH_TARGET } },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          // Icon buttons keep their visual size; an invisible ::after extends the hit area to 44px.
          root: {
            [COARSE_POINTER]: {
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: `min(0px, calc((100% - ${TOUCH_TARGET}px) / 2))`,
              },
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          // Focus = red border + soft halo, so it doesn't read as an error state.
          // Hover uses mid grey rather than MUI's default near-black.
          root: ({ theme: t }) => ({
            [COARSE_POINTER]: { minHeight: TOUCH_TARGET },
            '&:hover:not(.Mui-focused):not(.Mui-error):not(.Mui-disabled) .MuiOutlinedInput-notchedOutline':
              { borderColor: t.palette.text.secondary },
            '&.Mui-focused:not(.Mui-error)': {
              boxShadow: `0 0 0 4px ${alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.28 : 0.16)}`,
            },
            '&.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline': {
              borderColor: t.palette.primary.main,
              borderWidth: 2,
            },
          }),
        },
      },
      // Switch + label rows (e.g. "Infinite scroll"): the whole label is the tap target.
      MuiFormControlLabel: {
        styleOverrides: { root: { [COARSE_POINTER]: { minHeight: TOUCH_TARGET } } },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: ({ theme: t }) => ({
            '&.Mui-focused:not(.Mui-error)': { color: t.palette.text.primary },
          }),
        },
      },
      MuiToggleButton: {
        // Selected segment (e.g. Today / This week) uses the brand red on a faint tint.
        defaultProps: { color: 'primary' },
        styleOverrides: {
          root: ({ theme: t }) => ({
            [COARSE_POINTER]: { minHeight: TOUCH_TARGET },
            '&.Mui-selected': {
              fontWeight: 700,
              // Selected tint would drop plain red below 4.5:1, so light mode uses the
              // deeper shade (6.96:1); dark mode's stronger tint uses the lighter shade.
              color: t.palette.mode === 'light' ? t.palette.primary.dark : t.palette.primary.light,
            },
          }),
        },
      },
    },
  });

  return responsiveFontSizes(theme);
}
