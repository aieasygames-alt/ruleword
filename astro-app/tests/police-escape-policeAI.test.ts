import { describe, it, expect } from 'vitest'
import { nextPoliceStep } from '../src/components/games/police-escape/engine/policeAI'
import { makeFloor, setWall } from '../src/components/games/police-escape/engine/levels'
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

describe('nextPoliceStep', () => {
  it('steps one cell along shortest path toward thief', () => {
    const lvl = buildLevel(5, () => {})
    // Police at (0,4), thief at (0,0). Should move left to (0,3).
    const step = nextPoliceStep(lvl, { r: 0, c: 4 }, [], { r: 0, c: 0 }, 0)
    expect(step).toEqual({ r: 0, c: 3 })
  })

  it('moves diagonally-ish (one step at a time) on 2D grid', () => {
    const lvl = buildLevel(5, () => {})
    // Police at (4,4), thief at (0,0). Either up or left is valid.
    const step = nextPoliceStep(lvl, { r: 4, c: 4 }, [], { r: 0, c: 0 }, 0)
    const dist = Math.abs(step.r - 0) + Math.abs(step.c - 0)
    expect(dist).toBe(7) // one cell closer than (4,4) which is distance 8
  })

  it('stays put when already on thief', () => {
    const lvl = buildLevel(5, () => {})
    const step = nextPoliceStep(lvl, { r: 2, c: 2 }, [], { r: 2, c: 2 }, 0)
    expect(step).toEqual({ r: 2, c: 2 })
  })

  it('falls back to patrol point when thief is unreachable', () => {
    const lvl = buildLevel(5, g => {
      // wall column separating thief (left) from police (right)
      for (let r = 0; r < 5; r++) setWall(g, r, 2)
    })
    // Police at (2,3), thief walled off at (2,0). Patrol target (2,4): police already
    // closer to (2,4); should step toward it.
    const step = nextPoliceStep(
      lvl,
      { r: 2, c: 3 },
      [{ r: 2, c: 4 }],
      { r: 2, c: 0 },
      0,
    )
    expect(step).toEqual({ r: 2, c: 4 })
  })

  it('returns same cell when no path and no patrol', () => {
    const lvl = buildLevel(5, g => {
      for (let r = 0; r < 5; r++) setWall(g, r, 2)
    })
    const step = nextPoliceStep(lvl, { r: 2, c: 3 }, [], { r: 2, c: 0 }, 0)
    expect(step).toEqual({ r: 2, c: 3 })
  })

  it('multiple police compute independently (no shared state)', () => {
    const lvl = buildLevel(6, () => {})
    const s1 = nextPoliceStep(lvl, { r: 0, c: 5 }, [], { r: 5, c: 0 }, 0)
    const s2 = nextPoliceStep(lvl, { r: 5, c: 5 }, [], { r: 5, c: 0 }, 0)
    // Police 1 at (0,5): should move toward (5,0), reducing distance.
    expect(Math.abs(s1.r - 5) + Math.abs(s1.c - 0)).toBeLessThan(10)
    // Police 2 at (5,5): should step left toward (5,0).
    expect(s2).toEqual({ r: 5, c: 4 })
  })
})
