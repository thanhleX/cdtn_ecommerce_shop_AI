import { useState, useMemo } from 'react';
import { Card, Typography, Tag, Button, Radio, Space, Tooltip } from 'antd';
import { ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../../hooks/useCart';

const { Text } = Typography;

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // --- Logic Variant ---

  // 1. Lấy tất cả các thuộc tính và giá trị có sẵn từ các variants
  const attributes = useMemo(() => {
    const attrMap = {};
    product.variants?.forEach(variant => {
      variant.attributeValues?.forEach(av => {
        const name = av.attributeName;
        if (!attrMap[name]) {
          attrMap[name] = {
            name,
            values: new Set(),
            isPricing: av.isPricing
          };
        }
        attrMap[name].values.add(av.value);
      });
    });

    return Object.values(attrMap).map(attr => ({
      ...attr,
      values: Array.from(attr.values)
    }));
  }, [product.variants]);

  // 2. State lưu các option đang chọn
  const [selectedOptions, setSelectedOptions] = useState(() => {
    const initial = {};
    // Mặc định chọn giá trị của biến thể đầu tiên để đảm bảo có variant hợp lệ ngay từ đầu
    const firstVariant = product.variants?.[0];
    firstVariant?.attributeValues?.forEach(av => {
      initial[av.attributeName] = av.value;
    });
    return initial;
  });

  // 3. Tìm variant khớp với các option đã chọn
  const currentVariant = useMemo(() => {
    if (!product.variants) return null;

    // 1. Khớp chính xác
    const exactMatch = product.variants.find(variant => {
      return attributes.every(attr => {
        const selectedValue = selectedOptions[attr.name];
        if (!selectedValue) return true;
        return variant.attributeValues?.some(av => av.attributeName === attr.name && av.value === selectedValue);
      });
    });

    if (exactMatch) return exactMatch;

    // 2. Khớp theo Pricing attributes
    const pricingMatch = product.variants.find(variant => {
      const pricingAttributes = attributes.filter(a => a.isPricing);
      if (pricingAttributes.length === 0) return false;
      return pricingAttributes.every(attr => {
        const selectedValue = selectedOptions[attr.name];
        if (!selectedValue) return true;
        return variant.attributeValues?.some(av => av.attributeName === attr.name && av.value === selectedValue);
      });
    });

    return pricingMatch || product.variants[0];
  }, [product.variants, selectedOptions, attributes]);

  // --- Render Helpers ---

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const thumbnail = product.images?.find(img => img.isThumbnail)?.imageUrl
    || product.images?.[0]?.imageUrl
    || 'https://dummyimage.com/300x200/cccccc/000000&text=No+Image';

  const handleOptionChange = (attrName, value) => {
    setSelectedOptions(prev => ({
      ...prev,
      [attrName]: value
    }));
  };

  return (
    <Card
      hoverable
      className="product-card-modern"
      style={{
        borderRadius: 12,
        border: '1px solid #f0f0f0',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      bodyStyle={{
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        flex: 1
      }}
      cover={
        <div
          onClick={() => navigate(`/products/slug/${product.slug || product.id}`)}
          style={{
            height: 180,
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 12,
            cursor: 'pointer'
          }}
        >
          <img
            alt={product.name}
            src={thumbnail}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain'
            }}
          />
        </div>
      }
    >
      {/* NAME */}
      <Link
        to={`/products/slug/${product.slug || product.id}`}
        style={{
          fontWeight: 600,
          fontSize: 18,
          lineHeight: '24px',
          color: '#222',
          marginBottom: 6,
          textAlign: 'left'
        }}
      >
        {product.name}
      </Link>

      {/* VARIANTS LEFT-ALIGNED */}
      <div style={{ marginBottom: 10 }}>
        {attributes.map(attr => (
          <div key={attr.name} style={{ marginBottom: 6, textAlign: 'left' }}>

            {/* LABEL */}
            <div style={{
              fontSize: 13,
              color: '#888',
              marginBottom: 4
            }}>
              {attr.name}
            </div>

            {/* OPTIONS */}
            <Radio.Group
              size="small"
              value={selectedOptions[attr.name]}
              onChange={(e) =>
                attr.isPricing && handleOptionChange(attr.name, e.target.value)
              }
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 4,
                justifyContent: 'flex-start' // 🔥 FIX: căn trái
              }}
              optionType="button"
              buttonStyle="solid"
              disabled={!attr.isPricing}
            >
              {attr.values.map(val => (
                <Radio.Button
                  key={val}
                  value={val}
                  style={{
                    fontSize: 13,
                    padding: '0 10px',
                    borderRadius: 6
                  }}
                >
                  {val}
                </Radio.Button>
              ))}
            </Radio.Group>
          </div>
        ))}
      </div>

      {/* PRICE */}
      <div style={{ marginTop: 'auto', textAlign: 'left' }}>
        <div style={{
          fontSize: 20,
          fontWeight: 700,
          color: '#d70018'
        }}>
          {currentVariant
            ? formatPrice(currentVariant.price)
            : 'Liên hệ'}
        </div>

        {currentVariant?.quantity <= 0 && (
          <div style={{ fontSize: 12, color: '#999' }}>
            Hết hàng
          </div>
        )}
      </div>

      {/* ACTION */}
      <Button
        type="primary"
        block
        style={{
          marginTop: 8,
          borderRadius: 6,
          fontWeight: 500
        }}
        icon={<ShoppingCartOutlined />}
        disabled={!currentVariant || currentVariant.quantity <= 0}
        onClick={() =>
          currentVariant && addToCart(currentVariant.id, 1)
        }
      >
        Thêm vào giỏ
      </Button>
    </Card>
  );
};

export default ProductCard;
