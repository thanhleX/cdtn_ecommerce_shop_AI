import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Space,
  Typography,
  Select,
  message,
  Tag,
  Button,
  Modal,
  Descriptions,
  Divider,
  List,
  Avatar
} from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import adminApi from '../../../api/adminApi';
import usePermission from '../../../hooks/usePermission';

const { Title, Text } = Typography;
const { Option } = Select;

const OrderStatusMap = {
  PENDING: { color: 'orange', label: 'Chờ xử lý' },
  CONFIRMED: { color: 'blue', label: 'Đã xác nhận' },
  SHIPPING: { color: 'cyan', label: 'Đang giao' },
  COMPLETED: { color: 'green', label: 'Hoàn thành' },
  CANCELLED: { color: 'red', label: 'Đã hủy' },
};

// ✅ Flow hợp lệ
const StatusFlow = {
  PENDING: ['CONFIRMED'],
  CONFIRMED: ['SHIPPING'],
  SHIPPING: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

const OrderManagePage = () => {
  const { hasPermission } = usePermission();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchOrders = useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await adminApi.getOrders({
        page: page - 1,
        size: pageSize,
        sort: 'orderDate,desc'
      });
      const data = response.data || response;
      setOrders(data.content);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: data.totalElements,
      });
    } catch (error) {
      message.error('Không thể lấy danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (id, status) => {
    try {
      await adminApi.updateOrderStatus(id, status);
      message.success('Cập nhật trạng thái thành công');
      fetchOrders(pagination.current);
    } catch (error) {
      message.error(error?.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const showDetail = (order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <Text strong>#{id}</Text>
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'finalAmount',
      key: 'finalAmount',
      render: (amount) => <Text strong>₫{amount?.toLocaleString()}</Text>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const nextStatuses = StatusFlow[status] || [];
        const canUpdateOrder = hasPermission('order:update');

        if (!canUpdateOrder) {
          return (
            <Tag color={OrderStatusMap[status].color}>
              {OrderStatusMap[status].label}
            </Tag>
          );
        }

        return (
          <Select
            value={status}
            style={{ width: 160 }}
            disabled={nextStatuses.length === 0}
            onChange={(val) => handleStatusChange(record.id, val)}
            onClick={(e) => e.stopPropagation()}
          >
            {/* current status */}
            <Option key={status} value={status}>
              <Tag color={OrderStatusMap[status].color}>
                {OrderStatusMap[status].label}
              </Tag>
            </Option>

            {/* next valid status */}
            {nextStatuses.map((key) => (
              <Option key={key} value={key}>
                <Tag color={OrderStatusMap[key].color}>
                  {OrderStatusMap[key].label}
                </Tag>
              </Option>
            ))}
          </Select>
        );
      }
    },
    {
      title: 'Chi tiết',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          ghost
          icon={<EyeOutlined />}
          onClick={() => showDetail(record)}
        >
          Xem
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={3} style={{ marginBottom: 24 }}>Quản lý đơn hàng</Title>

      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={(p) => fetchOrders(p.current, p.pageSize)}
      />

      <Modal
        title={`Chi tiết đơn hàng #${selectedOrder?.id}`}
        open={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => setIsModalVisible(false)}
        width={700}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>
        ]}
      >
        {selectedOrder && (
          <>
            <Table
              title={() => <Text strong>Thông tin khách hàng</Text>}
              bordered
              pagination={false}
              size="small"
              showHeader={false}
              columns={[
                {
                  dataIndex: 'label',
                  width: '30%',
                  render: (text) => <Text strong>{text}</Text>,
                },
                {
                  dataIndex: 'value',
                },
              ]}
              dataSource={[
                {
                  key: 'name',
                  label: 'Tên',
                  value: selectedOrder.customerName,
                },
                {
                  key: 'email',
                  label: 'Email',
                  value: selectedOrder.customerEmail,
                },
                {
                  key: 'date',
                  label: 'Ngày đặt',
                  value: dayjs(selectedOrder.orderDate).format('DD/MM/YYYY HH:mm'),
                },
                {
                  key: 'address',
                  label: 'Địa chỉ',
                  value: selectedOrder.shippingAddress?.fullAddress,
                },
                {
                  key: 'note',
                  label: 'Ghi chú',
                  value: selectedOrder.note || 'Không có ghi chú',
                },
              ]}
            />

            <Divider titlePlacement="left">Sản phẩm đã đặt</Divider>

            <List
              itemLayout="horizontal"
              dataSource={selectedOrder.items}
              renderItem={(item) => (
                <List.Item
                  extra={
                    <Text strong>
                      ₫{(item.price * item.quantity).toLocaleString()}
                    </Text>
                  }
                >
                  <List.Item.Meta
                    avatar={<Avatar shape="square" size={64} src={item.imageUrl} />}
                    title={<Text strong>{item.productName}</Text>}
                    description={
                      <Space orientation="vertical" size={0}>
                        <Text type="secondary">SKU: {item.sku || 'N/A'} | Phân loại: {item.variantAttributes}</Text>
                        <Text>SL: {item.quantity} | Giá: ₫{item.price.toLocaleString()}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />

            <div style={{ marginTop: 24, padding: '16px', background: '#fafafa', borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Tạm tính:</Text>
                <Text>₫{selectedOrder.totalAmount?.toLocaleString()}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Giảm giá:</Text>
                <Text type="danger">-₫{selectedOrder.discountAmount?.toLocaleString() || 0}</Text>
              </div>

              <Divider style={{ margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ fontSize: 16 }}>Tổng thanh toán:</Text>
                <Title level={4} type="danger" style={{ margin: 0 }}>
                  ₫{selectedOrder.finalAmount?.toLocaleString()}
                </Title>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default OrderManagePage;