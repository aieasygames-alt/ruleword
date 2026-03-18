import { useState, useCallback, useEffect, useRef } from 'react'
import GameGuide from './GameGuide'

type Difficulty = 'easy' | 'normal' | 'hard'

interface Stats {
  played: number
  bestScore: number
}

const STATS_KEY = 'threes_stats'

const DIFFICULTY_CONFIG: Record<Difficulty, { size: number; spawnRate: number }> = {
  easy: { size: 4, spawnRate: 0.9 },
  normal: { size: 4, spawnRate: 0.85 },
  hard: { size: 5, spawnRate: 0.8 },
}

function loadStats(): Stats {
  try {
    const data = localStorage.getItem(STATS_KEY)
    return data ? JSON.parse(data) : { played: 0, bestScore: 0 }
  } catch {
    return { played: 0, bestScore: 0 }
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

// 获取下一个瓦片值
function getNextValue(rng: () => number): number {
  const r = rng()
  if (r < 0.4) return 1
  if (r < 0.8) return 2
  return 3
}

// 获取瓦片颜色
function getTileColor(value: number, darkMode: boolean): string {
  if (value === 0) return darkMode ? 'bg-slate-700' : 'bg-gray-200'
  if (value === 1) return 'bg-blue-400 text-white'
  if (value === 2) return 'bg-red-400 text-white'
  if (value === 3) return 'bg-purple-500 text-white'
  if (value === 6) return 'bg-yellow-400 text-white'
  if (value === 12) return 'bg-orange-500 text-white'
  if (value === 24) return 'bg-pink-500 text-white'
  if (value === 48) return 'bg-green-500 text-white'
  if (value === 96) return 'bg-cyan-500 text-white'
  return 'bg-gray-800 text-white'
}

// 检查是否可以合并
function canMerge(a: number, b: number): boolean {
  if (a === 0 || b === 0) return false
  if (a + b === 3) return true // 1 + 2 = 3
  if (a >= 3 && a === b) return true // 相同数字合并
  return false
}

export default function Threes({ settings, onBack }: { settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }; onBack: () => void }) {
  const [grid, setGrid] = useState<number[][]>([])
  const [score, setScore] = useState(0)
  const [nextTile, setNextTile] = useState(1)
  const [difficulty, setDifficulty] = useState<Difficulty>('normal')
  const [gameMode, setGameMode] = useState<'daily' | 'practice'>('practice')
  const [gameOver, setGameOver] = useState(false)
  const [stats, setStats] = useState<Stats>(loadStats)
  const [showGameGuide, setShowGameGuide] = useState(false)

  const rngRef = useRef<() => number>(() => Math.random())
  const config = DIFFICULTY_CONFIG[difficulty]
  const { size } = config

  const t = {
    title: '3️⃣ Threes',
    daily: settings.language === 'zh' ? '每日' : 'Daily',
    practice: settings.language === 'zh' ? '练习' : 'Practice',
    newGame: settings.language === 'zh' ? '新游戏' : 'New Game',
    score: settings.language === 'zh' ? '分数' : 'Score',
    best: settings.language === 'zh' ? '最高' : 'Best',
    next: settings.language === 'zh' ? '下一个' : 'Next',
    gameOver: settings.language === 'zh' ? '游戏结束！' : 'Game Over!',
    difficulty: settings.language === 'zh' ? '难度' : 'Difficulty',
    easy: settings.language === 'zh' ? '简单' : 'Easy',
    normal: settings.language === 'zh' ? '普通' : 'Normal',
    hard: settings.language === 'zh' ? '困难' : 'Hard',
  }

  const initializeGame = useCallback(() => {
    const seed = gameMode === 'daily' ? getDailySeed() + Object.keys(DIFFICULTY_CONFIG).indexOf(difficulty) * 1000 : Date.now()
    rngRef.current = seededRandom(seed)

    const newGrid = Array(size).fill(null).map(() => Array(size).fill(0))

    // 初始放置几个瓦片
    for (let i = 0; i < size + 2; i++) {
      let r, c
      do {
        r = Math.floor(rngRef.current() * size)
        c = Math.floor(rngRef.current() * size)
      } while (newGrid[r][c] !== 0)
      newGrid[r][c] = getNextValue(rngRef.current)
    }

    setGrid(newGrid)
    setScore(0)
    setGameOver(false)
    setNextTile(getNextValue(rngRef.current))
  }, [gameMode, difficulty, size])

  useEffect(() => {
    initializeGame()
  }, [])

  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver) return

    setGrid(prev => {
      const newGrid = prev.map(row => [...row])
      let moved = false
      let mergeScore = 0

      const moveRow = (row: number[]): { row: number[]; score: number; moved: boolean } => {
        const result: number[] = []
        let score = 0
        let rowMoved = false

        // 移除空格
        const filtered = row.filter(x => x !== 0)

        for (let i = 0; i < filtered.length; i++) {
          if (i + 1 < filtered.length && canMerge(filtered[i], filtered[i + 1])) {
            const merged = filtered[i] + filtered[i + 1]
            result.push(merged)
            score += merged
            i++
            rowMoved = true
          } else {
            result.push(filtered[i])
          }
        }

        // 填充空格
        while (result.length < size) {
          result.push(0)
        }

        if (JSON.stringify(row) !== JSON.stringify(result)) {
          rowMoved = true
        }

        return { row: result, score, moved: rowMoved }
      }

      if (direction === 'left') {
        for (let r = 0; r < size; r++) {
          const { row, score, moved } = moveRow(newGrid[r])
          if (moved) {
            newGrid[r] = row
            moved = true
            mergeScore += score
          }
        }
      } else if (direction === 'right') {
        for (let r = 0; r < size; r++) {
          const { row, score, moved } = moveRow([...newGrid[r]].reverse())
          const reversed = row.reverse()
          if (moved) {
            newGrid[r] = reversed
            moved = true
            mergeScore += score
          }
        }
      } else if (direction === 'up') {
        for (let c = 0; c < size; c++) {
          const col = newGrid.map(row => row[c])
          const { row, score, moved } = moveRow(col)
          if (moved) {
            for (let r = 0; r < size; r++) {
              newGrid[r][c] = row[r]
            }
            moved = true
            mergeScore += score
          }
        }
      } else if (direction === 'down') {
        for (let c = 0; c < size; c++) {
          const col = [...newGrid.map(row => row[c])].reverse()
          const { row, score, moved } = moveRow(col)
          const reversed = row.reverse()
          if (moved) {
            for (let r = 0; r < size; r++) {
              newGrid[r][c] = reversed[r]
            }
            moved = true
            mergeScore += score
          }
        }
      }

      if (moved) {
        // 添加新瓦片
        const emptyCells: [number, number][] = []
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            if (newGrid[r][c] === 0) emptyCells.push([r, c])
          }
        }

        if (emptyCells.length > 0) {
          const [r, c] = emptyCells[Math.floor(rngRef.current() * emptyCells.length)]
          newGrid[r][c] = nextTile
          setNextTile(getNextValue(rngRef.current))
        }

        setScore(s => {
          const newScore = s + mergeScore
          if (newScore > stats.bestScore) {
            const newStats = { ...stats, bestScore: newScore }
            setStats(newStats)
            saveStats(newStats)
          }
          return newScore
        })

        // 检查游戏是否结束
        let canMove = false
        for (let r = 0; r < size && !canMove; r++) {
          for (let c = 0; c < size && !canMove; c++) {
            if (newGrid[r][c] === 0) canMove = true
            if (r < size - 1 && canMerge(newGrid[r][c], newGrid[r + 1][c])) canMove = true
            if (c < size - 1 && canMerge(newGrid[r][c], newGrid[r][c + 1])) canMove = true
          }
        }

        if (!canMove) {
          setGameOver(true)
        }
      }

      return newGrid
    })
  }, [gameOver, nextTile, size, stats])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') move('up')
      else if (e.key === 'ArrowDown') move('down')
      else if (e.key === 'ArrowLeft') move('left')
      else if (e.key === 'ArrowRight') move('right')
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [move])

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'
  const borderClass = settings.darkMode ? 'border-gray-700' : 'border-gray-300'

  const cellSize = size === 4 ? 72 : 60

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
        <div className="max-w-md mx-auto">
          {/* Mode & Difficulty */}
          <div className="flex gap-2 mb-4 justify-center flex-wrap">
            {(['daily', 'practice'] as const).map(m => (
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

          {/* Score */}
          <div className="flex justify-center gap-4 mb-4">
            <div className={`${cardBgClass} rounded-lg p-3 text-center min-w-24`}>
              <div className="text-xs opacity-60">{t.score}</div>
              <div className="text-2xl font-bold text-green-500">{score}</div>
            </div>
            <div className={`${cardBgClass} rounded-lg p-3 text-center min-w-24`}>
              <div className="text-xs opacity-60">{t.best}</div>
              <div className="text-2xl font-bold">{stats.bestScore}</div>
            </div>
            <div className={`${cardBgClass} rounded-lg p-3 text-center min-w-24`}>
              <div className="text-xs opacity-60">{t.next}</div>
              <div className={`text-2xl font-bold ${getTileColor(nextTile, settings.darkMode)} rounded px-2`}>{nextTile}</div>
            </div>
          </div>

          {/* Grid */}
          <div className="flex justify-center mb-4">
            <div className={`grid gap-2 p-2 rounded-lg ${settings.darkMode ? 'bg-slate-700' : 'bg-gray-300'}`} style={{ gridTemplateColumns: `repeat(${size}, ${cellSize}px)` }}>
              {grid.map((row, r) =>
                row.map((cell, c) => (
                  <div
                    key={`${r}-${c}`}
                    className={`flex items-center justify-center rounded-lg font-bold text-2xl ${getTileColor(cell, settings.darkMode)}`}
                    style={{ width: cellSize, height: cellSize }}
                  >
                    {cell || ''}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-1 mb-4">
            <button onClick={() => move('up')} className={`w-12 h-12 rounded-lg ${cardBgClass} border ${borderClass} text-xl`}>↑</button>
          </div>
          <div className="flex justify-center gap-1 mb-4">
            <button onClick={() => move('left')} className={`w-12 h-12 rounded-lg ${cardBgClass} border ${borderClass} text-xl`}>←</button>
            <button onClick={() => move('down')} className={`w-12 h-12 rounded-lg ${cardBgClass} border ${borderClass} text-xl`}>↓</button>
            <button onClick={() => move('right')} className={`w-12 h-12 rounded-lg ${cardBgClass} border ${borderClass} text-xl`}>→</button>
          </div>

          {/* New Game */}
          <div className="flex justify-center">
            <button
              onClick={initializeGame}
              className={`px-6 py-2 rounded-lg font-medium ${settings.darkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-500'} text-white`}
            >
              {t.newGame}
            </button>
          </div>
        </div>
      </div>

      {/* Game Over */}
      {gameOver && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className={`${cardBgClass} rounded-xl p-6 text-center mx-4`}>
            <div className="text-4xl mb-3">🎮</div>
            <div className="text-xl font-bold text-red-500 mb-2">{t.gameOver}</div>
            <div className="text-lg mb-4">{t.score}: {score}</div>
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
          initialGame="threes"
        />
      )}
    </div>
  )
}
