import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

//const API_BASE_URL = 'http://127.0.0.1:8000/api';
//const CSRF_URL = 'http://127.0.0.1:8000/sanctum/csrf-cookie';

const API_BASE_URL = 'https://animal-management-master-wyohh0.laravel.cloud/api';
const CSRF_URL = 'https://animal-management-master-wyohh0.laravel.cloud/sanctum/csrf-cookie';


interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  verifyEmail: (id: string, hash: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
}

const logRequest = (endpoint: string, options: any, data: any = null) => {
  console.log(`[AUTH] Request to ${endpoint}:`, { options, data });
};

const logResponse = (endpoint: string, response: any) => {
  console.log(`[AUTH] Response from ${endpoint}:`, response);
};

const logError = (endpoint: string, error: any) => {
  console.error(`[AUTH] Error from ${endpoint}:`, error);
};

// Fetch CSRF token
const fetchCsrfToken = async () => {
  try {
    const response = await fetch(CSRF_URL, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch CSRF token');
    console.log('[AUTH] CSRF token fetched');
  } catch (error) {
    console.warn('[AUTH] CSRF fetch failed, proceeding anyway:', error);
  }
};

// Helper function for API requests
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('auth_token');
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  // Add X-XSRF-TOKEN if available
  const xsrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];
  if (xsrfToken) {
    defaultHeaders['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
  }

  const requestOptions = {
    ...options,
    headers: { ...defaultHeaders, ...options.headers },
    credentials: 'include', // Include cookies for Sanctum
  };
  
  logRequest(endpoint, requestOptions, options.body);
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
    const contentType = response.headers.get('content-type');
    const responseData = contentType?.includes('application/json') 
      ? await response.json() 
      : await response.text();
    
    logResponse(endpoint, { status: response.status, data: responseData });
    
    if (!response.ok) {
      throw { status: response.status, data: responseData };
    }
    
    return responseData;
  } catch (error) {
    logError(endpoint, error);
    throw error;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchCurrentUser = async () => {
    try {
      const userData = await apiFetch('/user');
      return userData.data || userData; // Adjust based on response structure
    } catch (error) {
      console.error('[AUTH] Error fetching user data:', error);
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('[AUTH] No token found');
        setLoading(false);
        return;
      }

      try {
        await fetchCsrfToken(); // Fetch CSRF on initial load
        const userData = await fetchCurrentUser();
        if (userData) {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          console.warn('[AUTH] No user data, clearing token');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
        }
      } catch (err) {
        console.error('[AUTH] Auth check failed:', err);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await fetchCsrfToken();
      const response = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const token = response.access_token || response.token || response.data?.token;
      if (!token) throw new Error('No token received from server');

      localStorage.setItem('auth_token', token);
      const userData = response.data?.user || response.user || {
        id: '1',
        name: email.split('@')[0],
        email,
        avatar: null,
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, password_confirmation: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await fetchCsrfToken();
      await apiFetch('/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, password_confirmation }),
      });
      
      toast.success('Registration successful! Please check your email for verification.');
      navigate('/login');
    } catch (err: any) {
      const errorMessage = err.data?.message || err.data?.errors?.email?.[0] || 'Registration failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetchCsrfToken();
      await apiFetch('/logout', { method: 'POST' });
    } catch (error) {
      console.error('[AUTH] Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      toast.success('Successfully logged out');
      navigate('/login');
    }
  };

  const forgotPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await fetchCsrfToken();
      await apiFetch('/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      
      toast.success('Password reset link sent to your email!');
    } catch (err: any) {
      const errorMessage = err.data?.message || 'Failed to send reset link';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, email: string, password: string, password_confirmation: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await fetchCsrfToken();
      await apiFetch('/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, email, password, password_confirmation }),
      });
      
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err: any) {
      const errorMessage = err.data?.message || 'Failed to reset password';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (id: string, hash: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await apiFetch(`/verify-email/${id}/${hash}`, { method: 'GET' });
      toast.success('Email verified successfully!');
      navigate('/login');
    } catch (err: any) {
      const errorMessage = err.data?.message || 'Failed to verify email';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await fetchCsrfToken();
      await apiFetch('/email/verification-notification', { method: 'POST' });
      toast.success('Verification email resent!');
    } catch (err: any) {
      const errorMessage = err.data?.message || 'Failed to resend verification email';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user && !!localStorage.getItem('auth_token'),
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerificationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};