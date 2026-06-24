import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, message, Tabs, Typography, Rate, Popconfirm } from 'antd';
import { CheckCircleOutlined, StopOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import adminApi from '../../../api/adminApi';

const { Title } = Typography;

const ReviewManagePage = () => {

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState(''); // Rỗng là lấy tất cả
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchReviews = async (page = 1, status = '') => {
    setLoading(true);
    try {
      const params = { page: page - 1, size: pagination.pageSize };
      if (status) {
        params.status = status;
      }
      const res = await adminApi.getReviews(params);
      setReviews(res.data.content);
      setPagination({
        ...pagination,
        current: page,
        total: res.data.totalElements,
      });
    } catch (error) {
      message.error('Lỗi tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1, statusFilter);
  }, [statusFilter]);

  const handleTableChange = (paginationConfig) => {
    fetchReviews(paginationConfig.current, statusFilter);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await adminApi.updateReviewStatus(id, newStatus);
      message.success('Cập nhật trạng thái thành công');
      fetchReviews(pagination.current, statusFilter);
    } catch (error) {
      message.error('Cập nhật thất bại');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => record.fullName || text
    },
    {
      title: 'Đánh giá',
      key: 'rating',
      width: 150,
      render: (_, record) => <Rate disabled defaultValue={record.rating} style={{ fontSize: 14 }} />
    },
    {
      title: 'Nội dung',
      dataIndex: 'comment',
      key: 'comment',
      width: '35%',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'green';
        let text = 'Hiển thị';
        if (status === 'REPORTED') {
          color = 'orange';
          text = 'Bị báo cáo';
        } else if (status === 'HIDDEN') {
          color = 'red';
          text = 'Đã ẩn';
        }
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      }).format(new Date(date))
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {record.status !== 'ACTIVE' && (
            <Popconfirm title="Bạn có chắc muốn hiển thị lại đánh giá này?" onConfirm={() => handleUpdateStatus(record.id, 'ACTIVE')}>
              <Button type="primary" size="small" icon={<CheckCircleOutlined />}>Phục hồi</Button>
            </Popconfirm>
          )}
          {record.status !== 'HIDDEN' && (
            <Popconfirm title="Bạn có chắc muốn ẩn đánh giá này?" onConfirm={() => handleUpdateStatus(record.id, 'HIDDEN')} okType="danger">
              <Button danger size="small" icon={<StopOutlined />}>Ẩn</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];



  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Quản lý đánh giá</Title>
      </div>

      <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
        <Tabs
          defaultActiveKey=""
          onChange={(key) => setStatusFilter(key)}
          items={[
            { label: 'Tất cả', key: '' },
            { label: <span style={{ color: '#52c41a' }}>Đang hiển thị</span>, key: 'ACTIVE' },
            { label: <span style={{ color: '#faad14' }}><ExclamationCircleOutlined /> Bị báo cáo</span>, key: 'REPORTED' },
            { label: <span style={{ color: '#f5222d' }}>Đã ẩn</span>, key: 'HIDDEN' }
          ]}
        />
        <Table
          columns={columns}
          dataSource={reviews}
          rowKey="id"
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
        />
      </div>
    </div>
  );
};

export default ReviewManagePage;
