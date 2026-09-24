// YouTube 動画メタデータ取得。videos.list を fetch で叩くだけなので外部依存は不要。
// 必要な環境変数: YOUTUBE_API_KEY (ローカルの .env のみ)
export default defineEventHandler(async (event) => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'YOUTUBE_API_KEY が未設定です (.env に追加してください)',
    })
  }

  const { videoId } = getQuery(event)
  if (typeof videoId !== 'string' || !/^[\w-]{11}$/.test(videoId)) {
    throw createError({ statusCode: 400, statusMessage: '11文字の YouTube 動画IDを入力してください' })
  }

  const url = new URL('https://www.googleapis.com/youtube/v3/videos')
  url.searchParams.set('part', 'id,liveStreamingDetails,snippet')
  url.searchParams.set('id', videoId)
  url.searchParams.set('key', apiKey)
  url.searchParams.set(
    'fields',
    'items(id,liveStreamingDetails/actualStartTime,snippet(title,thumbnails/medium/url))',
  )

  const res = await fetch(url)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data.error?.message ?? `HTTP ${res.status}`
    throw createError({ statusCode: 502, statusMessage: `YouTube API error: ${msg}` })
  }

  const item = data.items?.[0]
  if (!item) {
    throw createError({ statusCode: 404, statusMessage: '動画が見つかりません' })
  }
  const actualStartTime = item.liveStreamingDetails?.actualStartTime
  if (!actualStartTime) {
    throw createError({ statusCode: 404, statusMessage: 'ライブ配信の開始日時 (actualStartTime) がありません' })
  }

  return {
    videoId: item.id,
    videoTitle: item.snippet?.title ?? '',
    pubDate: toLocalDate(String(actualStartTime)),
    imgUrl: item.snippet?.thumbnails?.medium?.url ?? '',
  }
})

// ISO 8601 をローカル時刻の YYYY-MM-DD に変換する (Java 側の ZoneId.systemDefault と同じ挙動)
function toLocalDate(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}