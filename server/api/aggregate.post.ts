import { MongoClient } from 'mongodb'

const config = useRuntimeConfig()

export default defineEventHandler(async (event) => {
  const { collection, pipeline } = await readBody(event)

  if (!collection || !pipeline) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing collection or pipeline in request body',
    })
  }

  if (!config.mongodbUri) {
    throw createError({
      statusCode: 500,
      statusMessage: 'MongoDB URI is not configured. Please set MONGODB_URI in your .env file.',
    })
  }

  // MongoDB接続を作成
  const client = new MongoClient(config.mongodbUri)

  try {
    await client.connect()

    const db = client.db('hinari-cafe')
    const result = await db.collection(collection).aggregate(pipeline).toArray()

    // MongoDBのObjectIdをJSONシリアライズ可能な文字列に変換する
    const sanitizedResult = JSON.parse(JSON.stringify(result))

    return { documents: sanitizedResult }
  } catch (e: any) {
    console.error('MongoDB aggregation failed:', e)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to execute aggregation: ${e.message}`,
    })
  } finally {
    await client.close()
  }
})
