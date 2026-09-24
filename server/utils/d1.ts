// D1 REST API の薄いラッパー (管理画面用。scripts/d1.mjs と同一仕様)
//
// 必要な環境変数 (ローカルの .env のみ。公開してはならない):
//   CLOUDFLARE_ACCOUNT_ID     … アカウントID
//   D1_DATABASE_ID            … データベースID
//   CLOUDFLARE_DEVELOPER_TOKEN … D1:Edit の開発用トークン (なければ CLOUDFLARE_API_TOKEN にフォールバック)
//
// D1 REST API は1リクエストに1文のみ(複数文不可)。値の受け渡しはパラメータバインドを使う。

interface D1RawResult {
  results: Record<string, unknown>[]
  lastRowId?: number
  changes?: number
}

async function d1Query(sql: string, params: unknown[] = []): Promise<D1RawResult> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const databaseId = process.env.D1_DATABASE_ID
  const token = process.env.CLOUDFLARE_DEVELOPER_TOKEN || process.env.CLOUDFLARE_API_TOKEN

  if (!accountId || !databaseId || !token) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'D1 の環境変数が未設定です (CLOUDFLARE_ACCOUNT_ID / D1_DATABASE_ID / CLOUDFLARE_DEVELOPER_TOKEN)',
    })
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql, params }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.success !== true) {
    const msg = data.errors?.map((e: any) => e.message).join('; ') ?? `HTTP ${res.status}`
    // CHECK / UNIQUE 制約違反は入力の問題なので 409 にする
    const status = /constraint/i.test(msg) ? 409 : 502
    throw createError({ statusCode: status, statusMessage: `D1 query failed: ${msg}` })
  }
  const r = data.result?.[0]
  return {
    results: r?.results ?? [],
    lastRowId: r?.meta?.last_row_id,
    changes: r?.meta?.changes,
  }
}

/** SELECT の行配列を返す */
export async function d1Rows(sql: string, params: unknown[] = []): Promise<Record<string, any>[]> {
  return (await d1Query(sql, params)).results
}

/** INSERT / UPDATE / DELETE を実行して meta を返す */
export async function d1Run(
  sql: string,
  params: unknown[] = [],
): Promise<{ lastRowId?: number; changes?: number }> {
  const r = await d1Query(sql, params)
  return { lastRowId: r.lastRowId, changes: r.changes }
}