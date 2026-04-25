import axios from 'axios';

const orderApi = axios.create({
  baseURL: import.meta.env.VITE_ORDER_API_URL || 'http://localhost:5002',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000, // Orders involve inter-service calls, so longer timeout
});

// Request interceptor — attach request ID for tracing
orderApi.interceptors.request.use((config) => {
  config.headers['X-Request-Id'] =
    Math.random().toString(36).substring(2, 14);
  return config;
});

// Response interceptor — log errors
orderApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      '[OrderAPI]',
      error.response?.status,
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

export const createOrder = (data) => orderApi.post('/api/orders', data);

export const getOrders = () => orderApi.get('/api/orders');

export const getOrder = (id) => orderApi.get(`/api/orders/${id}`);

export default orderApi;
