import { useState } from 'react';
import { Layout, Card, Form, Input, Button, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import authApi from '../../api/authApi';

const { Content } = Layout;
const { Title, Text } = Typography;

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(values);
      message.success('Mã OTP đã được gửi về email của bạn!');
      // Chuyển hướng sang trang nhập OTP và đổi mật khẩu, truyền email đi theo
      navigate('/reset-password', { state: { email: values.email } });
    } catch (error) {
      message.error(error?.message || 'Có lỗi xảy ra khi gửi yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card style={{ width: 400, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={3}>Quên mật khẩu?</Title>
            <Text type="secondary">Nhập email của bạn để nhận mã xác thực OTP (hiệu lực 60s)</Text>
          </div>

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email của bạn" size="large" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                Gửi mã xác thực
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center' }}>
            <Link to="/login">
              <Button type="link" icon={<ArrowLeftOutlined />}>Quay lại đăng nhập</Button>
            </Link>
          </div>
        </Card>
      </Content>
    </Layout>
  );
};

export default ForgotPasswordPage;
