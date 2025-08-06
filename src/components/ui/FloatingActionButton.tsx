import React, { useState } from 'react';
import { Play, Clock, Settings, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FABAction {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  color?: string;
}

interface FloatingActionButtonProps {
  actions: FABAction[];
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  actions,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn('fixed bottom-6 right-6 z-50', className)}>
      {/* Action Items */}
      <div className={cn(
        'flex flex-col-reverse gap-3 mb-3 transition-all duration-300',
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      )}>
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={cn(
              'flex items-center gap-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl',
              'px-4 py-3 transition-all duration-200 hover:scale-105',
              'border border-gray-200 dark:border-gray-700',
              action.color || 'hover:bg-gray-50 dark:hover:bg-gray-700'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <action.icon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
          'rounded-full shadow-lg hover:shadow-xl transition-all duration-200',
          'flex items-center justify-center text-white',
          'hover:scale-105 active:scale-95',
          isOpen && 'rotate-45'
        )}
      >
        <Plus className={cn('h-6 w-6 transition-transform duration-200')} />
      </button>
    </div>
  );
};