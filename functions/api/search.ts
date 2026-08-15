// コーヒーの意味検索エンドポイント (Cloudflare Pages Functions)
//
//   POST /api/search  { "query": "酸味が控えめ" }
//   → { "results": [{ "videoId": "...", "score": 0.79 }, ...], "top": 0.79 }
//
// 返すのは videoId とスコアだけ。本文はクライアントが保持済みのため再送しない。
// AIには文章を生成させず質問文をベクトルに変換させるのみなので、出力に事実でない文章が混ざることがない。

const MODEL = '@cf/pfnet/plamo-embedding-1b'
const MAX_QUERY_LEN = 100
const MIN_SCORE = 0.6 // これ未満は「該当なし」扱いとする
const TOP_N = 5

// この Env は Worker に設定したバインディングの型をまとめたもの。
// バインディングは Worker から外部サービスを使うための接続設定で、
// ここでは Workers AI と 静的アセットのバインディングを宣言している。
interface Env {
  AI: { run: (model: string, input: { text: string[] }) => Promise<{ data: number[][] }> }
  ASSETS: { fetch: (input: string) => Promise<Response> }
}

interface Meta {
  model: string
  dims: number
  count: number
  generatedAt: string
  ids: string[]
  norms: number[]
}

// Worker インスタンス単位でメタデータとベクトルデータをキャッシュする
let metaCache: Meta | null = null
let vectorCache: Int8Array | null = null

async function loadMeta(env: Env, origin: string): Promise<Meta> {
  if (metaCache) return metaCache
  const res = await env.ASSETS.fetch(`${origin}/coffee-vectors.json`)
  if (!res.ok) throw new Error(`メタデータの取得に失敗: ${res.status}`)
  const meta = (await res.json()) as Meta
  // ノルムの不整合時はビルドを失敗させる。
  if (!meta.norms || meta.norms.length !== meta.count) {
    throw new Error(`ノルムの件数が不正 (期待値 ${meta.count})`)
  }
  metaCache = meta
  return metaCache
}

async function loadVectors(env: Env, origin: string, meta: Meta): Promise<Int8Array> {
  if (vectorCache) return vectorCache
  const res = await env.ASSETS.fetch(`${origin}/coffee-vectors.bin`)
  if (!res.ok) throw new Error(`ベクトルデータの取得に失敗: ${res.status}`)
  const vectors = new Int8Array(await res.arrayBuffer())

  const expected = meta.count * meta.dims
  if (vectors.length !== expected) {
    // ベクトルデータとメタデータの不整合時はビルドを失敗させる
    throw new Error(`ベクトルデータのサイズが不正: ${vectors.length} (期待値 ${expected})`)
  }
  vectorCache = vectors
  return vectors
}

// コサイン類似度によるベクトル検索を行う
function search(query: number[], meta: Meta, vectors: Int8Array) {
  let queryNorm = 0
  for (let j = 0; j < meta.dims; j++) queryNorm += query[j] * query[j]
  queryNorm = Math.sqrt(queryNorm)

  const scored: { index: number; score: number }[] = new Array(meta.count)
  for (let i = 0; i < meta.count; i++) {
    let dot = 0
    const offset = i * meta.dims
    for (let j = 0; j < meta.dims; j++) dot += query[j] * vectors[offset + j]
    scored[i] = { index: i, score: dot / (queryNorm * meta.norms[i]) }
  }
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, TOP_N)
}

// Workers AI のエラーを分類する
//
// 3036 と 3040 はどちらも HTTP 429 だが、利用者が取るべき行動が正反対なので必ず区別する
//   3036 Account limited … 無料枠を使い切った状態。翌日の枠が入るまで回復しない
//   3040 Out of capacity … 混雑による一時的な失敗。すぐ再試行すれば通ることが多い
//   3007 Timeout / 3008 Aborted … 一時的
//
// バインディング経由の例外はメッセージにコード番号を含む(例: "AiError: 3040: ...")。
function classifyAiError(e: unknown): 'quota' | 'busy' | null {
  const raw = `${(e as { code?: number })?.code ?? ''} ${(e as Error)?.message ?? e}`
  if (/\b3036\b/.test(raw)) return 'quota'
  if (/\b(3040|3007|3008)\b/.test(raw)) return 'busy'
  return null
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })

const round = (n: number) => Number(n.toFixed(4))

// キャッシュキーには生の入力文を使わずハッシュを使う
// ユーザー入力値の保持を避けるため
const hashQuery = async (query: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(query))
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function onRequestPost(context: {
  request: Request
  env: Env
  waitUntil: (p: Promise<unknown>) => void
}): Promise<Response> {
  const { request, env } = context
  const origin = new URL(request.url).origin

  // 同一オリジンのみ許可する
  const reqOrigin = request.headers.get('origin')
  if (reqOrigin !== origin) return json({ error: 'forbidden' }, 403)

  let query: string
  try {
    const body = (await request.json()) as { query?: unknown }
    query = typeof body.query === 'string' ? body.query.trim() : ''
  } catch {
    return json({ error: 'bad_request' }, 400)
  }

  if (!query) return json({ error: 'bad_request' }, 400)
  if (query.length > MAX_QUERY_LEN) return json({ error: 'too_long' }, 400)

  try {
    // メタデータを先に読んでキャッシュ有無の判定に利用する
    const meta = await loadMeta(env, origin)

    // 同クエリは推論をスキップしてキャッシュから返答する
    const cacheKey = new Request(
      `${origin}/api/search?v=${encodeURIComponent(meta.generatedAt)}&q=${await hashQuery(query)}`,
    )
    const cache = (caches as unknown as { default: Cache }).default

    const hit = await cache.match(cacheKey)
    if (hit) return hit

    let embedding: number[]
    try {
      // env.AI.run は Workers AI にテキストを送り、モデルがベクトルに変換して返す
      // ここではクエリをコーヒーレビューの埋め込みと同じモデルでベクトル化するために使う
      const out = await env.AI.run(MODEL, { text: [query] })
      embedding = out.data[0]
    } catch (e) {
      const kind = classifyAiError(e)
      if (kind) return json({ error: kind }, 503)
      throw e
    }

    const vectors = await loadVectors(env, origin, meta)
    const top = search(embedding, meta, vectors)

    const topScore = round(top[0].score)
    const body = {
      // 類似度が低い場合は結果を返さず「該当なし」とする
      results: topScore < MIN_SCORE ? [] : top.map((t) => ({ videoId: meta.ids[t.index], score: round(t.score) })),
      top: topScore,
    }

    const res = json(body)
    // ベクトルデータの版をキーに含めているため長めに保持してよい
    res.headers.set('cache-control', 'public, max-age=86400')
    // 応答を待たせないよう、キャッシュ書き込みはバックグラウンドで行う
    context.waitUntil(cache.put(cacheKey, res.clone()))
    return res
  } catch (e) {
    console.error('[api/search]', e)
    return json({ error: 'internal' }, 500)
  }
}
