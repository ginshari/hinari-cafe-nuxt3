import { describe, expect, it } from 'vitest'
import { ADMIN_TABLES, validateInput } from '../../server/utils/admin-tables'

const validCoffee = {
  videoId: 'abcDEF_12-3',
  name: 'ブラジル サントス',
  pubDate: '2026-11-04',
  videoTitle: '【コーヒー】ブラジル',
  imgUrl: 'https://example.com/a.jpg',
  orderTime: '60',
  reviewTime: '120',
  reviewText: '酸味が少なくまろやか',
  note: '',
}

describe('validateInput (coffees)', () => {
  it('カラム順の値を返す。int は数に、空の note は null にする', () => {
    const { values, error } = validateInput(ADMIN_TABLES.coffees, validCoffee)
    expect(error).toBeUndefined()
    expect(values).toEqual([
      'abcDEF_12-3',
      'ブラジル サントス',
      '2026-11-04',
      '【コーヒー】ブラジル',
      'https://example.com/a.jpg',
      60,
      120,
      '酸味が少なくまろやか',
      null,
    ])
  })

  it('text は一律 trim する (videoId に空白が残って CHECK で 409 にならない。#124 の回帰)', () => {
    const { values, error } = validateInput(ADMIN_TABLES.coffees, { ...validCoffee, videoId: ' abcDEF_12-3 ' })
    expect(error).toBeUndefined()
    expect(values[0]).toBe('abcDEF_12-3')
  })

  it('銘柄名の空白を整える', () => {
    const { values } = validateInput(ADMIN_TABLES.coffees, {
      ...validCoffee,
      name: '\u3000ブラジル\u3000\u3000サントス ',
    })
    expect(values[1]).toBe('ブラジル サントス')
  })

  it('orderTime が空なら 0 秒として通さない (#124 の回帰)', () => {
    expect(validateInput(ADMIN_TABLES.coffees, { ...validCoffee, orderTime: '' }).error).toMatch(/^orderTime: /)
  })

  it('reviewTime は orderTime より後 (同じ時刻も不可)', () => {
    expect(validateInput(ADMIN_TABLES.coffees, { ...validCoffee, reviewTime: '60' }).error).toBe(
      'reviewTime は orderTime より後にしてください',
    )
    expect(validateInput(ADMIN_TABLES.coffees, { ...validCoffee, reviewTime: '30' }).error).toBe(
      'reviewTime は orderTime より後にしてください',
    )
  })

  it('reviewText と note の入れ替えを弾く', () => {
    expect(validateInput(ADMIN_TABLES.coffees, { ...validCoffee, reviewText: 'https://example.com/shop' }).error).toBe(
      'reviewText: URLのみは不可。note と入れ替わっていませんか?',
    )
  })

  it('最初に見つかった誤りを返す', () => {
    expect(validateInput(ADMIN_TABLES.coffees, { ...validCoffee, videoId: 'short', pubDate: 'x' }).error).toBe(
      'videoId: 11文字の YouTube 動画IDを入力してください',
    )
  })
})

describe('validateInput (ほかのテーブル)', () => {
  it('events: url は空なら null、あれば http(s) の URL', () => {
    const base = { yyyymm: '202611', branchNumber: '1', category: 'works', name: 'イベント' }
    expect(validateInput(ADMIN_TABLES.events, { ...base, url: '' })).toEqual({
      values: ['202611', 1, 'works', 'イベント', null],
    })
    expect(validateInput(ADMIN_TABLES.events, { ...base, url: 'example.com' }).error).toMatch(/^url: /)
  })

  it('lpItems: category は決まった値だけ', () => {
    const base = { order: '1', url: 'https://example.com', imgUrl: 'https://example.com/a.jpg', head: 'h', body: 'b' }
    expect(validateInput(ADMIN_TABLES.lpItems, { ...base, category: 'recommends' }).error).toBeUndefined()
    expect(validateInput(ADMIN_TABLES.lpItems, { ...base, category: 'other' }).error).toBe(
      'category: works / recommends / coffees のいずれかを選択してください',
    )
  })
})
