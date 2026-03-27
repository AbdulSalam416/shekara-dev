import { useEffect, useRef } from 'react';

/**
 * Runs a callback on every animation frame.
 * The callback receives the current time in seconds.
 * The animation is only active when `enabled` is true.
 *
 * Uses a ref for the callback to avoid stale closures without adding it to deps.
 */
export function useAnimationFrame(
  callback: (time: number) => void,
  enabled: boolean
) {
  const callbackRef = useRef(callback);

  // Keep callback ref current on every render
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    let animationId: number;

    const animate = () => {
      const time = Date.now() / 1000;
      callbackRef.current(time);
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [enabled]);
}
