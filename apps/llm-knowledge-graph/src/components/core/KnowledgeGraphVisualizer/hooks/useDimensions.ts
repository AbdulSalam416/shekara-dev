import { useState, useEffect, type RefObject } from 'react';

/**
 * Tracks the width and height of a DOM element via ResizeObserver.
 * Returns { width: 0, height: 0 } until the element mounts.
 */
export function useDimensions(ref: RefObject<HTMLElement | null>) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Capture initial size immediately
    setDimensions({ width: el.clientWidth, height: el.clientHeight });

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return dimensions;
}
