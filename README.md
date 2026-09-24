# hinari-cafe-nuxt3

VTuber理原ひなりさんの非公式ファンサイトです

## Architecture

| Main Framework | UI Framework | DataBase      | Deployment       | Search              |
| -------------- | ------------ | ------------- | ---------------- | ------------------- |
| Nuxt3          | Vuetify3     | Cloudflare D1 | Cloudflare Pages | Cloudflare Workers AI |

データは Cloudflare D1 にあります。DB はビルド時のみ読まれ、配信物は静的ファイルのみです。

- **管理画面**(`/admin`)は D1 を直接読み書きします。ローカルの `npm run dev` でのみ有効で、production ビルドには含まれません

コーヒー配信の検索は2系統あります。

| 種類         | 実装                                | 通信 |
| ------------ | ----------------------------------- | ---- |
| 銘柄名検索   | クライアント側の部分一致            | なし |
| 味・香り検索 | 埋め込み検索 (Pages Functions)      | あり |

味・香り検索は、レビューコメントをビルド時にベクトル化した索引を使います。LLMに文章を生成させず、類似度の高い動画IDを返すだけの構成です。

- `scripts/build-vectors.mts` — ビルド時に索引を生成 (Node / Pages のビルドコンテナ)
- `functions/api/search.ts` — 検索エンドポイント (Worker / エッジ)
- `pages/coffees.vue` — チャットUI (ブラウザ)

## Setup

Make sure to install the dependencies:

```
npm install
```

Create .env file:

```
# Cloudflare (for building the search index)
CLOUDFLARE_ACCOUNT_ID=YOUR_ACCOUNT_ID
CLOUDFLARE_API_TOKEN=YOUR_API_TOKEN

# Cloudflare D1 (for the admin UI)
# ローカル開発トークン: Cloudflare Dashboard → My Profile → API Tokens → Create Token →
# 「Account → D1 → Edit」権限 (読み書き可)
CLOUDFLARE_DEVELOPER_TOKEN=YOUR_DEVELOPER_TOKEN
D1_DATABASE_ID=540cb5f3-fbce-4629-9ab3-591db2b29262

# YouTube Data API v3 (管理画面の動画情報自動取得)
YOUTUBE_API_KEY=YOUR_API_KEY
```

`CLOUDFLARE_API_TOKEN` は**ビルド時のみ**使用します(Workers AI : Read + D1 : Read)。D1 へはビルドコンテナからのみアクセスし、実環境(配信物)は静的ファイル + Workers AI だけです。ランタイムに D1 は使いません。

D1 の権限は「Edit」と「Read」が選択肢として並んでいますが、**Edit は Read を包含するため、書き込みが必要な管理画面トークンは Edit を選ぶだけで Read は不要です(両方は選びません)**。ビルド用トークンは読み取り専用なので D1:Read で足ります。

**IP制限（Client IP Address Filtering）はかけないでください。** Cloudflare Pages のビルドコンテナのIPは動的なためビルドが失敗します。ローカルでもIPv6のプレフィックスが変わると突然認証が通らなくなり、原因の分かりにくい不具合になります。

## Development Server

Start the development server on http://localhost:3000

```
npm run dev
```

`npm run dev` では **`/api/search` が存在しません**。Pages Functions は Nuxt の開発サーバーでは動かないため、味・香り検索は動作しません。UIだけを直す場合はこれで十分です。

### 管理画面

`npm run dev` で **http://localhost:3000/admin** にアクセスすると、D1 を直接読み書きする管理画面(`coffees` / `lpItems` / `links` / `profiles` / `events` / `landingPage` の CRUD)が使えます。

**管理画面は production ビルドから物理的に除外されています。** 本番デプロイ物に admin は一切含まれません(ローカル専用)。

使うには `.env` に以下が必要です:

- `CLOUDFLARE_DEVELOPER_TOKEN`(D1 への読み書き。権限は「Account → D1 → Edit」)
- `YOUTUBE_API_KEY`(coffees 編集で動画IDからタイトル・日付・サムネイルを自動取得するため。未設定でも警告が出るだけで他は動きます)

検索まで含めて確認する場合は、ビルドしてから wrangler で配信します。

```bash
npm run generate
npm run build:vectors
npx wrangler pages dev .output/public --ai AI --port 8788
```

`--ai AI` を付けると Workers AI のバインディングが有効になります。**Workers AI はローカルで再現できないため、リモートに中継され実際に無料枠を消費します。**

## Production

Build the application for production:

```
npm run generate
npm run build:vectors
```

**`npm run generate` は `.output/` を作り直すため、後から生成した索引を消します。必ず `build:vectors` を後に実行してください。**

production ビルドには管理画面(`/admin` と `api/admin`)は含まれません。

索引は入力（レビューコメント）が変わっていなければ `.cache/` から復元され、再生成しません。強制する場合:

```
npm run build:vectors -- --force
```

Locally preview production build:

```
npm run preview
```

## Deployment

### Cloudflare Pages の設定

初回のみ、以下の設定が必要です。

**ビルドコマンド**

```
npm run generate && npm run build:vectors
```

**ビルド環境変数**

| 変数                    | 内容                                                       |
| ----------------------- | ---------------------------------------------------------- |
| `CLOUDFLARE_ACCOUNT_ID` | アカウントID                                               |
| `CLOUDFLARE_API_TOKEN`  | Workers AI : Read + D1 : Read 権限のトークン               |
| `D1_DATABASE_ID`        | D1 データベースID(新規変数は **Encrypt** で登録する)       |

未設定のままだとビルドが失敗します。`functions/` ディレクトリは Pages が自動的に検出するため、Worker 側の設定は不要です。

#### ビルドの再現性について

Cloudflare Pages は `.nvmrc` の Node 24 を入れますが、**`.nvmrc` が効くのは Node だけで npm は対象外**です。npm は Cloudflare 既定の **9.6.7** が使われます。

npm 9 は peer 依存を毎回レジストリから解決し直すため、`npm ci` が `package-lock.json` を無視した状態になり、**依存パッケージが新しく公開されただけでビルドが壊れます**。実際 2026-09-04 11:21 に成功したビルドが、その3時間後に公開された `eslint@10.10.0` が原因で 09-06 に同一コミットのまま失敗しました(`eslint-config-prettier` の peer が `eslint: ">=7.0.0"` と上限なし)。

対策として `.npmrc` に `legacy-peer-deps=true` を入れてあります。peer の自動解決を止めることで `npm ci` がロックファイルどおりに入り、npm 9 / 11 のどちらでもビルドが再現します。Cloudflare 側の設定は不要です。

### デプロイ手順

```bash
git push   # Cloudflare でビルド・デプロイ
```
