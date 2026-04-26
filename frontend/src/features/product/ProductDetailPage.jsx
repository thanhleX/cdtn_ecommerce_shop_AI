import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Row, Col, Typography, Button, Spin, Tag, InputNumber, Divider, Breadcrumb, Tabs, Radio, Space, message, Tooltip } from 'antd';
import { Helmet } from 'react-helmet-async';
import { ShoppingCartOutlined, HomeOutlined } from '@ant-design/icons';
import { useProducts } from '../../hooks/useProducts';
import { useCart } from '../../hooks/useCart';
import ProductGallery from './components/ProductGallery';

import categoryApi from '../../api/categoryApi';
import CategoryBreadcrumb from '../../components/common/CategoryBreadcrumb';

const { Title, Text } = Typography;

const ProductDetailPage = () => {
  const { slug } = useParams();
  const { getProductBySlug } = useProducts();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryApi.getAllCategories({ activeOnly: true });
        setCategories(res.data || res);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const data = await getProductBySlug(slug);
        if (isMounted) {
          setProduct(data);
          
          if (data.variants && data.variants.length > 0) {
            const firstVariant = data.variants[0];
            const initial = {};
            firstVariant.attributeValues?.forEach(av => {
              initial[av.attributeName] = av.value;
            });
            setSelectedOptions(initial);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error(error);
          message.error("Không thể tải thông tin sản phẩm");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    if (slug) fetchDetail();
    return () => { isMounted = false; };
  }, [slug, getProductBySlug]);

  // --- Logic Variant ---
  
  const attributes = useMemo(() => {
    if (!product) return [];
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
  }, [product]);

  const selectedVariant = useMemo(() => {
    if (!product || !product.variants) return null;
    
    // 1. Cố gắng tìm variant khớp chính xác TẤT CẢ các options đã chọn
    const exactMatch = product.variants.find(variant => {
      return attributes.every(attr => {
        const selectedValue = selectedOptions[attr.name];
        if (!selectedValue) return true;
        return variant.attributeValues?.some(av => av.attributeName === attr.name && av.value === selectedValue);
      });
    });

    if (exactMatch) return exactMatch;

    // 2. Nếu không khớp chính xác, tìm variant khớp các thuộc tính ẢNH HƯỞNG GIÁ (isPricing = true)
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
  }, [product, selectedOptions, attributes]);

  const handleAddToCart = async () => {
    if (selectedVariant) {
      await addToCart(selectedVariant.id, quantity);
      setQuantity(1);
    }
  };

  const handleOptionChange = (attrName, value) => {
    setSelectedOptions(prev => ({
      ...prev,
      [attrName]: value
    }));
  };

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product?.name,
    "image": product?.images?.map(img => img.imageUrl),
    "description": product?.description?.substring(0, 160),
    "sku": selectedVariant?.sku,
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "VND",
      "price": selectedVariant?.price,
      "availability": selectedVariant?.quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;
  if (!product) return <div style={{ textAlign: 'center', padding: 100 }}><Title level={3}>Không tìm thấy sản phẩm</Title></div>;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
      <Helmet>
        <title>{`${product.name} ${selectedVariant?.sku ? `- ${selectedVariant.sku}` : ''} | VietTech Store`}</title>
        <meta name="description" content={`Mua ngay ${product.name} chính hãng. ${product.description?.substring(0, 150)}...`} />
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      </Helmet>

      <CategoryBreadcrumb 
        currentCategoryId={product.categoryId} 
        categories={categories}
        extraItems={[{ title: product.name }]}
      />

      <div style={{ background: '#fff', padding: '40px 32px', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Row gutter={[64, 32]}>
          <Col xs={24} lg={10}>
            <ProductGallery images={product.images || []} />
          </Col>
          
          <Col xs={24} lg={14}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Tag color="blue" style={{ width: 'fit-content' }}>{product.categoryName}</Tag>
              <Title level={1} style={{ marginTop: 0, fontSize: 32 }}>{product.name}</Title>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <Text type="secondary">Mã SKU: <Text strong>{selectedVariant?.sku || 'N/A'}</Text></Text>
                <Divider type="vertical" />
                <Text type="secondary">Đã bán: <Text strong>{product.soldCount || 0}</Text></Text>
              </div>

              <div style={{ background: '#fff5f5', padding: '24px', borderRadius: 12, border: '1px solid #ffe8e8' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                  <Title level={1} type="danger" style={{ margin: 0, fontSize: 36 }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedVariant?.price || 0)}
                  </Title>
                  {product.discount > 0 && (
                    <Tag color="error" style={{ fontSize: 16, padding: '4px 12px' }}>-{product.discount}%</Tag>
                  )}
                </div>
              </div>

              <Divider />

              {/* --- Variant Selectors --- */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {attributes.map(attr => (
                  <div key={attr.name}>
                    <Text strong style={{ display: 'block', marginBottom: 12, textTransform: 'uppercase', fontSize: 12, color: '#8c8c8c' }}>
                      {attr.name} {attr.isPricing && <Tooltip title="Lựa chọn này làm thay đổi giá"><span style={{ color: '#faad14', marginLeft: 4 }}>★</span></Tooltip>}
                    </Text>
                    <Radio.Group 
                      size="large" 
                      value={selectedOptions[attr.name]}
                      onChange={(e) => handleOptionChange(attr.name, e.target.value)}
                      optionType="button"
                      buttonStyle="solid"
                    >
                      <Space wrap>
                        {attr.values.map(val => (
                          <Radio.Button 
                            key={val} 
                            value={val}
                            style={{ 
                              borderRadius: 8,
                              textAlign: 'center',
                              minWidth: 80
                            }}
                          >
                            {val}
                          </Radio.Button>
                        ))}
                      </Space>
                    </Radio.Group>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 24 }}>
                <Text strong style={{ display: 'block', marginBottom: 12, textTransform: 'uppercase', fontSize: 12, color: '#8c8c8c' }}>
                  SỐ LƯỢNG
                </Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <InputNumber
                    size="large"
                    min={1}
                    max={selectedVariant?.quantity || 1}
                    value={quantity}
                    onChange={setQuantity}
                    disabled={!selectedVariant || selectedVariant.quantity < 1}
                    style={{ width: 120, borderRadius: 8 }}
                  />
                  <Text type="secondary">
                    {selectedVariant?.quantity > 0 ? `${selectedVariant.quantity} sản phẩm có sẵn` : 'Hết hàng'}
                  </Text>
                </div>
              </div>

              <div style={{ marginTop: 32, display: 'flex', gap: 16 }}>
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant.quantity < 1}
                  style={{ 
                    flex: 1, 
                    height: 56, 
                    fontSize: 18, 
                    fontWeight: 700, 
                    borderRadius: 12,
                    boxShadow: '0 4px 14px rgba(24, 144, 255, 0.4)'
                  }}
                >
                  {selectedVariant?.quantity > 0 ? 'THÊM VÀO GIỎ HÀNG' : 'HẾT HÀNG'}
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <div style={{ background: '#fff', padding: 40, borderRadius: 16, marginTop: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Tabs 
          size="large"
          items={[
            {
              label: 'MÔ TẢ SẢN PHẨM',
              key: '1',
              children: (
                <div 
                  style={{ fontSize: 16, lineHeight: '1.8', color: '#4a4a4a', padding: '16px 0' }} 
                  dangerouslySetInnerHTML={{ __html: product.description?.replace(/\n/g, '<br/>') || 'Chưa có mô tả' }} 
                />
              )
            }
          ]} 
        />
      </div>
    </div>
  );
};

export default ProductDetailPage;
