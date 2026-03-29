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

export default function SpaceInvaders({ settings }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)

  const gameRef = useRef({
    player: { x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2, y: CANVAS_HEIGHT - 50 },
    bullets: [] as { x: number; y: number }[],
    enemyBullets: [] as { x: number; y: number }[],
    enemies: [] as { x: number; y: number; alive: boolean }[],
    enemyDir: 1,
    enemySpeed: 1,
    keys: {} as Record<string, boolean>,
    lastShot: 0,
    lastEnemyShot: 0,
    lives: 3
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

  const initGame = useCallback(() => {
    const game = gameRef.current
    game.player = { x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2, y: CANVAS_HEIGHT - 50 }
    game.bullets = []
    game.enemyBullets = []
    game.enemies = []
    game.enemyDir = 1
    game.enemySpeed = 1
    game.lives = 3

    for (let row = 0; row < ENEMY_ROWS; row++) {
      for (let col = 0; col < ENEMY_COLS; col++) {
        game.enemies.push({
          x: 50 + col * 50,
          y: 60 + row * 45,
          alive: true
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
      const now = Date.now()

      // Clear canvas
      ctx.fillStyle = settings.darkMode ? '#0f172a' : '#1e293b'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw stars
      ctx.fillStyle = '#ffffff'
      for (let i = 0; i < 50; i++) {
        const x = (i * 97) % CANVAS_WIDTH
        const y = (i * 131 + now / 100) % CANVAS_HEIGHT
        ctx.fillRect(x, y, 1, 1)
      }

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
          y: game.player.y
        })
        game.lastShot = now
      }

      // Update and draw bullets
      ctx.fillStyle = '#22c55e'
      game.bullets = game.bullets.filter(bullet => {
        bullet.y -= 8
        if (bullet.y < 0) return false
        ctx.fillRect(bullet.x, bullet.y, BULLET_WIDTH, BULLET_HEIGHT)
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
      ctx.fillStyle = '#ef4444'
      game.enemyBullets = game.enemyBullets.filter(bullet => {
        bullet.y += 5
        if (bullet.y > CANVAS_HEIGHT) return false
        ctx.fillRect(bullet.x - 2, bullet.y, 4, 10)

        // Check collision with player
        if (
          bullet.x > game.player.x &&
          bullet.x < game.player.x + PLAYER_WIDTH &&
          bullet.y > game.player.y &&
          bullet.y < game.player.y + PLAYER_HEIGHT
        ) {
          game.lives--
          if (game.lives <= 0) {
            setHighScore(prev => Math.max(prev, score))
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

      // Draw enemies
      aliveEnemies.forEach(enemy => {
        ctx.fillStyle = '#8b5cf6'
        ctx.fillRect(enemy.x, enemy.y, ENEMY_WIDTH, ENEMY_HEIGHT)
        // Eyes
        ctx.fillStyle = '#fff'
        ctx.fillRect(enemy.x + 8, enemy.y + 8, 6, 6)
        ctx.fillRect(enemy.x + 21, enemy.y + 8, 6, 6)
        ctx.fillStyle = '#000'
        ctx.fillRect(enemy.x + 10, enemy.y + 10, 3, 3)
        ctx.fillRect(enemy.x + 23, enemy.y + 10, 3, 3)
      })

      // Check bullet-enemy collisions
      game.bullets.forEach((bullet, bi) => {
        game.enemies.forEach(enemy => {
          if (enemy.alive &&
              bullet.x < enemy.x + ENEMY_WIDTH &&
              bullet.x + BULLET_WIDTH > enemy.x &&
              bullet.y < enemy.y + ENEMY_HEIGHT &&
              bullet.y + BULLET_HEIGHT > enemy.y) {
            enemy.alive = false
            game.bullets.splice(bi, 1)
            setScore(prev => prev + 10)
          }
        })
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
              alive: true
            })
          }
        }
      }

      // Draw player
      ctx.fillStyle = '#22c55e'
      ctx.fillRect(game.player.x, game.player.y, PLAYER_WIDTH, PLAYER_HEIGHT)
      ctx.fillRect(game.player.x + PLAYER_WIDTH / 2 - 5, game.player.y - 10, 10, 15)

      // Draw lives
      ctx.fillStyle = '#fff'
      ctx.font = '16px sans-serif'
      ctx.fillText(`${settings.language === 'zh' ? '生命' : 'Lives'}: ${game.lives}`, 10, 25)

      animationId = requestAnimationFrame(gameLoop)
    }

    animationId = requestAnimationFrame(gameLoop)
    return () => cancelAnimationFrame(animationId)
  }, [gameState, settings.darkMode, settings.language, score])

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <h1 className={`text-2xl font-bold mb-4 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
        👾 Space Invaders
      </h1>

      <div className={`mb-2 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
        {settings.language === 'zh' ? '得分' : 'Score'}: {score} | {settings.language === 'zh' ? '最高分' : 'High Score'}: {highScore}
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
          <button
            onClick={initGame}
            className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium text-lg"
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
          <div className={`p-8 rounded-2xl text-center ${settings.darkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <h2 className="text-3xl font-bold text-red-500 mb-4">
              {settings.language === 'zh' ? '游戏结束' : 'Game Over'}
            </h2>
            <p className={`text-xl mb-4 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
              {settings.language === 'zh' ? '得分' : 'Score'}: {score}
            </p>
            <button
              onClick={initGame}
              className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium"
            >
              {settings.language === 'zh' ? '再来一次' : 'Play Again'}
            </button>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <button
          onClick={() => setGameState('menu')}
          className={`mt-4 px-4 py-2 rounded ${settings.darkMode ? 'bg-slate-700 text-white' : 'bg-gray-200 text-gray-900'}`}
        >
          {settings.language === 'zh' ? '返回菜单' : 'Back to Menu'}
        </button>
      )}
    </div>
  )
}
