// coffees ページが読むデータ。表示順は coffees.vue が pubDate で並べ替える。
import { d1Rows } from '~/server/utils/d1'

export default defineEventHandler(async () => {
  const coffees = await d1Rows('SELECT * FROM coffees ORDER BY id')
  return { documents: [{ coffees }] }
})
