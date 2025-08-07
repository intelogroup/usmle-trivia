import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { cn } from '../../lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  compact?: boolean;
}

const colorVariants = {
  blue: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20',
  green: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20',
  purple: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20',
  orange: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20',
  red: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20',
};

const cardVariants = {
  blue: 'hover:border-blue-200 hover:bg-blue-50/50 dark:hover:border-blue-800 dark:hover:bg-blue-950/50',
  green: 'hover:border-green-200 hover:bg-green-50/50 dark:hover:border-green-800 dark:hover:bg-green-950/50',
  purple: 'hover:border-purple-200 hover:bg-purple-50/50 dark:hover:border-purple-800 dark:hover:bg-purple-950/50',
  orange: 'hover:border-orange-200 hover:bg-orange-50/50 dark:hover:border-orange-800 dark:hover:bg-orange-950/50',
  red: 'hover:border-red-200 hover:bg-red-50/50 dark:hover:border-red-800 dark:hover:bg-red-950/50',
};

export const StatsCard = memo<StatsCardProps>(({
  title,
  value,
  icon: Icon,
  trend,
  color = 'blue',
  compact = false,
}) => {
  if (compact) {
    return (
      <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
              <p className="text-xl font-semibold text-slate-900 mt-1">
                {typeof value === 'number' ? (
                  <AnimatedCounter value={value} duration={800} />
                ) : (
                  value
                )}
              </p>
            </div>
            <div className={cn(
              'p-2 rounded-lg', 
              colorVariants[color]
            )}>
              <Icon className="h-4 w-4" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      'transition-all duration-300 cursor-pointer group animate-in shadow-custom hover:shadow-custom-md hover:-translate-y-1 hover:scale-[1.02]', 
      cardVariants[color]
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-200">
          {title}
        </CardTitle>
        <div className={cn(
          'p-2.5 rounded-xl transition-all duration-200 group-hover:scale-110 group-hover:rotate-3', 
          colorVariants[color]
        )}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-1 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-200">
          {typeof value === 'number' ? (
            <AnimatedCounter value={value} duration={1200} />
          ) : (
            value
          )}
        </div>
        {trend && (
          <p className="text-sm text-muted-foreground font-medium group-hover:text-foreground/80 transition-colors duration-200">
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
});

StatsCard.displayName = 'StatsCard';