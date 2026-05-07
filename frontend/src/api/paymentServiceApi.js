import axios from 'axios';

const paymentServiceApi = {
  createUrl: async (data) => {
    // Port 8081 là port của Spring Boot vnpay-service độc lập
    // Endpoint chuẩn theo logic Porting từ JSP demo
    const response = await axios.post('http://localhost:8081/api/vnpay/create-payment', data);
    return response.data;
  },
  checkHealth: async () => {
    try {
      // Gọi endpoint health check với timeout ngắn
      const response = await axios.get('http://localhost:8081/api/vnpay/health', { timeout: 2000 });
      return response.data?.status === 'UP';
    } catch (error) {
      return false;
    }
  }
};

export default paymentServiceApi;
