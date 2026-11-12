import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_RECAUDACIONES_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: agrega el JWT automáticamente
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('access_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: si el token expira, redirige al login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/');
    const isLdapRequest = error.config?.url?.includes('/auth/user/');

    if (error.response?.status === 401 && !isLoginRequest && !isLdapRequest) {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('access_token');
        window.localStorage.removeItem('user');
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  },
);