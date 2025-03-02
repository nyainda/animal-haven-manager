import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Define the user type
interface User {
  name: string;
  email: string;
  token: string;
}

// Define the auth context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the auth provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if user is authenticated on load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (err) {
        console.error('Error parsing user data:', err);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Helper to simulate API call
  const simulateApiCall = <T,>(data: T, delay = 1000, shouldFail = false): Promise<T> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldFail) {
          reject(new Error('API call failed'));
        } else {
          resolve(data);
        }
      }, delay);
    });
  };

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      const userData = await simulateApiCall<User>(
        { name: 'John Doe', email, token: 'mock-token-123' },
        1000,
        false // Set to true to simulate failure
      );
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password. Please try again.');
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await simulateApiCall(
        { success: true },
        1000,
        false // Set to true to simulate failure
      );
      
      toast.success('Registration successful! Please verify your email.');
      navigate('/verify-email', { state: { email } });
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. This email may already be in use.');
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.success('Successfully logged out');
    navigate('/login');
  };

  // Forgot password function
  const forgotPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await simulateApiCall(
        { success: true },
        1000,
        false // Set to true to simulate failure
      );
      
      toast.success('Password reset link sent to your email!');
      return Promise.resolve();
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Failed to send reset link. Please try again.');
      toast.error('Failed to send reset link. Please try again.');
      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (token: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call - validate token and update password
      await simulateApiCall(
        { success: true },
        1500,
        token === 'invalid-token' // Simulate failure for invalid tokens
      );
      
      toast.success('Password has been reset successfully!');
      return Promise.resolve();
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Failed to reset password. The link may have expired.');
      toast.error('Failed to reset password. Please try again.');
      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
  };

  // Verify email function
  const verifyEmail = async (token: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call - validate verification token
      await simulateApiCall(
        { success: true },
        1500,
        token === 'invalid-token' // Simulate failure for invalid tokens
      );
      
      toast.success('Email verified successfully!');
      return Promise.resolve();
    } catch (err) {
      console.error('Verify email error:', err);
      setError('Failed to verify email. The link may have expired.');
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
