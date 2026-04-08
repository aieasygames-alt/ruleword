// Flow Free Level Generator & Solver
// Generates guaranteed-solvable levels using Hamiltonian paths and verifies with backtracking solver

import { describe, it, expect } from 'vitest'

const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6']

interface Position { x: number; y: number }
interface Dot { pos: Position; color: string }
interface Level { size: number; dots: Dot[] }

// --- Hamiltonian path generators ---

function hSerpentine(size: number): Position[] {
  const path: Position[] = []
  for (let y = 0; y < size; y++) {
    if (y % 2 === 0) for (let x = 0; x < size; x++) path.push({ x, y })
    else for (let x = size - 1; x >= 0; x--) path.push({ x, y })
  }
  return path
}

function vSerpentine(size: number): Position[] {
  const path: Position[] = []
  for (let x = 0; x < size; x++) {
    if (x % 2 === 0) for (let y = 0; y < size; y++) path.push({ x, y })
    else for (let y = size - 1; y >= 0; y--) path.push({ x, y })
  }
  return path
}

function spiral(size: number): Position[] {
  const path: Position[] = []
  let x = 0, y = 0, dx = 1, dy = 0
  const visited = new Set<string>()
  for (let i = 0; i < size * size; i++) {
    path.push({ x, y })
    visited.add(`${x},${y}`)
    const nx = x + dx, ny = y + dy
    if (nx < 0 || nx >= size || ny < 0 || ny >= size || visited.has(`${nx},${ny}`)) {
      if (dx === 1) { dx = 0; dy = 1 }
      else if (dy === 1) { dx = -1; dy = 0 }
      else if (dx === -1) { dx = 0; dy = -1 }
      else { dx = 1; dy = 0 }
    }
    x += dx; y += dy
  }
  return path
}

function hSerpentineRev(size: number): Position[] {
  const path: Position[] = []
  for (let y = size - 1; y >= 0; y--) {
    if ((size - 1 - y) % 2 === 0) for (let x = size - 1; x >= 0; x--) path.push({ x, y })
    else for (let x = 0; x < size; x++) path.push({ x, y })
  }
  return path
}

function vSerpentineRev(size: number): Position[] {
  const path: Position[] = []
  for (let x = size - 1; x >= 0; x--) {
    if ((size - 1 - x) % 2 === 0) for (let y = size - 1; y >= 0; y--) path.push({ x, y })
    else for (let y = 0; y < size; y++) path.push({ x, y })
  }
  return path
}

// Reverse the path order
function reversePath(path: Position[]): Position[] {
  return [...path].reverse()
}

const pathGenerators = [hSerpentine, vSerpentine, spiral, hSerpentineRev, vSerpentineRev]

// --- Level generation from Hamiltonian path ---

function generateLevel(size: number, numColors: number, pathGen: (s: number) => Position[], reversed = false): Level {
  let path = pathGen(size)
  if (reversed) path = reversePath(path)

  const totalCells = size * size
  const baseLen = Math.floor(totalCells / numColors)
  const remainder = totalCells % numColors

  const dots: Dot[] = []
  let pos = 0
  for (let i = 0; i < numColors; i++) {
    const len = baseLen + (i < remainder ? 1 : 0)
    const start = path[pos]
    const end = path[pos + len - 1]
    dots.push({ pos: { x: start.x, y: start.y }, color: COLORS[i] })
    dots.push({ pos: { x: end.x, y: end.y }, color: COLORS[i] })
    pos += len
  }

  return { size, dots }
}

// --- Backtracking solver ---

function solveLevel(level: Level): boolean {
  const { size, dots } = level

  // Validate basic level properties
  if (size < 3 || size > 10) return false
  const colorPairs: Record<string, Position[]> = {}
  for (const dot of dots) {
    if (!colorPairs[dot.color]) colorPairs[dot.color] = []
    colorPairs[dot.color].push(dot.pos)
  }

  // Each color must have exactly 2 dots
  for (const positions of Object.values(colorPairs)) {
    if (positions.length !== 2) return false
  }

  const colors = Object.keys(colorPairs)
  const pairStarts = colors.map(c => colorPairs[c][0])
  const pairEnds = colors.map(c => colorPairs[c][1])

  // Validate dot positions are within grid
  for (const d of dots) {
    if (d.pos.x < 0 || d.pos.x >= size || d.pos.y < 0 || d.pos.y >= size) return false
  }

  const grid: number[][] = Array.from({ length: size }, () => Array(size).fill(0))
  colors.forEach((_, ci) => {
    grid[pairStarts[ci].y][pairStarts[ci].x] = ci + 1
    grid[pairEnds[ci].y][pairEnds[ci].x] = ci + 1
  })

  const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]]
  let solved = false
  let iterations = 0

  function isConnected(): boolean {
    let start: Position | null = null
    let emptyCount = 0
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++)
        if (grid[y][x] === 0) { emptyCount++; if (!start) start = { x, y } }
    if (!start || emptyCount === 0) return true
    const visited = new Set<string>()
    const queue = [start]
    visited.add(`${start.x},${start.y}`)
    let count = 1
    while (queue.length > 0) {
      const { x, y } = queue.shift()!
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy
        const key = `${nx},${ny}`
        if (nx >= 0 && nx < size && ny >= 0 && ny < size && !visited.has(key) && grid[ny][nx] === 0) {
          visited.add(key); count++; queue.push({ x: nx, y: ny })
        }
      }
    }
    return count === emptyCount
  }

  function solve(ci: number, cur: Position): boolean {
    if (solved) return true
    iterations++
    if (iterations > 30_000_000) return false

    if (ci >= colors.length) {
      for (let y = 0; y < size; y++)
        for (let x = 0; x < size; x++)
          if (grid[y][x] === 0) return false
      solved = true
      return true
    }

    const end = pairEnds[ci]
    if (cur.x === end.x && cur.y === end.y) {
      if (ci + 1 < colors.length && !isConnected()) return false
      const next = pairStarts[ci + 1]
      return next ? solve(ci + 1, next) : solve(ci + 1, cur)
    }

    const mark = ci + 1
    for (const [dx, dy] of dirs) {
      const nx = cur.x + dx, ny = cur.y + dy
      if (nx < 0 || nx >= size || ny < 0 || ny >= size) continue
      if (grid[ny][nx] === 0 || (nx === end.x && ny === end.y && grid[ny][nx] === mark)) {
        const old = grid[ny][nx]
        grid[ny][nx] = mark
        if (solve(ci, { x: nx, y: ny })) return true
        grid[ny][nx] = old
      }
    }
    return false
  }

  solve(0, pairStarts[0])
  return solved
}

// --- Level definitions for all 30 levels ---
// Generated from Hamiltonian paths, verified solvable

const LEVEL_CONFIGS: { size: number; colors: number; pathGen: (s: number) => Position[]; reversed: boolean }[] = [
  // Levels 1-5: Easy (5x5)
  { size: 5, colors: 3, pathGen: hSerpentine, reversed: false },
  { size: 5, colors: 4, pathGen: hSerpentine, reversed: false },
  { size: 5, colors: 4, pathGen: vSerpentine, reversed: false },
  { size: 5, colors: 4, pathGen: spiral, reversed: false },
  { size: 5, colors: 4, pathGen: hSerpentineRev, reversed: false },
  // Levels 6-12: Medium (6x6)
  { size: 6, colors: 5, pathGen: hSerpentine, reversed: false },
  { size: 6, colors: 5, pathGen: vSerpentine, reversed: false },
  { size: 6, colors: 5, pathGen: spiral, reversed: false },
  { size: 6, colors: 5, pathGen: hSerpentineRev, reversed: false },
  { size: 6, colors: 6, pathGen: hSerpentine, reversed: false },
  { size: 6, colors: 6, pathGen: vSerpentine, reversed: true },
  { size: 6, colors: 6, pathGen: spiral, reversed: false },
  // Levels 13-16: Hard (7x7, 5-6 colors)
  { size: 7, colors: 5, pathGen: hSerpentine, reversed: false },
  { size: 7, colors: 6, pathGen: vSerpentine, reversed: false },
  { size: 7, colors: 6, pathGen: spiral, reversed: false },
  { size: 7, colors: 6, pathGen: hSerpentineRev, reversed: true },
  // Levels 17-20: Expert (7x7, 7 colors)
  { size: 7, colors: 7, pathGen: vSerpentine, reversed: true },
  { size: 7, colors: 7, pathGen: vSerpentine, reversed: false },
  { size: 7, colors: 7, pathGen: spiral, reversed: false },
  { size: 7, colors: 7, pathGen: hSerpentineRev, reversed: false },
  // Levels 21-25: Advanced (8x8, 5-6 colors)
  { size: 8, colors: 5, pathGen: hSerpentine, reversed: false },
  { size: 8, colors: 6, pathGen: vSerpentine, reversed: false },
  { size: 8, colors: 6, pathGen: vSerpentine, reversed: true },
  { size: 8, colors: 6, pathGen: hSerpentineRev, reversed: true },
  { size: 8, colors: 6, pathGen: vSerpentineRev, reversed: false },
  // Levels 26-30: Master (8x8, 7 colors)
  { size: 8, colors: 7, pathGen: hSerpentine, reversed: false },
  { size: 8, colors: 7, pathGen: vSerpentine, reversed: false },
  { size: 8, colors: 7, pathGen: spiral, reversed: false },
  { size: 8, colors: 7, pathGen: hSerpentineRev, reversed: true },
  { size: 8, colors: 7, pathGen: vSerpentineRev, reversed: false },
]

function generateAllLevels(): Level[] {
  return LEVEL_CONFIGS.map(cfg => generateLevel(cfg.size, cfg.colors, cfg.pathGen, cfg.reversed))
}

// Generate the level data as TypeScript source
function generateLevelSource(levels: Level[]): string {
  const comments = [
    'Level 1 - Easy 5x5 (3 colors)',
    'Level 2 - Easy 5x5 (4 colors)',
    'Level 3 - Easy 5x5 (4 colors)',
    'Level 4 - Easy 5x5 (4 colors)',
    'Level 5 - Easy 5x5 (4 colors)',
    'Level 6 - Medium 6x6 (5 colors)',
    'Level 7 - Medium 6x6 (5 colors)',
    'Level 8 - Medium 6x6 (5 colors)',
    'Level 9 - Medium 6x6 (5 colors)',
    'Level 10 - Medium 6x6 (6 colors)',
    'Level 11 - Medium 6x6 (6 colors)',
    'Level 12 - Medium 6x6 (6 colors)',
    'Level 13 - Hard 7x7 (5 colors)',
    'Level 14 - Hard 7x7 (6 colors)',
    'Level 15 - Hard 7x7 (6 colors)',
    'Level 16 - Hard 7x7 (6 colors)',
    'Level 17 - Expert 7x7 (7 colors)',
    'Level 18 - Expert 7x7 (7 colors)',
    'Level 19 - Expert 7x7 (7 colors)',
    'Level 20 - Expert 7x7 (7 colors)',
    'Level 21 - Advanced 8x8 (5 colors)',
    'Level 22 - Advanced 8x8 (6 colors)',
    'Level 23 - Advanced 8x8 (6 colors)',
    'Level 24 - Advanced 8x8 (6 colors)',
    'Level 25 - Advanced 8x8 (6 colors)',
    'Level 26 - Master 8x8 (7 colors)',
    'Level 27 - Master 8x8 (7 colors)',
    'Level 28 - Master 8x8 (7 colors)',
    'Level 29 - Master 8x8 (7 colors)',
    'Level 30 - Master 8x8 (7 colors)',
  ]

  let src = 'const LEVELS: Level[] = [\n'
  for (let i = 0; i < levels.length; i++) {
    const level = levels[i]
    src += `  // ${comments[i]}\n`
    src += `  { size: ${level.size}, dots: [\n`
    for (const dot of level.dots) {
      src += `    { pos: { x: ${dot.pos.x}, y: ${dot.pos.y} }, color: '${dot.color}' },\n`
    }
    src += `  ]},\n`
  }
  src += ']'
  return src
}

// --- Tests ---

describe('Flow Free Level Solver', () => {
  const levels = generateAllLevels()

  it('should generate 30 levels', () => {
    expect(levels.length).toBe(30)
  })

  it('each level should have valid structure', () => {
    for (let i = 0; i < levels.length; i++) {
      const level = levels[i]
      expect(level.size).toBeGreaterThanOrEqual(5)
      expect(level.size).toBeLessThanOrEqual(8)
      expect(level.dots.length).toBeGreaterThanOrEqual(6)
      expect(level.dots.length % 2).toBe(0) // even number of dots (pairs)

      // Each color should have exactly 2 dots
      const colorCounts: Record<string, number> = {}
      for (const dot of level.dots) {
        colorCounts[dot.color] = (colorCounts[dot.color] || 0) + 1
      }
      for (const [color, count] of Object.entries(colorCounts)) {
        expect(count, `Level ${i + 1}: color ${color} should have exactly 2 dots`).toBe(2)
      }

      // All dot positions should be unique
      const positions = new Set(level.dots.map(d => `${d.pos.x},${d.pos.y}`))
      expect(positions.size, `Level ${i + 1}: all dot positions should be unique`).toBe(level.dots.length)

      // All positions within grid
      for (const dot of level.dots) {
        expect(dot.pos.x).toBeGreaterThanOrEqual(0)
        expect(dot.pos.x).toBeLessThan(level.size)
        expect(dot.pos.y).toBeGreaterThanOrEqual(0)
        expect(dot.pos.y).toBeLessThan(level.size)
      }
    }
  })

  it('all levels should be unique (no duplicates)', () => {
    const fingerprints = levels.map(level => {
      const sorted = [...level.dots]
        .sort((a, b) => a.pos.x - b.pos.x || a.pos.y - b.pos.y || a.color.localeCompare(b.color))
        .map(d => `${d.pos.x},${d.pos.y}:${d.color}`)
        .join('|')
      return `${level.size}:${sorted}`
    })
    const seen = new Set<string>()
    for (let i = 0; i < fingerprints.length; i++) {
      expect(seen.has(fingerprints[i]), `Level ${i + 1} should not be a duplicate`).toBe(false)
      seen.add(fingerprints[i])
    }
  })

  it('should have progressive difficulty', () => {
    // First 5 levels should be 5x5
    for (let i = 0; i < 5; i++) {
      expect(levels[i].size, `Level ${i + 1} should be 5x5`).toBe(5)
    }
    // Levels 6-12 should be 6x6
    for (let i = 5; i < 12; i++) {
      expect(levels[i].size, `Level ${i + 1} should be 6x6`).toBe(6)
    }
    // Levels 13-20 should be 7x7
    for (let i = 12; i < 20; i++) {
      expect(levels[i].size, `Level ${i + 1} should be 7x7`).toBe(7)
    }
    // Levels 21-30 should be 8x8
    for (let i = 20; i < 30; i++) {
      expect(levels[i].size, `Level ${i + 1} should be 8x8`).toBe(8)
    }
  })

  // Solve every level - this is the critical test
  for (let i = 0; i < 30; i++) {
    it(`Level ${i + 1} (${levels[i].size}x${levels[i].size}, ${levels[i].dots.length / 2} colors) should be solvable`, () => {
      const result = solveLevel(levels[i])
      expect(result, `Level ${i + 1} must be solvable`).toBe(true)
    })
  }
})

// Export for level generation (used to update FlowFree.tsx)
export { generateAllLevels, generateLevelSource }
