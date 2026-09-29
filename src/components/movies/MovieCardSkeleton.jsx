import { Card, CardContent, Skeleton } from '@mui/material';

export default function MovieCardSkeleton() {
  return (
    <Card aria-hidden>
      <Skeleton variant="rectangular" sx={{ aspectRatio: '2 / 3', height: 'auto' }} />
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Skeleton width="85%" />
        <Skeleton width="35%" />
      </CardContent>
    </Card>
  );
}
