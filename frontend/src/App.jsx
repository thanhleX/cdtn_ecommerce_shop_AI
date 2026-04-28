import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import ChatWidget from './components/chat/ChatWidget';
import CustomerLayout from './components/Layout/CustomerLayout';
import AdminLayout from './components/Layout/AdminLayout';
import ProtectedRoute from './components/guards/ProtectedRoute';
import AdminRoute from './components/guards/AdminRoute';
import GuestRoute from './components/guards/GuestRoute';

import CustomerLoginPage from './features/auth/CustomerLoginPage';
import AdminLoginPage from './features/auth/AdminLoginPage';
import RegisterPage from './features/auth/RegisterPage';

// Customer Pages
import HomePage from './features/home/HomePage';
import ProductListPage from './features/product/ProductListPage';
import ProductDetailPage from './features/product/ProductDetailPage';
import CartPage from './features/cart/CartPage';
import CheckoutPage from './features/order/CheckoutPage';
import ProfilePage from './features/profile/ProfilePage';
import BlogListPage from './features/blog/BlogListPage';
import BlogDetailPage from './features/blog/BlogDetailPage';

// Admin Pages
import DashboardPage from './features/admin/pages/DashboardPage';
import ProductManagePage from './features/admin/pages/ProductManagePage';
import CategoryManagePage from './features/admin/pages/CategoryManagePage';
import OrderManagePage from './features/admin/pages/OrderManagePage';
import BlogManagePage from './features/admin/pages/BlogManagePage';
import VoucherManagePage from './features/admin/pages/VoucherManagePage';
import UserManagePage from './features/admin/pages/UserManagePage';
import StaffManagePage from './features/admin/pages/StaffManagePage';
import RoleManagePage from './features/admin/pages/RoleManagePage';
import AttributeManagePage from './features/admin/pages/AttributeManagePage';

import { useCart } from './hooks/useCart';
import ScrollToTop from './components/common/ScrollToTop';

/* =========================
   Component chạy bên trong Router
========================= */
function AppContent() {
  const { initCart } = useCart();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    initCart();
  }, [initCart]);

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* GUEST ONLY (Redirect if logged in) */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<CustomerLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        
        <Route element={<GuestRoute redirectTo="/admin" />}>
          <Route path="/admin/login" element={<AdminLoginPage />} />
        </Route>

        {/* CUSTOMER */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductListPage />} />
          <Route path="products/slug/:slug" element={<ProductDetailPage />} />
          <Route path="blog" element={<BlogListPage />} />
          <Route path="blog/:slug" element={<BlogDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* ADMIN */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductManagePage />} />
            <Route path="attributes" element={<AttributeManagePage />} />
            <Route path="categories" element={<CategoryManagePage />} />
            <Route path="orders" element={<OrderManagePage />} />
            <Route path="users" element={<UserManagePage />} />
            <Route path="staff" element={<StaffManagePage />} />
            <Route path="roles" element={<RoleManagePage />} />
            <Route path="blogs" element={<BlogManagePage />} />
            <Route path="vouchers" element={<VoucherManagePage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!isAdminRoute && <ChatWidget />}
    </>
  );
}

/* =========================
   Root App
========================= */
function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          colorTextBase: '#1f2937',
        },
        components: {
          Layout: {
            headerBg: 'rgba(255, 255, 255, 0.85)',
            bodyBg: '#f3f4f6',
          },
          Card: {
            borderRadiusLG: 12,
          }
        }
      }}
    >
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;