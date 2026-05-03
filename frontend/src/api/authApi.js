import axiosClient from './axiosClient';

const authApi = {
  // Customer & Admin login both use the same endpoint but backend returns different tokens based on role
  login: (data) => {
    return axiosClient.post('/auth/login', data);
  },
  
  register: (data) => {
    return axiosClient.post('/auth/register', data);
  },

  googleLogin: (data) => {
    return axiosClient.post('/auth/google-login', data);
  },

  linkGoogle: (data) => {
    return axiosClient.post('/auth/link-google', data);
  },
  
  getProfile: () => {
    return axiosClient.get('/users/me');
  },

  updateProfile: (data) => {
    return axiosClient.put('/users/me', data);
  },

  changePassword: (data) => {
    return axiosClient.post('/auth/change-password', data);
  },

  logout: () => {
    return axiosClient.post('/auth/logout');
  },

  refresh: (refreshToken) => {
    return axiosClient.post('/auth/refresh', { refreshToken });
  },

  forgotPassword: (data) => {
    return axiosClient.post('/auth/forgot-password', data);
  },

  resetPassword: (data) => {
    return axiosClient.post('/auth/reset-password', data);
  }
};

export default authApi;
