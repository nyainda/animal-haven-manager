
// src/config/api.ts
export const apiConfig = {
  API_URL: import.meta.env.VITE_API_URL || '',
  CSRF_URL: import.meta.env.VITE_CSRF_URL || '',


};

// Validate environment variables
if (!apiConfig.API_URL || !apiConfig.CSRF_URL 
  ) 
  {
  throw new Error(
    'Missing required environment variables: VITE_API_URL, VITE_CSRF_URL, and API_BASE_URL must be defined.'
  );
}
