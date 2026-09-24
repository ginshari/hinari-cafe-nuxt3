// 管理画面 API: GET 単行 / PUT 更新 / DELETE 削除
import { resolveAdminTable } from '~/server/utils/admin-route'
import { validateInput } from '~/server/utils/admin-tables'
import { d1Rows, d1Run } from '~/server/utils/d1'

export default defineEventHandler(async (event) => {
  const def = resolveAdminTable(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid id' })
  }

  if (event.method === 'GET') {
    const rows = await d1Rows(`SELECT * FROM "${def.name}" WHERE id = ?`, [id])
    if (!rows.length) {
      throw createError({ statusCode: 404, statusMessage: 'not found' })
    }
    return rows[0]
  }

  if (event.method === 'PUT') {
    const { values, error } = validateInput(def, await readBody(event))
    if (error) {
      throw createError({ statusCode: 400, statusMessage: error })
    }
    const setClause = def.columns.map((c) => `"${c.name}" = ?`).join(', ')
    const { changes } = await d1Run(`UPDATE "${def.name}" SET ${setClause} WHERE id = ?`, [
      ...values,
      id,
    ])
    if (changes === 0) {
      throw createError({ statusCode: 404, statusMessage: 'not found' })
    }
    return { ok: true }
  }

  if (event.method === 'DELETE') {
    if (def.single) {
      throw createError({ statusCode: 405, statusMessage: `${def.label} は削除できません` })
    }
    await d1Run(`DELETE FROM "${def.name}" WHERE id = ?`, [id])
    return { ok: true }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
})
