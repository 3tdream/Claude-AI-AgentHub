import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    fileParallelism: false, // Disable file parallelism to prevent race conditions with shared worklog.json
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'tests/'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/core': path.resolve(__dirname, './src/core'),
      '@/storage': path.resolve(__dirname, './src/storage'),
      '@/nlp': path.resolve(__dirname, './src/nlp'),
      '@/voice': path.resolve(__dirname, './src/voice'),
      '@/cli': path.resolve(__dirname, './src/cli'),
    },
  },
});
