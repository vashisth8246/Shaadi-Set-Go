import axios from 'axios';

const LOCAL_API_PREFIX = '/api';
const configuredBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

axios.defaults.baseURL = `${configuredBaseUrl}/api`;

axios.interceptors.request.use((config) => {
  if (typeof config.url === 'string' && config.url.startsWith(LOCAL_API_PREFIX)) {
    config.url = config.url.replace(LOCAL_API_PREFIX, '');
  }

  return config;
});

export {};
