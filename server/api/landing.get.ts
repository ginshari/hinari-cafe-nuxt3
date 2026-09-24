// トップページが読むデータ。ビルド時だけ呼ばれる。
import { d1Rows } from '~/server/utils/d1'

export default defineEventHandler(async () => {
  // D1 の REST API は1回の呼び出しで1文しか実行できないため、lpItems は
  // まとめて取ってからカテゴリごとに分ける。
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
