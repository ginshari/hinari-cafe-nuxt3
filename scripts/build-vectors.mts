// Nuxt の tsconfig は types を空にするため、このファイル内でのみ node 型を参照する
/// <reference types="node" />

// コーヒーの reviewText をベクトル化して静的アセットとして出力する
//
//   npm run generate && npm run build:vectors
//
// Cloudflare Pages のビルドコマンドで generate の後に連結する。
// 開発時は分離していたほうが都合がいいため npm run generate コマンドには含めない。
//
// 必要な環境変数(.env またはビルド環境変数):
//   CLOUDFLARE_ACCOUNT_ID
//   CLOUDFLARE_API_TOKEN   … 権限は Workers AI Read のみ

import 'dotenv/config'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import * as devalue from 'devalue'

const MODEL = '@cf/pfnet/plamo-embedding-1b'
const BATCH = 25
const OUT_DIR = '.output/public'
const PAYLOAD = path.join(OUT_DIR, 'coffees/_payload.json')
const BIN = path.join(OUT_DIR, 'coffee-vectors.bin')
const META = path.join(OUT_DIR, 'coffee-vectors.json')

// npm run generate は .output/ を作り直すため、UIだけ直した場合でもベクトルデータはリセットされる
// そのためベクトルデータの再生成が必要だが、変更がない場合はキャッシュから復元する
// .cache はCI(Cloudflare Pages)には存在しないため常にフル生成になる
const CACHE_DIR = '.cache/coffee-vectors'
const CACHE_BIN = path.join(CACHE_DIR, 'vectors.bin')
const CACHE_META = path.join(CACHE_DIR, 'meta.json')
const CACHE_KEY = path.join(CACHE_DIR, 'input.sha256')
const FORCE = process.argv.includes('--force')

interface Coffee {
  videoId: string
  name: string
  reviewText: string
}

interface EmbedResult {
  data: number[][]
  shape: [number, number]
}

function die(msg: string): never {
  console.error(`[build-vectors] ${msg}`)
  process.exit(1)
}

const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID
const TOKEN = process.env.CLOUDFLARE_API_TOKEN
// DEBUG: ビルド環境で何が見えているか確認するための一時出力
console.error('[build-vectors][debug] keys:', Object.keys(process.env).filter((k) => k.includes('CLOUDFLARE')).join(',') || '(CLOUDFLARE を含むキーが存在しない)')
console.error('[build-vectors][debug] CF_PAGES:', process.env.CF_PAGES)
console.error('[build-vectors][debug] ACCOUNT:', ACCOUNT ? 'set' : 'unset', 'TOKEN:', TOKEN ? 'set' : 'unset')
if (!ACCOUNT || !TOKEN) die('CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN が未設定です')
if (!fs.existsSync(PAYLOAD)) die(`${PAYLOAD} がありません。先に npm run generate を実行してください`)

// --- payload からレビューデータを取り出す ---
// Nuxt の payload は devalue という形式で書かれているため、同じライブラリで復元する。
const identity = (v: unknown) => v
const payload = devalue.parse(fs.readFileSync(PAYLOAD, 'utf8'), {
  ShallowReactive: identity,
  Reactive: identity,
  Ref: identity,
  ShallowRef: identity,
  EmptyRef: identity,
  NuxtError: identity,
}) as { data?: { coffeesPage?: { documents?: { coffees?: Coffee[] }[] } } }

const coffees: Coffee[] = (payload.data?.coffeesPage?.documents?.[0]?.coffees ?? []).map((c) => ({
  videoId: c.videoId,
  name: c.name,
  reviewText: String(c.reviewText ?? '')
    .replace(/\r\n/g, '\n')
    .trim(),
}))
if (!coffees.length) die('payload からレビューデータを取得できませんでした')

// --- 入力が変わっていなければキャッシュから復元する ---
//
// ハッシュが前回と同じなら、再埋め込みせずキャッシュ(.cache)を .output へコピーして終了する。
// ハッシュは次の3つから作る:
//   ・モデル名 … モデルを差し替えたら再埋め込みが必要なため
//   ・SCHEMA … 出力形式が変更されたら再埋め込みが必要なため
//   ・レビューデータ … データの更新があったら再埋め込みが必要なため
const SCHEMA = 'norms-v1'
const inputHash = crypto
  .createHash('sha256')
  .update(MODEL)
  .update(SCHEMA)
  // 内容が同じなら順序が変わっても一致するよう並び順を揃えてからハッシュする
  .update(
    coffees
      .map((c) => `${c.videoId} ${c.reviewText}`)
      .sort()
      .join(' '),
  )
  .digest('hex')

if (!FORCE && fs.existsSync(CACHE_KEY) && fs.readFileSync(CACHE_KEY, 'utf8').trim() === inputHash) {
  fs.copyFileSync(CACHE_BIN, BIN)
  fs.copyFileSync(CACHE_META, META)
  console.log('[build-vectors] キャッシュから復元しました。')
  console.log(`[build-vectors] 作り直すには npm run build:vectors -- --force を実行してください。`)
  process.exit(0)
}

// --- 埋め込み ---
const embed = async (texts: string[]): Promise<EmbedResult> => {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/ai/run/${MODEL}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: texts }),
  })
  const json = (await res.json().catch(() => null)) as { success?: boolean; result?: EmbedResult; errors?: unknown }
  if (!res.ok || !json?.success || !json.result) {
    throw new Error(`${res.status} ${JSON.stringify(json?.errors ?? json).slice(0, 300)}`)
  }
  return json.result
}

const started = Date.now()
const vectors: number[][] = []
let dims = 0

for (let i = 0; i < coffees.length; i += BATCH) {
  const chunk = coffees.slice(i, i + BATCH)
  let result: EmbedResult
  try {
    result = await embed(chunk.map((c) => c.reviewText))
  } catch (e) {
    // 埋め込み失敗時はビルドごと失敗させる
    die(`埋め込みに失敗しました (${i + 1}〜${i + chunk.length}件目): ${(e as Error).message}`)
  }
  if (!dims) dims = result.shape[1]
  if (result.shape[1] !== dims) die(`次元数が一致しません: ${dims} と ${result.shape[1]}`)
  vectors.push(...result.data)
  process.stdout.write(`\r[build-vectors] ${Math.min(i + BATCH, coffees.length)}/${coffees.length}`)
}
console.log('')

if (vectors.length !== coffees.length) die(`件数が一致しません: ${vectors.length} / ${coffees.length}`)

// --- int8 量子化 ---
// 各成分を -128〜127 の整数に丸めてファイルを圧縮する。
// コサイン類似度は大きさに影響されないかつ、float32 から int8 への量子化で精度がほとんど落ちないことが検証済み。
const quantized = new Int8Array(vectors.length * dims)
vectors.forEach((v, i) => {
  let max = 0
  for (const x of v) {
    const a = Math.abs(x)
    if (a > max) max = a
  }
  const scale = max === 0 ? 0 : 127 / max
  for (let j = 0; j < dims; j++) quantized[i * dims + j] = Math.round(v[j] * scale)
})

// 各ベクトルの長さ(ノルム)もビルド時に求めてメタデータへ保存しておく
// クエリに依存しない定数であるため、検索側での再計算を省略することができる
// 検索は量子化後の値で内積を取るため、ノルムも量子化後の値から計算する
const norms: number[] = new Array(coffees.length)
for (let i = 0; i < coffees.length; i++) {
  let sum = 0
  const offset = i * dims
  for (let j = 0; j < dims; j++) {
    const v = quantized[offset + j]
    sum += v * v
  }
  norms[i] = Math.sqrt(sum)
}

fs.writeFileSync(BIN, quantized)
fs.writeFileSync(
  META,
  JSON.stringify({
    model: MODEL,
    dims,
    count: coffees.length,
    generatedAt: new Date().toISOString(),
    ids: coffees.map((c) => c.videoId),
    norms,
  }),
)

// 次回の generate 後に再埋め込みせず復元できるようキャッシュを残す（ローカル向け）
fs.mkdirSync(CACHE_DIR, { recursive: true })
fs.copyFileSync(BIN, CACHE_BIN)
fs.copyFileSync(META, CACHE_META)
fs.writeFileSync(CACHE_KEY, inputHash)

const kb = (n: number) => `${(n / 1024).toFixed(0)}KB`
console.log(`[build-vectors] ${BIN} (${kb(fs.statSync(BIN).size)}) / ${META} (${kb(fs.statSync(META).size)})`)
console.log(`[build-vectors] ${coffees.length}件 × ${dims}次元 / ${((Date.now() - started) / 1000).toFixed(1)}秒`)
