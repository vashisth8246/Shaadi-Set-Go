import axios from 'axios';

/**
 * API Client Configuration
 * 
 * Environment Variables:
 * - VITE_API_BASE_URL: Full API base URL (e.g., https://api.shaadisetweddings.com)
 *   If not provided, uses relative paths (same domain)
 */

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (envUrl) {
    // Use the provided environment variable (production URL)
    return envUrl.replace(/\/$/, ''); // Remove trailing slash
  }
  
  if (import.meta.env.DEV) {
    // Development: use localhost with proxy
    return 'http://localhost:5000';
  }
  
  // Production: use relative paths (requests go to same domain)
  // The backend should be served from the same domain or configured via proxy
  return '';
};

const baseUrl = getApiBaseUrl();
const apiPrefix = '/api';

// Configure axios defaults
if (baseUrl) {
  axios.defaults.baseURL = `${baseUrl}${apiPrefix}`;
} else {
  // Use relative paths for same-domain requests
  axios.defaults.baseURL = apiPrefix;
}

// Request interceptor to handle URL formatting
axios.interceptors.request.use((config) => {
  if (typeof config.url === 'string' && config.url.startsWith('/')) {
    // If URL starts with /, ensure it doesn't get duplicated
    if (!config.url.startsWith(apiPrefix) && baseUrl === '') {
      // Add /api prefix only if not already present and we're using relative paths
      if (!config.url.startsWith(apiPrefix)) {
        config.url = apiPrefix + config.url;
      }
    }
  }
  return config;
});

export {};
