import { useState, useEffect, useCallback, useMemo } from 'react';
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
  InputNumber,
  Divider,
  Upload,
  Tooltip,
  Row,
  Col
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  MinusCircleOutlined
} from '@ant-design/icons';
import productApi from '../../../api/productApi';
import categoryApi from '../../../api/categoryApi';
import fileApi from '../../../api/fileApi';
import usePermission from '../../../hooks/usePermission';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ProductManagePage = () => {
  const { hasPermission } = usePermission();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filterStatus, setFilterStatus] = useState(undefined);
  const [form] = Form.useForm();

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryApi.getCategories();
      setCategories(response.data || response);
    } catch (error) {
      message.error(error?.message || 'Không thể lấy danh sách danh mục');
    }
  }, []);

  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(undefined);

  const fetchProducts = useCallback(async (page = 1, pageSize = 10, searchKeyword = keyword, catId = selectedCategory) => {
    setLoading(true);
    try {
      const params = {
        page: page - 1,
        size: pageSize,
        sortBy: 'id',
        direction: 'desc',
        isActive: filterStatus
      };
      
      if (searchKeyword && searchKeyword.trim() !== '') {
        params.keyword = searchKeyword.trim();
      }
      if (catId) {
        // categoryIds parameter in backend takes a comma separated list
        params.categoryIds = catId; 
      }

      const response = await productApi.getProducts(params);
      // response.data is PageResponse { content, totalElements, ... }
      const data = response.data || response;
      setProducts(data.content);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: data.totalElements,
      });
    } catch (error) {
      message.error(error?.message || 'Không thể lấy danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [keyword, selectedCategory, filterStatus]);

  useEffect(() => {
    fetchProducts(pagination.current, pagination.pageSize);
    fetchCategories();
  }, [fetchProducts, fetchCategories]); // fetchProducts is memoized with dependencies

  const handleTableChange = (newPagination) => {
    fetchProducts(newPagination.current, newPagination.pageSize);
  };

  const handleSearch = (value) => {
    setKeyword(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleCategoryFilter = (value) => {
    setSelectedCategory(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = async (record) => {
    setLoading(true);
    try {
      const response = await productApi.getById(record.id);
      const product = response.data || response;
      setEditingProduct(product);

      form.setFieldsValue({
        name: product.name,
        description: product.description,
        categoryId: product.categoryId,
        isActive: product.isActive,
        variants: product.variants?.length > 1 || (product.variants?.length === 1 && (product.variants[0].attributeValues?.length > 0))
          ? product.variants.map(v => {
              const variantData = { ...v };
              v.attributeValues?.forEach(av => {
                // Thử lấy ID thuộc tính từ nhiều nguồn để đảm bảo không bị rỗng
                const attrId = av.attributeId || av.attribute?.id;
                if (attrId) {
                  variantData[`attr_${attrId}`] = av.id;
                }
              });
              return variantData;
            })
          : [],
        sku: product.variants?.length === 1 && (!product.variants[0].attributeValues || product.variants[0].attributeValues.length === 0) ? product.variants[0].sku : undefined,
        price: product.variants?.length === 1 && (!product.variants[0].attributeValues || product.variants[0].attributeValues.length === 0) ? product.variants[0].price : undefined,
        quantity: product.variants?.length === 1 && (!product.variants[0].attributeValues || product.variants[0].attributeValues.length === 0) ? product.variants[0].quantity : undefined,
        images: product.images
      });
      setIsModalVisible(true);
    } catch (error) {
      message.error(error?.message || 'Không thể lấy chi tiết sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await productApi.delete(id);
      message.success('Xóa sản phẩm thành công (Soft delete)');
      fetchProducts(pagination.current);
    } catch (error) {
      message.error(error?.message || 'Lỗi khi xóa sản phẩm');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Transform dynamic fields back to attributeValueIds
      const formattedValues = { ...values };
      if (values.variants) {
        formattedValues.variants = values.variants.map(v => {
          const attributeValueIds = Object.keys(v)
            .filter(key => key.startsWith('attr_'))
            .map(key => v[key]);
          return { ...v, attributeValueIds };
        });
      }

      if (editingProduct) {
        await productApi.update(editingProduct.id, formattedValues);
        message.success('Cập nhật sản phẩm thành công');
      } else {
        await productApi.create(formattedValues);
        message.success('Thêm sản phẩm thành công');
      }
      setIsModalVisible(false);
      fetchProducts(pagination.current);
    } catch (error) {
      if (error?.errorFields) return;
      message.error(error?.message || 'Lỗi khi lưu sản phẩm');
    }
  };

  const flattenedCategories = useMemo(() => {
    const flat = (cats, result = []) => {
      cats.forEach(c => {
        result.push(c);
        if (c.children) flat(c.children, result);
      });
      return result;
    };
    return flat(categories);
  }, [categories]);

  const canCreate = hasPermission('product:create');
  const canUpdate = hasPermission('product:update');
  const canDelete = hasPermission('product:delete');

  const columns = [
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      width: '25%',
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryName',
      key: 'categoryName',
    },
    {
      title: 'Biến thể',
      key: 'variants',
      render: (_, record) => (
        <Tooltip title={record.variants?.map(v => `${v.sku} (${v.quantity})`).join(', ')}>
          <Tag color="blue">{record.variants?.length || 0} biến thể</Tag>
        </Tooltip>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Đang bán' : 'Ngừng bán'}
        </Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {canUpdate && (
            <Button
              type="primary"
              ghost
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          )}
          {canDelete && (
            <Popconfirm
              title="Sản phẩm này sẽ được ẩn đi. Tiếp tục?"
              onConfirm={() => handleDelete(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button type="primary" danger ghost icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: '16px' }}>
        <Title level={3} style={{ margin: 0 }}>Quản lý sản phẩm</Title>
        <Space wrap>
          <Input.Search
            placeholder="Tìm kiếm theo tên..."
            allowClear
            onSearch={handleSearch}
            style={{ width: 250 }}
          />
          <Select
            placeholder="Lọc theo danh mục"
            allowClear
            style={{ width: 200 }}
            onChange={handleCategoryFilter}
          >
            {flattenedCategories.map(c => (
              <Option key={c.id} value={c.id}>{c.name}</Option>
            ))}
          </Select>
          {canCreate && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm sản phẩm
            </Button>
          )}
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />

      <Modal
        title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" initialValues={{ isActive: true }}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="name"
                label="Tên sản phẩm"
                rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
              >
                <Input placeholder="ví dụ: Áo sơ mi nam công sở" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="categoryId"
                label="Danh mục"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
              >
                <Select placeholder="Chọn danh mục" allowClear>
                  {flattenedCategories
                    .filter(c => c.isActive)
                    .map(c => (
                      <Option key={c.id} value={c.id}>{c.name}</Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Mô tả sản phẩm">
            <TextArea rows={3} placeholder="Mô tả chi tiết sản phẩm..." />
          </Form.Item>

          <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
            <Switch checkedChildren="Đang bán" unCheckedChildren="Ngừng bán" />
          </Form.Item>

          <Divider titlePlacement="left">Hình ảnh (URLs)</Divider>
          <Form.List name="images">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'imageUrl']}
                      rules={[{ required: true, message: 'Nhập URL ảnh' }]}
                    >
                      <Input
                        placeholder="URL hình ảnh (nhập tay hoặc upload)"
                        style={{ width: 350 }}
                        addonAfter={
                          <Upload
                            showUploadList={false}
                            customRequest={async ({ file, onSuccess, onError }) => {
                              try {
                                const response = await fileApi.uploadFile(file);
                                const url = response.data || response;

                                const currentImages = form.getFieldValue('images');
                                currentImages[name] = { ...currentImages[name], imageUrl: url };
                                form.setFieldsValue({ images: currentImages });

                                message.success('Upload ảnh thành công');
                                onSuccess('ok');
                              } catch (err) {
                                message.error(err?.message || 'Lỗi khi tải ảnh lên');
                                onError(err);
                              }
                            }}
                          >
                            <Tooltip title="Tải ảnh lên">
                              <UploadOutlined style={{ cursor: 'pointer' }} />
                            </Tooltip>
                          </Upload>
                        }
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'isThumbnail']}
                      valuePropName="checked"
                    >
                      <Switch checkedChildren="Ảnh bìa" unCheckedChildren="Ảnh phụ" size="small" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Thêm URL hình ảnh
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Divider titlePlacement="left">Thông tin bán hàng</Divider>

          <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.variants !== curValues.variants}>
            {({ getFieldValue }) => {
              const variants = getFieldValue('variants') || [];
              const isSimpleProduct = variants.length === 0;

              return (
                <>
                  {isSimpleProduct ? (
                    <div style={{ background: '#f9f9f9', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                      <Text type="secondary" style={{ display: 'block', marginBottom: '12px' }}>
                        💡 Bạn đang ở chế độ <b>Sản phẩm đơn giản</b>. Nhập thông tin trực tiếp dưới đây hoặc bấm "Thêm biến thể" để quản lý chi tiết.
                      </Text>
                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item name="sku" label="Mã SKU" rules={[{ required: isSimpleProduct, message: 'Nhập SKU' }]}>
                            <Input placeholder="VD: SM-001" />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item name="price" label="Giá bán" rules={[{ required: isSimpleProduct, message: 'Nhập giá' }]}>
                            <InputNumber style={{ width: '100%' }} placeholder="Giá" min={0} />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item name="quantity" label="Số lượng kho" rules={[{ required: isSimpleProduct, message: 'Nhập SL' }]}>
                            <InputNumber style={{ width: '100%' }} placeholder="Số lượng" min={0} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </div>
                  ) : null}

                  <Form.List name="variants">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                            <Form.Item
                              {...restField}
                              name={[name, 'id']}
                              hidden
                            >
                              <Input />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'sku']}
                              rules={[{ required: true, message: 'Nhập SKU' }]}
                              label="SKU"
                            >
                              <Input placeholder="SKU (VD: AO-SM-01)" />
                            </Form.Item>
                            <Form.Item 
                              noStyle
                              shouldUpdate={(prevValues, curValues) => prevValues.categoryId !== curValues.categoryId}
                            >
                              {({ getFieldValue, setFieldsValue }) => {
                                const categoryId = getFieldValue('categoryId');
                                
                                // Logic kế thừa thuộc tính từ cha
                                const getInheritedAttributes = (catId) => {
                                  const allAttrs = [];
                                  const seenIds = new Set();
                                  let currentId = catId;
                                  while (currentId) {
                                    const cat = flattenedCategories.find(c => c.id === currentId);
                                    if (!cat) break;
                                    (cat.attributes || []).forEach(attr => {
                                      if (!seenIds.has(attr.id)) {
                                        allAttrs.push(attr);
                                        seenIds.add(attr.id);
                                      }
                                    });
                                    currentId = cat.parentId;
                                  }
                                  return allAttrs;
                                };

                                const attrs = categoryId ? getInheritedAttributes(categoryId) : [];

                                if (attrs.length === 0) {
                                  return (
                                    <div style={{ width: 300, color: '#999', fontStyle: 'italic', padding: '8px 0' }}>
                                      Danh mục này chưa có thuộc tính.
                                    </div>
                                  );
                                }

                                return (
                                  <Space wrap>
                                    {attrs.map(attr => (
                                      <Form.Item
                                        key={attr.id}
                                        {...restField}
                                        name={[name, `attr_${attr.id}`]}
                                        label={
                                          <span>
                                            {attr.name}
                                            {attr.isPricing && <Tooltip title="Thuộc tính ảnh hưởng đến giá"><span style={{ color: '#faad14', marginLeft: 4 }}>★</span></Tooltip>}
                                          </span>
                                        }
                                        rules={[{ required: true, message: `Chọn ${attr.name}` }]}
                                        style={{ width: 150, marginBottom: 0 }}
                                      >
                                        <Select 
                                          placeholder={attr.name}
                                          onChange={(val) => {
                                            // Sync back to hidden attributeValueIds if needed, 
                                            // but we'll do it during onFinish to keep it clean.
                                          }}
                                        >
                                          {attr.values?.map(val => (
                                            <Select.Option key={val.id} value={val.id}>
                                              {val.value}
                                            </Select.Option>
                                          ))}
                                        </Select>
                                      </Form.Item>
                                    ))}
                                  </Space>
                                );
                              }}
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'price']}
                              rules={[{ required: true, message: 'Nhập giá' }]}
                              label="Giá"
                            >
                              <InputNumber placeholder="Giá" min={0} />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'quantity']}
                              rules={[{ required: true, message: 'Nhập SL' }]}
                              label="Số lượng"
                            >
                              <InputNumber placeholder="SL" min={0} />
                            </Form.Item>
                            <MinusCircleOutlined onClick={() => remove(name)} />
                          </Space>
                        ))}
                        <Form.Item>
                          <Button
                            type="dashed"
                            onClick={() => {
                              // If converting from simple to variants, clear simple fields if needed
                              add();
                            }}
                            block
                            icon={<PlusOutlined />}
                          >
                            Thêm biến thể (Chuyển sang chế độ nhiều biến thể)
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                </>
              );
            }}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductManagePage;
