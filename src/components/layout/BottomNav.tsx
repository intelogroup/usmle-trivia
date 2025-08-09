import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface BottomNavItem {
  id: string;
  label: string;
  icon: string;
  activeIcon: string;
  href: string;
}

const mobileNavItems: BottomNavItem[] = [
  { id: 'home', label: 'Home', icon: '🏠', activeIcon: '🏠', href: '/dashboard' },
  { id: 'quiz', label: 'Quiz', icon: '📝', activeIcon: '📝', href: '/quiz' },
  { id: 'progress', label: 'Progress', icon: '📊', activeIcon: '📊', href: '/progress' },
  { id: 'leaderboard', label: 'Rank', icon: '🏆', activeIcon: '🏆', href: '/leaderboard' },
  { id: 'profile', label: 'Profile', icon: '👤', activeIcon: '👤', href: '/profile' },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();
  
  const isActive = (href: string) => {
    if (!location.pathname) return false;
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-pb">
      <div className="flex justify-around items-center h-16 px-1">
        {mobileNavItems.map((item) => (
          <Link
            key={item.id}
            to={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full py-1 px-2 rounded-lg transition-all duration-200",
              "tap-highlight-transparent active:scale-95",
              isActive(item.href) 
                ? "text-blue-600" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <div className={cn(
              "text-2xl mb-0.5 transition-all duration-200",
              isActive(item.href) && "scale-110"
            )}>
              {isActive(item.href) ? item.activeIcon : item.icon}
            </div>
            <span className={cn(
              "text-xs font-medium leading-tight",
              isActive(item.href) && "text-blue-600 font-semibold"
            )}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
};