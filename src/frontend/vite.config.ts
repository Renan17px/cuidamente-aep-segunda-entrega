import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Em desenvolvimento, as chamadas para /api são encaminhadas para a API (porta 3333).
export default defineConfig({
  plugins: [react()],
  build: { chunkSizeWarningLimit: 1000 },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://127.0.0.1:3333',
    },
  },
});
