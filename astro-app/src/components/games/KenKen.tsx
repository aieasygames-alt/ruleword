import { useState, useCallback, useEffect } from 'react'
import GameGuide from './GameGuide'

type Difficulty = 'easy' | 'normal' | 'hard'
type Operation = '+' | '-' | '×' | '÷'

interface Cage {
  cells: [number, number][]
  operation: Operation
  target: number
}

interface Stats {
  played: number
  completed: number
}

const STATS_KEY = 'kenken_stats'

const DIFFICULTY_CONFIG: Record<Difficulty, { size: number }> = {
  easy: { size: 4 },
  normal: { size: 5 },
  hard: { size: 6 },
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

// 生成拉丁方阵
function generateLatinSquare(size: number, rng: () => number): number[][] {
  const grid: number[][] = Array(size).fill(null).map(() => Array(size).fill(0))

  const isValid = (r: number, c: number, num: number): boolean => {
    for (let i = 0; i < size; i++) {
      if (grid[r][i] === num || grid[i][c] === num) return false
    }
    return true
  }

  const solve = (pos: number): boolean => {
    if (pos === size * size) return true
    const r = Math.floor(pos / size)
    const c = pos % size
    const nums = [...Array(size)].map((_, i) => i + 1).sort(() => rng() - 0.5)

    for (const num of nums) {
      if (isValid(r, c, num)) {
        grid[r][c] = num
        if (solve(pos + 1)) return true
        grid[r][c] = 0
      }
    }
    return false
  }

  solve(0)
  return grid
}

// 生成笼子和运算
function generateCages(size: number, solution: number[][], rng: () => number): Cage[] {
  const cages: Cage[] = []
  const assigned = Array(size).fill(null).map(() => Array(size).fill(false))

  const operations: Operation[] = ['+', '-', '×', '÷']

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (assigned[r][c]) continue

      const cells: [number, number][] = [[r, c]]
      assigned[r][c] = true

      // 随机决定笼子大小 (1-3)
      const cageSize = Math.min(Math.floor(rng() * 3) + 1, size - cells.length + 1)

      // 尝试扩展笼子
      while (cells.length < cageSize) {
        const neighbors: [number, number][] = []
        for (const [cr, cc] of cells) {
          const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]]
          for (const [dr, dc] of dirs) {
            const nr = cr + dr, nc = cc + dc
            if (nr >= 0 && nr < size && nc >= 0 && nc < size && !assigned[nr][nc]) {
              neighbors.push([nr, nc])
            }
          }
        }
        if (neighbors.length === 0) break
        const [nr, nc] = neighbors[Math.floor(rng() * neighbors.length)]
        cells.push([nr, nc])
        assigned[nr][nc] = true
      }

      // 计算目标值和运算
      const values = cells.map(([cr, cc]) => solution[cr][cc])
      let operation: Operation = '+'
      let target: number = 0

      if (cells.length === 1) {
        target = values[0]
        operation = '+'
      } else {
        const possibleOps = operations.filter(op => {
          if (op === '-' && values.length === 2) return true
          if (op === '÷' && values.length === 2) return values[0] % values[1] === 0 || values[1] % values[0] === 0
          if (op === '+' || op === '×') return true
          return false
        })

        operation = possibleOps[Math.floor(rng() * possibleOps.length)]

        if (operation === '+') {
          target = values.reduce((a, b) => a + b, 0)
        } else if (operation === '×') {
          target = values.reduce((a, b) => a * b, 1)
        } else if (operation === '-') {
          target = Math.abs(values[0] - values[1])
        } else if (operation === '÷') {
          target = Math.max(values[0], values[1]) / Math.min(values[0], values[1])
        }
      }

      cages.push({ cells, operation, target })
    }
  }

  return cages
}

export default function KenKen({ settings, onBack }: { settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }; onBack: () => void }) {
  const [grid, setGrid] = useState<number[][]>([])
  const [solution, setSolution] = useState<number[][]>([])
  const [cages, setCages] = useState<Cage[]>([])
  const [cageColors, setCageColors] = useState<string[][]>([])
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [isComplete, setIsComplete] = useState(false)
  const [stats, setStats] = useState<Stats>(loadStats)
  const [showGameGuide, setShowGameGuide] = useState(false)
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null)

  const config = DIFFICULTY_CONFIG[difficulty]
  const { size } = config

  const t = {
    title: '🔢 KenKen',
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

  const COLORS = [
    'bg-rose-100 dark:bg-rose-900/30',
    'bg-sky-100 dark:bg-sky-900/30',
    'bg-amber-100 dark:bg-amber-900/30',
    'bg-emerald-100 dark:bg-emerald-900/30',
    'bg-violet-100 dark:bg-violet-900/30',
    'bg-orange-100 dark:bg-orange-900/30',
    'bg-cyan-100 dark:bg-cyan-900/30',
    'bg-pink-100 dark:bg-pink-900/30',
  ]

  const initializeGame = useCallback(() => {
    const seed = getDailySeed() + Object.keys(DIFFICULTY_CONFIG).indexOf(difficulty) * 1000
    const rng = seededRandom(seed)
    const newSolution = generateLatinSquare(size, rng)
    const newCages = generateCages(size, newSolution, rng)

    setSolution(newSolution)
    setGrid(Array(size).fill(null).map(() => Array(size).fill(0)))
    setCages(newCages)
    setIsComplete(false)
    setSelectedCell(null)

    // 分配颜色
    const colors: string[][] = Array(size).fill(null).map(() => Array(size).fill(''))
    newCages.forEach((cage, i) => {
      const color = COLORS[i % COLORS.length]
      for (const [r, c] of cage.cells) {
        colors[r][c] = color
      }
    })
    setCageColors(colors)
  }, [difficulty, size])

  useEffect(() => {
    initializeGame()
  }, [])

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
    setSelectedCell({ r, c })
  }

  const handleInput = (num: number) => {
    if (!selectedCell) return
    const { r, c } = selectedCell

    setGrid(prev => {
      const newGrid = prev.map(row => [...row])
      newGrid[r][c] = num

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

    if (e.key >= '1' && e.key <= String(size)) {
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
  }, [selectedCell, size])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // 获取笼子的提示文本
  const getCageLabel = (r: number, c: number): string | null => {
    for (const cage of cages) {
      if (cage.cells[0][0] === r && cage.cells[0][1] === c) {
        return `${cage.target}${cage.operation}`
      }
    }
    return null
  }

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'
  const borderClass = settings.darkMode ? 'border-gray-700' : 'border-gray-300'

  const cellSize = 56

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
            <div className={`grid gap-0 ${settings.darkMode ? 'bg-gray-500' : 'bg-gray-400'}`} style={{ gridTemplateColumns: `repeat(${size}, ${cellSize}px)` }}>
              {grid.map((row, r) =>
                row.map((cell, c) => (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    className={`relative flex items-center justify-center cursor-pointer font-bold text-xl transition-colors ${cageColors[r]?.[c] || ''} ${
                      selectedCell?.r === r && selectedCell?.c === c
                        ? 'ring-2 ring-blue-500'
                        : ''
                    }`}
                    style={{ width: cellSize, height: cellSize }}
                  >
                    <span className="absolute top-0.5 left-1 text-[10px] opacity-60 font-normal">
                      {getCageLabel(r, c)}
                    </span>
                    <span>{cell || ''}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Number Pad */}
          <div className="flex justify-center mb-4">
            <div className="grid grid-cols-5 gap-2">
              {[...Array(size + 1)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleInput(i === size ? 0 : i + 1)}
                  className={`w-10 h-10 rounded-lg font-bold text-lg ${
                    settings.darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {i === size ? '✕' : i + 1}
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
            <div className="text-4xl mb-3">🎉🔢</div>
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
          initialGame="kenken"
        />
      )}
    </div>
  )
}
