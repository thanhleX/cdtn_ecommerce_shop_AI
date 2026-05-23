import React, { useEffect, useState } from 'react';
import { List, Avatar, Rate, Typography, Button, message, Tooltip, Form, Input, Space } from 'antd';
import { UserOutlined, WarningOutlined, EditOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons';
import reviewApi from '../../../../api/reviewApi';
import useAuthStore from '../../../../store/authStore';

const { Text } = Typography;

const ReviewList = ({ productId, refreshKey, onReviewUpdate, ratingFilter }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 5, total: 0 });

  const { user } = useAuthStore();
  const [editingId, setEditingId] = useState(null);
  const [editForm] = Form.useForm();

  const fetchReviews = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page: page - 1, size: pagination.pageSize };
      if (ratingFilter) {
        params.rating = ratingFilter;
      }
      const res = await reviewApi.getProductReviews(productId, params);
      setReviews(res.data.content);
      setPagination({
        ...pagination,
        current: page,
        total: res.data.totalElements
      });
    } catch (err) {
      message.error('Lỗi khi tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews(1);
    }
  }, [productId, refreshKey, ratingFilter]);

  const handleTableChange = (page) => {
    fetchReviews(page);
  };

  const handleReport = async (reviewId) => {
    try {
      await reviewApi.reportReview(reviewId);
      message.success('Đã báo cáo đánh giá vi phạm');
    } catch (error) {
      message.error('Không thể báo cáo lúc này');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    editForm.setFieldsValue({ rating: item.rating, comment: item.comment });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    editForm.resetFields();
  };

  const handleSubmitEdit = async (values) => {
    try {
      await reviewApi.updateReview(editingId, { ...values, productId });
      message.success('Đã cập nhật đánh giá');
      setEditingId(null);
      fetchReviews(pagination.current);
      if (onReviewUpdate) onReviewUpdate();
    } catch (err) {
      message.error(err.response?.data?.message || 'Không thể cập nhật đánh giá');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(dateString));
  };

  return (
    <List
      loading={loading}
      itemLayout="vertical"
      dataSource={reviews}
      pagination={{
        onChange: handleTableChange,
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: false,
        hideOnSinglePage: true
      }}
      renderItem={(item) => {
        const isOwner = user && user.id === item.userId;
        const canEdit = isOwner && (new Date() - new Date(item.createdAt)) < 24 * 60 * 60 * 1000;

        let actions = [];

        if (!isOwner) {
          actions.push(
            <Tooltip title="Báo cáo vi phạm" key="report">
              <Button type="text" size="small" danger icon={<WarningOutlined />} onClick={() => handleReport(item.id)}
              style={{ display: 'flex', paddingLeft: 40}}>
                Báo cáo
              </Button>
            </Tooltip>
          );
        }

        if (canEdit && editingId !== item.id) {
          actions.unshift(
            <Tooltip title="Sửa đánh giá (trong 24h)" key="edit">
              <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(item)}>
                Sửa
              </Button>
            </Tooltip>
          );
        }

        if (editingId === item.id) {
          actions = [];
        }

        return (
          <List.Item key={item.id} actions={actions} style={{ textAlign: 'left' }}>
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />}
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Text strong>{item.fullName || item.username}</Text>
                  {editingId !== item.id && <Rate disabled defaultValue={item.rating} style={{ fontSize: 14 }} />}
                </div>
              }
              description={
                <div style={{ textAlign: 'left' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {formatDate(item.createdAt)}
                  </Text>
                </div>
              }
            />
            <div style={{ paddingLeft: 48, textAlign: 'left' }}>
              {editingId === item.id ? (
                <Form form={editForm} onFinish={handleSubmitEdit} layout="vertical">
                  <Form.Item name="rating" rules={[{ required: true, message: 'Vui lòng chọn số sao' }]}>
                    <Rate />
                  </Form.Item>
                  <Form.Item name="comment" rules={[{ required: true, message: 'Vui lòng nhập nội dung đánh giá' }]}>
                    <Input.TextArea rows={3} />
                  </Form.Item>
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Space>
                      <Button type="primary" htmlType="submit" icon={<CheckOutlined />}>Lưu</Button>
                      <Button onClick={handleCancelEdit} icon={<CloseOutlined />}>Hủy</Button>
                    </Space>
                  </Form.Item>
                </Form>
              ) : (
                <Text>{item.comment}</Text>
              )}
            </div>
          </List.Item>
        );
      }}
      locale={{ emptyText: 'Chưa có đánh giá nào cho sản phẩm này.' }}
    />
  );
};

export default ReviewList;
