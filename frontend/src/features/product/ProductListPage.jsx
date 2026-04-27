import { useEffect, useState, useMemo } from 'react';
import { Row, Col, Pagination, Spin, Typography, Empty, Input, Select, Space } from 'antd';
import { Helmet } from 'react-helmet-async';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from './components/ProductCard';
import ProductFilter from './components/ProductFilter';
import categoryApi from '../../api/categoryApi';
import { useSearchParams } from 'react-router-dom';
import CategoryBreadcrumb from '../../components/common/CategoryBreadcrumb';

const { Title, Text } = Typography;
const { Search } = Input;

const DEFAULT_PRICE_RANGE = [0, 3000000];

const ProductListPage = () => {
  const { products, loading, pagination, fetchProducts } = useProducts();
  const [categories, setCategories] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Fetch Categories once
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

  // 2. Build Category Tree
  const categoryTree = useMemo(() => {
    const map = {};
    const tree = [];
    categories.forEach(cat => {
      map[cat.id] = { ...cat, children: [] };
    });
    categories.forEach(cat => {
      if (cat.parentId && map[cat.parentId]) {
        map[cat.parentId].children.push(map[cat.id]);
      } else if (!cat.parentId) {
        tree.push(map[cat.id]);
      }
    });
    return tree;
  }, [categories]);

  // 3. Helper to get all descendant IDs
  const getAllChildIds = (categoryId, flatCats) => {
    const children = flatCats.filter(c => c.parentId === categoryId);
    let ids = [categoryId];
    children.forEach(child => {
      ids = [...ids, ...getAllChildIds(child.id, flatCats)];
    });
    return ids;
  };

  // 4. Parse Filters from URL
  const filtersFromUrl = useMemo(() => {
    const slugs = searchParams.getAll('category');
    const priceStr = searchParams.get('price');
    const attrIdsStr = searchParams.get('attr');
    const keyword = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);

    let categoryIds = [];
    let specificCategoryId = null;

    slugs.forEach(slug => {
      const cat = categories.find(c => c.slug === slug);
      if (cat) {
        specificCategoryId = cat.id;
        categoryIds = [...new Set([...categoryIds, ...getAllChildIds(cat.id, categories)])];
      }
    });

    const attributeValueIds = attrIdsStr ? attrIdsStr.split(',').map(Number) : [];

    // Parse price range from URL or use null until API returns range
    let priceRange = null; 
    if (priceStr && priceStr.includes('-')) {
      const parts = priceStr.split('-');
      const min = parseInt(parts[0], 10);
      const max = parseInt(parts[1], 10);
      if (!isNaN(min) && !isNaN(max)) priceRange = [min, max];
    }

    const sortValue = searchParams.get('sort') || 'id_desc';
    let sortBy = 'id';
    let direction = 'desc';
    if (sortValue.includes('_')) {
      const parts = sortValue.split('_');
      sortBy = parts[0];
      direction = parts[1];
    }

    return { categoryIds, specificCategoryId, priceRange, page, keyword, rawSlugs: slugs, attributeValueIds, sortValue, sortBy, direction };
  }, [searchParams, categories]);

  // 5. Fetch Products on Filter Change
  useEffect(() => {
    if (categories.length > 0 || filtersFromUrl.rawSlugs.length === 0) {
      fetchProducts({
        page: filtersFromUrl.page,
        keyword: filtersFromUrl.keyword,
        categoryIds: filtersFromUrl.categoryIds.length > 0 ? filtersFromUrl.categoryIds : undefined,
        minPrice: filtersFromUrl.priceRange ? filtersFromUrl.priceRange[0] : undefined,
        maxPrice: filtersFromUrl.priceRange ? filtersFromUrl.priceRange[1] : undefined,
        attributeValueIds: filtersFromUrl.attributeValueIds.length > 0 ? filtersFromUrl.attributeValueIds : undefined,
        sortBy: filtersFromUrl.sortBy,
        direction: filtersFromUrl.direction
      });
    }
  }, [
    filtersFromUrl.page,
    filtersFromUrl.keyword,
    JSON.stringify(filtersFromUrl.categoryIds),
    JSON.stringify(filtersFromUrl.priceRange),
    JSON.stringify(filtersFromUrl.attributeValueIds),
    filtersFromUrl.sortValue,
    categories.length,
    fetchProducts
  ]);

  // 6. Update URL on Filter Change
  const handleFilterChange = ({ priceRange: newPriceRange, attributeValueIds: newAttrIds }) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (newPriceRange) {
      newParams.set('price', `${newPriceRange[0]}-${newPriceRange[1]}`);
    } else {
      newParams.delete('price');
    }

    if (newAttrIds && newAttrIds.length > 0) {
      newParams.set('attr', newAttrIds.join(','));
    } else {
      newParams.delete('attr');
    }

    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (value) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', value);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  // Derive attribute groups for the selected categories OR search results
  const attributeGroups = useMemo(() => {
    const attrMap = new Map();

    const collectAttributes = (categoryId) => {
      const cat = categories.find(c => c.id === categoryId);
      if (cat) {
        if (cat.attributes) {
          cat.attributes.forEach(attr => {
            if (!attrMap.has(attr.id)) attrMap.set(attr.id, attr);
          });
        }
        if (cat.parentId) {
          collectAttributes(cat.parentId);
        }
      }
    };

    if (filtersFromUrl.rawSlugs.length > 0) {
      filtersFromUrl.rawSlugs.forEach(slug => {
        const cat = categories.find(c => c.slug === slug);
        if (cat) {
          collectAttributes(cat.id);
        }
      });
    } else if (filtersFromUrl.keyword && products.length > 0) {
      const categoryIds = new Set(products.map(p => p.categoryId));
      categoryIds.forEach(id => {
        collectAttributes(id);
      });
    }
    
    return Array.from(attrMap.values());
  }, [filtersFromUrl.rawSlugs, filtersFromUrl.keyword, categories, products]);

  // Use dynamic price range from PageResponse (returned by useProducts hook)
  // Note: We need to update useProducts hook to expose minPrice/maxPrice from response
  const { minPrice: dynamicMin, maxPrice: dynamicMax } = pagination; 

  const currentCategoryName = useMemo(() => {
    if (filtersFromUrl.rawSlugs.length === 1) {
      const cat = categories.find(c => c.slug === filtersFromUrl.rawSlugs[0]);
      return cat?.name;
    }
    return null;
  }, [filtersFromUrl.rawSlugs, categories]);

  const pageTitle = currentCategoryName 
    ? `${currentCategoryName} chính hãng, giá tốt 2026 | VietTech Store`
    : filtersFromUrl.keyword 
      ? `Kết quả tìm kiếm cho "${filtersFromUrl.keyword}" | VietTech Store`
      : 'Danh sách sản phẩm công nghệ chính hãng | VietTech Store';

  return (
    <div>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={`Mua ngay ${currentCategoryName || 'sản phẩm công nghệ'} chính hãng tại VietTech Store.`} />
      </Helmet>

      <CategoryBreadcrumb 
        currentCategoryId={filtersFromUrl.specificCategoryId} 
        categories={categories} 
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <Title level={2} style={{ margin: 0 }}>
          {currentCategoryName || (filtersFromUrl.keyword ? `Kết quả cho "${filtersFromUrl.keyword}"` : 'Tất cả sản phẩm')}
        </Title>
        
        <Space size="large" align="center">
          <Text type="secondary">Tìm thấy {pagination.total} sản phẩm</Text>
          <Select 
            value={filtersFromUrl.sortValue}
            onChange={handleSortChange}
            style={{ width: 180 }}
            options={[
              { value: 'id_desc', label: 'Mới nhất' },
              { value: 'price_asc', label: 'Giá tăng dần' },
              { value: 'price_desc', label: 'Giá giảm dần' }
            ]}
          />
        </Space>
      </div>

      <Row gutter={[32, 24]}>
        <Col xs={24} md={6}>
          <ProductFilter
            attributeGroups={attributeGroups}
            selectedAttributeValues={filtersFromUrl.attributeValueIds}
            priceRange={filtersFromUrl.priceRange}
            dynamicMinPrice={dynamicMin}
            dynamicMaxPrice={dynamicMax}
            onFilterChange={handleFilterChange}
          />
        </Col>
        <Col xs={24} md={18}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>
          ) : products.length === 0 ? (
            <div style={{ background: '#fff', padding: 100, borderRadius: 8, border: '1px solid #f0f0f0' }}>
              <Empty description={filtersFromUrl.keyword ? `Không tìm thấy sản phẩm nào khớp với "${filtersFromUrl.keyword}"` : "Không tìm thấy sản phẩm nào phù hợp với bộ lọc"} />
            </div>
          ) : (
            <>
              <Row gutter={[24, 24]}>
                {products.map(product => (
                  <Col xs={24} sm={12} lg={8} key={product.id}>
                    <ProductCard product={product} />
                  </Col>
                ))}
              </Row>
              <div style={{ textAlign: 'center', marginTop: 40, background: '#fff', padding: 16, borderRadius: 8, border: '1px solid #f0f0f0' }}>
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                />
              </div>
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default ProductListPage;
