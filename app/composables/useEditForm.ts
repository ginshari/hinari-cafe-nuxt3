// 管理画面の編集フォーム共通ロジック。listPath は保存後の遷移先。
export function useEditForm(table: string, listPath?: string) {
  const route = useRoute()
  const id = computed(() => (route.query.id ? Number(route.query.id) : null))
  const isEdit = computed(() => id.value !== null)
  const valid = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  /** 編集時は既存行を取得して apply(row) でフォームへ反映する */
  const load = async (apply: (row: Record<string, any>) => void) => {
    if (!isEdit.value) return
    error.value = null
    try {
      apply(await $fetch<Record<string, any>>(`/api/admin/${table}/${id.value}`))
    } catch (e: any) {
      error.value = apiErrorMessage(e)
    }
  }

  const submit = async (body: Record<string, any>) => {
    if (!valid.value) return
    saving.value = true
    error.value = null
    try {
      if (isEdit.value) {
        await $fetch(`/api/admin/${table}/${id.value}`, { method: 'PUT', body })
      } else {
        await $fetch(`/api/admin/${table}`, { method: 'POST', body })
      }
      await navigateTo(listPath ?? `/admin/${table.toLowerCase()}`)
    } catch (e: any) {
      error.value = apiErrorMessage(e)
    } finally {
      saving.value = false
    }
  }

  return { id, isEdit, valid, saving, error, load, submit }
}
