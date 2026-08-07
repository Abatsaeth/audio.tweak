import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  server: { host: '0.0.0.0', port: 3000, allowedHosts: 'all' },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: [
        'icon.svg',
        'icon.png',
        'icon-192.png',
        'icon-512.png',
        'icon-512-maskable.png',
      ],
      manifest: {
        name: 'AUDIO.TWEAK',
        short_name: 'Audio.Tweak',
        description:
          'A fast, smooth, in-browser audio player. Drag & drop files, reorder, rename, search and shuffle your local audio library seamlessly.',
        theme_color: '#FB2B41',
        background_color: '#08080a',
        display: 'standalone',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,svg,png,ico}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  build: {
    assetsInlineLimit: 0,
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
