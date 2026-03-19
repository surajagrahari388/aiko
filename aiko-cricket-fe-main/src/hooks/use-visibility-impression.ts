import { useEffect, useRef } from "react";

interface UseVisibilityImpressionOptions {
  threshold?: number; // Visibility threshold (0-1, default 0.7 = 70%)
  duration?: number; // Duration in milliseconds before triggering callback (default 3000 = 3 seconds)
}

/**
 * Custom hook for tracking element visibility with a minimum threshold and duration.
 * Triggers a callback only when element is visible above the threshold for the specified duration.
 *
 * @param ref - React ref to the element to observe
 * @param callback - Function to call when visibility impression is detected
 * @param options - Configuration options (threshold and duration)
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * useVisibilityImpression(ref, () => {
 *   console.log("User is viewing this element!");
 * }, { threshold: 0.7, duration: 3000 });
 *
 * return <div ref={ref}>Content</div>;
 */
export function useVisibilityImpression(
  ref: React.RefObject<HTMLElement>,
  callback: () => void,
  options?: UseVisibilityImpressionOptions
) {
  const threshold = options?.threshold ?? 0.7;
  const duration = options?.duration ?? 3000;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio >= threshold) {
            // Start timer if not already started
            if (!timerRef.current) {
              timerRef.current = setTimeout(() => {
                if (entry.intersectionRatio >= threshold) {
                  callback();
                }
              }, duration);
            }
          } else {
            // If below threshold, clear timer
            if (timerRef.current) {
              clearTimeout(timerRef.current);
              timerRef.current = null;
            }
          }
        });
      },
      { threshold: [0, threshold, 1] }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [ref, callback, threshold, duration]);
}
