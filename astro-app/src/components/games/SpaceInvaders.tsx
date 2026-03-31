import { useState, useEffect, useCallback, useRef } from 'react'

type Props = {
  settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }
}

const CANVAS_WIDTH = 480
const CANVAS_HEIGHT = 600
const PLAYER_WIDTH = 50
const PLAYER_HEIGHT = 20
const BULLET_WIDTH = 4
const BULLET_HEIGHT = 12
const ENEMY_WIDTH = 35
const ENEMY_HEIGHT = 25
const ENEMY_ROWS = 4
const ENEMY_COLS = 8

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  life: number
  size: number
}

export default function SpaceInvaders({ settings }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu')
  const [score, setScore] = useState(0)
  const scoreRef = useRef(score)
  scoreRef.current = score
  const [highScore, setHighScore] = useState(0)

  const gameRef = useRef({
    player: { x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2, y: CANVAS_HEIGHT - 50 },
    bullets: [] as { x: number; y: number; trail: {x: number; y: number}[] }[],
    enemyBullets: [] as { x: number; y: number }[],
    enemies: [] as { x: number; y: number; alive: boolean; type: number }[],
    enemyDir: 1,
    enemySpeed: 1,
    keys: {} as Record<string, boolean>,
    lastShot: 0,
    lastEnemyShot: 0,
    lives: 3,
    particles: [] as Particle[],
    animFrame: 0
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      gameRef.current.keys[e.key] = true
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault()
      }
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

  const addExplosion = (x: number, y: number, color: string) => {
    const game = gameRef.current
    for (let i = 0; i < 15; i++) {
      const angle = (Math.PI * 2 * i) / 15
      const speed = 2 + Math.random() * 3
      game.particles.push({
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

  const initGame = useCallback(() => {
    const game = gameRef.current
    game.player = { x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2, y: CANVAS_HEIGHT - 50 }
    game.bullets = []
    game.enemyBullets = []
    game.enemies = []
    game.enemyDir = 1
    game.enemySpeed = 1
    game.lives = 3
    game.particles = []

    for (let row = 0; row < ENEMY_ROWS; row++) {
      for (let col = 0; col < ENEMY_COLS; col++) {
        game.enemies.push({
          x: 50 + col * 50,
          y: 60 + row * 45,
          alive: true,
          type: row < 1 ? 2 : row < 2 ? 1 : 0 // Different enemy types by row
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

    const gameLoop = (time: number) => {
      const game = gameRef.current
      const now = Date.now()
      game.animFrame++

      // Clear canvas with gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
      bgGradient.addColorStop(0, '#000510')
      bgGradient.addColorStop(0.5, '#001030')
      bgGradient.addColorStop(1, '#000820')
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw animated stars
      for (let i = 0; i < 80; i++) {
        const x = (i * 97 + now / 50) % CANVAS_WIDTH
        const y = (i * 131 + now / 100) % CANVAS_HEIGHT
        const twinkle = 0.3 + Math.sin(now / 500 + i) * 0.5
        const size = i % 3 === 0 ? 2 : 1
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      }

      // Update and draw particles
      game.particles = game.particles.filter(p => {
        p.x += p.vx
        p.y += p.vy
        p.life -= 0.02
        p.vx *= 0.98
        p.vy *= 0.98
        if (p.life > 0) {
          ctx.fillStyle = p.color.replace('1)', `${p.life})`)
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

      // Player movement
      if (game.keys['ArrowLeft'] || game.keys['a']) {
        game.player.x = Math.max(0, game.player.x - 5)
      }
      if (game.keys['ArrowRight'] || game.keys['d']) {
        game.player.x = Math.min(CANVAS_WIDTH - PLAYER_WIDTH, game.player.x + 5)
      }

      // Shooting
      if ((game.keys[' '] || game.keys['ArrowUp']) && now - game.lastShot > 300) {
        game.bullets.push({
          x: game.player.x + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
          y: game.player.y,
          trail: []
        })
        game.lastShot = now
      }

      // Update and draw bullets with trail
      game.bullets = game.bullets.filter(bullet => {
        bullet.trail.unshift({ x: bullet.x, y: bullet.y })
        if (bullet.trail.length > 5) bullet.trail.pop()

        bullet.y -= 8
        if (bullet.y < 0) return false

        // Draw trail
        bullet.trail.forEach((t, i) => {
          const alpha = 1 - i / bullet.trail.length
          ctx.fillStyle = `rgba(34, 197, 94, ${alpha * 0.5})`
          ctx.fillRect(t.x, t.y, BULLET_WIDTH, BULLET_HEIGHT * (1 - i / bullet.trail.length))
        })

        // Draw bullet with glow
        ctx.shadowColor = '#22c55e'
        ctx.shadowBlur = 10
        const bulletGradient = ctx.createLinearGradient(bullet.x, bullet.y, bullet.x, bullet.y + BULLET_HEIGHT)
        bulletGradient.addColorStop(0, '#86efac')
        bulletGradient.addColorStop(0.5, '#22c55e')
        bulletGradient.addColorStop(1, '#15803d')
        ctx.fillStyle = bulletGradient
        ctx.fillRect(bullet.x, bullet.y, BULLET_WIDTH, BULLET_HEIGHT)
        ctx.shadowBlur = 0

        return true
      })

      // Enemy shooting
      if (now - game.lastEnemyShot > 1500) {
        const aliveEnemies = game.enemies.filter(e => e.alive)
        if (aliveEnemies.length > 0) {
          const shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]
          game.enemyBullets.push({ x: shooter.x + ENEMY_WIDTH / 2, y: shooter.y + ENEMY_HEIGHT })
          game.lastEnemyShot = now
        }
      }

      // Update and draw enemy bullets
      game.enemyBullets = game.enemyBullets.filter(bullet => {
        bullet.y += 5
        if (bullet.y > CANVAS_HEIGHT) return false

        // Draw enemy bullet with glow
        ctx.shadowColor = '#ef4444'
        ctx.shadowBlur = 8
        const bulletGradient = ctx.createLinearGradient(bullet.x, bullet.y, bullet.x, bullet.y + 10)
        bulletGradient.addColorStop(0, '#fca5a5')
        bulletGradient.addColorStop(0.5, '#ef4444')
        bulletGradient.addColorStop(1, '#b91c1c')
        ctx.fillStyle = bulletGradient
        ctx.beginPath()
        ctx.ellipse(bullet.x, bullet.y + 5, 3, 5, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0

        // Check collision with player
        if (
          bullet.x > game.player.x &&
          bullet.x < game.player.x + PLAYER_WIDTH &&
          bullet.y > game.player.y &&
          bullet.y < game.player.y + PLAYER_HEIGHT
        ) {
          game.lives--
          addExplosion(game.player.x + PLAYER_WIDTH / 2, game.player.y + PLAYER_HEIGHT / 2, 'rgba(34, 197, 94, 1)')
          if (game.lives <= 0) {
            setHighScore(prev => Math.max(prev, scoreRef.current))
            setGameState('gameover')
          }
          return false
        }
        return true
      })

      // Update enemies
      let moveDown = false
      const aliveEnemies = game.enemies.filter(e => e.alive)
      for (const enemy of aliveEnemies) {
        if ((enemy.x + ENEMY_WIDTH > CANVAS_WIDTH - 10 && game.enemyDir > 0) ||
            (enemy.x < 10 && game.enemyDir < 0)) {
          moveDown = true
          break
        }
      }

      if (moveDown) {
        game.enemyDir *= -1
        game.enemies.forEach(e => { e.y += 20 })
      }

      game.enemies.forEach(e => {
        if (e.alive) {
          e.x += game.enemyDir * game.enemySpeed
        }
      })

      // Draw enemies with animation
      aliveEnemies.forEach((enemy, index) => {
        const wobble = Math.sin(game.animFrame / 10 + index) * 2
        const color = enemy.type === 2 ? '#ef4444' : enemy.type === 1 ? '#f59e0b' : '#8b5cf6'

        // Glow effect
        ctx.shadowColor = color
        ctx.shadowBlur = 8

        // Body gradient
        const bodyGradient = ctx.createRadialGradient(
          enemy.x + ENEMY_WIDTH / 2, enemy.y + ENEMY_HEIGHT / 2, 0,
          enemy.x + ENEMY_WIDTH / 2, enemy.y + ENEMY_HEIGHT / 2, ENEMY_WIDTH / 2
        )
        bodyGradient.addColorStop(0, color)
        bodyGradient.addColorStop(1, color.replace(')', ', 0.6)').replace('rgb', 'rgba').replace('#', ''))
        ctx.fillStyle = color

        // Draw different enemy types
        if (enemy.type === 2) {
          // Top row - UFO type
          ctx.beginPath()
          ctx.ellipse(enemy.x + ENEMY_WIDTH / 2, enemy.y + ENEMY_HEIGHT / 2 + wobble, ENEMY_WIDTH / 2, ENEMY_HEIGHT / 2, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#fef08a'
          ctx.beginPath()
          ctx.ellipse(enemy.x + ENEMY_WIDTH / 2, enemy.y + ENEMY_HEIGHT / 3 + wobble, ENEMY_WIDTH / 4, ENEMY_HEIGHT / 4, 0, 0, Math.PI * 2)
          ctx.fill()
        } else if (enemy.type === 1) {
          // Second row - crab type
          ctx.fillRect(enemy.x + 5, enemy.y + 5 + wobble, ENEMY_WIDTH - 10, ENEMY_HEIGHT - 10)
          // Claws
          const clawOffset = Math.sin(game.animFrame / 5) * 3
          ctx.fillRect(enemy.x - 5, enemy.y + 10 + wobble, 8, 8)
          ctx.fillRect(enemy.x + ENEMY_WIDTH - 3, enemy.y + 10 + wobble, 8, 8)
          // Antenna
          ctx.strokeStyle = color
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(enemy.x + 10, enemy.y + 5 + wobble)
          ctx.lineTo(enemy.x + 5, enemy.y - 5 + wobble)
          ctx.moveTo(enemy.x + ENEMY_WIDTH - 10, enemy.y + 5 + wobble)
          ctx.lineTo(enemy.x + ENEMY_WIDTH - 5, enemy.y - 5 + wobble)
          ctx.stroke()
        } else {
          // Bottom rows - squid type
          ctx.fillRect(enemy.x + 3, enemy.y + 3 + wobble, ENEMY_WIDTH - 6, ENEMY_HEIGHT - 10)
          // Tentacles
          for (let t = 0; t < 4; t++) {
            const tx = enemy.x + 6 + t * 8
            const ty = enemy.y + ENEMY_HEIGHT - 7 + wobble + Math.sin(game.animFrame / 8 + t) * 3
            ctx.fillRect(tx, ty, 5, 7)
          }
        }
        ctx.shadowBlur = 0

        // Eyes
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(enemy.x + 12, enemy.y + 12 + wobble, 5, 0, Math.PI * 2)
        ctx.arc(enemy.x + ENEMY_WIDTH - 12, enemy.y + 12 + wobble, 5, 0, Math.PI * 2)
        ctx.fill()

        // Pupils (looking at player)
        const lookX = (game.player.x - enemy.x) / CANVAS_WIDTH * 2
        ctx.fillStyle = '#000'
        ctx.beginPath()
        ctx.arc(enemy.x + 12 + lookX, enemy.y + 13 + wobble, 2, 0, Math.PI * 2)
        ctx.arc(enemy.x + ENEMY_WIDTH - 12 + lookX, enemy.y + 13 + wobble, 2, 0, Math.PI * 2)
        ctx.fill()
      })

      // Check bullet-enemy collisions
      game.bullets = game.bullets.filter(bullet => {
        let bulletHit = false
        for (const enemy of game.enemies) {
          if (enemy.alive &&
              bullet.x < enemy.x + ENEMY_WIDTH &&
              bullet.x + BULLET_WIDTH > enemy.x &&
              bullet.y < enemy.y + ENEMY_HEIGHT &&
              bullet.y + BULLET_HEIGHT > enemy.y) {
            enemy.alive = false
            bulletHit = true
            const color = enemy.type === 2 ? 'rgba(239, 68, 68, 1)' : enemy.type === 1 ? 'rgba(245, 158, 11, 1)' : 'rgba(139, 92, 246, 1)'
            addExplosion(enemy.x + ENEMY_WIDTH / 2, enemy.y + ENEMY_HEIGHT / 2, color)
            setScore(prev => prev + (enemy.type === 2 ? 30 : enemy.type === 1 ? 20 : 10))
            break
          }
        }
        return !bulletHit
      })

      // Check win
      if (game.enemies.every(e => !e.alive)) {
        game.enemySpeed += 0.5
        // Respawn enemies
        game.enemies = []
        for (let row = 0; row < ENEMY_ROWS; row++) {
          for (let col = 0; col < ENEMY_COLS; col++) {
            game.enemies.push({
              x: 50 + col * 50,
              y: 60 + row * 45,
              alive: true,
              type: row < 1 ? 2 : row < 2 ? 1 : 0
            })
          }
        }
      }

      // Draw player ship with glow
      ctx.shadowColor = '#22c55e'
      ctx.shadowBlur = 15

      // Ship body gradient
      const shipGradient = ctx.createLinearGradient(
        game.player.x, game.player.y,
        game.player.x, game.player.y + PLAYER_HEIGHT
      )
      shipGradient.addColorStop(0, '#86efac')
      shipGradient.addColorStop(0.5, '#22c55e')
      shipGradient.addColorStop(1, '#15803d')
      ctx.fillStyle = shipGradient

      // Main body
      ctx.beginPath()
      ctx.moveTo(game.player.x, game.player.y + PLAYER_HEIGHT)
      ctx.lineTo(game.player.x + PLAYER_WIDTH, game.player.y + PLAYER_HEIGHT)
      ctx.lineTo(game.player.x + PLAYER_WIDTH * 0.75, game.player.y)
      ctx.lineTo(game.player.x + PLAYER_WIDTH * 0.25, game.player.y)
      ctx.closePath()
      ctx.fill()

      // Cockpit
      ctx.fillStyle = '#60a5fa'
      ctx.beginPath()
      ctx.moveTo(game.player.x + PLAYER_WIDTH / 2 - 5, game.player.y - 10)
      ctx.lineTo(game.player.x + PLAYER_WIDTH / 2 + 5, game.player.y - 10)
      ctx.lineTo(game.player.x + PLAYER_WIDTH / 2 + 8, game.player.y)
      ctx.lineTo(game.player.x + PLAYER_WIDTH / 2 - 8, game.player.y)
      ctx.closePath()
      ctx.fill()

      // Engine glow
      const engineGlow = 0.5 + Math.sin(now / 100) * 0.3
      ctx.fillStyle = `rgba(251, 191, 36, ${engineGlow})`
      ctx.beginPath()
      ctx.ellipse(game.player.x + PLAYER_WIDTH / 2, game.player.y + PLAYER_HEIGHT + 5, 8, 5, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.shadowBlur = 0

      // Draw lives as ship icons
      for (let i = 0; i < game.lives; i++) {
        ctx.fillStyle = '#22c55e'
        ctx.beginPath()
        ctx.moveTo(20 + i * 25, 25)
        ctx.lineTo(30 + i * 25, 25)
        ctx.lineTo(30 + i * 25, 15)
        ctx.lineTo(20 + i * 25, 15)
        ctx.closePath()
        ctx.fill()
      }

      // Draw score with glow
      ctx.shadowColor = '#facc15'
      ctx.shadowBlur = 5
      ctx.fillStyle = '#facc15'
      ctx.font = 'bold 18px sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(`${scoreRef.current}`, CANVAS_WIDTH - 10, 25)
      ctx.shadowBlur = 0

      animationId = requestAnimationFrame(gameLoop)
    }

    animationId = requestAnimationFrame(gameLoop)
    return () => cancelAnimationFrame(animationId)
  }, [gameState, settings.darkMode])

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <h1 className={`text-2xl font-bold mb-4 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
        👾 {settings.language === 'zh' ? '太空侵略者' : 'Space Invaders'}
      </h1>

      <div className={`mb-2 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
        {settings.language === 'zh' ? '得分' : 'Score'}: {score} | {settings.language === 'zh' ? '最高分' : 'High Score'}: {highScore}
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="rounded-lg max-w-full"
        style={{
          border: '3px solid #3b82f6',
          boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)'
        }}
      />

      {gameState === 'menu' && (
        <div className="mt-4 text-center">
          <button
            onClick={initGame}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-lg font-medium text-lg shadow-lg shadow-green-500/30"
          >
            {settings.language === 'zh' ? '开始游戏' : 'Start Game'}
          </button>
          <p className={`mt-4 text-sm ${settings.darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            {settings.language === 'zh' ? '← → 移动 | 空格/↑ 射击' : '← → Move | Space/↑ Shoot'}
          </p>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70">
          <div className={`p-8 rounded-2xl text-center ${settings.darkMode ? 'bg-slate-800' : 'bg-white'} shadow-2xl`}>
            <h2 className="text-3xl font-bold text-red-500 mb-4">
              {settings.language === 'zh' ? '游戏结束' : 'Game Over'}
            </h2>
            <p className={`text-xl mb-4 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
              {settings.language === 'zh' ? '得分' : 'Score'}: {score}
            </p>
            <button
              onClick={initGame}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-lg font-medium shadow-lg shadow-green-500/30"
            >
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
            className="w-16 h-16 rounded-full bg-blue-600 active:bg-blue-500 flex items-center justify-center text-2xl text-white shadow-lg"
          >
            ←
          </button>
          <button
            onTouchStart={() => { gameRef.current.keys[' '] = true }}
            onTouchEnd={() => { gameRef.current.keys[' '] = false }}
            className="w-20 h-16 rounded-full bg-green-600 active:bg-green-500 flex items-center justify-center text-lg text-white shadow-lg font-bold"
          >
            {settings.language === 'zh' ? '发射' : 'FIRE'}
          </button>
          <button
            onTouchStart={() => { gameRef.current.keys['ArrowRight'] = true }}
            onTouchEnd={() => { gameRef.current.keys['ArrowRight'] = false }}
            className="w-16 h-16 rounded-full bg-blue-600 active:bg-blue-500 flex items-center justify-center text-2xl text-white shadow-lg"
          >
            →
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <button
          onClick={() => setGameState('menu')}
          className={`mt-4 px-4 py-2 rounded ${settings.darkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}
        >
          {settings.language === 'zh' ? '返回菜单' : 'Back to Menu'}
        </button>
      )}
    </div>
  )
}
