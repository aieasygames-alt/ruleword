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

      // Glow effect
      ctx.shadowColor = '#8b5cf6'
      ctx.shadowBlur = 15

      // Asteroid body with gradient
      ctx.beginPath()
      const points = 10
      const vertices = []
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2
        const r = size * (0.7 + Math.sin(i * 3.7 + rotation * 5) * 0.3)
        vertices.push({
          x: Math.cos(angle) * r,
          y: Math.sin(angle) * r
        })
        if (i === 0) ctx.moveTo(vertices[i].x, vertices[i].y)
        else ctx.lineTo(vertices[i].x, vertices[i].y)
      }
      ctx.closePath()

      // Fill with gradient
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size)
      gradient.addColorStop(0, '#4c1d95')
      gradient.addColorStop(0.5, '#6b21a8')
      gradient.addColorStop(1, '#7c3aed')
      ctx.fillStyle = gradient
      ctx.fill()

      // Outline
      ctx.strokeStyle = '#a78bfa'
      ctx.lineWidth = 2
      ctx.stroke()

      // Surface details
      ctx.shadowBlur = 0
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.beginPath()
      ctx.arc(-size * 0.2, -size * 0.2, size * 0.2, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    const gameLoop = () => {
      const game = gameRef.current
      const now = Date.now()

      // Clear with gradient background
      const bgGradient = ctx.createRadialGradient(
        CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 0,
        CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH
      )
      bgGradient.addColorStop(0, settings.darkMode ? '#1e1b4b' : '#312e81')
      bgGradient.addColorStop(0.5, settings.darkMode ? '#0f172a' : '#1e1b4b')
      bgGradient.addColorStop(1, settings.darkMode ? '#020617' : '#0f172a')
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw animated stars
      const time = Date.now() / 1000
      for (let i = 0; i < 100; i++) {
        const x = (i * 97) % CANVAS_WIDTH
        const y = (i * 131) % CANVAS_HEIGHT
        const twinkle = Math.sin(time * 2 + i) * 0.5 + 0.5
        const size = (i % 3) + 1
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + twinkle * 0.7})`
        ctx.beginPath()
        ctx.arc(x, y, size * 0.5, 0, Math.PI * 2)
        ctx.fill()
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

      // Update and draw bullets with glow effect
      game.bullets = game.bullets.filter(bullet => {
        bullet.x += bullet.vx
        bullet.y += bullet.vy
        bullet.life--
        if (bullet.life <= 0) return false
        bullet.x = wrapPos(bullet.x, CANVAS_WIDTH)
        bullet.y = wrapPos(bullet.y, CANVAS_HEIGHT)

        // Bullet trail
        ctx.fillStyle = 'rgba(34, 197, 94, 0.3)'
        ctx.beginPath()
        ctx.arc(bullet.x - bullet.vx * 0.5, bullet.y - bullet.vy * 0.5, 2, 0, Math.PI * 2)
        ctx.fill()

        // Main bullet with glow
        ctx.shadowColor = '#22c55e'
        ctx.shadowBlur = 10
        const bulletGradient = ctx.createRadialGradient(bullet.x, bullet.y, 0, bullet.x, bullet.y, 4)
        bulletGradient.addColorStop(0, '#86efac')
        bulletGradient.addColorStop(0.5, '#22c55e')
        bulletGradient.addColorStop(1, '#16a34a')
        ctx.fillStyle = bulletGradient
        ctx.beginPath()
        ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0

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

      // Draw ship with enhanced visuals
      ctx.save()
      ctx.translate(game.ship.x, game.ship.y)
      ctx.rotate(game.ship.angle)

      // Thrust flame when accelerating
      if (game.keys['ArrowUp'] || game.keys['w']) {
        ctx.fillStyle = '#f97316'
        ctx.beginPath()
        ctx.moveTo(-8, -5)
        ctx.lineTo(-20 - Math.random() * 8, 0)
        ctx.lineTo(-8, 5)
        ctx.closePath()
        ctx.fill()

        ctx.fillStyle = '#fbbf24'
        ctx.beginPath()
        ctx.moveTo(-8, -3)
        ctx.lineTo(-14 - Math.random() * 4, 0)
        ctx.lineTo(-8, 3)
        ctx.closePath()
        ctx.fill()
      }

      // Ship glow
      ctx.shadowColor = '#22c55e'
      ctx.shadowBlur = 15

      // Ship body with gradient
      const shipGradient = ctx.createLinearGradient(-10, -10, 15, 10)
      shipGradient.addColorStop(0, '#16a34a')
      shipGradient.addColorStop(0.5, '#22c55e')
      shipGradient.addColorStop(1, '#4ade80')
      ctx.fillStyle = shipGradient

      ctx.beginPath()
      ctx.moveTo(18, 0)
      ctx.lineTo(-8, -12)
      ctx.lineTo(-4, 0)
      ctx.lineTo(-8, 12)
      ctx.closePath()
      ctx.fill()

      // Ship outline
      ctx.strokeStyle = '#86efac'
      ctx.lineWidth = 2
      ctx.stroke()

      // Cockpit
      ctx.shadowBlur = 0
      ctx.fillStyle = '#0f172a'
      ctx.beginPath()
      ctx.arc(4, 0, 5, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#38bdf8'
      ctx.beginPath()
      ctx.arc(5, -1, 3, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.beginPath()
      ctx.arc(6, -2, 1.5, 0, Math.PI * 2)
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

      {/* Mobile touch controls */}
      {gameState === 'playing' && (
        <div className="flex gap-4 mt-4 sm:hidden">
          <button
            onTouchStart={() => { gameRef.current.keys['ArrowLeft'] = true }}
            onTouchEnd={() => { gameRef.current.keys['ArrowLeft'] = false }}
            className="w-16 h-16 rounded-full bg-slate-700 active:bg-slate-600 flex items-center justify-center text-2xl"
          >
            ↺
          </button>
          <div className="flex flex-col gap-2">
            <button
              onTouchStart={() => { gameRef.current.keys['ArrowUp'] = true }}
              onTouchEnd={() => { gameRef.current.keys['ArrowUp'] = false }}
              className="w-16 h-12 rounded-lg bg-green-600 active:bg-green-500 flex items-center justify-center text-lg font-bold"
            >
              {settings.language === 'zh' ? '推进' : 'THRUST'}
            </button>
            <button
              onTouchStart={() => { gameRef.current.keys[' '] = true }}
              onTouchEnd={() => { gameRef.current.keys[' '] = false }}
              className="w-16 h-12 rounded-lg bg-red-600 active:bg-red-500 flex items-center justify-center text-lg font-bold"
            >
              {settings.language === 'zh' ? '射击' : 'FIRE'}
            </button>
          </div>
          <button
            onTouchStart={() => { gameRef.current.keys['ArrowRight'] = true }}
            onTouchEnd={() => { gameRef.current.keys['ArrowRight'] = false }}
            className="w-16 h-16 rounded-full bg-slate-700 active:bg-slate-600 flex items-center justify-center text-2xl"
          >
            ↻
          </button>
        </div>
      )}
    </div>
  )
}
