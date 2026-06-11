import { useState, useCallback, useEffect } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type QueensProps = {
  settings: Settings
  onBack: () => void
  toggleLanguage: () => void
  toggleTheme: () => void
  toggleSound: () => void
}

type GridSize = 5 | 7 | 8 | 9 | 10 | 11 | 12
type CellState = 'empty' | 'queen' | 'x'
type GameMode = 'daily' | 'practice'

interface Stats {
  played: number
  completed: number
  bestTime: Record<string, number | null>
  streak: number
}

const SIZE_CONFIG: Record<GridSize, { label: string; cellSize: number; difficulty: string; difficultyZh: string }> = {
  5:  { label: '5×5',  cellSize: 52, difficulty: 'Beginner', difficultyZh: '入门' },
  7:  { label: '7×7',  cellSize: 48, difficulty: 'Easy', difficultyZh: '简单' },
  8:  { label: '8×8',  cellSize: 44, difficulty: 'Classic', difficultyZh: '经典' },
  9:  { label: '9×9',  cellSize: 42, difficulty: 'Advanced', difficultyZh: '进阶' },
  10: { label: '10×10', cellSize: 40, difficulty: 'Expert', difficultyZh: '专家' },
  11: { label: '11×11', cellSize: 36, difficulty: 'Ultimate', difficultyZh: '终极' },
  12: { label: '12×12', cellSize: 34, difficulty: 'Master', difficultyZh: '大师' },
}

const REGION_COLORS = [
  'bg-red-500/30',
  'bg-blue-500/30',
  'bg-green-500/30',
  'bg-yellow-500/30',
  'bg-purple-500/30',
  'bg-pink-500/30',
  'bg-cyan-500/30',
  'bg-orange-500/30',
  'bg-indigo-500/30',
  'bg-teal-500/30',
  'bg-rose-500/30',
  'bg-lime-500/30',
  'bg-amber-500/30',
  'bg-sky-500/30',
  'bg-fuchsia-500/30',
  'bg-emerald-500/30',
  'bg-violet-500/30',
]

const STATS_KEY = 'queens_stats'
const SAVE_KEY = 'queens_save'

function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STATS_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* empty */ }
  return { played: 0, completed: 0, bestTime: {}, streak: 0 }
}

function saveStats(stats: Stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats))
}

// Seeded RNG (LCG — same pattern as Sudoku.tsx)
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

function getDailySeed(): number {
  const start = new Date('2024-01-01').getTime()
  return Math.floor((Date.now() - start) / 86400000)
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Generate N connected regions for an NxN grid
function generateRegions(size: number, rng: () => number): number[][] {
  const grid: number[][] = Array.from({ length: size }, () => Array(size).fill(-1))
  const totalCells = size * size

  // Create seed points for each region, spread across the grid
  const allCells: [number, number][] = []
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      allCells.push([r, c])

  const shuffled = shuffle(allCells, rng)
  const seeds = shuffled.slice(0, size)
  const regionSizes: number[] = Array(size).fill(0)

  // BFS from each seed
  const queue: [number, number, number][] = []
  const order = shuffle([...Array(size).keys()], rng)

  for (const regionId of order) {
    const [sr, sc] = seeds[regionId]
    grid[sr][sc] = regionId
    regionSizes[regionId] = 1
    queue.push([sr, sc, regionId])
  }

  // Grow regions round-robin
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]]
  let head = 0
  while (head < queue.length) {
    const [r, c, regionId] = queue[head++]
    const neighbors = shuffle(
      dirs.map(([dr, dc]) => [r + dr, c + dc] as [number, number])
        .filter(([nr, nc]) => nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] === -1),
      rng
    )
    for (const [nr, nc] of neighbors) {
      if (grid[nr][nc] !== -1) continue
      const avgSize = totalCells / size
      if (regionSizes[regionId] >= Math.ceil(avgSize) + 1) continue
      grid[nr][nc] = regionId
      regionSizes[regionId]++
      queue.push([nr, nc, regionId])
    }
  }

  // Handle any unassigned cells
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === -1) {
        for (const [dr, dc] of dirs) {
          const nr = r + dr, nc = c + dc
          if (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] !== -1) {
            grid[r][c] = grid[nr][nc]
            break
          }
        }
      }
    }
  }

  // Merge singleton regions into neighbors
  const regionCount: Record<number, number> = {}
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) {
      const id = grid[r][c]
      regionCount[id] = (regionCount[id] || 0) + 1
    }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (regionCount[grid[r][c]] === 1) {
        for (const [dr, dc] of dirs) {
          const nr = r + dr, nc = c + dc
          if (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] !== grid[r][c]) {
            const oldId = grid[r][c]
            grid[r][c] = grid[nr][nc]
            regionCount[oldId] = 0
            regionCount[grid[nr][nc]]++
            break
          }
        }
      }
    }
  }

  return grid
}

// Backtracking solver: place 1 queen per row
function solveQueens(regions: number[][], size: number, columnOrder?: number[]): number[] | null {
  const queens: number[] = Array(size).fill(-1)
  const usedCols = new Set<number>()
  const usedRegions = new Set<number>()

  function solve(row: number): boolean {
    if (row === size) return true

    const cols = columnOrder || [...Array(size).keys()]
    for (const col of cols) {
      if (usedCols.has(col)) continue
      const regionId = regions[row][col]
      if (usedRegions.has(regionId)) continue

      // Check diagonal adjacency with queens in adjacent rows
      let adjacent = false
      for (let pr = row - 1; pr >= 0 && pr >= row - 1; pr--) {
        if (queens[pr] >= 0 && Math.abs(queens[pr] - col) <= 1) {
          adjacent = true
          break
        }
      }
      if (adjacent) continue

      queens[row] = col
      usedCols.add(col)
      usedRegions.add(regionId)

      if (solve(row + 1)) return true

      queens[row] = -1
      usedCols.delete(col)
      usedRegions.delete(regionId)
    }
    return false
  }

  return solve(0) ? queens : null
}

// Generate a complete puzzle
function generatePuzzle(size: number, seed: number): { regions: number[][]; solution: number[] } | null {
  const rng = seededRandom(seed)

  for (let attempt = 0; attempt < 20; attempt++) {
    const regions = generateRegions(size, rng)
    const solution = solveQueens(regions, size)
    if (solution) return { regions, solution }
  }

  return null
}

function createEmptyGrid(size: number): CellState[][] {
  return Array.from({ length: size }, () => Array<CellState>(size).fill('empty'))
}

export default function Queens({ settings, onBack }: QueensProps) {
  const isEn = settings.language !== 'zh'
  const isDark = settings.darkMode

  const [gridSize, setGridSize] = useState<GridSize>(8)
  const [gameMode, setGameMode] = useState<GameMode>('practice')
  const [regions, setRegions] = useState<number[][]>([])
  const [solution, setSolution] = useState<number[]>([])
  const [grid, setGrid] = useState<CellState[][]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timer, setTimer] = useState(0)
  const [stats, setStats] = useState<Stats>(loadStats)
  const [puzzleSeed, setPuzzleSeed] = useState(0)
  const [generating, setGenerating] = useState(false)

  const bgClass = isDark ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = isDark ? 'text-white' : 'text-gray-900'

  const startGame = useCallback((size: GridSize, mode: GameMode, seed?: number) => {
    setGenerating(true)
    const usedSeed = seed ?? (mode === 'daily' ? getDailySeed() * 1000 + size : Math.floor(Math.random() * 1000000))

    // Use setTimeout to let the UI update before heavy computation
    setTimeout(() => {
      const puzzle = generatePuzzle(size, usedSeed)
      if (puzzle) {
        setRegions(puzzle.regions)
        setSolution(puzzle.solution)
        setGrid(createEmptyGrid(size))
        setIsComplete(false)
        setTimer(0)
        setIsPlaying(true)
        setPuzzleSeed(usedSeed)
        setGridSize(size)
        setGameMode(mode)
        setStats(prev => {
          const next = { ...prev, played: prev.played + 1 }
          saveStats(next)
          return next
        })
      }
      setGenerating(false)
    }, 10)
  }, [])

  // Auto-start on mount
  useEffect(() => {
    startGame(8, 'practice')
  }, [startGame])

  // Timer
  useEffect(() => {
    if (isPlaying && !isComplete) {
      const interval = setInterval(() => setTimer(t => t + 1), 1000)
      return () => clearInterval(interval)
    }
  }, [isPlaying, isComplete])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleCellClick = (row: number, col: number) => {
    if (isComplete || !isPlaying) return
    setGrid(prev => {
      const next = prev.map(r => [...r])
      const cur = next[row][col]
      next[row][col] = cur === 'empty' ? 'queen' : cur === 'queen' ? 'x' : 'empty'
      return next
    })
  }

  const handleCellRightClick = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault()
    if (isComplete || !isPlaying) return
    setGrid(prev => {
      const next = prev.map(r => [...r])
      const cur = next[row][col]
      next[row][col] = cur === 'empty' ? 'x' : cur === 'x' ? 'queen' : 'empty'
      return next
    })
  }

  // Auto-detect completion
  useEffect(() => {
    if (!isPlaying || isComplete || grid.length === 0 || regions.length === 0) return

    let queenCount = 0
    for (let r = 0; r < gridSize; r++)
      for (let c = 0; c < gridSize; c++)
        if (grid[r]?.[c] === 'queen') queenCount++

    if (queenCount !== gridSize) return

    // All queens placed — validate
    const { rows, cols, regions: rCounts } = getQueenCounts()
    for (const count of rows) if (count !== 1) return
    for (const count of cols) if (count !== 1) return
    const allRegions = new Set(regions.flat())
    for (const rid of allRegions) if ((rCounts[rid] || 0) !== 1) return
    if (hasTouchingQueens()) return

    setIsComplete(true)
    setStats(prev => {
      const sizeKey = String(gridSize)
      const best = prev.bestTime[sizeKey]
      const next = {
        ...prev,
        completed: prev.completed + 1,
        streak: prev.streak + 1,
        bestTime: { ...prev.bestTime, [sizeKey]: best === null ? timer : Math.min(best, timer) },
      }
      saveStats(next)
      return next
    })
  }, [grid, isPlaying, isComplete, gridSize, regions])

  const getQueenCounts = () => {
    const size = gridSize
    const rows: number[] = Array(size).fill(0)
    const cols: number[] = Array(size).fill(0)
    const regionMap: Record<number, number> = {}

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r]?.[c] === 'queen') {
          rows[r]++
          cols[c]++
          const rid = regions[r]?.[c]
          if (rid !== undefined) regionMap[rid] = (regionMap[rid] || 0) + 1
        }
      }
    }
    return { rows, cols, regions: regionMap }
  }

  const hasTouchingQueens = () => {
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (grid[r]?.[c] === 'queen') {
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue
              const nr = r + dr, nc = c + dc
              if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize && grid[nr]?.[nc] === 'queen')
                return true
            }
          }
        }
      }
    }
    return false
  }

  const checkSolution = () => {
    if (!isPlaying) return
    const { rows, cols, regions: rCounts } = getQueenCounts()

    for (const count of rows) {
      if (count !== 1) {
        alert(isEn ? 'Each row must have exactly 1 queen!' : '每行必须恰好有1个皇后！')
        return
      }
    }
    for (const count of cols) {
      if (count !== 1) {
        alert(isEn ? 'Each column must have exactly 1 queen!' : '每列必须恰好有1个皇后！')
        return
      }
    }
    const allRegions = new Set(regions.flat())
    for (const rid of allRegions) {
      if ((rCounts[rid] || 0) !== 1) {
        alert(isEn ? 'Each colored region must have exactly 1 queen!' : '每个彩色区域必须恰好有1个皇后！')
        return
      }
    }
    if (hasTouchingQueens()) {
      alert(isEn ? 'Queens cannot touch each other, even diagonally!' : '皇后不能互相接触，包括对角线！')
      return
    }

    setIsComplete(true)
    setStats(prev => {
      const sizeKey = String(gridSize)
      const best = prev.bestTime[sizeKey]
      const next = {
        ...prev,
        completed: prev.completed + 1,
        streak: prev.streak + 1,
        bestTime: { ...prev.bestTime, [sizeKey]: best === null ? timer : Math.min(best, timer) },
      }
      saveStats(next)
      return next
    })
  }

  const { rows: queenRows, cols: queenCols } = getQueenCounts()
  const config = SIZE_CONFIG[gridSize]
  const cellSize = config?.cellSize ?? 40

  // Size selector
  const sizes: GridSize[] = [5, 7, 8, 9, 10, 11, 12]

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} flex flex-col`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 ${isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-white/90 border-gray-300'} border-b backdrop-blur-xl`}>
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm"
          >
            ← {isEn ? 'Back' : '返回'}
          </button>
          <div className="flex items-center gap-3">
            <span className="text-lg font-mono">{formatTime(timer)}</span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              👑 1 {isEn ? 'per row/col/region' : '每行/列/区域'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={checkSolution}
              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors text-sm font-medium"
            >
              {isEn ? 'Check' : '检查'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center p-3 gap-3">
        {/* Size selector */}
        <div className="flex flex-wrap justify-center gap-1.5">
          {sizes.map(s => (
            <button
              key={s}
              onClick={() => startGame(s, gameMode)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                gridSize === s
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {SIZE_CONFIG[s].label}
              <span className="ml-1 opacity-60">{SIZE_CONFIG[s][isEn ? 'difficulty' : 'difficultyZh']}</span>
            </button>
          ))}
        </div>

        {/* Mode toggle + New button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setGameMode('practice')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              gameMode === 'practice' ? 'bg-green-600 text-white' : isDark ? 'bg-slate-800 text-slate-400' : 'bg-gray-200 text-gray-500'
            }`}
          >
            {isEn ? 'Practice' : '练习'}
          </button>
          <button
            onClick={() => setGameMode('daily')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              gameMode === 'daily' ? 'bg-amber-600 text-white' : isDark ? 'bg-slate-800 text-slate-400' : 'bg-gray-200 text-gray-500'
            }`}
          >
            {isEn ? 'Daily' : '每日'}
          </button>
          <button
            onClick={() => startGame(gridSize, gameMode, gameMode === 'daily' ? getDailySeed() * 1000 + gridSize : undefined)}
            className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors text-xs font-medium"
          >
            {isEn ? 'New' : '新局'}
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-3 text-xs text-slate-400">
          <span>{isEn ? 'Solved' : '已解'}: {stats.completed}</span>
          {stats.bestTime[String(gridSize)] != null && (
            <span>{isEn ? 'Best' : '最佳'}: {formatTime(stats.bestTime[String(gridSize)]!)}</span>
          )}
          {stats.streak > 0 && <span>🔥 {stats.streak}</span>}
        </div>

        {/* Generating indicator */}
        {generating && (
          <div className="text-sm text-purple-400 animate-pulse">
            {isEn ? 'Generating puzzle...' : '生成谜题中...'}
          </div>
        )}

        {/* Grid */}
        {isPlaying && regions.length > 0 && (
          <div className="flex">
            {/* Row counts */}
            <div className="flex flex-col mr-1">
              <div style={{ height: 20 }}></div>
              {queenRows.map((count, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-center text-xs font-bold ${
                    count === 1 ? 'text-green-400' : count > 1 ? 'text-red-400' : 'text-slate-500'
                  }`}
                  style={{ width: 20, height: cellSize }}
                >
                  {count}
                </div>
              ))}
            </div>

            <div>
              {/* Column counts */}
              <div className="flex mb-1">
                {queenCols.map((count, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-center text-xs font-bold ${
                      count === 1 ? 'text-green-400' : count > 1 ? 'text-red-400' : 'text-slate-500'
                    }`}
                    style={{ width: cellSize, height: 20 }}
                  >
                    {count}
                  </div>
                ))}
              </div>

              {/* Grid cells */}
              {grid.map((row, rowIdx) => (
                <div key={rowIdx} className="flex">
                  {row.map((cell, colIdx) => {
                    const regionId = regions[rowIdx]?.[colIdx] ?? 0
                    const regionColor = REGION_COLORS[regionId % REGION_COLORS.length]
                    // Add thicker borders between regions
                    const isRegionBorderRight = colIdx < gridSize - 1 && regions[rowIdx]?.[colIdx] !== regions[rowIdx]?.[colIdx + 1]
                    const isRegionBorderBottom = rowIdx < gridSize - 1 && regions[rowIdx]?.[colIdx] !== regions[rowIdx + 1]?.[colIdx]

                    return (
                      <div
                        key={colIdx}
                        onClick={() => handleCellClick(rowIdx, colIdx)}
                        onContextMenu={(e) => handleCellRightClick(e, rowIdx, colIdx)}
                        className={`${regionColor} border-slate-600/50 flex items-center justify-center cursor-pointer transition-colors hover:brightness-110`}
                        style={{
                          width: cellSize,
                          height: cellSize,
                          borderTop: rowIdx === 0 ? '2px solid rgba(148,163,184,0.6)' : '1px solid rgba(100,116,139,0.3)',
                          borderLeft: colIdx === 0 ? '2px solid rgba(148,163,184,0.6)' : '1px solid rgba(100,116,139,0.3)',
                          borderRight: isRegionBorderRight || colIdx === gridSize - 1 ? '2px solid rgba(148,163,184,0.6)' : '1px solid rgba(100,116,139,0.3)',
                          borderBottom: isRegionBorderBottom || rowIdx === gridSize - 1 ? '2px solid rgba(148,163,184,0.6)' : '1px solid rgba(100,116,139,0.3)',
                        }}
                      >
                        {cell === 'queen' && (
                          <span className="select-none" style={{ fontSize: cellSize * 0.55 }}>👑</span>
                        )}
                        {cell === 'x' && (
                          <span className="text-slate-500 select-none" style={{ fontSize: cellSize * 0.45 }}>✕</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-slate-400 text-center max-w-sm space-y-1">
          <p>{isEn ? 'Click: Empty → 👑 Queen → ✕ Marker → Empty' : '点击：空 → 👑 皇后 → ✕ 标记 → 空'}</p>
          <p>{isEn ? '1 queen per row, column, and colored region. No diagonal touching.' : '每行、每列、每个彩色区域各1个皇后。不能对角线相邻。'}</p>
        </div>
      </main>

      {/* Complete Modal */}
      {isComplete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-8 text-center shadow-2xl max-w-sm mx-4`}>
            <div className="text-5xl mb-4">👑</div>
            <h2 className="text-2xl font-bold mb-2">
              {isEn ? 'Puzzle Solved!' : '谜题完成！'}
            </h2>
            <p className={`mb-1 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              {isEn ? 'Time' : '用时'}: {formatTime(timer)}
            </p>
            <p className={`mb-4 text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              {SIZE_CONFIG[gridSize].label} · {SIZE_CONFIG[gridSize][isEn ? 'difficulty' : 'difficultyZh']}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => startGame(gridSize, gameMode, gameMode === 'daily' ? getDailySeed() * 1000 + gridSize : undefined)}
                className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-500 transition-colors font-medium"
              >
                {isEn ? 'New Puzzle' : '新谜题'}
              </button>
              <button
                onClick={() => startGame(gridSize < 12 ? (gridSize === 5 ? 7 : gridSize + 1 as GridSize) : 12, gameMode)}
                className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors font-medium"
              >
                {isEn ? 'Next Size' : '更大'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
