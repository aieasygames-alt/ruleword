import { useState, useEffect, useCallback, useRef } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type BrickBreakerProps = {
  settings: Settings
  onBack: () => void
}

const CANVAS_WIDTH = 320
const CANVAS_HEIGHT = 480
const PADDLE_WIDTH = 80
const PADDLE_HEIGHT = 12
const BALL_RADIUS = 8
const BRICK_ROWS = 5
const BRICK_COLS = 8
const BRICK_WIDTH = 35
const BRICK_HEIGHT = 15
const BRICK_PADDING = 4
const BRICK_OFFSET_TOP = 50
const BRICK_OFFSET_LEFT = 8

type Ball = {
  x: number
  y: number
  dx: number
  dy: number
}

type Paddle = {
  x: number
  width: number
}

type Brick = {
  x: number
  y: number
  alive: boolean
  color: string
}

const BRICK_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']

const getDailySeed = (): number => {
  const today = new Date()
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
}

const seededRandom = (seed: number): () => number => {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

const createBricks = (seed?: number): Brick[] => {
  const random = seed ? seededRandom(seed) : () => Math.random()
  const bricks: Brick[] = []

  for (let row = 0; row < BRICK_ROWS; row++) {
    for (let col = 0; col < BRICK_COLS; col++) {
      bricks.push({
        x: BRICK_OFFSET_LEFT + col * (BRICK_WIDTH + BRICK_PADDING),
        y: BRICK_OFFSET_TOP + row * (BRICK_HEIGHT + BRICK_PADDING),
        alive: true,
        color: BRICK_COLORS[row]
      })
    }
  }

  return bricks
}

export default function BrickBreaker({ settings, onBack }: BrickBreakerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [level, setLevel] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [isWon, setIsWon] = useState(false)
  const [gameMode, setGameMode] = useState<'menu' | 'practice' | 'daily'>('menu')
  const [highScore, setHighScore] = useState(0)
  const [dailyHighScore, setDailyHighScore] = useState(0)
  const [dailyPlayed, setDailyPlayed] = useState(false)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')

  const ballRef = useRef<Ball>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 50,
    dx: 4,
    dy: -4
  })
  const paddleRef = useRef<Paddle>({
    x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
    width: PADDLE_WIDTH
  })
  const bricksRef = useRef<Brick[]>(createBricks())
  const animationRef = useRef<number>()

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'
  const borderClass = settings.darkMode ? 'border-gray-700' : 'border-gray-200'

  const getSpeed = useCallback(() => {
    switch (difficulty) {
      case 'easy': return 3
      case 'medium': return 4
      case 'hard': return 5
    }
  }, [difficulty])

  useEffect(() => {
    const saved = localStorage.getItem('brickbreaker-highscore')
    if (saved) setHighScore(parseInt(saved))

    const today = getDailySeed().toString()
    const lastPlayed = localStorage.getItem('brickbreaker-daily-date')
    const dailyScore = localStorage.getItem('brickbreaker-daily-score')
    if (dailyScore) setDailyHighScore(parseInt(dailyScore))
    setDailyPlayed(lastPlayed === today)
  }, [])

  const resetBall = useCallback(() => {
    const speed = getSpeed()
    ballRef.current = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 50,
      dx: speed * (Math.random() > 0.5 ? 1 : -1),
      dy: -speed
    }
  }, [getSpeed])

  const startGame = useCallback((mode: 'practice' | 'daily') => {
    setGameMode(mode)
    setScore(0)
    setLives(3)
    setLevel(1)
    setGameOver(false)
    setIsWon(false)
    setIsPaused(false)

    if (mode === 'daily') {
      const random = seededRandom(getDailySeed())
      const diff = random() < 0.33 ? 'easy' : random() < 0.66 ? 'medium' : 'hard'
      setDifficulty(diff)
    }

    const seed = mode === 'daily' ? getDailySeed() : undefined
    bricksRef.current = createBricks(seed)
    paddleRef.current = {
      x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
      width: PADDLE_WIDTH
    }
    resetBall()
    setIsPlaying(true)
  }, [resetBall])

  const nextLevel = useCallback(() => {
    const seed = gameMode === 'daily' ? getDailySeed() + level : undefined
    bricksRef.current = createBricks(seed)
    setLevel(prev => prev + 1)
    resetBall()
  }, [gameMode, level, resetBall])

  // Game loop
  useEffect(() => {
    if (!isPlaying || isPaused || gameOver) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const ball = ballRef.current
    const paddle = paddleRef.current
    const bricks = bricksRef.current

    const gameLoop = () => {
      // Clear canvas
      ctx.fillStyle = settings.darkMode ? '#1e293b' : '#f3f4f6'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw bricks
      bricks.forEach(brick => {
        if (brick.alive) {
          ctx.fillStyle = brick.color
          ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT)
          ctx.strokeStyle = settings.darkMode ? '#475569' : '#e5e7eb'
          ctx.strokeRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT)
        }
      })

      // Draw paddle
      ctx.fillStyle = settings.darkMode ? '#60a5fa' : '#3b82f6'
      ctx.fillRect(paddle.x, CANVAS_HEIGHT - 30, paddle.width, PADDLE_HEIGHT)
      ctx.beginPath()
      ctx.arc(paddle.x + paddle.width / 2, CANVAS_HEIGHT - 30 + PADDLE_HEIGHT / 2, PADDLE_HEIGHT / 2, 0, Math.PI * 2)
      ctx.fill()

      // Draw ball
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2)
      ctx.fillStyle = settings.darkMode ? '#f8fafc' : '#1f2937'
      ctx.fill()
      ctx.closePath()

      // Move ball
      ball.x += ball.dx
      ball.y += ball.dy

      // Wall collision
      if (ball.x + BALL_RADIUS > CANVAS_WIDTH || ball.x - BALL_RADIUS < 0) {
        ball.dx = -ball.dx
      }
      if (ball.y - BALL_RADIUS < 0) {
        ball.dy = -ball.dy
      }

      // Paddle collision
      if (
        ball.y + BALL_RADIUS > CANVAS_HEIGHT - 30 &&
        ball.y - BALL_RADIUS < CANVAS_HEIGHT - 30 + PADDLE_HEIGHT &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width
      ) {
        ball.dy = -Math.abs(ball.dy)
        // Add angle based on where ball hits paddle
        const hitPos = (ball.x - paddle.x) / paddle.width
        ball.dx = (hitPos - 0.5) * 8
      }

      // Bottom collision (lose life)
      if (ball.y + BALL_RADIUS > CANVAS_HEIGHT) {
        const newLives = lives - 1
        setLives(newLives)

        if (newLives <= 0) {
          setGameOver(true)
          setIsPlaying(false)

          if (score > highScore) {
            setHighScore(score)
            localStorage.setItem('brickbreaker-highscore', score.toString())
          }

          if (gameMode === 'daily') {
            if (score > dailyHighScore) {
              setDailyHighScore(score)
              localStorage.setItem('brickbreaker-daily-score', score.toString())
            }
            const today = getDailySeed().toString()
            localStorage.setItem('brickbreaker-daily-date', today)
            setDailyPlayed(true)
          }
        } else {
          resetBall()
        }
        return
      }

      // Brick collision
      let allDestroyed = true
      bricks.forEach(brick => {
        if (brick.alive) {
          allDestroyed = false
          if (
            ball.x + BALL_RADIUS > brick.x &&
            ball.x - BALL_RADIUS < brick.x + BRICK_WIDTH &&
            ball.y + BALL_RADIUS > brick.y &&
            ball.y - BALL_RADIUS < brick.y + BRICK_HEIGHT
          ) {
            brick.alive = false
            ball.dy = -ball.dy
            setScore(prev => prev + 10 * level)
          }
        }
      })

      // Check win
      if (allDestroyed) {
        nextLevel()
        return
      }

      animationRef.current = requestAnimationFrame(gameLoop)
    }

    animationRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, isPaused, gameOver, lives, score, level, highScore, dailyHighScore, gameMode, settings.darkMode, resetBall, nextLevel])

  // Mouse/touch controls
  useEffect(() => {
    if (!isPlaying || gameOver) return

    const handleMove = (clientX: number) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = clientX - rect.left
      const scale = CANVAS_WIDTH / rect.width

      paddleRef.current.x = Math.max(0, Math.min(CANVAS_WIDTH - paddleRef.current.width, x * scale - paddleRef.current.width / 2))
    }

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX)
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      handleMove(e.touches[0].clientX)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [isPlaying, gameOver])

  // Keyboard controls
  useEffect(() => {
    if (!isPlaying || gameOver) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const paddle = paddleRef.current
      const moveAmount = 20

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
          paddle.x = Math.max(0, paddle.x - moveAmount)
          break
        case 'ArrowRight':
        case 'd':
          paddle.x = Math.min(CANVAS_WIDTH - paddle.width, paddle.x + moveAmount)
          break
        case 'p':
        case 'Escape':
          setIsPaused(prev => !prev)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, gameOver])

  const goToMenu = () => {
    setGameMode('menu')
    setIsPlaying(false)
    setGameOver(false)
    setIsWon(false)
  }

  if (gameMode === 'menu') {
    return (
      <div className={`min-h-screen flex flex-col items-center py-4 px-2 ${bgClass} ${textClass}`}>
        <div className="w-full max-w-md">
          <div className={`flex items-center justify-between border-b ${borderClass} pb-3 mb-4`}>
            <button onClick={onBack} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold">{settings.language === 'zh' ? '打砖块' : 'Brick Breaker'}</h1>
            <div className="w-8" />
          </div>

          <div className="text-6xl text-center mb-8">🧱🏓</div>

          {/* High Scores */}
          <div className={`grid grid-cols-2 gap-4 mb-8 ${cardBgClass} border ${borderClass} rounded-xl p-4`}>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{highScore}</p>
              <p className="text-sm">{settings.language === 'zh' ? '最高分' : 'High Score'}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-500">{dailyHighScore}</p>
              <p className="text-sm">{settings.language === 'zh' ? '每日最高' : 'Daily Best'}</p>
            </div>
          </div>

          {/* Game Modes */}
          <div className="space-y-4">
            <button
              onClick={() => startGame('practice')}
              className={`w-full py-4 rounded-xl font-bold ${cardBgClass} border ${borderClass} hover:bg-gray-700/20`}
            >
              <span className="text-2xl mr-2">🎮</span>
              {settings.language === 'zh' ? '练习模式' : 'Practice Mode'}
            </button>

            <button
              onClick={() => startGame('daily')}
              disabled={dailyPlayed}
              className={`w-full py-4 rounded-xl font-bold ${dailyPlayed ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700/20'} ${cardBgClass} border ${borderClass}`}
            >
              <span className="text-2xl mr-2">📅</span>
              {settings.language === 'zh' ? '每日挑战' : 'Daily Challenge'}
              {dailyPlayed && <span className="ml-2 text-sm">✓</span>}
            </button>
          </div>

          {/* Difficulty */}
          <div className={`mt-6 ${cardBgClass} border ${borderClass} rounded-xl p-4`}>
            <p className="text-sm font-medium mb-2">{settings.language === 'zh' ? '难度' : 'Difficulty'}</p>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2 rounded-lg font-medium ${
                    difficulty === d ? 'bg-green-600 text-white' : settings.darkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}
                >
                  {d === 'easy' ? (settings.language === 'zh' ? '简单' : 'Easy') :
                   d === 'medium' ? (settings.language === 'zh' ? '中等' : 'Medium') :
                   (settings.language === 'zh' ? '困难' : 'Hard')}
                </button>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className={`mt-6 ${cardBgClass} border ${borderClass} rounded-xl p-4`}>
            <p className="text-sm font-medium mb-2">{settings.language === 'zh' ? '说明' : 'Instructions'}</p>
            <div className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p>{settings.language === 'zh'
                ? '用鼠标/触摸或方向键控制挡板，反弹球来消除所有砖块！'
                : 'Control the paddle with mouse/touch or arrow keys to bounce the ball and destroy all bricks!'}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex flex-col items-center py-4 px-2 ${bgClass} ${textClass}`}>
      <div className="w-full max-w-md">
        <div className={`flex items-center justify-between border-b ${borderClass} pb-3 mb-4`}>
          <button onClick={goToMenu} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">
            {gameMode === 'daily' ? (settings.language === 'zh' ? '每日挑战' : 'Daily') : (settings.language === 'zh' ? '练习模式' : 'Practice')}
          </h1>
          <button
            onClick={() => setIsPaused(prev => !prev)}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded"
          >
            {isPaused ? '▶️' : '⏸️'}
          </button>
        </div>

        {/* Stats */}
        <div className="flex justify-between mb-4">
          <div className={`flex-1 ${cardBgClass} border ${borderClass} rounded-xl p-2 text-center mr-2`}>
            <p className="text-xs">{settings.language === 'zh' ? '分数' : 'Score'}</p>
            <p className="text-xl font-bold">{score}</p>
          </div>
          <div className={`flex-1 ${cardBgClass} border ${borderClass} rounded-xl p-2 text-center mx-2`}>
            <p className="text-xs">{settings.language === 'zh' ? '关卡' : 'Level'}</p>
            <p className="text-xl font-bold">{level}</p>
          </div>
          <div className={`flex-1 ${cardBgClass} border ${borderClass} rounded-xl p-2 text-center ml-2`}>
            <p className="text-xs">{settings.language === 'zh' ? '生命' : 'Lives'}</p>
            <p className="text-xl font-bold">{'❤️'.repeat(lives)}</p>
          </div>
        </div>

        {/* Canvas */}
        <div className={`${cardBgClass} border ${borderClass} rounded-xl p-2 flex justify-center`}>
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="rounded-lg max-w-full"
            style={{ touchAction: 'none' }}
          />
        </div>

        {/* Paused */}
        {isPaused && !gameOver && (
          <div className="mt-4">
            <div className={`${cardBgClass} border ${borderClass} rounded-xl p-6 text-center`}>
              <p className="text-xl font-bold mb-4">{settings.language === 'zh' ? '游戏暂停' : 'Paused'}</p>
              <button
                onClick={() => setIsPaused(false)}
                className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700"
              >
                {settings.language === 'zh' ? '继续游戏' : 'Resume'}
              </button>
            </div>
          </div>
        )}

        {/* Game Over */}
        {gameOver && (
          <div className="mt-4">
            <div className={`${cardBgClass} border ${borderClass} rounded-xl p-6 text-center`}>
              <h2 className="text-2xl font-bold mb-4">{settings.language === 'zh' ? '游戏结束!' : 'Game Over!'}</h2>
              <p className="mb-2">{settings.language === 'zh' ? '最终得分' : 'Final Score'}: {score}</p>
              <p className="mb-4">{settings.language === 'zh' ? '到达关卡' : 'Level Reached'}: {level}</p>
              {score >= highScore && score > 0 && (
                <p className="text-yellow-500 font-bold mb-2">🏆 {settings.language === 'zh' ? '新纪录!' : 'New High Score!'}</p>
              )}
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => startGame(gameMode === 'daily' ? 'daily' : 'practice')}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700"
                >
                  {settings.language === 'zh' ? '再玩一次' : 'Play Again'}
                </button>
                <button
                  onClick={goToMenu}
                  className={`flex-1 py-3 rounded-xl font-bold ${settings.darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  {settings.language === 'zh' ? '返回菜单' : 'Menu'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
