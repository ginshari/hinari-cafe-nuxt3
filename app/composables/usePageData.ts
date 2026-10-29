import { useFetch, createError } from '#app'

interface ApiResponse {
  documents: any[]
}

/**
 * ビルド時に D1 の固定クエリを読む。
 *
 * @param path 固定クエリのパス (/api/landing | /api/works | /api/coffees)
 * @param key  payload のキー (landingPage / worksPage / coffeesPage)。
 *             scripts/build-vectors.mts が payload.data.coffeesPage を読むため変えない
 */
export const usePageData = async (path: string, key: string) => {
  const { data, error } = await useFetch<ApiResponse>(path, {
    key,
    // クライアント遷移では payload / static のキャッシュを使う。
    // 完全静的配信なので /api/* はランタイムに存在しない。
    // Nuxt 4 では初回以外 (refresh など) にも呼ばれるため、useNuxtApp() ではなく引数の nuxtApp を使う。
    getCachedData: (cacheKey, nuxtApp) => nuxtApp.payload.data[cacheKey] || nuxtApp.static.data[cacheKey],
  })

  if (error.value || !data.value?.documents) {
    throw createError({
      statusCode: error.value?.statusCode ?? 404,
      statusMessage: `${key}: ${error.value?.message ?? 'No documents found.'}`,
      fatal: true,
    })
  }

  return data.value.documents
}
