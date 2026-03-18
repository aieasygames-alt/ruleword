import { useState, useCallback, useEffect } from 'react'
import GameGuide from './GameGuide'

type Direction = 'up' | 'down' | 'left' | 'right'
type GameMode = 'daily' | 'practice'

interface Stats {
  played: number
  won: number
  bestScore: number
}

const STORAGE_KEY = 'game2048_save'
const STATS_KEY = 'game2048_stats'

const GRID_SIZE = 4

// 获取每日种子
function getDailySeed(): number {
  const startDate = new Date('2024-01-01').getTime()
  const now = new Date().setHours(0, 0, 0, 0)
  return Math.floor((now - startDate) / 86400000)
}

// 伪随机数生成器
function seededRandom(seed: number) {
  let s = seed
  return function() {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

// 加载统计
function loadStats(): Stats {
  try {
    const data = localStorage.getItem(STATS_KEY)
    return data ? JSON.parse(data) : { played: 0, won: 0, bestScore: 0 }
  } catch {
    return { played: 0, won: 0, bestScore: 0 }
  }
}

// 保存统计
function saveStats(stats: Stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats))
}

// 生成初始网格
function generateEmptyGrid(): number[][] {
  return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0))
}

// 添加随机数字
function addRandomTile(grid: number[][], seed?: number): number[][] {
  const rng = seed !== undefined ? seededRandom(seed) : null
  const newGrid = grid.map(row => [...row])
  const emptyCells: [number, number][] = []

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (newGrid[r][c] === 0) {
        emptyCells.push([r, c])
      }
    }
  }

  if (emptyCells.length > 0) {
    const random = rng ? rng() : Math.random()
    const [r, c] = emptyCells[Math.floor(random * emptyCells.length)]
    newGrid[r][c] = (rng ? rng() : Math.random()) < 0.9 ? 2 : 4
  }

  return newGrid
}

// 旋转网格（用于简化移动逻辑）
function rotateGrid(grid: number[][], times: number): number[][] {
  let result = grid.map(row => [...row])
  for (let t = 0; t < times; t++) {
    const rotated = generateEmptyGrid()
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        rotated[c][GRID_SIZE - 1 - r] = result[r][c]
      }
    }
    result = rotated
  }
  return result
}

// 向左滑动一行
function slideRow(row: number[]): { row: number[]; score: number } {
  const filtered = row.filter(x => x !== 0)
  const merged: number[] = []
  let score = 0

  let i = 0
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const mergedValue = filtered[i] * 2
      merged.push(mergedValue)
      score += mergedValue
      i += 2
    } else {
      merged.push(filtered[i])
      i++
    }
  }

  while (merged.length < GRID_SIZE) {
    merged.push(0)
  }

  return { row: merged, score }
}

// 检查是否可以移动
function canMove(grid: number[][]): boolean {
  // 检查是否有空格
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) return true
    }
  }

  // 检查是否有相邻相同的数字
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (c + 1 < GRID_SIZE && grid[r][c] === grid[r][c + 1]) return true
      if (r + 1 < GRID_SIZE && grid[r][c] === grid[r + 1][c]) return true
    }
  }

  return false
}

// 检查是否达到2048
function hasWon(grid: number[][]): boolean {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] >= 2048) return true
    }
  }
  return false
}

interface Game2048Props {
  settings: {
    language: 'zh' | 'en'
    soundEnabled: boolean
    darkMode: boolean
  }
  onBack: () => void
}

const Game2048: React.FC<Game2048Props> = ({ settings, onBack }) => {
  const [grid, setGrid] = useState<number[][]>([])
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [gameMode, setGameMode] = useState<GameMode>('practice')
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [continueAfterWin, setContinueAfterWin] = useState(false)
  const [stats, setStats] = useState<Stats>(loadStats)
  const [showGameGuide, setShowGameGuide] = useState(false)
  const [seedOffset, setSeedOffset] = useState(0)

  const t = {
    title: '2048',
    daily: settings.language === 'zh' ? '每日' : 'Daily',
    practice: settings.language === 'zh' ? '练习' : 'Practice',
    newGame: settings.language === 'zh' ? '新游戏' : 'New Game',
    score: settings.language === 'zh' ? '分数' : 'Score',
    best: settings.language === 'zh' ? '最高' : 'Best',
    youWin: settings.language === 'zh' ? '恭喜达到2048！' : 'You reached 2048!',
    youLose: settings.language === 'zh' ? '游戏结束！' : 'Game Over!',
    continue: settings.language === 'zh' ? '继续' : 'Continue',
    howToPlay: settings.language === 'zh' ? '使用方向键或滑动来移动数字，相同数字合并翻倍！' : 'Use arrow keys or swipe to merge same numbers!',
  }

  const initializeGame = useCallback((mode?: GameMode) => {
    const newMode = mode || gameMode
    setGameMode(newMode)
    setSeedOffset(0)

    const newGrid = generateEmptyGrid()
    const seed = newMode === 'daily' ? getDailySeed() : undefined
    const gridWithFirst = addRandomTile(newGrid, seed)
    const gridWithSecond = addRandomTile(gridWithFirst, seed ? seed + 1 : undefined)

    setGrid(gridWithSecond)
    setScore(0)
    setGameOver(false)
    setWon(false)
    setContinueAfterWin(false)
    setBestScore(stats.bestScore)
  }, [gameMode, stats])

  useEffect(() => {
    initializeGame()
  }, [])

  // 移动逻辑
  const move = useCallback((direction: Direction) => {
    if (gameOver || (won && !continueAfterWin)) return

    // 旋转次数：左=0，上=3，右=2，下=1
    const rotations: Record<Direction, number> = { left: 0, up: 3, right: 2, down: 1 }

    let rotatedGrid = rotateGrid(grid, rotations[direction])
    let totalScore = 0
    let moved = false

    const newGrid = rotatedGrid.map(row => {
      const result = slideRow(row)
      if (result.row.join(',') !== row.join(',')) {
        moved = true
      }
      totalScore += result.score
      return result.row
    })

    if (!moved) return

    // 旋转回原位
    let finalGrid = rotateGrid(newGrid, (4 - rotations[direction]) % 4)

    // 添加新数字
    finalGrid = addRandomTile(finalGrid)

    setGrid(finalGrid)
    const newScore = score + totalScore
    setScore(newScore)

    if (newScore > bestScore) {
      setBestScore(newScore)
      const newStats = { ...stats, bestScore: newScore }
      setStats(newStats)
      saveStats(newStats)
    }

    // 检查胜利
    if (!won && !continueAfterWin && hasWon(finalGrid)) {
      setWon(true)
      const newStats = { ...stats, played: stats.played + 1, won: stats.won + 1 }
      if (newScore > newStats.bestScore) newStats.bestScore = newScore
      setStats(newStats)
      saveStats(newStats)
    }

    // 检查游戏结束
    if (!canMove(finalGrid)) {
      setGameOver(true)
      if (!won) {
        const newStats = { ...stats, played: stats.played + 1 }
        setStats(newStats)
        saveStats(newStats)
      }
    }
  }, [grid, gameOver, won, continueAfterWin, score, bestScore, stats])

  // 键盘控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver || (won && !continueAfterWin)) return

      const keyMap: Record<string, Direction> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right',
      }

      if (keyMap[e.key]) {
        e.preventDefault()
        move(keyMap[e.key])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [move, gameOver, won, continueAfterWin])

  // 触摸控制
  useEffect(() => {
    let touchStartX = 0
    let touchStartY = 0

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (gameOver || (won && !continueAfterWin)) return

      const touchEndX = e.changedTouches[0].clientX
      const touchEndY = e.changedTouches[0].clientY

      const dx = touchEndX - touchStartX
      const dy = touchEndY - touchStartY

      const minSwipe = 30

      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipe) {
        move(dx > 0 ? 'right' : 'left')
      } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > minSwipe) {
        move(dy > 0 ? 'down' : 'up')
      }
    }

    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [move, gameOver, won, continueAfterWin])

  // 获取方块颜色
  const getTileColor = (value: number): string => {
    const colors: Record<number, string> = {
      0: settings.darkMode ? 'bg-slate-700' : 'bg-gray-200',
      2: settings.darkMode ? 'bg-amber-600 text-white' : 'bg-amber-100',
      4: settings.darkMode ? 'bg-amber-500 text-white' : 'bg-amber-200',
      8: settings.darkMode ? 'bg-orange-500 text-white' : 'bg-orange-300',
      16: 'bg-orange-500 text-white',
      32: 'bg-orange-600 text-white',
      64: 'bg-red-500 text-white',
      128: 'bg-yellow-400 text-white',
      256: 'bg-yellow-500 text-white',
      512: 'bg-yellow-600 text-white',
      1024: 'bg-yellow-700 text-white',
      2048: 'bg-green-500 text-white',
    }
    return colors[value] || 'bg-purple-500 text-white'
  }

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-amber-50'

  return (
    <div className={`min-h-screen flex flex-col items-center py-4 px-2 ${bgClass} ${textClass}`}>
      {/* Header */}
      <div className="w-full max-w-md mb-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onBack} className={`p-2 rounded-lg ${settings.darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">🧱 2048</h1>
          <button onClick={() => setShowGameGuide(true)} className={`p-2 rounded-lg ${settings.darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center gap-2 mb-3">
          {(['daily', 'practice'] as GameMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => initializeGame(mode)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                gameMode === mode
                  ? (mode === 'daily' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white')
                  : settings.darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {mode === 'daily' ? t.daily : t.practice}
            </button>
          ))}
        </div>

        {/* Score Display */}
        <div className="flex justify-center gap-4 mb-3">
          <div className={`${cardBgClass} rounded-lg px-4 py-2 text-center min-w-[100px]`}>
            <div className="text-xs opacity-70">{t.score}</div>
            <div className="text-xl font-bold">{score}</div>
          </div>
          <div className={`${cardBgClass} rounded-lg px-4 py-2 text-center min-w-[100px]`}>
            <div className="text-xs opacity-70">{t.best}</div>
            <div className="text-xl font-bold">{bestScore}</div>
          </div>
          <button
            onClick={() => initializeGame()}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-medium"
          >
            🔄
          </button>
        </div>

        <p className="text-center text-xs opacity-70">{t.howToPlay}</p>
      </div>

      {/* Game Board */}
      <div className={`${cardBgClass} rounded-xl p-3`}>
        <div className="grid grid-cols-4 gap-2">
          {grid.flat().map((value, i) => (
            <div
              key={i}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center font-bold transition-all duration-150 ${getTileColor(value)} ${value >= 1000 ? 'text-lg' : value >= 100 ? 'text-xl' : 'text-2xl'}`}
            >
              {value || ''}
            </div>
          ))}
        </div>
      </div>

      {/* Win/Lose Message */}
      {(gameOver || (won && !continueAfterWin)) && (
        <div className={`mt-6 ${cardBgClass} rounded-xl p-4 text-center`}>
          <div className="text-3xl mb-2">{won ? '🎉' : '😢'}</div>
          <div className={`font-bold mb-2 ${won ? 'text-green-500' : 'text-red-500'}`}>
            {won ? t.youWin : t.youLose}
          </div>
          {won && (
            <button
              onClick={() => setContinueAfterWin(true)}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium mr-2"
            >
              {t.continue}
            </button>
          )}
          <button
            onClick={() => initializeGame()}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-medium"
          >
            {t.newGame}
          </button>
        </div>
      )}

      {/* Game Guide */}
      {showGameGuide && (
        <GameGuide
          language={settings.language}
          darkMode={settings.darkMode}
          onClose={() => setShowGameGuide(false)}
          initialGame="game2048"
        />
      )}
    </div>
  )
}

export default Game2048
