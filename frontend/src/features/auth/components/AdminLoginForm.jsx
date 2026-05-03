import { Form, Input, Button, Typography } from 'antd';
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useAuth } from '../../../hooks/useAuth';

const { Title, Text } = Typography;

const AdminLoginForm = () => {
  const { adminLogin, loading } = useAuth();

  const onFinish = (values) => {
    adminLogin(values);
  };

  return (
    <div style={{ maxWidth: 360, margin: '0 auto', padding: '40px 20px', background: '#fff', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <SafetyCertificateOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
        <Title level={3}>Trang Quản Trị</Title>
        <Text type="secondary">Đăng nhập dành cho Admin</Text>
      </div>

      <Form
        name="admin_login"
        onFinish={onFinish}
        size="large"
        layout="vertical"
        validateTrigger="onSubmit"
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Admin Username" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Admin Password" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: '100%', marginTop: 12 }} loading={loading} danger>
            Đăng Nhập Quản Trị
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AdminLoginForm;
