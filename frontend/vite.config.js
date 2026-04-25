import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Optional: proxy API calls during local development
      // Uncomment if you want to avoid CORS during development
      // '/product-api': {
      //   target: 'http://localhost:5001',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/product-api/, ''),
      // },
      // '/order-api': {
      //   target: 'http://localhost:5002',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/order-api/, ''),
      // },
    },
  },
});
