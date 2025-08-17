import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@services': fileURLToPath(new URL('./src/services', import.meta.url)),
      '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@interfaces': fileURLToPath(new URL('./src/interfaces', import.meta.url)),
      '@store': fileURLToPath(new URL('./src/store', import.meta.url)),
      '@configs': fileURLToPath(new URL('./src/configs', import.meta.url)),
      '@router': fileURLToPath(new URL('./src/router', import.meta.url)),
      '@types': fileURLToPath(new URL('./src/types', import.meta.url)),

    },
  },
  server: {
    port: 3000,
    host: true,
    open: false, // Disable auto-open to prevent xdg-open error
    cors: true,
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@headlessui/react', '@heroicons/react'],
          state: ['@reduxjs/toolkit', 'react-redux', 'zustand'],
          utils: ['axios', 'clsx', 'class-variance-authority', 'tailwind-merge'],
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
      'axios',
    ],
  },
  css: {
    devSourcemap: true,
  },
  define: {
    __DEV__: 'true',
  },
})
