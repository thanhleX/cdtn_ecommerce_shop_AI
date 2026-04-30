import axiosClient from './axiosClient';

const reviewApi = {
  getProductReviews: (productId, params) => {
    return axiosClient.get(`/reviews/products/${productId}`, { params });
  },
  checkEligibility: (productId) => {
    return axiosClient.get(`/reviews/products/${productId}/eligibility`);
  },
  createReview: (data) => {
    return axiosClient.post('/reviews', data);
  },
  updateReview: (reviewId, data) => {
    return axiosClient.put(`/reviews/${reviewId}`, data);
  },
  reportReview: (reviewId) => {
    return axiosClient.post(`/reviews/${reviewId}/report`);
  },
  getProductReviewStats: (productId) => {
    return axiosClient.get(`/reviews/products/${productId}/stats`);
  }
};

export default reviewApi;
