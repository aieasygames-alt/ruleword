import { describe, it, expect } from 'vitest'
import { validatePath } from '../src/components/games/police-escape/engine/pathValidator'
import { makeFloor, setWall, setKey, setExit, setIce } from '../src/components/games/police-escape/engine/levels'
import type { Level, Path } from '../src/components/games/police-escape/engine/types'

function buildLevel(size: number, mut: (g: Level['grid']) => void, opts: Partial<Level> = {}): Level {
  const grid = makeFloor(size)
  mut(grid)
  return {
    id: 0, size, grid,
    thiefStart: { r: size - 1, c: 0 },
    police: [], portals: [], requiredKeys: [],
    name: 'test', nameZh: '测试',
    ...opts,
  }
}

describe('validatePath', () => {
  it('accepts a valid start-to-exit path on open grid', () => {
    const lvl = buildLevel(4, g => setExit(g, 0, 3))
    const path: Path = [
      { r: 3, c: 0 }, { r: 2, c: 0 }, { r: 1, c: 0 }, { r: 0, c: 0 },
      { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 },
    ]
    expect(validatePath(lvl, path)).toEqual({ valid: true })
  })

  it('rejects empty path', () => {
    const lvl = buildLevel(4, g => setExit(g, 0, 3))
    expect(validatePath(lvl, [])).toEqual({ valid: false, reason: 'Path is empty' })
  })

  it('rejects path not starting at thief start', () => {
    const lvl = buildLevel(4, g => setExit(g, 0, 3))
    const path: Path = [{ r: 0, c: 0 }, { r: 0, c: 1 }]
    const r = validatePath(lvl, path)
    expect(r.valid).toBe(false)
    expect(r.reason).toMatch(/start at the thief/)
  })

  it('rejects non-adjacent step (teleport jump)', () => {
    const lvl = buildLevel(4, g => setExit(g, 0, 3))
    const path: Path = [
      { r: 3, c: 0 }, { r: 1, c: 0 }, // jump of 2
    ]
    const r = validatePath(lvl, path)
    expect(r.valid).toBe(false)
    expect(r.reason).toMatch(/Non-adjacent/)
  })

  it('rejects path crossing a wall', () => {
    const lvl = buildLevel(4, g => {
      setExit(g, 0, 3)
      setWall(g, 1, 0)
    })
    const path: Path = [{ r: 3, c: 0 }, { r: 2, c: 0 }, { r: 1, c: 0 }, { r: 0, c: 0 }]
    const r = validatePath(lvl, path)
    expect(r.valid).toBe(false)
    expect(r.reason).toMatch(/wall/)
  })

  it('rejects path crossing unmelted ice at the entry step', () => {
    const lvl = buildLevel(4, g => {
      setExit(g, 0, 3)
      setIce(g, 2, 0, 5) // melts at step 5; path enters at step 2
    })
    const path: Path = [{ r: 3, c: 0 }, { r: 2, c: 0 }] // enter ice at step 1 < 5
    const r = validatePath(lvl, path)
    expect(r.valid).toBe(false)
    expect(r.reason).toMatch(/unmelted ice/)
  })

  it('accepts ice cell entered at/after melt step', () => {
    const lvl = buildLevel(4, g => {
      setExit(g, 0, 3)
      setIce(g, 2, 0, 1) // melts at step 1; entering at step 1 is OK
    })
    // Path enters (2,0) at index 1 = step 1; meltAt 1 -> passable.
    const path: Path = [
      { r: 3, c: 0 }, { r: 2, c: 0 }, { r: 1, c: 0 }, { r: 0, c: 0 },
      { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 },
    ]
    const r = validatePath(lvl, path)
    expect(r.valid).toBe(true)
  })

  it('rejects path that repeats a cell', () => {
    const lvl = buildLevel(4, g => setExit(g, 0, 3))
    const path: Path = [
      { r: 3, c: 0 }, { r: 2, c: 0 }, { r: 3, c: 0 }, // back to start
    ]
    const r = validatePath(lvl, path)
    expect(r.valid).toBe(false)
    expect(r.reason).toMatch(/repeats/)
  })

  it('rejects path not ending at exit', () => {
    const lvl = buildLevel(4, g => setExit(g, 0, 3))
    const path: Path = [{ r: 3, c: 0 }, { r: 2, c: 0 }, { r: 1, c: 0 }]
    const r = validatePath(lvl, path)
    expect(r.valid).toBe(false)
    expect(r.reason).toMatch(/exit/)
  })

  it('rejects when required key is not collected', () => {
    const lvl = buildLevel(4, g => {
      setExit(g, 0, 3)
      setKey(g, 3, 3, 1)
    }, { requiredKeys: [1] })
    const path: Path = [
      { r: 3, c: 0 }, { r: 2, c: 0 }, { r: 1, c: 0 }, { r: 0, c: 0 },
      { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 },
    ]
    const r = validatePath(lvl, path)
    expect(r.valid).toBe(false)
    expect(r.reason).toMatch(/Missing key/)
  })

  it('accepts when all required keys are on the path', () => {
    const lvl = buildLevel(4, g => {
      setExit(g, 0, 3)
      setKey(g, 3, 3, 1)
    }, { requiredKeys: [1] })
    const path: Path = [
      { r: 3, c: 0 }, { r: 3, c: 1 }, { r: 3, c: 2 }, { r: 3, c: 3 }, // collect key 1
      { r: 2, c: 3 }, { r: 1, c: 3 }, { r: 0, c: 3 },
    ]
    expect(validatePath(lvl, path)).toEqual({ valid: true })
  })
})
