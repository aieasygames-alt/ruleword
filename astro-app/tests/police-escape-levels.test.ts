import { describe, it, expect } from 'vitest'
import { LEVELS, validateAllLevels, isLevelSolvable } from '../src/components/games/police-escape/engine/levels'

describe('Police Escape levels', () => {
  it('ships exactly 30 levels', () => {
    expect(LEVELS.length).toBe(30)
  })

  it('every level id is unique and 1-30', () => {
    const ids = LEVELS.map(l => l.id)
    expect(ids).toEqual(Array.from({ length: 30 }, (_, i) => i + 1))
  })

  it('every level is solvable under the simulator', () => {
    const results = validateAllLevels()
    const failed = results.filter(r => !r.solvable)
    if (failed.length > 0) {
      const list = failed.map(f => `L${f.level}`).join(', ')
      throw new Error(`Unsolvable levels: ${list}`)
    }
    expect(failed).toHaveLength(0)
  })

  it('each level reports a sample winning path when solvable', () => {
    for (const lvl of LEVELS) {
      const { solvable, samplePath } = isLevelSolvable(lvl)
      expect(solvable).toBe(true)
      expect(samplePath).toBeDefined()
      expect(samplePath!.length).toBeGreaterThan(0)
    }
  })

  it('mechanics are introduced on the right levels', () => {
    // Keys start at L6.
    expect(LEVELS[5].requiredKeys.length).toBeGreaterThan(0)
    // Portals start at L11.
    expect(LEVELS[10].portals.length).toBeGreaterThan(0)
    // Ice starts at L16.
    const l16hasIce = LEVELS[15].grid.some(row => row.some(c => c.kind === 'ice'))
    expect(l16hasIce).toBe(true)
    // Exit toggle starts at L21.
    expect(LEVELS[20].exitToggle).toBeDefined()
  })
})
