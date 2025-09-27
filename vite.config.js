import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3333,
    hmr: {
      port: 3333
    }
  },
  define: {
    global: 'globalThis'
  }
});
