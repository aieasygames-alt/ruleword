import { useState, useCallback, useEffect } from 'react'
import GameGuide from './GameGuide'

type CellState = 'normal' | 'shaded' | 'circled'
type Difficulty = 'easy' | 'normal' | 'hard'

interface Stats {
  played: number
  completed: number
}

const STATS_KEY = 'hitori_stats'

const DIFFICULTY_CONFIG: Record<Difficulty, { size: number }> = {
  easy: { size: 5 },
  normal: { size: 7 },
  hard: { size: 9 },
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

// 生成 Hitori 谜题
function generatePuzzle(size: number, seed?: number): { puzzle: number[][], solution: boolean[][] } {
  const rng = seed !== undefined ? seededRandom(seed) : () => Math.random()

  // 先生成一个无重复的完整网格
  const grid: number[][] = []
  for (let r = 0; r < size; r++) {
    grid.push([])
    for (let c = 0; c < size; c++) {
      grid[r].push(Math.floor(rng() * size) + 1)
    }
  }

  // 生成解（哪些格子需要被涂黑）
  const solution: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false))

  // 简单算法：标记造成冲突的格子
  for (let r = 0; r < size; r++) {
    const seen: Record<number, number> = {}
    for (let c = 0; c < size; c++) {
      const num = grid[r][c]
      if (seen[num] !== undefined) {
        // 随机选择一个涂黑
        const toShade = rng() < 0.5 ? seen[num] : c
        solution[r][toShade] = true
      } else {
        seen[num] = c
      }
    }
  }

  for (let c = 0; c < size; c++) {
    const seen: Record<number, number> = {}
    for (let r = 0; r < size; r++) {
      if (solution[r][c]) continue
      const num = grid[r][c]
      if (seen[num] !== undefined) {
        solution[r][c] = true
      } else {
        seen[num] = r
      }
    }
  }

  // 确保涂黑的格子不相邻
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (solution[r][c]) {
        // 检查是否有相邻的被涂黑
        const neighbors = [[r-1, c], [r+1, c], [r, c-1], [r, c+1]]
        for (const [nr, nc] of neighbors) {
          if (nr >= 0 && nr < size && nc >= 0 && nc < size && solution[nr][nc]) {
            solution[r][c] = false
            break
          }
        }
      }
    }
  }

  return { puzzle: grid, solution }
}

export default function Hitori({ settings, onBack }: { settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }; onBack: () => void }) {
  const [puzzle, setPuzzle] = useState<number[][]>([])
  const [grid, setGrid] = useState<CellState[][]>([])
  const [solution, setSolution] = useState<boolean[][]>([])
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [isComplete, setIsComplete] = useState(false)
  const [stats, setStats] = useState<Stats>(loadStats)
  const [showGameGuide, setShowGameGuide] = useState(false)

  const config = DIFFICULTY_CONFIG[difficulty]
  const { size } = config

  const t = {
    title: '⬛ Hitori',
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
    const { puzzle: newPuzzle, solution: newSolution } = generatePuzzle(size, seed)
    setPuzzle(newPuzzle)
    setSolution(newSolution)
    setGrid(Array(size).fill(null).map(() => Array(size).fill('normal')))
    setIsComplete(false)
  }, [difficulty, size])

  useEffect(() => {
    initializeGame()
  }, [])

  const checkComplete = useCallback((currentGrid: CellState[][]): boolean => {
    if (!currentGrid.length || !solution.length) return false

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const isShaded = currentGrid[r][c] === 'shaded'
        if (isShaded !== solution[r][c]) return false
      }
    }
    return true
  }, [solution, size])

  const handleCellClick = (r: number, c: number) => {
    if (isComplete) return

    setGrid(prev => {
      const newGrid = prev.map(row => [...row])
      const current = newGrid[r][c]

      if (current === 'normal') newGrid[r][c] = 'shaded'
      else if (current === 'shaded') newGrid[r][c] = 'circled'
      else newGrid[r][c] = 'normal'

      if (checkComplete(newGrid)) {
        setIsComplete(true)
        const newStats = { ...stats, played: stats.played + 1, completed: stats.completed + 1 }
        setStats(newStats)
        saveStats(newStats)
      }

      return newGrid
    })
  }

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'
  const borderClass = settings.darkMode ? 'border-gray-700' : 'border-gray-300'

  const cellSize = size <= 5 ? 48 : size <= 7 ? 42 : 36

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
            <div className={`grid gap-1 ${settings.darkMode ? 'bg-gray-600' : 'bg-gray-400'}`} style={{ gridTemplateColumns: `repeat(${size}, ${cellSize}px)` }}>
              {grid.map((row, r) =>
                row.map((state, c) => (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    className={`flex items-center justify-center cursor-pointer font-bold text-lg transition-colors ${
                      state === 'shaded'
                        ? 'bg-gray-900 text-gray-600'
                        : state === 'circled'
                        ? 'bg-white text-gray-900 ring-2 ring-blue-500'
                        : settings.darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-900'
                    }`}
                    style={{ width: cellSize, height: cellSize }}
                  >
                    {puzzle[r]?.[c]}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-4 mb-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 bg-gray-900 rounded" />
              <span>{settings.language === 'zh' ? '涂黑' : 'Shade'}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 bg-white ring-2 ring-blue-500 rounded" />
              <span>{settings.language === 'zh' ? '保留' : 'Keep'}</span>
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
            <div className="text-4xl mb-3">🎉⬛</div>
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
          initialGame="hitori"
        />
      )}
    </div>
  )
}
