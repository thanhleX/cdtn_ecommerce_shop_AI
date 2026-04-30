import { useEffect, useState } from 'react';
import { Typography, Row, Col, Spin, Button, Carousel, Card } from 'antd';
import { 
  SafetyCertificateOutlined, 
  CarOutlined, 
  SyncOutlined, 
  PhoneOutlined,
  MobileOutlined,
  LaptopOutlined,
  TabletOutlined,
  DesktopOutlined,
  AudioOutlined,
  DashboardOutlined,
  ThunderboltOutlined,
  AppstoreOutlined,
  ToolOutlined
} from '@ant-design/icons';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../product/components/ProductCard';
import BlogGrid from '../blog/components/BlogGrid';
import { Link, useNavigate } from 'react-router-dom';
import categoryApi from '../../api/categoryApi';

const { Title, Text } = Typography;

const HomePage = () => {
  const { products, loading, fetchFeaturedProducts } = useProducts();
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedProducts();
    fetchCategories();
  }, [fetchFeaturedProducts]);

  const fetchCategories = async () => {
    try {
      setLoadingCats(true);
      const res = await categoryApi.getAllCategories();
      const dataList = res.data || res;
      if (Array.isArray(dataList)) {
        // Lấy danh mục cha và trộn ngẫu nhiên (shuffle)
        let roots = dataList.filter(c => !c.parentId);
        if (roots.length === 0) roots = dataList;
        const shuffled = roots.sort(() => 0.5 - Math.random());
        setCategories(shuffled.slice(0, 4));
      }
    } catch (err) {
      console.error("Failed to fetch categories", err);
    } finally {
      setLoadingCats(false);
    }
  };

  const getCategoryIcon = (name) => {
    const lowerName = name?.toLowerCase() || '';
    if (lowerName.includes('điện thoại')) return <MobileOutlined />;
    if (lowerName.includes('laptop') || lowerName.includes('máy tính') || lowerName.includes('pc')) return <LaptopOutlined />;
    if (lowerName.includes('tablet') || lowerName.includes('máy tính bảng')) return <TabletOutlined />;
    if (lowerName.includes('tivi') || lowerName.includes('tv') || lowerName.includes('màn hình')) return <DesktopOutlined />;
    if (lowerName.includes('tai nghe') || lowerName.includes('loa') || lowerName.includes('âm thanh')) return <AudioOutlined />;
    if (lowerName.includes('đồng hồ')) return <DashboardOutlined />;
    if (lowerName.includes('phụ kiện') || lowerName.includes('sạc') || lowerName.includes('chuột') || lowerName.includes('bàn phím')) return <ThunderboltOutlined />;
    if (lowerName.includes('máy lạnh') || lowerName.includes('điều hòa') || lowerName.includes('tủ lạnh') || lowerName.includes('máy giặt') || lowerName.includes('robot') || lowerName.includes('lọc nước')) return <ToolOutlined />;
    return <AppstoreOutlined />;
  };

  const features = [
    { icon: <CarOutlined style={{ fontSize: 32, color: '#1890ff' }}/>, title: 'Miễn Phí Giao Hàng', desc: 'Cho đơn từ 500k' },
    { icon: <SyncOutlined style={{ fontSize: 32, color: '#1890ff' }}/>, title: 'Đổi Trả 7 Ngày', desc: 'Thủ tục nhanh chóng' },
    { icon: <SafetyCertificateOutlined style={{ fontSize: 32, color: '#1890ff' }}/>, title: 'Thanh Toán An Toàn', desc: 'Bảo mật 100%' },
    { icon: <PhoneOutlined style={{ fontSize: 32, color: '#1890ff' }}/>, title: 'Hỗ Trợ 24/7', desc: 'Hotline: 1900 xxxx' },
  ];

  return (
    <div style={{ marginTop: -50, marginBottom: 60 }}>
      {/* 1. HERO BANNER */}
      <Carousel autoplay effect="fade">
        <div>
          <div style={{ 
            height: 400, 
            background: 'linear-gradient(135deg, #1890ff 0%, #0050b3 100%)', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white'
          }}>
            <Title style={{ color: 'white', fontSize: 48, marginBottom: 16 }}>Bộ Sưu Tập Mới 2026</Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, marginBottom: 24 }}>Khám phá những xu hướng thời thượng nhất</Text>
            <Button size="large" type="default" shape="round" style={{ fontWeight: 'bold' }}>Mua Ngay</Button>
          </div>
        </div>
        <div>
          <div style={{ 
            height: 400, 
            background: 'linear-gradient(135deg, #722ed1 0%, #391085 100%)', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white'
          }}>
            <Title style={{ color: 'white', fontSize: 48, marginBottom: 16 }}>Sale Chớp Nhoáng</Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, marginBottom: 24 }}>Giảm giá lên đến 50% cho thành viên</Text>
            <Button size="large" type="default" shape="round" style={{ fontWeight: 'bold' }}>Xem Chi Tiết</Button>
          </div>
        </div>
      </Carousel>

      {/* 2. TRUST BADGES */}
      <div style={{ background: '#fff', padding: '40px 0', borderBottom: '1px solid #f0f0f0' }}>
        <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
          <Row gutter={[24, 24]} justify="center">
            {features.map((item, index) => (
              <Col xs={12} md={6} key={index}>
                <div style={{ textAlign: 'center', padding: 16 }}>
                  <div style={{ marginBottom: 16 }}>{item.icon}</div>
                  <Title level={5} style={{ margin: 0 }}>{item.title}</Title>
                  <Text type="secondary">{item.desc}</Text>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* 3. CATEGORIES */}
      <div style={{ maxWidth: 1200, margin: '60px auto 40px', padding: '0 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Title level={2} style={{ margin: 0 }}>Danh Mục Nổi Bật</Title>
          <div style={{ width: 60, height: 4, background: '#1890ff', margin: '12px auto', borderRadius: 2 }} />
        </div>
        <Row gutter={[24, 24]} justify="center">
          {loadingCats ? (
            <div style={{ padding: 40 }}><Spin /></div>
          ) : (
            categories.map((cat, index) => (
              <Col xs={12} sm={6} key={cat.id || index}>
                <Card 
                  hoverable 
                  onClick={() => navigate(`/products?category=${cat.slug}`)}
                  style={{ textAlign: 'center', borderRadius: 16, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}
                  bodyStyle={{ padding: '30px 10px' }}
                >
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 80 }}>
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <div style={{ fontSize: 40, color: '#1890ff' }}>{getCategoryIcon(cat.name)}</div>
                    )}
                  </div>
                  <Title level={5} style={{ margin: 0 }}>{cat.name}</Title>
                </Card>
              </Col>
            ))
          )}
        </Row>
      </div>

      {/* 4. FEATURED PRODUCTS */}
      <div style={{ maxWidth: 1200, margin: '0 auto 60px', padding: '0 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40, marginTop: 40 }}>
          <Title level={2} style={{ margin: 0 }}>Sản Phẩm Bán Chạy</Title>
          <div style={{ width: 60, height: 4, background: '#1890ff', margin: '12px auto', borderRadius: 2 }} />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
        ) : (
          <Row gutter={[24, 24]}>
            {products.map(product => (
              <Col xs={24} sm={12} md={8} xl={6} key={product.id}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        )}
        
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Link to="/products">
            <Button size="large" shape="round">Xem Thêm Sản Phẩm</Button>
          </Link>
        </div>
      </div>

      {/* 5. BLOG / NEWS */}
      <div style={{ background: '#fafafa', padding: '60px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <Title level={2} style={{ margin: 0 }}>Tin Tức & Khuyến Mãi</Title>
            <div style={{ width: 60, height: 4, background: '#1890ff', margin: '12px auto', borderRadius: 2 }} />
          </div>
          <BlogGrid />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
