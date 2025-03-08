
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Define the user type based on API response
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

// Define the auth context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
}

// Mock user data
const MOCK_USER: User = {
  id: '1',
  name: 'Demo User',
  email: 'demo@example.com',
  avatar: null
};

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the auth provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if user is authenticated on load
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (err) {
        console.error('Error parsing user data:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
      }
    }
    setLoading(false);
  }, []);

  // Login function using mock data
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simple validation (in a real app, this would be server-side)
      if (email.trim() === '' || password.trim() === '') {
        throw new Error('Email and password are required');
      }
      
      // In a real app, we would validate credentials server-side
      // For demo purposes, any non-empty credentials will work
      
      // Generate a mock token
      const token = `mock-token-${Date.now()}`;
      
      // Save user and token to localStorage
      localStorage.setItem('user', JSON.stringify(MOCK_USER));
      localStorage.setItem('auth_token', token);
      
      setUser(MOCK_USER);
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password. Please try again.');
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Register function using mock data
  const register = async (name: string, email: string, password: string, password_confirmation: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simple validation (in a real app, this would be server-side)
      if (name.trim() === '' || email.trim() === '' || password.trim() === '') {
        throw new Error('All fields are required');
      }
      
      if (password !== password_confirmation) {
        throw new Error('Passwords do not match');
      }
      
      // In a real app, we would create a user server-side
      // For demo purposes, we'll just show a success message
      
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. This email may already be in use.');
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    toast.success('Successfully logged out');
    navigate('/login');
  };

  // Forgot password function (mock implementation)
  const forgotPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (email.trim() === '') {
        throw new Error('Email is required');
      }
      
      toast.success('Password reset link sent to your email! (demo mode)');
      return Promise.resolve();
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError(err.message || 'Failed to send reset link. Please try again.');
      toast.error('Failed to send reset link. Please try again.');
      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
  };

  // Reset password function (mock implementation)
  const resetPassword = async (token: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (password.trim() === '') {
        throw new Error('Password is required');
      }
      
      toast.success('Password has been reset successfully! (demo mode)');
      navigate('/login');
      return Promise.resolve();
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.message || 'Failed to reset password. The link may have expired.');
      toast.error('Failed to reset password. Please try again.');
      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
  };

  // Verify email function (mock implementation)
  const verifyEmail = async (token: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success('Email verified successfully! (demo mode)');
      navigate('/login');
      return Promise.resolve();
    } catch (err: any) {
      console.error('Verify email error:', err);
      setError(err.message || 'Failed to verify email. The link may have expired.');
      toast.error('Failed to verify email. Please try again.');
      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create the auth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
