import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Menu, Sun, Moon, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  user: { name?: string } | null;
  setIsMobileMenuOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
  notifications: { read: boolean }[];
}

const Header: React.FC<HeaderProps> = ({ user, setIsMobileMenuOpen, setActiveTab, notifications }) => {
  const { theme, setTheme } = useTheme();
  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <header 
      className={cn(
        "bg-card shadow-sm p-4 flex items-center justify-between",
        "sm:px-6 lg:px-8"
      )}
    >
      {/* Left Section: Menu Button and Welcome Text */}
      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-10 w-10 text-foreground dark:text-foreground hover:bg-muted/10 dark:hover:bg-muted/20 rounded-full flex-shrink-0"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
        <h1 
          className={cn(
            "text-lg font-serif font-semibold text-foreground dark:text-foreground truncate",
            "sm:text-xl lg:text-2xl"
          )}
        >
          Welcome, {user?.name || 'User'}!
        </h1>
      </div>

      {/* Right Section: Theme Toggle and Notifications */}
      <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-foreground dark:text-foreground hover:bg-muted/10 dark:hover:bg-muted/20 rounded-full"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-foreground dark:text-foreground hover:bg-muted/10 dark:hover:bg-muted/20 rounded-full"
            onClick={() => setActiveTab('activity')}
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <span 
                className={cn(
                  "absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center",
                  "ring-2 ring-card"
                )}
              >
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;