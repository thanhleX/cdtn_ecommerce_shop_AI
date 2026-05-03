import { useState, useEffect, useCallback } from 'react';
import {
  Table, Typography, Switch, message, Space, Avatar, Card
} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import adminApi from '../../../api/adminApi';
import usePermission from '../../../hooks/usePermission';

const { Title, Text } = Typography;

const UserManagePage = () => {
  const { hasPermission } = usePermission();
  const canManageCustomer = hasPermission('customer:manage') || hasPermission('user:manage');

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchUsers = useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await adminApi.getUsers({ page: page - 1, size: pageSize });
      const data = response.data || response;

      const customerList = data.content.filter(u =>
        !u.roles || u.roles.length === 0 || (u.roles.length === 1 && u.roles[0] === 'ROLE_CUSTOMER')
      );

      setUsers(customerList);
      setPagination({ current: page, pageSize: pageSize, total: customerList.length });
    } catch (error) {
      message.error(error?.message || 'Không thể lấy danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleActive = async (id) => {
    try {
      await adminApi.toggleUserActive(id);
      message.success('Cập nhật trạng thái khách hàng thành công');
      fetchUsers(pagination.current);
    } catch (error) {
      message.error(error?.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const columns = [
    {
      title: 'Khách hàng',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} src={record.avatarUrl} />
          <div>
            <Text strong>{record.username}</Text>
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
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Ngày tham gia',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active, record) => {
        if (!canManageCustomer) {
          return <Tag color={active ? 'green' : 'red'}>{active ? 'Bật' : 'Chặn'}</Tag>;
        }
        return (
          <Switch
            checked={active}
            onChange={() => handleToggleActive(record.id)}
            checkedChildren="Bật"
            unCheckedChildren="Chặn"
          />
        );
      }
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={<Title level={3} style={{ marginBottom: 0 }}>Quản lý Khách hàng</Title>}
      >
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={(p) => fetchUsers(p.current, p.pageSize)}
        />
      </Card>
    </div>
  );
};

export default UserManagePage;
