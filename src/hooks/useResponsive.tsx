/**
 * Responsive Design Hooks and Utilities
 * Provides breakpoint detection and responsive behavior
 * For MedQuiz Pro - Medical Education Platform
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Breakpoint definitions matching Tailwind CSS
 */
export const BREAKPOINTS = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Hook to get current screen size and breakpoint information
 */
export const useBreakpoint = () => {
  const [screenSize, setScreenSize] = useState(() => {
    if (typeof window !== 'undefined') {
      return {
        width: window.innerWidth,
        height: window.innerHeight
      };
    }
    return { width: 0, height: 0 };
  });

  const updateScreenSize = useCallback(() => {
    setScreenSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, [updateScreenSize]);

  // Check if current screen is at or above a breakpoint
  const isAbove = useCallback((breakpoint: Breakpoint): boolean => {
    return screenSize.width >= BREAKPOINTS[breakpoint];
  }, [screenSize.width]);

  // Check if current screen is below a breakpoint
  const isBelow = useCallback((breakpoint: Breakpoint): boolean => {
    return screenSize.width < BREAKPOINTS[breakpoint];
  }, [screenSize.width]);

  return {
    screenSize,
    isAbove,
    isBelow,
    isMobile: isBelow('md'),
    isTablet: screenSize.width >= BREAKPOINTS.md && screenSize.width < BREAKPOINTS.lg,
    isDesktop: isAbove('lg'),
    isSmallScreen: isBelow('sm'),
    isLargeScreen: isAbove('xl')
  };
};

/**
 * Profile-specific responsive configurations
 */
export const profileResponsiveConfig = {
  avatarGrid: { xs: 4, sm: 6, md: 8, lg: 8 },
  statsGrid: { xs: 1, md: 3 },
  specialtiesGrid: { xs: 1, sm: 2, md: 3, lg: 3 },
  achievementGrid: { xs: 2, md: 4 }
};

/**
 * Hook specifically for profile responsive behavior
 */
export const useProfileResponsive = () => {
  const breakpoint = useBreakpoint();

  return {
    ...breakpoint,
    shouldShowSideBySide: breakpoint.isAbove('md'),
    shouldStackVertically: breakpoint.isBelow('md'),
    shouldUseCompactLayout: breakpoint.isBelow('sm')
  };
};