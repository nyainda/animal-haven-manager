import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Configurable API endpoints
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

// Improved CSRF token fetch with better error handling and retry mechanism
const fetchCsrfToken = async (retryCount = 0): Promise<boolean> => {
  if (retryCount > 2) {
    console.warn('[AUTH] Max CSRF fetch retries reached, proceeding without CSRF token');
    return false;
  }
  
  try {
    console.log('[AUTH] Fetching CSRF token...');
    const response = await fetch(CSRF_URL, {
      method: 'GET',
      credentials: 'include',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSRF token: ${response.status} ${response.statusText}`);
    }
    
    console.log('[AUTH] CSRF token fetched successfully');
    return true;
  } catch (error) {
    console.warn(`[AUTH] CSRF fetch attempt ${retryCount + 1} failed:`, error);
    
    // Wait a bit before retrying
    if (retryCount < 2) {
      console.log(`[AUTH] Retrying CSRF fetch in ${(retryCount + 1) * 1000}ms...`);
      await new Promise(r => setTimeout(r, (retryCount + 1) * 1000));
      return fetchCsrfToken(retryCount + 1);
    }
    
    return false;
  }
};

// Helper function for API requests with improved error handling
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
  } else {
    console.warn('[AUTH] X-XSRF-TOKEN cookie not found, proceeding without CSRF protection');
  }

  const requestOptions = {
    ...options,
    headers: { ...defaultHeaders, ...options.headers },
    credentials: 'include', // Include cookies for Sanctum
    mode: 'cors' as RequestMode, // Explicitly set CORS mode
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
  } catch (error: any) {
    // Enhanced error logging with more context
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('[AUTH] Network error - server might be unreachable:', error);
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection and try again.');
    }
    
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
    } catch (error: any) {
      if (error.status === 401) {
        console.log('[AUTH] User not authenticated');
        return null;
      }
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
        const csrfSuccess = await fetchCsrfToken(); // Fetch CSRF on initial load
        if (!csrfSuccess) {
          console.warn('[AUTH] Proceeding without CSRF token');
        }
        
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

  // Improved auth operations with better error handling
  
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const csrfSuccess = await fetchCsrfToken();
      if (!csrfSuccess) {
        console.warn('[AUTH] Proceeding with login without CSRF token');
      }
      
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
      const csrfSuccess = await fetchCsrfToken();
      if (!csrfSuccess) {
        console.warn('[AUTH] Proceeding with registration without CSRF token');
      }
      
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
      const csrfSuccess = await fetchCsrfToken();
      if (!csrfSuccess) {
        console.warn('[AUTH] Proceeding with logout without CSRF token');
      }
      
      await apiFetch('/logout', { method: 'POST' });
    } catch (error) {
      console.error('[AUTH] Logout error:', error);
    } finally {
      // Always clear local storage even if the request fails
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
      const csrfSuccess = await fetchCsrfToken();
      if (!csrfSuccess) {
        console.warn('[AUTH] Proceeding with password reset request without CSRF token');
      }
      
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
      const csrfSuccess = await fetchCsrfToken();
      if (!csrfSuccess) {
        console.warn('[AUTH] Proceeding with password reset without CSRF token');
      }
      
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
      const csrfSuccess = await fetchCsrfToken();
      if (!csrfSuccess) {
        console.warn('[AUTH] Proceeding with email verification resend without CSRF token');
      }
      
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