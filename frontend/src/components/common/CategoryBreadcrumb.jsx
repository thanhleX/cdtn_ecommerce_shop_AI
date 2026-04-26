import { Breadcrumb as AntBreadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';
import { useMemo } from 'react';

const CategoryBreadcrumb = ({ currentCategoryId, categories = [], extraItems = [] }) => {
  const path = useMemo(() => {
    if (!currentCategoryId || categories.length === 0) return [];
    
    const result = [];
    let current = categories.find(c => c.id === currentCategoryId);
    
    while (current) {
      result.unshift({
        title: current.name,
        link: `/products?category=${current.slug}`
      });
      
      if (current.parentId) {
        current = categories.find(c => c.id === current.parentId);
      } else {
        current = null;
      }
    }
    
    return result;
  }, [currentCategoryId, categories]);

  const breadcrumbItems = [
    {
      title: (
        <Link to="/">
          <HomeOutlined /> Trang chủ
        </Link>
      ),
    },
    ...path.map((item, index) => ({
      title: index === path.length - 1 && extraItems.length === 0 
        ? item.title 
        : <Link to={item.link}>{item.title}</Link>,
    })),
    ...extraItems.map(item => ({
      title: item.title,
    })),
  ];

  return (
    <AntBreadcrumb 
      items={breadcrumbItems} 
      style={{ 
        margin: '0 0 24px 0',
        padding: '12px 16px',
        background: '#f9f9f9',
        borderRadius: 8
      }} 
    />
  );
};

export default CategoryBreadcrumb;
