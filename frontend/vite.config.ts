import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/Shaadi-Set-Go/',
  plugins: [react()],
  
  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  build: {
    // Optimize build output
    minify: 'terser',
    sourcemap: false, // Disable sourcemaps in production
    rollupOptions: {
      output: {
        // Code splitting for better caching
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'animations': ['framer-motion', '@studio-freight/lenis'],
          'charts': ['recharts'],
        }
      }
    }
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        // This proxy only works in development
      },
    },
  },
});