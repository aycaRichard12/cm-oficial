import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      src: fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
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
    coverage: {
      provider: 'v8',
      include: [
        'src/utils/theme-resolver.js',
        'src/utils/theme-controller.js',
        'src/utils/with-light-capture.js',
        'src/composables/useChartTheme.js',
        'src/stores/theme.js',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
})
