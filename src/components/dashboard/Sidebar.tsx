import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Home, Dog, DollarSign, Calendar, Activity, Settings, User, LogOut, X } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  handleLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen, 
  handleLogout 
}) => {
  const navigate = useNavigate();

  const menuItems = [
    { tab: 'overview', icon: Home, label: 'Dashboard' },
    { path: '/animals', icon: Dog, label: 'Animals' },
   // { path: '/activity', icon: DollarSign, label: 'Finance' },
    { tab: 'calendar', icon: Calendar, label: 'Calendar' },
    { tab: 'activity', icon: Activity, label: 'Activity' },
    { tab: 'settings', icon: Settings, label: 'Settings' },
    { path: '/profile', icon: User, label: 'Profile' },
    { onClick: handleLogout, icon: LogOut, label: 'Logout' },
  ];

  return (
    <>
      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative bg-card w-64 h-full shadow-lg">
            <div className="p-4 flex items-center justify-between border-b">
              <h2 className="text-xl font-serif text-primary">Animal Haven</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="mt-4">
              {menuItems.map(item => (
                <div
                  key={item.label}
                  className={cn(
                    'px-4 py-3 hover:bg-muted cursor-pointer mb-1',
                    activeTab === item.tab && 'bg-muted border-l-2 border-primary'
                  )}
                  onClick={() => {
                    item.path ? navigate(item.path) : item.tab ? setActiveTab(item.tab) : item.onClick?.();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <div className="flex items-center">
                    <item.icon className={cn('h-5 w-5', activeTab === item.tab ? 'text-primary' : 'text-muted-foreground')} />
                    <span className={cn('ml-3 font-serif text-foreground', activeTab === item.tab && 'text-primary font-medium')}>
                      {item.label}
                    </span>
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-card shadow-md hidden md:block">
        <div className="p-5 flex items-center">
          <h2 className="text-xl font-serif text-primary">Agro-insight</h2>
        </div>
        <nav className="mt-4 flex flex-col">
          {menuItems.map(item => (
            <div
              key={item.label}
              className={cn(
                'px-4 py-3 hover:bg-muted cursor-pointer mb-1 rounded-sm',
                activeTab === item.tab && 'bg-muted border-l-2 border-primary'
              )}
              onClick={() => item.path ? navigate(item.path) : item.tab ? setActiveTab(item.tab) : item.onClick?.()}
            >
              <div className="flex items-center">
                <item.icon 
                  className={cn(
                    'h-5 w-5 flex-shrink-0', 
                    activeTab === item.tab ? 'text-primary' : 'text-muted-foreground'
                  )} 
                />
                <span className={cn(
                  'ml-3 font-serif text-foreground truncate',
                  activeTab === item.tab && 'text-primary font-medium'
                )}>
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;