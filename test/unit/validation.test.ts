import { describe, expect, it } from 'vitest'
import { normalizeName, rules } from '../../shared/utils/validation'

describe('rules', () => {
  it('required: 空白だけは不可', () => {
    expect(rules.required('a')).toBe(true)
    expect(rules.required('')).toBe('必須項目です')
    expect(rules.required('   ')).toBe('必須項目です')
    expect(rules.required(null)).toBe('必須項目です')
  })

  it('httpUrl: http(s):// で始まり、空白を含まない', () => {
    expect(rules.httpUrl('https://example.com/a')).toBe(true)
    expect(rules.httpUrl('http://example.com')).toBe(true)
    expect(rules.httpUrl('ftp://example.com')).not.toBe(true)
    expect(rules.httpUrl('https://example.com/a b')).not.toBe(true)
    expect(rules.httpUrl('')).not.toBe(true)
  })

  it('optionalHttpUrl: 空なら可、あれば httpUrl と同じ', () => {
    expect(rules.optionalHttpUrl('')).toBe(true)
    expect(rules.optionalHttpUrl('https://example.com')).toBe(true)
    expect(rules.optionalHttpUrl('example.com')).not.toBe(true)
  })

  it('positiveInt: 1 以上の整数', () => {
    expect(rules.positiveInt('1')).toBe(true)
    expect(rules.positiveInt(' 2 ')).toBe(true)
    expect(rules.positiveInt('0')).not.toBe(true)
    expect(rules.positiveInt('-1')).not.toBe(true)
    expect(rules.positiveInt('1.5')).not.toBe(true)
  })

  it('videoId: 11 文字の英数字・_・-', () => {
    expect(rules.videoId('abcDEF_12-3')).toBe(true)
    expect(rules.videoId(' abcDEF_12-3 ')).toBe(true)
    expect(rules.videoId('abcDEF_12-')).not.toBe(true)
    expect(rules.videoId('abcDE F_12-3')).not.toBe(true)
  })

  it('pubDate と yyyymm', () => {
    expect(rules.pubDate('2026-11-04')).toBe(true)
    expect(rules.pubDate('2026/11/04')).not.toBe(true)
    expect(rules.yyyymm('202611')).toBe(true)
    expect(rules.yyyymm('20261')).not.toBe(true)
  })

  it('seconds: 空は 0 秒として通さない (#124 の回帰)', () => {
    expect(rules.seconds('')).not.toBe(true)
    expect(rules.seconds('   ')).not.toBe(true)
    expect(rules.seconds('0')).toBe(true)
    expect(rules.seconds('21600')).toBe(true)
    expect(rules.seconds('21601')).not.toBe(true)
    expect(rules.seconds('1.5')).not.toBe(true)
  })

  it('hms', () => {
    expect(rules.hms('01:02:03')).toBe(true)
    expect(rules.hms('02:03')).toBe(true)
    expect(rules.hms('1:60')).not.toBe(true)
    expect(rules.hms('')).not.toBe(true)
  })

  it('reviewText: runbook にある登録ミスを弾く', () => {
    expect(rules.reviewText('酸味が少なくまろやか')).toBe(true)
    expect(rules.reviewText('')).toBe('必須項目です (意味検索の入力になります)')
    // reviewText と note の入れ替え (URL だけが入る)
    expect(rules.reviewText('https://example.com/shop')).toBe('URLのみは不可。note と入れ替わっていませんか?')
    // 本文への URL の混入
    expect(rules.reviewText('おいしい https://example.com')).toBe('本文中にURLが混入しています')
  })

  it('inList', () => {
    const rule = rules.inList(['works', 'topics'])
    expect(rule('works')).toBe(true)
    expect(rule(' topics ')).toBe(true)
    expect(rule('other')).toBe('works / topics のいずれかを選択してください')
  })
})

describe('normalizeName', () => {
  it('全角空白を半角にし、連続する空白を1つにまとめ、前後を削る', () => {
    expect(normalizeName('\u3000ブラジル\u3000\u3000サントス  No.2 \u3000')).toBe('ブラジル サントス No.2')
  })

  it('整っている名前は変えない', () => {
    expect(normalizeName('ETHIOPIA Yirgacheffe')).toBe('ETHIOPIA Yirgacheffe')
  })
})
