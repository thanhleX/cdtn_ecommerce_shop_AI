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
  Select,
  InputNumber,
  DatePicker,
  Row,
  Col
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import voucherApi from '../../../api/voucherApi';
import usePermission from '../../../hooks/usePermission';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

const VoucherManagePage = () => {
  const { hasPermission } = usePermission();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const fetchVouchers = useCallback(async (page = 1, pageSize = 10, keyword = searchText) => {
    setLoading(true);
    try {
      const response = await voucherApi.getAll({ 
        page: page - 1, 
        size: pageSize,
        sortBy: 'id',
        direction: 'desc',
        keyword: keyword || undefined
      });
      const data = response.data || response;
      setVouchers(data.content);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: data.totalElements,
      });
    } catch (error) {
      message.error(error?.message || 'Không thể lấy danh sách voucher');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const handleTableChange = (newPagination) => {
    fetchVouchers(newPagination.current, newPagination.pageSize, searchText);
  };

  const handleAdd = () => {
    setEditingVoucher(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingVoucher(record);
    form.setFieldsValue({
      ...record,
      startDate: record.startDate ? dayjs(record.startDate) : null,
      endDate: record.endDate ? dayjs(record.endDate) : null,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await voucherApi.delete(id);
      message.success('Xóa voucher thành công');
      fetchVouchers(pagination.current, pagination.pageSize, searchText);
    } catch (error) {
      message.error(error?.message || 'Lỗi khi xóa voucher');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Convert dayjs to string
      const payload = {
        ...values,
        startDate: values.startDate ? values.startDate.toISOString() : null,
        endDate: values.endDate ? values.endDate.toISOString() : null,
      };

      if (editingVoucher) {
        await voucherApi.update(editingVoucher.id, payload);
        message.success('Cập nhật voucher thành công');
      } else {
        await voucherApi.create(payload);
        message.success('Thêm voucher thành công');
      }
      setIsModalVisible(false);
      fetchVouchers(pagination.current, pagination.pageSize, searchText);
    } catch (error) {
      if (error?.errorFields) return;
      message.error(error?.message || 'Lỗi khi lưu voucher');
    }
  };

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type) => type === 'PERCENT' ? 'Phần trăm (%)' : 'Cố định (đ)'
    },
    {
      title: 'Giá trị',
      dataIndex: 'value',
      key: 'value',
      render: (val, record) => record.type === 'PERCENT' ? `${val}%` : `${val.toLocaleString()}đ`
    },
    {
      title: 'Giá trị tối thiểu',
      dataIndex: 'minOrderValue',
      key: 'minOrderValue',
      render: (val) => val ? `${val.toLocaleString()}đ` : '-'
    },
    {
      title: 'Hết hạn',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : 'Vô thời hạn'
    },
    {
      title: 'Lượt dùng',
      key: 'usage',
      render: (_, record) => `${record.usageLimit || '∞'} (Max ${record.usagePerUser}/user)`
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
          {status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}
        </Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          {hasPermission('voucher:manage') && (
            <>
              <Button type="primary" ghost icon={<EditOutlined />} onClick={() => handleEdit(record)} />
              <Popconfirm
                title="Dừng hoạt động voucher này?"
                onConfirm={() => handleDelete(record.id)}
                okText="Dừng"
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
        <Title level={3}>Quản lý Voucher / Coupon</Title>
        <Space>
          <Input.Search
            placeholder="Tìm theo mã voucher..."
            allowClear
            onSearch={(value) => {
              setSearchText(value);
              setPagination(prev => ({ ...prev, current: 1 }));
              fetchVouchers(1, pagination.pageSize, value);
            }}
            style={{ width: 250 }}
          />
          {hasPermission('voucher:manage') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm Voucher
            </Button>
          )}
        </Space>
      </div>

      <Table 
        columns={columns} 
        dataSource={vouchers} 
        rowKey="id" 
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />

      <Modal
        title={editingVoucher ? 'Chỉnh sửa Voucher' : 'Thêm Voucher mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ status: 'ACTIVE', usagePerUser: 1, type: 'PERCENT' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="Mã Voucher"
                rules={[{ required: true, message: 'Vui lòng nhập mã!' }]}
              >
                <Input placeholder="ví dụ: GIAM20K, TET2024..." />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="type"
                label="Loại giảm giá"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="PERCENT">Phần trăm (%)</Option>
                  <Option value="FIXED">Giá tiền cố định</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item noStyle shouldUpdate={(prev, curr) => prev.type !== curr.type}>
                {({ getFieldValue }) => {
                  const type = getFieldValue('type');
                  return (
                    <Form.Item
                      name="value"
                      label="Giá trị"
                      rules={[
                        { required: true, message: 'Vui lòng nhập giá trị!' },
                        type === 'PERCENT' ? { type: 'number', max: 100, message: 'Giá trị không vượt quá 100%' } : {}
                      ]}
                    >
                      <InputNumber style={{ width: '100%' }} min={0} max={type === 'PERCENT' ? 100 : undefined} />
                    </Form.Item>
                  );
                }}
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="maxDiscount" label="Giảm tối đa (nếu là %)">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="Bỏ trống nếu không giới hạn" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="minOrderValue" label="Giá trị đơn tối thiểu">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="Bỏ trống nếu không giới hạn" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="startDate" label="Ngày bắt đầu">
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endDate" label="Ngày kết thúc">
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="usageLimit" label="Tổng lượt dùng hệ thống">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="∞" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="usagePerUser" label="Lượt dùng mỗi User">
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="Trạng thái">
                <Select>
                  <Option value="ACTIVE">Hoạt động</Option>
                  <Option value="INACTIVE">Tạm khóa</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default VoucherManagePage;
