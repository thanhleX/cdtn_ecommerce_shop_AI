import React, { useEffect, useState } from 'react';
import { Layout, Row, Col, Typography, Space, Divider, Spin } from 'antd';
import { Link } from 'react-router-dom';
import {
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  FacebookOutlined,
  InstagramOutlined,
  YoutubeOutlined
} from '@ant-design/icons';
import blogApi from '../../api/blogApi';

const { Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const AppFooter = () => {
  const [footerLinks, setFooterLinks] = useState({
    policies: [],
    aboutUs: [],
    support: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFooterData = async () => {
      setLoading(true);
      try {
        const [policiesRes, aboutRes, supportRes] = await Promise.all([
          blogApi.getByCategory('chinh-sach', { size: 5 }),
          blogApi.getByCategory('ve-chung-toi', { size: 5 }),
          blogApi.getByCategory('ho-tro', { size: 5 })
        ]);

        setFooterLinks({
          policies: (policiesRes.data?.content || policiesRes.content || []),
          aboutUs: (aboutRes.data?.content || aboutRes.content || []),
          support: (supportRes.data?.content || supportRes.content || [])
        });
      } catch (error) {
        console.error("Failed to fetch footer links", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterData();
  }, []);

  return (
    <Footer style={{ background: '#001529', color: 'rgba(255, 255, 255, 0.65)', padding: '64px 50px 32px' }}>
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Row gutter={[48, 32]}>
          {/* Cột 1: Thông tin Shop */}
          <Col xs={24} md={6} style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: 24 }}>
              <Link to="/" style={{ display: 'inline-block', marginBottom: 16 }}>
                <Title level={3} style={{ color: '#fff', margin: 0 }}>VietTech Store</Title>
              </Link>
              <Paragraph style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: 14 }}>
                Hệ thống kinh doanh thiết bị công nghệ hàng đầu Việt Nam. Cam kết hàng chính hãng, giá cả cạnh tranh và dịch vụ tận tâm.
              </Paragraph>
              <Space orientation="vertical" size="middle">
                <Space align="start">
                  <EnvironmentOutlined style={{ color: '#1890ff', marginTop: 4 }} />
                  <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Hoàn Kiếm, Hà Nội</Text>
                </Space>
                <Space>
                  <PhoneOutlined style={{ color: '#1890ff' }} />
                  <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>0912-345-678 (8:00 - 22:00)</Text>
                </Space>
                <Space>
                  <MailOutlined style={{ color: '#1890ff' }} />
                  <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>support@viettechstore.com</Text>
                </Space>
              </Space>
            </div>
          </Col>

          {/* Cột 2: Về chúng tôi */}
          <Col xs={24} sm={12} md={6} style={{ textAlign: 'left' }}>
            <Title level={4} style={{ color: '#fff', marginBottom: 24 }}>
              Về chúng tôi
            </Title>
            <Space orientation="vertical" size="middle">
              {loading ? (
                <Spin size="small" />
              ) : (
                <>
                  {footerLinks.aboutUs.map(blog => (
                    <Link
                      key={blog.id}
                      to={`/blog/${blog.slug}`}
                      style={{ color: 'rgba(255, 255, 255, 0.65)', display: 'block' }}
                      className="footer-link"
                    >
                      {blog.title}
                    </Link>
                  ))}
                  {footerLinks.aboutUs.length === 0 && (
                    <Text style={{ color: 'rgba(255, 255, 255, 0.3)' }}>
                      Đang cập nhật...
                    </Text>
                  )}
                </>
              )}
            </Space>
          </Col>

          {/* Cột 3: Thông tin khác */}
          <Col xs={24} sm={12} md={6} style={{ textAlign: 'left' }}>
            <Title level={4} style={{ color: '#fff', marginBottom: 24 }}>
              Thông tin khác
            </Title>

            <Space orientation="vertical" size="middle">
              {loading ? (
                <Spin size="small" />
              ) : (
                <>
                  {[...footerLinks.policies, ...footerLinks.support].map(blog => (
                    <Link
                      key={blog.id}
                      to={`/blog/${blog.slug}`}
                      style={{ color: 'rgba(255, 255, 255, 0.65)', display: 'block' }}
                      className="footer-link"
                    >
                      {blog.title}
                    </Link>
                  ))}
                  {(footerLinks.policies.length === 0 && footerLinks.support.length === 0) && (
                    <Text style={{ color: 'rgba(255, 255, 255, 0.3)' }}>
                      Đang cập nhật...
                    </Text>
                  )}
                </>
              )}
            </Space>
          </Col>

          {/* ✅ Cột 4: Theo dõi chúng tôi */}
          <Col xs={24} sm={12} md={6} style={{ textAlign: 'left' }}>
            <Title level={4} style={{ color: '#fff', marginBottom: 24 }}>
              Theo dõi chúng tôi
            </Title>

            <Space size="large">
              <a href="#" style={{ color: '#fff', fontSize: 20 }}>
                <FacebookOutlined />
              </a>
              <a href="#" style={{ color: '#fff', fontSize: 20 }}>
                <InstagramOutlined />
              </a>
              <a href="#" style={{ color: '#fff', fontSize: 20 }}>
                <YoutubeOutlined />
              </a>
            </Space>
          </Col>
        </Row>

        <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.1)', margin: '48px 0 24px' }} />

        <Row justify="space-between" align="middle">
          <Col>
            <Text style={{ color: 'rgba(255, 255, 255, 0.45)' }}>
              © {new Date().getFullYear()} VietTech Store. All rights reserved.
            </Text>
          </Col>
          <Col>
            <Space separator={<Divider orientation="vertical" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />}>
              <Link to="/privacy" style={{ color: 'rgba(255, 255, 255, 0.45)' }}>Quyền riêng tư</Link>
              <Link to="/terms" style={{ color: 'rgba(255, 255, 255, 0.45)' }}>Điều khoản</Link>
            </Space>
          </Col>
        </Row>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .footer-link:hover {
          color: #1890ff !important;
          padding-left: 8px;
          transition: all 0.3s ease;
        }
      `}} />
    </Footer>
  );
};

export default AppFooter;
