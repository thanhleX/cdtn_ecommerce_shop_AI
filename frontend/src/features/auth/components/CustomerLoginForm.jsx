import { Form, Input, Button, Checkbox, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import LinkGoogleModal from './LinkGoogleModal';

const { Title, Text } = Typography;

const CustomerLoginForm = () => {
  const { customerLogin, googleLogin, loading } = useAuth();
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [tempIdToken, setTempIdToken] = useState(null);

  const onFinish = (values) => {
    customerLogin(values);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse.credential;
    const result = await googleLogin(idToken);
    
    // Nếu mã lỗi là 1039 (ACCOUNT_LINKING_REQUIRED), hiện modal
    if (!result.success && result.error?.code === 1039) {
      setTempIdToken(idToken);
      setShowLinkModal(true);
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: '20px auto', padding: '40px 20px', background: '#fff', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={3}>Đăng nhập</Title>
        <Text type="secondary">Chào mừng bạn trở lại E-commerce</Text>
      </div>

      <Form
        name="customer_login"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        size="large"
        layout="vertical"
        validateTrigger="onSubmit"
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: '100%' }} loading={loading}>
            Đăng nhập
          </Button>
          <div style={{ textAlign: 'right', marginTop: 8 }}>
            <Link to="/forgot-password" style={{ fontSize: 13 }}>Quên mật khẩu?</Link>
          </div>
        </Form.Item>

        <Divider plain><Text type="secondary" style={{ fontSize: 12 }}>Hoặc đăng nhập với</Text></Divider>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              message.error('Đăng nhập Google thất bại');
            }}
            useOneTap
            width="320"
          />
        </div>

        <div style={{ textAlign: 'center' }}>
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </div>
      </Form>

      <LinkGoogleModal 
        visible={showLinkModal} 
        onCancel={() => setShowLinkModal(false)} 
        idToken={tempIdToken}
      />
    </div>
  );
};

export default CustomerLoginForm;
