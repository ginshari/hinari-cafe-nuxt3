// 管理画面が扱うテーブル定義と入力バリデーション
//
// サーバー側のバリデーションは d1/schema.sql の CHECK / UNIQUE と二重に効かせる。
// 規則そのものは utils/validation.ts にあり、フォーム (pages/admin/**) と共通。
import { type RuleResult, normalizeName, rules } from '~/utils/validation'

export type AdminTableName = 'coffees' | 'lpItems' | 'links' | 'profiles' | 'events' | 'landingPage'

export interface AdminColumn {
  name: string
  /** 省略時は text */
  type?: 'int' | 'text'
  /** NULL を許容する (空文字は NULL に正規化) */
  nullable?: boolean
  /** 保存前に値を正規化する */
  normalize?: (raw: string) => string
  rule?: (raw: string) => RuleResult
}

export interface AdminTable {
  name: AdminTableName
  label: string
  columns: AdminColumn[]
  orderBy?: string
  /** 1行のみのテーブル (landingPage)。追加・削除不可 */
  single?: boolean
}

export const ADMIN_TABLES: Record<AdminTableName, AdminTable> = {
  coffees: {
    name: 'coffees',
    label: 'コーヒー',
    orderBy: 'pubDate DESC, id DESC',
    columns: [
      { name: 'videoId', rule: rules.videoId },
      { name: 'name', normalize: normalizeName, rule: rules.required },
      { name: 'pubDate', rule: rules.pubDate },
      { name: 'videoTitle', rule: rules.required },
      { name: 'imgUrl', rule: rules.httpUrl },
      { name: 'orderTime', type: 'int', rule: rules.seconds },
      { name: 'reviewTime', type: 'int', rule: rules.seconds },
      { name: 'reviewText', rule: rules.reviewText },
      { name: 'note', nullable: true },
    ],
  },
  lpItems: {
    name: 'lpItems',
    label: 'トップページ項目',
    orderBy: 'category, "order"',
    columns: [
      { name: 'category', rule: rules.inList(['works', 'recommends', 'coffees']) },
      { name: 'order', type: 'int', rule: rules.positiveInt },
      { name: 'url', rule: rules.httpUrl },
      { name: 'imgUrl', rule: rules.httpUrl },
      { name: 'head', rule: rules.required },
      { name: 'body', rule: rules.required },
    ],
  },
  links: {
    name: 'links',
    label: 'リンク',
    orderBy: '"order"',
    columns: [
      { name: 'order', type: 'int', rule: rules.positiveInt },
      { name: 'text', rule: rules.required },
      { name: 'url', rule: rules.httpUrl },
    ],
  },
  profiles: {
    name: 'profiles',
    label: 'プロフィール',
    orderBy: '"order"',
    columns: [
      { name: 'order', type: 'int', rule: rules.positiveInt },
      { name: 'head', rule: rules.required },
      { name: 'body', rule: rules.required },
    ],
  },
  events: {
    name: 'events',
    label: 'イベント',
    orderBy: 'yyyymm DESC, branchNumber DESC',
    columns: [
      { name: 'yyyymm', rule: rules.yyyymm },
      { name: 'branchNumber', type: 'int', rule: rules.positiveInt },
      { name: 'category', rule: rules.inList(['works', 'topics']) },
      { name: 'name', rule: rules.required },
      { name: 'url', nullable: true, rule: rules.httpUrl },
    ],
  },
  landingPage: {
    name: 'landingPage',
    label: 'トップページ文面',
    single: true,
    columns: [
      { name: 'greeting', rule: rules.required },
      { name: 'annotation', rule: rules.required },
    ],
  },
}

export interface ValidatedInput {
  values: (string | number | null)[]
  error?: string
}

/** 入力オブジェクトをバリデーションしてカラム順のバインド値を返す */
export function validateInput(def: AdminTable, input: Record<string, any>): ValidatedInput {
  const values: (string | number | null)[] = []

  for (const c of def.columns) {
    const str = String(input?.[c.name] ?? '')

    if (c.type === 'int') {
      const result = c.rule ? c.rule(str) : true
      if (result !== true) return { values, error: `${c.name}: ${result}` }
      values.push(Number(str.trim()))
      continue
    }

    if (c.nullable && str.trim() === '') {
      values.push(null)
      continue
    }

    const result = c.rule ? c.rule(str) : true
    if (result !== true) return { values, error: `${c.name}: ${result}` }
    // text は一律 trim する。各フォームで .trim() を書き分けると漏れが出るため
    // (videoId に空白が残ると CHECK (length(videoId) = 11) で 409 になる)。
    values.push(c.normalize ? c.normalize(str) : str.trim())
  }

  if (def.name === 'coffees') {
    const orderTime = Number(input?.orderTime ?? 0)
    const reviewTime = Number(input?.reviewTime ?? 0)
    if (reviewTime <= orderTime) {
      return { values, error: 'reviewTime は orderTime より後にしてください' }
    }
  }

  return { values }
}
