import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// API URLs
const API_BASE_URL = 'http://127.0.0.1:8000'; // Updated to localhost testing URL

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

  // Helper to make API requests
  const apiRequest = async <T,>(
    endpoint: string, 
    method: string = 'GET', 
    data?: any, 
    requiresAuth: boolean = false
  ): Promise<T> => {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const token = localStorage.getItem('auth_token');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (requiresAuth && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An error occurred');
      }
      
      return await response.json();
    } catch (err: any) {
      console.error(`API request error (${endpoint}):`, err);
      throw err;
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the API structure provided
      const responseData = await apiRequest<{
        message: string;
        data: {
          user: User;
          token: string;
          token_type: string;
        }
      }>('/login', 'POST', { email, password });
      
      const userData = responseData.data.user;
      const token = responseData.data.token;
      
      // Save user and token to localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('auth_token', token);
      
      setUser(userData);
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

  // Register function
  const register = async (name: string, email: string, password: string, password_confirmation: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the API structure provided
      const responseData = await apiRequest<{
        message: string;
        data: User;
      }>('/register', 'POST', { 
        name, 
        email, 
        password,
        password_confirmation
      });
      
      toast.success('Registration successful! Please verify your email.');
      navigate('/verify-email', { state: { email } });
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

  // Forgot password function
  const forgotPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await apiRequest<{ message: string }>(
        '/forgot-password', 
        'POST', 
        { email }
      );
      
      toast.success('Password reset link sent to your email!');
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

  // Reset password function
  const resetPassword = async (token: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await apiRequest<{ message: string }>(
        '/reset-password', 
        'POST', 
        { token, password, password_confirmation: password }
      );
      
      toast.success('Password has been reset successfully!');
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

  // Verify email function
  const verifyEmail = async (token: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await apiRequest<{ message: string }>(
        '/verify-email', 
        'POST', 
        { token }
      );
      
      toast.success('Email verified successfully!');
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
