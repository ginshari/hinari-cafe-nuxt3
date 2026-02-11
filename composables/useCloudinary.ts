/**
 * Cloudinary画像URLを生成するcomposable
 * サードパーティクッキーを防ぐため、crossorigin属性の使用を推奨
 */
export const useCloudinary = () => {
  const baseUrl = 'https://res.cloudinary.com/hinari-s-cafe/image/upload'

  /**
   * Cloudinary画像URLを生成
   * @param path 画像のパス（バージョン番号とファイル名を含む）例: "v1234567890/example.png"
   * @param transformations 変換パラメータ 例: "f_auto,q_auto" または "c_fit,f_auto,q_auto,w_800"
   * @returns 完全なCloudinary URL
   */
  const getImageUrl = (path: string, transformations: string = 'f_auto,q_auto') => {
    return transformations ? `${baseUrl}/${transformations}/${path}` : `${baseUrl}/${path}`
  }

  return {
    getImageUrl,
  }
}
