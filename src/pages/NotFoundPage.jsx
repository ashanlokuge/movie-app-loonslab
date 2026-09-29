import { Link as RouterLink } from 'react-router-dom';
import { Button, Container } from '@mui/material';
import ExploreOffOutlinedIcon from '@mui/icons-material/ExploreOffOutlined';
import EmptyState from '../components/common/EmptyState';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <Container maxWidth="sm">
      <EmptyState
        icon={ExploreOffOutlinedIcon}
        title="Page not found"
        description="The page you're looking for doesn't exist or has moved."
        action={
          <Button component={RouterLink} to="/" variant="contained">
            Go home
          </Button>
        }
      />
    </Container>
  );
}
