// 管理画面 API 共通の入口処理。
// production ビルドでは nuxt.config の ignore で除外されるが、import.meta.dev ガードで二重に防御する。
import type { H3Event } from 'h3'
import { ADMIN_TABLES, type AdminTable } from '~/server/utils/admin-tables'

export function resolveAdminTable(event: H3Event): AdminTable {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  const name = getRouterParam(event, 'table') as keyof typeof ADMIN_TABLES
  const def = ADMIN_TABLES[name]
  if (!def) {
    throw createError({ statusCode: 404, statusMessage: `unknown table: ${name}` })
  }
  return def
}
