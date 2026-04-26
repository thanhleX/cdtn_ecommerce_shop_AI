import axiosClient from "./axiosClient";

const attributeApi = {
  getAllAttributes: () => axiosClient.get("/admin/attributes"),
  createAttribute: (data) => axiosClient.post("/admin/attributes", data),
  addAttributeValue: (data) => axiosClient.post("/admin/attributes/values", data),
  
  assignAttributeToCategory: (categoryId, attributeId) => 
    axiosClient.post(`/admin/attributes/categories/${categoryId}/assign/${attributeId}`),
  
  removeAttributeFromCategory: (categoryId, attributeId) => 
    axiosClient.delete(`/admin/attributes/categories/${categoryId}/remove/${attributeId}`),

  updateAttribute: (id, data) => axiosClient.put(`/admin/attributes/${id}`, data),
  deleteAttribute: (id) => axiosClient.delete(`/admin/attributes/${id}`),
  deleteAttributeValue: (valueId) => axiosClient.delete(`/admin/attributes/values/${valueId}`),
};

export default attributeApi;
