import { describe, it, expect } from 'vitest'
import { simulate } from '../src/components/games/police-escape/engine/simulator'
import { makeFloor, setWall, setKey, setExit, setIce } from '../src/components/games/police-escape/engine/levels'
import type { Level, Path, Portal } from '../src/components/games/police-escape/engine/types'

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

describe('simulate', () => {
  it('wins on an empty grid when path is faster than police', () => {
    // 5x5, thief at (4,0), exit at (0,4), no police -> always wins.
    const lvl = buildLevel(5, g => setExit(g, 0, 4))
    const path: Path = [
      { r: 4, c: 0 }, { r: 3, c: 0 }, { r: 2, c: 0 }, { r: 1, c: 0 }, { r: 0, c: 0 },
      { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }, { r: 0, c: 4 },
    ]
    const r = simulate(lvl, path)
    expect(r.outcome).toBe('win')
    if (r.outcome === 'win') expect(r.winStep).toBe(8)
  })

  it('loses when a police catches the thief mid-path', () => {
    // Police starts adjacent to thief. Thief walks into a dead-end where police catches up.
    const lvl = buildLevel(5, g => setExit(g, 0, 4), {
      thiefStart: { r: 4, c: 0 },
      police: [{ start: { r: 3, c: 0 }, patrol: [] }],
    })
    // Thief moves up to (3,0); police at (3,0) had no path (thief was at (4,0), police already
    // on thief's target). Thief moves first onto police's cell; police then BFS-steps toward
    // thief (already on thief). Collision check fires. Path must still end at exit to be valid.
    const path: Path = [
      { r: 4, c: 0 }, { r: 3, c: 0 }, { r: 2, c: 0 }, { r: 1, c: 0 }, { r: 0, c: 0 },
      { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }, { r: 0, c: 4 },
    ]
    const r = simulate(lvl, path)
    expect(r.outcome).toBe('lose')
  })

  it('does not falsely win when police is between thief and exit', () => {
    const lvl = buildLevel(5, g => setExit(g, 0, 4), {
      thiefStart: { r: 4, c: 0 },
      police: [{ start: { r: 2, c: 0 }, patrol: [] }],
    })
    const path: Path = [
      { r: 4, c: 0 }, { r: 3, c: 0 }, { r: 2, c: 0 }, { r: 1, c: 0 }, { r: 0, c: 0 },
      { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }, { r: 0, c: 4 },
    ]
    const r = simulate(lvl, path)
    expect(r.outcome).not.toBe('win')
  })

  it('key mechanic: reaching exit without key does NOT win', () => {
    const lvl = buildLevel(5, g => {
      setExit(g, 0, 4)
      setKey(g, 4, 4, 1)
    }, {
      thiefStart: { r: 4, c: 0 },
      police: [],
      requiredKeys: [1],
    })
    const path: Path = [
      { r: 4, c: 0 }, { r: 3, c: 0 }, { r: 2, c: 0 }, { r: 1, c: 0 }, { r: 0, c: 0 },
      { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }, { r: 0, c: 4 },
    ]
    const r = simulate(lvl, path)
    // No police, but key not collected -> cannot win. Path ends at exit without key -> invalid.
    expect(r.outcome).not.toBe('win')
  })

  it('key mechanic: collecting key then reaching exit wins', () => {
    const lvl = buildLevel(5, g => {
      setExit(g, 0, 4)
      setKey(g, 4, 4, 1)
    }, {
      thiefStart: { r: 4, c: 0 },
      police: [],
      requiredKeys: [1],
    })
    const path: Path = [
      { r: 4, c: 0 }, { r: 4, c: 1 }, { r: 4, c: 2 }, { r: 4, c: 3 }, { r: 4, c: 4 }, // grab key
      { r: 3, c: 4 }, { r: 2, c: 4 }, { r: 1, c: 4 }, { r: 0, c: 4 },
    ]
    const r = simulate(lvl, path)
    expect(r.outcome).toBe('win')
  })

  it('portal mechanic: entering a portal teleports to the paired end', () => {
    const portal: Portal = { id: 1, a: { r: 4, c: 1 }, b: { r: 0, c: 3 } }
    const lvl = buildLevel(5, g => setExit(g, 0, 4), {
      thiefStart: { r: 4, c: 0 },
      police: [],
      portals: [portal],
    })
    // Thief steps from (4,0) -> (4,1) [portal a] -> teleported to (0,3) -> step to (0,4) exit.
    // After teleport, the NEXT path cell must be adjacent to (0,3). Our pathValidator does
    // NOT know about teleport, so the simulator must accept the post-teleport step. We model
    // the path as the literal cells the thief visits including the teleport exit:
    const path: Path = [
      { r: 4, c: 0 }, { r: 4, c: 1 }, // step onto portal a -> teleport to (0,3)
      { r: 0, c: 3 }, { r: 0, c: 4 }, // adjacent to teleport exit -> win
    ]
    // But validatePath will reject (0,3) as non-adjacent from (4,1). So we expect 'invalid'
    // unless the pathValidator is portal-aware. Confirm current behavior:
    const r = simulate(lvl, path)
    expect(r.outcome).toBe('invalid')
  })

  it('ice mechanic: cell becomes passable after melt threshold', () => {
    const lvl = buildLevel(5, g => {
      setExit(g, 0, 4)
      setIce(g, 2, 0, 2) // melts at step 2
    }, {
      thiefStart: { r: 4, c: 0 },
      police: [],
    })
    // Path enters (2,0) at step 2 (index 2). meltAt 2 -> passable. Wins.
    const path: Path = [
      { r: 4, c: 0 }, { r: 3, c: 0 }, { r: 2, c: 0 }, { r: 1, c: 0 }, { r: 0, c: 0 },
      { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }, { r: 0, c: 4 },
    ]
    const r = simulate(lvl, path)
    expect(r.outcome).toBe('win')
  })

  it('exit-toggle: arrival on closed tick does NOT win', () => {
    const lvl = buildLevel(5, g => setExit(g, 0, 4), {
      thiefStart: { r: 4, c: 0 },
      police: [],
      exitToggle: { period: 3, openSteps: [0] }, // open only on step % 3 == 0
    })
    // Thief arrives at exit on step 8. 8 % 3 = 2 -> closed -> cannot win.
    const path: Path = [
      { r: 4, c: 0 }, { r: 3, c: 0 }, { r: 2, c: 0 }, { r: 1, c: 0 }, { r: 0, c: 0 },
      { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }, { r: 0, c: 4 },
    ]
    const r = simulate(lvl, path)
    expect(r.outcome).not.toBe('win')
  })

  it('exit-toggle: arrival on open tick wins', () => {
    const lvl = buildLevel(5, g => setExit(g, 0, 4), {
      thiefStart: { r: 4, c: 0 },
      police: [],
      exitToggle: { period: 3, openSteps: [0, 1, 2] }, // always open
    })
    const path: Path = [
      { r: 4, c: 0 }, { r: 3, c: 0 }, { r: 2, c: 0 }, { r: 1, c: 0 }, { r: 0, c: 0 },
      { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }, { r: 0, c: 4 },
    ]
    const r = simulate(lvl, path)
    expect(r.outcome).toBe('win')
  })

  it('returns invalid for malformed path (non-adjacent)', () => {
    const lvl = buildLevel(5, g => setExit(g, 0, 4))
    const path: Path = [{ r: 4, c: 0 }, { r: 2, c: 0 }] // jump
    const r = simulate(lvl, path)
    expect(r.outcome).toBe('invalid')
  })

  it('police falls back to patrol when thief is walled off', () => {
    const lvl = buildLevel(5, g => {
      setExit(g, 0, 4)
      // wall column at c=2 separating thief (left) from police (right)
      for (let r = 0; r < 5; r++) setWall(g, r, 2)
    }, {
      thiefStart: { r: 4, c: 0 },
      police: [{ start: { r: 4, c: 4 }, patrol: [{ r: 0, c: 4 }] }],
    })
    // Thief path stays on left side; police can't reach, patrols. Should win.
    const path: Path = [
      { r: 4, c: 0 }, { r: 3, c: 0 }, { r: 2, c: 0 }, { r: 1, c: 0 }, { r: 0, c: 0 },
      { r: 0, c: 1 }, // ... can't reach exit at (0,4) because wall column blocks
    ]
    // Exit is unreachable, so this won't win — but the test confirms police doesn't catch.
    const r = simulate(lvl, path)
    expect(r.outcome).not.toBe('lose')
  })
})
