
// src/config/api.ts

/**
 * API Configuration
 * 
 * This file configures API endpoints with fallback values for development
 */
export const apiConfig = {
  // Use environment variables if available, otherwise fall back to development defaults
  API_URL: import.meta.env.VITE_API_URL || 'https://api.agro-insight.com/api',
  CSRF_URL: import.meta.env.VITE_CSRF_URL || 'https://api.agro-insight.com/csrf',
};

// Log configuration in development mode
if (import.meta.env.DEV) {
  console.log('API Configuration:', {
    API_URL: apiConfig.API_URL,
    CSRF_URL: apiConfig.CSRF_URL,
    mode: import.meta.env.MODE,
  });
}

// Export for use throughout the application
export default apiConfig;
