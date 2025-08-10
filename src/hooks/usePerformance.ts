/**
 * Performance Optimization Hooks
 * Provides debouncing, throttling, memoization, and performance utilities
 * For MedQuiz Pro - Medical Education Platform
 */

import { useCallback, useEffect, useRef, useMemo, useState } from 'react';

/**
 * Debounce hook - delays execution until after delay has passed since last call
 */
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps?: React.DependencyList
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay, ...(deps || [])]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

/**
 * Debounced value hook - debounces value changes
 */
export const useDebouncedValue = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Throttle hook - limits execution to once per delay period
 */
export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps?: React.DependencyList
): T => {
  const lastCallTime = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTime.current;

      if (timeSinceLastCall >= delay) {
        lastCallTime.current = now;
        callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          lastCallTime.current = Date.now();
          callback(...args);
        }, delay - timeSinceLastCall);
      }
    },
    [callback, delay, ...(deps || [])]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
};

/**
 * Memoized selector hook - memoizes expensive computations
 */
export const useMemoizedSelector = <T, R>(
  selector: (data: T) => R,
  data: T,
  deps?: React.DependencyList
): R => {
  return useMemo(() => selector(data), [data, ...(deps || [])]);
};

/**
 * Stable callback hook - prevents unnecessary re-renders
 */
export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T
): T => {
  const callbackRef = useRef<T>(callback);

  // Update ref with latest callback
  useEffect(() => {
    callbackRef.current = callback;
  });

  // Return stable callback that calls the latest version
  return useCallback(
    ((...args) => callbackRef.current(...args)) as T,
    []
  );
};

/**
 * Previous value hook - tracks previous value
 */
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
};

/**
 * Deep comparison effect hook - only runs when values deeply change
 */
export const useDeepEffect = (
  effect: React.EffectCallback,
  deps: React.DependencyList
) => {
  const previousDeps = usePrevious(deps);
  const hasChanged = useMemo(() => {
    if (!previousDeps) return true;
    
    return deps.some((dep, index) => {
      const prevDep = previousDeps[index];
      return JSON.stringify(dep) !== JSON.stringify(prevDep);
    });
  }, [deps, previousDeps]);

  useEffect(() => {
    if (hasChanged) {
      return effect();
    }
  }, [hasChanged, effect]);
};

/**
 * Lazy initialization hook - defers expensive initialization
 */
export const useLazyInitialization = <T>(
  initializer: () => T,
  deps: React.DependencyList = []
): T => {
  const [value] = useState<T>(initializer);
  
  return useMemo(() => value, deps);
};

/**
 * Intersection observer hook for lazy loading
 */
export const useIntersectionObserver = (
  options?: IntersectionObserverInit
): [React.RefCallback<Element>, boolean] => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [element, setElement] = useState<Element | null>(null);

  const ref = useCallback((node: Element | null) => {
    setElement(node);
  }, []);

  useEffect(() => {
    if (!element || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      options
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [element, options]);

  return [ref, isIntersecting];
};

/**
 * Virtual scrolling hook for large lists
 */
export const useVirtualScrolling = <T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5
}: {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight),
      items.length
    );

    return {
      start: Math.max(0, start - overscan),
      end: Math.min(items.length, end + overscan)
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index,
      top: (visibleRange.start + index) * itemHeight
    }));
  }, [items, visibleRange, itemHeight]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    handleScroll
  };
};

/**
 * Performance monitoring hook
 */
export const usePerformanceMonitor = (name: string) => {
  const startTimeRef = useRef<number>();

  useEffect(() => {
    startTimeRef.current = performance.now();

    return () => {
      if (startTimeRef.current) {
        const duration = performance.now() - startTimeRef.current;
        console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);

        // In production, send to analytics
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'timing_complete', {
            name: name,
            value: Math.round(duration)
          });
        }
      }
    };
  }, [name]);

  const mark = useCallback((label: string) => {
    if (startTimeRef.current) {
      const duration = performance.now() - startTimeRef.current;
      console.log(`[Performance] ${name} - ${label}: ${duration.toFixed(2)}ms`);
    }
  }, [name]);

  return { mark };
};

/**
 * Optimized form input hook with debouncing and validation
 */
export const useOptimizedInput = <T>(
  initialValue: T,
  validator?: (value: T) => string | null,
  debounceMs: number = 300
) => {
  const [value, setValue] = useState<T>(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const debouncedValidator = useDebouncedCallback(
    async (newValue: T) => {
      if (!validator) return;

      setIsValidating(true);
      try {
        const errorMessage = await validator(newValue);
        setError(errorMessage);
      } catch (err) {
        setError('Validation failed');
      } finally {
        setIsValidating(false);
      }
    },
    debounceMs
  );

  const handleChange = useCallback((newValue: T) => {
    setValue(newValue);
    if (validator) {
      debouncedValidator(newValue);
    }
  }, [validator, debouncedValidator]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
    setIsValidating(false);
  }, [initialValue]);

  return {
    value,
    error,
    isValidating,
    onChange: handleChange,
    reset,
    isValid: !error && !isValidating
  };
};

/**
 * Profile-specific performance hooks
 */
export const useProfilePerformance = () => {
  // Debounced profile save
  const debouncedSave = useDebouncedCallback(
    async (profileData: any) => {
      // This would be called from the profile component
      console.log('Saving profile data:', profileData);
    },
    1000 // Wait 1 second after user stops typing
  );

  // Memoized specialty options
  const memoizedSpecialties = useMemo(() => [
    'Internal Medicine',
    'Surgery',
    'Pediatrics',
    'Obstetrics/Gynecology',
    'Psychiatry',
    'Emergency Medicine',
    'Family Medicine',
    'Radiology',
    'Anesthesiology',
    'Pathology',
    'Other'
  ], []);

  // Throttled scroll handler for specialty selection
  const throttledScrollHandler = useThrottledCallback(
    (event: React.UIEvent) => {
      // Handle scroll events without overwhelming performance
      console.log('Scroll position:', event.currentTarget.scrollTop);
    },
    100 // Limit to 10 times per second
  );

  // Performance monitoring for profile operations
  const profileMonitor = usePerformanceMonitor('Profile Component');

  return {
    debouncedSave,
    memoizedSpecialties,
    throttledScrollHandler,
    profileMonitor
  };
};

/**
 * Image lazy loading hook
 */
export const useLazyImage = (src: string, placeholder?: string) => {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [imageRef, isIntersecting] = useIntersectionObserver({
    threshold: 0.1
  });

  useEffect(() => {
    if (isIntersecting && src) {
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
      };
      img.onerror = () => {
        setImageSrc(placeholder || '');
      };
      img.src = src;
    }
  }, [isIntersecting, src, placeholder]);

  return [imageRef, imageSrc] as const;
};

/**
 * Memory usage monitoring hook
 */
export const useMemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = useState<any>(null);

  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        setMemoryInfo((performance as any).memory);
      }
    };

    checkMemory();
    const interval = setInterval(checkMemory, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
};

/**
 * Component update frequency monitoring
 */
export const useRenderCounter = (componentName: string) => {
  const renderCount = useRef(0);

  renderCount.current += 1;

  useEffect(() => {
    console.log(`[Render] ${componentName} rendered ${renderCount.current} times`);
  });

  return renderCount.current;
};