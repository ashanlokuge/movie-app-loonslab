import { Component } from 'react';
import { Box, Button, Typography } from '@mui/material';

/** Catches render-time errors below it and shows a recovery screen instead of a blank page. */
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // In production this is where you'd report to Sentry / LogRocket etc.
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          p: 3,
          textAlign: 'center',
        }}
      >
        <Box>
          <Typography variant="h5" component="h1" gutterBottom>
            Something went wrong.
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            An unexpected error occurred. Reloading the page usually fixes it.
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </Box>
      </Box>
    );
  }
}
