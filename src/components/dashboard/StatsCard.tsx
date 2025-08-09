import React, { memo } from 'react';
import { Card, CardContent } from '../ui/Card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
}

export const StatsCard = memo<StatsCardProps>(({
  title,
  value,
  icon: Icon,
}) => {
  return (
    <Card className="p-4">
      <CardContent className="p-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
          </div>
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
      </CardContent>
    </Card>
  );
});

StatsCard.displayName = 'StatsCard';