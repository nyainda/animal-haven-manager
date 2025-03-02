
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

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
        scrolled ? "bg-card/80 backdrop-blur-lg shadow-sm" : "bg-transparent"
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
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-muted"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-muted"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            
            <button
              className="flex items-center"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              <div className="space-y-2">
                <span className={cn(
                  "block w-8 h-0.5 bg-foreground transition-all duration-300",
                  isMenuOpen && "translate-y-2.5 rotate-45"
                )}></span>
                <span className={cn(
                  "block w-8 h-0.5 bg-foreground transition-all duration-300",
                  isMenuOpen && "opacity-0"
                )}></span>
                <span className={cn(
                  "block w-8 h-0.5 bg-foreground transition-all duration-300",
                  isMenuOpen && "-translate-y-2.5 -rotate-45"
                )}></span>
              </div>
            </button>
          </div>
        </div>
        
        {/* Mobile navigation */}
        <div className={cn(
          "md:hidden transition-all duration-300 ease-in-out overflow-hidden",
          isMenuOpen ? "max-h-60 opacity-100 pt-4" : "max-h-0 opacity-0"
        )}>
          <div className="flex flex-col space-y-4 pb-4">
            <MobileNavLink href="/" active={location.pathname === "/"}>Home</MobileNavLink>
            <MobileNavLink href="/#features" active={false}>Features</MobileNavLink>
            <MobileNavLink href="/login" active={location.pathname === "/login"}>Login</MobileNavLink>
            <MobileNavLink href="/register" active={location.pathname === "/register"}>Register</MobileNavLink>
          </div>
        </div>
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

// Mobile NavLink component
const MobileNavLink: React.FC<{ href: string; active: boolean; children: React.ReactNode }> = ({ 
  href, active, children 
}) => {
  return (
    <Link 
      to={href}
      className={cn(
        "block py-2 text-base font-medium transition-colors",
        active ? "text-primary" : "text-foreground/80 hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
};

export default Navbar;
