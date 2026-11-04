# hinari-cafe-nuxt3

VTuber 理原ひなり (ことはら ひなり) さんの非公式ファンサイト。Nuxt 4 + Vuetify 4 の静的サイトを Cloudflare Pages に置いている。D1 を読むのはビルドのときだけで、サーバー側で動くのは `functions/api/search.ts` (Pages Functions) だけ。詳しくは README.md。

## やってはいけないこと

- `npm run build:vectors`: Workers AI の無料枠を使う。Cloudflare のビルドが毎回実行するので、手元では実行しない
- D1 への書き込み: 管理画面の保存・削除、`/api/admin/*` への POST・PUT・DELETE
- main への直接の push: ブランチを切って PR を出す
- `npm audit fix --force`: nuxt・eslint などを古い版に下げようとする (2026-11 時点)

## 確かめるコマンド

| コマンド            | 内容                                                                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run lint`      | ESLint (Vuetify 4 の非推奨の書き方も検出する)                                                                                               |
| `npm run lint-css`  | stylelint。直すときは `npm run lint-css:fix`                                                                                                |
| `npm run typecheck` | 型チェック。開発モードで型を作る (`scripts/typecheck.mjs`)。`nuxi typecheck` を直接使うと、本番モードで管理画面が除かれ、誤ったエラーが出る |
| `npm test`          | vitest (`test/unit/`)。Nuxt に依存しない関数のテスト                                                                                        |
| `npm run generate`  | ビルド。D1 に届かない環境では `/` のプリレンダーで止まる (ビルドの部分までは確かめられる)                                                   |

`generate` 以外は CI (`.github/workflows/ci.yml`) で回す。

## 構成

- `app/`: 画面。管理画面 (`app/pages/admin/**` など) は dev だけで使い、本番のビルドからは `nuxt.config.ts` の `ignore` で除く
- `shared/utils/`: 画面とサーバーの両方で使う (入力の規則など)
- `server/`: ビルドのときに D1 を読む API と、dev だけの管理画面の API
- `functions/`: Pages Functions (Nuxt の外)
- `scripts/`: `build-vectors.mts` (埋め込みベクトルを作る) と `typecheck.mjs`

## 慣例

- コミット・PR・issue は日本語
- `package.json` の version: 依存の更新や小さな修正は patch、大きな移行 (Nuxt・Vuetify のメジャーなど) は minor。並行する PR が同じ行を変えてぶつかるときは、どの PR で上げるかを決めてから上げる
- PR の本文に「確かめた項目」と「確かめられなかった項目」を書く
- 依存を入れるときは `--before=<日付>` で、公開されたばかりの版を避ける

## ハマりどころ

- **vite は nuxt と同じメジャーにそろえる** (#143)。Nuxt 4.5 以降は vite 8
- **ロックファイルのコンフリクトは片側を取らない。** 両方の更新を残して npm で作り直し、版が下がっていないかを確かめる (#155 で #154 の更新を戻してしまい、#156 で直した)
- **Vuetify 4 の CSS のレイヤー:** `nuxt.config.ts` の `vuetifyLayers` で、レイヤーの順番を `<head>` の最初に宣言している。消すと、dev でコンポーネントの CSS がリセットに負ける
- **v3 の見た目を保つ設定:** `settings.scss` (ブレークポイント、ボタンの大文字と文字の間隔) と `app/plugins/vuetify.ts` (`display.thresholds`)
- **payload のキー:** `usePageData` の `coffeesPage` は `scripts/build-vectors.mts` が読むので変えない
- **dev だけの設定:** `nuxt.config.ts` の `ignore` と `routeRules` (管理画面の SSR を切る) は `NODE_ENV` で切り替えている
- **Windows:** プリレンダーの一時データはメモリに置く (`nitro.storage`)。ファイルに書くと EPERM で止まる
- **D1 のデータが要るページ** (`/` `/works` `/coffees`) は、D1 に届かない環境では描画できない。見た目は Cloudflare Pages のプレビューで確かめる
- **Prettier:** 未整形のファイルが一部ある。関係の無い PR でまとめて整形しない (差分が大きくなり、ほかの PR とぶつかる)
