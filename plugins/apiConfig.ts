export default defineNuxtPlugin(() => {
  return {
    provide: {
      apiConfig: (collection: string, filter: JSON) => {
        const runtimeConfig = useRuntimeConfig()
        return {
          method: 'post',
          body: {
            dataSource: 'Cluster0',
            database: 'hinari-cafe',
            collection,
            filter,
          },
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Request-Headers': '*',
            'api-key': runtimeConfig.apiKey,
          },
          baseURL: runtimeConfig.public.apiBase,
        }
      },
    },
  }
})
