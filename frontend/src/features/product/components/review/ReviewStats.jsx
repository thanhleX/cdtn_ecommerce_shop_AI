import React, { useEffect, useState } from 'react';
import { Row, Col, Typography, Rate, Progress } from 'antd';
import reviewApi from '../../../../api/reviewApi';

const { Title, Text } = Typography;

const ReviewStats = ({ productId, refreshKey }) => {
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    fiveStarCount: 0,
    fourStarCount: 0,
    threeStarCount: 0,
    twoStarCount: 0,
    oneStarCount: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await reviewApi.getProductReviewStats(productId);
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch review stats', err);
      }
    };
    if (productId) {
      fetchStats();
    }
  }, [productId, refreshKey]);

  if (stats.totalReviews === 0) {
    return null;
  }

  const ratings = [
    { star: 5, count: stats.fiveStarCount },
    { star: 4, count: stats.fourStarCount },
    { star: 3, count: stats.threeStarCount },
    { star: 2, count: stats.twoStarCount },
    { star: 1, count: stats.oneStarCount }
  ];

  return (
    <div style={{ padding: '24px 0', borderBottom: '1px solid #f0f0f0', marginBottom: 24 }}>
      <Row gutter={[32, 24]} align="middle">
        <Col xs={24} md={8} style={{ textAlign: 'center' }}>
          <Title level={1} style={{ fontSize: 48, margin: 0, color: '#faad14' }}>
            {stats.averageRating.toFixed(1)} <span style={{ fontSize: 24, color: '#000' }}>/ 5</span>
          </Title>
          <Rate disabled allowHalf value={stats.averageRating} style={{ fontSize: 24, margin: '12px 0' }} />
          <div style={{ color: '#8c8c8c' }}>{stats.totalReviews} đánh giá</div>
        </Col>
        <Col xs={24} md={16}>
          {ratings.map(r => {
            const percent = stats.totalReviews > 0 ? (r.count / stats.totalReviews) * 100 : 0;
            return (
              <div key={r.star} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ width: 60, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {r.star} <span style={{ color: '#faad14' }}>★</span>
                </span>
                <Progress percent={percent} showInfo={false} style={{ flex: 1, margin: '0 16px' }} strokeColor="#faad14" />
                <span style={{ width: 40, textAlign: 'right', color: '#8c8c8c' }}>{r.count}</span>
              </div>
            );
          })}
        </Col>
      </Row>
    </div>
  );
};

export default ReviewStats;
