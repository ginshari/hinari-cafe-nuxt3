// 型チェック (npm run typecheck)。
//
// nuxi typecheck は本番モード (NODE_ENV=production) で型を作る。nuxt.config.ts の ignore は本番で
// 管理画面を除くので、管理画面の layout と middleware の型が無いという誤ったエラーになる。
// 開発モードで型を作るため NODE_ENV=development にする。Windows でも動くよう、npm スクリプトに
// 書かずにここで設定する。
import { spawnSync } from 'node:child_process'

const { status } = spawnSync('nuxi', ['typecheck'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, NODE_ENV: 'development' },
})
process.exit(status ?? 1)
