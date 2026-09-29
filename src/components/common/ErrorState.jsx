import { Alert, AlertTitle, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

/** User-friendly error banner with an optional retry action. */
export default function ErrorState({ error, title = 'Something went wrong', onRetry }) {
  return (
    <Alert
      severity="error"
      variant="outlined"
      role="alert"
      sx={{ my: 3, alignItems: 'center' }}
      action={
        onRetry && (
          <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={onRetry}>
            Retry
          </Button>
        )
      }
    >
      <AlertTitle>{title}</AlertTitle>
      {error?.message || 'Please try again.'}
    </Alert>
  );
}
