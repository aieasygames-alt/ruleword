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
  trail: { x: number; y: number }[]
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
  hits: number
}

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  life: number
  size: number
}

const BRICK_COLORS = [
  { main: '#ef4444', light: '#fca5a5', dark: '#b91c1c' },
  { main: '#f97316', light: '#fdba74', dark: '#c2410c' },
  { main: '#eab308', light: '#fde047', dark: '#a16207' },
  { main: '#22c55e', light: '#86efac', dark: '#15803d' },
  { main: '#3b82f6', light: '#93c5fd', dark: '#1d4ed8' }
]

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
  const bricks: Brick[] = []

  for (let row = 0; row < BRICK_ROWS; row++) {
    for (let col = 0; col < BRICK_COLS; col++) {
      bricks.push({
        x: BRICK_OFFSET_LEFT + col * (BRICK_WIDTH + BRICK_PADDING),
        y: BRICK_OFFSET_TOP + row * (BRICK_HEIGHT + BRICK_PADDING),
        alive: true,
        color: BRICK_COLORS[row].main,
        hits: 0
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
    dy: -4,
    trail: []
  })
  const paddleRef = useRef<Paddle>({
    x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
    width: PADDLE_WIDTH
  })
  const bricksRef = useRef<Brick[]>(createBricks())
  const particlesRef = useRef<Particle[]>([])
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

  const addParticles = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
      const speed = 2 + Math.random() * 4
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: 1,
        size: 2 + Math.random() * 3
      })
    }
  }

  const resetBall = useCallback(() => {
    const speed = getSpeed()
    ballRef.current = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 50,
      dx: speed * (Math.random() > 0.5 ? 1 : -1),
      dy: -speed,
      trail: []
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
    particlesRef.current = []

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
      // Clear canvas with gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
      if (settings.darkMode) {
        bgGradient.addColorStop(0, '#1e293b')
        bgGradient.addColorStop(1, '#0f172a')
      } else {
        bgGradient.addColorStop(0, '#f3f4f6')
        bgGradient.addColorStop(1, '#e5e7eb')
      }
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw grid pattern
      ctx.strokeStyle = settings.darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'
      ctx.lineWidth = 1
      for (let i = 0; i < CANVAS_WIDTH; i += 20) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, CANVAS_HEIGHT)
        ctx.stroke()
      }
      for (let i = 0; i < CANVAS_HEIGHT; i += 20) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(CANVAS_WIDTH, i)
        ctx.stroke()
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.1 // gravity
        p.life -= 0.025
        if (p.life > 0) {
          ctx.fillStyle = p.color.replace(')', `, ${p.life})`).replace('rgb', 'rgba')
          ctx.shadowColor = p.color
          ctx.shadowBlur = 5
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0
          return true
        }
        return false
      })

      // Draw bricks with gradient and glow
      bricks.forEach((brick, index) => {
        if (brick.alive) {
          const colorSet = BRICK_COLORS[index % BRICK_COLORS.length]

          // Glow effect
          ctx.shadowColor = colorSet.main
          ctx.shadowBlur = 8

          // Brick gradient
          const brickGradient = ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + BRICK_HEIGHT)
          brickGradient.addColorStop(0, colorSet.light)
          brickGradient.addColorStop(0.5, colorSet.main)
          brickGradient.addColorStop(1, colorSet.dark)
          ctx.fillStyle = brickGradient

          // Rounded rectangle
          ctx.beginPath()
          const r = 3
          ctx.moveTo(brick.x + r, brick.y)
          ctx.lineTo(brick.x + BRICK_WIDTH - r, brick.y)
          ctx.quadraticCurveTo(brick.x + BRICK_WIDTH, brick.y, brick.x + BRICK_WIDTH, brick.y + r)
          ctx.lineTo(brick.x + BRICK_WIDTH, brick.y + BRICK_HEIGHT - r)
          ctx.quadraticCurveTo(brick.x + BRICK_WIDTH, brick.y + BRICK_HEIGHT, brick.x + BRICK_WIDTH - r, brick.y + BRICK_HEIGHT)
          ctx.lineTo(brick.x + r, brick.y + BRICK_HEIGHT)
          ctx.quadraticCurveTo(brick.x, brick.y + BRICK_HEIGHT, brick.x, brick.y + BRICK_HEIGHT - r)
          ctx.lineTo(brick.x, brick.y + r)
          ctx.quadraticCurveTo(brick.x, brick.y, brick.x + r, brick.y)
          ctx.closePath()
          ctx.fill()

          // Highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
          ctx.fillRect(brick.x + 2, brick.y + 2, BRICK_WIDTH - 4, 3)

          ctx.shadowBlur = 0
        }
      })

      // Draw paddle with glow and gradient
      ctx.shadowColor = '#3b82f6'
      ctx.shadowBlur = 15

      const paddleGradient = ctx.createLinearGradient(paddle.x, CANVAS_HEIGHT - 30, paddle.x, CANVAS_HEIGHT - 30 + PADDLE_HEIGHT)
      paddleGradient.addColorStop(0, '#93c5fd')
      paddleGradient.addColorStop(0.5, '#3b82f6')
      paddleGradient.addColorStop(1, '#1d4ed8')
      ctx.fillStyle = paddleGradient

      // Rounded paddle
      ctx.beginPath()
      ctx.roundRect(paddle.x, CANVAS_HEIGHT - 30, paddle.width, PADDLE_HEIGHT, 6)
      ctx.fill()

      // Paddle highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.beginPath()
      ctx.roundRect(paddle.x + 4, CANVAS_HEIGHT - 28, paddle.width - 8, 4, 2)
      ctx.fill()

      ctx.shadowBlur = 0

      // Update ball trail
      ball.trail.unshift({ x: ball.x, y: ball.y })
      if (ball.trail.length > 8) ball.trail.pop()

      // Draw ball trail
      ball.trail.forEach((t, i) => {
        const alpha = (1 - i / ball.trail.length) * 0.5
        const size = BALL_RADIUS * (1 - i / ball.trail.length)
        ctx.fillStyle = `rgba(251, 191, 36, ${alpha})`
        ctx.beginPath()
        ctx.arc(t.x, t.y, size, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw ball with glow
      ctx.shadowColor = '#fbbf24'
      ctx.shadowBlur = 15

      const ballGradient = ctx.createRadialGradient(ball.x - 2, ball.y - 2, 0, ball.x, ball.y, BALL_RADIUS)
      ballGradient.addColorStop(0, '#fef3c7')
      ballGradient.addColorStop(0.5, '#fbbf24')
      ballGradient.addColorStop(1, '#d97706')
      ctx.fillStyle = ballGradient

      ctx.beginPath()
      ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2)
      ctx.fill()

      // Ball shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.beginPath()
      ctx.arc(ball.x - 2, ball.y - 2, 3, 0, Math.PI * 2)
      ctx.fill()

      ctx.shadowBlur = 0

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
        addParticles(ball.x, ball.y + BALL_RADIUS, 'rgb(59, 130, 246)', 5)
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
      bricks.forEach((brick, index) => {
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

            // Add particles
            const colorSet = BRICK_COLORS[index % BRICK_COLORS.length]
            addParticles(
              brick.x + BRICK_WIDTH / 2,
              brick.y + BRICK_HEIGHT / 2,
              colorSet.main.replace('#', 'rgb(').replace(/(.{2})(.{2})(.{2})/, (_, r, g, b) =>
                `${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)})`
              ),
              12
            )
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
              className={`w-full py-4 rounded-xl font-bold ${cardBgClass} border ${borderClass} hover:bg-green-600/20 hover:border-green-500 transition-all`}
            >
              <span className="text-2xl mr-2">🎮</span>
              {settings.language === 'zh' ? '练习模式' : 'Practice Mode'}
            </button>

            <button
              onClick={() => startGame('daily')}
              disabled={dailyPlayed}
              className={`w-full py-4 rounded-xl font-bold ${dailyPlayed ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-600/20 hover:border-purple-500'} ${cardBgClass} border ${borderClass} transition-all`}
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
                  className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                    difficulty === d ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30' : settings.darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
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
            <p className="text-xl font-bold text-yellow-500">{score}</p>
          </div>
          <div className={`flex-1 ${cardBgClass} border ${borderClass} rounded-xl p-2 text-center mx-2`}>
            <p className="text-xs">{settings.language === 'zh' ? '关卡' : 'Level'}</p>
            <p className="text-xl font-bold text-blue-500">{level}</p>
          </div>
          <div className={`flex-1 ${cardBgClass} border ${borderClass} rounded-xl p-2 text-center ml-2`}>
            <p className="text-xs">{settings.language === 'zh' ? '生命' : 'Lives'}</p>
            <p className="text-xl font-bold text-red-500">{'❤️'.repeat(lives)}</p>
          </div>
        </div>

        {/* Canvas */}
        <div className={`${cardBgClass} border-2 border-blue-500/50 rounded-xl p-2 flex justify-center shadow-lg shadow-blue-500/20`}>
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
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-bold hover:from-green-500 hover:to-green-400 shadow-lg shadow-green-500/30"
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
              <p className="mb-2">{settings.language === 'zh' ? '最终得分' : 'Final Score'}: <span className="text-yellow-500 font-bold">{score}</span></p>
              <p className="mb-4">{settings.language === 'zh' ? '到达关卡' : 'Level Reached'}: <span className="text-blue-500 font-bold">{level}</span></p>
              {score >= highScore && score > 0 && (
                <p className="text-yellow-500 font-bold mb-2">🏆 {settings.language === 'zh' ? '新纪录!' : 'New High Score!'}</p>
              )}
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => startGame(gameMode === 'daily' ? 'daily' : 'practice')}
                  className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-bold hover:from-green-500 hover:to-green-400 shadow-lg shadow-green-500/30"
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
