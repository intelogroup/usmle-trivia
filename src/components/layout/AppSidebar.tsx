import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Brain, 
  Zap, 
  Clock, 
  Settings, 
  TrendingUp, 
  AlertCircle, 
  Trophy, 
  BarChart3, 
  ChevronDown,
  ChevronRight,
  X,
  Stethoscope,
  User,
  LogOut
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppStore } from '../../store';
import * as Collapsible from '@radix-ui/react-collapsible';

interface SidebarNavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: number | string;
  subItems?: SidebarNavItem[];
}

const navigationItems: SidebarNavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    id: 'quiz',
    label: 'Quiz',
    icon: Brain,
    href: '#',
    subItems: [
      { id: 'quick', label: 'Quick Quiz', icon: Zap, href: '/app/quiz/quick' },
      { id: 'timed', label: 'Timed Quiz', icon: Clock, href: '/app/quiz/timed' },
      { id: 'custom', label: 'Custom Quiz', icon: Settings, href: '/app/quiz/custom' },
    ]
  },
  {
    id: 'progress',
    label: 'My Progress',
    icon: TrendingUp,
    href: '/progress',
    badge: 'NEW',
  },
  {
    id: 'wrong-questions',
    label: 'Review',
    icon: AlertCircle,
    href: '/review',
    badge: 24,
  },
  {
    id: 'leaderboard',
    label: 'Leaderboard',
    icon: Trophy,
    href: '/leaderboard',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    href: '/analytics',
  },
];

export const AppSidebar: React.FC = () => {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar, user, logout } = useAppStore();
  const [expandedItems, setExpandedItems] = useState<string[]>(['quiz']);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (href: string) => {
    if (!location.pathname) return false;
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transition-transform duration-300 lg:translate-x-0 lg:static lg:z-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-8 w-8 text-primary" />
              <div>
                <h2 className="text-lg font-semibold">MedQuiz Pro</h2>
                <p className="text-xs text-muted-foreground">Medical Excellence</p>
              </div>
            </div>
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-1 rounded-md hover:bg-accent"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {navigationItems.map((item) => (
                <li key={item.id}>
                  {item.subItems ? (
                    <Collapsible.Root
                      open={expandedItems.includes(item.id)}
                      onOpenChange={() => toggleExpanded(item.id)}
                    >
                      <Collapsible.Trigger asChild>
                        <button
                          className={cn(
                            "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            "hover:bg-accent hover:text-accent-foreground",
                            "focus:outline-none focus:ring-2 focus:ring-primary"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="flex-1 text-left">{item.label}</span>
                          {expandedItems.includes(item.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </Collapsible.Trigger>
                      <Collapsible.Content className="mt-1 ml-7 space-y-1">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.id}
                            to={subItem.href}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                              "hover:bg-accent hover:text-accent-foreground",
                              isActive(subItem.href) && "bg-primary/10 text-primary"
                            )}
                          >
                            <subItem.icon className="h-4 w-4" />
                            <span>{subItem.label}</span>
                          </Link>
                        ))}
                      </Collapsible.Content>
                    </Collapsible.Root>
                  ) : (
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        isActive(item.href) && "bg-primary/10 text-primary"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span
                          className={cn(
                            "px-2 py-0.5 text-xs rounded-full",
                            typeof item.badge === 'number'
                              ? "bg-destructive text-destructive-foreground"
                              : "bg-primary text-primary-foreground"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* User Profile */}
          <div className="border-t p-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-md hover:bg-accent"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
              >
                <User className="h-4 w-4" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};