import { Button, Result, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingOutlined, FileTextOutlined } from '@ant-design/icons';

const { Paragraph, Text } = Typography;

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { order } = location.state || {};

  if (!order) {
    return (
      <div style={{ padding: '100px 0', textAlign: 'center' }}>
        <Result
          status="404"
          title="Không tìm thấy thông tin đơn hàng"
          subTitle="Vui lòng kiểm tra lại trạng thái đơn hàng trong trang cá nhân của bạn."
          extra={
            <Button type="primary" onClick={() => navigate('/')}>
              Quay lại Trang chủ
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '60px 0', background: '#f5f5f5', minHeight: '80vh' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', background: '#fff', padding: 48, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Result
          status="success"
          title={<span style={{ fontSize: 28, fontWeight: 'bold' }}>Đặt hàng thành công!</span>}
          subTitle={
            <div style={{ marginTop: 16 }}>
              <Paragraph style={{ fontSize: 16 }}>
                Cảm ơn anh/chị <Text strong>{order.receiverName || 'khách hàng'}</Text> đã tin tưởng mua sắm tại <Text strong color="#1890ff">CDTN Shop</Text>.
              </Paragraph>
              <Paragraph>
                Mã đơn hàng của bạn là: <Text copyable strong style={{ color: '#1890ff', fontSize: 18 }}>{order.id}</Text>
              </Paragraph>
              <Paragraph type="secondary">
                Hệ thống đã nhận được đơn hàng và đang tiến hành xử lý. Bạn có thể theo dõi tiến độ đơn hàng trong mục "Đơn mua".
              </Paragraph>
            </div>
          }
          extra={[
            <Button 
              type="primary" 
              key="orders" 
              size="large"
              icon={<FileTextOutlined />}
              onClick={() => navigate('/profile')}
              style={{ minWidth: 160 }}
            >
              Xem đơn hàng
            </Button>,
            <Button 
              key="buy" 
              size="large"
              icon={<ShoppingOutlined />}
              onClick={() => navigate('/')}
              style={{ minWidth: 160 }}
            >
              Tiếp tục mua sắm
            </Button>,
          ]}
        />
        
        <div style={{ marginTop: 40, padding: 24, background: '#fafafa', borderRadius: 8, border: '1px dashed #d9d9d9' }}>
          <Title level={5}>Lưu ý quan trọng:</Title>
          <ul style={{ paddingLeft: 20, color: '#595959' }}>
            <li>Nếu là thanh toán chuyển khoản, đơn hàng sẽ được xác nhận sau khi nhận được tiền.</li>
            <li>Chúng tôi sẽ liên hệ với bạn qua số điện thoại <Text strong>{order.phone}</Text> nếu cần xác nhận thông tin.</li>
            <li>Mọi thắc mắc vui lòng liên hệ Hotline: <Text strong>1900 xxxx</Text></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const Title = Typography.Title;

export default OrderSuccessPage;
