// ===== LEVEL GENERATION ALGORITHMS =====
// Each arrow is a PATH with multiple segments (head, body, tail)
// Paths can WIND and TURN through the grid

import type { Direction, LevelData, NumberBlock, Wall, AlgoType, PositionedArrow, PathSegment } from './types'
import { seededRandom } from './utils'
import { DIR_DELTA, ALL_DIRS } from './constants'

// Arrow colors for visual variety
const ARROW_COLORS = 18 // Based on original game's APColor table

// Helper: Get opposite direction
function oppositeDir(dir: Direction): Direction {
  const map: Record<Direction, Direction> = { up: 'down', down: 'up', left: 'right', right: 'left' }
  return map[dir]
}

// Helper: Turn direction 90 degrees
function turnLeft(dir: Direction): Direction {
  const map: Record<Direction, Direction> = { up: 'left', down: 'right', left: 'down', right: 'up' }
  return map[dir]
}

function turnRight(dir: Direction): Direction {
  const map: Record<Direction, Direction> = { up: 'right', down: 'left', left: 'up', right: 'down' }
  return map[dir]
}

// Generate a winding path from start position
// The path winds from head to tail, potentially turning
function generateWindingPath(
  startRow: number,
  startCol: number,
  initialDirection: Direction,
  length: number,
  width: number,
  height: number,
  occupied: Set<string>,
  rand: () => number,
  turnProbability: number = 0.3
): PathSegment[] | null {
  const segments: PathSegment[] = []
  let row = startRow
  let col = startCol
  let dir = initialDirection

  // Head segment at starting position
  segments.push({ row, col, type: 'head' })
  occupied.add(`${row},${col}`)

  // Generate body and tail segments
  for (let i = 1; i < length; i++) {
    // Maybe turn
    if (i > 1 && rand() < turnProbability) {
      const newDir = rand() < 0.5 ? turnLeft(dir) : turnRight(dir)
      const [ndr, ndc] = DIR_DELTA[newDir]
      const nr = row + ndr
      const nc = col + ndc

      // Check if turn is valid
      if (nr >= 0 && nr < height && nc >= 0 && nc < width && !occupied.has(`${nr},${nc}`)) {
        dir = newDir
      }
    }

    const [dr, dc] = DIR_DELTA[dir]
    const nr = row + dr
    const nc = col + dc

    // Check bounds and occupancy
    if (nr < 0 || nr >= height || nc < 0 || nc >= width) {
      // Try to turn
      const leftDir = turnLeft(dir)
      const rightDir = turnRight(dir)
      const [ldr, ldc] = DIR_DELTA[leftDir]
      const [rdr, rdc] = DIR_DELTA[rightDir]

      const leftValid = row + ldr >= 0 && row + ldr < height && col + ldc >= 0 && col + ldc < width && !occupied.has(`${row + ldr},${col + ldc}`)
      const rightValid = row + rdr >= 0 && row + rdr < height && col + rdc >= 0 && col + rdc < width && !occupied.has(`${row + rdr},${col + rdc}`)

      if (leftValid && rightValid) {
        dir = rand() < 0.5 ? leftDir : rightDir
      } else if (leftValid) {
        dir = leftDir
      } else if (rightValid) {
        dir = rightDir
      } else {
        // Can't continue, return partial path or null
        if (segments.length >= 2) {
          segments[segments.length - 1].type = 'tail'
          return segments
        }
        return null
      }

      const [ndr, ndc] = DIR_DELTA[dir]
      row += ndr
      col += ndc
    } else if (occupied.has(`${nr},${nc}`)) {
      // Try to turn
      const leftDir = turnLeft(dir)
      const rightDir = turnRight(dir)
      const [ldr, ldc] = DIR_DELTA[leftDir]
      const [rdr, rdc] = DIR_DELTA[rightDir]

      const leftValid = row + ldr >= 0 && row + ldr < height && col + ldc >= 0 && col + ldc < width && !occupied.has(`${row + ldr},${col + ldc}`)
      const rightValid = row + rdr >= 0 && row + rdr < height && col + rdc >= 0 && col + rdc < width && !occupied.has(`${row + rdr},${col + rdc}`)

      if (leftValid && rightValid) {
        dir = rand() < 0.5 ? leftDir : rightDir
      } else if (leftValid) {
        dir = leftDir
      } else if (rightValid) {
        dir = rightDir
      } else {
        // Can't continue
        if (segments.length >= 2) {
          segments[segments.length - 1].type = 'tail'
          return segments
        }
        return null
      }

      const [ndr, ndc] = DIR_DELTA[dir]
      row += ndr
      col += ndc
    } else {
      row = nr
      col = nc
    }

    // Add segment
    const type: PathSegment['type'] = i === length - 1 ? 'tail' : 'body'
    segments.push({ row, col, type })
    occupied.add(`${row},${col}`)
  }

  return segments
}

// Generate a straight path (no turns)
function generateStraightPath(
  startRow: number,
  startCol: number,
  direction: Direction,
  length: number,
  width: number,
  height: number,
  occupied: Set<string>
): PathSegment[] | null {
  const segments: PathSegment[] = []
  const [dr, dc] = DIR_DELTA[direction]
  let row = startRow
  let col = startCol

  // Head segment
  segments.push({ row, col, type: 'head' })
  occupied.add(`${row},${col}`)

  // Body and tail segments
  for (let i = 1; i < length; i++) {
    row += dr
    col += dc

    if (row < 0 || row >= height || col < 0 || col >= width) {
      if (segments.length >= 2) {
        segments[segments.length - 1].type = 'tail'
        return segments
      }
      return null
    }

    if (occupied.has(`${row},${col}`)) {
      if (segments.length >= 2) {
        segments[segments.length - 1].type = 'tail'
        return segments
      }
      return null
    }

    const type: PathSegment['type'] = i === length - 1 ? 'tail' : 'body'
    segments.push({ row, col, type })
    occupied.add(`${row},${col}`)
  }

  return segments
}

// Helper: Check if a path can exit the grid
function canPathExit(
  headRow: number,
  headCol: number,
  direction: Direction,
  width: number,
  height: number,
  occupied: Set<string>
): boolean {
  const [dr, dc] = DIR_DELTA[direction]
  let r = headRow + dr
  let c = headCol + dc

  while (r >= 0 && r < height && c >= 0 && c < width) {
    if (occupied.has(`${r},${c}`)) return false
    r += dr
    c += dc
  }

  return true
}

// 1. Basic Algorithm - Simple straight horizontal/vertical paths
function basicAlgorithm(
  rand: () => number,
  width: number,
  height: number,
  count: number,
  minLen: number,
  maxLen: number
): PositionedArrow[] {
  const arrows: PositionedArrow[] = []
  const occupied = new Set<string>()

  for (let i = 0; i < count; i++) {
    let placed = false
    for (let attempt = 0; attempt < 100 && !placed; attempt++) {
      const horizontal = rand() < 0.5
      const length = Math.floor(rand() * (maxLen - minLen + 1)) + minLen

      // Choose direction based on orientation
      const direction: Direction = horizontal
        ? (rand() < 0.5 ? 'right' : 'left')
        : (rand() < 0.5 ? 'down' : 'up')

      // Starting position for head
      let headRow: number, headCol: number
      if (horizontal) {
        headRow = Math.floor(rand() * height)
        headCol = direction === 'right' ? Math.floor(rand() * (width - length + 1)) : Math.floor(rand() * (width - length + 1)) + length - 1
      } else {
        headRow = direction === 'down' ? Math.floor(rand() * (height - length + 1)) : Math.floor(rand() * (height - length + 1)) + length - 1
        headCol = Math.floor(rand() * width)
      }

      const key = `${headRow},${headCol}`
      if (occupied.has(key)) continue

      const tempOccupied = new Set(occupied)
      const segments = generateStraightPath(headRow, headCol, direction, length, width, height, tempOccupied)

      if (segments && segments.length >= 2) {
        arrows.push({
          row: headRow,
          col: headCol,
          direction,
          segments,
          colorIndex: Math.floor(rand() * ARROW_COLORS)
        })
        segments.forEach(s => occupied.add(`${s.row},${s.col}`))
        placed = true
      }
    }
  }

  return arrows
}

// 2. Aztec Algorithm - Step/pyramid patterns with turns
function aztecAlgorithm(
  rand: () => number,
  width: number,
  height: number,
  count: number,
  minLen: number,
  maxLen: number
): PositionedArrow[] {
  const arrows: PositionedArrow[] = []
  const occupied = new Set<string>()
  const centerRow = Math.floor(height / 2)
  const centerCol = Math.floor(width / 2)

  // Generate from center outward in layers
  let layer = 0
  const maxLayers = Math.floor(Math.min(width, height) / 2)

  while (arrows.length < count && layer < maxLayers) {
    const startRow = Math.max(0, centerRow - layer)
    const endRow = Math.min(height - 1, centerRow + layer)
    const startCol = Math.max(0, centerCol - layer)
    const endCol = Math.min(width - 1, centerCol + layer)

    // Generate positions on this layer
    const positions: [number, number, Direction][] = []

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        if (r === startRow || r === endRow || c === startCol || c === endCol) {
          const key = `${r},${c}`
          if (occupied.has(key)) continue

          // Determine direction pointing outward from center
          const dr = r - centerRow
          const dc = c - centerCol
          let dir: Direction
          if (Math.abs(dr) > Math.abs(dc)) {
            dir = dr > 0 ? 'down' : 'up'
          } else {
            dir = dc > 0 ? 'right' : 'left'
          }
          positions.push([r, c, dir])
        }
      }
    }

    // Shuffle positions
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[positions[i], positions[j]] = [positions[j], positions[i]]
    }

    // Try to place arrows
    for (const [row, col, dir] of positions) {
      if (arrows.length >= count) break

      const key = `${row},${col}`
      if (occupied.has(key)) continue

      const length = Math.floor(rand() * (maxLen - minLen + 1)) + minLen
      const tempOccupied = new Set(occupied)
      const segments = generateWindingPath(row, col, dir, length, width, height, tempOccupied, rand, 0.4)

      if (segments && segments.length >= 2) {
        // Verify all segments are free
        const allFree = segments.every(s => !occupied.has(`${s.row},${s.col}`))
        if (allFree) {
          arrows.push({
            row,
            col,
            direction: dir,
            segments,
            colorIndex: Math.floor(rand() * ARROW_COLORS)
          })
          segments.forEach(s => occupied.add(`${s.row},${s.col}`))
        }
      }
    }

    layer++
  }

  return arrows
}

// 3. Snake Algorithm - S-shaped winding paths
function snakeAlgorithm(
  rand: () => number,
  width: number,
  height: number,
  count: number,
  minLen: number,
  maxLen: number
): PositionedArrow[] {
  const arrows: PositionedArrow[] = []
  const occupied = new Set<string>()

  // Create snake paths that wind through the grid
  for (let i = 0; i < count; i++) {
    let placed = false
    for (let attempt = 0; attempt < 100 && !placed; attempt++) {
      const startRow = Math.floor(rand() * height)
      const startCol = Math.floor(rand() * width)
      const key = `${startRow},${startCol}`

      if (occupied.has(key)) continue

      const length = Math.floor(rand() * (maxLen - minLen + 1)) + minLen
      const initialDir: Direction = rand() < 0.5 ? 'right' : 'down'

      const tempOccupied = new Set(occupied)
      const segments = generateWindingPath(startRow, startCol, initialDir, length, width, height, tempOccupied, rand, 0.5)

      if (segments && segments.length >= 2) {
        const allFree = segments.every(s => !occupied.has(`${s.row},${s.col}`))
        if (allFree) {
          // Determine final direction based on last two segments
          const lastSeg = segments[segments.length - 1]
          const prevSeg = segments[segments.length - 2]
          let finalDir: Direction = initialDir

          if (lastSeg.row < prevSeg.row) finalDir = 'up'
          else if (lastSeg.row > prevSeg.row) finalDir = 'down'
          else if (lastSeg.col < prevSeg.col) finalDir = 'left'
          else if (lastSeg.col > prevSeg.col) finalDir = 'right'

          arrows.push({
            row: startRow,
            col: startCol,
            direction: finalDir,
            segments,
            colorIndex: Math.floor(rand() * ARROW_COLORS)
          })
          segments.forEach(s => occupied.add(`${s.row},${s.col}`))
          placed = true
        }
      }
    }
  }

  return arrows
}

// 4. Spaghetti Algorithm - Random crossing paths with many turns
function spaghettiAlgorithm(
  rand: () => number,
  width: number,
  height: number,
  count: number,
  minLen: number,
  maxLen: number
): PositionedArrow[] {
  const arrows: PositionedArrow[] = []
  const occupied = new Set<string>()

  for (let i = 0; i < count; i++) {
    let placed = false
    for (let attempt = 0; attempt < 100 && !placed; attempt++) {
      const row = Math.floor(rand() * height)
      const col = Math.floor(rand() * width)
      const key = `${row},${col}`

      if (occupied.has(key)) continue

      const length = Math.floor(rand() * (maxLen - minLen + 1)) + minLen
      const dir = ALL_DIRS[Math.floor(rand() * ALL_DIRS.length)]

      const tempOccupied = new Set(occupied)
      // High turn probability for spaghetti
      const segments = generateWindingPath(row, col, dir, length, width, height, tempOccupied, rand, 0.6)

      if (segments && segments.length >= 2) {
        const allFree = segments.every(s => !occupied.has(`${s.row},${s.col}`))
        if (allFree) {
          arrows.push({
            row,
            col,
            direction: dir,
            segments,
            colorIndex: Math.floor(rand() * ARROW_COLORS)
          })
          segments.forEach(s => occupied.add(`${s.row},${s.col}`))
          placed = true
        }
      }
    }
  }

  return arrows
}

// 5. Loopy Algorithm - Circular patterns
function loopyAlgorithm(
  rand: () => number,
  width: number,
  height: number,
  count: number,
  minLen: number,
  maxLen: number
): PositionedArrow[] {
  const arrows: PositionedArrow[] = []
  const occupied = new Set<string>()
  const centerRow = Math.floor(height / 2)
  const centerCol = Math.floor(width / 2)

  // Generate arrows in circular patterns
  for (let radius = 1; arrows.length < count && radius < Math.floor(Math.min(width, height) / 2); radius++) {
    const circumference = 2 * Math.PI * radius
    const arrowsInCircle = Math.min(Math.floor(circumference / 2), count - arrows.length)

    for (let i = 0; i < arrowsInCircle && arrows.length < count; i++) {
      const angle = (i / arrowsInCircle) * Math.PI * 2
      const row = Math.round(centerRow + Math.sin(angle) * radius)
      const col = Math.round(centerCol + Math.cos(angle) * radius)

      if (row < 0 || row >= height || col < 0 || col >= width) continue

      const key = `${row},${col}`
      if (occupied.has(key)) continue

      // Direction tangent to circle
      const tanAngle = angle + Math.PI / 2
      let dir: Direction
      if (Math.abs(Math.sin(tanAngle)) > Math.abs(Math.cos(tanAngle))) {
        dir = Math.sin(tanAngle) > 0 ? 'down' : 'up'
      } else {
        dir = Math.cos(tanAngle) > 0 ? 'right' : 'left'
      }

      const length = Math.floor(rand() * (maxLen - minLen + 1)) + minLen
      const tempOccupied = new Set(occupied)
      // Medium turn probability for loopy
      const segments = generateWindingPath(row, col, dir, length, width, height, tempOccupied, rand, 0.35)

      if (segments && segments.length >= 2) {
        const allFree = segments.every(s => !occupied.has(`${s.row},${s.col}`))
        if (allFree) {
          arrows.push({
            row,
            col,
            direction: dir,
            segments,
            colorIndex: Math.floor(rand() * ARROW_COLORS)
          })
          segments.forEach(s => occupied.add(`${s.row},${s.col}`))
        }
      }
    }
  }

  return arrows
}

// 6. Country Algorithm - Natural irregular paths
function countryAlgorithm(
  rand: () => number,
  width: number,
  height: number,
  count: number,
  minLen: number,
  maxLen: number
): PositionedArrow[] {
  const arrows: PositionedArrow[] = []
  const occupied = new Set<string>()

  for (let i = 0; i < count; i++) {
    let placed = false
    for (let attempt = 0; attempt < 100 && !placed; attempt++) {
      const row = Math.floor(rand() * height)
      const col = Math.floor(rand() * width)
      const key = `${row},${col}`

      if (occupied.has(key)) continue

      const length = Math.floor(rand() * (maxLen - minLen + 1)) + minLen

      // Random direction with some bias toward edges
      const dirs: Direction[] = ['up', 'down', 'left', 'right']
      const weights = [1, 1, 1, 1]
      if (row < height / 3) weights[0] = 2
      if (row > height * 2 / 3) weights[1] = 2
      if (col < width / 3) weights[2] = 2
      if (col > width * 2 / 3) weights[3] = 2

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

      const tempOccupied = new Set(occupied)
      // Lower turn probability for more natural flowing paths
      const segments = generateWindingPath(row, col, dir, length, width, height, tempOccupied, rand, 0.25)

      if (segments && segments.length >= 2) {
        const allFree = segments.every(s => !occupied.has(`${s.row},${s.col}`))
        if (allFree) {
          arrows.push({
            row,
            col,
            direction: dir,
            segments,
            colorIndex: Math.floor(rand() * ARROW_COLORS)
          })
          segments.forEach(s => occupied.add(`${s.row},${s.col}`))
          placed = true
        }
      }
    }
  }

  return arrows
}

// Algorithm dispatcher
function runAlgorithm(
  algo: AlgoType,
  rand: () => number,
  width: number,
  height: number,
  count: number,
  minLen: number,
  maxLen: number
): PositionedArrow[] {
  switch (algo) {
    case 'basic': return basicAlgorithm(rand, width, height, count, minLen, maxLen)
    case 'aztec': return aztecAlgorithm(rand, width, height, count, minLen, maxLen)
    case 'snake': return snakeAlgorithm(rand, width, height, count, minLen, maxLen)
    case 'spaghetti': return spaghettiAlgorithm(rand, width, height, count, minLen, maxLen)
    case 'loopy': return loopyAlgorithm(rand, width, height, count, minLen, maxLen)
    case 'country': return countryAlgorithm(rand, width, height, count, minLen, maxLen)
    default: return basicAlgorithm(rand, width, height, count, minLen, maxLen)
  }
}

// Level configuration based on original game analysis
interface LevelConfig {
  width: number
  height: number
  arrowCount: number
  algorithms: AlgoType[]
}

// Original game's 100 levels configuration
const LEVEL_CONFIGS: LevelConfig[] = [
  // Level 1-10
  { width: 8, height: 10, arrowCount: 6, algorithms: ['loopy', 'country'] },
  { width: 25, height: 38, arrowCount: 72, algorithms: ['spaghetti', 'aztec'] },
  { width: 41, height: 53, arrowCount: 158, algorithms: ['loopy', 'snake'] },
  { width: 20, height: 27, arrowCount: 47, algorithms: ['aztec', 'basic'] },
  { width: 25, height: 38, arrowCount: 80, algorithms: ['spaghetti', 'aztec'] },
  { width: 20, height: 25, arrowCount: 24, algorithms: ['aztec'] },
  { width: 25, height: 38, arrowCount: 73, algorithms: ['spaghetti', 'aztec'] },
  { width: 27, height: 41, arrowCount: 132, algorithms: ['basic', 'snake'] },
  { width: 25, height: 38, arrowCount: 88, algorithms: ['spaghetti', 'aztec'] },
  { width: 27, height: 43, arrowCount: 115, algorithms: ['aztec', 'basic'] },
  // Level 11-20
  { width: 20, height: 24, arrowCount: 46, algorithms: ['snake', 'aztec'] },
  { width: 20, height: 22, arrowCount: 36, algorithms: ['loopy'] },
  { width: 39, height: 57, arrowCount: 176, algorithms: ['spaghetti', 'aztec'] },
  { width: 27, height: 37, arrowCount: 128, algorithms: ['spaghetti', 'spaghetti'] },
  { width: 25, height: 38, arrowCount: 77, algorithms: ['spaghetti', 'aztec'] },
  { width: 25, height: 40, arrowCount: 120, algorithms: ['basic', 'snake'] },
  { width: 25, height: 38, arrowCount: 69, algorithms: ['spaghetti', 'aztec'] },
  { width: 37, height: 48, arrowCount: 184, algorithms: ['loopy', 'snake'] },
  { width: 25, height: 38, arrowCount: 101, algorithms: ['spaghetti', 'aztec'] },
  { width: 30, height: 50, arrowCount: 119, algorithms: ['spaghetti', 'aztec'] },
  // Level 21-30
  { width: 25, height: 38, arrowCount: 66, algorithms: ['aztec'] },
  { width: 20, height: 21, arrowCount: 47, algorithms: ['snake', 'basic'] },
  { width: 31, height: 47, arrowCount: 129, algorithms: ['loopy', 'snake'] },
  { width: 31, height: 44, arrowCount: 121, algorithms: ['loopy', 'snake'] },
  { width: 38, height: 63, arrowCount: 196, algorithms: ['loopy', 'snake'] },
  { width: 25, height: 38, arrowCount: 90, algorithms: ['spaghetti', 'aztec'] },
  { width: 27, height: 43, arrowCount: 122, algorithms: ['loopy', 'country'] },
  { width: 20, height: 26, arrowCount: 39, algorithms: ['country'] },
  { width: 28, height: 46, arrowCount: 134, algorithms: ['snake', 'basic'] },
  { width: 28, height: 46, arrowCount: 122, algorithms: ['aztec', 'basic'] },
  // Level 31-40
  { width: 27, height: 28, arrowCount: 70, algorithms: ['spaghetti', 'aztec'] },
  { width: 27, height: 28, arrowCount: 58, algorithms: ['loopy', 'snake'] },
  { width: 20, height: 28, arrowCount: 49, algorithms: ['aztec'] },
  { width: 27, height: 28, arrowCount: 57, algorithms: ['loopy', 'snake'] },
  { width: 20, height: 27, arrowCount: 53, algorithms: ['basic', 'aztec'] },
  { width: 28, height: 45, arrowCount: 136, algorithms: ['spaghetti', 'aztec'] },
  { width: 42, height: 45, arrowCount: 167, algorithms: ['loopy', 'snake'] },
  { width: 20, height: 31, arrowCount: 42, algorithms: ['basic'] },
  { width: 29, height: 37, arrowCount: 111, algorithms: ['basic', 'snake'] },
  { width: 29, height: 44, arrowCount: 125, algorithms: ['loopy', 'country'] },
  // Level 41-50
  { width: 29, height: 46, arrowCount: 146, algorithms: ['aztec', 'basic'] },
  { width: 20, height: 31, arrowCount: 47, algorithms: ['spaghetti', 'aztec'] },
  { width: 30, height: 34, arrowCount: 82, algorithms: ['spaghetti', 'aztec'] },
  { width: 32, height: 42, arrowCount: 182, algorithms: ['basic', 'aztec'] },
  { width: 20, height: 31, arrowCount: 68, algorithms: ['basic', 'snake'] },
  { width: 20, height: 31, arrowCount: 66, algorithms: ['basic', 'snake'] },
  { width: 20, height: 32, arrowCount: 52, algorithms: ['aztec', 'spaghetti'] },
  { width: 21, height: 24, arrowCount: 39, algorithms: ['aztec'] },
  { width: 30, height: 41, arrowCount: 112, algorithms: ['snake', 'basic'] },
  { width: 20, height: 32, arrowCount: 60, algorithms: ['basic', 'snake'] },
  // Level 51-60
  { width: 20, height: 32, arrowCount: 61, algorithms: ['basic', 'aztec'] },
  { width: 20, height: 32, arrowCount: 63, algorithms: ['basic', 'snake'] },
  { width: 32, height: 47, arrowCount: 166, algorithms: ['basic', 'snake'] },
  { width: 29, height: 48, arrowCount: 129, algorithms: ['aztec', 'basic'] },
  { width: 30, height: 35, arrowCount: 126, algorithms: ['basic', 'aztec'] },
  { width: 22, height: 23, arrowCount: 52, algorithms: ['aztec', 'spaghetti'] },
  { width: 30, height: 41, arrowCount: 126, algorithms: ['snake', 'basic'] },
  { width: 32, height: 47, arrowCount: 187, algorithms: ['basic', 'snake'] },
  { width: 20, height: 32, arrowCount: 75, algorithms: ['basic', 'snake'] },
  { width: 20, height: 32, arrowCount: 71, algorithms: ['basic', 'snake'] },
  // Level 61-70
  { width: 22, height: 26, arrowCount: 49, algorithms: ['aztec', 'basic'] },
  { width: 20, height: 32, arrowCount: 69, algorithms: ['basic', 'snake'] },
  { width: 30, height: 41, arrowCount: 113, algorithms: ['snake', 'basic'] },
  { width: 30, height: 41, arrowCount: 133, algorithms: ['basic', 'snake'] },
  { width: 30, height: 41, arrowCount: 148, algorithms: ['snake', 'basic'] },
  { width: 30, height: 41, arrowCount: 143, algorithms: ['snake', 'basic'] },
  { width: 22, height: 26, arrowCount: 64, algorithms: ['aztec', 'spaghetti'] },
  { width: 22, height: 29, arrowCount: 55, algorithms: ['aztec', 'basic'] },
  { width: 30, height: 41, arrowCount: 136, algorithms: ['basic', 'snake'] },
  { width: 20, height: 32, arrowCount: 84, algorithms: ['basic', 'snake'] },
  // Level 71-80
  { width: 21, height: 29, arrowCount: 71, algorithms: ['aztec', 'spaghetti'] },
  { width: 32, height: 49, arrowCount: 186, algorithms: ['basic', 'snake'] },
  { width: 20, height: 33, arrowCount: 80, algorithms: ['basic', 'aztec'] },
  { width: 23, height: 23, arrowCount: 48, algorithms: ['country', 'loopy'] },
  { width: 30, height: 42, arrowCount: 109, algorithms: ['basic', 'snake'] },
  { width: 21, height: 34, arrowCount: 66, algorithms: ['loopy'] },
  { width: 30, height: 47, arrowCount: 117, algorithms: ['loopy'] },
  { width: 21, height: 34, arrowCount: 65, algorithms: ['loopy'] },
  { width: 30, height: 49, arrowCount: 157, algorithms: ['aztec', 'spaghetti'] },
  { width: 33, height: 50, arrowCount: 187, algorithms: ['basic', 'snake'] },
  // Level 81-90
  { width: 23, height: 23, arrowCount: 55, algorithms: ['country', 'loopy'] },
  { width: 21, height: 30, arrowCount: 79, algorithms: ['basic', 'basic'] },
  { width: 31, height: 31, arrowCount: 130, algorithms: ['basic', 'snake'] },
  { width: 21, height: 34, arrowCount: 72, algorithms: ['loopy'] },
  { width: 21, height: 34, arrowCount: 67, algorithms: ['loopy'] },
  { width: 23, height: 29, arrowCount: 39, algorithms: ['loopy'] },
  { width: 31, height: 31, arrowCount: 126, algorithms: ['basic', 'snake'] },
  { width: 22, height: 23, arrowCount: 53, algorithms: ['snake', 'spaghetti'] },
  { width: 23, height: 23, arrowCount: 60, algorithms: ['country', 'loopy'] },
  { width: 30, height: 50, arrowCount: 110, algorithms: ['snake', 'aztec'] },
  // Level 91-100
  { width: 33, height: 53, arrowCount: 182, algorithms: ['spaghetti', 'spaghetti'] },
  { width: 31, height: 40, arrowCount: 132, algorithms: ['aztec', 'spaghetti'] },
  { width: 34, height: 52, arrowCount: 188, algorithms: ['basic'] },
  { width: 22, height: 26, arrowCount: 70, algorithms: ['basic', 'snake'] },
  { width: 22, height: 27, arrowCount: 66, algorithms: ['basic'] },
  { width: 31, height: 31, arrowCount: 139, algorithms: ['basic', 'snake'] },
  { width: 31, height: 39, arrowCount: 151, algorithms: ['basic', 'aztec'] },
  { width: 23, height: 29, arrowCount: 43, algorithms: ['loopy'] },
  { width: 22, height: 27, arrowCount: 72, algorithms: ['aztec', 'basic'] },
  { width: 23, height: 29, arrowCount: 54, algorithms: ['basic', 'aztec'] },
]

// Generate level from config
function generateLevelFromConfig(levelNum: number, config: LevelConfig, rand: () => number): LevelData {
  const { width, height, arrowCount, algorithms } = config
  const gridSize = Math.max(width, height)

  // Determine chapter based on level
  let chapter = 1
  if (levelNum > 25) chapter = 2
  if (levelNum > 50) chapter = 3
  if (levelNum > 75) chapter = 4

  // Calculate path length based on grid size and arrow count
  // Target: fill about 70-80% of the grid
  const totalCells = width * height
  const targetFill = Math.floor(totalCells * 0.75)
  const avgPathLength = Math.max(3, Math.floor(targetFill / arrowCount))

  const minLen = Math.max(3, avgPathLength - 2)
  const maxLen = Math.min(avgPathLength + 3, Math.floor(Math.min(width, height) * 0.6))

  // Combine algorithms
  const allArrows: PositionedArrow[] = []
  const occupied = new Set<string>()

  const perAlgo = Math.ceil(arrowCount / algorithms.length)

  for (const algo of algorithms) {
    if (allArrows.length >= arrowCount) break
    const remaining = arrowCount - allArrows.length
    const thisCount = Math.min(perAlgo, remaining)

    const arrows = runAlgorithm(rand, width, height, thisCount, minLen, maxLen)

    for (const arrow of arrows) {
      if (allArrows.length >= arrowCount) break
      const headKey = `${arrow.row},${arrow.col}`
      if (!occupied.has(headKey)) {
        allArrows.push(arrow)
        arrow.segments.forEach(s => occupied.add(`${s.row},${s.col}`))
      }
    }
  }

  // Convert to LevelData format
  const arrows: LevelData['arrows'] = allArrows.map(a => ({
    row: a.row,
    col: a.col,
    direction: a.direction,
    segments: a.segments,
    colorIndex: a.colorIndex
  }))

  return {
    id: levelNum,
    name: `Level ${levelNum}`,
    nameZh: `第${levelNum}关`,
    gridSize,
    arrows,
    maxMistakes: 3,
    chapter,
    algorithm: algorithms[0],
  }
}

export function getLevel(levelNum: number): LevelData {
  const configIndex = Math.min(levelNum - 1, LEVEL_CONFIGS.length - 1)
  const config = LEVEL_CONFIGS[configIndex]
  const rand = seededRandom(levelNum * 12345)
  return generateLevelFromConfig(levelNum, config, rand)
}

export function getDailyChallengeLevel(): LevelData {
  const today = new Date()
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  const configIndex = seed % LEVEL_CONFIGS.length
  const config = LEVEL_CONFIGS[configIndex]
  const rand = seededRandom(seed * 7919)
  return generateLevelFromConfig(seed % 100 + 1, config, rand)
}

// ===== SOLVER (for hints) =====
export function findSolution(level: LevelData): number[] | null {
  const arrows = level.arrows.map((a, i) => ({ ...a, id: i }))
  const occupied = new Set<string>()

  // Mark all segments as occupied
  arrows.forEach(a => {
    a.segments.forEach(s => occupied.add(`${s.row},${s.col}`))
  })

  if (level.walls) level.walls.forEach(w => occupied.add(`${w.row},${w.col}`))

  const nbState: Map<string, number> = new Map()
  if (level.numberBlocks) {
    level.numberBlocks.forEach(b => nbState.set(`${b.row},${b.col}`, b.maxHits))
  }

  function canArrowExit(arrow: typeof arrows[0], occ: Set<string>, nb: Map<string, number>): boolean {
    const [dr, dc] = DIR_DELTA[arrow.direction]
    let r = arrow.row + dr
    let c = arrow.col + dc

    while (r >= 0 && r < level.gridSize && c >= 0 && c < level.gridSize) {
      const key = `${r},${c}`
      if (occ.has(key)) {
        if (nb.has(key) && nb.get(key) === 0) {
          // cleared block, pass through
        } else {
          return false
        }
      }
      r += dr
      c += dc
    }
    return true
  }

  function solve(remaining: typeof arrows, order: number[]): number[] | null {
    if (remaining.length === 0) return order

    for (let i = 0; i < remaining.length; i++) {
      const arrow = remaining[i]
      if (canArrowExit(arrow, occupied, nbState)) {
        // Remove all segments of this arrow from occupied
        arrow.segments.forEach(s => occupied.delete(`${s.row},${s.col}`))
        const newRemaining = remaining.filter((_, j) => j !== i)
        const result = solve(newRemaining, [...order, arrow.id])
        if (result) return result
        // Restore segments
        arrow.segments.forEach(s => occupied.add(`${s.row},${s.col}`))
      }
    }
    return null
  }

  return solve(arrows, [])
}
