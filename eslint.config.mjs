// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'
import vuetify from 'eslint-plugin-vuetify'
import prettier from 'eslint-config-prettier/flat'

// 書式は Prettier に任せるため、stylistic は既定 (無効) のままにする
export default createConfigForNuxt()
  .append(vuetify.configs['flat/base'])
  .append({
    rules: {
      'no-console': 'warn',
      'no-debugger': 'warn',
    },
  })
  // ビルド・監査スクリプトは進捗や診断を console に出すのが目的のため
  .append({
    files: ['scripts/*.{ts,mts,mjs}'],
    rules: {
      'no-console': 'off',
    },
  })
  // Cloudflare Functions はエラー時のログ出力に console.error を使うため許可
  // (console.log などはそのまま残るので、デバッグ出力の混入は引き続き防げる)
  .append({
    files: ['functions/**/*.ts'],
    rules: {
      'no-console': ['error', { allow: ['error'] }],
    },
  })
  .append(prettier)
