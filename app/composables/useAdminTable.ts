export interface AdminHeader {
  title: string
  key: string
  sortable?: boolean
}

/** D1 の1行。列はテーブルごとに違うため、値は使う側で変換する */
export type AdminRow = Record<string, unknown>

// 管理画面一覧の取得・削除
export function useAdminTable(table: string) {
  const items = ref<AdminRow[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const load = async () => {
    loading.value = true
    error.value = null
    try {
      items.value = await $fetch<AdminRow[]>(`/api/admin/${table}`)
    } catch (e) {
      error.value = apiErrorMessage(e)
    } finally {
      loading.value = false
    }
  }

  const remove = async (id: number) => {
    await $fetch(`/api/admin/${table}/${id}`, { method: 'DELETE' })
    await load()
  }

  onMounted(load)

  return { items, loading, error, remove }
}
