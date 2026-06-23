import axios from "axios";

const BASE_IP = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/:9090$/, '') : "http://localhost";
const PRODUCT_API = `${BASE_IP}:9090/api`;
const ORDER_API = `${BASE_IP}:9091/api`;
const CUSTOMER_API = `${BASE_IP}:9092/api`;
const NOTIFICATION_API = `${BASE_IP}:9093/api`;

// Product APIs
export const productAPI = {
  getAll: () => axios.get(`${PRODUCT_API}/products`),
  getById: (id) => axios.get(`${PRODUCT_API}/products/${id}`),
  getByCategory: (cat) => axios.get(`${PRODUCT_API}/products/category/${cat}`),
  create: (data, headers) => axios.post(`${PRODUCT_API}/products`, data, { headers }),
  update: (id, data, headers) => axios.put(`${PRODUCT_API}/products/${id}`, data, { headers }),
  updateStock: (id, data, headers) => axios.put(`${PRODUCT_API}/products/${id}/stock`, data, { headers }),
  delete: (id, headers) => axios.delete(`${PRODUCT_API}/products/${id}`, { headers }),
};

// Order APIs
export const orderAPI = {
  getAll: (headers) => axios.get(`${ORDER_API}/orders`, { headers }),
  getById: (id, headers) => axios.get(`${ORDER_API}/orders/${id}`, { headers }),
  getByCustomer: (customerId, headers) => axios.get(`${ORDER_API}/orders/customer/${customerId}`, { headers }),
  create: (data, headers) => axios.post(`${ORDER_API}/orders`, data, { headers }),
  updateStatus: (id, status, headers) => axios.put(`${ORDER_API}/orders/${id}/status`, { status }, { headers }),
};

// Customer APIs
export const customerAPI = {
  getAll: (headers) => axios.get(`${CUSTOMER_API}/customers`, { headers }),
  getById: (id, headers) => axios.get(`${CUSTOMER_API}/customers/${id}`, { headers }),
  getByAsgardeoId: (asgardeoId, headers) => axios.get(`${CUSTOMER_API}/customers/byuser/${asgardeoId}`, { headers }),
  register: (data) => axios.post(`${CUSTOMER_API}/customers`, data),
  update: (id, data, headers) => axios.put(`${CUSTOMER_API}/customers/${id}`, data, { headers }),
};

// Notification APIs
export const notificationAPI = {
  getAll: (headers) => axios.get(`${NOTIFICATION_API}/notifications`, { headers }),
  getByOrder: (orderId, headers) => axios.get(`${NOTIFICATION_API}/notifications/order/${orderId}`, { headers }),
  sendStatusNotif: (data, headers) => axios.post(`${NOTIFICATION_API}/notifications/order-status`, data, { headers }),
};