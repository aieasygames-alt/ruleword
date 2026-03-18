import { useState, useCallback, useEffect } from 'react'
import GameGuide from './GameGuide'

type CellState = 'empty' | 'filled' | 'crossed'
type Difficulty = 'easy' | 'normal' | 'hard'
type GameMode = 'daily' | 'practice'

interface Stats {
  played: number
  completed: number
}

const STATS_KEY = 'nonogram_stats'

const DIFFICULTY_CONFIG: Record<Difficulty, { size: number }> = {
  easy: { size: 5 },
  normal: { size: 10 },
  hard: { size: 15 },
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

// 伪随机数生成器
function seededRandom(seed: number) {
  let s = seed
  return function() {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

// 生成谜题图案
function generatePuzzle(size: number, seed?: number): boolean[][] {
  const rng = seed !== undefined ? seededRandom(seed) : () => Math.random()
  const puzzle: boolean[][] = []
  for (let r = 0; r < size; r++) {
    puzzle.push([])
    for (let c = 0; c < size; c++) {
      puzzle[r].push(rng() > 0.4) // 60% chance of filled
    }
  }
  return puzzle
}

// 计算行/列提示数字
function calculateHints(line: boolean[]): number[] {
  const hints: number[] = []
  let count = 0
  for (const cell of line) {
    if (cell) {
      count++
    } else if (count > 0) {
      hints.push(count)
      count = 0
    }
  }
  if (count > 0) hints.push(count)
  return hints.length ? hints : [0]
}

// 获取每日种子
function getDailySeed(): number {
  const startDate = new Date('2024-01-01').getTime()
  const now = new Date().setHours(0, 0, 0, 0)
  return Math.floor((now - startDate) / 86400000)
}

export default function Nonogram({ settings, onBack }: { settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }; onBack: () => void }) {
  const [grid, setGrid] = useState<CellState[][]>([])
  const [solution, setSolution] = useState<boolean[][]>([])
  const [rowHints, setRowHints] = useState<number[][]>([])
  const [colHints, setColHints] = useState<number[][]>([])
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [gameMode, setGameMode] = useState<GameMode>('practice')
  const [isComplete, setIsComplete] = useState(false)
  const [stats, setStats] = useState<Stats>(loadStats)
  const [showGameGuide, setShowGameGuide] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragType, setDragType] = useState<CellState>('filled')

  const config = DIFFICULTY_CONFIG[difficulty]
  const { size } = config

  const t = {
    title: '🖼️ Nonogram',
    daily: settings.language === 'zh' ? '每日' : 'Daily',
    practice: settings.language === 'zh' ? '练习' : 'Practice',
    newGame: settings.language === 'zh' ? '新游戏' : 'New Game',
    complete: settings.language === 'zh' ? '恭喜完成！' : 'Puzzle Complete!',
    remaining: settings.language === 'zh' ? '剩余' : 'Remaining',
    difficulty: settings.language === 'zh' ? '难度' : 'Difficulty',
    easy: settings.language === 'zh' ? '简单' : 'Easy',
    normal: settings.language === 'zh' ? '普通' : 'Normal',
    hard: settings.language === 'zh' ? '困难' : 'Hard',
    stats: settings.language === 'zh' ? '统计' : 'Stats',
    played: settings.language === 'zh' ? '已玩' : 'Played',
    completed: settings.language === 'zh' ? '完成' : 'Completed',
    howToPlay: settings.language === 'zh' ? '玩法' : 'How to Play',
  }

  const initializeGame = useCallback(() => {
    const seed = gameMode === 'daily' ? getDailySeed() + Object.keys(DIFFICULTY_CONFIG).indexOf(difficulty) * 1000 : undefined
    const newSolution = generatePuzzle(size, seed)
    setSolution(newSolution)

    // 计算提示
    const rHints = newSolution.map(row => calculateHints(row))
    const cHints: number[][] = []
    for (let c = 0; c < size; c++) {
      const col = newSolution.map(row => row[c])
      cHints.push(calculateHints(col))
    }
    setRowHints(rHints)
    setColHints(cHints)

    // 初始化网格
    const newGrid: CellState[][] = Array(size).fill(null).map(() => Array(size).fill('empty'))
    setGrid(newGrid)
    setIsComplete(false)
  }, [gameMode, difficulty, size])

  useEffect(() => {
    initializeGame()
  }, [])

  const checkComplete = useCallback((currentGrid: CellState[][]): boolean => {
    if (!currentGrid.length || !solution.length) return false

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const isFilled = currentGrid[r][c] === 'filled'
        if (isFilled !== solution[r][c]) return false
      }
    }
    return true
  }, [solution, size])

  const handleCellAction = useCallback((row: number, col: number, action: 'fill' | 'cross' | 'toggle') => {
    if (isComplete) return

    setGrid(prev => {
      const newGrid = prev.map(r => [...r])
      const current = newGrid[row][col]

      if (action === 'fill') {
        newGrid[row][col] = current === 'filled' ? 'empty' : 'filled'
      } else if (action === 'cross') {
        newGrid[row][col] = current === 'crossed' ? 'empty' : 'crossed'
      } else {
        // toggle through states
        if (current === 'empty') newGrid[row][col] = 'filled'
        else if (current === 'filled') newGrid[row][col] = 'crossed'
        else newGrid[row][col] = 'empty'
      }

      if (checkComplete(newGrid)) {
        setIsComplete(true)
        const newStats = { ...stats, played: stats.played + 1, completed: stats.completed + 1 }
        setStats(newStats)
        saveStats(newStats)
      }

      return newGrid
    })
  }, [isComplete, checkComplete, stats])

  const handleMouseDown = (row: number, col: number, e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    const current = grid[row][col]
    let newType: CellState = 'filled'
    if (current === 'empty') newType = 'filled'
    else if (current === 'filled') newType = 'crossed'
    else newType = 'empty'
    setDragType(newType)
    handleCellAction(row, col, 'toggle')
  }

  const handleMouseEnter = (row: number, col: number) => {
    if (isDragging) {
      setGrid(prev => {
        const newGrid = prev.map(r => [...r])
        newGrid[row][col] = dragType

        if (checkComplete(newGrid)) {
          setIsComplete(true)
          const newStats = { ...stats, played: stats.played + 1, completed: stats.completed + 1 }
          setStats(newStats)
          saveStats(newStats)
        }

        return newGrid
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'
  const borderClass = settings.darkMode ? 'border-gray-700' : 'border-gray-300'

  const maxRowHintLen = Math.max(...rowHints.map(h => h.length))
  const maxColHintLen = Math.max(...colHints.map(h => h.length))

  const cellSize = size <= 5 ? 36 : size <= 10 ? 28 : 20

  return (
    <div className={`min-h-screen flex flex-col ${bgClass} ${textClass}`} onMouseUp={handleMouseUp}>
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
          {/* Mode & Difficulty */}
          <div className="flex gap-2 mb-4 flex-wrap justify-center">
            {(['daily', 'practice'] as GameMode[]).map(m => (
              <button
                key={m}
                onClick={() => { setGameMode(m); initializeGame() }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  gameMode === m ? 'bg-green-600 text-white' : `${cardBgClass} border ${borderClass}`
                }`}
              >
                {t[m]}
              </button>
            ))}
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

          {/* Puzzle Grid */}
          <div className="flex justify-center mb-4">
            <div className="inline-block">
              {/* Column hints */}
              <div className="flex mb-1">
                <div style={{ width: maxRowHintLen * 20 }} />
                {colHints.map((hints, c) => (
                  <div
                    key={c}
                    className="flex flex-col items-center justify-end"
                    style={{ width: cellSize, height: maxColHintLen * 16 }}
                  >
                    {hints.map((h, i) => (
                      <div key={i} className="text-xs leading-4">{h}</div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Grid with row hints */}
              <div className="flex">
                {/* Row hints */}
                <div className="flex flex-col">
                  {rowHints.map((hints, r) => (
                    <div
                      key={r}
                      className="flex items-center justify-end"
                      style={{ height: cellSize, width: maxRowHintLen * 20 }}
                    >
                      {hints.map((h, i) => (
                        <span key={i} className="text-xs ml-1">{h}</span>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Cells */}
                <div className={`grid gap-px ${settings.darkMode ? 'bg-gray-600' : 'bg-gray-400'}`} style={{ gridTemplateColumns: `repeat(${size}, ${cellSize}px)` }}>
                  {grid.map((row, r) =>
                    row.map((cell, c) => (
                      <div
                        key={`${r}-${c}`}
                        className={`cursor-pointer flex items-center justify-center transition-colors ${
                          cell === 'filled'
                            ? 'bg-gray-900'
                            : cell === 'crossed'
                            ? settings.darkMode ? 'bg-slate-700' : 'bg-gray-200'
                            : settings.darkMode ? 'bg-slate-800' : 'bg-white'
                        }`}
                        style={{ width: cellSize, height: cellSize }}
                        onMouseDown={(e) => handleMouseDown(r, c, e)}
                        onMouseEnter={() => handleMouseEnter(r, c)}
                        onContextMenu={(e) => { e.preventDefault(); handleCellAction(r, c, 'cross') }}
                      >
                        {cell === 'crossed' && (
                          <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* New Game Button */}
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
            <div className="text-4xl mb-3">🎉🖼️</div>
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
          initialGame="nonogram"
        />
      )}
    </div>
  )
}
