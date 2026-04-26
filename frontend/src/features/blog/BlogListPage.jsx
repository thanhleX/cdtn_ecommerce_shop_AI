import { useEffect, useState } from 'react';
import { Typography, Row, Col, Card, Spin, Pagination } from 'antd';
import { Link } from 'react-router-dom';
import blogApi from '../../api/blogApi';

const { Title, Paragraph, Text } = Typography;
const { Meta } = Card;

const BlogListPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 6, total: 0 });

  const fetchBlogs = async (page = 1, size = 6) => {
    setLoading(true);
    try {
      const res = await blogApi.getBlogs({ page: page - 1, size });
      const data = res.data || res;
      setBlogs(data.content || []);
      setPagination({
        current: (data.pageable?.pageNumber || page - 1) + 1,
        pageSize: data.pageable?.pageSize || size,
        total: data.totalElements || 0
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(1, 6);
  }, []);

  const handlePageChange = (page) => {
    fetchBlogs(page, pagination.pageSize);
  };

  return (
    <div>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 40 }}>Tin Tức & Khuyến Mãi</Title>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
      ) : blogs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Text type="secondary">Chưa có bài viết nào</Text>
        </div>
      ) : (
        <>
          <Row gutter={[24, 32]}>
            {blogs.map(blog => (
              <Col xs={24} md={12} lg={8} key={blog.id}>
                <Card
                  hoverable
                  style={{ borderRadius: 12, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}
                  cover={
                    <Link to={`/blog/${blog.slug}`}>
                      <img alt={blog.title} src={blog.thumbnail || 'https://dummyimage.com/400x250/cccccc/000000&text=No+Image'} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                    </Link>
                  }
                  styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column' } }}
                >
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>{new Date(blog.createdAt).toLocaleDateString('vi-VN')}</Text>
                  </div>
                  <Title level={4} style={{ marginTop: 0 }}>
                    <Link to={`/blog/${blog.slug}`} style={{ color: '#000' }}>{blog.title}</Link>
                  </Title>
                  <Paragraph ellipsis={{ rows: 3 }} style={{ color: '#666', flex: 1 }}>
                    {blog.summary || 'Nhấn để xem nội dung chi tiết bài viết...'}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default BlogListPage;
