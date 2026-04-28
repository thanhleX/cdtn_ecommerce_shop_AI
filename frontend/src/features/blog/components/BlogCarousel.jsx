import { useEffect, useState } from 'react';
import { Carousel, Typography, Card, Spin, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import blogApi from '../../../api/blogApi';

const { Title, Paragraph } = Typography;

const BlogCarousel = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedBlogs = async () => {
      try {
        const response = await blogApi.getFeaturedBlogs();
        // Backend returns ApiResponse<List<BlogResponse>>
        setBlogs(response.data || []);
      } catch (error) {
        console.error('Failed to fetch featured blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedBlogs();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}><Spin size="large" /></div>;
  }

  if (blogs.length === 0) {
    return null;
  }

  return (
    <div style={{
      marginTop: 60,
      marginBottom: 60,
      maxWidth: 1000,
      marginLeft: 'auto',
      marginRight: 'auto'
    }}>
      <Carousel
        autoplay
        dots
        arrows
        slidesToShow={1}
        slidesToScroll={1}
        style={{ padding: '0 40px' }}
      >
        {blogs.map(blog => (
          <div key={blog.id} style={{ padding: '0 12px' }}>
            <Link to={`/blog/${blog.slug}`}>
              <Card
                hoverable
                className="product-card-premium"
                cover={
                  <div style={{ height: 500, overflow: 'hidden' }}>
                    <img
                      alt={blog.title}
                      src={blog.thumbnail || 'https://dummyimage.com/400x200/cccccc/000000&text=No+Image'}
                      className="product-image"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    />
                  </div>
                }
                styles={{ body: { padding: '16px' } }}
                style={{ borderRadius: 12, overflow: 'hidden', height: '100%', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
              >
                <Title level={4} ellipsis={{ rows: 2 }} style={{ margin: 0, fontSize: '1.1rem' }}>
                  {blog.title}
                </Title>
                <Paragraph ellipsis={{ rows: 2 }} type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
                  {blog.content?.replace(/<[^>]*>?/gm, '').substring(0, 100)}...
                </Paragraph>
              </Card>
            </Link>
          </div>
        ))}
      </Carousel>

      <style dangerouslySetInnerHTML={{
        __html: `
        .ant-carousel .slick-prev, .ant-carousel .slick-next {
          color: #001529;
          font-size: 24px;
          z-index: 10;
        }
        .ant-carousel .slick-prev { left: -30px; }
        .ant-carousel .slick-next { right: -30px; }
        .ant-carousel .slick-prev:hover, .ant-carousel .slick-next:hover { color: #1890ff; }
      `}} />
    </div>
  );
};

export default BlogCarousel;
