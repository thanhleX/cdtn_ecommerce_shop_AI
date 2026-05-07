import { useState, useCallback } from 'react';
import orderApi from '../api/orderApi';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  
  const navigate = useNavigate();
  const { fetchCart } = useCartStore();

  const fetchOrders = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const apiParams = {
        ...params,
        page: params.page !== undefined ? params.page - 1 : 0,
        size: params.size || 10,
      };
      const response = await orderApi.getOrders(apiParams);
      const data = response.data || response;
      setOrders(data.content || []);
      setPagination({
        current: (data.pageable?.pageNumber !== undefined ? data.pageable.pageNumber : apiParams.page) + 1,
        pageSize: data.pageable?.pageSize || apiParams.size,
        total: data.totalElements || 0,
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  const placeOrder = async (orderData) => {
    setLoading(true);
    try {
      const response = await orderApi.createOrder(orderData);
      message.success('Đặt hàng thành công!');
      
      // Refresh cart to show empty right away
      await fetchCart();
      
      const newOrder = response.data || response;
      return newOrder;
    } catch (error) {
      console.error('Error placing order:', error);
      message.error(error.message || 'Có lỗi xảy ra khi đặt hàng');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    setLoading(true);
    try {
      await orderApi.cancelOrder(orderId);
      message.success('Đã hủy đơn hàng');
      return true;
    } catch (error) {
      message.error(error.message || 'Lỗi khi hủy đơn hàng');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const getOrderById = async (id) => {
    setLoading(true);
    try {
      const response = await orderApi.getById(id);
      return response.data || response;
    } catch (error) {
      message.error(error.message || 'Lỗi khi tải chi tiết đơn hàng');
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return {
    orders,
    loading,
    pagination,
    fetchOrders,
    placeOrder,
    cancelOrder,
    getOrderById
  };
};
