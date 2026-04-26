import { useState } from 'react';
import { Image, Row, Col } from 'antd';

const ProductGallery = ({ images = [] }) => {
  const defaultImage = 'https://dummyimage.com/500/cccccc/000000&text=No+Image';
  const displayImages = images.length > 0 ? [...images].sort((a, b) => a.sortOrder - b.sortOrder) : [{ id: 'default', imageUrl: defaultImage }];
  
  const [mainImage, setMainImage] = useState(displayImages[0].imageUrl);

  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: 16, border: '1px solid #f0f0f0' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center', backgroundColor: '#fafafa', borderRadius: 8 }}>
        <Image 
          src={mainImage} 
          height={400} 
          style={{ objectFit: 'contain' }} 
        />
      </div>
      
      <Row gutter={[12, 12]} justify="center">
        {displayImages.map((img, index) => (
          <Col span={4} key={img.id || index}>
            <div 
              style={{ 
                border: mainImage === img.imageUrl ? '2px solid #1890ff' : '1px solid #d9d9d9',
                borderRadius: 6,
                cursor: 'pointer',
                padding: 4,
                opacity: mainImage === img.imageUrl ? 1 : 0.6,
                transition: 'all 0.3s'
              }}
              onClick={() => setMainImage(img.imageUrl)}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = mainImage === img.imageUrl ? '1' : '0.6'}
            >
              <img 
                src={img.imageUrl} 
                alt={`Hỉnh ảnh ${index + 1}`} 
                style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: 4 }} 
              />
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ProductGallery;
