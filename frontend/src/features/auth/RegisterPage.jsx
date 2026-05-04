import { Form, Input, Button, Typography, Layout } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, IdcardOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Header, Content } = Layout;

const RegisterPage = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const onFinish = (values) => {
    register(values);
  };

  const canGoBack = window.history.length > 1;

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      
      {/* Header tối giản */}
      <Header style={{ 
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        
        <Link to="/" style={{ fontWeight: 'bold', fontSize: 18 }}>
          VietTech Store
        </Link>

        {canGoBack && (
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate("/")}
          >
            Quay lại
          </Button>
        )}
      </Header>

      {/* Form */}
      <Content style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ width: '100%', maxWidth: 400, padding: '40px 20px', background: '#fff', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={3}>Đăng Ký Tài Khoản</Title>
            <Text type="secondary">Tạo tài khoản mua sắm mới</Text>
          </div>

          <Form
            name="register"
            onFinish={onFinish}
            size="large"
            layout="vertical"
            validateTrigger="onSubmit"
            style={{ textAlign: 'left' }}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
            </Form.Item>

            <Form.Item
              name="fullName"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
            >
              <Input prefix={<IdcardOutlined />} placeholder="Họ và Tên" />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                { min: 8, message: 'Mật khẩu phải từ 8 ký tự!' },
                { 
                  pattern: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\S+$).{8,}$/,
                  message: 'Mật khẩu phải bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt!'
                }
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
            </Form.Item>
            
            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ width: '100%' }} loading={loading}>
                Đăng Ký
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </div>
          </Form>
        </div>
      </Content>
    </Layout>
  );
};

export default RegisterPage;