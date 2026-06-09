import axios from 'axios';

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: 'user' | 'vendor' | 'admin';
}

const API_BASE_URL = '/api';

// Add response interceptor to handle 401 errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token might be invalid or expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        sessionStorage.setItem(
          'post_login_redirect',
          JSON.stringify({
            path: window.location.pathname,
            search: window.location.search,
            state: null,
          })
        );
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email: string, password: string) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
    if (response.data.token && response.data.user) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  signup: async (fullName: string, email: string, password: string, phone: string, role: string) => {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      fullName,
      email,
      password,
      phone,
      role
    });
    if (response.data.token && response.data.user) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser: (): User | null => {
    const rawUser = localStorage.getItem('user');
    if (rawUser && !['null', 'undefined', ''].includes(rawUser)) {
      try {
        return JSON.parse(rawUser);
      } catch {
        return null;
      }
    }
    return null;
  },

  getToken: (): string | null => {
    const rawToken = localStorage.getItem('token');
    return rawToken && !['null', 'undefined', ''].includes(rawToken) ? rawToken : null;
  },

  isAuthenticated: (): boolean => {
    return !!authService.getToken() && !!authService.getCurrentUser();
  },

  getAuthHeader: () => {
    const token = authService.getToken();
    return {
      Authorization: token ? `Bearer ${token}` : ''
    };
  }
};

export default authService;

