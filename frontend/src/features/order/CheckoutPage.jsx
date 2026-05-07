import { useEffect, useState } from 'react';
import { Tag, Form, Input, Button, Typography, Radio, Row, Col, Divider, Select, message, Empty, Space } from 'antd';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { PlusOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useCart } from '../../hooks/useCart';
import { useOrders } from '../../hooks/useOrders';
import paymentMethodApi from '../../api/paymentMethodApi';
import addressApi from '../../api/addressApi';
import voucherApi from '../../api/voucherApi';
import paymentServiceApi from '../../api/paymentServiceApi';
import useAuthStore from '../../store/authStore';

const { Title, Text } = Typography;

const CheckoutPage = () => {
  const { cart, items, fetchCart } = useCart();
  const { placeOrder, loading: placingOrder } = useOrders();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedCartItemIds = location.state?.selectedCartItemIds || [];

  const { user: currentUser } = useAuthStore();

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);

  // Voucher state
  const [voucherCode, setVoucherCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState(null);
  const [validatingVoucher, setValidatingVoucher] = useState(false);

  useEffect(() => {
    fetchCart();

    // Fetch payment methods
    const fetchPMs = async () => {
      try {
        const res = await paymentMethodApi.getPaymentMethods();
        const data = res.data || res;
        setPaymentMethods(data || []);
        if (data?.length > 0) {
          form.setFieldValue('paymentMethodId', data[0].id);
        }
      } catch (err) {
        console.error('Failed to load payment methods');
      }
    };

    // Fetch addresses
    const fetchAddresses = async () => {
      setAddressLoading(true);
      try {
        const res = await addressApi.getAddresses();
        const data = res.data || res;
        setAddresses(data || []);

        // Set default address if exists
        if (data?.length > 0) {
          const defaultAddr = data.find(a => a.isDefault) || data[0];
          form.setFieldValue('addressId', defaultAddr.id);
        }
      } catch (err) {
        console.error('Failed to load addresses');
        message.error('Không thể tải danh sách địa chỉ');
      } finally {
        setAddressLoading(false);
      }
    };

    fetchPMs();
    fetchAddresses();
  }, [fetchCart, form]);

  const checkoutItems = selectedCartItemIds.length > 0
    ? items.filter(item => selectedCartItemIds.includes(item.id))
    : items;

  if (checkoutItems.length === 0) {
    return (
      <div style={{ padding: 100, textAlign: 'center' }}>
        <Title level={3}>Không có sản phẩm nào được chọn để thanh toán.</Title>
        <Button type="primary" onClick={() => navigate('/cart')}>Quay lại giỏ hàng</Button>
      </div>
    );
  }

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      message.warning('Vui lòng nhập mã giảm giá');
      return;
    }

    setValidatingVoucher(true);
    try {
      const res = await voucherApi.validate({
        code: voucherCode,
        userId: currentUser?.id,
        orderValue: totalPrice
      });
      const data = res.data || res;
      setDiscountInfo(data);
      message.success('Áp dụng mã giảm giá thành công!');
    } catch (error) {
      console.error('Voucher validation failed', error);
      message.error(error?.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn');
      setDiscountInfo(null);
    } finally {
      setValidatingVoucher(false);
    }
  };

  const onFinish = async (values) => {
    if (!values.addressId) {
      message.warning('Vui lòng chọn hoặc thêm địa chỉ giao hàng');
      return;
    }

    try {
      const orderData = {
        paymentMethodId: values.paymentMethodId,
        addressId: values.addressId,
        note: values.note,
        voucherCode: discountInfo ? discountInfo.voucher.code : null,
        cartItemIds: selectedCartItemIds
      };

      // Đặt hàng
      const orderRes = await placeOrder(orderData);
      const order = orderRes.data || orderRes;

      // 2. Chuyển hướng theo phương thức thanh toán
      if (values.paymentMethodId === 2) {
        // VNPay Flow
        try {
          const finalPrice = totalPrice - (discountInfo?.discount || 0);
          const paymentRes = await paymentServiceApi.createUrl({
            amount: finalPrice,
            orderInfo: `Thanh toan don hang #${order.id}`,
            bankCode: "",
            language: "vn",
            // Đảm bảo URL này khớp với URL đăng ký trong VNPay Merchant Admin hoặc được backend service hỗ trợ
            returnUrl: `${window.location.origin}/payment-return`
          });

          if (paymentRes.data) {
            window.location.href = paymentRes.data;
          } else {
            // Nếu không lấy được URL, coi như lỗi hệ thống thanh toán nhưng đơn hàng vẫn đã tạo
            navigate('/order-success', { state: { order } });
          }
        } catch (paymentErr) {
          console.error('VNPay service error:', paymentErr);
          message.error('Dịch vụ VNPay hiện đang bảo trì. Anh có thể xem lại đơn hàng trong trang cá nhân nhé!');
          navigate('/order-success', { state: { order } });
        }
      } else {
        // COD / Other methods
        navigate('/order-success', { state: { order } });
      }
    } catch (error) {
      // Error handles in hook
    }
  };

  const totalPrice = checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="checkout-page">
      <Title level={2} style={{ marginBottom: 32 }}>Thanh Toán</Title>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[48, 24]}>
          <Col xs={24} lg={14}>
            <div style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #f0f0f0', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>
                  <EnvironmentOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  Địa chỉ giao hàng
                </Title>
                <Link to="/profile">
                  <Button type="link" icon={<PlusOutlined />}>Thêm địa chỉ mới</Button>
                </Link>
              </div>

              {addresses.length > 0 ? (
                <Form.Item
                  name="addressId"
                  rules={[{ required: true, message: 'Vui lòng chọn địa chỉ' }]}
                >
                  <Select
                    placeholder="Chọn địa chỉ giao hàng"
                    loading={addressLoading}
                    size="large"
                    style={{ width: '100%' }}
                  >
                    {addresses.map(addr => (
                      <Select.Option key={addr.id} value={addr.id}>
                        <div style={{ padding: '4px 0' }}>
                          <Text strong>{addr.receiverName} ({addr.phone})</Text>
                          <br />
                          <Text type="secondary" size="small">
                            {addr.fullAddress}
                            {addr.isDefault && <Text type="success" style={{ marginLeft: 8 }}>(Mặc định)</Text>}
                          </Text>
                        </div>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span>Anh chưa có địa chỉ giao hàng nào. <Link to="/profile">Thêm ngay!</Link></span>
                  }
                />
              )}

              <Form.Item name="note" label="Ghi chú đơn hàng" style={{ marginTop: 24 }}>
                <Input.TextArea rows={3} placeholder="Ghi chú cho người giao hàng..." />
              </Form.Item>
            </div>

            <div style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #f0f0f0' }}>
              <Title level={4} style={{ marginBottom: 24 }}>Phương thức thanh toán</Title>
              <Form.Item name="paymentMethodId" rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán' }]}>
                <Radio.Group style={{ width: '100%' }}>
                  <Space orientation="vertical" style={{ width: '100%' }}>
                    {paymentMethods.length > 0 ? paymentMethods.map(pm => (
                      <Radio key={pm.id} value={pm.id} style={{
                        width: '100%',
                        padding: '16px',
                        border: '1px solid #f0f0f0',
                        borderRadius: '12px',
                        marginBottom: '12px',
                        transition: 'all 0.3s ease'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {pm.image && (
                            <img
                              src={pm.image}
                              alt={pm.name}
                              style={{ width: 40, height: 40, objectFit: 'contain', marginRight: 16, borderRadius: 4 }}
                            />
                          )}
                          <div style={{ textAlign: 'left' }}>
                            <Text strong style={{ fontSize: 16 }}>{pm.name}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: '13px' }}>
                              {pm.description || 'Thanh toán an toàn và bảo mật'}
                            </Text>
                          </div>
                        </div>
                      </Radio>
                    )) : (
                      <div style={{ padding: 16, background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 8 }}>
                        Đang tải phương thức thanh toán...
                      </div>
                    )}
                  </Space>
                </Radio.Group>
              </Form.Item>
            </div>
          </Col>

          <Col xs={24} lg={10}>
            <div style={{ background: '#fafafa', padding: 32, borderRadius: 12, border: '1px solid #f0f0f0', position: 'sticky', top: 24 }}>
              <Title level={4}>Chi tiết đơn hàng</Title>
              <Divider />

              {checkoutItems.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ flex: 1, paddingRight: 16 }}>
                    <Text style={{ display: 'block' }}>{item.productName}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.variantAttributes || 'Mặc định'} (x{item.quantity})
                    </Text>
                  </div>
                  <Text strong>
                    {new Intl.NumberFormat('vi-VN').format(item.price * item.quantity)}đ
                  </Text>
                </div>
              ))}

              <Divider />
              {/* Voucher Section */}
              <div style={{ margin: '20px 0' }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Mã giảm giá</Text>
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    placeholder="Nhập mã voucher..."
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    disabled={!!discountInfo}
                  />
                  {!discountInfo ? (
                    <Button
                      type="primary"
                      onClick={handleApplyVoucher}
                      loading={validatingVoucher}
                    >
                      Áp dụng
                    </Button>
                  ) : (
                    <Button
                      danger
                      onClick={() => {
                        setDiscountInfo(null);
                        setVoucherCode('');
                      }}
                    >
                      Hủy dùng
                    </Button>
                  )}
                </Space.Compact>
                {discountInfo && (
                  <div style={{ marginTop: 8 }}>
                    <Tag color="green" closable onClose={() => { setDiscountInfo(null); setVoucherCode(''); }}>
                      Mã: {discountInfo.voucher.code} (Giảm {discountInfo.voucher.type === 'PERCENT' ? `${discountInfo.voucher.value}%` : `${new Intl.NumberFormat('vi-VN').format(discountInfo.voucher.value)}đ`})
                    </Tag>
                  </div>
                )}
              </div>

              {discountInfo && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                  <Text>Giảm giá:</Text>
                  <Text type="danger" strong>-{new Intl.NumberFormat('vi-VN').format(discountInfo.discount)}đ</Text>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32, background: '#fff', padding: 16, borderRadius: 8, border: '1px solid #1890ff' }}>
                <Text strong style={{ fontSize: 16 }}>Tổng thanh toán:</Text>
                <Title level={3} type="danger" style={{ margin: 0 }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice - (discountInfo?.discount || 0))}
                </Title>
              </div>

              <Button
                type="primary"
                size="large"
                htmlType="submit"
                block
                loading={placingOrder}
                style={{ height: 50, fontSize: 16, fontWeight: 'bold' }}
              >
                XÁC NHẬN ĐẶT HÀNG
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default CheckoutPage;
