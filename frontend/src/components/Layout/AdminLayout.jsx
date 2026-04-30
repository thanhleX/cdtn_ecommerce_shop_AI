import { Layout, Menu, Button, Dropdown, Avatar, Badge, List, Typography, Alert } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  SettingOutlined,
  FileTextOutlined,
  DollarCircleOutlined,
  BellOutlined,
  TagsOutlined
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';
import { useAuth } from '../../hooks/useAuth';
import { useWebSocket } from '../../hooks/useWebSocket';
import notificationApi from '../../api/notificationApi';
import usePermission from '../../hooks/usePermission';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuthStore();
  const { logout } = useAuth(); // Hook handles navigation
  const navigate = useNavigate();

  // Connect WebSocket & bind store
  useWebSocket();
  const { notifications, unreadCount, setNotifications, markAsRead } = useNotificationStore();

  useEffect(() => {
    notificationApi.getNotifications({ size: 10 })
      .then(res => {
        const data = res.data || res;
        setNotifications(data.content || []);
      })
      .catch(err => console.error("Could not fetch initial notifications", err));
  }, [setNotifications]);

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await notificationApi.markAsRead(notif.id);
        markAsRead(notif.id);
      } catch (error) {
        console.error("Failed to mark notification as read", error);
      }
    }
    navigate('/admin/orders');
  };

  const notificationMenu = (
    <div
      style={{
        width: 320,
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          fontWeight: 'bold',
          borderBottom: '1px solid #f0f0f0'
        }}
      >
        Thông báo ({unreadCount} chưa đọc)
      </div>

      {/* Content */}
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: 16, textAlign: 'center', color: '#999' }}>
            Chưa có thông báo nào
          </div>
        ) : (
          notifications.map(item => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                background: item.isRead ? '#fff' : '#f0f5ff',
                borderBottom: '1px solid #f0f0f0'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#e6f4ff')}
              onMouseLeave={e =>
                (e.currentTarget.style.background = item.isRead ? '#fff' : '#f0f5ff')
              }
            >
              <div style={{ fontWeight: item.isRead ? 'normal' : 'bold' }}>
                {item.title}
              </div>
              <div style={{ fontSize: 12, color: '#888' }}>
                {item.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const { hasPermission } = usePermission();

  const isSystemAdmin = user?.roles?.some(r => ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'].includes(r));

  const menuItems = [
    // 1. Dashboard
    { key: '/admin', icon: <DashboardOutlined />, label: <Link to="/admin">Thống kê</Link> },

    // 2. Vận hành chính
    { key: '/admin/orders', icon: <ShoppingOutlined />, label: <Link to="/admin/orders">Đơn hàng</Link> },

    // 3. Sản phẩm
    { key: '/admin/products', icon: <AppstoreOutlined />, label: <Link to="/admin/products">Sản phẩm</Link> },
    { key: '/admin/attributes', icon: <TagsOutlined />, label: <Link to="/admin/attributes">Thuộc tính</Link> },
    { key: '/admin/categories', icon: <AppstoreOutlined />, label: <Link to="/admin/categories">Danh mục</Link> },
    { key: '/admin/reviews', icon: <FileTextOutlined />, label: <Link to="/admin/reviews">Đánh giá</Link> },

    // 4. Marketing / bán hàng
    { key: '/admin/vouchers', icon: <DollarCircleOutlined />, label: <Link to="/admin/vouchers">Vouchers</Link> },

    // 5. Nội dung
    { key: '/admin/blogs', icon: <FileTextOutlined />, label: <Link to="/admin/blogs">Bài viết</Link> },

    // 6. Người dùng
    { key: '/admin/users', icon: <UserOutlined />, label: <Link to="/admin/users">Khách hàng</Link> },
    isSystemAdmin && { key: '/admin/staff', icon: <UserOutlined />, label: <Link to="/admin/staff">Nhân viên</Link> },

    // 7. Hệ thống
    isSystemAdmin && { key: '/admin/roles', icon: <SettingOutlined />, label: <Link to="/admin/roles">Phân quyền</Link> },
  ].filter(Boolean);

  const routePermissions = {
    '/admin/orders': 'order:read',
    '/admin/products': 'product:read',
    '/admin/attributes': 'product:read',
    '/admin/categories': 'category:manage',
    '/admin/vouchers': 'voucher:manage',
    '/admin/blogs': 'blog:manage',
    '/admin/users': 'customer:manage',
    '/admin/staff': 'staff:manage',
    '/admin/roles': 'role:read',
  };

  const requiredPermission = Object.entries(routePermissions).find(([path]) => location.pathname.startsWith(path))?.[1];
  const hasAccess = !requiredPermission || hasPermission(requiredPermission);

  const userMenuItems = [
    { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, onClick: logout },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
        <div className="logo" style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', textAlign: 'center', color: '#fff', lineHeight: '32px', fontWeight: 'bold' }}>
          {collapsed ? 'ADM' : 'ADMIN PANEL'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ padding: 0, background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 24 }}>
          {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
            className: 'trigger',
            onClick: () => setCollapsed(!collapsed),
            style: { padding: '0 24px', fontSize: 18, cursor: 'pointer' }
          })}

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Dropdown popupRender={() => notificationMenu} placement="bottomRight" trigger={['click']}>
              <Badge count={unreadCount} style={{ cursor: 'pointer' }}>
                <BellOutlined style={{ fontSize: 20 }} />
              </Badge>
            </Dropdown>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>Xin chào, <strong>{user?.fullName || user?.username || 'Admin'}</strong></span>
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              </span>
            </Dropdown>
          </div>
        </Header>

        <Content
          className="site-layout-background"
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#fff',
            borderRadius: 8
          }}
        >
          {!hasAccess ? (
            <Alert
              message="Bạn không có quyền truy cập chức năng này"
              description="Vui lòng liên hệ Quản trị viên hệ thống nếu bạn cần được cấp quyền."
              type="error"
              showIcon
              style={{ margin: 24 }}
            />
          ) : (
            <Outlet />
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

// React must be imported to use React.createElement outside jsx, or just use JSX for the icon
import React from 'react';

export default AdminLayout;
