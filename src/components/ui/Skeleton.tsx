/**
 * Skeleton Loading Components
 * Provides smooth loading states for better UX
 * For MedQuiz Pro - Medical Education Platform
 */

import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Base Skeleton component
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className, children }) => (
  <div
    className={cn(
      'animate-pulse bg-gray-200 rounded-md',
      className
    )}
    role="status"
    aria-label="Loading..."
  >
    {children}
  </div>
);

/**
 * Skeleton Text component
 */
export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
}> = ({ lines = 1, className }) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        className={cn(
          'h-4',
          index === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
        )}
      />
    ))}
  </div>
);

/**
 * Skeleton Avatar component
 */
export const SkeletonAvatar: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-24 h-24'
  };

  return (
    <Skeleton
      className={cn(
        'rounded-full',
        sizeClasses[size],
        className
      )}
    />
  );
};

/**
 * Skeleton Button component
 */
export const SkeletonButton: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'h-8 w-16',
    md: 'h-10 w-20',
    lg: 'h-12 w-24'
  };

  return (
    <Skeleton
      className={cn(
        'rounded-md',
        sizeClasses[size],
        className
      )}
    />
  );
};

/**
 * Profile-specific skeleton components
 */
export const ProfileHeaderSkeleton: React.FC = () => (
  <div className="p-4 sm:p-6" role="status" aria-label="Loading profile header">
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
        {/* Avatar */}
        <SkeletonAvatar size="lg" />
        
        {/* User Info */}
        <div className="space-y-2 text-center sm:text-left">
          <Skeleton className="h-8 w-48" /> {/* Name */}
          <Skeleton className="h-4 w-40" /> {/* Email */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <Skeleton className="h-4 w-20" /> {/* Level */}
            <Skeleton className="h-4 w-24" /> {/* Points */}
          </div>
        </div>
      </div>
      
      {/* Action Button */}
      <SkeletonButton className="w-full sm:w-auto" />
    </div>
  </div>
);

/**
 * Stats Card Skeleton
 */
export const StatsCardSkeleton: React.FC = () => (
  <div className="p-4 border rounded-lg" role="status" aria-label="Loading stats">
    <div className="flex items-center justify-between mb-3">
      <Skeleton className="h-4 w-24" /> {/* Title */}
      <Skeleton className="h-6 w-6 rounded-full" /> {/* Icon */}
    </div>
    <Skeleton className="h-8 w-16 mb-1" /> {/* Value */}
    <Skeleton className="h-3 w-20 mb-2" /> {/* Subtitle */}
    <div className="space-y-1">
      <Skeleton className="h-3 w-32" /> {/* Detail 1 */}
      <Skeleton className="h-3 w-28" /> {/* Detail 2 */}
    </div>
  </div>
);

/**
 * Professional Info Section Skeleton
 */
export const ProfessionalInfoSkeleton: React.FC = () => (
  <div className="space-y-6" role="status" aria-label="Loading professional information">
    {/* Medical Level */}
    <div>
      <Skeleton className="h-4 w-24 mb-2" /> {/* Label */}
      <Skeleton className="h-12 w-full rounded-lg" /> {/* Select */}
    </div>
    
    {/* Study Goals */}
    <div>
      <Skeleton className="h-4 w-32 mb-2" /> {/* Label */}
      <Skeleton className="h-12 w-full rounded-lg" /> {/* Select */}
    </div>
    
    {/* Specialties */}
    <div>
      <Skeleton className="h-4 w-40 mb-3" /> {/* Label */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-12 rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

/**
 * Achievement Grid Skeleton
 */
export const AchievementGridSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="status" aria-label="Loading achievements">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="text-center p-4 rounded-lg border">
        <Skeleton className="h-8 w-8 rounded-full mx-auto mb-2" /> {/* Icon */}
        <Skeleton className="h-4 w-16 mx-auto mb-1" /> {/* Title */}
        <Skeleton className="h-3 w-12 mx-auto" /> {/* Subtitle */}
      </div>
    ))}
  </div>
);

/**
 * Avatar Picker Skeleton
 */
export const AvatarPickerSkeleton: React.FC = () => (
  <div className="mt-6 p-4 bg-gray-50 rounded-lg" role="status" aria-label="Loading avatar options">
    <Skeleton className="h-4 w-32 mb-3" /> {/* Label */}
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="p-2 border rounded-lg">
          <SkeletonAvatar size="md" className="w-full h-full" />
        </div>
      ))}
    </div>
  </div>
);

/**
 * Complete Profile Skeleton
 */
export const ProfileSkeleton: React.FC = () => (
  <div className="space-y-6" role="status" aria-label="Loading profile">
    {/* Profile Header */}
    <div className="border rounded-lg">
      <ProfileHeaderSkeleton />
    </div>
    
    {/* Stats Grid */}
    <div className="grid gap-4 md:grid-cols-3">
      <StatsCardSkeleton />
      <StatsCardSkeleton />
      <StatsCardSkeleton />
    </div>
    
    {/* Professional Information */}
    <div className="border rounded-lg p-6">
      <Skeleton className="h-6 w-48 mb-6" /> {/* Section Title */}
      <ProfessionalInfoSkeleton />
    </div>
    
    {/* Achievements */}
    <div className="border rounded-lg p-6">
      <Skeleton className="h-6 w-32 mb-6" /> {/* Section Title */}
      <AchievementGridSkeleton />
    </div>
  </div>
);

/**
 * Form Field Skeleton
 */
export const FormFieldSkeleton: React.FC<{
  hasLabel?: boolean;
  hasError?: boolean;
  fieldType?: 'input' | 'select' | 'textarea';
}> = ({ hasLabel = true, hasError = false, fieldType = 'input' }) => {
  const heightClasses = {
    input: 'h-10',
    select: 'h-10',
    textarea: 'h-24'
  };

  return (
    <div className="space-y-2">
      {hasLabel && <Skeleton className="h-4 w-20" />}
      <Skeleton className={cn('w-full rounded-md', heightClasses[fieldType])} />
      {hasError && <Skeleton className="h-4 w-32" />}
    </div>
  );
};

/**
 * List Skeleton
 */
export const ListSkeleton: React.FC<{
  items?: number;
  showAvatar?: boolean;
}> = ({ items = 5, showAvatar = false }) => (
  <div className="space-y-3" role="status" aria-label="Loading list">
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
        {showAvatar && <SkeletonAvatar size="sm" />}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
    ))}
  </div>
);

/**
 * Pulse animation wrapper for custom skeletons
 */
export const PulseWrapper: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={cn('animate-pulse', className)}>
    {children}
  </div>
);

/**
 * Shimmer effect component
 */
export const Shimmer: React.FC<{
  width?: string | number;
  height?: string | number;
  className?: string;
}> = ({ width = '100%', height = '1rem', className }) => (
  <div
    className={cn(
      'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse',
      'bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]',
      className
    )}
    style={{ width, height }}
  />
);

/**
 * Custom hook for skeleton loading state
 */
export const useSkeletonLoading = (isLoading: boolean, delay: number = 200) => {
  const [showSkeleton, setShowSkeleton] = React.useState(false);

  React.useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowSkeleton(true);
      }, delay);

      return () => clearTimeout(timer);
    } else {
      setShowSkeleton(false);
    }
  }, [isLoading, delay]);

  return showSkeleton;
};