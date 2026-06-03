import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Typography, Spin, Breadcrumb, Row, Col, Divider, Tag } from 'antd';
import { HomeOutlined, ClockCircleOutlined } from '@ant-design/icons';
import blogApi from '../../api/blogApi';
import DOMPurify from 'dompurify';

const { Title, Paragraph, Text } = Typography;

const BlogDetailPage = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await blogApi.getBySlug(slug);
        setBlog(res.data || res);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchDetail();
  }, [slug]);

  if (loading) return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;
  if (!blog) return <div style={{ textAlign: 'center', padding: 100, background: '#fff', borderRadius: 8 }}><Title level={3}>Không tìm thấy bài viết</Title></div>;

  return (
    <div>
      <Breadcrumb
        items={[
          { title: <Link to="/"><HomeOutlined /></Link> },
          { title: <Link to="/blog">Blog</Link> },
          { title: blog.category?.name || 'Tin tức' },
        ]}
      />

      <Row justify="center">
        <Col xs={24} lg={18}>
          <div style={{ background: '#fff', padding: 40, borderRadius: 12, border: '1px solid #f0f0f0' }}>
            <Title level={1} style={{ marginTop: 0, marginBottom: 16 }}>{blog.title}</Title>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
              <Tag color="geekblue">{blog.category?.name || 'Tin tức'}</Tag>
              <Text type="secondary">
                <ClockCircleOutlined style={{ marginRight: 6 }} />
                {new Date(blog.createdAt).toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </div>

            {blog.thumbnail && (
              <div style={{ marginBottom: 40, borderRadius: 12, overflow: 'hidden' }}>
                <img src={blog.thumbnail} alt={blog.title} style={{ width: '100%', maxHeight: 500, objectFit: 'cover' }} />
              </div>
            )}

            <div
              className="blog-content"
              style={{ fontSize: 16, lineHeight: 1.8, color: '#333' }}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content) }}
            />

            <Divider />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong>Tác giả: <Text style={{ fontWeight: 'normal' }}>{blog.author?.fullName || 'Admin'}</Text></Text>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default BlogDetailPage;
