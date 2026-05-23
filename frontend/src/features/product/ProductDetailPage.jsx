import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Row, Col, Typography, Button, Spin, Tag, InputNumber, Divider, Breadcrumb, Tabs, Radio, Space, message, Tooltip } from 'antd';
import { Helmet } from 'react-helmet-async';
import { ShoppingCartOutlined, HomeOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useProducts } from '../../hooks/useProducts';
import { useCart } from '../../hooks/useCart';
import ProductGallery from './components/ProductGallery';

import categoryApi from '../../api/categoryApi';
import CategoryBreadcrumb from '../../components/common/CategoryBreadcrumb';
import ReviewSection from './components/review/ReviewSection';

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
      const thumbnail = product.images?.find(img => img.isThumbnail)?.imageUrl || product.images?.[0]?.imageUrl || null;
      await addToCart(selectedVariant.id, quantity, {
        productName: product.name,
        variantAttributes: selectedVariant.attributeValues?.map(av => av.value).join(', ') || '',
        price: selectedVariant.price,
        imageUrl: thumbnail
      });
      setQuantity(1);
    }
  };

  const handleOptionChange = (attrName, value) => {
    const newOptions = { ...selectedOptions, [attrName]: value };

    // Tìm variant khớp tốt nhất với lựa chọn mới
    // Ưu tiên các thuộc tính đã chọn từ trên xuống dưới
    const bestMatch = product.variants.find(v => {
      return v.attributeValues?.some(av => av.attributeName === attrName && av.value === value);
    }) || product.variants[0];

    // Cập nhật lại toàn bộ selectedOptions từ variant tìm được để đảm bảo tính hợp lệ
    const updatedOptions = {};
    bestMatch.attributeValues?.forEach(av => {
      updatedOptions[av.attributeName] = av.value;
    });

    // Giữ lại các lựa chọn cũ nếu chúng vẫn hợp lệ với lựa chọn mới
    attributes.forEach(attr => {
      const currentVal = attr.name === attrName ? value : selectedOptions[attr.name];
      const isValidWithNew = product.variants.some(v =>
        v.attributeValues?.some(av => av.attributeName === attrName && av.value === value) &&
        v.attributeValues?.some(av => av.attributeName === attr.name && av.value === currentVal)
      );
      if (isValidWithNew) {
        updatedOptions[attr.name] = currentVal;
      }
    });

    setSelectedOptions(updatedOptions);
  };

  const isOptionDisabled = (attrName, value) => {
    if (!product || !product.variants) return false;

    const currentIndex = attributes.findIndex(a => a.name === attrName);
    // Nếu là thuộc tính đầu tiên, chỉ check xem nó có tồn tại trong bất kỳ variant nào không
    if (currentIndex === 0) {
      return !product.variants.some(v =>
        v.attributeValues?.some(av => av.attributeName === attrName && av.value === value)
      );
    }

    // Nếu không phải đầu tiên, check xem nó có đi kèm được với các thuộc tính TRƯỚC NÓ không
    const prevAttrs = attributes.slice(0, currentIndex);
    return !product.variants.some(variant => {
      const matchPrev = prevAttrs.every(attr => {
        const selectedVal = selectedOptions[attr.name];
        return variant.attributeValues?.some(av => av.attributeName === attr.name && av.value === selectedVal);
      });
      const matchCurrent = variant.attributeValues?.some(av => av.attributeName === attrName && av.value === value);
      return matchPrev && matchCurrent;
    });
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
              <Title level={1} style={{ display: 'flex', alignItems: 'start', marginTop: 0, fontSize: 32 }}>{product.name}</Title>

              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <Text type="secondary">Mã SKU: <Text strong>{selectedVariant?.sku || 'N/A'}</Text></Text>
                <Divider orientation="vertical" />
              </div>

              <div style={{ background: '#f0f5ff', padding: '24px', borderRadius: 12, border: '1px solid #d6e4ff' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                  <Title level={1} style={{ margin: 0, fontSize: selectedVariant?.quantity < 1 ? 28 : 36, color: selectedVariant?.quantity < 1 ? '#ff4d4f' : '#1890ff' }}>
                    {selectedVariant?.quantity < 1 
                      ? 'Ngừng kinh doanh' 
                      : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedVariant?.price || 0)
                    }
                  </Title>
                  {product.discount > 0 && selectedVariant?.quantity > 0 && (
                    <Tag color="blue" style={{ fontSize: 16, padding: '4px 12px' }}>-{product.discount}%</Tag>
                  )}
                </div>
              </div>

              <Divider />

              {/* --- Variant Selectors --- */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {attributes.slice(0, 2).map(attr => (
                  <div key={attr.name}>
                    <Text strong style={{ display: 'flex', alignItems: 'start', marginBottom: 12, textTransform: 'uppercase', fontSize: 12, color: '#8c8c8c' }}>
                      {attr.name} {attr.isPricing && <Tooltip title="Lựa chọn này làm thay đổi giá"><span style={{ color: '#faad14', marginLeft: 4 }}>★</span></Tooltip>}
                    </Text>
                    <Radio.Group
                      size="large"
                      value={selectedOptions[attr.name]}
                      onChange={(e) => handleOptionChange(attr.name, e.target.value)}
                      optionType="button"
                      buttonStyle="solid"
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 8,
                        justifyContent: 'flex-start',
                        width: '100%'
                      }}
                    >
                      {attr.values.map(val => (
                        <Radio.Button
                          key={val}
                          value={val}
                          disabled={isOptionDisabled(attr.name, val)}
                          style={{
                            borderRadius: 8,
                            minWidth: 80,
                            textAlign: 'center',
                            opacity: isOptionDisabled(attr.name, val) ? 0.5 : 1,
                            cursor: isOptionDisabled(attr.name, val) ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {val}
                        </Radio.Button>
                      ))}
                    </Radio.Group>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 24 }}>
                <Text strong style={{ display: 'flex', alignItems: 'start', marginBottom: 12, textTransform: 'uppercase', fontSize: 12, color: '#8c8c8c' }}>
                  SỐ LƯỢNG
                </Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d9d9d9', borderRadius: 8, overflow: 'hidden' }}>
                    <Button
                      type="text"
                      icon={<MinusOutlined />}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={!selectedVariant || selectedVariant.quantity < 1 || quantity <= 1}
                      style={{ border: 'none', borderRadius: 0, height: 40, width: 40, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    />
                    <InputNumber
                      min={1}
                      max={selectedVariant?.quantity || 1}
                      value={quantity}
                      onChange={(val) => setQuantity(val || 1)}
                      disabled={!selectedVariant || selectedVariant.quantity < 1}
                      controls={false}
                      bordered={false}
                      style={{ width: 60 }}
                      styles={{
                        input: {
                          textAlign: 'center',
                          height: 40,
                          padding: 0,
                        },
                      }}
                    />
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={() => setQuantity(Math.min(selectedVariant?.quantity || 1, quantity + 1))}
                      disabled={!selectedVariant || selectedVariant.quantity < 1 || quantity >= (selectedVariant?.quantity || 1)}
                      style={{ border: 'none', borderRadius: 0, height: 40, width: 40, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    />
                  </div>
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
              label: 'CHI TIẾT SẢN PHẨM',
              key: '1',
              children: (
                <div
                  style={{ fontSize: 16, lineHeight: '1.8', color: '#4a4a4a', marginTop: 16, textAlign: 'start' }}
                  dangerouslySetInnerHTML={{ __html: product.description?.replace(/\n/g, '<br/>') || 'Chưa có mô tả' }}
                />
              )
            },
            {
              label: 'THÔNG SỐ KỸ THUẬT',
              key: '2',
              children: (
                <div style={{ marginTop: 16, maxWidth: 800 }}>
                  <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden' }}>
                    {selectedVariant?.attributeValues?.map((av, index) => (
                      <div
                        key={av.attributeName}
                        style={{
                          display: 'flex',
                          padding: '16px 24px',
                          backgroundColor: index % 2 === 0 ? '#fafafa' : '#fff',
                          borderBottom: index < (selectedVariant.attributeValues.length - 1) ? '1px solid #f0f0f0' : 'none'
                        }}
                      >
                        <Text type="secondary" style={{ width: '40%', fontSize: 14 }}>{av.attributeName}</Text>
                        <Text strong style={{ width: '60%', fontSize: 14 }}>
                          {av.value?.includes(':') ? av.value.split(':')[1].trim() : av.value}
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }
          ]}
        />
      </div>

      {product && <ReviewSection productId={product.id} />}
    </div>
  );
};

export default ProductDetailPage;
