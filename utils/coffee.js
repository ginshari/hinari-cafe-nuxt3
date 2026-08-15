// 銘柄名の一致ルール。銘柄名検索とチャットの案内で同じ判定を使う。
export const nameMatches = (coffee, query) => coffee.name.toUpperCase().includes(query.toUpperCase())
