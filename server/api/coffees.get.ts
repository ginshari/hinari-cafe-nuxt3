// coffees ページの固定クエリ (docs/d1-migration.md Phase 3)
// 表示順は coffees.vue が pubDate でソートする (移行前と同様)。
// ORDER BY id は payload を毎回同じ並びにするため。並びが揺れると
// scripts/build-vectors.mts の入力ハッシュが変わり、索引が毎回作り直しになる。
import { d1Rows } from '~/server/utils/d1'

export default defineEventHandler(async () => {
  const coffees = await d1Rows('SELECT * FROM coffees ORDER BY id')
  return { documents: [{ coffees }] }
})
