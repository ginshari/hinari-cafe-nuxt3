/** $fetch / useFetch の失敗からユーザーに出すメッセージを取り出す */
export const apiErrorMessage = (e: any): string => e?.data?.statusMessage ?? e?.message ?? String(e)
