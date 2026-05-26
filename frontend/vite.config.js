// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          // React core — landing dahil her sayfa kullanır; nadir değişir, cache dostu
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) {
            return 'vendor-react';
          }
          if (id.includes('/react-router') || id.includes('/@remix-run/router')) {
            return 'vendor-router';
          }
          if (id.includes('/react-helmet-async/')) {
            return 'vendor-helmet';
          }
          if (id.includes('/axios/')) {
            return 'vendor-axios';
          }
          // @fontsource ve diğer pure-CSS asset paketleri için ayrı chunk yok (CSS Vite tarafından zaten ayrı bundle ediliyor)
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://diet_backend:8000',
        changeOrigin: true,
        // Django'nun geçersiz hostname hatasını önlemek için Host başlığını eziyoruz
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('Host', 'localhost:8000');
          });
        }
      },
      '/media': {
        target: 'http://diet_backend:8000',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('Host', 'localhost:8000');
          });
        }
      },
      '/ws': {
        target: 'ws://diet_backend:8000',
        ws: true,
        // WebSocket için de aynı durum geçerli olabilir
        configure: (proxy, options) => {
           proxy.on('proxyReqWs', (proxyReq, req, socket, options, head) => {
               proxyReq.setHeader('Host', 'localhost:8000');
           });
        }
      },
    },
  },
});