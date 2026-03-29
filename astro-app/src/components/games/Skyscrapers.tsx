import { useState, useCallback, useEffect } from 'react'
import GameGuide from './GameGuide'

type Difficulty = 'easy' | 'normal' | 'hard'

interface Stats {
  played: number
  completed: number
}

const STATS_KEY = 'skyscrapers_stats'

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

// 生成有效的拉丁方阵
function generateLatinSquare(size: number, rng: () => number): number[][] {
  const grid: number[][] = []

  // 第一行随机排列
  const firstRow = Array.from({ length: size }, (_, i) => i + 1)
  for (let i = firstRow.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[firstRow[i], firstRow[j]] = [firstRow[j], firstRow[i]]
  }
  grid.push(firstRow)

  // 后续行通过循环移位生成
  for (let r = 1; r < size; r++) {
    grid.push([...grid[r - 1].slice(1), grid[r - 1][0]])
  }

  // 随机交换行和列
  for (let i = 0; i < size; i++) {
    const r1 = Math.floor(rng() * size)
    const r2 = Math.floor(rng() * size)
    ;[grid[r1], grid[r2]] = [grid[r2], grid[r1]]
  }

  for (let i = 0; i < size; i++) {
    const c1 = Math.floor(rng() * size)
    const c2 = Math.floor(rng() * size)
    for (let r = 0; r < size; r++) {
      ;[grid[r][c1], grid[r][c2]] = [grid[r][c2], grid[r][c1]]
    }
  }

  return grid
}

// 计算可见建筑数
function countVisible(line: number[]): number {
  let max = 0
  let count = 0
  for (const h of line) {
    if (h > max) {
      max = h
      count++
    }
  }
  return count
}

// 计算所有提示
function calculateClues(grid: number[][], size: number) {
  const top: number[] = []
  const bottom: number[] = []
  const left: number[] = []
  const right: number[] = []

  for (let i = 0; i < size; i++) {
    const col = grid.map(row => row[i])
    top.push(countVisible(col))
    bottom.push(countVisible([...col].reverse()))
    left.push(countVisible(grid[i]))
    right.push(countVisible([...grid[i]].reverse()))
  }

  return { top, bottom, left, right }
}

export default function Skyscrapers({ settings, onBack }: { settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }; onBack: () => void }) {
  const [grid, setGrid] = useState<number[][]>([])
  const [solution, setSolution] = useState<number[][]>([])
  const [clues, setClues] = useState<{ top: number[]; bottom: number[]; left: number[]; right: number[] }>({ top: [], bottom: [], left: [], right: [] })
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [isComplete, setIsComplete] = useState(false)
  const [stats, setStats] = useState<Stats>(loadStats)
  const [showGameGuide, setShowGameGuide] = useState(false)
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null)
  const [errors, setErrors] = useState<Set<string>>(new Set())

  const config = DIFFICULTY_CONFIG[difficulty]
  const { size } = config

  const t = {
    title: '🏙️ Skyscrapers',
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
    const newSolution = generateLatinSquare(size, rng)
    setSolution(newSolution)
    setGrid(Array(size).fill(null).map(() => Array(size).fill(0)))
    setClues(calculateClues(newSolution, size))
    setIsComplete(false)
    setSelectedCell(null)
    setErrors(new Set())
  }, [difficulty, size])

  useEffect(() => {
    initializeGame()
  }, [])

  const validateGrid = useCallback((currentGrid: number[][]): Set<string> => {
    const newErrors = new Set<string>()

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (currentGrid[r][c] === 0) continue

        // 检查行重复
        for (let c2 = 0; c2 < size; c2++) {
          if (c2 !== c && currentGrid[r][c2] === currentGrid[r][c]) {
            newErrors.add(`${r}-${c}`)
            newErrors.add(`${r}-${c2}`)
          }
        }

        // 检查列重复
        for (let r2 = 0; r2 < size; r2++) {
          if (r2 !== r && currentGrid[r2][c] === currentGrid[r][c]) {
            newErrors.add(`${r}-${c}`)
            newErrors.add(`${r2}-${c}`)
          }
        }
      }
    }

    return newErrors
  }, [size])

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

      setErrors(validateGrid(newGrid))

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

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'
  const borderClass = settings.darkMode ? 'border-gray-700' : 'border-gray-300'

  const cellSize = 48

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

          {/* Grid with clues */}
          <div className="flex justify-center mb-4">
            <div className="inline-block">
              {/* Top clues */}
              <div className="flex mb-1">
                <div style={{ width: cellSize }} />
                {clues.top.map((clue, i) => (
                  <div key={i} className="flex items-center justify-center font-bold text-blue-500" style={{ width: cellSize, height: 24 }}>
                    {clue}
                  </div>
                ))}
                <div style={{ width: cellSize }} />
              </div>

              <div className="flex">
                {/* Left clues */}
                <div className="flex flex-col">
                  {clues.left.map((clue, i) => (
                    <div key={i} className="flex items-center justify-end pr-2 font-bold text-blue-500" style={{ width: cellSize, height: cellSize }}>
                      {clue}
                    </div>
                  ))}
                </div>

                {/* Grid */}
                <div className={`grid gap-0.5 p-1 rounded-xl shadow-2xl ${settings.darkMode ? 'bg-gradient-to-br from-slate-600 to-slate-800' : 'bg-gradient-to-br from-gray-400 to-gray-500'}`} style={{ gridTemplateColumns: `repeat(${size}, ${cellSize}px)` }}>
                  {grid.map((row, r) =>
                    row.map((cell, c) => (
                      <div
                        key={`${r}-${c}`}
                        onClick={() => handleCellClick(r, c)}
                        className={`flex items-center justify-center cursor-pointer font-bold text-lg transition-all ${
                          errors.has(`${r}-${c}`)
                            ? 'bg-gradient-to-br from-red-300 to-red-500 shadow-inner'
                            : selectedCell?.r === r && selectedCell?.c === c
                            ? 'bg-gradient-to-br from-blue-300 to-blue-500 shadow-lg shadow-blue-500/30 scale-105 ring-2 ring-blue-400'
                            : settings.darkMode ? 'bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700' : 'bg-gradient-to-br from-white to-gray-100 hover:from-gray-50 hover:to-gray-200'
                        }`}
                        style={{ width: cellSize, height: cellSize }}
                      >
                        {cell || ''}
                      </div>
                    ))
                  )}
                </div>

                {/* Right clues */}
                <div className="flex flex-col">
                  {clues.right.map((clue, i) => (
                    <div key={i} className="flex items-center justify-start pl-2 font-bold text-blue-500" style={{ width: cellSize, height: cellSize }}>
                      {clue}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom clues */}
              <div className="flex mt-1">
                <div style={{ width: cellSize }} />
                {clues.bottom.map((clue, i) => (
                  <div key={i} className="flex items-center justify-center font-bold text-blue-500" style={{ width: cellSize, height: 24 }}>
                    {clue}
                  </div>
                ))}
                <div style={{ width: cellSize }} />
              </div>
            </div>
          </div>

          {/* Number Pad */}
          <div className="flex justify-center mb-4">
            <div className="grid grid-cols-5 gap-2">
              {[...Array(size + 1)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleInput(i === size ? 0 : i + 1)}
                  className={`w-10 h-10 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${
                    settings.darkMode ? 'bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 shadow-lg shadow-slate-900/30' : 'bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 shadow-lg shadow-gray-400/30'
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
            <div className="text-4xl mb-3">🎉🏙️</div>
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
          initialGame="skyscrapers"
        />
      )}
    </div>
  )
}
