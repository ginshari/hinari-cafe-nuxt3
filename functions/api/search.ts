// コーヒーの意味検索で、質問文を埋め込んでベクトルを返すエンドポイント (Cloudflare Pages Functions)
//
//   POST /api/search  { "query": "酸味が控えめ" }
//   → { "model": "@cf/pfnet/plamo-embedding-1b", "embedding": [0.012, -0.034, ...] }
//
// レビューコメントとの類似度の計算はブラウザで行う (utils/vectorSearch.js)。
// ここで 344件 × 2048次元の計算をすると、Workers Free の CPU 時間 (1回 10ms) を超えるため。
// AIには文章を生成させず質問文をベクトルに変換させるのみなので、出力に事実でない文章が混ざることがない。

const MODEL = '@cf/pfnet/plamo-embedding-1b'
const MAX_QUERY_LEN = 100

// この Env は Worker に設定したバインディングの型をまとめたもの。
// バインディングは Worker から外部サービスを使うための接続設定で、
// ここでは Workers AI のバインディングを宣言している。
interface Env {
  AI: { run: (model: string, input: { text: string[] }) => Promise<{ data: number[][] }> }
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
    // 同じ質問文は推論をスキップしてキャッシュから返答する。
    // ベクトルはモデルと質問文だけで決まるので、キーにはこの2つを使う。
    const cacheKey = new Request(
      `${origin}/api/search?m=${encodeURIComponent(MODEL)}&q=${await hashQuery(query)}`,
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

    const res = json({ model: MODEL, embedding })
    // 同じ質問文とモデルからは同じベクトルが返るので長めに保持してよい
    res.headers.set('cache-control', 'public, max-age=86400')
    // 応答を待たせないよう、キャッシュ書き込みはバックグラウンドで行う
    context.waitUntil(cache.put(cacheKey, res.clone()))
    return res
  } catch (e) {
    console.error('[api/search]', e)
    return json({ error: 'internal' }, 500)
  }
}
