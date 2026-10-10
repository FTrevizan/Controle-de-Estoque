import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    // repassa chamadas /api para o Node, evitando erro de CORS
    proxy: { '/api': 'http://localhost:3000' },
  },
});