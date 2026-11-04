import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Nuxt に依存しない関数 (shared/utils、server/utils の一部) のユニットテスト。
// Nuxt の別名のうち、テストする関数が使うものだけを解決する。
export default defineConfig({
  resolve: {
    alias: {
      '#shared': fileURLToPath(new URL('./shared', import.meta.url)),
      '~~': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  test: {
    include: ['test/unit/**/*.test.ts'],
    environment: 'node',
  },
})
