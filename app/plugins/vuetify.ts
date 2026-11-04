import { h } from 'vue'
import { createVuetify, type IconProps, type IconSet } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import { mdiIcons } from '~/utils/icons'

// テンプレートの "mdi-xxx" を app/utils/icons.ts の SVG で描く。表に無い名前は何も描かない。
const mdiSvg: IconSet = {
  component: (props: IconProps) =>
    h(mdi.component, { ...props, icon: typeof props.icon === 'string' ? mdiIcons[props.icon] : undefined }),
}

const myCustomLightTheme = {
  dark: false,
  colors: {
    primary: '#1976d2',
    accent: '#424242',
    secondary: '#ff8f00',
    info: '#26a69a',
    warning: '#ffc107',
    error: '#dd2c00',
    success: '#00e676',
    pen: '#3c3c32',
    paper: '#f4f5f7',
  },
}

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    // Vuetify 4 で狭くなったブレークポイントを v3 の値に戻す (settings.scss の $grid-breakpoints と合わせる)
    display: {
      thresholds: { md: 960, lg: 1280, xl: 1920, xxl: 2560 },
    },
    // Vuetify の部品の中のアイコン ($close など) も SVG にする
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: { mdi: mdiSvg },
    },
    theme: {
      defaultTheme: 'myCustomLightTheme',
      themes: {
        myCustomLightTheme,
      },
    },
  })

  nuxtApp.vueApp.use(vuetify)
})
