import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    sourcemap: false,
  },
  test: {
    exclude: ['e2e/**', 'dist/**', 'node_modules/**'],
  },
});
