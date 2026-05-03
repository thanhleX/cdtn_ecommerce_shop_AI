import { useState, useEffect, useCallback } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Typography, 
  Modal, 
  Form, 
  Input, 
  Switch, 
  message, 
  Popconfirm,
  Tag,
  InputNumber,
  Select,
  Image as AntImage,
  Upload
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UploadOutlined, 
  LoadingOutlined 
} from '@ant-design/icons';
import adminApi from '../../../api/adminApi';
import axiosClient from '../../../api/axiosClient';
import usePermission from '../../../hooks/usePermission';
import fileApi from '../../../api/fileApi';
import TiptapEditor from '../../../components/common/TiptapEditor';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const generateSlug = (title) => {
  if (!title) return '';
  let slug = title.toLowerCase();
  // Đổi ký tự có dấu thành không dấu
  slug = slug.replace(/[áàảãạăắằẳẵặâấầẩẫậ]/g, 'a');
  slug = slug.replace(/[éèẻẽẹêếềểễệ]/g, 'e');
  slug = slug.replace(/[íìỉĩị]/g, 'i');
  slug = slug.replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, 'o');
  slug = slug.replace(/[úùủũụưứừửữự]/g, 'u');
  slug = slug.replace(/[ýỳỷỹỵ]/g, 'y');
  slug = slug.replace(/đ/g, 'd');
  // Xóa ký tự đặc biệt
  slug = slug.replace(/([^0-9a-z-\s])/g, '');
  // Xóa khoảng trắng thay bằng gạch ngang
  slug = slug.replace(/(\s+)/g, '-');
  // Xóa gạch ngang ở đầu và cuối
  slug = slug.replace(/^-+/g, '');
  slug = slug.replace(/-+$/g, '');
  return slug;
};

const BlogManagePage = () => {
  const { hasPermission } = usePermission();
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [uploadLoading, setUploadLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchBlogCategories = useCallback(async () => {
    try {
      console.log('Fetching blog categories...');
      const response = await axiosClient.get('/admin/blog-categories');
      console.log('Blog categories response:', response);
      // Backend returns ApiResponse<List<BlogCategoryResponse>>
      // axiosClient returns the entire JSON body
      const data = response.data || response;
      setCategories(Array.isArray(data) ? data : (data.data || []));
    } catch (error) {
      console.error('Fetch categories error:', error);
      message.error(error?.message || 'Không thể lấy danh mục bài viết');
    }
  }, []);

  const fetchBlogs = useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      console.log(`Fetching blogs page ${page}...`);
      const response = await adminApi.getBlogs({ 
        page: page - 1, 
        size: pageSize 
      });
      console.log('Blogs response:', response);
      // Backend returns ApiResponse<PageResponse<BlogResponse>>
      const body = response; 
      const data = body.data || body;
      
      if (data && data.content) {
        setBlogs(data.content);
        setPagination({
          current: page,
          pageSize: pageSize,
          total: data.totalElements || 0,
        });
      } else {
        setBlogs([]);
        console.warn('No blog content found in response');
      }
    } catch (error) {
      console.error('Fetch blogs error:', error);
      message.error(error?.message || 'Không thể lấy danh sách bài viết');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
    fetchBlogCategories();
  }, [fetchBlogs, fetchBlogCategories]);

  const handleAdd = () => {
    setEditingBlog(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingBlog(record);
    form.setFieldsValue({
      title: record.title,
      slug: record.slug,
      content: record.content,
      thumbnail: record.thumbnail,
      isPublished: record.isPublished,
      isFeatured: record.isFeatured,
      carouselOrder: record.carouselOrder,
      blogCategoryId: record.blogCategoryId
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteBlog(id);
      message.success('Xóa bài viết thành công');
      fetchBlogs(pagination.current);
    } catch (error) {
      message.error(error?.message || 'Lỗi khi xóa bài viết');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingBlog) {
        await axiosClient.put(`/admin/blogs/${editingBlog.id}`, values);
        message.success('Cập nhật bài viết thành công');
      } else {
        await axiosClient.post('/admin/blogs', values);
        message.success('Tạo bài viết mới thành công');
      }
      setIsModalVisible(false);
      fetchBlogs(pagination.current);
    } catch (error) {
      if (error?.errorFields) return;
      message.error(error?.message || 'Lỗi khi lưu bài viết');
    }
  };

  const handleUpload = async (info) => {
    const { file } = info;
    setUploadLoading(true);
    try {
      const response = await fileApi.uploadFile(file);
      const url = response.data || response;
      form.setFieldsValue({ thumbnail: url });
      message.success('Tải ảnh lên thành công');
    } catch (error) {
      message.error(error?.message || 'Lỗi khi tải ảnh lên');
    } finally {
      setUploadLoading(false);
    }
  };

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      render: (img) => <AntImage src={img} width={60} height={40} style={{ objectFit: 'cover', borderRadius: 4 }} fallback="https://placehold.co/60x40?text=Blog" />
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: '30%',
    },
    {
      title: 'Tác giả',
      dataIndex: 'authorName',
      key: 'authorName',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isPublished',
      key: 'isPublished',
      render: (published) => (
        <Tag color={published ? 'green' : 'orange'}>
          {published ? 'Công khai' : 'Nháp'}
        </Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          {hasPermission('blog:manage') && (
            <>
              <Button type="primary" ghost icon={<EditOutlined />} onClick={() => handleEdit(record)} />
              <Popconfirm
                title="Xóa bài viết này?"
                onConfirm={() => handleDelete(record.id)}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button type="primary" danger ghost icon={<DeleteOutlined />} />
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3}>Quản lý bài viết</Title>
        {hasPermission('blog:manage') && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Viết bài mới
          </Button>
        )}
      </div>

      <Table 
        columns={columns} 
        dataSource={blogs} 
        rowKey="id" 
        loading={loading}
        pagination={pagination}
        onChange={(p) => fetchBlogs(p.current, p.pageSize)}
      />

      <Modal
        title={editingBlog ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" initialValues={{ isPublished: true, isFeatured: false }}>
          <Form.Item
            name="title"
            label="Tiêu đề bài viết"
            rules={[{ required: true, message: 'Nhập tiêu đề!' }]}
          >
            <Input 
              placeholder="Tiêu đề hấp dẫn..." 
              onChange={(e) => {
                const title = e.target.value;
                const currentSlug = form.getFieldValue('slug');
                // Chỉ tự động tạo slug nếu slug cũ đang trống hoặc đang khớp với title cũ
                if (!currentSlug || currentSlug === generateSlug(form.getFieldValue('title'))) {
                  form.setFieldsValue({ slug: generateSlug(title) });
                }
              }}
            />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Đường dẫn tĩnh (Slug)"
            rules={[{ required: true, message: 'Slug không được để trống!' }]}
          >
            <Input placeholder="tieu-de-bai-viet" />
          </Form.Item>

          <Form.Item
            name="blogCategoryId"
            label="Danh mục bài viết"
            rules={[{ required: true, message: 'Chọn danh mục!' }]}
          >
            <Select placeholder="Chọn danh mục bài viết">
              {categories.map(c => (
                <Option key={c.id} value={c.id}>{c.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="content" label="Nội dung" rules={[{ required: true, message: 'Nội dung không được để trống!' }]}>
            <TiptapEditor />
          </Form.Item>

          <Form.Item 
            name="thumbnail" 
            label="Ảnh bìa bài viết"
            rules={[{ required: true, message: 'Vui lòng tải ảnh bìa!' }]}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Upload
                name="file"
                listType="picture-card"
                showUploadList={false}
                customRequest={handleUpload}
                accept="image/*"
              >
                {form.getFieldValue('thumbnail') ? (
                  <img src={form.getFieldValue('thumbnail')} alt="thumbnail" style={{ width: '100%', borderRadius: 8 }} />
                ) : (
                  <div>
                    {uploadLoading ? <LoadingOutlined /> : <PlusOutlined />}
                    <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                  </div>
                )}
              </Upload>
              {form.getFieldValue('thumbnail') && (
                <Input 
                  value={form.getFieldValue('thumbnail')} 
                  onChange={(e) => form.setFieldsValue({ thumbnail: e.target.value })}
                  placeholder="Hoặc nhập URL ảnh tại đây"
                />
              )}
            </Space>
          </Form.Item>

          <Space size="large" align="start">
            <Form.Item name="isPublished" label="Công khai" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="isFeatured" label="Nổi bật (Carousel)" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => prevValues.isFeatured !== currentValues.isFeatured}
            >
              {({ getFieldValue }) => 
                getFieldValue('isFeatured') ? (
                  <Form.Item 
                    name="carouselOrder" 
                    label="Thứ tự hiển thị"
                    rules={[{ required: true, message: 'Nhập số thứ tự!' }]}
                  >
                    <InputNumber min={1} placeholder="Ví dụ: 1" />
                  </Form.Item>
                ) : null
              }
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
};

export default BlogManagePage;
