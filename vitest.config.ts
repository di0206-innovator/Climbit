import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    exclude: ['**/e2e.test.ts', 'node_modules', 'dist', '.next'],
  },
});
