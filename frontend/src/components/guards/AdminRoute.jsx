import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { Result, Button, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';

const AdminRoute = () => {
  const { isAuthenticated, user, permissions } = useAuthStore();
  const navigate = useNavigate();

  // dark mode of Chrome
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // 1. Nếu chưa đăng nhập -> đá về login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // 2. Nếu đã có token nhưng chưa có profile (đang load profile) 
  // -> Hiện loading thay vì 403
  if (isAuthenticated && !user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" description="Đang xác thực quyền truy cập..." />
      </div>
    );
  }

  // 3. Hệ thống RBAC: 
  // Ưu tiên dùng permissions từ store (vì nó được giải mã từ JWT ngay khi có token)
  const isStaffOrAdmin = permissions?.some(p =>
    ['ROLE_ADMIN', 'ROLE_STAFF'].includes(p)
  ) || permissions?.length > 0;

  if (!isStaffOrAdmin) {
    return (
      <Result
        status="403"
        title={
          <span style={{ color: isDarkMode ? '#fff' : '#000' }}>
            403 Không có quyền
          </span>
        }
        subTitle={
          <span style={{ color: isDarkMode ? '#aaa' : '#555' }}>
            Xin lỗi, bạn không có quyền truy cập vào trang quản trị.
          </span>
        }
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            Quay lại trang chủ
          </Button>
        }
      />
    );
  }

  // Allowed
  return <Outlet />;
};

export default AdminRoute;
