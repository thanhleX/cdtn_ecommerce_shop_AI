import React, { useEffect, useState } from 'react';
import { Typography, Card, Divider } from 'antd';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import ReviewStats from './ReviewStats';
import reviewApi from '../../../../api/reviewApi';

const { Title } = Typography;

const ReviewSection = ({ productId }) => {
  const [eligible, setEligible] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const checkEligible = async () => {
      try {
        const res = await reviewApi.checkEligibility(productId);
        // ApiResponse format: { data: boolean, success: true }
        setEligible(res.data);
      } catch (err) {
        setEligible(false);
      }
    };
    if (productId) {
      checkEligible();
    }
  }, [productId, refreshKey]);

  const handleReviewSuccess = () => {
    setEligible(false); // Hide form after review
    setRefreshKey(prev => prev + 1); // Refresh list
  };

  return (
    <Card bordered={false} style={{ marginTop: 32, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <Title level={3} style={{ marginBottom: 24, textAlign: 'left' }}>Đánh giá sản phẩm</Title>
      
      <ReviewStats productId={productId} refreshKey={refreshKey} />

      {eligible && (
        <div style={{ marginBottom: 32 }}>
          <ReviewForm productId={productId} onSuccess={handleReviewSuccess} />
          <Divider />
        </div>
      )}

      <ReviewList productId={productId} refreshKey={refreshKey} onReviewUpdate={handleReviewSuccess} />
    </Card>
  );
};

export default ReviewSection;
