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
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-40">
      <div className="flex justify-around items-center h-16">
        {mobileNavItems.map((item) => (
          <Link
            key={item.id}
            to={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full",
              "text-muted-foreground hover:text-foreground transition-colors",
              "tap-highlight-transparent",
              isActive(item.href) && "text-primary"
            )}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};