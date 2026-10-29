// 秒 ↔ HH:mm:ss の変換 (管理画面の ORDER / REVIEW 時刻用)
export function secToHms(seconds: number): string {
  const s = Math.max(0, Math.floor(Number(seconds) || 0))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return [h, m, sec].map((n) => String(n).padStart(2, '0')).join(':')
}

export function hmsToSec(value: string): number | null {
  const parts = String(value)
    .trim()
    .split(':')
    .map((x) => Number(x))
  if (parts.length < 2 || parts.length > 3) return null
  if (parts.some((n) => !Number.isInteger(n) || n < 0)) return null
  // 要素数は上で確かめているため、タプルとして扱う (Nuxt 4 の noUncheckedIndexedAccess 対策)
  if (parts.length === 3) {
    const [h, m, s] = parts as [number, number, number]
    if (m >= 60 || s >= 60) return null
    return h * 3600 + m * 60 + s
  }
  const [m, s] = parts as [number, number]
  if (s >= 60) return null
  return m * 60 + s
}