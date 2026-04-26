import { useState, useCallback } from 'react';
import productApi from '../api/productApi';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 9, total: 0 });

  const fetchProducts = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      // Handle Ant Design pagination (1-indexed) mapping to Spring Boot (0-indexed)
      const apiParams = {
        ...params,
        page: params.page !== undefined ? params.page - 1 : 0,
        size: params.size || 9,
        categoryIds: params.categoryIds || params.categories
      };
      
      delete apiParams.categories;

      // Clean empty filters
      if (apiParams.categoryIds && apiParams.categoryIds.length === 0) {
        delete apiParams.categoryIds;
      }
      
      console.log('Fetching products with params:', apiParams);
      const response = await productApi.getProducts(apiParams);
      const data = response.data || response;
      
      setProducts(data.content || []);
      setPagination({
        current: (data.pageNo !== undefined ? data.pageNo : apiParams.page) + 1,
        pageSize: data.pageSize || apiParams.size,
        total: data.totalElements || 0,
        minPrice: data.minPrice,
        maxPrice: data.maxPrice
      });
    } catch (err) {
      setError(err);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFeaturedProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productApi.getFeatured();
      const data = response.data || response;
      setProducts(data || []);
    } catch (err) {
      setError(err);
      console.error('Error fetching featured products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getProductBySlug = useCallback(async (slug) => {
    setLoading(true);
    try {
      const response = await productApi.getBySlug(slug);
      return response.data || response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);


  return {
    products,
    loading,
    error,
    pagination,
    fetchProducts,
    fetchFeaturedProducts,
    getProductBySlug,
  };
};
