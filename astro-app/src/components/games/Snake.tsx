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
        className="rounded-xl p-1 border-2 shadow-lg"
        style={{
          width: GRID_SIZE * CELL_SIZE + 16,
          background: settings.darkMode
            ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)'
            : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)',
          borderColor: settings.darkMode ? '#059669' : '#22c55e',
          boxShadow: settings.darkMode
            ? '0 0 30px rgba(16, 185, 129, 0.3), inset 0 0 20px rgba(16, 185, 129, 0.1)'
            : '0 0 30px rgba(16, 185, 129, 0.2), inset 0 0 20px rgba(16, 185, 129, 0.05)',
        }}
      >
        <div
          className="relative rounded-lg overflow-hidden"
          style={{
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE,
            background: settings.darkMode
              ? `repeating-linear-gradient(0deg, transparent 0px, transparent 15px, rgba(30, 58, 95, 0.3) 15px, rgba(30, 58, 95, 0.3) 16px), repeating-linear-gradient(90deg, transparent 0px, transparent 15px, rgba(30, 58, 95, 0.3) 15px, rgba(30, 58, 95, 0.3) 16px), linear-gradient(135deg, #0f172a 0%, #1e293b 100%)`
              : `repeating-linear-gradient(0deg, transparent 0px, transparent 15px, rgba(187, 247, 208, 0.5) 15px, rgba(187, 247, 208, 0.5) 16px), repeating-linear-gradient(90deg, transparent 0px, transparent 15px, rgba(187, 247, 208, 0.5) 15px, rgba(187, 247, 208, 0.5) 16px), linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)`,
          }}
        >
          {/* Snake */}
          {snake.map((segment, i) => {
            const isHead = i === 0
            const progress = i / snake.length
            const hue = 140 + progress * 20

            return (
              <div
                key={i}
                className="absolute"
                style={{
                  left: segment.x * CELL_SIZE + 1,
                  top: segment.y * CELL_SIZE + 1,
                  width: CELL_SIZE - 2,
                  height: CELL_SIZE - 2,
                  background: isHead
                    ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #16a34a 100%)'
                    : `linear-gradient(135deg, hsl(${hue}, 70%, 50%) 0%, hsl(${hue}, 60%, 40%) 100%)`,
                  borderRadius: isHead ? '6px 6px 4px 4px' : '4px',
                  boxShadow: isHead
                    ? '0 0 10px rgba(34, 197, 94, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)'
                    : `0 0 6px rgba(34, 197, 94, ${0.4 - progress * 0.3}), inset 0 1px 2px rgba(255, 255, 255, 0.2)`,
                  transform: isHead ? 'scale(1.05)' : `scale(${1 - progress * 0.1})`,
                }}
              >
                {isHead && (
                  <>
                    {/* Eyes */}
                    <div
                      className="absolute w-3 h-3 rounded-full bg-white flex items-center justify-center"
                      style={{ top: '2px', left: '3px' }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                    </div>
                    <div
                      className="absolute w-3 h-3 rounded-full bg-white flex items-center justify-center"
                      style={{ top: '2px', right: '3px' }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                    </div>
                    {/* Eye shine */}
                    <div className="absolute w-1 h-1 rounded-full bg-white" style={{ top: '2px', left: '4px' }} />
                    <div className="absolute w-1 h-1 rounded-full bg-white" style={{ top: '2px', right: '4px' }} />
                    {/* Tongue */}
                    <div
                      className="absolute w-1.5 h-2 rounded-b-full bg-red-500"
                      style={{ bottom: '0px', left: '50%', transform: 'translateX(-50%)' }}
                    />
                  </>
                )}
              </div>
            )
          })}

          {/* Food - Red Apple */}
          <div
            className="absolute"
            style={{
              left: food.x * CELL_SIZE + 1,
              top: food.y * CELL_SIZE + 1,
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
            }}
          >
            {/* Apple body */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #fca5a5 0%, #ef4444 40%, #dc2626 70%, #b91c1c 100%)',
                boxShadow: '0 0 12px rgba(239, 68, 68, 0.6), inset 2px 2px 4px rgba(255, 255, 255, 0.4), inset -1px -1px 3px rgba(0, 0, 0, 0.2)',
              }}
            />
            {/* Apple stem */}
            <div
              className="absolute"
              style={{
                top: '-2px',
                left: '50%',
                width: '2px',
                height: '5px',
                background: 'linear-gradient(to bottom, #78350f, #451a03)',
                transform: 'translateX(-50%) rotate(-10deg)',
                borderRadius: '1px',
              }}
            />
            {/* Apple leaf */}
            <div
              className="absolute"
              style={{
                top: '-1px',
                left: '60%',
                width: '6px',
                height: '4px',
                background: 'linear-gradient(135deg, #4ade80, #22c55e)',
                borderRadius: '0 50% 50% 0',
                transform: 'rotate(20deg)',
              }}
            />
            {/* Apple shine */}
            <div
              className="absolute w-2 h-2 rounded-full"
              style={{ top: '3px', left: '3px', background: 'rgba(255, 255, 255, 0.5)' }}
            />
          </div>
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
