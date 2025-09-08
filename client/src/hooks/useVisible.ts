import { RefObject, useState, useEffect } from 'react';

/**
 * Hook to track element visibility using IntersectionObserver.
 * @param ref - Ref of the element to observe.
 * @param rootMargin - Margin around the root. Defaults to '200px'.
 * @returns Whether the element is currently visible.
 */
export function useVisible<T extends Element>(
  ref: RefObject<T>,
  rootMargin: string = '200px'
): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return isVisible;
}
