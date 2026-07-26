import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: { host: '0.0.0.0', port: 3000, allowedHosts: 'all' },
  build: {
    modulePreload: { polyfill: false },
    target: 'esnext',
    minify: 'terser',
    cssMinify: 'lightningcss',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 3,
        toplevel: true,
        unsafe: true,
      },
      mangle: {
        toplevel: true,
      }
    },
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  }
});
