import { describe, expect, it } from 'vitest'
import { hmsToSec, secToHms } from '../../shared/utils/time'

describe('secToHms', () => {
  it('秒を HH:mm:ss にする', () => {
    expect(secToHms(0)).toBe('00:00:00')
    expect(secToHms(59)).toBe('00:00:59')
    expect(secToHms(3661)).toBe('01:01:01')
  })

  it('小数は切り捨て、負の数や数でない値は 0 秒にする', () => {
    expect(secToHms(1.9)).toBe('00:00:01')
    expect(secToHms(-5)).toBe('00:00:00')
    expect(secToHms(Number.NaN)).toBe('00:00:00')
  })
})

describe('hmsToSec', () => {
  it('HH:mm:ss と mm:ss の両方を読む', () => {
    expect(hmsToSec('01:01:01')).toBe(3661)
    expect(hmsToSec('02:03')).toBe(123)
    expect(hmsToSec(' 01:00 ')).toBe(60)
  })

  it('分と秒は 59 まで', () => {
    expect(hmsToSec('00:59:59')).toBe(3599)
    expect(hmsToSec('1:60')).toBeNull()
    expect(hmsToSec('1:00:60')).toBeNull()
    expect(hmsToSec('1:60:00')).toBeNull()
  })

  it('形が違うものは null', () => {
    expect(hmsToSec('')).toBeNull()
    expect(hmsToSec('1')).toBeNull()
    expect(hmsToSec('1:2:3:4')).toBeNull()
    expect(hmsToSec('a:b')).toBeNull()
    expect(hmsToSec('-1:00')).toBeNull()
    expect(hmsToSec('1.5:00')).toBeNull()
  })
})
