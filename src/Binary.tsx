import { useState, useCallback, useEffect } from 'react'
import GameGuide from './GameGuide'

type Difficulty = 'easy' | 'normal' | 'hard'

interface Stats {
  played: number
  completed: number
}

const STATS_KEY = 'binary_stats'

const DIFFICULTY_CONFIG: Record<Difficulty, { size: number }> = {
  easy: { size: 6 },
  normal: { size: 8 },
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

// 生成有效的二进制网格
function generateSolution(size: number, rng: () => number): number[][] {
  const grid = Array(size).fill(null).map(() => Array(size).fill(0))

  const isValid = (r: number, c: number, val: number): boolean => {
    // 检查行中连续3个
    if (c >= 2 && grid[r][c - 1] === val && grid[r][c - 2] === val) return false
    // 检查列中连续3个
    if (r >= 2 && grid[r - 1][c] === val && grid[r - 2][c] === val) return false

    // 检查行中0和1的数量
    if (c === size - 1) {
      const rowZeros = grid[r].filter((v, i) => i < c && v === 0).length + (val === 0 ? 1 : 0)
      const rowOnes = grid[r].filter((v, i) => i < c && v === 1).length + (val === 1 ? 1 : 0)
      if (rowZeros > size / 2 || rowOnes > size / 2) return false
    }

    // 检查列中0和1的数量
    if (r === size - 1) {
      let colZeros = 0, colOnes = 0
      for (let i = 0; i < r; i++) {
        if (grid[i][c] === 0) colZeros++
        else if (grid[i][c] === 1) colOnes++
      }
      if (val === 0) colZeros++
      else colOnes++
      if (colZeros > size / 2 || colOnes > size / 2) return false
    }

    return true
  }

  const solve = (pos: number): boolean => {
    if (pos === size * size) return true
    const r = Math.floor(pos / size)
    const c = pos % size
    const vals = [0, 1].sort(() => rng() - 0.5)

    for (const val of vals) {
      if (isValid(r, c, val)) {
        grid[r][c] = val
        if (solve(pos + 1)) return true
        grid[r][c] = 0
      }
    }
    return false
  }

  solve(0)
  return grid
}

export default function Binary({ settings, onBack }: { settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }; onBack: () => void }) {
  const [grid, setGrid] = useState<number[][]>([])
  const [solution, setSolution] = useState<number[][]>([])
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
    title: '01️⃣ Binary',
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
    const newSolution = generateSolution(size, rng)

    setSolution(newSolution)

    // 随机给一些提示
    const newGiven = Array(size).fill(null).map(() => Array(size).fill(false))
    const revealCount = Math.floor(size * size * 0.35)
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
      row.map((cell, c) => newGiven[r][c] ? cell : -1)
    )
    setGrid(newGrid)
    setIsComplete(false)
    setSelectedCell(null)
    setErrors(new Set())
  }, [difficulty, size])

  useEffect(() => {
    initializeGame()
  }, [])

  const validate = useCallback((currentGrid: number[][]): Set<string> => {
    const newErrors = new Set<string>()

    // 检查连续3个
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (currentGrid[r][c] === -1) continue

        // 检查水平连续
        if (c >= 2 && currentGrid[r][c] === currentGrid[r][c - 1] && currentGrid[r][c] === currentGrid[r][c - 2]) {
          newErrors.add(`${r}-${c}`)
          newErrors.add(`${r}-${c - 1}`)
          newErrors.add(`${r}-${c - 2}`)
        }

        // 检查垂直连续
        if (r >= 2 && currentGrid[r][c] === currentGrid[r - 1][c] && currentGrid[r][c] === currentGrid[r - 2][c]) {
          newErrors.add(`${r}-${c}`)
          newErrors.add(`${r - 1}-${c}`)
          newErrors.add(`${r - 2}-${c}`)
        }
      }
    }

    // 检查每行0和1数量
    for (let r = 0; r < size; r++) {
      const zeros = currentGrid[r].filter(v => v === 0).length
      const ones = currentGrid[r].filter(v => v === 1).length
      if (zeros > size / 2 || ones > size / 2) {
        for (let c = 0; c < size; c++) {
          if (currentGrid[r][c] !== -1) newErrors.add(`${r}-${c}`)
        }
      }
    }

    // 检查每列0和1数量
    for (let c = 0; c < size; c++) {
      let zeros = 0, ones = 0
      for (let r = 0; r < size; r++) {
        if (currentGrid[r][c] === 0) zeros++
        else if (currentGrid[r][c] === 1) ones++
      }
      if (zeros > size / 2 || ones > size / 2) {
        for (let r = 0; r < size; r++) {
          if (currentGrid[r][c] !== -1) newErrors.add(`${r}-${c}`)
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

      setErrors(validate(newGrid))

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

    if (e.key === '0' || e.key === '1') {
      handleInput(parseInt(e.key))
    } else if (e.key === 'Backspace') {
      handleInput(-1)
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

  const cellSize = size <= 6 ? 56 : size <= 8 ? 48 : 40

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
                    className={`flex items-center justify-center cursor-pointer font-bold text-2xl transition-colors ${
                      cell === 0 ? 'bg-blue-200 dark:bg-blue-800' :
                      cell === 1 ? 'bg-gray-800 text-white dark:bg-white dark:text-gray-800' :
                      settings.darkMode ? 'bg-slate-700' : 'bg-white'
                    } ${
                      errors.has(`${r}-${c}`) ? 'ring-2 ring-red-500' : ''
                    } ${
                      selectedCell?.r === r && selectedCell?.c === c ? 'ring-2 ring-blue-500' : ''
                    } ${
                      given[r][c] ? 'font-black' : ''
                    }`}
                    style={{ width: cellSize, height: cellSize }}
                  >
                    {cell === 0 ? '0' : cell === 1 ? '1' : ''}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Number Pad */}
          <div className="flex justify-center gap-4 mb-4">
            <button
              onClick={() => handleInput(0)}
              className={`w-14 h-14 rounded-lg font-bold text-2xl bg-blue-200 dark:bg-blue-800`}
            >
              0
            </button>
            <button
              onClick={() => handleInput(1)}
              className={`w-14 h-14 rounded-lg font-bold text-2xl bg-gray-800 text-white dark:bg-white dark:text-gray-800`}
            >
              1
            </button>
            <button
              onClick={() => handleInput(-1)}
              className={`w-14 h-14 rounded-lg font-bold text-2xl ${settings.darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}
            >
              ✕
            </button>
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
            <div className="text-4xl mb-3">🎉01️⃣</div>
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
          initialGame="binary"
        />
      )}
    </div>
  )
}
