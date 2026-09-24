// 管理画面 API: GET 一覧 / POST 追加 (docs/d1-migration.md Phase 2)
import { resolveAdminTable } from '~/server/utils/admin-route'
import { validateInput } from '~/server/utils/admin-tables'
import { d1Rows, d1Run } from '~/server/utils/d1'

export default defineEventHandler(async (event) => {
  const def = resolveAdminTable(event)

  if (event.method === 'GET') {
    const orderBy = def.orderBy ? ` ORDER BY ${def.orderBy}` : ''
    return await d1Rows(`SELECT * FROM "${def.name}"${orderBy}`)
  }

  if (event.method === 'POST') {
    if (def.single) {
      throw createError({ statusCode: 405, statusMessage: `${def.label} は更新のみ可能です` })
    }
    const { values, error } = validateInput(def, await readBody(event))
    if (error) {
      throw createError({ statusCode: 400, statusMessage: error })
    }
    const columns = def.columns.map((c) => `"${c.name}"`).join(', ')
    const placeholders = def.columns.map(() => '?').join(', ')
    const { lastRowId } = await d1Run(
      `INSERT INTO "${def.name}" (${columns}) VALUES (${placeholders})`,
      values,
    )
    return { id: lastRowId }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
})
