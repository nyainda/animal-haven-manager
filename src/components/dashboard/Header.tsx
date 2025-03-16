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

  return (
    <header className="bg-card shadow-sm p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold truncate">Welcome, {user?.name || 'User'}!</h1>
      </div>
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <div className="relative">
          <Button variant="ghost" size="icon" onClick={() => setActiveTab('activity')}>
            <Bell className="h-5 w-5" />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute top-0 right-0 bg-primary text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;