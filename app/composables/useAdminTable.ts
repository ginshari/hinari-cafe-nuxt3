export interface AdminHeader {
  title: string
  key: string
  sortable?: boolean
}

// 管理画面一覧の取得・削除
export function useAdminTable(table: string) {
  const items = ref<Record<string, any>[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const load = async () => {
    loading.value = true
    error.value = null
    try {
      items.value = await $fetch<Record<string, any>[]>(`/api/admin/${table}`)
    } catch (e: any) {
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
