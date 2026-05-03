import React, { useState } from 'react';
import { Form, Rate, Input, Button, message } from 'antd';
import reviewApi from '../../../../api/reviewApi';

const { TextArea } = Input;

const ReviewForm = ({ productId, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await reviewApi.createReview({
        productId,
        rating: values.rating,
        comment: values.comment
      });
      message.success('Cảm ơn bạn đã gửi đánh giá!');
      form.resetFields();
      if (onSuccess) onSuccess();
    } catch (error) {
      message.error(error?.message || 'Không thể gửi đánh giá');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{ rating: 5 }}
    >
      <Form.Item
        name="rating"
        label="Đánh giá của bạn"
        rules={[{ required: true, message: 'Vui lòng chọn số sao' }]}
        style={{ textAlign: 'left' }}
      >
        <Rate style={{ fontSize: 24 }} />
      </Form.Item>
      
      <Form.Item
        name="comment"
        label="Nhận xét"
        rules={[{ required: true, message: 'Vui lòng nhập nhận xét' }]}
        style={{ textAlign: 'left' }}
      >
        <TextArea rows={4} placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..." />
      </Form.Item>

      <Form.Item style={{ textAlign: 'left' }}>
        <Button type="primary" htmlType="submit" loading={loading} size="large" style={{ borderRadius: 8 }}>
          Gửi đánh giá
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ReviewForm;
