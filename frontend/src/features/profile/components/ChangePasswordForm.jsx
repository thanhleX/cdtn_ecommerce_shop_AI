import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Space } from 'antd';
import { LockOutlined, KeyOutlined, CheckCircleOutlined } from '@ant-design/icons';
import authApi from '../../../api/authApi';

const { Title, Text } = Typography;

const ChangePasswordForm = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await authApi.changePassword(values);
      message.success('Đổi mật khẩu thành công');
      form.resetFields();
    } catch (error) {
      message.error(error?.message || 'Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card 
      title={<Space><LockOutlined /> <Text strong>Đổi mật khẩu</Text></Space>} 
      style={{ width: '100%', maxWidth: 700, marginLeft: 240 }}
    >
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        Để đảm bảo bảo mật, vui lòng chọn mật khẩu có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
      </Text>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
      >
        <Form.Item
          label="Mật khẩu hiện tại"
          name="oldPassword"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ' }]}
        >
          <Input.Password prefix={<KeyOutlined />} placeholder="Nhập mật khẩu hiện tại" />
        </Form.Item>

        <Form.Item
          label="Mật khẩu mới"
          name="newPassword"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
            { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' }
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới" />
        </Form.Item>

        <Form.Item
          label="Xác nhận mật khẩu mới"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
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
          <Input.Password prefix={<CheckCircleOutlined />} placeholder="Xác nhận lại mật khẩu mới" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: 12 }}>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Cập nhật mật khẩu
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ChangePasswordForm;
