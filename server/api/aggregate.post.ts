import { MongoClient } from 'mongodb'

const config = useRuntimeConfig()

// MongoDB Clientのインスタンスをキャッシュする
let client: MongoClient | null = null

async function getMongoClient(): Promise<MongoClient> {
  if (!client) {
    if (!config.mongodbUri) {
      throw new Error('MongoDB URI is not configured. Please set MONGODB_URI in your .env file.')
    }
    client = new MongoClient(config.mongodbUri)
    await client.connect()
  }
  return client
}

export default defineEventHandler(async (event) => {
  const { collection, pipeline } = await readBody(event)

  if (!collection || !pipeline) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing collection or pipeline in request body',
    })
  }

  try {
    const mongoClient = await getMongoClient()
    const db = mongoClient.db('hinari-cafe')
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
  }
})
