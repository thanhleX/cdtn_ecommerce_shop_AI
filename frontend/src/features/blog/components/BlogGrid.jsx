import { useEffect, useState } from 'react';
import { Typography, Card, Spin, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import blogApi from '../../../api/blogApi';

const { Title, Paragraph } = Typography;

const BlogGrid = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedBlogs = async () => {
      try {
        const response = await blogApi.getFeaturedBlogs();
        // Backend returns ApiResponse<List<BlogResponse>>
        const allBlogs = response.data || [];
        const excludedCategories = ['Chính sách', 'Về chúng tôi', 'Hỗ trợ'];
        const filteredBlogs = allBlogs.filter(blog => !excludedCategories.includes(blog.categoryName));
        setBlogs(filteredBlogs);
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
    <div style={{ marginTop: 60, marginBottom: 60 }}>
      <div style={{ textAlign: 'center', marginBottom: 40, marginTop: 40 }}>
        <Title level={2} style={{ margin: 0 }}>Bài Viết Tiêu Biểu</Title>
        <div style={{ width: 60, height: 4, background: '#1890ff', margin: '12px auto', borderRadius: 2 }} />
      </div>

      <Row gutter={[24, 24]}>
        {blogs.map(blog => (
          <Col xs={24} sm={12} md={8} xl={6} key={blog.id}>
            <Link to={`/blog/${blog.slug}`}>
              <Card
                hoverable
                className="product-card-premium"
                style={{
                  borderRadius: 12,
                  border: '1px solid rgba(0,0,0,0.04)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}
                styles={{
                  body: {
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1
                  }
                }}
                cover={
                  <div style={{ height: 220, overflow: 'hidden' }}>
                    <img
                      alt={blog.title}
                      src={blog.thumbnail || 'https://dummyimage.com/400x200/cccccc/000000&text=No+Image'}
                      className="product-image"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    />
                  </div>
                }
              >
                <Title level={5} ellipsis={{ rows: 2 }} style={{ margin: 0, fontSize: '1.1rem', marginBottom: 8 }}>
                  {blog.title}
                </Title>
                <Paragraph ellipsis={{ rows: 3 }} type="secondary" style={{ margin: 0, flexGrow: 1 }}>
                  {blog.content?.replace(/<[^>]*>?/gm, '').substring(0, 120)}...
                </Paragraph>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default BlogGrid;
