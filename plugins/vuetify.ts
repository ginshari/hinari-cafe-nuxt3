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
    theme: {
      defaultTheme: 'myCustomLightTheme',
      themes: {
        myCustomLightTheme,
      },
    },
  })

  nuxtApp.vueApp.use(vuetify)
})
