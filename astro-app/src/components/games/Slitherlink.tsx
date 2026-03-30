import { useState, useCallback, useEffect } from 'react'
import GameGuide from './GameGuide'

type Difficulty = 'easy' | 'normal' | 'hard'
type EdgeState = 'none' | 'on'

interface Stats {
  played: number
  completed: number
}

const STATS_KEY = 'slitherlink_stats'

const DIFFICULTY_CONFIG: Record<Difficulty, { size: number }> = {
  easy: { size: 5 },
  normal: { size: 7 },
  hard: { size: 10 },
}

function loadStats(): Stats {
  try {
    const data = localStorage.getItem(STATS_KEY)
    return data ? JSON.parse(data) : { played: 0, completed: 0 }
  } catch {
    return { played: 0, completed: 0 }
  }
}

function saveStats(stats: Stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats))
}

function seededRandom(seed: number) {
  let s = seed
  return function() {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

function getDailySeed(): number {
  const startDate = new Date('2024-01-01').getTime()
  const now = new Date().setHours(0, 0, 0, 0)
  return Math.floor((now - startDate) / 86400000)
}

// Generate a random loop using a random walk that creates varied shapes
function generateRandomLoop(size: number, rng: () => number): { row: number; col: number }[] {
  // We'll create a loop on the grid vertices (0..size x 0..size)
  // Strategy: start from a random point near center, do a random walk,
  // then connect back to form a loop
  const maxR = size
  const maxC = size

  // Start from a random vertex not on the very edge
  const startR = 1 + Math.floor(rng() * (maxR - 2))
  const startC = 1 + Math.floor(rng() * (maxC - 2))

  // Random walk to build a path, then close it into a loop
  const visited = new Set<string>()
  const path: { row: number; col: number }[] = [{ row: startR, col: startC }]
  visited.add(`${startR},${startC}`)

  const dirs = [
    { dr: -1, dc: 0 }, // up
    { dr: 1, dc: 0 },  // down
    { dr: 0, dc: -1 }, // left
    { dr: 0, dc: 1 },  // right
  ]

  let current = { row: startR, col: startC }
  const maxSteps = size * size * 2

  for (let step = 0; step < maxSteps; step++) {
    // Shuffle directions
    const shuffled = [...dirs].sort(() => rng() - 0.5)
    let moved = false

    for (const { dr, dc } of shuffled) {
      const nr = current.row + dr
      const nc = current.col + dc

      // Check bounds
      if (nr < 0 || nr > maxR || nc < 0 || nc > maxC) continue

      // Check if we can close the loop back to start (need at least 4 steps)
      if (path.length >= 4 && nr === startR && nc === startC) {
        path.push({ row: nr, col: nc })
        return path
      }

      // Don't revisit
      if (visited.has(`${nr},${nc}`)) continue

      // Check that this step won't create a self-intersection
      // (edge from current to nr,nc shouldn't cross any existing edge)
      let edgeCrosses = false
      for (let i = 0; i < path.length - 1; i++) {
        const a = path[i]
        const b = path[i + 1]
        // Check if edge (current->nr,nc) crosses edge (a->b)
        if (edgesCross(current.row, current.col, nr, nc, a.row, a.col, b.row, b.col)) {
          edgeCrosses = true
          break
        }
      }
      if (edgeCrosses) continue

      // Also check that closing edge from this new point back to start wouldn't cross
      // We'll check this when we actually try to close

      path.push({ row: nr, col: nc })
      visited.add(`${nr},${nc}`)
      current = { row: nr, col: nc }
      moved = true
      break
    }

    if (!moved) {
      // Backtrack
      if (path.length <= 2) break
      const removed = path.pop()!
      visited.delete(`${removed.row},${removed.col}`)
      current = path[path.length - 1]
    }
  }

  // If we didn't close the loop, force-close it by connecting back
  if (path.length >= 4 && (path[path.length - 1].row !== startR || path[path.length - 1].col !== startC)) {
    // Try to find a non-crossing path back
    path.push({ row: startR, col: startC })
  }

  return path
}

// Check if two edges cross each other
function edgesCross(
  r1: number, c1: number, r2: number, c2: number,
  r3: number, c3: number, r4: number, c4: number
): boolean {
  // An edge is either horizontal (same row, adjacent cols) or vertical (same col, adjacent rows)
  // Two edges cross if one is horizontal and one is vertical and they share no endpoints
  const horiz1 = r1 === r2 && Math.abs(c1 - c2) === 1
  const vert1 = c1 === c2 && Math.abs(r1 - r2) === 1
  const horiz2 = r3 === r4 && Math.abs(c3 - c4) === 1
  const vert2 = c3 === c4 && Math.abs(r3 - r4) === 1

  if (horiz1 && vert2) {
    // H edge spans c1..c2, V edge is at col c3
    const minC = Math.min(c1, c2)
    const maxC = Math.max(c1, c2)
    const minR = Math.min(r3, r4)
    const maxR = Math.max(r3, r4)
    return c3 > minC && c3 < maxC && r1 > minR && r1 < maxR
  }
  if (vert1 && horiz2) {
    const minC = Math.min(c3, c4)
    const maxC = Math.max(c3, c4)
    const minR = Math.min(r1, r2)
    const maxR = Math.max(r1, r2)
    return c1 > minC && c1 < maxC && r3 > minR && r3 < maxR
  }
  return false
}

// Convert a loop path into solution edges
function pathToEdges(
  path: { row: number; col: number }[],
  size: number
): EdgeState[][][] {
  const solution: EdgeState[][][] = Array(size + 1).fill(null).map(() =>
    Array(size + 1).fill(null).map(() => ({ right: 'none' as EdgeState, down: 'none' as EdgeState }))
  )

  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i]
    const b = path[i + 1]

    if (a.row === b.row) {
      // Horizontal edge
      const minC = Math.min(a.col, b.col)
      const maxC = Math.max(a.col, b.col)
      for (let c = minC; c < maxC; c++) {
        if (a.row <= size && c <= size) {
          solution[a.row][c].right = 'on'
        }
      }
    } else {
      // Vertical edge
      const minR = Math.min(a.row, b.row)
      const maxR = Math.max(a.row, b.row)
      for (let r = minR; r < maxR; r++) {
        if (r <= size && a.col <= size) {
          solution[r][a.col].down = 'on'
        }
      }
    }
  }

  return solution
}

// Generate varied puzzle with interesting loop shapes
function generatePuzzle(size: number, rng: () => number): { clues: number[][], solution: EdgeState[][][] } {
  const clues = Array(size).fill(null).map(() => Array(size).fill(-1))

  // Try multiple times to generate a valid loop
  let path: { row: number; col: number }[] = []
  let attempts = 0
  const minLoopLength = Math.max(8, size * 2)

  while (path.length < minLoopLength && attempts < 20) {
    path = generateRandomLoop(size, rng)
    attempts++
  }

  // Fallback: if random walk didn't produce a good loop, create a varied polygon
  if (path.length < minLoopLength) {
    const margin = 1
    const points: { row: number; col: number }[] = []

    // Create an irregular polygon
    const topRow = margin + Math.floor(rng() * 2)
    const bottomRow = size - margin - Math.floor(rng() * 2)
    const leftCol = margin + Math.floor(rng() * 2)
    const rightCol = size - margin - Math.floor(rng() * 2)

    // Top edge with a bump
    const topBump = Math.floor((rightCol - leftCol) * 0.3 + rng() * (rightCol - leftCol) * 0.4)
    const topBumpDepth = Math.floor(1 + rng() * 2)

    // Right edge with a bump
    const rightBump = Math.floor((bottomRow - topRow) * 0.3 + rng() * (bottomRow - topRow) * 0.4)
    const rightBumpDepth = Math.floor(1 + rng() * 2)

    // Build path clockwise with bumps
    // Top-left to top-bump-start
    for (let c = leftCol; c <= leftCol + topBump; c++) points.push({ row: topRow, col: c })
    // Top bump (goes up then back down)
    if (topBumpDepth > 0 && topRow - topBumpDepth >= 0) {
      for (let r = topRow - 1; r >= topRow - topBumpDepth; r--) points.push({ row: r, col: leftCol + topBump })
      for (let c = leftCol + topBump + 1; c <= leftCol + topBump + topBumpDepth && c <= rightCol; c++) points.push({ row: topRow - topBumpDepth, col: c })
      for (let r = topRow - topBumpDepth + 1; r <= topRow; r++) points.push({ row: r, col: Math.min(leftCol + topBump + topBumpDepth, rightCol) })
    }
    // Continue top edge to top-right
    const resumeCol = Math.min(leftCol + topBump + topBumpDepth + 1, rightCol)
    for (let c = resumeCol; c <= rightCol; c++) points.push({ row: topRow, col: c })

    // Right edge to right-bump-start
    for (let r = topRow + 1; r <= topRow + rightBump; r++) points.push({ row: r, col: rightCol })
    // Right bump (goes right then back left)
    if (rightBumpDepth > 0 && rightCol + rightBumpDepth <= size) {
      for (let c = rightCol + 1; c <= rightCol + rightBumpDepth; c++) points.push({ row: topRow + rightBump, col: c })
      for (let r = topRow + rightBump + 1; r <= topRow + rightBump + rightBumpDepth && r <= bottomRow; r++) points.push({ row: r, col: rightCol + rightBumpDepth })
      for (let c = rightCol + rightBumpDepth - 1; c >= rightCol; c--) points.push({ row: Math.min(topRow + rightBump + rightBumpDepth, bottomRow), col: c })
    }
    // Continue right edge to bottom-right
    const resumeRow = Math.min(topRow + rightBump + rightBumpDepth + 1, bottomRow)
    for (let r = resumeRow; r <= bottomRow; r++) points.push({ row: r, col: rightCol })

    // Bottom edge
    for (let c = rightCol - 1; c >= leftCol; c--) points.push({ row: bottomRow, col: c })
    // Left edge
    for (let r = bottomRow - 1; r >= topRow; r--) points.push({ row: r, col: leftCol })

    path = points
  }

  const solution = pathToEdges(path, size)

  // Calculate clue numbers for each cell
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      let count = 0
      if (solution[r][c].right === 'on') count++
      if (solution[r][c].down === 'on') count++
      if (r > 0 && solution[r - 1][c].down === 'on') count++
      if (c > 0 && solution[r][c - 1].right === 'on') count++

      // Only show some clues to make it a puzzle
      if (count > 0 && rng() < 0.6) {
        clues[r][c] = count
      }
    }
  }

  return { clues, solution }
}

export default function Slitherlink({ settings, onBack }: { settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }; onBack: () => void }) {
  const [clues, setClues] = useState<number[][]>([])
  const [edges, setEdges] = useState<EdgeState[][][]>([])
  const [solution, setSolution] = useState<EdgeState[][][]>([])
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [isComplete, setIsComplete] = useState(false)
  const [stats, setStats] = useState<Stats>(loadStats)
  const [showGameGuide, setShowGameGuide] = useState(false)

  const config = DIFFICULTY_CONFIG[difficulty]
  const { size } = config

  const t = {
    title: '⭕ Slitherlink',
    newGame: settings.language === 'zh' ? '新游戏' : 'New Game',
    complete: settings.language === 'zh' ? '恭喜完成！' : 'Puzzle Complete!',
    difficulty: settings.language === 'zh' ? '难度' : 'Difficulty',
    easy: settings.language === 'zh' ? '简单' : 'Easy',
    normal: settings.language === 'zh' ? '普通' : 'Normal',
    hard: settings.language === 'zh' ? '困难' : 'Hard',
    stats: settings.language === 'zh' ? '统计' : 'Stats',
    played: settings.language === 'zh' ? '已玩' : 'Played',
    completed: settings.language === 'zh' ? '完成' : 'Completed',
  }

  const initializeGame = useCallback(() => {
    const seed = getDailySeed() + Object.keys(DIFFICULTY_CONFIG).indexOf(difficulty) * 1000
    const rng = seededRandom(seed)
    const { clues: newClues, solution: newSolution } = generatePuzzle(size, rng)

    setClues(newClues)
    setSolution(newSolution)
    setEdges(Array(size + 1).fill(null).map(() =>
      Array(size + 1).fill(null).map(() => ({ right: 'none' as EdgeState, down: 'none' as EdgeState }))
    ))
    setIsComplete(false)
  }, [difficulty, size])

  useEffect(() => {
    initializeGame()
  }, [])

  const checkComplete = useCallback((currentEdges: EdgeState[][][]): boolean => {
    for (let r = 0; r <= size; r++) {
      for (let c = 0; c <= size; c++) {
        if (r < size && currentEdges[r][c].right !== solution[r][c].right) return false
        if (c < size && currentEdges[r][c].down !== solution[r][c].down) return false
      }
    }
    return true
  }, [solution, size])

  const toggleEdge = (r: number, c: number, direction: 'right' | 'down') => {
    if (isComplete) return

    setEdges(prev => {
      const newEdges = prev.map(row => row.map(cell => ({ ...cell })))
      const current = newEdges[r][c][direction]
      newEdges[r][c][direction] = current === 'on' ? 'none' : 'on'

      if (checkComplete(newEdges)) {
        setIsComplete(true)
        const newStats = { ...stats, played: stats.played + 1, completed: stats.completed + 1 }
        setStats(newStats)
        saveStats(newStats)
      }

      return newEdges
    })
  }

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'
  const borderClass = settings.darkMode ? 'border-gray-700' : 'border-gray-300'

  const cellSize = size <= 5 ? 64 : size <= 7 ? 52 : 40

  return (
    <div className={`min-h-screen flex flex-col ${bgClass} ${textClass}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 ${cardBgClass} border-b ${borderClass} p-3`}>
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-500/20">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold">{t.title}</h1>
          <button onClick={() => setShowGameGuide(true)} className="p-2 rounded-lg hover:bg-gray-500/20">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {/* Difficulty */}
          <div className="flex gap-2 mb-4 justify-center">
            {(['easy', 'normal', 'hard'] as Difficulty[]).map(d => (
              <button
                key={d}
                onClick={() => { setDifficulty(d); initializeGame() }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  difficulty === d ? 'bg-blue-600 text-white' : `${cardBgClass} border ${borderClass}`
                }`}
              >
                {t[d]}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="flex justify-center mb-4">
            <div className={`relative p-2 rounded-xl shadow-2xl ${settings.darkMode ? 'bg-gradient-to-br from-slate-700 to-slate-900' : 'bg-gradient-to-br from-gray-200 to-gray-300'}`} style={{ width: size * cellSize + 20, height: size * cellSize + 20 }}>
              {/* Clues */}
              {clues.map((row, r) =>
                row.map((clue, c) => (
                  <div
                    key={`c-${r}-${c}`}
                    className="absolute flex items-center justify-center font-bold text-xl"
                    style={{
                      left: c * cellSize + 2,
                      top: r * cellSize + 2,
                      width: cellSize - 4,
                      height: cellSize - 4,
                    }}
                  >
                    {clue >= 0 && (
                      <span className={clue === 0 ? 'text-gray-400' : clue === 3 ? 'text-green-600' : ''}>{clue}</span>
                    )}
                  </div>
                ))
              )}

              {/* Horizontal edges */}
              {edges.map((row, r) =>
                row.map((cell, c) => (
                  c < size && (
                    <div
                      key={`h-${r}-${c}`}
                      onClick={() => toggleEdge(r, c, 'right')}
                      className="absolute cursor-pointer"
                      style={{
                        left: c * cellSize,
                        top: r * cellSize - 7,
                        width: cellSize,
                        height: 14,
                      }}
                    >
                      <div className={`h-full w-full rounded transition-all ${
                        cell.right === 'on' ? 'bg-gradient-to-r from-blue-400 to-blue-600 shadow-md shadow-blue-500/50' : 'bg-transparent hover:bg-blue-200 dark:hover:bg-blue-800'
                      }`} />
                    </div>
                  )
                ))
              )}

              {/* Vertical edges */}
              {edges.map((row, r) =>
                row.map((cell, c) => (
                  r < size && (
                    <div
                      key={`v-${r}-${c}`}
                      onClick={() => toggleEdge(r, c, 'down')}
                      className="absolute cursor-pointer"
                      style={{
                        left: c * cellSize - 7,
                        top: r * cellSize,
                        width: 14,
                        height: cellSize,
                      }}
                    >
                      <div className={`h-full w-full rounded transition-all ${
                        cell.down === 'on' ? 'bg-gradient-to-b from-blue-400 to-blue-600 shadow-md shadow-blue-500/50' : 'bg-transparent hover:bg-blue-200 dark:hover:bg-blue-800'
                      }`} />
                    </div>
                  )
                ))
              )}

              {/* Dots at vertices */}
              {edges.map((row, r) =>
                row.map((_, c) => (
                  <div
                    key={`d-${r}-${c}`}
                    className={`absolute rounded-full shadow-md ${settings.darkMode ? 'bg-gradient-to-br from-slate-200 to-slate-400' : 'bg-gradient-to-br from-gray-700 to-gray-900'}`}
                    style={{
                      left: c * cellSize + 3,
                      top: r * cellSize + 3,
                      width: 10,
                      height: 10,
                    }}
                  />
                ))
              )}
            </div>
          </div>

          {/* New Game */}
          <div className="flex justify-center mb-4">
            <button
              onClick={initializeGame}
              className={`px-6 py-2 rounded-lg font-medium ${settings.darkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-500'} text-white`}
            >
              {t.newGame}
            </button>
          </div>

          {/* Stats */}
          <div className={`${cardBgClass} rounded-xl p-4 border ${borderClass} max-w-xs mx-auto`}>
            <div className="text-center text-sm opacity-60 mb-2">{t.stats}</div>
            <div className="flex justify-around">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.played}</div>
                <div className="text-xs opacity-60">{t.played}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
                <div className="text-xs opacity-60">{t.completed}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Message */}
      {isComplete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className={`${cardBgClass} rounded-xl p-6 text-center mx-4`}>
            <div className="text-4xl mb-3">🎉⭕</div>
            <div className="text-xl font-bold text-green-500 mb-4">{t.complete}</div>
            <button
              onClick={initializeGame}
              className={`px-6 py-2 rounded-lg font-medium ${settings.darkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-500'} text-white`}
            >
              {t.newGame}
            </button>
          </div>
        </div>
      )}

      {/* Game Guide */}
      {showGameGuide && (
        <GameGuide
          language={settings.language}
          darkMode={settings.darkMode}
          onClose={() => setShowGameGuide(false)}
          initialGame="slitherlink"
        />
      )}
    </div>
  )
}
