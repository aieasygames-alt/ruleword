import { describe, it, expect } from 'vitest'
import { bfsPath, policeBlocker } from '../src/components/games/police-escape/engine/pathfinding'
import { makeFloor, setWall, setIce } from '../src/components/games/police-escape/engine/levels'
import type { Level } from '../src/components/games/police-escape/engine/types'

function buildLevel(size: number, mut: (g: Level['grid']) => void): Level {
  const grid = makeFloor(size)
  mut(grid)
  return {
    id: 0, size, grid,
    thiefStart: { r: 0, c: 0 },
    police: [], portals: [], requiredKeys: [],
    name: 'test', nameZh: '测试',
  }
}

describe('bfsPath', () => {
  it('returns single-cell path when from === to', () => {
    const lvl = buildLevel(4, () => {})
    const path = bfsPath(lvl, { r: 1, c: 1 }, { r: 1, c: 1 }, () => false)
    expect(path).toEqual([{ r: 1, c: 1 }])
  })

  it('finds shortest path on open grid', () => {
    const lvl = buildLevel(5, () => {})
    const path = bfsPath(lvl, { r: 0, c: 0 }, { r: 4, c: 4 }, () => false)
    expect(path).not.toBeNull()
    expect(path!.length).toBe(9) // 8 steps + 1
    expect(path![0]).toEqual({ r: 0, c: 0 })
    expect(path![8]).toEqual({ r: 4, c: 4 })
  })

  it('returns null when target is walled off', () => {
    const lvl = buildLevel(5, g => {
      for (let r = 0; r < 5; r++) setWall(g, r, 2)
    })
    // Use a blocker that consults the grid (mirrors policeBlocker semantics).
    const blocker = (r: number, c: number) => lvl.grid[r][c].kind === 'wall'
    const path = bfsPath(lvl, { r: 0, c: 0 }, { r: 0, c: 4 }, blocker)
    expect(path).toBeNull()
  })

  it('routes around walls', () => {
    const lvl = buildLevel(5, g => {
      setWall(g, 0, 1); setWall(g, 1, 1); setWall(g, 2, 1)
    })
    const path = bfsPath(lvl, { r: 0, c: 0 }, { r: 0, c: 2 }, () => false)
    expect(path).not.toBeNull()
    expect(path![0]).toEqual({ r: 0, c: 0 })
    expect(path![path!.length - 1]).toEqual({ r: 0, c: 2 })
  })

  it('treats unmelted ice as blocked via policeBlocker', () => {
    const lvl = buildLevel(5, g => setIce(g, 2, 2, 5))
    // currentStep 1 < meltAt 5 -> blocked
    const blockerEarly = policeBlocker(lvl, 1)
    expect(blockerEarly(2, 2)).toBe(true)
    // currentStep 5 >= meltAt 5 -> passable
    const blockerLate = policeBlocker(lvl, 5)
    expect(blockerLate(2, 2)).toBe(false)
  })

  it('returns null when from is out of bounds', () => {
    const lvl = buildLevel(3, () => {})
    const path = bfsPath(lvl, { r: -1, c: 0 }, { r: 0, c: 0 }, () => false)
    expect(path).toBeNull()
  })
})
