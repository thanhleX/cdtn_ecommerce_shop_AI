import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, message, Card, Popconfirm, Tooltip, Typography, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import attributeApi from '../../../api/attributeApi';

const { Text } = Typography;

const AttributeManagePage = () => {
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState(null);
  const [isValueModalOpen, setIsValueModalOpen] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [form] = Form.useForm();
  const [valueForm] = Form.useForm();

  const fetchAttributes = async () => {
    setLoading(true);
    try {
      const res = await attributeApi.getAllAttributes();
      setAttributes(res.data || []);
    } catch (error) {
      message.error(error?.message || 'Không thể tải danh sách thuộc tính');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  const handleOpenModal = (attr = null) => {
    if (attr) {
      setIsEditMode(true);
      setEditingAttribute(attr);
      form.setFieldsValue(attr);
    } else {
      setIsEditMode(false);
      setEditingAttribute(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (isEditMode) {
        await attributeApi.updateAttribute(editingAttribute.id, values);
        message.success('Cập nhật thuộc tính thành công');
      } else {
        await attributeApi.createAttribute(values);
        message.success('Tạo thuộc tính thành công');
      }
      setIsModalOpen(false);
      form.resetFields();
      fetchAttributes();
    } catch (error) {
      message.error(error?.message || 'Lỗi thao tác thuộc tính');
    }
  };

  const handleDeleteAttribute = async (id) => {
    try {
      await attributeApi.deleteAttribute(id);
      message.success('Xóa thuộc tính thành công');
      fetchAttributes();
    } catch (error) {
      message.error(error?.message || 'Không thể xóa thuộc tính (có thể đang được sử dụng)');
    }
  };

  const handleAddValue = async (values) => {
    try {
      await attributeApi.addAttributeValue({
        attributeId: selectedAttribute.id,
        value: values.value
      });
      message.success('Thêm giá trị thành công');
      setIsValueModalOpen(false);
      valueForm.resetFields();
      fetchAttributes();
    } catch (error) {
      message.error(error?.message || 'Lỗi khi thêm giá trị');
    }
  };

  const handleDeleteValue = async (valueId) => {
    try {
      await attributeApi.deleteAttributeValue(valueId);
      message.success('Xóa giá trị thành công');
      fetchAttributes();
    } catch (error) {
      message.error(error?.message || 'Không thể xóa giá trị này');
    }
  };

  const columns = [
    {
      title: 'Tên thuộc tính',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>
    },
    {
      title: 'Dùng để lọc',
      dataIndex: 'isFilterable',
      key: 'isFilterable',
      render: (val) => (val ? <Tag color="green">Có</Tag> : <Tag color="red">Không</Tag>),
    },
    {
      title: 'Ảnh hưởng giá',
      dataIndex: 'isPricing',
      key: 'isPricing',
      render: (val) => (val ? <Tag color="gold">Có</Tag> : <Tag color="default">Không</Tag>),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Quản lý giá trị">
            <Button 
              icon={<PlusOutlined />} 
              onClick={() => {
                setSelectedAttribute(record);
                setIsValueModalOpen(true);
              }}
            >
              Giá trị
            </Button>
          </Tooltip>
          <Tooltip title="Chỉnh sửa thuộc tính">
            <Button 
              type="primary"
              ghost
              icon={<EditOutlined />} 
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa thuộc tính này?"
            description="Lưu ý: Bạn không thể xóa nếu thuộc tính đang được gắn vào sản phẩm hoặc danh mục."
            onConfirm={() => handleDeleteAttribute(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button 
              danger 
              icon={<DeleteOutlined />} 
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card title="Quản lý thuộc tính sản phẩm" extra={
      <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
        Thêm thuộc tính
      </Button>
    }>
      <Table 
        columns={columns} 
        dataSource={attributes} 
        rowKey="id" 
        loading={loading}
      />

      {/* Modal Thêm/Sửa Thuộc Tính */}
      <Modal
        title={isEditMode ? "Chỉnh sửa thuộc tính" : "Thêm thuộc tính mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Tên thuộc tính (VD: RAM, Màu sắc)" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="isFilterable" label="Sử dụng để lọc?" valuePropName="checked" initialValue={true}>
            <Select showSearch optionFilterProp="children" filterOption={(input, option) => (option?.children ?? '').toString().toLowerCase().includes(input.toLowerCase())}>
              <Select.Option value={true}>Có</Select.Option>
              <Select.Option value={false}>Không</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="isPricing" label="Có ảnh hưởng đến giá tiền?" valuePropName="checked" initialValue={false}>
            <Select showSearch optionFilterProp="children" filterOption={(input, option) => (option?.children ?? '').toString().toLowerCase().includes(input.toLowerCase())}>
              <Select.Option value={true}>Có (Làm thay đổi giá)</Select.Option>
              <Select.Option value={false}>Không (Giá cố định)</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Quản lý Giá Trị */}
      <Modal
        title={`Quản lý giá trị: ${selectedAttribute?.name}`}
        open={isValueModalOpen}
        onCancel={() => {
          setIsValueModalOpen(false);
          valueForm.resetFields();
        }}
        footer={null}
        width={400}
      >
        <div style={{ marginBottom: 20 }}>
          <Text type="secondary">Danh sách giá trị hiện tại:</Text>
          <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {selectedAttribute?.values?.length === 0 && <Text italic>Chưa có giá trị nào</Text>}
            {selectedAttribute?.values?.map(v => (
              <Tag 
                key={v.id} 
                closable 
                onClose={(e) => {
                  e.preventDefault();
                  handleDeleteValue(v.id);
                  // Cập nhật local state để UI mượt mà hơn
                  const updatedAttrs = attributes.map(attr => {
                    if (attr.id === selectedAttribute.id) {
                      return {
                        ...attr,
                        values: attr.values.filter(val => val.id !== v.id)
                      };
                    }
                    return attr;
                  });
                  setAttributes(updatedAttrs);
                  setSelectedAttribute(updatedAttrs.find(a => a.id === selectedAttribute.id));
                }}
                color="blue"
              >
                {v.value}
              </Tag>
            ))}
          </div>
        </div>

        <Divider>Thêm giá trị mới</Divider>
        
        <Form form={valueForm} layout="inline" onFinish={handleAddValue} style={{ justifyContent: 'center' }}>
          <Form.Item name="value" rules={[{ required: true, message: 'Nhập giá trị' }]}>
            <Input placeholder="VD: 8GB, Đỏ..." style={{ width: 200 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
              Thêm
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default AttributeManagePage;
