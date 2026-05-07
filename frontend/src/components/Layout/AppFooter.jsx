import React from 'react';
import { Layout, Row, Col, Typography, Space, Divider } from 'antd';
import {
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';

const { Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const AppFooter = () => {
  return (
    <Footer style={{ background: '#001529', color: 'rgba(255, 255, 255, 0.65)', padding: '64px 50px 32px' }}>
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
        
        {/* Thông tin chính */}
        <div style={{ marginBottom: 32 }}>
          <Title level={3} style={{ color: '#fff', margin: '0 0 16px' }}>VietTech Store</Title>
          <Paragraph style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: 14, maxWidth: 600, margin: '0 auto 24px' }}>
            Hệ thống kinh doanh thiết bị công nghệ hàng đầu Việt Nam. <br /> Cam kết hàng chính hãng, giá cả cạnh tranh và dịch vụ tận tâm.
          </Paragraph>
          
          <Space size="large" separator={<Divider orientation="vertical" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />}>
            <Space>
              <EnvironmentOutlined style={{ color: '#1890ff' }} />
              <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Hoàn Kiếm, Hà Nội</Text>
            </Space>
            <Space>
              <PhoneOutlined style={{ color: '#1890ff' }} />
              <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>0912-345-678</Text>
            </Space>
            <Space>
              <MailOutlined style={{ color: '#1890ff' }} />
              <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>support@viettechstore.com</Text>
            </Space>
          </Space>
        </div>

        <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.1)', margin: '32px 0 24px' }} />

        {/* Copyright */}
        <Row justify="center">
          <Col>
            <Text style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: 13 }}>
              © {new Date().getFullYear()} VietTech Store. All rights reserved.
            </Text>
          </Col>
        </Row>
      </div>
    </Footer>
  );
};

export default AppFooter;
