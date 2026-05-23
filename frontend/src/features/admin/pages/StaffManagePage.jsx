import { useState, useEffect, useCallback } from 'react';
import { 
  Table, Typography, Switch, message, Tag, Space, Avatar, Card, Button, Modal, Form, Input, Select, Popconfirm, Tooltip
} from 'antd';
import { UserOutlined, PlusOutlined, EditOutlined, LockOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import adminApi from '../../../api/adminApi';
import usePermission from '../../../hooks/usePermission';

const { Title, Text } = Typography;

const StaffManagePage = () => {
  const { hasPermission } = usePermission();
  const canManageStaff = hasPermission('staff:manage') || hasPermission('user:manage');
  
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [keyword, setKeyword] = useState('');
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const fetchUsers = useCallback(async (page = 1, pageSize = 10, searchKw = keyword) => {
    setLoading(true);
    try {
      const response = await adminApi.getUsers({ page: page - 1, size: pageSize, keyword: searchKw });
      const data = response.data || response;
      
      const staffList = data.content.filter(u => 
        u.roles && u.roles.some(r => r !== 'ROLE_CUSTOMER')
      );

      setUsers(staffList);
      setPagination({ current: page, pageSize: pageSize, total: staffList.length });
    } catch (error) {
      message.error(error?.message || 'Không thể lấy danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  const fetchRoles = useCallback(async () => {
    try {
      const { data } = await adminApi.getRoles();
      setRoles(data || []);
    } catch (error) {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  const handleToggleActive = async (id) => {
    try {
      await adminApi.toggleUserActive(id);
      message.success('Cập nhật trạng thái thành công');
      fetchUsers(pagination.current);
    } catch (error) {
      message.error(error?.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const handleShowCreateModal = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleCreateStaff = async () => {
    try {
      const values = await form.validateFields();
      await adminApi.createStaff(values);
      message.success('Tạo tài khoản nhân viên thành công');
      setIsModalVisible(false);
      fetchUsers(1);
    } catch (error) {
      message.error(error?.message || 'Lỗi khi tạo nhân viên');
    }
  };

  const handleShowEditModal = (user) => {
    setEditingUser(user);
    // Lấy ID của các role hiện tại
    const currentRoleIds = roles
      .filter(r => user.roles?.includes(r.name))
      .map(r => r.id);
    
    editForm.setFieldsValue({ roleIds: currentRoleIds });
    setIsEditModalVisible(true);
  };

  const handleUpdateRoles = async () => {
    try {
      const values = await editForm.validateFields();
      await adminApi.updateUserRoles(editingUser.id, values.roleIds);
      message.success('Cập nhật vai trò thành công');
      setIsEditModalVisible(false);
      fetchUsers(pagination.current);
    } catch (error) {
      message.error(error?.message || 'Không thể cập nhật vai trò');
    }
  };

  const handleResetPassword = async (userId) => {
    try {
      await adminApi.resetUserPassword(userId);
      message.success('Đã đặt lại mật khẩu về mặc định: Staff@123');
    } catch (error) {
      message.error(error?.message || 'Lỗi khi đặt lại mật khẩu');
    }
  };

  const columns = [
    {
      title: 'Nhân viên',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} src={record.avatarUrl} />
          <div>
            <Text strong>{record.username}</Text>
            {record.username === 'admin' && <Tag color="gold" style={{ marginLeft: 8 }}>System</Tag>}
            <br />
            <Text type="secondary" size="small">{record.email}</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Vai trò',
      dataIndex: 'roles',
      key: 'roles',
      render: (roleArray) => (
        <Space wrap>
          {roleArray?.map((r) => (
            <Tag color={r === 'ROLE_ADMIN' ? 'red' : 'blue'} key={r}>
              {r}
            </Tag>
          ))}
        </Space>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active, record) => (
        <Switch 
          checked={active} 
          disabled={!canManageStaff || record.username === 'admin'}
          onChange={() => handleToggleActive(record.id)}
          checkedChildren="Bật"
          unCheckedChildren="Chặn"
        />
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {canManageStaff && record.username !== 'admin' && (
            <>
              <Tooltip title="Sửa Vai Trò">
                <Button 
                  type="text" 
                  icon={<EditOutlined />} 
                  onClick={() => handleShowEditModal(record)}
                />
              </Tooltip>
              
              <Popconfirm
                title="Đặt lại mật khẩu?"
                description="Mật khẩu sẽ được reset về mặc định: Staff@123"
                onConfirm={() => handleResetPassword(record.id)}
                okText="Đồng ý"
                cancelText="Hủy"
              >
                <Tooltip title="Reset Password">
                  <Button 
                    type="text" 
                    danger 
                    icon={<LockOutlined />} 
                  />
                </Tooltip>
              </Popconfirm>
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title={<Title level={3} style={{ marginBottom: 0 }}>Quản lý Nhân viên</Title>}
        extra={
          <Space>
            <Input.Search
              placeholder="Tìm theo tên, vai trò..."
              allowClear
              onSearch={(value) => setKeyword(value)}
              style={{ width: 250 }}
            />
            {canManageStaff && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleShowCreateModal}
              >
                Thêm Nhân Viên
              </Button>
            )}
          </Space>
        }
      >
        <Table 
          columns={columns} 
          dataSource={users} 
          rowKey="id" 
          loading={loading}
          pagination={pagination}
          onChange={(p) => fetchUsers(p.current, p.pageSize, keyword)}
        />
      </Card>

      {/* Modal: Tạo mới */}
      <Modal
        title="Tạo Nhân Viên Mới"
        open={isModalVisible}
        onOk={handleCreateStaff}
        onCancel={() => setIsModalVisible(false)}
        okText="Tạo tài khoản"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="fullName" label="Họ tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="roleIds" label="Gán vai trò" rules={[{ required: true, message: 'Chọn ít nhất 1 role' }]}>
            <Select mode="multiple" placeholder="Chọn vai trò">
              {roles.map((r) => (
                <Select.Option key={r.id} value={r.id}>{r.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal: Sửa Roles */}
      <Modal
        title={`Cập nhật Vai trò: ${editingUser?.username}`}
        open={isEditModalVisible}
        onOk={handleUpdateRoles}
        onCancel={() => setIsEditModalVisible(false)}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="roleIds" label="Chọn vai trò mới" rules={[{ required: true, message: 'Phải gán ít nhất 1 role' }]}>
            <Select mode="multiple" placeholder="Chọn vai trò">
              {roles.map((r) => (
                <Select.Option key={r.id} value={r.id}>{r.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StaffManagePage;
