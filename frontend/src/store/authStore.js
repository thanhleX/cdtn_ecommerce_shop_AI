import { create } from 'zustand';

// Load từ sessionStorage
const getInitialToken = () => sessionStorage.getItem('token') || null;
const getInitialRefreshToken = () => sessionStorage.getItem('refreshToken') || null;

const getInitialUser = () => {
  try {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
};

// Parse JWT
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const getInitialPermissions = () => {
  const user = getInitialUser();
  if (user) {
    const roles = user.roles?.map(r => r.startsWith('ROLE_') ? r : `ROLE_${r}`) || [];
    const perms = user.permissions || [];
    return [...roles, ...perms];
  }
  return [];
};

const useAuthStore = create((set) => ({
  user: getInitialUser(),
  token: getInitialToken(),
  refreshToken: getInitialRefreshToken(),
  permissions: getInitialPermissions(),
  isAuthenticated: !!getInitialToken(),

  login: (user, token, refreshToken) => {
    // Save to sessionStorage
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('refreshToken', refreshToken);
    sessionStorage.setItem('user', JSON.stringify(user));

    const roles = user?.roles?.map(r => r.startsWith('ROLE_') ? r : `ROLE_${r}`) || [];
    const perms = user?.permissions || [];
    const permissions = [...roles, ...perms];

    set({
      user,
      token,
      refreshToken,
      permissions,
      isAuthenticated: true,
    });
  },

  setToken: (token) => {
    sessionStorage.setItem('token', token);
    set({ token });
  },

  logout: () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');

    set({
      user: null,
      token: null,
      refreshToken: null,
      permissions: [],
      isAuthenticated: false,
    });
  },

  updateUser: (updatedUser) => {
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
    const roles = updatedUser?.roles?.map(r => r.startsWith('ROLE_') ? r : `ROLE_${r}`) || [];
    const perms = updatedUser?.permissions || [];
    const permissions = [...roles, ...perms];
    set({ user: updatedUser, permissions });
  }
}));

export default useAuthStore;