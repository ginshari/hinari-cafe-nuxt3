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
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },

  build: {
    transpile: ['vuetify'],
  },

  css: ['vuetify/lib/styles/main.sass', '@mdi/font/css/materialdesignicons.min.css', '@/assets/main.scss'],

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
    mongodbUri: '',
    public: {
      apiBase: '',
    },
  },

  vite: {
    define: {
      'process.env.DEBUG': false,
    },
  },

  compatibilityDate: '2025-06-27',
})
