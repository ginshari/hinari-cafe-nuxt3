// works ページの固定クエリ (docs/d1-migration.md Phase 3)
// year / month は移行前の $addFields が作っていた派生値。works.vue が受け取る形を
// 変えないため、実フィールドとして持たず substr で生成する ("2026" / "08" の文字列)。
import { d1Rows } from '~/server/utils/d1'

export default defineEventHandler(async () => {
  const [links, profiles, events] = await Promise.all([
    d1Rows('SELECT * FROM links ORDER BY "order"'),
    d1Rows('SELECT * FROM profiles ORDER BY "order"'),
    d1Rows(
      'SELECT *, substr(yyyymm, 1, 4) AS year, substr(yyyymm, 5, 2) AS month' +
        ' FROM events ORDER BY yyyymm DESC, branchNumber DESC',
    ),
  ])

  return { documents: [{ links, profiles, events }] }
})
