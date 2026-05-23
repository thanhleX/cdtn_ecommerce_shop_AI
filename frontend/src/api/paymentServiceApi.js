import axiosClient from './axiosClient';

const paymentServiceApi = {
  createUrl: async (data) => {
    // Gọi trực tiếp vào backend chính do VNPay service đã được gộp
    const response = await axiosClient.post('/vnpay/create-payment', data);
    return response;
  },
  checkHealth: async () => {
    try {
      // Gọi endpoint health check của module VNPay trên backend chính
      const response = await axiosClient.get('/vnpay/health', { timeout: 2000 });
      return response?.status === 'UP';
    } catch (error) {
      return false;
    }
  }
};

export default paymentServiceApi;
