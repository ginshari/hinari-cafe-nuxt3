// 管理画面 API の入口の共通処理。
// 本番のビルドからは nuxt.config の ignore で除いているが、ここでも本番なら 404 を返す。
import type { H3Event } from 'h3'
import { ADMIN_TABLES, type AdminTable, type AdminTableName } from '~/server/utils/admin-tables'

export function resolveAdminTable(event: H3Event): AdminTable {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  // ADMIN_TABLES[name] だけで確かめると、constructor や toString のように
  // オブジェクトが最初から持っている名前でも値が返るため、hasOwn で確かめる。
  const name = getRouterParam(event, 'table') ?? ''
  if (!Object.hasOwn(ADMIN_TABLES, name)) {
    throw createError({ statusCode: 404, statusMessage: `unknown table: ${name}` })
  }
  return ADMIN_TABLES[name as AdminTableName]
}
