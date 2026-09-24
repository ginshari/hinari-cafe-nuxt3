// works ページが読むデータ。
// year / month は yyyymm から作る。works.vue は "2026" / "08" の文字列で受け取る。
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
