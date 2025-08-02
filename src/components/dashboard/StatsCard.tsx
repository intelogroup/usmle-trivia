import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { cn } from '../../lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

const colorVariants = {
  blue: 'text-blue-600 bg-blue-100',
  green: 'text-green-600 bg-green-100',
  purple: 'text-purple-600 bg-purple-100',
  orange: 'text-orange-600 bg-orange-100',
  red: 'text-red-600 bg-red-100',
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  color = 'blue',
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn('p-2 rounded-md', colorVariants[color])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground">
            {trend} from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
};