import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { mdiIcons } from '../../app/utils/icons'

const appDir = join(import.meta.dirname, '../../app')

const usedIcons = () => {
  const names = new Set<string>()
  for (const file of readdirSync(appDir, { recursive: true, encoding: 'utf8' })) {
    if (!file.endsWith('.vue')) continue
    for (const [name] of readFileSync(join(appDir, file), 'utf8').matchAll(/mdi-[a-z0-9]+(?:-[a-z0-9]+)*/g)) {
      names.add(name)
    }
  }
  return names
}

describe('mdiIcons', () => {
  it('画面で使うアイコンがすべて app/utils/icons.ts にある', () => {
    const used = usedIcons()
    expect(used.size).toBeGreaterThan(0)
    expect([...used].filter((name) => !mdiIcons[name])).toEqual([])
  })

  it('どの名前にも SVG のパスがある', () => {
    for (const path of Object.values(mdiIcons)) expect(path).toMatch(/^M/)
  })
})
