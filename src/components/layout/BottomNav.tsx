import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Brain, TrendingUp, Trophy, User } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BottomNavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
}

const mobileNavItems: BottomNavItem[] = [
  { id: 'home', label: 'Home', icon: Home, href: '/dashboard' },
  { id: 'quiz', label: 'Quiz', icon: Brain, href: '/quiz' },
  { id: 'progress', label: 'Progress', icon: TrendingUp, href: '/progress' },
  { id: 'leaderboard', label: 'Rank', icon: Trophy, href: '/leaderboard' },
  { id: 'profile', label: 'Profile', icon: User, href: '/profile' },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();
  
  const isActive = (href: string) => {
    if (!location.pathname) return false;
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t z-40 shadow-custom-lg">
      <div className="flex justify-around items-center h-20 px-2">
        {mobileNavItems.map((item) => (
          <Link
            key={item.id}
            to={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full min-h-[48px] rounded-lg transition-all duration-200",
              "text-muted-foreground hover:text-foreground",
              "tap-highlight-transparent active:scale-95",
              isActive(item.href) && "text-primary bg-primary/10"
            )}
          >
            <item.icon className={cn(
              "h-6 w-6 mb-1 transition-transform duration-200",
              isActive(item.href) && "scale-110"
            )} />
            <span className={cn(
              "text-xs font-medium",
              isActive(item.href) && "font-semibold"
            )}>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};