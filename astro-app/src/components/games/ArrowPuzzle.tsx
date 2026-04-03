import { useState, useEffect, useRef, useCallback } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type ArrowPuzzleProps = {
  settings: Settings
  onBack: () => void
}

// ===== TYPES =====
type Direction = 'up' | 'down' | 'left' | 'right'

interface Arrow {
  id: number
  row: number
  col: number
  directions: Direction[]
  isExiting: boolean
  isBlocked: boolean
  exitProgress: number
  blockedTimer: number
}

interface NumberBlock {
  row: number
  col: number
  hits: number
  maxHits: number
}

interface Wall {
  row: number
  col: number
}

interface LevelData {
  id: number
  name: string
  nameZh: string
  gridSize: number
  arrows: { row: number; col: number; directions: Direction[] }[]
  numberBlocks?: { row: number; col: number; maxHits: number }[]
  walls?: { row: number; col: number }[]
  maxMistakes: number
  chapter: number
  algorithm?: string // Track which algorithm generated this level
}

interface SavedProgress {
  completedLevels: number[]
  stars: Record<number, number>
  dailyCompleted?: string // Date string of last completed daily challenge
}

// ===== CONSTANTS =====
const DIR_COLORS: Record<string, string> = {
  up: '#ef4444',
  down: '#3b82f6',
  left: '#22c55e',
  right: '#eab308',
}

const DIR_DELTA: Record<Direction, [number, number]> = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
}

const DIR_SYMBOLS: Record<Direction, string> = {
  up: '▲',
  down: '▼',
  left: '◀',
  right: '▶',
}

const ALL_DIRS: Direction[] = ['up', 'down', 'left', 'right']

// ===== SEEDED RANDOM =====
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 12345) % 2147483647
    return (s & 0x7fffffff) / 0x7fffffff
  }
}

// ===== HAPTICS (Vibration Feedback) =====
class Haptics {
  static light(): void {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10)
    }
  }

  static medium(): void {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20)
    }
  }

  static heavy(): void {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  static success(): void {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([10, 50, 10])
    }
  }

  static error(): void {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([20, 30, 20, 30, 20])
    }
  }

  static slide(): void {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15)
    }
  }

  static pop(): void {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([5, 10, 5])
    }
  }
}

// ===== SOUND MANAGER =====
class SoundManager {
  private ctx: AudioContext | null = null
  private enabled = true

  setEnabled(v: boolean) { this.enabled = v }

  private play(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
    if (!this.enabled) return
    try {
      if (!this.ctx) this.ctx = new AudioContext()
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = type
      osc.frequency.value = freq
      gain.gain.value = volume
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start()
      osc.stop(this.ctx.currentTime + duration)
    } catch {}
  }

  slide() { this.play(800, 0.15, 'sine', 0.1); Haptics.slide() }
  blocked() { this.play(200, 0.3, 'square', 0.1); Haptics.error() }
  pop() { this.play(600, 0.1, 'sine', 0.08); Haptics.pop() }
  win() {
    Haptics.success()
    [523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => this.play(f, 0.3, 'sine', 0.12), i * 120)
    })
  }
  fail() {
    Haptics.error()
    [400, 350, 300, 200].forEach((f, i) => {
      setTimeout(() => this.play(f, 0.3, 'square', 0.08), i * 150)
    })
  }
  undo() { this.play(500, 0.1, 'triangle', 0.08); Haptics.light() }
  hint() { this.play(1000, 0.15, 'sine', 0.06); Haptics.light() }
  click() { this.play(400, 0.05, 'sine', 0.05); Haptics.light() }
  revive() {
    Haptics.success()
    [600, 800, 1000].forEach((f, i) => {
      setTimeout(() => this.play(f, 0.2, 'sine', 0.1), i * 100)
    })
  }
}

// ===== LEVEL GENERATION ALGORITHMS =====

// Algorithm types
type AlgoType = 'basic' | 'aztec' | 'snake' | 'spaghetti' | 'loopy' | 'country'

interface PositionedArrow {
  row: number
  col: number
  directions: Direction[]
}

// 1. Basic Algorithm - Simple straight lines (horizontal/vertical)
function basicAlgorithm(rand: () => number, gridSize: number, count: number): PositionedArrow[] {
  const arrows: PositionedArrow[] = []
  const occupied = new Set<string>()

  for (let i = 0; i < count; i++) {
    let placed = false
    for (let attempt = 0; attempt < 50; attempt++) {
      const horizontal = rand() < 0.5
      const start = Math.floor(rand() * gridSize)
      const lineSize = Math.min(4, Math.floor(rand() * 3) + 2)

      // Find a starting position
      for (let j = 0; j < lineSize && arrows.length < count; j++) {
        const row = horizontal ? start : Math.floor(rand() * gridSize)
        const col = horizontal ? Math.floor(rand() * gridSize) : start
        const key = `${row},${col}`

        if (!occupied.has(key)) {
          const dir: Direction = horizontal ? 'right' : 'down'
          arrows.push({ row, col, directions: [dir] })
          occupied.add(key)
          placed = true
          break
        }
      }
      if (placed) break
    }
  }

  return arrows
}

// 2. Aztec Algorithm - Pyramid/step patterns
function aztecAlgorithm(rand: () => number, gridSize: number, count: number): PositionedArrow[] {
  const arrows: PositionedArrow[] = []
  const occupied = new Set<string>()
  const centerRow = Math.floor(gridSize / 2)
  const centerCol = Math.floor(gridSize / 2)

  // Create pyramid layers
  let layer = 0
  while (arrows.length < count && layer < Math.floor(gridSize / 2)) {
    const startRow = centerRow - layer
    const endRow = centerRow + layer
    const startCol = centerCol - layer
    const endCol = centerCol + layer

    // Place arrows in this layer (perimeter)
    const positions: [number, number][] = []
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        if (r === startRow || r === endRow || c === startCol || c === endCol) {
          if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
            positions.push([r, c])
          }
        }
      }
    }

    // Shuffle positions and place arrows
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[positions[i], positions[j]] = [positions[j], positions[i]]
    }

    for (const [r, c] of positions) {
      if (arrows.length >= count) break
      const key = `${r},${c}`
      if (!occupied.has(key)) {
        // Direction points toward center or away from center
        const dr = centerRow - r
        const dc = centerCol - c
        let dir: Direction
        if (Math.abs(dr) > Math.abs(dc)) {
          dir = dr > 0 ? 'down' : 'up'
        } else {
          dir = dc > 0 ? 'right' : 'left'
        }
        arrows.push({ row: r, col: c, directions: [dir] })
        occupied.add(key)
      }
    }

    layer++
  }

  return arrows.slice(0, count)
}

// 3. Snake Algorithm - S-shaped winding path
function snakeAlgorithm(rand: () => number, gridSize: number, count: number): PositionedArrow[] {
  const arrows: PositionedArrow[] = []
  const occupied = new Set<string>()

  let row = Math.floor(rand() * (gridSize - 2)) + 1
  let col = 0
  let direction: 'right' | 'left' = 'right'

  for (let i = 0; i < count; i++) {
    const key = `${row},${col}`
    if (!occupied.has(key) && row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
      const dir: Direction = direction === 'right' ? 'right' : 'left'
      arrows.push({ row, col, directions: [dir] })
      occupied.add(key)

      col += direction === 'right' ? 1 : -1

      // Change row when hitting edge
      if (col < 0 || col >= gridSize) {
        col = Math.max(0, Math.min(gridSize - 1, col))
        row = (row + 1) % gridSize
        direction = direction === 'right' ? 'left' : 'right'
      }
    } else {
      // Fallback: random placement
      const r = Math.floor(rand() * gridSize)
      const c = Math.floor(rand() * gridSize)
      const key2 = `${r},${c}`
      if (!occupied.has(key2)) {
        const dir: Direction = rand() < 0.5 ? 'right' : 'down'
        arrows.push({ row: r, col: c, directions: [dir] })
        occupied.add(key2)
      }
    }
  }

  return arrows
}

// 4. Spaghetti Algorithm - Random crossing paths
function spaghettiAlgorithm(rand: () => number, gridSize: number, count: number): PositionedArrow[] {
  const arrows: PositionedArrow[] = []
  const occupied = new Set<string>()

  for (let i = 0; i < count; i++) {
    let placed = false
    for (let attempt = 0; attempt < 100 && !placed; attempt++) {
      const row = Math.floor(rand() * gridSize)
      const col = Math.floor(rand() * gridSize)
      const key = `${row},${col}`

      if (!occupied.has(key)) {
        // Random direction with bias
        const dirs: Direction[] = ['up', 'down', 'left', 'right']
        const weights = [1, 1, 1, 1]

        // Bias based on position (tend to point to edges)
        if (row < gridSize / 3) weights[0]++ // more up
        if (row > gridSize * 2 / 3) weights[1]++ // more down
        if (col < gridSize / 3) weights[2]++ // more left
        if (col > gridSize * 2 / 3) weights[3]++ // more right

        const totalWeight = weights.reduce((a, b) => a + b, 0)
        let random = rand() * totalWeight
        let dir: Direction = 'up'

        for (let d = 0; d < dirs.length; d++) {
          random -= weights[d]
          if (random <= 0) {
            dir = dirs[d]
            break
          }
        }

        // 30% chance of multi-direction
        const directions: Direction[] = [dir]
        if (rand() < 0.3) {
          const otherDirs = ALL_DIRS.filter(d => d !== dir)
          const extra = otherDirs[Math.floor(rand() * otherDirs.length)]
          directions.push(extra)
        }

        arrows.push({ row, col, directions })
        occupied.add(key)
        placed = true
      }
    }
  }

  return arrows
}

// 5. Loopy Algorithm - Circular patterns
function loopyAlgorithm(rand: () => number, gridSize: number, count: number): PositionedArrow[] {
  const arrows: PositionedArrow[] = []
  const occupied = new Set<string>()
  const centerRow = Math.floor(gridSize / 2)
  const centerCol = Math.floor(gridSize / 2)

  // Create concentric circles
  for (let radius = 1; arrows.length < count && radius < Math.floor(gridSize / 2); radius++) {
    const circumference = 2 * Math.PI * radius
    const arrowsInCircle = Math.min(Math.floor(circumference / 1.5), count - arrows.length)

    for (let i = 0; i < arrowsInCircle; i++) {
      const angle = (i / arrowsInCircle) * Math.PI * 2
      const row = Math.round(centerRow + Math.sin(angle) * radius)
      const col = Math.round(centerCol + Math.cos(angle) * radius)

      if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
        const key = `${row},${col}`
        if (!occupied.has(key)) {
          // Tangent direction (clockwise along circle)
          const tanAngle = angle + Math.PI / 2
          let dir: Direction
          if (Math.abs(Math.sin(tanAngle)) > Math.abs(Math.cos(tanAngle))) {
            dir = Math.sin(tanAngle) > 0 ? 'down' : 'up'
          } else {
            dir = Math.cos(tanAngle) > 0 ? 'right' : 'left'
          }

          // Add some randomness
          if (rand() < 0.2) {
            dir = ALL_DIRS[Math.floor(rand() * 4)]
          }

          arrows.push({ row, col, directions: [dir] })
          occupied.add(key)
        }
      }
    }
  }

  // Fill remaining with random
  while (arrows.length < count) {
    const row = Math.floor(rand() * gridSize)
    const col = Math.floor(rand() * gridSize)
    const key = `${row},${col}`
    if (!occupied.has(key)) {
      const dir = ALL_DIRS[Math.floor(rand() * 4)]
      arrows.push({ row, col, directions: [dir] })
      occupied.add(key)
    }
  }

  return arrows.slice(0, count)
}

// 6. Country Algorithm - Natural irregular paths
function countryAlgorithm(rand: () => number, gridSize: number, count: number): PositionedArrow[] {
  const arrows: PositionedArrow[] = []
  const occupied = new Set<string>()

  // Create a few "roads"
  const roadCount = Math.max(2, Math.floor(count / 5))
  const roads: [number, number][][] = []

  for (let r = 0; r < roadCount; r++) {
    const road: [number, number][] = []
    let row = Math.floor(rand() * gridSize)
    let col = Math.floor(rand() * gridSize)
    const length = 3 + Math.floor(rand() * 4)

    for (let i = 0; i < length; i++) {
      road.push([row, col])

      // Random turn
      const turn = rand()
      if (turn < 0.4) row = Math.max(0, row - 1)
      else if (turn < 0.8) row = Math.min(gridSize - 1, row + 1)
      else if (turn < 0.9) col = Math.max(0, col - 1)
      else col = Math.min(gridSize - 1, col + 1)
    }

    roads.push(road)
  }

  // Place arrows along roads
  for (const road of roads) {
    for (const [r, c] of road) {
      if (arrows.length >= count) break
      const key = `${r},${c}`
      if (!occupied.has(key)) {
        // Direction follows the road
        let dir: Direction = 'right'
        const idx = road.findIndex(([rr, cc]) => rr === r && cc === c)
        if (idx < road.length - 1) {
          const [nextR, nextC] = road[idx + 1]
          const dr = nextR - r
          const dc = nextC - c
          if (dr < 0) dir = 'up'
          else if (dr > 0) dir = 'down'
          else if (dc < 0) dir = 'left'
          else dir = 'right'
        } else if (idx > 0) {
          const [prevR, prevC] = road[idx - 1]
          const dr = r - prevR
          const dc = c - prevC
          if (dr < 0) dir = 'up'
          else if (dr > 0) dir = 'down'
          else if (dc < 0) dir = 'left'
          else dir = 'right'
        }

        arrows.push({ row: r, col: c, directions: [dir] })
        occupied.add(key)
      }
    }
  }

  // Fill remaining with scattered arrows
  while (arrows.length < count) {
    const row = Math.floor(rand() * gridSize)
    const col = Math.floor(rand() * gridSize)
    const key = `${row},${col}`
    if (!occupied.has(key)) {
      const dir = ALL_DIRS[Math.floor(rand() * 4)]
      arrows.push({ row, col, directions: [dir] })
      occupied.add(key)
    }
  }

  return arrows.slice(0, count)
}

// Algorithm composer - combines multiple algorithms
function composeAlgorithms(rand: () => number, gridSize: number, count: number, algorithms: AlgoType[]): PositionedArrow[] {
  if (algorithms.length === 0) {
    return spaghettiAlgorithm(rand, gridSize, count)
  }

  const perAlgo = Math.ceil(count / algorithms.length)
  const allArrows: PositionedArrow[] = []
  const occupied = new Set<string>()

  for (const algo of algorithms) {
    const remaining = count - allArrows.length
    if (remaining <= 0) break

    const thisCount = Math.min(perAlgo, remaining)
    let arrows: PositionedArrow[] = []

    switch (algo) {
      case 'basic': arrows = basicAlgorithm(rand, gridSize, thisCount); break
      case 'aztec': arrows = aztecAlgorithm(rand, gridSize, thisCount); break
      case 'snake': arrows = snakeAlgorithm(rand, gridSize, thisCount); break
      case 'spaghetti': arrows = spaghettiAlgorithm(rand, gridSize, thisCount); break
      case 'loopy': arrows = loopyAlgorithm(rand, gridSize, thisCount); break
      case 'country': arrows = countryAlgorithm(rand, gridSize, thisCount); break
    }

    // Filter out already occupied positions
    for (const arrow of arrows) {
      if (allArrows.length >= count) break
      const key = `${arrow.row},${arrow.col}`
      if (!occupied.has(key)) {
        allArrows.push(arrow)
        occupied.add(key)
      }
    }
  }

  return allArrows
}

// ===== MAIN LEVEL GENERATOR =====
function generateLevel(levelNum: number): LevelData {
  const rand = seededRandom(levelNum * 7919 + 31)
  let chapter: number, gridSize: number, arrowCount: number, maxMistakes: number
  let hasMultiDir = false, hasNumBlock = false, hasWalls = false
  let algorithms: AlgoType[] = []

  // Chapter configuration
  if (levelNum <= 30) {
    chapter = 1
    gridSize = 4 + (levelNum > 15 ? 1 : 0)
    arrowCount = 3 + Math.floor(levelNum / 5)
    maxMistakes = 3
    algorithms = ['basic', 'aztec']
  } else if (levelNum <= 70) {
    chapter = 2
    gridSize = 5 + (levelNum > 50 ? 1 : 0)
    arrowCount = 5 + Math.floor((levelNum - 30) / 8)
    maxMistakes = 3
    hasMultiDir = true
    algorithms = ['snake', 'spaghetti']
  } else if (levelNum <= 120) {
    chapter = 3
    gridSize = 6 + (levelNum > 100 ? 1 : 0)
    arrowCount = 8 + Math.floor((levelNum - 70) / 10)
    maxMistakes = 3
    hasMultiDir = true
    hasWalls = true
    algorithms = ['loopy', 'country']
  } else {
    chapter = 4
    gridSize = 7 + (levelNum > 160 ? 1 : 0)
    arrowCount = 10 + Math.floor((levelNum - 120) / 20)
    maxMistakes = 3
    hasMultiDir = true
    hasNumBlock = true
    hasWalls = true
    algorithms = ['basic', 'aztec', 'snake', 'spaghetti', 'loopy', 'country']
  }

  // Shuffle algorithms for variety
  for (let i = algorithms.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[algorithms[i], algorithms[j]] = [algorithms[j], algorithms[i]]
  }
  // Use 1-2 algorithms per level
  const numAlgos = Math.min(2, algorithms.length)
  algorithms = algorithms.slice(0, numAlgos)

  // Try generating solvable level using reverse-insertion algorithm
  for (let attempt = 0; attempt < 50; attempt++) {
    const attemptRand = seededRandom(levelNum * 10000 + attempt * 137 + 7)
    const grid: (string | null)[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(null))

    // Place walls first
    const walls: Wall[] = []
    if (hasWalls) {
      const wallCount = Math.floor(attemptRand() * 3) + 1
      for (let w = 0; w < wallCount; w++) {
        const wr = Math.floor(attemptRand() * (gridSize - 2)) + 1
        const wc = Math.floor(attemptRand() * (gridSize - 2)) + 1
        if (!grid[wr][wc]) {
          grid[wr][wc] = 'wall'
          walls.push({ row: wr, col: wc })
        }
      }
    }

    // Place number blocks
    const numberBlocks: NumberBlock[] = []
    if (hasNumBlock) {
      const nbCount = Math.floor(attemptRand() * 2) + 1
      for (let nb = 0; nb < nbCount; nb++) {
        const nr = Math.floor(attemptRand() * gridSize)
        const nc = Math.floor(attemptRand() * gridSize)
        if (!grid[nr][nc]) {
          grid[nr][nc] = 'block'
          numberBlocks.push({ row: nr, col: nc, hits: 0, maxHits: Math.floor(attemptRand() * 2) + 2 })
        }
      }
    }

    // Generate arrow positions using algorithms
    const algoArrows = composeAlgorithms(attemptRand, gridSize, arrowCount, algorithms)

    // Reverse insertion: determine valid exit directions
    const arrows: LevelData['arrows'] = []
    const arrowPositions = new Set<string>()

    for (const algoArrow of algoArrows) {
      const key = `${algoArrow.row},${algoArrow.col}`
      if (arrowPositions.has(key)) continue
      if (grid[algoArrow.row][algoArrow.col]) continue

      // Find valid exit direction
      let validDirs: Direction[] = []
      for (const dir of algoArrow.directions) {
        const [dr, dc] = DIR_DELTA[dir]
        let r = algoArrow.row + dr
        let c = algoArrow.col + dc
        let clear = true

        while (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
          if (grid[r][c]) { clear = false; break }
          if (arrowPositions.has(`${r},${c}`)) { clear = false; break }
          r += dr; c += dc
        }

        if (clear) validDirs.push(dir)
      }

      if (validDirs.length > 0) {
        // Use first valid direction, or add multi-direction if enabled
        let directions: Direction[]
        if (hasMultiDir && validDirs.length > 1 && attemptRand() < 0.3) {
          directions = [validDirs[0], validDirs[1]]
        } else {
          directions = [validDirs[0]]
        }

        grid[algoArrow.row][algoArrow.col] = `arrow-${arrows.length}`
        arrows.push({ row: algoArrow.row, col: algoArrow.col, directions })
        arrowPositions.add(key)
      }
    }

    if (arrows.length < arrowCount) continue

    // Verify solvability by checking if reverse order works
    let solvable = true
    const testGrid: Set<string> = new Set(arrowPositions)
    walls?.forEach(w => testGrid.add(`w${w.row},${w.col}`))
    numberBlocks?.forEach(b => testGrid.add(`b${b.row},${b.col}`))

    // Check each arrow can exit (in reverse insertion order)
    for (let i = arrows.length - 1; i >= 0; i--) {
      const a = arrows[i]
      let canExit = false
      for (const dir of a.directions) {
        const [dr, dc] = DIR_DELTA[dir]
        let r = a.row + dr, c = a.col + dc
        let pathClear = true
        while (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
          if (testGrid.has(`${r},${c}`)) { pathClear = false; break }
          r += dr; c += dc
        }
        if (pathClear) { canExit = true; break }
      }
      if (canExit) {
        testGrid.delete(`${a.row},${a.col}`)
      } else {
        solvable = false
        break
      }
    }

    if (!solvable) continue

    return {
      id: levelNum,
      name: `Level ${levelNum}`,
      nameZh: `第${levelNum}关`,
      gridSize,
      arrows,
      numberBlocks: numberBlocks.length > 0 ? numberBlocks.map(nb => ({ row: nb.row, col: nb.col, maxHits: nb.maxHits })) : undefined,
      walls: walls.length > 0 ? walls : undefined,
      maxMistakes,
      chapter,
      algorithm: algorithms[0],
    }
  }

  // Fallback: simple guaranteed-solvable level
  return {
    id: levelNum,
    name: `Level ${levelNum}`,
    nameZh: `第${levelNum}关`,
    gridSize: 4,
    arrows: [
      { row: 1, col: 1, directions: ['right'] },
      { row: 2, col: 2, directions: ['down'] },
    ],
    maxMistakes: 3,
    chapter: 1,
    algorithm: 'basic',
  }
}

// Hand-crafted tutorial levels
const TUTORIAL_LEVELS: LevelData[] = [
  {
    id: 1, name: 'First Steps', nameZh: '第一步', gridSize: 4, chapter: 1, maxMistakes: 3,
    arrows: [
      { row: 1, col: 1, directions: ['right'] },
      { row: 2, col: 2, directions: ['down'] },
    ],
    algorithm: 'basic',
  },
  {
    id: 2, name: 'Clear the Way', nameZh: '扫清道路', gridSize: 4, chapter: 1, maxMistakes: 3,
    arrows: [
      { row: 0, col: 0, directions: ['right'] },
      { row: 0, col: 2, directions: ['down'] },
      { row: 2, col: 3, directions: ['left'] },
    ],
    algorithm: 'basic',
  },
  {
    id: 3, name: 'Think Ahead', nameZh: '三思而行', gridSize: 4, chapter: 1, maxMistakes: 3,
    arrows: [
      { row: 1, col: 1, directions: ['right'] },
      { row: 1, col: 2, directions: ['down'] },
      { row: 2, col: 1, directions: ['up'] },
    ],
    algorithm: 'snake',
  },
  {
    id: 4, name: 'Order Matters', nameZh: '顺序很重要', gridSize: 5, chapter: 1, maxMistakes: 3,
    arrows: [
      { row: 0, col: 0, directions: ['right'] },
      { row: 1, col: 2, directions: ['down'] },
      { row: 2, col: 4, directions: ['left'] },
      { row: 3, col: 1, directions: ['up'] },
    ],
    algorithm: 'country',
  },
  {
    id: 5, name: 'Getting Tricky', nameZh: '越来越难', gridSize: 5, chapter: 1, maxMistakes: 3,
    arrows: [
      { row: 0, col: 1, directions: ['down'] },
      { row: 1, col: 3, directions: ['left'] },
      { row: 2, col: 0, directions: ['right'] },
      { row: 3, col: 2, directions: ['up'] },
      { row: 2, col: 4, directions: ['left'] },
    ],
    algorithm: 'spaghetti',
  },
]

function getLevel(levelNum: number): LevelData {
  if (levelNum <= TUTORIAL_LEVELS.length) return TUTORIAL_LEVELS[levelNum - 1]
  return generateLevel(levelNum)
}

// ===== DAILY CHALLENGE GENERATOR =====
function getDailyChallengeLevel(): LevelData {
  const today = new Date()
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  return generateLevel(seed)
}

// ===== SOLVER (for hints) =====
function findSolution(level: LevelData): number[] | null {
  const arrows = level.arrows.map((a, i) => ({ ...a, id: i }))
  const occupied = new Set<string>()
  arrows.forEach(a => occupied.add(`${a.row},${a.col}`))
  if (level.walls) level.walls.forEach(w => occupied.add(`${w.row},${w.col}`))

  const nbState: Map<string, number> = new Map()
  if (level.numberBlocks) {
    level.numberBlocks.forEach(b => nbState.set(`${b.row},${b.col}`, b.maxHits))
  }

  function canArrowExit(arrow: typeof arrows[0], occ: Set<string>, nb: Map<string, number>): boolean {
    for (const dir of arrow.directions) {
      const [dr, dc] = DIR_DELTA[dir]
      let r = arrow.row + dr, c = arrow.col + dc
      let clear = true
      while (r >= 0 && r < level.gridSize && c >= 0 && c < level.gridSize) {
        if (occ.has(`${r},${c}`)) {
          if (nb.has(`${r},${c}`) && nb.get(`${r},${c}`) === 0) {
            // cleared block, pass through
          } else {
            clear = false
            break
          }
        }
        r += dr; c += dc
      }
      if (clear) return true
    }
    return false
  }

  function solve(remaining: typeof arrows, order: number[]): number[] | null {
    if (remaining.length === 0) return order

    for (let i = 0; i < remaining.length; i++) {
      const arrow = remaining[i]
      if (canArrowExit(arrow, occupied, nbState)) {
        occupied.delete(`${arrow.row},${arrow.col}`)
        const newRemaining = remaining.filter((_, j) => j !== i)
        const result = solve(newRemaining, [...order, arrow.id])
        if (result) return result
        occupied.add(`${arrow.row},${arrow.col}`)
      }
    }
    return null
  }

  return solve(arrows, [])
}

// ===== GAME COMPONENT =====
export default function ArrowPuzzle({ settings, onBack }: ArrowPuzzleProps) {
  const [screen, setScreen] = useState<'levels' | 'game'>('levels')
  const [currentLevel, setCurrentLevel] = useState(1)
  const [isDailyChallenge, setIsDailyChallenge] = useState(false)
  const [progress, setProgress] = useState<SavedProgress>({ completedLevels: [], stars: {} })
  const [arrows, setArrows] = useState<Arrow[]>([])
  const [levelData, setLevelData] = useState<LevelData | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const [moves, setMoves] = useState(0)
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing')
  const [hintArrow, setHintArrow] = useState<number | null>(null)
  const [history, setHistory] = useState<Arrow[][]>([])
  const [numberBlocks, setNumberBlocks] = useState<NumberBlock[]>([])
  const [selectedChapter, setSelectedChapter] = useState(1)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const soundRef = useRef(new SoundManager())
  const arrowsRef = useRef(arrows)
  const numberBlocksRef = useRef(numberBlocks)
  const gameStateRef = useRef(gameState)
  const animatingArrows = useRef<Set<number>>(new Set())

  const isZh = settings.language === 'zh'

  // Keep refs in sync - ALL hooks must be called unconditionally
  useEffect(() => { arrowsRef.current = arrows }, [arrows])
  useEffect(() => { numberBlocksRef.current = numberBlocks }, [numberBlocks])
  useEffect(() => { gameStateRef.current = gameState }, [gameState])
  useEffect(() => { soundRef.current.setEnabled(settings.soundEnabled) }, [settings.soundEnabled])

  // Load progress - runs once on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('arrow-puzzle-progress')
      if (saved) setProgress(JSON.parse(saved))
    } catch {}
  }, [])

  const saveProgress = useCallback((p: SavedProgress) => {
    setProgress(p)
    try { localStorage.setItem('arrow-puzzle-progress', JSON.stringify(p)) } catch {}
  }, [])

  // Initialize level when entering game screen - MUST be unconditional
  useEffect(() => {
    if (screen !== 'game') return
    if (currentLevel < 1) return

    cancelAnimationFrame(animRef.current)
    animatingArrows.current.clear()

    const ld = isDailyChallenge ? getDailyChallengeLevel() : getLevel(currentLevel)
    setLevelData(ld)
    setMistakes(0)
    setMoves(0)
    setGameState('playing')
    setHintArrow(null)
    setHistory([])

    setArrows(ld.arrows.map((a, i) => ({
      id: i, row: a.row, col: a.col, directions: a.directions,
      isExiting: false, isBlocked: false, exitProgress: 0, blockedTimer: 0,
    })))

    setNumberBlocks((ld.numberBlocks || []).map(b => ({
      row: b.row, col: b.col, hits: 0, maxHits: b.maxHits,
    })))
  }, [currentLevel, screen, isDailyChallenge])

  // Check if arrow can exit
  const canArrowExit = useCallback((arrow: Arrow): boolean => {
    if (!levelData) return false
    const grid = levelData.gridSize
    const wallSet = new Set((levelData.walls || []).map(w => `${w.row},${w.col}`))
    const arrowSet = new Set(arrowsRef.current.filter(a => a.id !== arrow.id && !a.isExiting).map(a => `${a.row},${a.col}`))
    const nbMap = new Map(numberBlocksRef.current.map(b => [`${b.row},${b.col}`, b]))

    for (const dir of arrow.directions) {
      const [dr, dc] = DIR_DELTA[dir]
      let r = arrow.row + dr, c = arrow.col + dc
      let clear = true

      while (r >= 0 && r < grid && c >= 0 && c < grid) {
        const key = `${r},${c}`
        if (wallSet.has(key)) { clear = false; break }
        if (arrowSet.has(key)) { clear = false; break }
        const nb = nbMap.get(key)
        if (nb && nb.hits < nb.maxHits) { clear = false; break }
        r += dr; c += dc
      }
      if (clear) return true
    }
    return false
  }, [levelData])

  // Click on arrow
  const handleArrowClick = useCallback((arrowId: number) => {
    if (gameStateRef.current !== 'playing') return
    if (animatingArrows.current.size > 0) return

    const arrow = arrowsRef.current.find(a => a.id === arrowId)
    if (!arrow || arrow.isExiting) return

    soundRef.current.click()

    if (canArrowExit(arrow)) {
      // Arrow exits
      soundRef.current.slide()
      animatingArrows.current.add(arrowId)

      const newArrows = arrowsRef.current.map(a =>
        a.id === arrowId ? { ...a, isExiting: true, exitProgress: 0 } : a
      )
      setArrows(newArrows)
      setHistory(prev => [...prev, arrowsRef.current])
      setMoves(prev => prev + 1)
      setHintArrow(null)

      // Animate exit
      const startTime = Date.now()
      const duration = 250
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(1, elapsed / duration)
        const eased = 1 - Math.pow(1 - progress, 3)

        setArrows(prev => prev.map(a =>
          a.id === arrowId ? { ...a, exitProgress: eased } : a
        ))

        if (progress < 1) {
          animRef.current = requestAnimationFrame(animate)
        } else {
          animatingArrows.current.delete(arrowId)
          setArrows(prev => {
            const remaining = prev.filter(a => a.id !== arrowId)
            if (remaining.length === 0) {
              setTimeout(() => {
                soundRef.current.win()
                setGameState('won')
              }, 100)
            }
            return remaining
          })
        }
      }
      animRef.current = requestAnimationFrame(animate)
    } else {
      // Blocked
      soundRef.current.blocked()
      setMistakes(prev => {
        const next = prev + 1
        const maxMistakes = levelData?.maxMistakes || 3
        if (next >= maxMistakes) {
          // Use a flag to track if we should show lose state
          setTimeout(() => {
            soundRef.current.fail()
            setGameState('lost')
          }, 300)
        }
        return next
      })
      setMoves(prev => prev + 1)

      // Shake animation
      const newArrows = arrowsRef.current.map(a =>
        a.id === arrowId ? { ...a, isBlocked: true, blockedTimer: 6 } : a
      )
      setArrows(newArrows)

      const shakeAnim = () => {
        setArrows(prev => prev.map(a => {
          if (a.id === arrowId) {
            if (a.blockedTimer <= 0) return { ...a, isBlocked: false }
            return { ...a, blockedTimer: a.blockedTimer - 1 }
          }
          return a
        }))
        const current = arrowsRef.current.find(a => a.id === arrowId)
        if (current && current.blockedTimer > 0) {
          requestAnimationFrame(shakeAnim)
        }
      }
      requestAnimationFrame(shakeAnim)
    }
  }, [canArrowExit, levelData])

  // Revive (continue after losing)
  const handleRevive = useCallback(() => {
    soundRef.current.revive()
    setMistakes(0)
    setGameState('playing')
  }, [])

  // Undo
  const handleUndo = useCallback(() => {
    if (history.length === 0 || gameState !== 'playing') return
    if (animatingArrows.current.size > 0) return

    soundRef.current.undo()
    const prev = history[history.length - 1]
    setArrows(prev)
    setHistory(h => h.slice(0, -1))
    setMoves(prev => prev + 1)
    setHintArrow(null)
  }, [history, gameState])

  // Hint
  const handleHint = useCallback(() => {
    if (gameState !== 'playing' || !levelData) return
    if (animatingArrows.current.size > 0) return

    const solution = findSolution(levelData)
    if (solution && solution.length > 0) {
      const nextArrowId = solution[0]
      const currentArrows = arrowsRef.current
      if (currentArrows.find(a => a.id === nextArrowId)) {
        soundRef.current.hint()
        setHintArrow(nextArrowId)
        setTimeout(() => setHintArrow(null), 2000)
      }
    }
  }, [gameState, levelData])

  // Restart
  const handleRestart = useCallback(() => {
    cancelAnimationFrame(animRef.current)
    animatingArrows.current.clear()

    const ld = isDailyChallenge ? getDailyChallengeLevel() : getLevel(currentLevel)
    setLevelData(ld)
    setMistakes(0)
    setMoves(0)
    setGameState('playing')
    setHintArrow(null)
    setHistory([])

    setArrows(ld.arrows.map((a, i) => ({
      id: i, row: a.row, col: a.col, directions: a.directions,
      isExiting: false, isBlocked: false, exitProgress: 0, blockedTimer: 0,
    })))

    setNumberBlocks((ld.numberBlocks || []).map(b => ({
      row: b.row, col: b.col, hits: 0, maxHits: b.maxHits,
    })))
  }, [currentLevel, isDailyChallenge])

  // Next level
  const handleNextLevel = useCallback(() => {
    setIsDailyChallenge(false)
    setCurrentLevel(prev => Math.min(prev + 1, 200))
  }, [])

  // Save on win - MUST be unconditional
  useEffect(() => {
    if (gameState === 'won' && levelData) {
      const stars = mistakes === 0 ? 3 : mistakes === 1 ? 2 : 1
      const lvl = isDailyChallenge ? 0 : currentLevel
      const newCompleted = progress.completedLevels.includes(lvl)
        ? progress.completedLevels
        : [...progress.completedLevels, lvl]
      const newStars = { ...progress.stars }
      newStars[lvl] = Math.max(newStars[lvl] || 0, stars)

      const newProgress = { completedLevels: newCompleted, stars: newStars }

      if (isDailyChallenge) {
        const today = new Date().toDateString()
        newProgress.dailyCompleted = today
      }

      saveProgress(newProgress)
    }
  }, [gameState, currentLevel, mistakes, levelData, progress, saveProgress, isDailyChallenge])

  // Canvas rendering - MUST be unconditional
  useEffect(() => {
    if (screen !== 'game') return
    if (!levelData || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const size = Math.min(canvas.parentElement?.clientWidth || 400, 500)
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    const gs = levelData.gridSize
    const cellSize = size / gs
    const dark = settings.darkMode

    // Clear
    ctx.fillStyle = dark ? '#0f172a' : '#f8fafc'
    ctx.fillRect(0, 0, size, size)

    // Grid lines
    ctx.strokeStyle = dark ? 'rgba(148,163,184,0.15)' : 'rgba(100,116,139,0.15)'
    ctx.lineWidth = 1
    for (let i = 0; i <= gs; i++) {
      ctx.beginPath()
      ctx.moveTo(i * cellSize, 0)
      ctx.lineTo(i * cellSize, size)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * cellSize)
      ctx.lineTo(size, i * cellSize)
      ctx.stroke()
    }

    // Draw walls
    ;(levelData.walls || []).forEach(w => {
      ctx.fillStyle = dark ? '#334155' : '#94a3b8'
      ctx.fillRect(w.col * cellSize + 2, w.row * cellSize + 2, cellSize - 4, cellSize - 4)
      ctx.strokeStyle = dark ? '#475569' : '#64748b'
      ctx.lineWidth = 1
      const cx = w.col * cellSize, cy = w.row * cellSize
      ctx.strokeRect(cx + 2, cy + 2, cellSize - 4, cellSize - 4)
    })

    // Draw number blocks
    numberBlocks.forEach(b => {
      const x = b.col * cellSize + cellSize / 2
      const y = b.row * cellSize + cellSize / 2

      ctx.fillStyle = dark ? '#1e293b' : '#e2e8f0'
      ctx.beginPath()
      ctx.roundRect(b.col * cellSize + 4, b.row * cellSize + 4, cellSize - 8, cellSize - 8, 6)
      ctx.fill()
      ctx.strokeStyle = dark ? '#475569' : '#94a3b8'
      ctx.lineWidth = 1.5
      ctx.stroke()

      ctx.fillStyle = dark ? '#e2e8f0' : '#334155'
      ctx.font = `bold ${cellSize * 0.35}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${b.maxHits - b.hits}`, x, y)
    })

    // Draw arrows
    arrows.forEach(arrow => {
      if (arrow.isExiting && arrow.exitProgress >= 1) return

      let x = arrow.col * cellSize + cellSize / 2
      let y = arrow.row * cellSize + cellSize / 2
      let scale = 1
      let alpha = 1

      if (arrow.isExiting) {
        const dir = arrow.directions[0]
        const [dr, dc] = DIR_DELTA[dir]
        x += dc * cellSize * arrow.exitProgress * 2
        y += dr * cellSize * arrow.exitProgress * 2
        scale = 1 - arrow.exitProgress * 0.5
        alpha = 1 - arrow.exitProgress
      }

      if (arrow.isBlocked) {
        x += (Math.random() - 0.5) * 4
        y += (Math.random() - 0.5) * 4
      }

      const isHinted = hintArrow === arrow.id

      ctx.save()
      ctx.globalAlpha = alpha
      ctx.translate(x, y)
      ctx.scale(scale, scale)

      const r = cellSize * 0.38

      if (isHinted) {
        ctx.shadowColor = '#fbbf24'
        ctx.shadowBlur = 15
      }

      const baseColor = DIR_COLORS[arrow.directions[0]]
      ctx.fillStyle = baseColor
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = 'rgba(255,255,255,0.2)'
      ctx.beginPath()
      ctx.arc(-r * 0.15, -r * 0.15, r * 0.6, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = 'white'
      ctx.font = `bold ${cellSize * 0.22}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      if (arrow.directions.length === 1) {
        ctx.font = `bold ${cellSize * 0.35}px sans-serif`
        ctx.fillText(DIR_SYMBOLS[arrow.directions[0]], 0, 0)
      } else {
        const offset = cellSize * 0.12
        const positions: Record<Direction, [number, number]> = {
          up: [0, -offset],
          down: [0, offset],
          left: [-offset, 0],
          right: [offset, 0],
        }
        arrow.directions.forEach(dir => {
          const [dx, dy] = positions[dir]
          ctx.fillText(DIR_SYMBOLS[dir], dx, dy)
        })
      }

      if (isHinted) {
        ctx.strokeStyle = '#fbbf24'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(0, 0, r + 4, 0, Math.PI * 2)
        ctx.stroke()
      }

      ctx.restore()
    })

  }, [screen, arrows, numberBlocks, levelData, settings.darkMode, hintArrow])

  // Touch/click handler for canvas
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!levelData || gameStateRef.current !== 'playing') return
    if (animatingArrows.current.size > 0) return

    const canvas = canvasRef.current
    if (!canvas) return

    e.preventDefault()

    let clientX: number, clientY: number
    if ('touches' in e) {
      if (e.touches.length === 0) return
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top
    const cellSize = (rect.width) / levelData.gridSize
    const col = Math.floor(x / cellSize)
    const row = Math.floor(y / cellSize)

    const clickedArrow = arrowsRef.current.find(a => a.row === row && a.col === col && !a.isExiting)
    if (clickedArrow) {
      handleArrowClick(clickedArrow.id)
    }
  }, [levelData, handleArrowClick])

  // ===== RENDER HELPERS =====
  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'
  const borderClass = settings.darkMode ? 'border-gray-700' : 'border-gray-200'

  // ===== LEVEL SELECT SCREEN RENDER =====
  const renderLevelSelect = () => {
    const today = new Date().toDateString()
    const isDailyCompleted = progress.dailyCompleted === today

    const chapters = [
      { id: 1, name: isZh ? '入门篇' : 'Beginner', range: '1-30', color: 'from-green-400 to-emerald-600', icon: '🌱' },
      { id: 2, name: isZh ? '进阶篇' : 'Intermediate', range: '31-70', color: 'from-blue-400 to-indigo-600', icon: '⚡' },
      { id: 3, name: isZh ? '挑战篇' : 'Advanced', range: '71-120', color: 'from-purple-400 to-pink-600', icon: '🔥' },
      { id: 4, name: isZh ? '大师篇' : 'Master', range: '121-200', color: 'from-amber-400 to-red-600', icon: '👑' },
    ]

    const chapter = chapters.find(c => c.id === selectedChapter)!
    const startLevel = selectedChapter === 1 ? 1 : selectedChapter === 2 ? 31 : selectedChapter === 3 ? 71 : 121
    const endLevel = selectedChapter === 1 ? 30 : selectedChapter === 2 ? 70 : selectedChapter === 3 ? 120 : 200
    const maxUnlocked = progress.completedLevels.length > 0 ? Math.max(...progress.completedLevels) + 1 : 1

    return (
      <div className={`min-h-screen flex flex-col ${bgClass} ${textClass}`}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b ${borderClass} px-4 py-3`}>
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-lg font-bold">{isZh ? '箭头解谜' : 'Arrow Puzzle'}</h1>
          <div className="w-8" />
        </div>

        {/* Daily Challenge Banner */}
        <div className="mx-3 mt-2 mb-2">
          <button
            onClick={() => { setIsDailyChallenge(true); setCurrentLevel(1); setScreen('game') }}
            disabled={isDailyCompleted}
            className={`w-full py-3 px-4 rounded-xl flex items-center justify-between shadow-lg transition-all ${
              isDailyCompleted
                ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-default'
                : 'bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 text-white cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <div className="text-left">
                <div className="font-bold">{isZh ? '每日挑战' : 'Daily Challenge'}</div>
                <div className="text-xs opacity-80">
                  {isDailyCompleted ? isZh ? '今日已完成' : 'Completed today' : new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
            {!isDailyCompleted && <span className="text-xl">→</span>}
          </button>
        </div>

        {/* Chapter tabs */}
        <div className="flex gap-1 px-3 py-2 overflow-x-auto">
          {chapters.map(ch => (
            <button key={ch.id} onClick={() => setSelectedChapter(ch.id)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedChapter === ch.id
                  ? `bg-gradient-to-r ${ch.color} text-white shadow-lg`
                  : settings.darkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-gray-600'
              }`}
            >
              {ch.icon} {ch.name}
            </button>
          ))}
        </div>

        {/* Chapter info */}
        <div className={`mx-3 mb-2 p-3 rounded-xl bg-gradient-to-r ${chapter.color} text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl mr-2">{chapter.icon}</span>
              <span className="font-bold">{chapter.name}</span>
              <span className="text-sm opacity-80 ml-2">({chapter.range})</span>
            </div>
            <span className="text-sm opacity-80">
              {progress.completedLevels.filter(l => l >= startLevel && l <= endLevel).length}/{endLevel - startLevel + 1}
            </span>
          </div>
        </div>

        {/* Level grid */}
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: endLevel - startLevel + 1 }, (_, i) => {
              const lvl = startLevel + i
              const completed = progress.completedLevels.includes(lvl)
              const stars = progress.stars[lvl] || 0
              const locked = lvl > maxUnlocked

              return (
                <button key={lvl} disabled={locked}
                  onClick={() => { setCurrentLevel(lvl); setIsDailyChallenge(false); setScreen('game') }}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-bold transition-all relative
                    ${locked ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
                    ${completed
                      ? `bg-gradient-to-br ${chapter.color} text-white shadow-lg`
                      : settings.darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-gray-50 shadow'
                    }`}
                >
                  <span className="text-xs">{lvl}</span>
                  {completed && (
                    <div className="flex gap-0 mt-0.5">
                      {[1, 2, 3].map(s => (
                        <span key={s} className={`text-[8px] ${stars >= s ? 'text-yellow-300' : 'text-white/30'}`}>★</span>
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ===== GAME SCREEN RENDER =====
  const renderGame = () => {
    if (!levelData) {
      return (
        <div className={`min-h-screen flex items-center justify-center ${bgClass} ${textClass}`}>
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-current border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-sm opacity-60">{isZh ? '加载中...' : 'Loading...'}</p>
          </div>
        </div>
      )
    }

    const chapterNames = [isZh ? '入门篇' : 'Beginner', isZh ? '进阶篇' : 'Intermediate', isZh ? '挑战篇' : 'Advanced', isZh ? '大师篇' : 'Master']
    const chapterName = isDailyChallenge ? (isZh ? '每日挑战' : 'Daily Challenge') : chapterNames[levelData.chapter - 1]
    const levelDisplay = isDailyChallenge ? '' : (isZh ? `第${currentLevel}关` : `Level ${currentLevel}`)
    const maxMistakes = levelData.maxMistakes

    return (
      <div className={`min-h-screen flex flex-col ${bgClass} ${textClass}`}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b ${borderClass} px-4 py-2`}>
          <button onClick={() => setScreen('levels')} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="text-center">
            <h1 className="text-sm font-bold">{isZh ? '箭头解谜' : 'Arrow Puzzle'}</h1>
            <p className="text-xs opacity-60">{chapterName} {levelDisplay && `- ${levelDisplay}`}</p>
          </div>
          <div className="w-8" />
        </div>

        {/* HUD */}
        <div className={`flex items-center justify-between px-4 py-2 ${cardBgClass} border-b ${borderClass}`}>
          <div className="flex items-center gap-3">
            {/* Mistakes */}
            <div className="flex items-center gap-1">
              <span className="text-xs opacity-60">{isZh ? '失误' : 'Err'}:</span>
              {Array.from({ length: maxMistakes }, (_, i) => (
                <span key={i} className={`text-sm ${i < mistakes ? 'text-red-500' : 'opacity-30'}`}>✕</span>
              ))}
            </div>
            {/* Moves */}
            <div className="flex items-center gap-1">
              <span className="text-xs opacity-60">{isZh ? '步数' : 'Moves'}:</span>
              <span className="text-sm font-bold">{moves}</span>
            </div>
          </div>

          {/* Arrows remaining */}
          <div className="text-xs opacity-60">
            {isZh ? '剩余' : 'Left'}: <span className="font-bold">{arrows.filter(a => !a.isExiting).length}</span>
          </div>
        </div>

        {/* Game Canvas */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-[500px]">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onTouchStart={handleCanvasClick}
              style={{ touchAction: 'none' }}
              className={`w-full rounded-xl shadow-lg cursor-pointer border ${borderClass}`}
            />
          </div>
        </div>

        {/* Controls */}
        <div className={`px-4 pb-4 flex items-center justify-center gap-3`}>
          <button onClick={handleUndo}
            disabled={history.length === 0 || gameState !== 'playing'}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${cardBgClass} border ${borderClass} disabled:opacity-30 active:scale-95 transition-all`}
          >
            ↩ {isZh ? '撤销' : 'Undo'}
          </button>
          <button onClick={handleHint}
            disabled={gameState !== 'playing'}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${cardBgClass} border ${borderClass} disabled:opacity-30 active:scale-95 transition-all`}
          >
            💡 {isZh ? '提示' : 'Hint'}
          </button>
          <button onClick={handleRestart}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${cardBgClass} border ${borderClass} active:scale-95 transition-all`}
          >
            🔄 {isZh ? '重试' : 'Retry'}
          </button>
        </div>

        {/* Win Modal */}
        {gameState === 'won' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={e => { if (e.target === e.currentTarget) setGameState('playing') }}>
            <div className={`${cardBgClass} rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl`}>
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="text-2xl font-bold mb-2">{isZh ? '恭喜通关！' : 'Level Complete!'}</h2>
              <div className="flex justify-center gap-1 mb-3">
                {[1, 2, 3].map(s => (
                  <span key={s} className={`text-2xl ${mistakes === 0 ? 'text-yellow-400' : (s <= (mistakes === 0 ? 3 : mistakes === 1 ? 2 : 1) ? 'text-yellow-400' : 'opacity-20')}`}>★</span>
                ))}
              </div>
              <p className="text-sm opacity-60 mb-4">
                {isZh ? `${moves} 步 · ${mistakes} 次失误` : `${moves} moves · ${mistakes} mistakes`}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setScreen('levels')}
                  className={`flex-1 py-3 rounded-xl font-bold ${cardBgClass} border ${borderClass}`}
                >
                  {isZh ? '关卡列表' : 'Levels'}
                </button>
                {!isDailyChallenge && currentLevel < 200 && (
                  <button onClick={handleNextLevel}
                    className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 text-white"
                  >
                    {isZh ? '下一关 →' : 'Next →'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Lose Modal with Revive Option */}
        {gameState === 'lost' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${cardBgClass} rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl`}>
              <div className="text-5xl mb-3">😔</div>
              <h2 className="text-2xl font-bold mb-2">{isZh ? '失误过多！' : 'Too Many Mistakes!'}</h2>
              <p className="text-sm opacity-60 mb-4">
                {isZh ? `完成了 ${moves} 步` : `Made ${moves} moves`}
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={handleRevive}
                  className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 text-white flex items-center justify-center gap-2"
                >
                  <span>💫</span>
                  {isZh ? '继续游戏' : 'Continue'}
                </button>
                <div className="flex gap-3">
                  <button onClick={() => setScreen('levels')}
                    className={`flex-1 py-3 rounded-xl font-bold ${cardBgClass} border ${borderClass}`}
                  >
                    {isZh ? '关卡列表' : 'Levels'}
                  </button>
                  <button onClick={handleRestart}
                    className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-600 text-white"
                  >
                    {isZh ? '再试一次' : 'Retry'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Main render - use conditional rendering AFTER all hooks are called
  return screen === 'levels' ? renderLevelSelect() : renderGame()
}
