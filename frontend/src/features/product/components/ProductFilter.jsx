import { Checkbox, Divider, Slider, Typography, Space, Button, Collapse, Tag } from 'antd';
import { useState, useEffect, useMemo } from 'react';

const { Title, Text } = Typography;

const ProductFilter = ({
  attributeGroups = [], // Danh sách các thuộc tính kèm giá trị (đã gom nhóm theo category)
  selectedAttributeValues = [],
  priceRange,
  dynamicMinPrice,
  dynamicMaxPrice,
  onFilterChange
}) => {
  const min = dynamicMinPrice !== undefined && dynamicMinPrice !== null ? Number(dynamicMinPrice) : 0;
  const max = dynamicMaxPrice !== undefined && dynamicMaxPrice !== null ? Number(dynamicMaxPrice) : 50000000;

  const [localPrice, setLocalPrice] = useState(priceRange || [min, max]);

  useEffect(() => {
    setLocalPrice(priceRange || [min, max]);
  }, [JSON.stringify(priceRange), min, max]);

  const toggleAttributeValue = (valueId) => {
    let newValues = [...selectedAttributeValues];
    if (newValues.includes(valueId)) {
      newValues = newValues.filter(v => v !== valueId);
    } else {
      newValues.push(valueId);
    }
    onFilterChange?.({ 
      priceRange: localPrice, 
      attributeValueIds: newValues 
    });
  };

  const applyPriceFilter = () => {
    onFilterChange?.({ 
      priceRange: localPrice, 
      attributeValueIds: selectedAttributeValues 
    });
  };

  return (
    <div style={{ padding: '24px', background: '#fff', borderRadius: 16, border: '1px solid #f0f0f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
      <Title level={5} style={{ marginBottom: 20 }}>Khoảng giá</Title>
      <Slider
        range
        step={10000}
        min={min}
        max={max}
        value={localPrice}
        onChange={setLocalPrice}
        tooltip={{ formatter: (v) => `${new Intl.NumberFormat('vi-VN').format(v)}đ` }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>Từ: <Text strong>{new Intl.NumberFormat('vi-VN').format(localPrice[0])}đ</Text></Text>
        <Text type="secondary" style={{ fontSize: 12 }}>Đến: <Text strong>{new Intl.NumberFormat('vi-VN').format(localPrice[1])}đ</Text></Text>
      </div>
      <Button type="primary" onClick={applyPriceFilter} block style={{ borderRadius: 8, height: 40 }}>
        Áp dụng lọc giá
      </Button>

      {/* --- Attribute Filters --- */}
      {attributeGroups.length > 0 && (
        <>
          <Divider />
          <Title level={5} style={{ marginBottom: 20 }}>Lọc theo thông số</Title>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {attributeGroups.map(attr => (
              <div key={attr.id}>
                <Text strong style={{ display: 'block', marginBottom: 12, fontSize: 13, textTransform: 'uppercase', color: '#8c8c8c' }}>
                  {attr.name}
                </Text>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {attr.values?.map(val => {
                    const isSelected = selectedAttributeValues.includes(val.id);
                    return (
                      <Tag.CheckableTag
                        key={val.id}
                        checked={isSelected}
                        onChange={() => toggleAttributeValue(val.id)}
                        style={{ 
                          border: '1px solid #d9d9d9',
                          padding: '4px 12px',
                          borderRadius: 6,
                          margin: 0,
                          fontSize: 13,
                          background: isSelected ? '#1890ff' : '#fff',
                          color: isSelected ? '#fff' : '#595959'
                        }}
                      >
                        {val.value}
                      </Tag.CheckableTag>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Clear Filters */}
      {(selectedAttributeValues.length > 0) && (
        <Button 
          type="link" 
          onClick={() => onFilterChange({ priceRange: [min, max], attributeValueIds: [] })} 
          style={{ width: '100%', marginTop: 24, color: '#ff4d4f' }}
        >
          Xóa tất cả bộ lọc
        </Button>
      )}
    </div>
  );
};

export default ProductFilter;