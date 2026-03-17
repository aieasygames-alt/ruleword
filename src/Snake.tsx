import { useState, useCallback, useEffect, useRef } from 'react'
import GameGuide from './GameGuide'

type Direction = 'up' | 'down' | 'left' | 'right'
type GameMode = 'daily' | 'practice'
type Difficulty = 'easy' | 'normal' | 'hard'

interface Position {
  x: number
  y: number
}

interface Stats {
  played: number
  highScore: number
}

const STORAGE_KEY = 'snake_save'
const STATS_KEY = 'snake_stats'

const GRID_SIZE = 20
const CELL_SIZE = 16

// 难度配置：初始速度 -> 最快速度
const DIFFICULTY_SPEED: Record<Difficulty, { initial: number; min: number }> = {
  easy: { initial: 250, min: 150 },   // 慢速，适合新手
  normal: { initial: 180, min: 100 }, // 正常速度
  hard: { initial: 120, min: 60 },    // 快速，挑战模式
}

// 加载统计
function loadStats(): Stats {
  try {
    const data = localStorage.getItem(STATS_KEY)
    return data ? JSON.parse(data) : { played: 0, highScore: 0 }
  } catch {
    return { played: 0, highScore: 0 }
  }
}

// 保存统计
function saveStats(stats: Stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats))
}

interface SnakeProps {
  settings: {
    language: 'zh' | 'en'
    soundEnabled: boolean
    darkMode: boolean
  }
  onBack: () => void
}

const Snake: React.FC<SnakeProps> = ({ settings, onBack }) => {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }])
  const [food, setFood] = useState<Position>({ x: 15, y: 15 })
  const [direction, setDirection] = useState<Direction>('right')
  const [gameMode, setGameMode] = useState<GameMode>('practice')
  const [difficulty, setDifficulty] = useState<Difficulty>('normal')
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(true)
  const [stats, setStats] = useState<Stats>(loadStats)
  const [showGameGuide, setShowGameGuide] = useState(false)

  const directionRef = useRef(direction)
  const gameLoopRef = useRef<ReturnType<typeof setInterval>>()

  const t = {
    title: '🐍 Snake',
    daily: settings.language === 'zh' ? '每日' : 'Daily',
    practice: settings.language === 'zh' ? '练习' : 'Practice',
    start: settings.language === 'zh' ? '开始' : 'Start',
    pause: settings.language === 'zh' ? '暂停' : 'Pause',
    resume: settings.language === 'zh' ? '继续' : 'Resume',
    newGame: settings.language === 'zh' ? '新游戏' : 'New Game',
    score: settings.language === 'zh' ? '分数' : 'Score',
    highScore: settings.language === 'zh' ? '最高分' : 'High Score',
    gameOver: settings.language === 'zh' ? '游戏结束！' : 'Game Over!',
    yourScore: settings.language === 'zh' ? '你的分数' : 'Your Score',
    howToPlay: settings.language === 'zh' ? '使用方向键或WASD控制蛇的移动方向' : 'Use arrow keys or WASD to control the snake',
    difficulty: settings.language === 'zh' ? '难度' : 'Speed',
    easy: settings.language === 'zh' ? '简单' : 'Slow',
    normal: settings.language === 'zh' ? '普通' : 'Normal',
    hard: settings.language === 'zh' ? '困难' : 'Fast',
  }

  // 生成随机食物位置
  const generateFood = useCallback((snakeBody: Position[]): Position => {
    let newFood: Position
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      }
    } while (snakeBody.some(segment => segment.x === newFood.x && segment.y === newFood.y))
    return newFood
  }, [])

  // 初始化游戏
  const initializeGame = useCallback((mode?: GameMode) => {
    const newMode = mode || gameMode
    setGameMode(newMode)

    const initialSnake = [{ x: 10, y: 10 }]
    setSnake(initialSnake)
    setFood(generateFood(initialSnake))
    setDirection('right')
    directionRef.current = 'right'
    setScore(0)
    setGameOver(false)
    setIsPaused(true)
  }, [gameMode, generateFood])

  useEffect(() => {
    initializeGame()
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }
  }, [])

  // 游戏主循环
  const gameLoop = useCallback(() => {
    setSnake(prevSnake => {
      const head = prevSnake[0]
      const newHead: Position = { ...head }

      switch (directionRef.current) {
        case 'up': newHead.y -= 1; break
        case 'down': newHead.y += 1; break
        case 'left': newHead.x -= 1; break
        case 'right': newHead.x += 1; break
      }

      // 检查碰撞边界
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setGameOver(true)
        setIsPaused(true)
        const newStats = { ...stats, played: stats.played + 1 }
        if (score > newStats.highScore) newStats.highScore = score
        setStats(newStats)
        saveStats(newStats)
        return prevSnake
      }

      // 检查碰撞自身
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true)
        setIsPaused(true)
        const newStats = { ...stats, played: stats.played + 1 }
        if (score > newStats.highScore) newStats.highScore = score
        setStats(newStats)
        saveStats(newStats)
        return prevSnake
      }

      const newSnake = [newHead, ...prevSnake]

      // 检查吃到食物
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10)
        setFood(generateFood(newSnake))
      } else {
        newSnake.pop()
      }

      return newSnake
    })
  }, [food, generateFood, score, stats])

  // 启动/停止游戏循环
  useEffect(() => {
    if (!isPaused && !gameOver) {
      const speedConfig = DIFFICULTY_SPEED[difficulty]
      const speed = Math.max(speedConfig.min, speedConfig.initial - Math.floor(score / 10) * 5)
      gameLoopRef.current = setInterval(gameLoop, speed)
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }
  }, [isPaused, gameOver, gameLoop, score, difficulty])

  // 键盘控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return

      const keyMap: Record<string, Direction> = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
        w: 'up', W: 'up', s: 'down', S: 'down', a: 'left', A: 'left', d: 'right', D: 'right',
      }

      if (keyMap[e.key]) {
        e.preventDefault()
        const newDirection = keyMap[e.key]

        // 防止反向移动
        const opposites: Record<Direction, Direction> = { up: 'down', down: 'up', left: 'right', right: 'left' }
        if (opposites[newDirection] !== directionRef.current) {
          setDirection(newDirection)
          directionRef.current = newDirection
        }
      }

      // 空格暂停/继续
      if (e.key === ' ') {
        e.preventDefault()
        if (!gameOver) setIsPaused(p => !p)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameOver])

  // 触摸控制
  useEffect(() => {
    let touchStartX = 0
    let touchStartY = 0

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (gameOver) return

      const touchEndX = e.changedTouches[0].clientX
      const touchEndY = e.changedTouches[0].clientY

      const dx = touchEndX - touchStartX
      const dy = touchEndY - touchStartY

      const minSwipe = 30

      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipe) {
        const newDirection = dx > 0 ? 'right' : 'left'
        const opposites: Record<Direction, Direction> = { up: 'down', down: 'up', left: 'right', right: 'left' }
        if (opposites[newDirection] !== directionRef.current) {
          setDirection(newDirection)
          directionRef.current = newDirection
        }
      } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > minSwipe) {
        const newDirection = dy > 0 ? 'down' : 'up'
        const opposites: Record<Direction, Direction> = { up: 'down', down: 'up', left: 'right', right: 'left' }
        if (opposites[newDirection] !== directionRef.current) {
          setDirection(newDirection)
          directionRef.current = newDirection
        }
      }

      // 点击暂停/继续
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && !gameOver) {
        setIsPaused(p => !p)
      }
    }

    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [gameOver])

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'

  return (
    <div className={`min-h-screen flex flex-col items-center py-4 px-2 ${bgClass} ${textClass}`}>
      {/* Header */}
      <div className="w-full max-w-lg mb-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onBack} className={`p-2 rounded-lg ${settings.darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">{t.title}</h1>
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

        {/* Difficulty Selector */}
        <div className="flex justify-center gap-2 mb-3">
          <span className="text-xs opacity-70 self-center">{t.difficulty}:</span>
          {(['easy', 'normal', 'hard'] as Difficulty[]).map(d => (
            <button
              key={d}
              onClick={() => { setDifficulty(d); if (!gameOver && !isPaused) setIsPaused(true); }}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                difficulty === d
                  ? d === 'easy' ? 'bg-green-600 text-white' : d === 'normal' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
                  : settings.darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t[d]}
            </button>
          ))}
        </div>

        {/* Score Display */}
        <div className="flex justify-center gap-4 mb-3">
          <div className={`${cardBgClass} rounded-lg px-4 py-2 text-center min-w-[80px]`}>
            <div className="text-xs opacity-70">{t.score}</div>
            <div className="text-xl font-bold">{score}</div>
          </div>
          <div className={`${cardBgClass} rounded-lg px-4 py-2 text-center min-w-[80px]`}>
            <div className="text-xs opacity-70">{t.highScore}</div>
            <div className="text-xl font-bold">{stats.highScore}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-2">
          {!gameOver && (
            <button
              onClick={() => setIsPaused(p => !p)}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium"
            >
              {isPaused ? t.start : t.pause}
            </button>
          )}
          <button
            onClick={() => initializeGame()}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-medium"
          >
            🔄 {t.newGame}
          </button>
        </div>

        <p className="text-center text-xs opacity-70 mt-2">{t.howToPlay}</p>
      </div>

      {/* Game Board */}
      <div
        className={`${cardBgClass} rounded-xl p-2 border-2 ${settings.darkMode ? 'border-slate-600' : 'border-gray-400'}`}
        style={{ width: GRID_SIZE * CELL_SIZE + 16 }}
      >
        <div
          className="relative"
          style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}
        >
          {/* Grid background */}
          <div
            className={`absolute inset-0 ${settings.darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            }}
          >
            {Array(GRID_SIZE * GRID_SIZE).fill(null).map((_, i) => (
              <div
                key={i}
                className={`${settings.darkMode ? 'border-slate-600' : 'border-gray-300'} border`}
              />
            ))}
          </div>

          {/* Snake */}
          {snake.map((segment, i) => (
            <div
              key={i}
              className={`absolute rounded-sm ${i === 0 ? 'bg-green-500' : 'bg-green-400'}`}
              style={{
                left: segment.x * CELL_SIZE,
                top: segment.y * CELL_SIZE,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
              }}
            />
          ))}

          {/* Food */}
          <div
            className="absolute rounded-full bg-red-500 animate-pulse"
            style={{
              left: food.x * CELL_SIZE,
              top: food.y * CELL_SIZE,
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
            }}
          />
        </div>
      </div>

      {/* Game Over Message */}
      {gameOver && (
        <div className={`mt-6 ${cardBgClass} rounded-xl p-4 text-center`}>
          <div className="text-3xl mb-2">😢</div>
          <div className="font-bold text-red-500 mb-2">{t.gameOver}</div>
          <div className="text-lg mb-4">{t.yourScore}: {score}</div>
          <button
            onClick={() => initializeGame()}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium"
          >
            {t.newGame}
          </button>
        </div>
      )}

      {/* Mobile Controls */}
      <div className="mt-4 sm:hidden">
        <div className="grid grid-cols-3 gap-2 w-36">
          <div />
          <button
            onClick={() => { if (directionRef.current !== 'down') { setDirection('up'); directionRef.current = 'up'; } }}
            className={`${cardBgClass} p-3 rounded-lg text-center`}
          >
            ⬆️
          </button>
          <div />
          <button
            onClick={() => { if (directionRef.current !== 'right') { setDirection('left'); directionRef.current = 'left'; } }}
            className={`${cardBgClass} p-3 rounded-lg text-center`}
          >
            ⬅️
          </button>
          <button
            onClick={() => setIsPaused(p => !p)}
            className={`${cardBgClass} p-3 rounded-lg text-center text-xs`}
          >
            {isPaused ? '▶️' : '⏸️'}
          </button>
          <button
            onClick={() => { if (directionRef.current !== 'left') { setDirection('right'); directionRef.current = 'right'; } }}
            className={`${cardBgClass} p-3 rounded-lg text-center`}
          >
            ➡️
          </button>
          <div />
          <button
            onClick={() => { if (directionRef.current !== 'up') { setDirection('down'); directionRef.current = 'down'; } }}
            className={`${cardBgClass} p-3 rounded-lg text-center`}
          >
            ⬇️
          </button>
          <div />
        </div>
      </div>

      {/* Game Guide */}
      {showGameGuide && (
        <GameGuide
          language={settings.language}
          darkMode={settings.darkMode}
          onClose={() => setShowGameGuide(false)}
          initialGame="snake"
        />
      )}
    </div>
  )
}

export default Snake
