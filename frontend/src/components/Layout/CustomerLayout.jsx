import { Layout, Menu, Button, Dropdown, Badge, Avatar, List, Typography, FloatButton, Input, Space } from 'antd';
import { ShoppingCartOutlined, UserOutlined, LogoutOutlined, HomeOutlined, AppstoreOutlined, BellOutlined, SearchOutlined } from '@ant-design/icons';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';
import { useAuth } from '../../hooks/useAuth';
import { useWebSocket } from '../../hooks/useWebSocket';
import notificationApi from '../../api/notificationApi';
import categoryApi from '../../api/categoryApi';
import { useCart } from '../../hooks/useCart';
import AppFooter from './AppFooter';

const { Header, Content } = Layout;
const { Text } = Typography;

const CustomerLayout = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { logout } = useAuth(); // hook handles logout logic including navigation

  // Connect WebSocket & bind store
  useWebSocket();
  const { notifications, unreadCount, setNotifications, markAsRead } = useNotificationStore();

  const { cartCount } = useCart();

  useEffect(() => {
    if (isAuthenticated) {
      notificationApi.getNotifications({ size: 10 })
        .then(res => {
          const data = res.data || res;
          setNotifications(data.content || []);
        })
        .catch(err => console.error("Could not fetch initial notifications", err));
    }
  }, [isAuthenticated, setNotifications]);

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await notificationApi.markAsRead(notif.id);
        markAsRead(notif.id);
      } catch (error) {
        console.error("Failed to mark notification as read", error);
      }
    }
    navigate('/profile');
  };

  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryApi.getAllCategories({ activeOnly: true });
        setCategories(res.data || res);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCats();
  }, []);

  const [activeParentId, setActiveParentId] = useState(null);

  const parentCategories = useMemo(() => categories.filter(c => !c.parentId), [categories]);

  useEffect(() => {
    if (parentCategories.length > 0 && !activeParentId) {
      setActiveParentId(parentCategories[0].id);
    }
  }, [parentCategories, activeParentId]);

  const categoryMegaMenuRender = () => {
    // Lấy các danh mục cấp 1 của danh mục cha đang được hover
    const level1Categories = categories.filter(c => c.parentId === activeParentId);

    return (
      <div style={{
        display: 'flex',
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        width: 800, // Rộng hơn để chứa nhiều cột
        minHeight: 400
      }}>
        {/* Left Column: Parent Categories (Level 0) */}
        <div style={{
          width: 240,
          background: '#f9f9f9',
          borderRight: '1px solid #f0f0f0',
          padding: '12px 0'
        }}>
          {parentCategories.map(parent => (
            <div
              key={parent.id}
              onMouseEnter={() => setActiveParentId(parent.id)}
              onClick={() => navigate(`/products?category=${parent.slug}`)}
              style={{
                padding: '12px 24px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: activeParentId === parent.id ? '#fff' : 'transparent',
                fontWeight: activeParentId === parent.id ? 600 : 400,
                color: activeParentId === parent.id ? '#1890ff' : '#262626',
                borderLeft: activeParentId === parent.id ? '3px solid #1890ff' : '3px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              <span>{parent.name}</span>
              <span style={{ fontSize: 10, color: activeParentId === parent.id ? '#1890ff' : '#bfbfbf' }}>▶</span>
            </div>
          ))}
        </div>

        {/* Right Column: Child Categories (Level 1 & Level 2) */}
        <div style={{ flex: 1, padding: '24px', background: '#fff', overflowY: 'auto', maxHeight: 500 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)', // 3 cột
            gap: '24px'
          }}>
            {level1Categories.map(l1 => {
              // Tìm các danh mục cấp 2 của l1
              const level2Categories = categories.filter(c => c.parentId === l1.id);

              return (
                <div key={l1.id}>
                  {/* Tiêu đề nhóm (Level 1) */}
                  <div
                    onClick={() => navigate(`/products?category=${l1.slug}`)}
                    style={{
                      fontWeight: 600,
                      marginBottom: 12,
                      cursor: 'pointer',
                      color: '#262626',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#1890ff'}
                    onMouseLeave={e => e.currentTarget.style.color = '#262626'}
                  >
                    {l1.name}
                  </div>

                  {/* Danh sách con (Level 2) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {level2Categories.map(l2 => (
                      <div
                        key={l2.id}
                        onClick={() => navigate(`/products?category=${l2.slug}`)}
                        style={{
                          cursor: 'pointer',
                          color: '#595959',
                          fontSize: 13,
                          transition: 'color 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#1890ff'}
                        onMouseLeave={e => e.currentTarget.style.color = '#595959'}
                      >
                        {l2.name}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          {level1Categories.length === 0 && (
            <div style={{ color: '#bfbfbf', textAlign: 'center', marginTop: 40 }}>
              Không có danh mục con
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleSearch = (value) => {
    if (value.trim()) {
      navigate(`/products?q=${encodeURIComponent(value.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const userMenuItems = [
    { key: 'profile', label: <Link to="/profile">Hồ sơ</Link>, icon: <UserOutlined /> },
    { type: 'divider' },
    { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, onClick: logout },
  ];

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
      <div style={{ padding: '12px 16px', fontWeight: 'bold', borderBottom: '1px solid #f0f0f0' }}>
        Thông báo ({unreadCount} chưa đọc)
      </div>
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
              <Text strong={!item.isRead}>{item.title}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {item.content}
              </Text>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <Layout className="layout" style={{ minHeight: '100vh' }}>
      <Header style={{
        display: 'flex',
        alignItems: 'center',
        background: '#fff',
        padding: '0 50px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        zIndex: 1000,
        position: 'sticky',
        top: 0,
        height: 70
      }}>
        {/* LOGO */}
        <div className="logo" style={{ marginRight: 40 }}>
          <Link to="/" style={{ color: '#001529', fontWeight: 'bold', fontSize: 24, letterSpacing: -1 }}>
            VietTech Store
          </Link>
        </div>

        {/* [DANH MỤC] mega menu */}
        <Dropdown popupRender={categoryMegaMenuRender} placement="bottomLeft" classNames={{ root: 'mega-menu-dropdown' }}>
          <Button
            type="primary"
            size="large"
            icon={<AppstoreOutlined />}
            style={{ borderRadius: 8, fontWeight: 500, marginRight: 20 }}
          >
            Danh Mục
          </Button>
        </Dropdown>

        {/* [SEARCH] */}
        <div style={{ flex: 1, padding: '0 20px' }}>
          <Input.Search
            placeholder="Bạn cần tìm gì hôm nay?"
            enterButton="Tìm kiếm"
            size="large"
            onSearch={handleSearch}
            style={{ borderRadius: 8, overflow: 'hidden' }}
          />
        </div>

        {/* [BLOG] & [OTHER] */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginLeft: 20 }}>
          <Link to="/blog" style={{ color: '#595959', fontWeight: 500 }}>Blog</Link>

          <div style={{ width: 1, height: 20, background: '#f0f0f0' }} />

          {isAuthenticated && (
            <Dropdown popupRender={() => notificationMenu} placement="bottomRight" trigger={['click']}>
              <Badge count={unreadCount} size="small">
                <BellOutlined style={{ fontSize: 22, color: '#595959', cursor: 'pointer' }} />
              </Badge>
            </Dropdown>
          )}

          <Link to="/cart">
            <Badge count={cartCount} showZero size="small">
              <ShoppingCartOutlined style={{ fontSize: 22, color: '#595959' }} />
            </Badge>
          </Link>

          {isAuthenticated ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar src={user?.avatar} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                <span style={{ fontWeight: 500, color: '#262626' }}>{user?.fullName || user?.username}</span>
              </span>
            </Dropdown>
          ) : (
            <Space>
              <Button type="text" onClick={() => navigate('/login')}>Đăng nhập</Button>
              <Button type="primary" onClick={() => navigate('/register')} style={{ borderRadius: 6 }}>Đăng ký</Button>
            </Space>
          )}
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
          .mega-menu-dropdown .ant-dropdown-menu {
            padding: 8px;
            min-width: 200px;
            border-radius: 8px;
          }
          .mega-menu-dropdown .ant-dropdown-menu-submenu-title {
            padding: 12px 16px;
          }
        `}} />
      </Header>

      <Content style={{ padding: '0 50px', marginTop: 24 }}>
        <div style={{ background: '#fff', padding: 24, minHeight: 280, borderRadius: 8 }}>
          <Outlet />
        </div>
      </Content>

      <AppFooter />
      <FloatButton.BackTop visibilityHeight={400} style={{ bottom: 110, right: 41 }} />
    </Layout>
  );
};

export default CustomerLayout;
