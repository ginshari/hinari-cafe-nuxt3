import { createResolver } from '@nuxt/kit'
import vuetify from 'vite-plugin-vuetify'

const { resolve } = createResolver(import.meta.url)

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
          hid: 'description',
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
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
      ],
    },
  },

  build: {
    transpile: ['vuetify'],
  },

  css: ['vuetify/lib/styles/main.sass', '@mdi/font/css/materialdesignicons.min.css', '@/assets/main.scss'],

  experimental: {
    payloadExtraction: true,
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/'],
      // 固定クエリ (/api/landing|works|coffees) はビルド時に読むだけで、
      // 静的ファイルとして出力しない (出力すると D1 の全件が公開 JSON になる)。
      ignore: ['/api/'],
    },
    compressPublicAssets: true, // 静的アセットの圧縮を有効化
    // プリレンダ中のペイロードキャッシュをメモリのみにする。
    // ディスク書き込み(atomicWrite の rename)が Windows で EPERM になり
    // プリレンダが 500 で失敗するため(既知問題 nuxt/nuxt#35590 の回避)。
    // サイト規模は LRU(max 1000)に収まり、ディスクフォールバックは使われない。
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

  modules: [
    [
      '@nuxtjs/google-fonts',
      {
        download: false,
        useStylesheet: true,
        families: {
          'Mochiy+Pop+One': true,
        },
      },
    ],
  ],

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

  // 管理画面は production ビルドから物理的に除外する。
  // import.meta.dev ガードと二重に効かせる。layouts / middleware は参照が無くても
  // Nuxt がディレクトリ走査で登録するため、個別に列挙する必要がある。
  ignore:
    process.env.NODE_ENV === 'production'
      ? ['pages/admin/**', 'server/api/admin/**', 'layouts/admin.vue', 'middleware/admin.ts']
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

  compatibilityDate: '2025-06-27',
})
