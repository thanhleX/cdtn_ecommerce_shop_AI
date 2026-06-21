import { useState, useEffect } from 'react';
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
  Select,
  Upload,
  Image as AntImage
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TagsOutlined, LoadingOutlined } from '@ant-design/icons';
import categoryApi from '../../../api/categoryApi';
import attributeApi from '../../../api/attributeApi';
import fileApi from '../../../api/fileApi';
import usePermission from '../../../hooks/usePermission';

const { Title } = Typography;
const { Option } = Select;

const CategoryManagePage = () => {
  const { hasPermission } = usePermission();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isAttrModalVisible, setIsAttrModalVisible] = useState(false);
  const [allAttributes, setAllAttributes] = useState([]);
  const [selectedAttrIds, setSelectedAttrIds] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryApi.getCategories();
      // Backend returns tree structure in response.data or response
      setCategories(response.data || response);
    } catch (error) {
      console.error('Fetch Categories Error:', error);
      message.error(error?.message || 'Không thể lấy danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingCategory(record);
    form.setFieldsValue({
      name: record.name,
      parentId: record.parentId,
      isActive: record.isActive,
      imageUrl: record.imageUrl,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await categoryApi.delete(id);
      message.success('Xóa danh mục thành công');
      fetchCategories();
    } catch (error) {
      message.error(error?.message || 'Lỗi khi xóa danh mục');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingCategory) {
        await categoryApi.update(editingCategory.id, values);
        message.success('Cập nhật danh mục thành công');
      } else {
        await categoryApi.create(values);
        message.success('Thêm danh mục thành công');
      }
      setIsModalVisible(false);
      fetchCategories();
    } catch (error) {
      if (error?.errorFields) return; // Form validation error
      message.error(error?.message || 'Lỗi khi lưu danh mục');
    }
  };

  const handleUpload = async (info) => {
    const { file } = info;
    setUploadLoading(true);
    try {
      const response = await fileApi.uploadFile(file);
      const url = response.data || response;
      form.setFieldsValue({ imageUrl: url });
      message.success('Tải ảnh lên thành công');
    } catch (error) {
      message.error(error?.message || 'Lỗi khi tải ảnh lên');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleManageAttributes = async (record) => {
    setEditingCategory(record);
    try {
      const allRes = await attributeApi.getAllAttributes();
      setAllAttributes(allRes.data || []);
      
      // Selected attributes of this category
      setSelectedAttrIds(record.attributes?.map(a => a.id) || []);
      setIsAttrModalVisible(true);
    } catch (error) {
      message.error(error?.message || 'Không thể tải thuộc tính');
    }
  };

  const handleAttrModalOk = async () => {
    const currentIds = editingCategory.attributes?.map(a => a.id) || [];
    
    try {
      // Find attributes to add
      const toAdd = selectedAttrIds.filter(id => !currentIds.includes(id));
      // Find attributes to remove
      const toRemove = currentIds.filter(id => !selectedAttrIds.includes(id));

      await Promise.all([
        ...toAdd.map(id => attributeApi.assignAttributeToCategory(editingCategory.id, id)),
        ...toRemove.map(id => attributeApi.removeAttributeFromCategory(editingCategory.id, id))
      ]);

      message.success('Cập nhật thuộc tính thành công');
      setIsAttrModalVisible(false);
      fetchCategories();
    } catch (error) {
      message.error(error?.message || 'Lỗi khi cập nhật thuộc tính');
    }
  };

  // Flatten categories for Select parent option
  const flatCategories = (cats, result = []) => {
    cats.forEach(c => {
      result.push(c);
      if (c.children) flatCategories(c.children, result);
    });
    return result;
  };

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 100,
      render: (img, record) => record.parentId ? null : (
        <AntImage src={img} width={50} height={50} style={{ objectFit: 'contain', borderRadius: 4 }} fallback="https://placehold.co/50x50?text=Cat" />
      )
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Hoạt động' : 'Tạm dừng'}
        </Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {hasPermission('category:manage') && (
            <>
              <Button 
                type="primary" 
                ghost 
                icon={<EditOutlined />} 
                onClick={() => handleEdit(record)}
              />
              <Button 
                type="default" 
                icon={<TagsOutlined />} 
                onClick={() => handleManageAttributes(record)}
                title="Cấu hình bộ lọc"
              />
              <Popconfirm
                title="Bạn có chắc chắn muốn xóa?"
                onConfirm={() => handleDelete(record.id)}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
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
        <Title level={3}>Quản lý danh mục</Title>
        {hasPermission('category:manage') && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm danh mục
          </Button>
        )}
      </div>

      <Table 
        columns={columns} 
        dataSource={categories} 
        rowKey="id" 
        loading={loading}
        pagination={false}
        // Cho phép hiển thị tree structure nếu backend trả về lồng nhau
        expandable={{ defaultExpandAllRows: true }}
      />

      <Modal
        title={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" initialValues={{ isActive: true }}>
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
          >
            <Input placeholder="ví dụ: Áo Nam" />
          </Form.Item>

          <Form.Item
            name="parentId"
            label="Danh mục cha (nếu có)"
          >
            <Select 
              placeholder="Chọn danh mục cha" 
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) => (option?.children ?? '').toString().toLowerCase().includes(input.toLowerCase())}
            >
              {flatCategories(categories)
                .filter(c => c.isActive) // Chỉ hiện cate đang hoạt động
                .filter(c => !editingCategory || c.id !== editingCategory.id) // Không chọn chính nó làm cha
                .map(c => (
                  <Option key={c.id} value={c.id}>{c.name}</Option>
                ))
              }
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.parentId !== currentValues.parentId}
          >
            {({ getFieldValue }) => 
              !getFieldValue('parentId') ? (
                <Form.Item 
                  name="imageUrl" 
                  label="Ảnh đại diện (chỉ dành cho danh mục cha)"
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Upload
                      name="file"
                      listType="picture-card"
                      showUploadList={false}
                      customRequest={handleUpload}
                      accept="image/*"
                    >
                      {form.getFieldValue('imageUrl') ? (
                        <img src={form.getFieldValue('imageUrl')} alt="imageUrl" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <div>
                          {uploadLoading ? <LoadingOutlined /> : <PlusOutlined />}
                          <div style={{ marginTop: 8 }}>Tải ảnh</div>
                        </div>
                      )}
                    </Upload>
                    {form.getFieldValue('imageUrl') && (
                      <Input 
                        value={form.getFieldValue('imageUrl')} 
                        onChange={(e) => form.setFieldsValue({ imageUrl: e.target.value })}
                        placeholder="Hoặc nhập URL ảnh tại đây"
                      />
                    )}
                  </Space>
                </Form.Item>
              ) : null
            }
          </Form.Item>


          <Form.Item
            name="isActive"
            label="Trạng thái hoạt động"
            valuePropName="checked"
          >
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Cấu hình bộ lọc cho: ${editingCategory?.name}`}
        open={isAttrModalVisible}
        onOk={handleAttrModalOk}
        onCancel={() => setIsAttrModalVisible(false)}
      >
        <p>Chọn các thuộc tính sẽ dùng làm bộ lọc cho danh mục này:</p>
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="Chọn thuộc tính"
          value={selectedAttrIds}
          onChange={setSelectedAttrIds}
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) => (option?.children ?? '').toString().toLowerCase().includes(input.toLowerCase())}
        >
          {allAttributes.map(attr => (
            <Option key={attr.id} value={attr.id}>{attr.name}</Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
};

export default CategoryManagePage;
