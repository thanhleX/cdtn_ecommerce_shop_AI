import { useState, useEffect, useCallback } from 'react';
import { 
  Table, Typography, Button, message, Space, Card, Modal, Form, Input, Checkbox, 
  Tag, Row, Col, Popconfirm
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import adminApi from '../../../api/adminApi';
import usePermission from '../../../hooks/usePermission';

const { Title } = Typography;

const RoleManagePage = () => {
  const { hasPermission } = usePermission();
  const canManageRole = hasPermission('role:manage');
  
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [roleRes, permRes] = await Promise.all([
        adminApi.getRoles(),
        adminApi.getPermissions()
      ]);
      setRoles(roleRes.data || []);
      setPermissions(permRes.data || []);
    } catch (error) {
      // message.error('Không thể load dữ liệu Roles / Permissions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = () => {
    setEditingRole(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRole(record);
    form.setFieldsValue({
      name: record.name,
      permissions: record.permissions, // array of strings
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteRole(id);
      message.success('Xóa vai trò thành công');
      fetchData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể xóa vai trò này');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingRole) {
        await adminApi.updateRole(editingRole.id, values);
        message.success('Cập nhật vai trò thành công');
      } else {
        await adminApi.createRole(values);
        message.success('Tạo vai trò thành công');
      }
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      if (error?.response?.data?.message) {
        message.error(error.response.data.message);
      }
    }
  };

  const columns = [
    {
      title: 'Tên Vai tró',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Quyền hạn (Permissions)',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (perms) => (
        <Space size={[0, 8]} wrap>
          {perms && perms.map((p) => <Tag color="blue" key={p}>{p}</Tag>)}
        </Space>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            disabled={!canManageRole || record.name === 'ROLE_ADMIN' || record.name === 'ROLE_CUSTOMER'}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa vai trò này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            disabled={!canManageRole || record.name === 'ROLE_ADMIN' || record.name === 'ROLE_CUSTOMER'}
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              disabled={!canManageRole || record.name === 'ROLE_ADMIN' || record.name === 'ROLE_CUSTOMER'}
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={<Title level={4}>Quản lý Phân Quyền (Roles)</Title>}
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAdd}
            disabled={!canManageRole}
          >
            Tạo vai trò
          </Button>
        }
      >
        <Table 
          columns={columns} 
          dataSource={roles} 
          rowKey="id" 
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal
        title={editingRole ? "Sửa Vai Trò" : "Tạo Vai Trò Mới"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên vai trò (Ví dụ: EDITOR, STAFF_MARKETING - Tiền tố ROLE_ sẽ tự thêm)"
            rules={[{ required: true, message: 'Vui lòng nhập tên vai trò' }]}
          >
            <Input disabled={editingRole != null} />
          </Form.Item>
          
          <Form.Item
            name="permissions"
            label="Chọn Quyền hạn"
          >
            <Checkbox.Group style={{ width: '100%' }}>
              <Row gutter={[16, 16]}>
                {permissions.map((p) => (
                  <Col span={12} key={p.name}>
                    <Checkbox value={p.name}>
                      {p.name} <br/>
                      <span style={{ fontSize: '12px', color: 'gray' }}>{p.description}</span>
                    </Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoleManagePage;
