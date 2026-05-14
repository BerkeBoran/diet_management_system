// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
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