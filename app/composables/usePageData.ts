import { useFetch, createError } from '#app'

interface ApiResponse {
  documents: Record<string, unknown>[]
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
    // error.value.message は HTTP の応答の1行目から作られ、英数字以外 (日本語) が削られる。
    // 応答の本文の statusMessage には日本語が残るので、あればそちらを使う
    const bodyMessage = (error.value?.data as { statusMessage?: string } | undefined)?.statusMessage
    const detail = bodyMessage
      ? `[GET] "${path}": ${error.value?.statusCode} ${bodyMessage}`
      : (error.value?.message ?? 'No documents found.')
    throw createError({
      statusCode: error.value?.statusCode ?? 404,
      statusMessage: `${key}: ${detail}`,
      fatal: true,
    })
  }

  return data.value.documents
}
