
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Moon, Sun, Menu, X, ChevronRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  
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
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full py-4",
        scrolled ? "bg-card/90 backdrop-blur-lg shadow-sm" : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 animate-float">
            <span className="text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Animal Manager
            </span>
          </Link>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink href="/" active={location.pathname === "/"}>Home</NavLink>
            <NavLink href="/#features" active={false}>Features</NavLink>
            <NavLink href="/login" active={location.pathname === "/login"}>Login</NavLink>
            <NavLink href="/register" active={location.pathname === "/register"}>Register</NavLink>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              className="text-foreground"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Mobile navigation - improved with animation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-card/90 backdrop-blur-lg rounded-lg mt-4 shadow-lg overflow-hidden"
            >
              <div className="py-3 px-4">
                <MobileNavLink href="/" active={location.pathname === "/"}>Home</MobileNavLink>
                <MobileNavLink href="/#features" active={false}>Features</MobileNavLink>
                <MobileNavLink href="/login" active={location.pathname === "/login"}>Login</MobileNavLink>
                <MobileNavLink href="/register" active={location.pathname === "/register"}>Register</MobileNavLink>
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
  return (
    <Link 
      to={href}
      className={cn(
        "link-underline text-base font-medium transition-colors",
        active ? "text-primary" : "text-foreground/80 hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
};

// Mobile NavLink component - improved with better styling
const MobileNavLink: React.FC<{ href: string; active: boolean; children: React.ReactNode }> = ({ 
  href, active, children 
}) => {
  return (
    <Link 
      to={href}
      className={cn(
        "flex items-center justify-between py-3 px-2 my-1 rounded-md text-base font-medium transition-all",
        active 
          ? "bg-primary/10 text-primary" 
          : "text-foreground/80 hover:text-foreground hover:bg-muted"
      )}
    >
      <span>{children}</span>
      <ChevronRight className="h-4 w-4 opacity-70" />
    </Link>
  );
};

export default Navbar;
