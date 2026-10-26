import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.spec.js'],
    // El test legacy de Playwright (tests/example.spec.js) no lo corre Vitest;
    // se ejecuta con @playwright/test. Lo excluimos aquí.
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'tests/example.spec.js',
      '**/*.e2e.spec.js',
    ],
    environment: 'node',
    reporters: 'default',
  },
})
