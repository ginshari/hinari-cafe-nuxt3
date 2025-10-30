import { useFetch, useNuxtApp, createError } from '#app'
import type { UseFetchOptions } from '#app'

// APIレスポンスの型を定義
interface ApiResponse {
  documents: any[]
}

/**
 * MongoDBの集計APIを呼び出すためのカスタムコンポーザブル
 * @param collection 対象のコレクション名
 * @param pipeline MongoDBの集計パイプライン
 * @param key useFetchのキャッシュキー
 */
export const useApiFetch = async (collection: string, pipeline: any[], key: string) => {
  const { $apiConfig } = useNuxtApp()
  const apiConfig = $apiConfig(collection, pipeline)

  // useFetchのオプションの型を明示
  const opts: UseFetchOptions<ApiResponse> = {
    ...apiConfig,
    method: 'POST', // 型を 'POST' リテラル型として明示
    key, // キャッシュを有効にするためのユニークキー
    server: true, // サーバー側でのみ実行
    lazy: false, // SSG時に必ずデータを取得
    getCachedData: (key) => {
      // クライアントサイドではキャッシュされたデータを使用
      const data = useNuxtApp().payload.data[key] || useNuxtApp().static.data[key]
      return data
    },
  }

  // useFetchにジェネリクスで型を指定
  const { data, error } = await useFetch<ApiResponse>('/api/aggregate', opts)

  if (error.value) {
    console.error(`Error fetching ${collection} data:`, error.value)
    throw createError({
      statusCode: error.value.statusCode || 500,
      statusMessage: `${key}: useFetch failed. Details: ${error.value.message}`,
      fatal: true,
    })
  }

  if (!data.value?.documents) {
    throw createError({
      statusCode: 404,
      statusMessage: `${key}: No documents found.`,
      fatal: true,
    })
  }

  return data.value.documents
}
