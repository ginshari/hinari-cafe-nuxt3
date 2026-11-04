const SITE_URL = 'https://hinaricafe.net'
const SITE_NAME = "Hinari's Cafe"

/**
 * ページごとのタイトル・説明・OGP・正規の URL を設定する。
 * nuxt.config.ts の app.head にある同じ名前の meta は、ここで上書きされる。
 *
 * @param path  末尾に / を付けたパス (例: /works/)。生成される HTML の置き場所に合わせる
 * @param title 省略するとトップページのタイトルになる
 */
export const usePageSeo = (options: { path: string; description: string; title?: string }) => {
  const title = options.title ? `${options.title} | ${SITE_NAME}` : `${SITE_NAME} | 理原ひなり非公式ファンサイト`
  const url = SITE_URL + options.path

  useSeoMeta({
    title,
    description: options.description,
    ogTitle: title,
    ogDescription: options.description,
    ogUrl: url,
  })
  useHead({ link: [{ rel: 'canonical', href: url }] })
}
