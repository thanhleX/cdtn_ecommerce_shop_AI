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
      <Title level={2} style={{ textAlign: 'center', marginBottom: 30 }}>Bài Viết Tiêu Biểu</Title>
      
      <Row gutter={[24, 24]}>
        {blogs.map(blog => (
          <Col xs={24} sm={12} md={8} xl={6} key={blog.id}>
            <Link to={`/blog/${blog.slug}`}>
              <Card
                hoverable
                className="product-card-modern"
                style={{
                  borderRadius: 12,
                  border: '3px solid #f0f0f0',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
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
                  <div style={{ height: 220, overflow: 'hidden', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
                    <img
                      alt={blog.title}
                      src={blog.thumbnail || 'https://dummyimage.com/400x200/cccccc/000000&text=No+Image'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
