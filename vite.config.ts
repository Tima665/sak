/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), legacy()],
  define: {
    global: 'globalThis',
    'process.env': '{}',
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      stream: 'stream-browserify',
      util: 'util',
      process: 'process/browser',
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        format: 'es',
      },
      external: [],
    },
  },
  optimizeDeps: {
    include: ['buffer', 'stream-browserify', 'util', 'process'],
    exclude: [],
    esbuildOptions: {
      target: 'esnext',
      supported: {
        bigint: true,
      },
      define: {
        global: 'globalThis',
        'process.env': '{}',
      },
    },
  },
  esbuild: {
    target: 'esnext',
    supported: {
      bigint: true,
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
});
