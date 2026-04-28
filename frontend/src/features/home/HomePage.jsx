import { useEffect } from 'react';
import { Typography, Row, Col, Spin, Button } from 'antd';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../product/components/ProductCard';
import { Link } from 'react-router-dom';
import BlogCarousel from '../blog/components/BlogCarousel';
import BlogGrid from '../blog/components/BlogGrid';

const { Title, Paragraph } = Typography;

const HomePage = () => {
  const { products, loading, fetchFeaturedProducts } = useProducts();

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  return (
    <div style={{ marginTop: -50, marginBottom: 60 }}>
      <BlogCarousel />

      <div style={{ textAlign: 'center', marginBottom: 40, marginTop: 40 }}>
        <Title level={2} style={{ margin: 0 }}>Sản Phẩm Nổi Bật</Title>
        <div style={{ width: 60, height: 4, background: '#1890ff', margin: '12px auto', borderRadius: 2 }} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
      ) : (
        <>
          <Row gutter={[24, 24]}>
            {products.map(product => (
              <Col xs={24} sm={12} md={8} xl={6} key={product.id}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>

          <BlogGrid />
        </>
      )}
    </div>
  );
};

export default HomePage;
