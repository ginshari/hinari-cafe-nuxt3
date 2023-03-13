export default defineNuxtPlugin(() => {
  return {
    provide: {
      apiConfig: (collection: string, pipeline: Array<JSON>) => {
        const runtimeConfig = useRuntimeConfig()
        return {
          method: 'post',
          body: {
            dataSource: 'Cluster0',
            database: 'hinari-cafe',
            collection,
            pipeline,
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
