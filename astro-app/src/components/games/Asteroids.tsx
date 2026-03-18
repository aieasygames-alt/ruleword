import { useState, useEffect, useCallback, useRef } from 'react'

type Props = {
  settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }
}

const CANVAS_WIDTH = 600
const CANVAS_HEIGHT = 500

type Vec2 = { x: number; y: number }

export default function Asteroids({ settings }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu')
  const [score, setScore] = useState(0)

  const gameRef = useRef({
    ship: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, angle: -Math.PI / 2, vx: 0, vy: 0 } as Vec2 & { angle: number; vx: number; vy: number },
    bullets: [] as (Vec2 & { vx: number; vy: number; life: number })[],
    asteroids: [] as (Vec2 & { vx: number; vy: number; size: number; rotation: number; rotSpeed: number })[],
    keys: {} as Record<string, boolean>,
    lastShot: 0
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      gameRef.current.keys[e.key] = true
      if (e.key === ' ') e.preventDefault()
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
    game.ship = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, angle: -Math.PI / 2, vx: 0, vy: 0 }
    game.bullets = []
    game.asteroids = []

    // Create initial asteroids
    for (let i = 0; i < 5; i++) {
      game.asteroids.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: 40,
        rotation: 0,
        rotSpeed: (Math.random() - 0.5) * 0.05
      })
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

    const wrapPos = (v: number, max: number) => {
      if (v < 0) return max
      if (v > max) return 0
      return v
    }

    const drawAsteroid = (x: number, y: number, size: number, rotation: number) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)
      ctx.beginPath()
      const points = 8
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2
        const r = size * (0.7 + Math.sin(i * 3) * 0.3)
        const px = Math.cos(angle) * r
        const py = Math.sin(angle) * r
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.stroke()
      ctx.restore()
    }

    const gameLoop = () => {
      const game = gameRef.current
      const now = Date.now()

      // Clear
      ctx.fillStyle = settings.darkMode ? '#0f172a' : '#1e293b'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw stars
      ctx.fillStyle = '#ffffff'
      for (let i = 0; i < 80; i++) {
        const x = (i * 97) % CANVAS_WIDTH
        const y = (i * 131) % CANVAS_HEIGHT
        ctx.fillRect(x, y, 1, 1)
      }

      // Ship controls
      if (game.keys['ArrowLeft'] || game.keys['a']) {
        game.ship.angle -= 0.08
      }
      if (game.keys['ArrowRight'] || game.keys['d']) {
        game.ship.angle += 0.08
      }
      if (game.keys['ArrowUp'] || game.keys['w']) {
        game.ship.vx += Math.cos(game.ship.angle) * 0.15
        game.ship.vy += Math.sin(game.ship.angle) * 0.15
      }

      // Apply friction
      game.ship.vx *= 0.99
      game.ship.vy *= 0.99

      // Speed limit
      const speed = Math.sqrt(game.ship.vx ** 2 + game.ship.vy ** 2)
      if (speed > 8) {
        game.ship.vx = (game.ship.vx / speed) * 8
        game.ship.vy = (game.ship.vy / speed) * 8
      }

      // Move ship
      game.ship.x += game.ship.vx
      game.ship.y += game.ship.vy
      game.ship.x = wrapPos(game.ship.x, CANVAS_WIDTH)
      game.ship.y = wrapPos(game.ship.y, CANVAS_HEIGHT)

      // Shooting
      if (game.keys[' '] && now - game.lastShot > 200) {
        game.bullets.push({
          x: game.ship.x + Math.cos(game.ship.angle) * 15,
          y: game.ship.y + Math.sin(game.ship.angle) * 15,
          vx: Math.cos(game.ship.angle) * 10,
          vy: Math.sin(game.ship.angle) * 10,
          life: 60
        })
        game.lastShot = now
      }

      // Update bullets
      ctx.fillStyle = '#22c55e'
      game.bullets = game.bullets.filter(bullet => {
        bullet.x += bullet.vx
        bullet.y += bullet.vy
        bullet.life--
        if (bullet.life <= 0) return false
        bullet.x = wrapPos(bullet.x, CANVAS_WIDTH)
        bullet.y = wrapPos(bullet.y, CANVAS_HEIGHT)
        ctx.beginPath()
        ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2)
        ctx.fill()
        return true
      })

      // Update asteroids
      ctx.strokeStyle = '#a78bfa'
      ctx.lineWidth = 2
      game.asteroids.forEach(asteroid => {
        asteroid.x += asteroid.vx
        asteroid.y += asteroid.vy
        asteroid.x = wrapPos(asteroid.x, CANVAS_WIDTH)
        asteroid.y = wrapPos(asteroid.y, CANVAS_HEIGHT)
        asteroid.rotation += asteroid.rotSpeed
        drawAsteroid(asteroid.x, asteroid.y, asteroid.size, asteroid.rotation)
      })

      // Bullet-asteroid collision
      game.bullets.forEach((bullet, bi) => {
        game.asteroids.forEach((asteroid, ai) => {
          const dist = Math.sqrt((bullet.x - asteroid.x) ** 2 + (bullet.y - asteroid.y) ** 2)
          if (dist < asteroid.size) {
            game.bullets.splice(bi, 1)
            if (asteroid.size > 15) {
              // Split asteroid
              for (let i = 0; i < 2; i++) {
                game.asteroids.push({
                  x: asteroid.x,
                  y: asteroid.y,
                  vx: (Math.random() - 0.5) * 4,
                  vy: (Math.random() - 0.5) * 4,
                  size: asteroid.size / 2,
                  rotation: 0,
                  rotSpeed: (Math.random() - 0.5) * 0.1
                })
              }
            }
            game.asteroids.splice(ai, 1)
            setScore(prev => prev + Math.floor(100 / asteroid.size * 10))
          }
        })
      })

      // Ship-asteroid collision
      for (const asteroid of game.asteroids) {
        const dist = Math.sqrt((game.ship.x - asteroid.x) ** 2 + (game.ship.y - asteroid.y) ** 2)
        if (dist < asteroid.size + 10) {
          setGameState('gameover')
          return
        }
      }

      // Spawn new asteroids
      if (game.asteroids.length < 3) {
        game.asteroids.push({
          x: Math.random() < 0.5 ? 0 : CANVAS_WIDTH,
          y: Math.random() * CANVAS_HEIGHT,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          size: 35 + Math.random() * 20,
          rotation: 0,
          rotSpeed: (Math.random() - 0.5) * 0.05
        })
      }

      // Draw ship
      ctx.save()
      ctx.translate(game.ship.x, game.ship.y)
      ctx.rotate(game.ship.angle)
      ctx.fillStyle = '#22c55e'
      ctx.beginPath()
      ctx.moveTo(15, 0)
      ctx.lineTo(-10, -10)
      ctx.lineTo(-5, 0)
      ctx.lineTo(-10, 10)
      ctx.closePath()
      ctx.fill()
      ctx.restore()

      animationId = requestAnimationFrame(gameLoop)
    }

    animationId = requestAnimationFrame(gameLoop)
    return () => cancelAnimationFrame(animationId)
  }, [gameState, settings.darkMode])

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <h1 className={`text-2xl font-bold mb-4 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
        ☄️ Asteroids
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
            {settings.language === 'zh' ? '← → 旋转 | ↑ 推进 | 空格 射击' : '← → Rotate | ↑ Thrust | Space Shoot'}
          </p>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70">
          <div className={`p-8 rounded-2xl text-center ${settings.darkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <h2 className="text-3xl font-bold text-red-500 mb-4">{settings.language === 'zh' ? '游戏结束' : 'Game Over'}</h2>
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
