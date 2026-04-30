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
      className="product-card-premium"
      style={{
        borderRadius: 12,
        border: '1px solid rgba(0,0,0,0.04)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
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
            position: 'relative',
            height: 240,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 12,
            cursor: 'pointer',
            overflow: 'hidden',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        >
          <img
            alt={product.name}
            src={thumbnail}
            className="product-image"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              transition: 'transform 0.4s ease'
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

      {/* RATING */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 13, color: '#888', textAlign: 'left' }}>
        <span style={{ color: '#faad14', fontWeight: 'bold' }}>
          ★ {(product.averageRating && product.averageRating > 0 ? product.averageRating : 5.0).toFixed(1)}
        </span>
        <span>({product.reviewCount || 0} đánh giá)</span>
      </div>

      {/* VARIANTS LEFT-ALIGNED */}
      <div style={{ marginBottom: 10 }}>
        {attributes.slice(0, 2).map(attr => (
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
                justifyContent: 'flex-start'
              }}
              optionType="button"
              buttonStyle="solid"
              disabled={!attr.isPricing}
            >
              {attr.values.map(val => {
                const isColorAttr =
                  attr.name.toLowerCase().includes('màu') ||
                  attr.name.toLowerCase().includes('color');

                if (isColorAttr) {
                  const normalizeColor = (str) =>
                    str
                      ?.toLowerCase()
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .trim();

                  const COLOR_MAP = {
                    do: '#ff4d4f',
                    'do dam': '#cf1322',
                    xanh: '#1890ff',
                    'xanh duong': '#1890ff',
                    'xanh la': '#52c41a',
                    den: '#000000',
                    trang: '#ffffff',
                    vang: '#fadb14',
                    hong: '#eb2f96',
                    tim: '#722ed1',
                    cam: '#fa8c16',
                    xam: '#bfbfbf',
                    nau: '#873800',
                    bac: '#d9d9d9',
                    gold: '#ffd700',
                    titan: '#878681',
                    silver: '#d9d9d9',
                    gray: '#bfbfbf',
                    blue: '#1890ff',
                    red: '#ff4d4f',
                    green: '#52c41a',
                    black: '#000000',
                    white: '#ffffff'
                  };

                  const normalized = normalizeColor(val);
                  const color = COLOR_MAP[normalized];

                  return (
                    <Tooltip key={val} title={val}>
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: color || '#ccc',
                          border:
                            color === '#ffffff'
                              ? '1px solid #ccc'
                              : '1px solid #d9d9d9',
                          cursor: 'default'
                        }}
                      />
                    </Tooltip>
                  );
                }

                return (
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
                );
              })}
            </Radio.Group>
          </div>
        ))}
      </div>

      {/* PRICE */}
      <div style={{ marginTop: 'auto', textAlign: 'left' }}>
        <div style={{
          fontSize: 20,
          fontWeight: 700,
          color: '#1890ff'
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
        size="large"
        style={{
          marginTop: 12,
          borderRadius: 8,
          fontWeight: 600
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
