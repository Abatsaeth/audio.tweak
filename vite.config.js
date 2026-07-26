import { defineConfig } from 'vite';

export default defineConfig({
  server: { host: '0.0.0.0', port: 3000, allowedHosts: 'all' },
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  }
});
