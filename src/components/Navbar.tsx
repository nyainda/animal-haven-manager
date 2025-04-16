
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Moon, Sun, Menu, X, ChevronRight, LayoutDashboard, Home, Settings, LogOut, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  
  // Mock auth state - in a real app, this would come from your auth context
  const isAuthenticated = location.pathname.includes('/dashboard') || 
                         location.pathname.includes('/animals') || 
                         location.pathname.includes('/profile');
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);

  }, [location.pathname]);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Determine if we're on the dashboard or other authenticated pages
  const isDashboardPage = location.pathname.startsWith('/dashboard') || 
                         location.pathname.startsWith('/animals') ||
                         location.pathname.startsWith('/profile');

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full py-3",
        scrolled 
          ? "bg-card/95 backdrop-blur-lg shadow-sm border-b border-border/50" 
          : isDashboardPage 
            ? "bg-card/80 backdrop-blur-md" 
            : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-4">
            <Link 
              to={isAuthenticated ? "/dashboard" : "/"} 
              className="flex items-center space-x-2"
            >
              <span className="text-xl font-serif font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
               Agro-insight
              </span>
            </Link>
            
            {isDashboardPage && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="hidden md:flex items-center space-x-2 font-serif hover:bg-primary/10"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
            )}
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <NavLink href="/" active={location.pathname === "/"}>Home</NavLink>
                <NavLink href="/#features" active={false}>Features</NavLink>
                <NavLink href="/login" active={location.pathname === "/login"}>Login</NavLink>
                <NavLink href="/register" active={location.pathname === "/register"}>Register</NavLink>
              </>
            ) : (
              <>
                {!location.pathname.startsWith('/dashboard') && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/dashboard')}
                    className="font-serif hover:bg-primary/10"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="font-serif hover:bg-primary/10"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Account
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 font-serif">
                    <DropdownMenuLabel className="font-serif">My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/dashboard')} className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/logout')} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-3">
            {isDashboardPage && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="h-8 w-8"
                aria-label="Dashboard"
              >
                <LayoutDashboard className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8 rounded-full"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              className="h-8 w-8 text-foreground"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Improved mobile navigation with better animation and styling */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden fixed inset-x-0 top-20 z-50 mx-4 overflow-hidden rounded-xl"
            >
              <div className="bg-card/95 backdrop-blur-lg border border-border/50 shadow-lg rounded-xl overflow-hidden">
                <div className="py-4 px-2">
                  {!isAuthenticated ? (
                    <>
                      <MobileNavLink href="/" active={location.pathname === "/"}>Home</MobileNavLink>
                      <MobileNavLink href="/#features" active={false}>Features</MobileNavLink>
                      <MobileNavLink href="/login" active={location.pathname === "/login"}>Login</MobileNavLink>
                      <MobileNavLink href="/register" active={location.pathname === "/register"}>Register</MobileNavLink>
                    </>
                  ) : (
                    <>
                      <MobileNavLink href="/dashboard" active={location.pathname === "/dashboard"}>Dashboard</MobileNavLink>
                      <MobileNavLink href="/animals" active={location.pathname.startsWith("/animals")}>Animals</MobileNavLink>
                      <MobileNavLink href="/profile" active={location.pathname === "/profile"}>Profile</MobileNavLink>
                      <MobileNavLink href="/settings" active={location.pathname === "/settings"}>Settings</MobileNavLink>
                      <MobileNavLink href="/logout" active={false}>Logout</MobileNavLink>
                    </>
                  )}
                </div>              
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

// Desktop NavLink component
const NavLink: React.FC<{ href: string; active: boolean; children: React.ReactNode }> = ({ 
  href, active, children 
}) => {
  const navigate = useNavigate();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(href);
  };
  
  return (
    <a 
      href={href}
      onClick={handleClick}
      className={cn(
        "font-serif text-base font-medium transition-colors rounded-md px-3 py-1.5",
        active 
          ? "text-primary bg-primary/10" 
          : "text-foreground/80 hover:text-foreground hover:bg-muted"
      )}
    >
      {children}
    </a>
  );
};

// Improved Mobile NavLink component with better styling and animations
const MobileNavLink: React.FC<{ href: string; active: boolean; children: React.ReactNode }> = ({ 
  href, active, children 
}) => {
  const navigate = useNavigate();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(href);
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <a 
        href={href}
        onClick={handleClick}
        className={cn(
          "flex items-center justify-between py-3 px-4 my-1 rounded-lg text-base font-serif transition-all",
          active
            ? "bg-primary/10 text-primary"
            : "text-foreground/80 hover:text-foreground hover:bg-muted"
        )}
      >
        <span>{children}</span>
        <ChevronRight className="h-4 w-4 opacity-70" />
      </a>


    </motion.div>
  );
};

export default Navbar;