/** $fetch / useFetch の失敗からユーザーに出すメッセージを取り出す */
export const apiErrorMessage = (e: unknown): string => {
  const err = e as { data?: { statusMessage?: string }; message?: string } | null | undefined
  return err?.data?.statusMessage ?? err?.message ?? String(e)
}
