import { useCallback, useMemo, useRef } from 'react';

/**
 * Custom hook for performance optimization utilities
 */
export function usePerformanceOptimization() {
  // Debounce utility for expensive operations
  const useDebounce = <T extends (...args: any[]) => any>(
    callback: T,
    delay: number
  ): T => {
    const timeoutRef = useRef<NodeJS.Timeout>();

    return useCallback(
      ((...args: Parameters<T>) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => callback(...args), delay);
      }) as T,
      [callback, delay]
    );
  };

  // Throttle utility for high-frequency events
  const useThrottle = <T extends (...args: any[]) => any>(
    callback: T,
    delay: number
  ): T => {
    const lastCall = useRef<number>(0);

    return useCallback(
      ((...args: Parameters<T>) => {
        const now = Date.now();
        if (now - lastCall.current >= delay) {
          lastCall.current = now;
          return callback(...args);
        }
      }) as T,
      [callback, delay]
    );
  };

  // Memoized expensive calculations
  const useMemoizedValue = <T>(
    factory: () => T,
    deps: React.DependencyList
  ): T => {
    return useMemo(factory, deps);
  };

  return {
    useDebounce,
    useThrottle,
    useMemoizedValue
  };
}

/**
 * Hook for optimizing list rendering performance
 */
export function useVirtualization() {
  // Virtual scrolling for large lists
  const getVisibleItems = useCallback(
    <T>(items: T[], containerHeight: number, itemHeight: number, scrollTop: number) => {
      const startIndex = Math.floor(scrollTop / itemHeight);
      const visibleCount = Math.ceil(containerHeight / itemHeight);
      const endIndex = Math.min(startIndex + visibleCount + 1, items.length);
      
      return {
        startIndex: Math.max(0, startIndex - 1),
        endIndex,
        visibleItems: items.slice(Math.max(0, startIndex - 1), endIndex),
        offsetY: Math.max(0, startIndex - 1) * itemHeight
      };
    },
    []
  );

  return {
    getVisibleItems
  };
}

/**
 * Hook for monitoring component render performance
 */
export function useRenderProfiler(componentName: string) {
  const renderStart = useRef<number>(0);
  
  // Start timing on mount/re-render
  renderStart.current = performance.now();

  return useCallback(() => {
    if (import.meta.env.DEV) {
      const renderTime = performance.now() - renderStart.current;
      if (renderTime > 16) { // Warn if render takes longer than 1 frame (16ms)
        console.warn(
          `🐌 Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`
        );
      }
    }
  }, [componentName]);
}

/**
 * Hook for intelligent prefetching
 */
export function usePrefetch() {
  const prefetchedRoutes = useRef(new Set<string>());

  const prefetchRoute = useCallback((routePath: string) => {
    if (prefetchedRoutes.current.has(routePath)) {
      return;
    }

    prefetchedRoutes.current.add(routePath);

    // Use requestIdleCallback for non-critical prefetching
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        import(/* webpackChunkName: "prefetch-[request]" */ `../pages${routePath}`)
          .catch(() => {
            // Silently ignore prefetch failures
            prefetchedRoutes.current.delete(routePath);
          });
      });
    }
  }, []);

  return { prefetchRoute };
}

/**
 * Hook for lazy loading images with intersection observer
 */
export function useLazyImage() {
  const imageRef = useRef<HTMLImageElement>(null);
  
  const loadImage = useCallback((src: string, placeholder?: string) => {
    if (!imageRef.current) return;
    
    const img = imageRef.current;
    
    // Set placeholder if provided
    if (placeholder) {
      img.src = placeholder;
    }
    
    // Use Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          img.src = src;
          img.onload = () => {
            img.classList.add('loaded');
          };
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(img);
    
    return () => observer.disconnect();
  }, []);

  return { imageRef, loadImage };
}