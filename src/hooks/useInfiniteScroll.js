import { useEffect, useRef } from 'react';

/**
 * Calls `onLoadMore` when a sentinel scrolls into view (IntersectionObserver,
 * cheaper than listening to scroll events).
 * @param {string} [rootMargin]  Starts loading a bit before the sentinel is reached.
 */
export default function useInfiniteScroll({ onLoadMore, enabled, rootMargin = '400px' }) {
  const sentinelRef = useRef(null);
  // Keep the latest callback in a ref so the observer doesn't need re-creating on every render.
  const callbackRef = useRef(onLoadMore);
  callbackRef.current = onLoadMore;

  useEffect(() => {
    const node = sentinelRef.current;
    if (!enabled || !node || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) callbackRef.current();
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, rootMargin]);

  return sentinelRef;
}
