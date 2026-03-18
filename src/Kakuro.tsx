import { useState, useCallback, useEffect } from 'react'
import GameGuide from './GameGuide'

type Difficulty = 'easy' | 'normal' | 'hard'

interface Cell {
  isBlack: boolean
  rowSum?: number
  colSum?: number
  value: number
}

interface Stats {
  played: number
  completed: number
}

const STATS_KEY = 'kakuro_stats'

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

// 生成 Kakuro 谜题
function generatePuzzle(size: number, seed?: number): { grid: Cell[][], solution: number[][] } {
  const rng = seed !== undefined ? seededRandom(seed) : () => Math.random()

  // 初始化网格
  const grid: Cell[][] = Array(size).fill(null).map(() =>
    Array(size).fill(null).map(() => ({ isBlack: false, value: 0 }))
  )
  const solution: number[][] = Array(size).fill(null).map(() => Array(size).fill(0))

  // 随机放置黑色格子（约30%）
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (r === 0 || c === 0 || rng() < 0.25) {
        grid[r][c].isBlack = true
      }
    }
  }

  // 填充白色格子的解
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!grid[r][c].isBlack) {
        // 找到可用的数字（同行同列不重复）
        const usedInRow = new Set<number>()
        const usedInCol = new Set<number>()

        // 检查当前运行的行
        let startC = c - 1
        while (startC >= 0 && !grid[r][startC].isBlack) {
          usedInRow.add(solution[r][startC])
          startC--
        }

        // 检查当前运行的列
        let startR = r - 1
        while (startR >= 0 && !grid[startR][c].isBlack) {
          usedInCol.add(solution[startR][c])
          startR--
        }

        const available = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => !usedInRow.has(n) && !usedInCol.has(n))
        if (available.length > 0) {
          solution[r][c] = available[Math.floor(rng() * available.length)]
        } else {
          grid[r][c].isBlack = true
        }
      }
    }
  }

  // 计算行和列的和
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c].isBlack) {
        // 计算右侧运行的和
        let sum = 0
        let nc = c + 1
        while (nc < size && !grid[r][nc].isBlack) {
          sum += solution[r][nc]
          nc++
        }
        if (sum > 0) grid[r][c].colSum = sum

        // 计算下方运行的和
        sum = 0
        let nr = r + 1
        while (nr < size && !grid[nr][c].isBlack) {
          sum += solution[nr][c]
          nr++
        }
        if (sum > 0) grid[r][c].rowSum = sum
      }
    }
  }

  return { grid, solution }
}

export default function Kakuro({ settings, onBack }: { settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }; onBack: () => void }) {
  const [grid, setGrid] = useState<Cell[][]>([])
  const [solution, setSolution] = useState<number[][]>([])
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [isComplete, setIsComplete] = useState(false)
  const [stats, setStats] = useState<Stats>(loadStats)
  const [showGameGuide, setShowGameGuide] = useState(false)
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null)

  const config = DIFFICULTY_CONFIG[difficulty]
  const { size } = config

  const t = {
    title: '➕ Kakuro',
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
    const { grid: newGrid, solution: newSolution } = generatePuzzle(size, seed)
    setGrid(newGrid.map(row => row.map(cell => ({ ...cell, value: 0 }))))
    setSolution(newSolution)
    setIsComplete(false)
    setSelectedCell(null)
  }, [difficulty, size])

  useEffect(() => {
    initializeGame()
  }, [])

  const checkComplete = useCallback((currentGrid: Cell[][]): boolean => {
    if (!currentGrid.length || !solution.length) return false

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!currentGrid[r][c].isBlack) {
          if (currentGrid[r][c].value !== solution[r][c]) return false
        }
      }
    }
    return true
  }, [solution, size])

  const handleCellClick = (r: number, c: number) => {
    if (grid[r][c].isBlack) return
    setSelectedCell({ r, c })
  }

  const handleInput = (num: number) => {
    if (!selectedCell) return
    const { r, c } = selectedCell
    if (grid[r][c].isBlack) return

    setGrid(prev => {
      const newGrid = prev.map(row => row.map(cell => ({ ...cell })))
      newGrid[r][c].value = num

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

    if (e.key >= '1' && e.key <= '9') {
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
            <div className={`grid gap-0.5 ${settings.darkMode ? 'bg-gray-600' : 'bg-gray-400'}`} style={{ gridTemplateColumns: `repeat(${size}, ${cellSize}px)` }}>
              {grid.map((row, r) =>
                row.map((cell, c) => (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    className={`relative flex items-center justify-center cursor-pointer transition-colors ${
                      cell.isBlack
                        ? 'bg-gray-900'
                        : selectedCell?.r === r && selectedCell?.c === c
                        ? 'bg-blue-200 dark:bg-blue-800'
                        : settings.darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white hover:bg-gray-100'
                    }`}
                    style={{ width: cellSize, height: cellSize }}
                  >
                    {cell.isBlack ? (
                      <>
                        {cell.colSum && (
                          <div className="absolute top-0.5 left-0.5 text-[10px] text-white">{cell.colSum}</div>
                        )}
                        {cell.rowSum && (
                          <div className="absolute bottom-0.5 right-0.5 text-[10px] text-white">{cell.rowSum}</div>
                        )}
                      </>
                    ) : (
                      <span className="text-lg font-bold">{cell.value || ''}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Number Pad */}
          <div className="flex justify-center mb-4">
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(num => (
                <button
                  key={num}
                  onClick={() => handleInput(num)}
                  className={`w-10 h-10 rounded-lg font-bold text-lg ${
                    settings.darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {num === 0 ? '✕' : num}
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
            <div className="text-4xl mb-3">🎉➕</div>
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
          initialGame="kakuro"
        />
      )}
    </div>
  )
}
