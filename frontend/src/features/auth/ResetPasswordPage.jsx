import { useState, useEffect } from 'react';
import { Layout, Card, Form, Input, Button, Typography, message, Statistic } from 'antd';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { LockOutlined, KeyOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import authApi from '../../api/authApi';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Countdown } = Statistic;

const ResetPasswordPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [deadline, setDeadline] = useState(Date.now() + 1000 * 60); // 60 seconds
  const [isExpired, setIsExpired] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      message.error('Thiếu thông tin email. Vui lòng thử lại.');
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const onFinish = async (values) => {
    if (isExpired) {
      message.error('Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({
        email,
        otp: values.otp,
        newPassword: values.newPassword
      });
      message.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.');
      navigate('/login');
    } catch (error) {
      message.error(error?.message || 'Có lỗi xảy ra. Vui lòng kiểm tra lại mã OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authApi.forgotPassword({ email });
      setDeadline(Date.now() + 1000 * 60);
      setIsExpired(false);
      message.success('Đã gửi lại mã OTP mới!');
    } catch (error) {
      message.error('Không thể gửi lại mã. Vui lòng thử lại sau.');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card style={{ width: 450, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={3}>Đặt lại mật khẩu</Title>
            <Text>Mã xác thực đã được gửi tới: <Text strong>{email}</Text></Text>
            
            <div style={{ marginTop: 16, padding: '12px', background: '#fff7e6', borderRadius: 8, border: '1px solid #ffd591' }}>
              <Text type="warning">Thời gian còn lại: </Text>
              <Countdown 
                value={deadline} 
                onFinish={() => setIsExpired(true)} 
                format="ss" 
                valueStyle={{ color: '#fa8c16', fontSize: 20, display: 'inline-block' }}
              />
              <Text type="warning"> giây</Text>
            </div>
          </div>

          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="Mã xác thực (OTP)"
              name="otp"
              rules={[{ required: true, message: 'Vui lòng nhập mã OTP!' }, { len: 6, message: 'OTP phải gồm 6 chữ số!' }]}
            >
              <Input 
                prefix={<KeyOutlined />} 
                placeholder="6 chữ số" 
                size="large" 
                maxLength={6} 
                disabled={isExpired}
              />
            </Form.Item>

            <Form.Item
              label="Mật khẩu mới"
              name="newPassword"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                { min: 8, message: 'Mật khẩu phải từ 8 ký tự!' },
                { 
                  pattern: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\S+$).{8,}$/,
                  message: 'Mật khẩu phải bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt!'
                }
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mạnh (Hoa, thường, số, ký tự đặc biệt)" size="large" />
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu" size="large" />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                size="large" 
                loading={loading}
                disabled={isExpired}
              >
                Xác nhận đổi mật khẩu
              </Button>
            </Form.Item>
          </Form>

          {isExpired && (
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Text type="danger">Mã đã hết hạn. </Text>
              <Button type="link" onClick={handleResend} style={{ padding: 0 }}>Gửi lại mã mới</Button>
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <Link to="/forgot-password">
              <Button type="link" icon={<ArrowLeftOutlined />}>Dùng email khác</Button>
            </Link>
          </div>
        </Card>
      </Content>
    </Layout>
  );
};

export default ResetPasswordPage;
