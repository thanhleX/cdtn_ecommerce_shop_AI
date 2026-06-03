import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import ChatWidget from './components/chat/ChatWidget';
import CustomerLayout from './components/Layout/CustomerLayout';
import AdminLayout from './components/Layout/AdminLayout';
import ProtectedRoute from './components/guards/ProtectedRoute';
import AdminRoute from './components/guards/AdminRoute';
import GuestRoute from './components/guards/GuestRoute';

import { lazy, Suspense } from 'react';
import { Spin } from 'antd';

const CustomerLoginPage = lazy(() => import('./features/auth/CustomerLoginPage'));
const AdminLoginPage = lazy(() => import('./features/auth/AdminLoginPage'));
const RegisterPage = lazy(() => import('./features/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./features/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./features/auth/ResetPasswordPage'));

// Customer Pages
const HomePage = lazy(() => import('./features/home/HomePage'));
const ProductListPage = lazy(() => import('./features/product/ProductListPage'));
const ProductDetailPage = lazy(() => import('./features/product/ProductDetailPage'));
const CartPage = lazy(() => import('./features/cart/CartPage'));
const CheckoutPage = lazy(() => import('./features/order/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./features/order/OrderSuccessPage'));
const PaymentReturnPage = lazy(() => import('./features/order/PaymentReturnPage'));
const ProfilePage = lazy(() => import('./features/profile/ProfilePage'));
const BlogListPage = lazy(() => import('./features/blog/BlogListPage'));
const BlogDetailPage = lazy(() => import('./features/blog/BlogDetailPage'));

// Admin Pages
const DashboardPage = lazy(() => import('./features/admin/pages/DashboardPage'));
const ProductManagePage = lazy(() => import('./features/admin/pages/ProductManagePage'));
const CategoryManagePage = lazy(() => import('./features/admin/pages/CategoryManagePage'));
const OrderManagePage = lazy(() => import('./features/admin/pages/OrderManagePage'));
const BlogManagePage = lazy(() => import('./features/admin/pages/BlogManagePage'));
const VoucherManagePage = lazy(() => import('./features/admin/pages/VoucherManagePage'));
const UserManagePage = lazy(() => import('./features/admin/pages/UserManagePage'));
const StaffManagePage = lazy(() => import('./features/admin/pages/StaffManagePage'));
const RoleManagePage = lazy(() => import('./features/admin/pages/RoleManagePage'));
const AttributeManagePage = lazy(() => import('./features/admin/pages/AttributeManagePage'));
const ReviewManagePage = lazy(() => import('./features/admin/pages/ReviewManagePage'));

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
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>}>
        <Routes>
          {/* GUEST ONLY (Redirect if logged in) */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<CustomerLoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
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
            <Route path="order-success" element={<OrderSuccessPage />} />
            <Route path="payment-return" element={<PaymentReturnPage />} />

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
              <Route path="reviews" element={<ReviewManagePage />} />
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
      </Suspense>

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