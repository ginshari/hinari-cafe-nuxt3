// 味・香りの検索で、質問文のベクトルとレビューコメントのベクトルの類似度をブラウザで計算する。
// 質問文のベクトルは /api/search が返す。レビューコメントのベクトルはビルド時に
// scripts/build-vectors.mts が作る coffee-vectors.bin (int8) と coffee-vectors.json (メタデータ)。

const TOP_N = 5
const MIN_SCORE = 0.6 // これ未満は「該当なし」とする

let loading = null

// ベクトルのファイルを読む。1回読んだら同じページの間は使い回す。
// 失敗したら次の呼び出しで読み直せるよう、保持している Promise を捨てる。
export const loadCoffeeVectors = () =>
  (loading ??= Promise.all([
    fetch('/coffee-vectors.json').then((r) => {
      if (!r.ok) throw new Error(`coffee-vectors.json: ${r.status}`)
      return r.json()
    }),
    fetch('/coffee-vectors.bin').then((r) => {
      if (!r.ok) throw new Error(`coffee-vectors.bin: ${r.status}`)
      return r.arrayBuffer()
    }),
  ])
    .then(([meta, buf]) => {
      const vectors = new Int8Array(buf)
      if (vectors.length !== meta.count * meta.dims || meta.norms?.length !== meta.count) {
        throw new Error('coffee-vectors の件数が合いません')
      }
      return { meta, vectors }
    })
    .catch((e) => {
      loading = null
      throw e
    }))

// 全件とのコサイン類似度を計算し、上位 TOP_N 件を返す。
// 最も高い類似度が MIN_SCORE 未満なら results は空。
export const searchCoffeesByVector = async (embedding, model) => {
  const { meta, vectors } = await loadCoffeeVectors()
  if (model !== meta.model || embedding.length !== meta.dims) {
    throw new Error(`埋め込みのモデルが合いません: ${model} / ${meta.model}`)
  }

  let queryNorm = 0
  for (let j = 0; j < meta.dims; j++) queryNorm += embedding[j] * embedding[j]
  queryNorm = Math.sqrt(queryNorm)

  const scored = new Array(meta.count)
  for (let i = 0; i < meta.count; i++) {
    let dot = 0
    const offset = i * meta.dims
    for (let j = 0; j < meta.dims; j++) dot += embedding[j] * vectors[offset + j]
    scored[i] = { index: i, score: dot / (queryNorm * meta.norms[i]) }
  }
  scored.sort((a, b) => b.score - a.score)

  const round = (n) => Number(n.toFixed(4))
  const top = round(scored[0].score)
  return {
    results: top < MIN_SCORE ? [] : scored.slice(0, TOP_N).map((s) => ({ videoId: meta.ids[s.index], score: round(s.score) })),
    top,
  }
}
