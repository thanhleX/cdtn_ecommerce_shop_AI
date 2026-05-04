import axios from 'axios';
import useAuthStore from '../store/authStore';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: {
    serialize: (params) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v));
        } else {
          searchParams.append(key, value);
        }
      });
      return searchParams.toString();
    }
  },
});

// Request Interceptor: Add Token
axiosClient.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// Response Interceptor
axiosClient.interceptors.response.use(
  (response) => response.data || response,
  (error) => {
    // Nếu lỗi 401 (Hết hạn hoặc chưa đăng nhập) -> Logout thẳng luôn
    if (error.response?.status === 401) {
      const { logout } = useAuthStore.getState();
      logout();
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default axiosClient;
