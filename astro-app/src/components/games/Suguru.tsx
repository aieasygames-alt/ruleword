import { useState, useCallback, useEffect } from 'react'
import GameGuide from './GameGuide'

type Difficulty = 'easy' | 'normal' | 'hard'

interface Stats {
  played: number
  completed: number
}

const STATS_KEY = 'suguru_stats'

const DIFFICULTY_CONFIG: Record<Difficulty, { size: number }> = {
  easy: { size: 5 },
  normal: { size: 6 },
  hard: { size: 8 },
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

// 生成区域
function generateRegions(size: number, rng: () => number): number[][] {
  const regions = Array(size).fill(null).map(() => Array(size).fill(-1))
  const regionSizes: number[] = []
  let currentRegion = 0

  // BFS 分配区域
  const visited = Array(size).fill(null).map(() => Array(size).fill(false))
  const queue: [number, number][] = []

  for (let sr = 0; sr < size; sr++) {
    for (let sc = 0; sc < size; sc++) {
      if (visited[sr][sc]) continue

      queue.push([sr, sc])
      const regionCells: [number, number][] = []
      const targetSize = Math.floor(rng() * 3) + 3 // 3-5 cells per region

      while (queue.length > 0 && regionCells.length < targetSize) {
        const [r, c] = queue.shift()!
        if (visited[r][c]) continue

        visited[r][c] = true
        regions[r][c] = currentRegion
        regionCells.push([r, c])

        // 添加相邻格
        const neighbors = [[r-1, c], [r+1, c], [r, c-1], [r, c+1]]
        for (const [nr, nc] of neighbors) {
          if (nr >= 0 && nr < size && nc >= 0 && nc < size && !visited[nr][nc]) {
            queue.push([nr, nc])
          }
        }
      }

      regionSizes.push(regionCells.length)
      currentRegion++
    }
  }

  return regions
}

// 生成解
function generateSolution(size: number, regions: number[][], rng: () => number): number[][] {
  const solution = Array(size).fill(null).map(() => Array(size).fill(0))

  // 获取每个区域的格子
  const regionCells: Record<number, [number, number][]> = {}
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const region = regions[r][c]
      if (!regionCells[region]) regionCells[region] = []
      regionCells[region].push([r, c])
    }
  }

  // 填充每个区域
  for (const region of Object.keys(regionCells)) {
    const cells = regionCells[parseInt(region)]
    const regionSize = cells.length
    const nums = [...Array(regionSize)].map((_, i) => i + 1).sort(() => rng() - 0.5)

    for (let i = 0; i < cells.length; i++) {
      const [r, c] = cells[i]
      solution[r][c] = nums[i]
    }
  }

  return solution
}

// 检查是否有效
function isValid(grid: number[][], regions: number[][], r: number, c: number, num: number): boolean {
  const size = grid.length

  // 检查同区域
  const region = regions[r][c]
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (regions[i][j] === region && grid[i][j] === num && (i !== r || j !== c)) {
        return false
      }
    }
  }

  // 检查相邻
  const neighbors = [[r-1, c], [r+1, c], [r, c-1], [r, c+1], [r-1, c-1], [r-1, c+1], [r+1, c-1], [r+1, c+1]]
  for (const [nr, nc] of neighbors) {
    if (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] === num) {
      return false
    }
  }

  return true
}

const REGION_COLORS = [
  'bg-rose-100 dark:bg-rose-900/30',
  'bg-sky-100 dark:bg-sky-900/30',
  'bg-amber-100 dark:bg-amber-900/30',
  'bg-emerald-100 dark:bg-emerald-900/30',
  'bg-violet-100 dark:bg-violet-900/30',
  'bg-orange-100 dark:bg-orange-900/30',
  'bg-cyan-100 dark:bg-cyan-900/30',
  'bg-pink-100 dark:bg-pink-900/30',
  'bg-lime-100 dark:bg-lime-900/30',
  'bg-indigo-100 dark:bg-indigo-900/30',
]

export default function Suguru({ settings, onBack }: { settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }; onBack: () => void }) {
  const [grid, setGrid] = useState<number[][]>([])
  const [solution, setSolution] = useState<number[][]>([])
  const [regions, setRegions] = useState<number[][]>([])
  const [regionColors, setRegionColors] = useState<string[][]>([])
  const [given, setGiven] = useState<boolean[][]>([])
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [isComplete, setIsComplete] = useState(false)
  const [stats, setStats] = useState<Stats>(loadStats)
  const [showGameGuide, setShowGameGuide] = useState(false)
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null)
  const [errors, setErrors] = useState<Set<string>>(new Set())

  const config = DIFFICULTY_CONFIG[difficulty]
  const { size } = config

  const t = {
    title: '🧩 Suguru',
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

    const newRegions = generateRegions(size, rng)
    const newSolution = generateSolution(size, newRegions, rng)

    setRegions(newRegions)
    setSolution(newSolution)

    // 设置颜色
    const colors = newRegions.map(row => row.map(r => REGION_COLORS[r % REGION_COLORS.length]))
    setRegionColors(colors)

    // 随机给一些提示
    const newGiven = Array(size).fill(null).map(() => Array(size).fill(false))
    const revealCount = Math.floor(size * size * 0.3)
    const positions: [number, number][] = []
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        positions.push([r, c])
      }
    }
    positions.sort(() => rng() - 0.5)
    for (let i = 0; i < revealCount && i < positions.length; i++) {
      const [r, c] = positions[i]
      newGiven[r][c] = true
    }
    setGiven(newGiven)

    // 初始化网格
    const newGrid = newSolution.map((row, r) =>
      row.map((cell, c) => newGiven[r][c] ? cell : 0)
    )
    setGrid(newGrid)
    setIsComplete(false)
    setSelectedCell(null)
    setErrors(new Set())
  }, [difficulty, size])

  useEffect(() => {
    initializeGame()
  }, [])

  const validateCell = useCallback((currentGrid: number[][], r: number, c: number): boolean => {
    const num = currentGrid[r][c]
    if (num === 0) return true
    return isValid(currentGrid, regions, r, c, num)
  }, [regions])

  const checkComplete = useCallback((currentGrid: number[][]): boolean => {
    if (!currentGrid.length || !solution.length) return false

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (currentGrid[r][c] !== solution[r][c]) return false
      }
    }
    return true
  }, [solution, size])

  const handleCellClick = (r: number, c: number) => {
    if (given[r][c]) return
    setSelectedCell({ r, c })
  }

  const handleInput = (num: number) => {
    if (!selectedCell) return
    const { r, c } = selectedCell
    if (given[r][c]) return

    setGrid(prev => {
      const newGrid = prev.map(row => [...row])
      newGrid[r][c] = num

      // 验证
      const newErrors = new Set<string>()
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          if (!validateCell(newGrid, i, j)) {
            newErrors.add(`${i}-${j}`)
          }
        }
      }
      setErrors(newErrors)

      if (checkComplete(newGrid)) {
        setIsComplete(true)
        const newStats = { ...stats, played: stats.played + 1, completed: stats.completed + 1 }
        setStats(newStats)
        saveStats(newStats)
      }

      return newGrid
    })
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!selectedCell) return
    const { r, c } = selectedCell

    const regionSize = Math.max(...regions.flat()) + 1
    const maxNum = Math.min(regionSize, 5)

    if (e.key >= '1' && e.key <= String(maxNum)) {
      handleInput(parseInt(e.key))
    } else if (e.key === 'Backspace' || e.key === '0') {
      handleInput(0)
    } else if (e.key === 'ArrowUp' && r > 0) {
      setSelectedCell({ r: r - 1, c })
    } else if (e.key === 'ArrowDown' && r < size - 1) {
      setSelectedCell({ r: r + 1, c })
    } else if (e.key === 'ArrowLeft' && c > 0) {
      setSelectedCell({ r, c: c - 1 })
    } else if (e.key === 'ArrowRight' && c < size - 1) {
      setSelectedCell({ r, c: c + 1 })
    }
  }, [selectedCell, size, regions])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'
  const borderClass = settings.darkMode ? 'border-gray-700' : 'border-gray-300'

  const cellSize = size <= 5 ? 56 : size <= 6 ? 48 : 40
  const maxNum = Math.max(...regions.flat(), 0) + 1

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
            <div className={`grid gap-0.5 ${settings.darkMode ? 'bg-gray-600' : 'bg-gray-400'}`} style={{ gridTemplateColumns: `repeat(${size}, ${cellSize}px)` }}>
              {grid.map((row, r) =>
                row.map((cell, c) => (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    className={`flex items-center justify-center cursor-pointer font-bold text-lg transition-colors ${regionColors[r]?.[c] || ''} ${
                      errors.has(`${r}-${c}`) ? 'bg-red-300 dark:bg-red-900' : ''
                    } ${
                      selectedCell?.r === r && selectedCell?.c === c ? 'ring-2 ring-blue-500' : ''
                    } ${
                      given[r][c] ? 'font-black' : ''
                    }`}
                    style={{ width: cellSize, height: cellSize }}
                  >
                    {cell || ''}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Number Pad */}
          <div className="flex justify-center mb-4">
            <div className="grid grid-cols-5 gap-2">
              {[...Array(Math.min(maxNum, 5) + 1)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleInput(i === Math.min(maxNum, 5) ? 0 : i + 1)}
                  className={`w-10 h-10 rounded-lg font-bold text-lg ${
                    settings.darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {i === Math.min(maxNum, 5) ? '✕' : i + 1}
                </button>
              ))}
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
            <div className="text-4xl mb-3">🎉🧩</div>
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
          initialGame="suguru"
        />
      )}
    </div>
  )
}
