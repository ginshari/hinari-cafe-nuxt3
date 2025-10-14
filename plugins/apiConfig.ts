export default defineNuxtPlugin(() => {
  return {
    provide: {
      apiConfig: (collection: string, pipeline: Array<JSON>) => {
        return {
          method: 'post',
          body: {
            collection,
            pipeline,
          },
        }
      },
    },
  }
})
