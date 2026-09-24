// トップページの固定クエリ (docs/d1-migration.md Phase 3)
// パラメータを取らない。ビルド(プリレンダ)時のみ呼ばれる。
import { d1Rows } from '~/server/utils/d1'

export default defineEventHandler(async () => {
  // D1 REST API は1リクエスト1文なので往復を減らす。
  // lpItems は1回で取ってカテゴリ別に分ける (移行前の $lookup 3本と同じ結果)。
  const [pages, items] = await Promise.all([
    d1Rows('SELECT greeting, annotation FROM landingPage WHERE id = 1'),
    d1Rows('SELECT * FROM lpItems ORDER BY category, "order"'),
  ])

  const byCategory = (category: string) => items.filter((i) => i.category === category)

  return {
    documents: [
      {
        ...pages[0],
        works: byCategory('works'),
        recommends: byCategory('recommends'),
        coffees: byCategory('coffees'),
      },
    ],
  }
})
