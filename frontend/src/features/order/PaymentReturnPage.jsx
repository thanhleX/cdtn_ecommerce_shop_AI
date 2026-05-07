import { useEffect, useState } from 'react';
import { Button, Result, Card, Typography, Descriptions, Spin } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircleOutlined, CloseCircleOutlined, ShoppingOutlined, HistoryOutlined } from '@ant-design/icons';
import orderApi from '../../api/orderApi';

const { Text, Title } = Typography;

const PaymentReturnPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const responseCode = params.get('vnp_ResponseCode');
    const orderInfo = params.get('vnp_OrderInfo'); // VD: "Thanh toan don hang #123"
    const amount = params.get('vnp_Amount');
    const transactionNo = params.get('vnp_TransactionNo');

    // Lấy orderId từ orderInfo (logic đơn giản: lấy số sau dấu #)
    const orderId = orderInfo?.split('#')[1];

    if (responseCode === '00') {
      // Thanh toán thành công
      setResult({
        status: 'success',
        title: 'Thanh toán thành công!',
        subTitle: `Giao dịch số ${transactionNo} đã được xác nhận thành công.`,
        orderId,
        amount: amount ? parseInt(amount) / 100 : 0
      });

      // TỰ ĐỘNG CẬP NHẬT TRẠNG THÁI (Nếu backend có endpoint)
      // Ở đây ta có thể gọi một API ẩn để báo cho backend biết là đã thanh toán
      // Ví dụ: orderApi.confirmPayment(orderId, { transactionNo, amount })
    } else {
      // Thanh toán thất bại hoặc hủy
      setResult({
        status: 'error',
        title: 'Thanh toán không thành công',
        subTitle: 'Đã có lỗi xảy ra trong quá trình thanh toán hoặc giao dịch bị hủy.',
        orderId,
        code: responseCode
      });
    }
    setLoading(false);
  }, [location]);

  if (loading) {
    return (
      <div style={{ padding: '100px 0', textAlign: 'center' }}>
        <Spin size="large" tip="Đang xử lý kết quả thanh toán..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '60px 0', background: '#f0f2f5', minHeight: '80vh' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <Result
            status={result.status}
            title={<Title level={2}>{result.title}</Title>}
            subTitle={result.subTitle}
            extra={[
              <Button 
                type="primary" 
                key="home" 
                size="large"
                icon={<ShoppingOutlined />}
                onClick={() => navigate('/')}
              >
                Tiếp tục mua sắm
              </Button>,
              <Button 
                key="orders" 
                size="large"
                icon={<HistoryOutlined />}
                onClick={() => navigate('/profile')}
              >
                Lịch sử đơn hàng
              </Button>,
            ]}
          >
            <div className="payment-details" style={{ marginTop: 24, padding: 24, background: '#fafafa', borderRadius: 8 }}>
              <Descriptions title="Chi tiết giao dịch" column={1} bordered size="small">
                <Descriptions.Item label="Mã đơn hàng">
                  <Text strong>#{result.orderId}</Text>
                </Descriptions.Item>
                {result.amount > 0 && (
                  <Descriptions.Item label="Số tiền đã thanh toán">
                    <Text type="danger" strong>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(result.amount)}
                    </Text>
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Phương thức">VNPay (ATM/QR/International Card)</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  {result.status === 'success' ? (
                    <Text type="success">Đã thanh toán <CheckCircleOutlined /></Text>
                  ) : (
                    <Text type="danger">Thất bại / Bị hủy <CloseCircleOutlined /></Text>
                  )}
                </Descriptions.Item>
              </Descriptions>
              
              {result.status === 'error' && (
                <div style={{ marginTop: 20, color: '#666' }}>
                  <Text type="secondary">
                    * Nếu anh đã bị trừ tiền mà hệ thống chưa cập nhật, vui lòng liên hệ hỗ trợ để được xử lý nhanh nhất.
                  </Text>
                </div>
              )}
            </div>
          </Result>
        </Card>
      </div>
    </div>
  );
};

export default PaymentReturnPage;
