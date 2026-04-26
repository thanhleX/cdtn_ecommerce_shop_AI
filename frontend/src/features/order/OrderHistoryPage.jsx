import { useEffect, useState } from 'react';
import {
  Table,
  Tag,
  Button,
  Typography,
  Space,
  Modal,
  Descriptions,
  Divider,
  List,
  Avatar,
  message,
  Popconfirm,
} from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useOrders } from '../../hooks/useOrders';
import orderApi from '../../api/orderApi';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const statusColorMap = {
  PENDING: 'orange',
  CONFIRMED: 'blue',
  SHIPPING: 'cyan',
  COMPLETED: 'green',
  CANCELLED: 'red',
};

const statusTextMap = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao hàng',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

const OrderHistoryPage = () => {
  const { orders, loading, pagination, fetchOrders } = useOrders();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [open, setOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchOrders({ page: 1, size: 10 });
  }, []);

  const handleTableChange = (pag) => {
    fetchOrders({ page: pag.current, size: pag.pageSize });
  };

  // ✅ Lấy chi tiết đơn hàng
  const showDetail = async (order) => {
    setDetailLoading(true);
    try {
      const res = await orderApi.getById(order.id);
      const data = res.data || res;
      setSelectedOrder(data);
      setOpen(true);
    } catch (err) {
      message.error('Không thể tải chi tiết đơn hàng');
    } finally {
      setDetailLoading(false);
    }
  };

  // ✅ Hủy đơn
  const handleCancel = async (id) => {
    try {
      await orderApi.cancelOrder(id);
      message.success('Đã hủy đơn hàng');
      fetchOrders({ page: pagination.current, size: pagination.pageSize });
    } catch (err) {
      message.error('Không thể hủy đơn');
    }
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      render: (id) => <Text strong>#ORD-{id}</Text>,
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'orderDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Tổng thanh toán',
      dataIndex: 'finalAmount',
      render: (val) => (
        <Text strong type="danger">
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(val)}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={statusColorMap[status]}>
          {statusTextMap[status]}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => showDetail(record)}
          >
            Chi tiết
          </Button>

          {record.status === 'PENDING' && (
            <Popconfirm
              title="Bạn có chắc muốn hủy đơn này?"
              onConfirm={() => handleCancel(record.id)}
            >
              <Button danger size="small">Hủy</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 12 }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        Lịch sử đơn hàng
      </Title>

      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />

      <Modal
        title={`Chi tiết đơn hàng #${selectedOrder?.id}`}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={700}
        confirmLoading={detailLoading}
      >
        {selectedOrder && (
          <>
            <Table
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
                  key: 'date',
                  label: 'Ngày đặt',
                  value: dayjs(selectedOrder.createdAt).format('DD/MM/YYYY HH:mm'),
                },
                {
                  key: 'status',
                  label: 'Trạng thái',
                  value: (
                    <Tag color={statusColorMap[selectedOrder.status]}>
                      {statusTextMap[selectedOrder.status]}
                    </Tag>
                  ),
                },
                {
                  key: 'address',
                  label: 'Địa chỉ',
                  value: selectedOrder.shippingAddress?.fullAddress,
                },
                {
                  key: 'note',
                  label: 'Ghi chú',
                  value: selectedOrder.note || 'Không có',
                },
              ]}
            />

            <Divider />

            <div>
              {selectedOrder.items?.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar src={item.imageUrl} size={48} />
                    <div>
                      <Text strong style={{ display: 'block' }}>{item.productName}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>{item.variantAttributes || 'Mặc định'}</Text>
                      <div style={{ fontSize: 13, marginTop: 4 }}>Số lượng: {item.quantity}</div>
                    </div>
                  </div>

                  <Text strong>
                    ₫{(item.price * item.quantity).toLocaleString()}
                  </Text>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24, padding: '16px', background: '#fafafa', borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Tạm tính:</Text>
                <Text>₫{selectedOrder.totalAmount?.toLocaleString()}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Giảm giá:</Text>
                <Text type="danger">-₫{selectedOrder.discountAmount?.toLocaleString() || 0}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Phí giao hàng:</Text>
                <Text>₫{selectedOrder.shippingFee?.toLocaleString() || 0}</Text>
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

export default OrderHistoryPage;