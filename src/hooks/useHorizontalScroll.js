import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Behaviour for a horizontally scrolling row (Trending, Top cast, ...).
 * @param {unknown} resetKey  When this changes (e.g. a new list), scroll back to the start.
 */
export default function useHorizontalScroll(resetKey) {
  const ref = useRef(null);
  const [edges, setEdges] = useState({ atStart: true, atEnd: false });

  const updateEdges = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const atStart = el.scrollLeft <= 4;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    // Avoid a re-render on every scroll frame when nothing changed.
    setEdges((prev) =>
      prev.atStart === atStart && prev.atEnd === atEnd ? prev : { atStart, atEnd },
    );
  }, []);

  useEffect(() => {
    if (ref.current) ref.current.scrollLeft = 0;
    updateEdges();
  }, [resetKey, updateEdges]);

  // Re-check on resize: a row that fits on a wide screen may overflow on a narrow one.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(updateEdges);
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateEdges]);

  const scrollByPage = useCallback((direction) => {
    const el = ref.current;
    if (!el) return;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({
      left: direction * el.clientWidth * 0.9,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }, []);

  const scrollerSx = {
    display: 'flex',
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    overscrollBehaviorX: 'contain',
    // The native bar is hidden: arrows (desktop) and swipe/trackpad scroll the row.
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
    // Fade the trailing edge while more items are off-screen, as a "scroll me" cue.
    maskImage: edges.atEnd ? 'none' : 'linear-gradient(90deg, #000 calc(100% - 64px), transparent)',
  };

  return { ref, edges, scrollByPage, onScroll: updateEdges, scrollerSx };
}
