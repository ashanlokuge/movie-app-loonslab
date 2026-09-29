import { forwardRef, useEffect, useRef } from 'react';
import { Box, ButtonBase, Link, Typography } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const EMBED_ORIGIN = 'https://www.youtube-nocookie.com';

/** Preconnects to the player's origins on first hover/focus/touch; saves DNS+TLS time on click. */
let warmed = false;
function warmConnections() {
  if (warmed || typeof document === 'undefined') return;
  warmed = true;
  [EMBED_ORIGIN, 'https://www.google.com', 'https://i.ytimg.com'].forEach((href) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    link.crossOrigin = '';
    document.head.appendChild(link);
  });
}

/**
 * Inline YouTube trailer using the "facade" (click-to-load) pattern: no iframe,
 * scripts or cookies until played (~1MB saved); autoplays on click since a
 * click is a user gesture, so browsers allow it with sound.
 */
const TrailerPlayer = forwardRef(function TrailerPlayer(
  { videoKey, title, poster, playing, onPlay },
  ref,
) {
  const iframeRef = useRef(null);
  const posterSrc =
    poster || `https://i.ytimg.com/vi/${encodeURIComponent(videoKey)}/hqdefault.jpg`;

  // Move focus into the player so keyboard users can pause it right away.
  useEffect(() => {
    if (playing) iframeRef.current?.focus();
  }, [playing]);

  return (
    <Box ref={ref} sx={{ maxWidth: 960, scrollMarginTop: 96 }}>
      <Box
        sx={{
          position: 'relative',
          aspectRatio: '16 / 9',
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'common.black',
        }}
      >
        {playing ? (
          <Box
            ref={iframeRef}
            component="iframe"
            src={`${EMBED_ORIGIN}/embed/${encodeURIComponent(videoKey)}?autoplay=1&rel=0&playsinline=1`}
            title={`${title} trailer`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
          />
        ) : (
          <ButtonBase
            onClick={onPlay}
            onPointerEnter={warmConnections}
            onFocus={warmConnections}
            onTouchStart={warmConnections}
            aria-label={`Play ${title} trailer`}
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              display: 'block',
              '&:hover .play, &.Mui-focusVisible .play': {
                transform: 'translate(-50%, -50%) scale(1.08)',
              },
              '&.Mui-focusVisible': {
                outline: '3px solid',
                outlineColor: 'primary.main',
                outlineOffset: -3,
              },
            }}
          >
            <Box
              component="img"
              src={posterSrc}
              alt=""
              loading="lazy"
              decoding="async"
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {/* Scrim so the play button reads on bright frames. */}
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.55) 100%)',
              }}
            />
            <Box
              className="play"
              aria-hidden
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: 64, sm: 80 },
                height: { xs: 64, sm: 80 },
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                boxShadow: 8,
                transition: 'transform 150ms cubic-bezier(0.2, 0, 0, 1)',
                '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
              }}
            >
              <PlayArrowRoundedIcon sx={{ fontSize: { xs: 40, sm: 48 } }} />
            </Box>
            <Typography
              aria-hidden
              variant="body2"
              sx={{
                position: 'absolute',
                left: 16,
                bottom: 12,
                color: 'common.white',
                fontWeight: 600,
              }}
            >
              Play trailer
            </Typography>
          </ButtonBase>
        )}
      </Box>

      {/* Fallback: some studios disable embedding, in which case YouTube is the only option. */}
      <Link
        href={`https://www.youtube.com/watch?v=${encodeURIComponent(videoKey)}`}
        target="_blank"
        rel="noopener noreferrer"
        variant="body2"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          mt: 1,
          minHeight: 44, // standalone link, so it needs a full touch target
        }}
      >
        Watch on YouTube <OpenInNewIcon sx={{ fontSize: 16 }} />
      </Link>
    </Box>
  );
});

export default TrailerPlayer;
