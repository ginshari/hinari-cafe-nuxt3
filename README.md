# hinari-cafe-nuxt3

VTuber理原ひなりさんの非公式ファンサイトです

## 構成

| フレームワーク | UI       | データベース  | 公開先           | 検索                  |
| -------------- | -------- | ------------- | ---------------- | --------------------- |
| Nuxt3          | Vuetify3 | Cloudflare D1 | Cloudflare Pages | Cloudflare Workers AI |

- D1 を読むのはビルド時だけ
- 公開されるのは静的ファイルだけ

## 前提条件

- Node.js 24 (`.nvmrc` で指定)
- Cloudflare のアカウント。D1 のデータベース `hinari-cafe`、Workers AI、Pages を使う
- Cloudflare の API トークン2本

  | トークン   | 権限                          |
  | ---------- | ----------------------------- |
  | ビルド用   | Workers AI : Read + D1 : Read |
  | 管理画面用 | Account → D1 → Edit           |

- YouTube Data API のキー (管理画面で動画の情報を取り込む場合のみ)

## セットアップ

```
npm install
```

`.env` を用意します。

```
CLOUDFLARE_ACCOUNT_ID=YOUR_ACCOUNT_ID
D1_DATABASE_ID=YOUR_DATABASE_ID

# ビルド用のトークン
CLOUDFLARE_API_TOKEN=YOUR_API_TOKEN

# 管理画面用のトークン
CLOUDFLARE_DEVELOPER_TOKEN=YOUR_DEVELOPER_TOKEN

# 管理画面で動画の情報を取り込む場合のみ
YOUTUBE_API_KEY=YOUR_API_KEY
```

## 開発

```
npm run dev
```

開発サーバーでは味・香りの検索が使えません。確かめ方は「手元でのビルド」にあります。

### 管理画面

http://localhost:3000/admin で D1 を直接読み書きできます (`coffees` / `lpItems` / `links` / `profiles` / `events` / `landingPage`)。

**本番のビルドには入りません。** `npm run dev` の実行時だけ使えます。管理画面用のトークンが必要です。YouTube Data API のキーは無くても動きますが、動画の情報を取り込む機能だけ使えません。

## 手元でのビルド

```
npm run generate && npm run build:vectors
```

動画ID・レビューコメント・モデルが前回と同じなら、埋め込みは行わず、`.cache/coffee-vectors/` に保存してあるベクトルを使います。作り直すときは `npm run build:vectors -- --force` です。

できたものは `npm run preview` で確かめられます。味・香りの検索も確かめるときは、wrangler で配信します。

```bash
npx wrangler pages dev .output/public --ai AI --port 8788
```

`--ai AI` を付けると Workers AI が使えます。**無料枠を消費します。**

## デプロイ

`git push` すると Cloudflare がビルドして公開します。Pages 側の設定は最初の一度だけ必要です。

**ビルドコマンド**

```
npm run generate && npm run build:vectors
```

Cloudflare のビルドでは、毎回すべてのレビューコメントを埋め込みます。

**ビルド時の環境変数**

| 変数                    | 内容                          |
| ----------------------- | ----------------------------- |
| `CLOUDFLARE_ACCOUNT_ID` | アカウントID                  |
| `CLOUDFLARE_API_TOKEN`  | ビルド用のトークン            |
| `D1_DATABASE_ID`        | D1 のデータベースID           |

`functions/` について Pages 側の設定は要りません。

## 仕様

### 検索の仕組み

コーヒー配信の検索は2種類あります。

- **銘柄名の検索** — ブラウザの中で、銘柄名を大文字小文字を区別せずに部分一致で絞り込みます。通信は起きません
- **味・香りの検索** — 埋め込みベクトルによる類似度検索です
  1. ビルド時に、レビューコメントを Workers AI の埋め込みモデル (`@cf/pfnet/plamo-embedding-1b`) で 2048 次元のベクトルにし、int8 に量子化して静的ファイルとして置く
  2. 検索時に、質問文を同じモデルでベクトルにし、全件とのコサイン類似度を計算する
  3. 類似度の高い順に上位5件の動画を返す。最も高い類似度が 0.6 未満なら該当なしとする

| ファイル                    | 役割                                                     |
| --------------------------- | -------------------------------------------------------- |
| `scripts/build-vectors.mts` | レビューコメントを埋め込み、ベクトルを `coffee-vectors.bin` に保存する |
| `functions/api/search.ts`   | 質問文を埋め込み、保存したベクトルとのコサイン類似度で検索する (Pages Functions) |
| `pages/coffees.vue`         | 検索画面                                                 |
