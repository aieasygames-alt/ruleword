// BFS shortest-path on the level grid.
// Pure: takes a level + start + goal, returns a path (list of coords including both ends)
// or null if unreachable. Used by policeAI and by the level solvability validator.

import type { Coord, Level } from './types'

// A predicate that decides whether a cell at (r,c) is passable for THIS pathfinder call.
// Different callers have different blocking rules:
//   - police AI treats walls and unmelted ice as blocked
//   - the solvability solver may treat additional cells as blocked
export type BlockedPredicate = (r: number, c: number) => boolean

export function bfsPath(
  level: Level,
  from: Coord,
  to: Coord,
  isBlocked: BlockedPredicate,
): Coord[] | null {
  const { size } = level
  if (from.r === to.r && from.c === to.c) return [from]
  if (!inBounds(from, size) || !inBounds(to, size)) return null
  if (isBlocked(to.r, to.c)) return null

  const visited: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false))
  const prev: (Coord | null)[][] = Array.from({ length: size }, () => Array(size).fill(null))
  const queue: Coord[] = [from]
  visited[from.r][from.c] = true

  const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]]

  while (queue.length > 0) {
    const cur = queue.shift()!
    if (cur.r === to.r && cur.c === to.c) return reconstruct(prev, from, to)
    for (const [dr, dc] of DIRS) {
      const nr = cur.r + dr
      const nc = cur.c + dc
      if (!inBounds({ r: nr, c: nc }, size)) continue
      if (visited[nr][nc]) continue
      if (isBlocked(nr, nc)) continue
      visited[nr][nc] = true
      prev[nr][nc] = cur
      queue.push({ r: nr, c: nc })
    }
  }
  return null
}

function inBounds(p: Coord, size: number): boolean {
  return p.r >= 0 && p.r < size && p.c >= 0 && p.c < size
}

function reconstruct(prev: (Coord | null)[][], from: Coord, to: Coord): Coord[] {
  const path: Coord[] = []
  let cur: Coord | null = to
  while (cur && !(cur.r === from.r && cur.c === from.c)) {
    path.unshift(cur)
    cur = prev[cur.r][cur.c]
  }
  path.unshift(from)
  return path
}

// Default blocker for police: walls always block; ice blocks until melted (caller supplies step).
export function policeBlocker(level: Level, currentStep: number): BlockedPredicate {
  return (r, c) => {
    const cell = level.grid[r][c]
    if (cell.kind === 'wall') return true
    if (cell.kind === 'ice' && cell.meltAt !== undefined && currentStep < cell.meltAt) return true
    return false
  }
}
