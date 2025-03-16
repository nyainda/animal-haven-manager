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
  refreshAuth: () => Promise<void>;
  updateProfile: (data: FormData) => Promise<void>;
}

// Logging helpers
const logRequest = (endpoint: string, options: any, data: any = null) => {
  console.log(`[AUTH] Request to ${endpoint}:`, { options, data });
};

const logResponse = (endpoint: string, response: any) => {
  console.log(`[AUTH] Response from ${endpoint}:`, response);
};

const logError = (endpoint: string, error: any) => {
  console.error(`[AUTH] Error from ${endpoint}:`, error);
};

// Fetch CSRF token with stricter enforcement
const fetchCsrfToken = async (retryCount = 0): Promise<void> => {
  const maxRetries = 2;
  if (retryCount > maxRetries) {
    throw new Error('Failed to fetch CSRF token after multiple attempts.');
  }

  try {
    console.log('[AUTH] Fetching CSRF token...');
    const response = await fetch(CSRF_URL, {
      method: 'GET',
      credentials: 'include' as const,
      mode: 'cors' as const,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CSRF token fetch failed: ${response.status}`);
    }
    console.log('[AUTH] CSRF token fetched successfully');
  } catch (error) {
    console.warn(`[AUTH] CSRF fetch attempt ${retryCount + 1} failed:`, error);
    if (retryCount < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
      return fetchCsrfToken(retryCount + 1);
    }
    throw error;
  }
};

// API fetch utility
const apiFetch = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = localStorage.getItem('auth_token');
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  const xsrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];

  if (xsrfToken) {
    defaultHeaders['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
  }

  const requestOptions: RequestInit = {
    ...options,
    headers: { ...defaultHeaders, ...options.headers },
    credentials: 'include' as const,
    mode: 'cors' as const,
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
      if (response.status === 401) throw new Error('Unauthorized');
      if (response.status === 419) throw new Error('CSRF token mismatch');
      if (response.status === 422) throw new Error(responseData.message || 'Validation error');
      throw new Error(responseData.message || `Request failed: ${response.status}`);
    }

    return responseData;
  } catch (error: any) {
    logError(endpoint, error);
    throw error;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchCurrentUser = async (): Promise<User | null> => {
    try {
      const userData = await apiFetch('/user');
      return userData.data || userData;
    } catch (error: any) {
      if (error.message === 'Unauthorized') return null;
      throw error;
    }
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      if (storedUser) setUser(JSON.parse(storedUser));
      await fetchCsrfToken();
      const userData = await fetchCurrentUser();
      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        setUser(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
    } catch (err) {
      console.error('[AUTH] Auth check failed:', err);
      setUser(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

      const token = response.data.token;
      if (!token) throw new Error('No authentication token received');

      localStorage.setItem('auth_token', token);
      const userData = response.data.user;

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      await fetchCsrfToken();
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: data, // FormData for multipart/form-data
      });

      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message || 'Failed to update profile');

      const updatedUser = responseData.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update profile';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetchCsrfToken();
      await apiFetch('/logout', { method: 'POST' });
    } catch (error) {
      console.error('[AUTH] Logout error:', error);
    } finally {
      setUser(null);
      localStorage.clear();
      toast.success('Successfully logged out');
      navigate('/login');
      setLoading(false);
    }
  };

  const refreshAuth = async () => {
    setLoading(true);
    await checkAuth();
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
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
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
      const errorMessage = err.message || 'Failed to send reset link';
      setError(errorMessage);
      toast.error(errorMessage);
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
      const errorMessage = err.message || 'Failed to reset password';
      setError(errorMessage);
      toast.error(errorMessage);
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
      const errorMessage = err.message || 'Failed to verify email';
      setError(errorMessage);
      toast.error(errorMessage);
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
      const errorMessage = err.message || 'Failed to resend verification email';
      setError(errorMessage);
      toast.error(errorMessage);
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
    refreshAuth,
    updateProfile,
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