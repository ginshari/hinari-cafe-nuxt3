// フォーム (pages/admin/**) とサーバー (server/utils/admin-tables.ts) で共通の入力規則。
// メッセージも共通にすることで、フォームで弾いた場合と API で弾いた場合の文言が揃う。
import { hmsToSec } from './time'

export type RuleResult = string | true

const s = (v: unknown) => String(v ?? '').trim()

export const rules = {
  required: (v: unknown): RuleResult => (s(v) ? true : '必須項目です'),

  httpUrl: (v: unknown): RuleResult =>
    /^https?:\/\/\S*$/.test(s(v)) ? true : 'http(s):// で始まる URL を入力してください',

  optionalHttpUrl: (v: unknown): RuleResult => (s(v) === '' ? true : rules.httpUrl(v)),

  positiveInt: (v: unknown): RuleResult =>
    /^\d+$/.test(s(v)) && Number(s(v)) >= 1 ? true : '1以上の整数で入力してください',

  videoId: (v: unknown): RuleResult =>
    /^[\w-]{11}$/.test(s(v)) ? true : '11文字の YouTube 動画IDを入力してください',

  pubDate: (v: unknown): RuleResult =>
    /^\d{4}-\d{2}-\d{2}$/.test(s(v)) ? true : 'YYYY-MM-DD 形式で入力してください',

  yyyymm: (v: unknown): RuleResult => (/^\d{6}$/.test(s(v)) ? true : 'YYYYMM (6桁) で入力してください'),

  /** 配信内の位置 (秒)。上限は 6 時間 */
  seconds: (v: unknown): RuleResult =>
    /^\d+$/.test(s(v)) && Number(s(v)) <= 21600
      ? true
      : '0〜21600 の整数 (秒) で入力してください',

  /** HH:mm:ss または mm:ss */
  hms: (v: unknown): RuleResult =>
    hmsToSec(String(v ?? '')) !== null ? true : 'HH:mm:ss 形式で入力してください',

  // runbook に記録された登録ミス (reviewText と note の入れ替え、本文へのURL混入) を防ぐ
  reviewText: (v: unknown): RuleResult => {
    const t = s(v)
    if (!t) return '必須項目です (意味検索の入力になります)'
    if (/^https?:\/\/\S*$/.test(t)) return 'URLのみは不可。note と入れ替わっていませんか?'
    if (/https?:\/\//.test(t)) return '本文中にURLが混入しています'
    return true
  },

  inList:
    (values: readonly string[]) =>
    (v: unknown): RuleResult =>
      values.includes(s(v)) ? true : `${values.join(' / ')} のいずれかを選択してください`,
}

// 銘柄名を整える。全角空白を半角にし、連続する空白を1つにまとめ、前後の空白を削る。
// SQLite の trim() は半角空白しか削らないため、CHECK (name = trim(name)) だけでは
// 全角空白と連続空白を防げない。
export const normalizeName = (raw: string): string =>
  raw.replace(/　/g, ' ').replace(/ {2,}/g, ' ').trim()
