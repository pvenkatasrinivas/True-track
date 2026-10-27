import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config. The "test" section is used by Vitest when we run `npm test`.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  test: {
    environment: 'jsdom', // fake browser so React components can render in tests
    globals: true, // lets us use describe / it / expect without importing them
    setupFiles: './src/setupTests.js',
  },
});
