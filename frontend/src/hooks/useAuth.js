import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import authApi from '../api/authApi';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: setAuthData, logout: clearAuthData } = useAuthStore();

  const handleLoginSuccess = async (response, redirectUrl, showSuccessMessage = true) => {
    // response assumes the form { code, data: { token, refreshToken } } based on interceptor
    const token = response.data?.token || response.token;
    const refreshToken = response.data?.refreshToken || response.refreshToken;

    if (!token) {
      throw new Error('Không nhận được token từ server');
    }

    // Temporary store tokens so that getProfile can use it via interceptor
    setAuthData(null, token, refreshToken);

    // Fetch user profile
    const profileRes = await authApi.getProfile();
    const user = profileRes.data || profileRes; // Handle standardized response

    // Save final user data & tokens
    setAuthData(user, token, refreshToken);

    if (showSuccessMessage) {
      message.success('Đăng nhập thành công!');
    }

    // Check for guest cart to merge
    const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
    if (guestCart.length > 0) {
      const { Modal } = await import('antd');
      const { mergeGuestCart } = useCartStore.getState();
      
      Modal.confirm({
        title: 'Bạn có sản phẩm trong giỏ hàng tạm thời',
        content: 'Bạn có muốn gộp các sản phẩm này vào giỏ hàng chính không? Nếu trùng sản phẩm, số lượng sẽ được cộng dồn.',
        okText: 'Cộng dồn',
        cancelText: 'Bỏ qua',
        onOk: async () => {
          try {
            await mergeGuestCart(true);
            message.success('Đã gộp giỏ hàng thành công!');
          } catch (err) {
            message.error('Lỗi khi gộp giỏ hàng');
          }
          navigate(redirectUrl, { replace: true });
        },
        onCancel: async () => {
          localStorage.removeItem('guestCart'); // Clear guest cart if they don't want to merge
          navigate(redirectUrl, { replace: true });
        }
      });
    } else {
      navigate(redirectUrl, { replace: true });
    }
  };

  const customerLogin = async (values) => {
    setLoading(true);
    try {
      const response = await authApi.login(values);
      await handleLoginSuccess(response, '/');
    } catch (error) {
      console.error('Customer Login Error:', error);
      message.error(error?.message || 'Sai tên đăng nhập hoặc mật khẩu!');
      clearAuthData(); // Revert any partial auth state
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (values) => {
    setLoading(true);
    try {
      const response = await authApi.login(values);
      // Giả thiết admin và customer dùng chung API login
      // Ta cần check quyền admin ở đây. 
      // Nhưng do data profile chưa gọi ở đây, nên cứ handle success xong sẽ redirect sang /admin. 
      // Route guard của /admin sẽ đá ra ngoài nếu không đủ quyền.
      await handleLoginSuccess(response, '/admin');
    } catch (error) {
      console.error('Admin Login Error:', error);
      message.error(error?.message || 'Sai thông tin hoặc không đủ quyền!');
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const register = async (values) => {
    setLoading(true);
    try {
      const response = await authApi.register(values);
      await handleLoginSuccess(response, '/', false);
      message.success('Đăng ký tài khoản thành công!');
    } catch (error) {
      console.error('Register Error:', error);
      message.error(error?.message || 'Lỗi đăng ký tài khoản!');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Bỏ qua lỗi (mất mạng, token hết hạn...) để vẫn thực hiện đăng xuất local
      console.error('Logout API Error:', error);
    } finally {
      clearAuthData();
      message.success('Đã đăng xuất!');
      navigate('/login');
    }
  };

  const googleLogin = async (idToken) => {
    setLoading(true);
    try {
      const response = await authApi.googleLogin({ idToken });
      await handleLoginSuccess(response, '/');
      return { success: true };
    } catch (error) {
      console.error('Google Login Error:', error);
      // Trả về error để UI xử lý (hiển thị modal link account nếu code = 1039)
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const linkGoogle = async (idToken, password) => {
    setLoading(true);
    try {
      const response = await authApi.linkGoogle({ idToken, password });
      await handleLoginSuccess(response, '/');
      message.success('Liên kết tài khoản thành công!');
      return { success: true };
    } catch (error) {
      console.error('Link Google Error:', error);
      message.error(error?.message || 'Liên kết thất bại. Vui lòng kiểm tra lại mật khẩu!');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return { customerLogin, adminLogin, register, googleLogin, linkGoogle, logout, loading };
};
