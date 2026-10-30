export default defineNuxtRouteMiddleware(() => {
  // 管理画面は開発時のみ公開。production ビルドでは nuxt.config の ignore で物理的に
  // 除外される。ここは万一漏れたときの防御。
  if (!import.meta.dev) {
    return navigateTo('/')
  }
})