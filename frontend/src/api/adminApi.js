import axiosClient from './axiosClient';

const adminApi = {
  // Thống kê Dashboard
  getStats: () => {
    return axiosClient.get('/admin/dashboard');
  },

  // Quản lý Users
  getUsers: (params) => {
    return axiosClient.get('/admin/users', { params });
  },

  toggleUserActive: (id) => {
    return axiosClient.put(`/admin/users/${id}/toggle-active`);
  },

  createStaff: (data) => {
    return axiosClient.post('/admin/users/staff', data);
  },

  updateUserRoles: (id, roleIds) => {
    return axiosClient.put(`/admin/users/${id}/roles`, roleIds);
  },

  resetUserPassword: (id) => {
    return axiosClient.put(`/admin/users/${id}/reset-password`);
  },

  // Quản lý Roles & Permissions
  getRoles: () => {
    return axiosClient.get('/admin/roles');
  },

  createRole: (data) => {
    return axiosClient.post('/admin/roles', data);
  },

  updateRole: (id, data) => {
    return axiosClient.put(`/admin/roles/${id}`, data);
  },

  deleteRole: (id) => {
    return axiosClient.delete(`/admin/roles/${id}`);
  },

  getPermissions: () => {
    return axiosClient.get('/admin/permissions');
  },

  // Các quản lý khác (Product, Category, Order, etc. có thể dùng chung client API 
  // hoặc nếu backend tách riêng prefix /admin thì ta thêm ở đây. 
  // Dựa vào controllers có AdminOrderController, AdminBlogController...)

  getOrders: (params) => {
    return axiosClient.get('/admin/orders', { params });
  },

  updateOrderStatus: (id, status) => {
    return axiosClient.put(`/admin/orders/${id}/status`, null, {
      params: { status }
    });
  },

  getBlogs: (params) => {
    return axiosClient.get('/admin/blogs', { params });
  },

  deleteBlog: (id) => {
    return axiosClient.delete(`/admin/blogs/${id}`);
  },

  // Quản lý Reviews
  getReviews: (params) => {
    return axiosClient.get('/admin/reviews', { params });
  },

  updateReviewStatus: (id, status) => {
    return axiosClient.put(`/admin/reviews/${id}/status`, null, { params: { status } });
  }
};

export default adminApi;
