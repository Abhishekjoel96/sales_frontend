
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Or any other port you prefer
    proxy: {
      '/api': { // Proxy requests to /api to your backend
        target: 'http://localhost:3001', // Your backend server's address.  CHANGE THIS IF NEEDED.
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Remove the /api prefix
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src', // Example alias: import something from '@/components/MyComponent'
    },
  },
});
