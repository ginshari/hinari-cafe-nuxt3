import { createVuetify } from 'vuetify'
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
    theme: {
      defaultTheme: 'myCustomLightTheme',
      themes: {
        myCustomLightTheme,
      },
    },
  })

  nuxtApp.vueApp.use(vuetify)
})
