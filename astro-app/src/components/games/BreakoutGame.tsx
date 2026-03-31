import { useState, useEffect, useCallback, useRef } from 'react'

type Props = {
  settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }
}

const CANVAS_WIDTH = 480
const CANVAS_HEIGHT = 600
const PADDLE_WIDTH = 80
const PADDLE_HEIGHT = 12
const BALL_SIZE = 10
const BRICK_ROWS = 6
const BRICK_COLS = 8
const BRICK_WIDTH = 54
const BRICK_HEIGHT = 20
const BRICK_PADDING = 4
const BRICK_OFFSET_TOP = 60
const BRICK_OFFSET_LEFT = 16

export default function BreakoutGame({ settings }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover' | 'win'>('menu')
  const [score, setScore] = useState(0)

  const gameRef = useRef({
    paddle: { x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2 },
    ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 80, vx: 4, vy: -4 },
    bricks: [] as { x: number; y: number; alive: boolean; color: string }[],
    keys: {} as Record<string, boolean>,
    lives: 3
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      gameRef.current.keys[e.key] = true
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      gameRef.current.keys[e.key] = false
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const initGame = useCallback(() => {
    const game = gameRef.current
    game.paddle = { x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2 }
    game.ball = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 80, vx: 4 * (Math.random() > 0.5 ? 1 : -1), vy: -4 }
    game.bricks = []
    game.lives = 3

    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6']
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        game.bricks.push({
          x: BRICK_OFFSET_LEFT + col * (BRICK_WIDTH + BRICK_PADDING),
          y: BRICK_OFFSET_TOP + row * (BRICK_HEIGHT + BRICK_PADDING),
          alive: true,
          color: colors[row]
        })
      }
    }

    setScore(0)
    setGameState('playing')
  }, [])

  useEffect(() => {
    if (gameState !== 'playing') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number

    const gameLoop = () => {
      const game = gameRef.current

      // Clear with gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
      bgGradient.addColorStop(0, settings.darkMode ? '#1e1b4b' : '#4c1d95')
      bgGradient.addColorStop(0.5, settings.darkMode ? '#0f172a' : '#1e1b4b')
      bgGradient.addColorStop(1, settings.darkMode ? '#020617' : '#0f172a')
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw subtle grid pattern
      ctx.strokeStyle = settings.darkMode ? 'rgba(139, 92, 246, 0.05)' : 'rgba(139, 92, 246, 0.1)'
      ctx.lineWidth = 1
      for (let x = 0; x < CANVAS_WIDTH; x += 30) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, CANVAS_HEIGHT)
        ctx.stroke()
      }
      for (let y = 0; y < CANVAS_HEIGHT; y += 30) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(CANVAS_WIDTH, y)
        ctx.stroke()
      }

      // Helper functions for color manipulation
      function lightenColor(hex: string, percent: number): string {
        const num = parseInt(hex.replace('#', ''), 16)
        const amt = Math.round(2.55 * percent)
        const R = Math.min(255, (num >> 16) + amt)
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt)
        const B = Math.min(255, (num & 0x0000FF) + amt)
        return `rgb(${R}, ${G}, ${B})`
      }

      function darkenColor(hex: string, percent: number): string {
        const num = parseInt(hex.replace('#', ''), 16)
        const amt = Math.round(2.55 * percent)
        const R = Math.max(0, (num >> 16) - amt)
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt)
        const B = Math.max(0, (num & 0x0000FF) - amt)
        return `rgb(${R}, ${G}, ${B})`
      }

      // Paddle movement
      if (game.keys['ArrowLeft'] || game.keys['a']) {
        game.paddle.x = Math.max(0, game.paddle.x - 8)
      }
      if (game.keys['ArrowRight'] || game.keys['d']) {
        game.paddle.x = Math.min(CANVAS_WIDTH - PADDLE_WIDTH, game.paddle.x + 8)
      }

      // Ball movement
      game.ball.x += game.ball.vx
      game.ball.y += game.ball.vy

      // Wall collision
      if (game.ball.x <= 0 || game.ball.x >= CANVAS_WIDTH - BALL_SIZE) {
        game.ball.vx *= -1
      }
      if (game.ball.y <= 0) {
        game.ball.vy *= -1
      }

      // Bottom - lose life
      if (game.ball.y >= CANVAS_HEIGHT) {
        game.lives--
        if (game.lives <= 0) {
          setGameState('gameover')
          return
        }
        game.ball = {
          x: CANVAS_WIDTH / 2,
          y: CANVAS_HEIGHT - 80,
          vx: 4 * (Math.random() > 0.5 ? 1 : -1),
          vy: -4
        }
      }

      // Paddle collision
      if (
        game.ball.y + BALL_SIZE >= CANVAS_HEIGHT - 40 &&
        game.ball.y <= CANVAS_HEIGHT - 40 + PADDLE_HEIGHT &&
        game.ball.x >= game.paddle.x &&
        game.ball.x <= game.paddle.x + PADDLE_WIDTH
      ) {
        game.ball.vy = -Math.abs(game.ball.vy)
        // Angle based on hit position
        const hitPos = (game.ball.x - game.paddle.x) / PADDLE_WIDTH
        game.ball.vx = (hitPos - 0.5) * 8
      }

      // Brick collision
      let allDestroyed = true
      game.bricks.forEach(brick => {
        if (!brick.alive) return
        allDestroyed = false

        if (
          game.ball.x + BALL_SIZE >= brick.x &&
          game.ball.x <= brick.x + BRICK_WIDTH &&
          game.ball.y + BALL_SIZE >= brick.y &&
          game.ball.y <= brick.y + BRICK_HEIGHT
        ) {
          brick.alive = false
          game.ball.vy *= -1
          setScore(prev => prev + 10)
        }
      })

      if (allDestroyed) {
        setGameState('win')
        return
      }

      // Draw bricks with gradients and glow
      game.bricks.forEach(brick => {
        if (!brick.alive) return

        // Brick glow
        ctx.shadowColor = brick.color
        ctx.shadowBlur = 8

        // Brick gradient
        const brickGradient = ctx.createLinearGradient(
          brick.x, brick.y,
          brick.x, brick.y + BRICK_HEIGHT
        )
        brickGradient.addColorStop(0, lightenColor(brick.color, 20))
        brickGradient.addColorStop(0.5, brick.color)
        brickGradient.addColorStop(1, darkenColor(brick.color, 20))
        ctx.fillStyle = brickGradient

        // Rounded brick
        ctx.beginPath()
        ctx.roundRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT, 3)
        ctx.fill()

        // Brick highlight
        ctx.shadowBlur = 0
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.fillRect(brick.x + 2, brick.y + 2, BRICK_WIDTH - 4, 4)

        // Brick outline
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.roundRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT, 3)
        ctx.stroke()
      })

      // Draw paddle with gradient and glow
      ctx.shadowColor = '#22c55e'
      ctx.shadowBlur = 15

      const paddleGradient = ctx.createLinearGradient(
        game.paddle.x, CANVAS_HEIGHT - 40,
        game.paddle.x, CANVAS_HEIGHT - 40 + PADDLE_HEIGHT
      )
      paddleGradient.addColorStop(0, '#4ade80')
      paddleGradient.addColorStop(0.5, '#22c55e')
      paddleGradient.addColorStop(1, '#16a34a')
      ctx.fillStyle = paddleGradient

      ctx.beginPath()
      ctx.roundRect(game.paddle.x, CANVAS_HEIGHT - 40, PADDLE_WIDTH, PADDLE_HEIGHT, 6)
      ctx.fill()

      // Paddle highlight
      ctx.shadowBlur = 0
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.beginPath()
      ctx.roundRect(game.paddle.x + 4, CANVAS_HEIGHT - 38, PADDLE_WIDTH - 8, 3, 2)
      ctx.fill()

      // Draw ball with glow and trail
      ctx.shadowColor = '#ffffff'
      ctx.shadowBlur = 15

      const ballGradient = ctx.createRadialGradient(
        game.ball.x + BALL_SIZE / 2 - 2, game.ball.y + BALL_SIZE / 2 - 2, 0,
        game.ball.x + BALL_SIZE / 2, game.ball.y + BALL_SIZE / 2, BALL_SIZE / 2
      )
      ballGradient.addColorStop(0, '#ffffff')
      ballGradient.addColorStop(0.5, '#f0f0f0')
      ballGradient.addColorStop(1, '#d4d4d4')
      ctx.fillStyle = ballGradient

      ctx.beginPath()
      ctx.arc(game.ball.x + BALL_SIZE / 2, game.ball.y + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      // Ball shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.beginPath()
      ctx.arc(game.ball.x + BALL_SIZE / 2 - 2, game.ball.y + BALL_SIZE / 2 - 2, 2, 0, Math.PI * 2)
      ctx.fill()

      // Draw lives
      ctx.fillStyle = '#fff'
      ctx.font = '16px sans-serif'
      ctx.fillText(`${settings.language === 'zh' ? '生命' : 'Lives'}: ${game.lives}`, 10, 30)

      animationId = requestAnimationFrame(gameLoop)
    }

    animationId = requestAnimationFrame(gameLoop)
    return () => cancelAnimationFrame(animationId)
  }, [gameState, settings.darkMode, settings.language])

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <h1 className={`text-2xl font-bold mb-4 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
        🎮 Breakout
      </h1>

      <div className={`mb-2 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
        {settings.language === 'zh' ? '得分' : 'Score'}: {score}
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-2 rounded-lg max-w-full"
        style={{ borderColor: settings.darkMode ? '#334155' : '#9ca3af' }}
      />

      {gameState === 'menu' && (
        <div className="mt-4 text-center">
          <button onClick={initGame} className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium text-lg">
            {settings.language === 'zh' ? '开始游戏' : 'Start Game'}
          </button>
          <p className={`mt-4 text-sm ${settings.darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            {settings.language === 'zh' ? '← → 移动挡板' : '← → Move paddle'}
          </p>
        </div>
      )}

      {(gameState === 'gameover' || gameState === 'win') && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70">
          <div className={`p-8 rounded-2xl text-center ${settings.darkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <h2 className={`text-3xl font-bold mb-4 ${gameState === 'win' ? 'text-green-500' : 'text-red-500'}`}>
              {gameState === 'win' ? (settings.language === 'zh' ? '🎉 胜利！' : '🎉 You Win!') : (settings.language === 'zh' ? '游戏结束' : 'Game Over')}
            </h2>
            <p className={`text-xl mb-4 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
              {settings.language === 'zh' ? '得分' : 'Score'}: {score}
            </p>
            <button onClick={initGame} className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium">
              {settings.language === 'zh' ? '再来一次' : 'Play Again'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
