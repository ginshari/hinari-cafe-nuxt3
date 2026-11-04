import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { createResolver } from 'nuxt/kit'
import vuetify from 'vite-plugin-vuetify'

const { resolve } = createResolver(import.meta.url)

// Vuetify 4 の CSS のレイヤーの順番。どの CSS より先に宣言しないと、先に読み込まれた
// コンポーネントの CSS のレイヤーが一番弱くなり、リセットなどに負ける (dev で起きる)。
const vuetifyLayers = readFileSync(createRequire(import.meta.url).resolve('vuetify/styles/layers'), 'utf8')

export default defineNuxtConfig({
  app: {
    head: {
      title: "Hinari's Cafe | 理原ひなり非公式ファンサイト",
      htmlAttrs: {
        lang: 'ja',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            "Hinari's CafeはVTuber理原ひなりさんの非公式ファンサイトです。オススメ動画の紹介のほか、今までのコーヒー配信を銘柄から逆引き検索できる機能を実装しております。",
        },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@hinaricafe_TO' },
        { property: 'og:url', content: 'https://hinaricafe.net/' },
        {
          property: 'og:title',
          content: "Hinari's Cafe | 理原ひなり非公式ファンサイト",
        },
        {
          property: 'og:description',
          content:
            "Hinari's CafeはVTuber理原ひなりさんの非公式ファンサイトです。オススメ動画の紹介のほか、今までのコーヒー配信を銘柄から逆引き検索できる機能を実装しております。",
        },
        { property: 'og:image', content: 'https://hinaricafe.net/ogp.jpg' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
      style: [{ innerHTML: vuetifyLayers, tagPriority: 'critical' }],
    },
  },

  // 起動に 6 秒ほどかかり dev が重くなるため切る。使うときは true に戻す。
  devtools: { enabled: false },

  build: {
    transpile: ['vuetify'],
  },

  css: ['vuetify/lib/styles/main.sass', '@/assets/main.scss'],

  experimental: {
    payloadExtraction: true,
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/'],
      // /api/landing・/api/works・/api/coffees をファイルとして書き出さない。
      // 書き出すと D1 の全データが公開される。
      ignore: ['/api/'],
    },
    compressPublicAssets: true, // 静的アセットの圧縮を有効化
    // ビルド中に作る payload の一時データをメモリだけに置く。Windows では
    // ファイルへの書き込みが EPERM で失敗してビルドが止まるため (nuxt/nuxt#35590)。
    storage: {
      'internal:nuxt:prerender': {
        driver: 'memory',
      },
    },
  },

  hooks: {
    'vite:extendConfig': (config) => {
      config.plugins!.push(
        vuetify({
          styles: { configFile: resolve('./settings.scss') },
        }),
      )
    },
  },

  // Mochiy Pop One を @fontsource/mochiy-pop-one (node_modules) から取り、サイトから配る。
  // Google Fonts の CSS を待って表示が止まることが無くなる。フォントのファイルはビルドの
  // 出力にだけ入り、リポジトリには入らない。ほかのフォントを外から取ってこないよう、
  // npm 以外の取り先は使わない。
  fonts: {
    families: [{ name: 'Mochiy Pop One', provider: 'npm', weights: [400] }],
    providers: {
      adobe: false,
      bunny: false,
      fontshare: false,
      fontsource: false,
      google: false,
      googleicons: false,
    },
  },

  modules: ['@nuxt/fonts'],

  // 管理画面はデータをブラウザで読むため SSR は要らない。dev で SSR すると、
  // ページを開くたびに Vuetify の SASS をサーバー側でもコンパイルして重くなる。
  // 本番のビルドには管理画面が無いので、下の ignore と同じく dev のときだけ入れる。
  routeRules: process.env.NODE_ENV === 'production' ? {} : { '/admin/**': { ssr: false } },

  router: {
    options: {
      strict: false,
    },
  },

  runtimeConfig: {
    public: {
      apiBase: '',
    },
  },

  // 管理画面を本番のビルドから除く。layouts と middleware は、使われていなくても
  // Nuxt がディレクトリ内の全ファイルを読み込むため、ファイル単位で指定する。
  // パターンは srcDir (app/) ではなくプロジェクトのルートからの相対パスで書く。
  ignore:
    process.env.NODE_ENV === 'production'
      ? ['app/pages/admin/**', 'server/api/admin/**', 'app/layouts/admin.vue', 'app/middleware/admin.ts']
      : [],

  vite: {
    define: {
      'process.env.DEBUG': false,
    },
    build: {
      cssCodeSplit: false, // CSSを1つのファイルにまとめる
      rollupOptions: {
        output: {
          manualChunks: undefined, // 自動チャンク分割を無効化
        },
      },
    },
  },

  compatibilityDate: '2026-10-29',
})
