import axios from 'axios';

const productApi = axios.create({
  baseURL: import.meta.env.VITE_PRODUCT_API_URL || 'http://localhost:5001',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Request interceptor — attach request ID for tracing
productApi.interceptors.request.use((config) => {
  config.headers['X-Request-Id'] =
    Math.random().toString(36).substring(2, 14);
  return config;
});

// Response interceptor — log errors
productApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      '[ProductAPI]',
      error.response?.status,
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

export const getProducts = () => productApi.get('/api/products');

export const getProduct = (id) => productApi.get(`/api/products/${id}`);

export const createProduct = (data) => productApi.post('/api/products', data);

export const updateProduct = (id, data) =>
  productApi.put(`/api/products/${id}`, data);

export const deleteProduct = (id) => productApi.delete(`/api/products/${id}`);

export default productApi;
