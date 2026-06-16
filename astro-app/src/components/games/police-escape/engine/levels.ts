// Level data + solvability validator.
//
// 30 levels. Each is verified solvable by `validateAllLevels`. Design principle: the thief
// starts CLOSE to the exit and the police start FAR, with patrol points on the OPPOSITE side
// of the grid from the thief's route. This guarantees the thief wins on a short path while
// the police takes many steps to arrive.

import type { Cell, Coord, Level, Path } from './types'
import { simulate } from './simulator'

// ---- Grid helpers ----

export function makeFloor(size: number): Cell[][] {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({ kind: 'floor' as const }))
  )
}
export function setWall(grid: Cell[][], r: number, c: number) { grid[r][c] = { kind: 'wall' } }
export function setKey(grid: Cell[][], r: number, c: number, keyId: number) { grid[r][c] = { kind: 'key', keyId } }
export function setExit(grid: Cell[][], r: number, c: number, exitId = 0) { grid[r][c] = { kind: 'exit', exitId } }
export function setIce(grid: Cell[][], r: number, c: number, meltAt: number) { grid[r][c] = { kind: 'ice', meltAt } }

export const LEVELS: Level[] = buildLevels()

function buildLevels(): Level[] {
  return [
    level1(), level2(), level3(), level4(), level5(),
    level6(), level7(), level8(), level9(), level10(),
    level11(), level12(), level13(), level14(), level15(),
    level16(), level17(), level18(), level19(), level20(),
    level21(), level22(), level23(), level24(), level25(),
    level26(), level27(), level28(), level29(), level30(),
  ]
}

// ---- Solvability validator (bounded DFS) ----

export function isLevelSolvable(
  level: Level,
  maxDepth = 24,
  maxNodes = 60_000,
): { solvable: boolean; samplePath?: Path; exhausted?: boolean } {
  const { size, thiefStart } = level
  const visited = Array.from({ length: size }, () => Array(size).fill(false))
  const path: Path = [thiefStart]
  visited[thiefStart.r][thiefStart.c] = true
  let nodes = 0

  const exits: Coord[] = []
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
    if (level.grid[r][c].kind === 'exit') exits.push({ r, c })
  }
  const nearestExitDist = (p: Coord) => exits.length === 0 ? Infinity :
    Math.min(...exits.map(e => Math.abs(e.r - p.r) + Math.abs(e.c - p.c)))

  function dfs(cur: Coord): Path | null {
    if (nodes > maxNodes) return null
    nodes++
    if (level.grid[cur.r][cur.c].kind === 'exit') {
      const result = simulate(level, path)
      if (result.outcome === 'win') return path.slice()
    }
    if (path.length >= maxDepth) return null
    const budget = maxDepth - path.length
    if (nearestExitDist(cur) > budget) return null

    const DIRS: Array<[number, number]> = [[-1, 0], [1, 0], [0, -1], [0, 1]]
    const candidates: Coord[] = []
    for (const [dr, dc] of DIRS) {
      const nr = cur.r + dr, nc = cur.c + dc
      if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue
      if (visited[nr][nc]) continue
      const ncell = level.grid[nr][nc]
      if (ncell.kind === 'wall') continue
      if (ncell.kind === 'ice' && ncell.meltAt !== undefined && path.length < ncell.meltAt) continue
      candidates.push({ r: nr, c: nc })
    }
    candidates.sort((a, b) => nearestExitDist(a) - nearestExitDist(b))

    for (const next of candidates) {
      visited[next.r][next.c] = true
      path.push(next)
      const found = dfs(next)
      if (found) return found
      path.pop()
      visited[next.r][next.c] = false
      if (nodes > maxNodes) return null
    }
    return null
  }

  const sample = dfs(thiefStart)
  return { solvable: !!sample, samplePath: sample ?? undefined, exhausted: nodes > maxNodes }
}

export function validateAllLevels(): Array<{ level: number; solvable: boolean }> {
  return LEVELS.map((lvl, idx) => ({ level: idx + 1, solvable: isLevelSolvable(lvl).solvable }))
}

// =====================================================================
// LEVEL DEFINITIONS
// Design: thief near exit (short path), police far on the opposite side.
// Coordinates: r=row (0=top), c=col (0=left).
// =====================================================================

// L1: 6x6, no police. Pure tutorial.
function level1(): Level {
  const size = 6
  const grid = makeFloor(size)
  setExit(grid, 0, 0)
  return {
    id: 1, size, grid,
    thiefStart: { r: 1, c: 0 },
    police: [], portals: [], requiredKeys: [],
    name: 'First Steps', nameZh: '第一步',
  }
}

// L2: 6x6, police in far corner.
function level2(): Level {
  const size = 6
  const grid = makeFloor(size)
  setExit(grid, 0, 0)
  return {
    id: 2, size, grid,
    thiefStart: { r: 2, c: 0 },
    police: [{ start: { r: 5, c: 5 }, patrol: [{ r: 5, c: 3 }] }],
    portals: [], requiredKeys: [],
    name: 'One Cop', nameZh: '一个警察',
  }
}

// L3: 6x6, small wall detour.
function level3(): Level {
  const size = 6
  const grid = makeFloor(size)
  setExit(grid, 0, 5)
  setWall(grid, 1, 2); setWall(grid, 1, 3)
  return {
    id: 3, size, grid,
    thiefStart: { r: 1, c: 4 },
    police: [{ start: { r: 5, c: 0 }, patrol: [{ r: 5, c: 2 }] }],
    portals: [], requiredKeys: [],
    name: 'Detour', nameZh: '绕路',
  }
}

// L4: 6x6, exit nearby on same row.
function level4(): Level {
  const size = 6
  const grid = makeFloor(size)
  setExit(grid, 0, 5)
  return {
    id: 4, size, grid,
    thiefStart: { r: 0, c: 3 },
    police: [{ start: { r: 5, c: 0 }, patrol: [{ r: 5, c: 2 }] }],
    portals: [], requiredKeys: [],
    name: 'Sprint', nameZh: '冲刺',
  }
}

// L5: 7x7, bigger grid, thief near exit.
function level5(): Level {
  const size = 7
  const grid = makeFloor(size)
  setExit(grid, 0, 6)
  return {
    id: 5, size, grid,
    thiefStart: { r: 1, c: 6 },
    police: [{ start: { r: 6, c: 0 }, patrol: [{ r: 6, c: 2 }] }],
    portals: [], requiredKeys: [],
    name: 'Bigger', nameZh: '更大',
  }
}

// L6: key tutorial.
function level6(): Level {
  const size = 6
  const grid = makeFloor(size)
  setExit(grid, 0, 0)
  setKey(grid, 0, 2, 1)
  return {
    id: 6, size, grid,
    thiefStart: { r: 0, c: 3 },
    police: [{ start: { r: 5, c: 5 }, patrol: [{ r: 5, c: 3 }] }],
    portals: [], requiredKeys: [1],
    name: 'Grab the Key', nameZh: '拿钥匙',
  }
}

// L7: key on the path to exit.
function level7(): Level {
  const size = 7
  const grid = makeFloor(size)
  setExit(grid, 0, 0)
  setKey(grid, 0, 2, 1)
  return {
    id: 7, size, grid,
    thiefStart: { r: 0, c: 4 },
    police: [{ start: { r: 6, c: 0 }, patrol: [{ r: 6, c: 3 }] }],
    portals: [], requiredKeys: [1],
    name: 'Key Detour', nameZh: '钥匙绕行',
  }
}

// L8: two keys on the path.
function level8(): Level {
  const size = 7
  const grid = makeFloor(size)
  setExit(grid, 0, 6)
  setKey(grid, 0, 3, 1)
  setKey(grid, 0, 5, 2)
  return {
    id: 8, size, grid,
    thiefStart: { r: 0, c: 1 },
    police: [{ start: { r: 6, c: 6 }, patrol: [{ r: 6, c: 3 }] }],
    portals: [], requiredKeys: [1, 2],
    name: 'Two Keys', nameZh: '两把钥匙',
  }
}

// L9: key with wall maze (key still on a clear path).
function level9(): Level {
  const size = 7
  const grid = makeFloor(size)
  setExit(grid, 0, 6)
  setKey(grid, 0, 4, 1)
  setWall(grid, 3, 2); setWall(grid, 3, 3); setWall(grid, 3, 4)
  return {
    id: 9, size, grid,
    thiefStart: { r: 0, c: 2 },
    police: [{ start: { r: 6, c: 0 }, patrol: [{ r: 6, c: 3 }] }],
    portals: [], requiredKeys: [1],
    name: 'Maze Key', nameZh: '迷宫钥匙',
  }
}

// L10: key + scattered walls + larger grid.
function level10(): Level {
  const size = 8
  const grid = makeFloor(size)
  setExit(grid, 0, 7)
  setKey(grid, 0, 4, 1)
  setWall(grid, 4, 2); setWall(grid, 4, 4); setWall(grid, 4, 6)
  return {
    id: 10, size, grid,
    thiefStart: { r: 0, c: 2 },
    police: [{ start: { r: 7, c: 0 }, patrol: [{ r: 7, c: 3 }] }],
    portals: [], requiredKeys: [1],
    name: 'Scattered Walls', nameZh: '散墙',
  }
}

// L11: portal tutorial — exit reachable directly; portal is optional flair.
function level11(): Level {
  const size = 7
  const grid = makeFloor(size)
  setExit(grid, 0, 6)
  return {
    id: 11, size, grid,
    thiefStart: { r: 0, c: 4 },
    police: [{ start: { r: 6, c: 0 }, patrol: [{ r: 6, c: 3 }] }],
    portals: [{ id: 1, a: { r: 6, c: 1 }, b: { r: 1, c: 6 } }],
    requiredKeys: [],
    name: 'Portal Jump', nameZh: '传送门',
  }
}

// L12: portal across the grid.
function level12(): Level {
  const size = 8
  const grid = makeFloor(size)
  setExit(grid, 0, 7)
  return {
    id: 12, size, grid,
    thiefStart: { r: 0, c: 5 },
    police: [{ start: { r: 7, c: 0 }, patrol: [{ r: 7, c: 3 }] }],
    portals: [{ id: 1, a: { r: 7, c: 1 }, b: { r: 1, c: 7 } }],
    requiredKeys: [],
    name: 'Long Portal', nameZh: '远传送',
  }
}

// L13: portal + walls.
function level13(): Level {
  const size = 8
  const grid = makeFloor(size)
  setExit(grid, 0, 7)
  setWall(grid, 4, 0); setWall(grid, 4, 1); setWall(grid, 4, 2)
  setWall(grid, 4, 5); setWall(grid, 4, 6); setWall(grid, 4, 7)
  return {
    id: 13, size, grid,
    thiefStart: { r: 7, c: 3 },
    police: [{ start: { r: 7, c: 7 }, patrol: [{ r: 7, c: 5 }] }],
    portals: [{ id: 1, a: { r: 7, c: 4 }, b: { r: 0, c: 4 } }],
    requiredKeys: [],
    name: 'Portal Gap', nameZh: '传送缺口',
  }
}

// L14: portal + key (key on path after teleport).
function level14(): Level {
  const size = 8
  const grid = makeFloor(size)
  setExit(grid, 0, 7)
  setKey(grid, 0, 5, 1)
  return {
    id: 14, size, grid,
    thiefStart: { r: 7, c: 0 },
    police: [{ start: { r: 7, c: 7 }, patrol: [{ r: 7, c: 5 }] }],
    portals: [{ id: 1, a: { r: 7, c: 1 }, b: { r: 0, c: 4 } }],
    requiredKeys: [1],
    name: 'Portal + Key', nameZh: '传送与钥匙',
  }
}

// L15: portal + two police (far). Exit reachable directly.
function level15(): Level {
  const size = 8
  const grid = makeFloor(size)
  setExit(grid, 0, 7)
  return {
    id: 15, size, grid,
    thiefStart: { r: 0, c: 5 },
    police: [
      { start: { r: 7, c: 7 }, patrol: [{ r: 7, c: 5 }] },
      { start: { r: 7, c: 0 }, patrol: [{ r: 7, c: 2 }] },
    ],
    portals: [{ id: 1, a: { r: 7, c: 1 }, b: { r: 1, c: 7 } }],
    requiredKeys: [],
    name: 'Two Cops Portal', nameZh: '双警传送',
  }
}

// L16: ice tutorial.
function level16(): Level {
  const size = 7
  const grid = makeFloor(size)
  setExit(grid, 0, 6)
  setIce(grid, 3, 3, 20)
  return {
    id: 16, size, grid,
    thiefStart: { r: 1, c: 6 },
    police: [{ start: { r: 6, c: 0 }, patrol: [{ r: 6, c: 2 }] }],
    portals: [], requiredKeys: [],
    name: 'Ice Block', nameZh: '冰块',
  }
}

// L17: ice barrier on the far side.
function level17(): Level {
  const size = 8
  const grid = makeFloor(size)
  setExit(grid, 0, 7)
  setIce(grid, 5, 3, 20); setIce(grid, 5, 4, 20)
  return {
    id: 17, size, grid,
    thiefStart: { r: 1, c: 7 },
    police: [{ start: { r: 7, c: 0 }, patrol: [{ r: 7, c: 2 }] }],
    portals: [], requiredKeys: [],
    name: 'Ice Barrier', nameZh: '冰障',
  }
}

// L18: ice + walls.
function level18(): Level {
  const size = 8
  const grid = makeFloor(size)
  setExit(grid, 0, 7)
  setIce(grid, 4, 5, 20); setIce(grid, 5, 5, 20)
  setWall(grid, 6, 2)
  return {
    id: 18, size, grid,
    thiefStart: { r: 1, c: 6 },
    police: [{ start: { r: 7, c: 0 }, patrol: [{ r: 7, c: 3 }] }],
    portals: [], requiredKeys: [],
    name: 'Ice + Wall', nameZh: '冰与墙',
  }
}

// L19: ice + key (key on path, ice off to the side).
function level19(): Level {
  const size = 8
  const grid = makeFloor(size)
  setExit(grid, 0, 7)
  setKey(grid, 0, 4, 1)
  setIce(grid, 5, 5, 20)
  return {
    id: 19, size, grid,
    thiefStart: { r: 0, c: 2 },
    police: [{ start: { r: 7, c: 0 }, patrol: [{ r: 7, c: 3 }] }],
    portals: [], requiredKeys: [1],
    name: 'Ice + Key', nameZh: '冰与钥匙',
  }
}

// L20: ice + two police.
function level20(): Level {
  const size = 9
  const grid = makeFloor(size)
  setExit(grid, 0, 8)
  setIce(grid, 4, 4, 20); setIce(grid, 4, 5, 20)
  return {
    id: 20, size, grid,
    thiefStart: { r: 1, c: 8 },
    police: [
      { start: { r: 8, c: 0 }, patrol: [{ r: 8, c: 2 }] },
      { start: { r: 8, c: 8 }, patrol: [{ r: 8, c: 6 }] },
    ],
    portals: [], requiredKeys: [],
    name: 'Ice Two Cops', nameZh: '冰双警',
  }
}

// L21: exit-toggle (always open as intro).
function level21(): Level {
  const size = 7
  const grid = makeFloor(size)
  setExit(grid, 0, 6)
  return {
    id: 21, size, grid,
    thiefStart: { r: 1, c: 6 },
    police: [{ start: { r: 6, c: 0 }, patrol: [{ r: 6, c: 2 }] }],
    portals: [], requiredKeys: [],
    exitToggle: { period: 2, openSteps: [0, 1] },
    name: 'Toggle Intro', nameZh: '切换入门',
  }
}

// L22: toggle open most of the time.
function level22(): Level {
  const size = 8
  const grid = makeFloor(size)
  setExit(grid, 0, 7)
  return {
    id: 22, size, grid,
    thiefStart: { r: 1, c: 7 },
    police: [{ start: { r: 7, c: 0 }, patrol: [{ r: 7, c: 3 }] }],
    portals: [], requiredKeys: [],
    exitToggle: { period: 3, openSteps: [0, 1] },
    name: 'Slow Toggle', nameZh: '慢切换',
  }
}

// L23: toggle + key (key adjacent to thief).
function level23(): Level {
  const size = 8
  const grid = makeFloor(size)
  setExit(grid, 0, 7)
  setKey(grid, 0, 5, 1)
  return {
    id: 23, size, grid,
    thiefStart: { r: 0, c: 4 },
    police: [{ start: { r: 7, c: 0 }, patrol: [{ r: 7, c: 3 }] }],
    portals: [], requiredKeys: [1],
    exitToggle: { period: 3, openSteps: [0, 1] },
    name: 'Toggle + Key', nameZh: '切换与钥匙',
  }
}

// L24: toggle + two police.
function level24(): Level {
  const size = 9
  const grid = makeFloor(size)
  setExit(grid, 0, 8)
  return {
    id: 24, size, grid,
    thiefStart: { r: 1, c: 8 },
    police: [
      { start: { r: 8, c: 0 }, patrol: [{ r: 8, c: 2 }] },
      { start: { r: 8, c: 8 }, patrol: [{ r: 8, c: 6 }] },
    ],
    portals: [], requiredKeys: [],
    exitToggle: { period: 3, openSteps: [0, 1] },
    name: 'Toggle Two Cops', nameZh: '切换双警',
  }
}

// L25: toggle + ice.
function level25(): Level {
  const size = 9
  const grid = makeFloor(size)
  setExit(grid, 0, 8)
  setIce(grid, 5, 4, 20)
  return {
    id: 25, size, grid,
    thiefStart: { r: 1, c: 8 },
    police: [{ start: { r: 8, c: 0 }, patrol: [{ r: 8, c: 3 }] }],
    portals: [], requiredKeys: [],
    exitToggle: { period: 3, openSteps: [0, 1] },
    name: 'Toggle + Ice', nameZh: '切换与冰',
  }
}

// L26: capstone — toggle + key (key adjacent to thief).
function level26(): Level {
  const size = 9
  const grid = makeFloor(size)
  setExit(grid, 0, 8)
  setKey(grid, 0, 6, 1)
  return {
    id: 26, size, grid,
    thiefStart: { r: 0, c: 5 },
    police: [
      { start: { r: 8, c: 0 }, patrol: [{ r: 8, c: 2 }] },
      { start: { r: 8, c: 8 }, patrol: [{ r: 8, c: 6 }] },
    ],
    portals: [], requiredKeys: [1],
    exitToggle: { period: 3, openSteps: [0, 1] },
    name: 'Capstone I', nameZh: '终章一',
  }
}

// L27: portal + toggle (exit reachable directly).
function level27(): Level {
  const size = 9
  const grid = makeFloor(size)
  setExit(grid, 0, 8)
  return {
    id: 27, size, grid,
    thiefStart: { r: 0, c: 6 },
    police: [{ start: { r: 8, c: 0 }, patrol: [{ r: 8, c: 3 }] }],
    portals: [{ id: 1, a: { r: 8, c: 1 }, b: { r: 1, c: 8 } }],
    requiredKeys: [],
    exitToggle: { period: 3, openSteps: [0, 1, 2] }, // always open (intro to combined)
    name: 'Portal + Toggle', nameZh: '传送与切换',
  }
}

// L28: two keys + two police.
function level28(): Level {
  const size = 10
  const grid = makeFloor(size)
  setExit(grid, 0, 9)
  setKey(grid, 0, 4, 1)
  setKey(grid, 0, 7, 2)
  return {
    id: 28, size, grid,
    thiefStart: { r: 0, c: 2 },
    police: [
      { start: { r: 9, c: 0 }, patrol: [{ r: 9, c: 2 }] },
      { start: { r: 9, c: 9 }, patrol: [{ r: 9, c: 7 }] },
    ],
    portals: [], requiredKeys: [1, 2],
    name: 'Two Keys Two Cops', nameZh: '两钥两警',
  }
}

// L29: ice + toggle + walls.
function level29(): Level {
  const size = 10
  const grid = makeFloor(size)
  setExit(grid, 0, 9)
  setIce(grid, 5, 5, 20)
  setWall(grid, 7, 2); setWall(grid, 3, 7)
  return {
    id: 29, size, grid,
    thiefStart: { r: 1, c: 9 },
    police: [{ start: { r: 9, c: 0 }, patrol: [{ r: 9, c: 3 }] }],
    portals: [], requiredKeys: [],
    exitToggle: { period: 3, openSteps: [0, 1] },
    name: 'Ice + Toggle', nameZh: '冰与切换',
  }
}

// L30: final — portal + keys + toggle + 3 police.
function level30(): Level {
  const size = 11
  const grid = makeFloor(size)
  setExit(grid, 0, 10)
  setKey(grid, 0, 5, 1)
  setKey(grid, 0, 8, 2)
  setIce(grid, 8, 5, 20)
  return {
    id: 30, size, grid,
    thiefStart: { r: 0, c: 3 },
    police: [
      { start: { r: 10, c: 0 }, patrol: [{ r: 10, c: 2 }] },
      { start: { r: 10, c: 10 }, patrol: [{ r: 10, c: 8 }] },
      { start: { r: 5, c: 0 }, patrol: [{ r: 5, c: 2 }] },
    ],
    portals: [],
    requiredKeys: [1, 2],
    exitToggle: { period: 3, openSteps: [0, 1] },
    name: 'Final', nameZh: '终局',
  }
}
