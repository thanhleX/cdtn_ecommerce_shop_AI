import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Modal, Form, Input, message, Tag, Space, Popconfirm, Checkbox } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined } from '@ant-design/icons';
import addressApi from '../../../api/addressApi';

const { Text } = Typography;

const AddressManager = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [form] = Form.useForm();

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const response = await addressApi.getAddresses();
      setAddresses(response.data || []);
    } catch (error) {
      message.error(error?.message || 'Không thể tải danh sách địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const showModal = (address = null) => {
    setEditingAddress(address);

    if (address) {
      form.setFieldsValue({
        fullName: address.receiverName,
        phone: address.phone,
        fullAddress: address.fullAddress,
        isDefault: address.isDefault,
      });
    } else {
      form.resetFields();
    }

    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingAddress(null);
  };

  const onFinish = async (values) => {
    try {
      const payload = {
        receiverName: values.fullName,
        phone: values.phone,
        fullAddress: values.fullAddress,
        isDefault: values.isDefault || false,
      };

      if (editingAddress) {
        await addressApi.updateAddress(editingAddress.id, payload);
        message.success('Cập nhật địa chỉ thành công');
      } else {
        await addressApi.createAddress(payload);
        message.success('Thêm địa chỉ mới thành công');
      }

      handleCancel();
      fetchAddresses();
    } catch (error) {
      message.error(error?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    try {
      await addressApi.deleteAddress(id);
      message.success('Xóa địa chỉ thành công');
      fetchAddresses();
    } catch (error) {
      message.error(error?.message || 'Không thể xóa địa chỉ');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>Sổ địa chỉ</Typography.Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Thêm địa chỉ mới
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {addresses.length === 0 ? (
          <Text type="secondary">Bạn chưa có địa chỉ nào</Text>
        ) : (
          addresses.map((item) => (
            <Card
              key={item.id}
              size="small"
              actions={[
                <Button type="text" icon={<EditOutlined />} onClick={() => showModal(item)}>Sửa</Button>,
                <Popconfirm
                  title="Bạn có chắc chắn muốn xóa địa chỉ này?"
                  onConfirm={() => handleDelete(item.id)}
                >
                  <Button type="text" danger icon={<DeleteOutlined />}>Xóa</Button>
                </Popconfirm>
              ]}
            >
              <div style={{ display: 'flex', gap: 12 }}>
                <EnvironmentOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                <div>
                  <Space>
                    <Text strong>{item.receiverName}</Text>
                    <Text type="secondary">|</Text>
                    <Text type="secondary">{item.phone}</Text>
                    {item.isDefault && <Tag color="blue">Mặc định</Tag>}
                  </Space>
                  <br />
                  <Text type="secondary">{item.fullAddress}</Text>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal
        title={editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ isDefault: false }}>
          <Form.Item
            label="Họ và tên"
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Địa chỉ đầy đủ"
            name="fullAddress"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input placeholder="Ví dụ: 123 Đường ABC, Quận X, TP Y" />
          </Form.Item>

          <Form.Item name="isDefault" valuePropName="checked">
            <Checkbox>Đặt làm địa chỉ mặc định</Checkbox>
          </Form.Item>

          <Form.Item style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit">Lưu</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AddressManager;