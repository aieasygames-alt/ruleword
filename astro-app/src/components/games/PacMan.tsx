import { useState, useEffect, useCallback, useRef } from 'react'

type Props = {
  settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }
}

const CELL_SIZE = 24
const COLS = 19
const ROWS = 21

// 0 = empty, 1 = wall, 2 = dot, 3 = power pellet
const MAZE_TEMPLATE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
  [1,3,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,3,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1],
  [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
  [1,1,1,1,2,1,0,1,1,0,1,1,0,1,2,1,1,1,1],
  [0,0,0,0,2,0,0,1,0,0,0,1,0,0,2,0,0,0,0],
  [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
  [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
  [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,3,2,1,2,2,2,2,2,0,2,2,2,2,2,1,2,3,1],
  [1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
]

type Ghost = {
  x: number
  y: number
  color: string
  name: string
  dir: { x: number; y: number }
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  life: number
}

export default function PacMan({ settings }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover' | 'win'>('menu')
  const [score, setScore] = useState(0)
  const [animTime, setAnimTime] = useState(0)

  const gameRef = useRef({
    maze: [] as number[][],
    pacman: { x: 9, y: 15, dir: { x: 0, y: 0 }, nextDir: { x: 0, y: 0 } },
    ghosts: [] as Ghost[],
    powerMode: false,
    powerTimer: 0,
    dotsRemaining: 0,
    particles: [] as Particle[],
  })

  const initGame = useCallback(() => {
    const game = gameRef.current
    game.maze = MAZE_TEMPLATE.map(row => [...row])
    game.pacman = { x: 9, y: 15, dir: { x: 0, y: 0 }, nextDir: { x: 0, y: 0 } }
    game.ghosts = [
      { x: 9, y: 9, color: '#ef4444', name: 'Blinky', dir: { x: 0, y: -1 } },
      { x: 8, y: 9, color: '#ec4899', name: 'Pinky', dir: { x: -1, y: 0 } },
      { x: 10, y: 9, color: '#06b6d4', name: 'Inky', dir: { x: 1, y: 0 } },
      { x: 9, y: 8, color: '#f97316', name: 'Clyde', dir: { x: 0, y: 1 } },
    ]
    game.powerMode = false
    game.powerTimer = 0
    game.dotsRemaining = 0
    game.particles = []

    // Count dots
    game.maze.forEach(row => {
      row.forEach(cell => {
        if (cell === 2 || cell === 3) game.dotsRemaining++
      })
    })

    setScore(0)
    setGameState('playing')
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const game = gameRef.current
      switch (e.key) {
        case 'ArrowLeft': case 'a': game.pacman.nextDir = { x: -1, y: 0 }; break
        case 'ArrowRight': case 'd': game.pacman.nextDir = { x: 1, y: 0 }; break
        case 'ArrowUp': case 'w': game.pacman.nextDir = { x: 0, y: -1 }; break
        case 'ArrowDown': case 's': game.pacman.nextDir = { x: 0, y: 1 }; break
      }
      e.preventDefault()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (gameState !== 'playing') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let lastUpdate = 0
    const UPDATE_INTERVAL = 150

    const canMove = (x: number, y: number) => {
      const game = gameRef.current
      if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return true // Tunnel
      return game.maze[y][x] !== 1
    }

    const addParticles = (x: number, y: number, color: string, count: number) => {
      const game = gameRef.current
      for (let i = 0; i < count; i++) {
        game.particles.push({
          x: x,
          y: y,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          color: color,
          life: 1,
        })
      }
    }

    const gameLoop = (time: number) => {
      const game = gameRef.current
      setAnimTime(time)

      // Background gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 0, ROWS * CELL_SIZE)
      bgGradient.addColorStop(0, '#000510')
      bgGradient.addColorStop(1, '#001020')
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, COLS * CELL_SIZE, ROWS * CELL_SIZE)

      // Draw maze with enhanced walls
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const cell = game.maze[y][x]
          const cx = x * CELL_SIZE + CELL_SIZE / 2
          const cy = y * CELL_SIZE + CELL_SIZE / 2

          if (cell === 1) {
            // Wall with gradient and glow effect
            const wallGradient = ctx.createLinearGradient(
              x * CELL_SIZE, y * CELL_SIZE,
              x * CELL_SIZE + CELL_SIZE, y * CELL_SIZE + CELL_SIZE
            )
            wallGradient.addColorStop(0, '#1e40af')
            wallGradient.addColorStop(0.5, '#3b82f6')
            wallGradient.addColorStop(1, '#1e40af')
            ctx.fillStyle = wallGradient
            ctx.fillRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2)

            // Wall highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
            ctx.fillRect(x * CELL_SIZE + 2, y * CELL_SIZE + 2, CELL_SIZE - 6, 2)

          } else if (cell === 2) {
            // Regular dot with glow
            ctx.shadowColor = '#fef08a'
            ctx.shadowBlur = 5
            ctx.fillStyle = '#fef08a'
            ctx.beginPath()
            ctx.arc(cx, cy, 3, 0, Math.PI * 2)
            ctx.fill()
            ctx.shadowBlur = 0

          } else if (cell === 3) {
            // Power pellet with pulsing effect
            const pulseScale = 1 + Math.sin(time / 150) * 0.3
            const pulseAlpha = 0.7 + Math.sin(time / 150) * 0.3

            ctx.shadowColor = `rgba(254, 240, 138, ${pulseAlpha})`
            ctx.shadowBlur = 15
            ctx.fillStyle = '#fef08a'
            ctx.beginPath()
            ctx.arc(cx, cy, 8 * pulseScale, 0, Math.PI * 2)
            ctx.fill()
            ctx.shadowBlur = 0
          }
        }
      }

      // Update particles
      game.particles = game.particles.filter(p => {
        p.x += p.vx
        p.y += p.vy
        p.life -= 0.05
        if (p.life > 0) {
          ctx.fillStyle = `rgba(254, 240, 138, ${p.life})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
          ctx.fill()
          return true
        }
        return false
      })

      // Update game
      if (time - lastUpdate > UPDATE_INTERVAL) {
        lastUpdate = time

        // Move pacman
        const nextX = game.pacman.x + game.pacman.nextDir.x
        const nextY = game.pacman.y + game.pacman.nextDir.y
        if (canMove(nextX, nextY)) {
          game.pacman.dir = { ...game.pacman.nextDir }
        }

        const newX = game.pacman.x + game.pacman.dir.x
        const newY = game.pacman.y + game.pacman.dir.y
        if (canMove(newX, newY)) {
          game.pacman.x = newX
          game.pacman.y = newY
          // Tunnel wrap
          if (game.pacman.x < 0) game.pacman.x = COLS - 1
          if (game.pacman.x >= COLS) game.pacman.x = 0
        }

        // Eat dots
        if (game.maze[game.pacman.y]?.[game.pacman.x] === 2) {
          game.maze[game.pacman.y][game.pacman.x] = 0
          game.dotsRemaining--
          setScore(prev => prev + 10)
          addParticles(
            game.pacman.x * CELL_SIZE + CELL_SIZE / 2,
            game.pacman.y * CELL_SIZE + CELL_SIZE / 2,
            '#fef08a', 4
          )
        } else if (game.maze[game.pacman.y]?.[game.pacman.x] === 3) {
          game.maze[game.pacman.y][game.pacman.x] = 0
          game.dotsRemaining--
          game.powerMode = true
          game.powerTimer = 100
          setScore(prev => prev + 50)
          addParticles(
            game.pacman.x * CELL_SIZE + CELL_SIZE / 2,
            game.pacman.y * CELL_SIZE + CELL_SIZE / 2,
            '#fef08a', 12
          )
        }

        // Check win
        if (game.dotsRemaining <= 0) {
          setGameState('win')
          return
        }

        // Power mode timer
        if (game.powerMode) {
          game.powerTimer--
          if (game.powerTimer <= 0) game.powerMode = false
        }

        // Move ghosts
        game.ghosts.forEach(ghost => {
          const dirs = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }]
          const validDirs = dirs.filter(d => {
            const nx = ghost.x + d.x
            const ny = ghost.y + d.y
            return canMove(nx, ny) && !(d.x === -ghost.dir.x && d.y === -ghost.dir.y)
          })

          if (validDirs.length > 0) {
            // Simple AI: sometimes chase pacman
            if (Math.random() < 0.6 && !game.powerMode) {
              validDirs.sort((a, b) => {
                const distA = Math.abs(ghost.x + a.x - game.pacman.x) + Math.abs(ghost.y + a.y - game.pacman.y)
                const distB = Math.abs(ghost.x + b.x - game.pacman.x) + Math.abs(ghost.y + b.y - game.pacman.y)
                return distA - distB
              })
            }
            ghost.dir = validDirs[0]
          }

          ghost.x += ghost.dir.x
          ghost.y += ghost.dir.y
          if (ghost.x < 0) ghost.x = COLS - 1
          if (ghost.x >= COLS) ghost.x = 0
        })

        // Ghost collision
        for (const ghost of game.ghosts) {
          if (ghost.x === game.pacman.x && ghost.y === game.pacman.y) {
            if (game.powerMode) {
              ghost.x = 9
              ghost.y = 9
              setScore(prev => prev + 200)
              addParticles(
                game.pacman.x * CELL_SIZE + CELL_SIZE / 2,
                game.pacman.y * CELL_SIZE + CELL_SIZE / 2,
                ghost.color, 15
              )
            } else {
              setGameState('gameover')
              return
            }
          }
        }
      }

      // Draw Pac-Man with enhanced visuals
      const px = game.pacman.x * CELL_SIZE + CELL_SIZE / 2
      const py = game.pacman.y * CELL_SIZE + CELL_SIZE / 2
      const angle = Math.atan2(game.pacman.dir.y, game.pacman.dir.x)
      const mouthAngle = 0.25 + Math.sin(time / 80) * 0.2

      // Pac-Man glow
      ctx.shadowColor = '#facc15'
      ctx.shadowBlur = 10

      // Pac-Man body gradient
      const pacGradient = ctx.createRadialGradient(px - 3, py - 3, 0, px, py, CELL_SIZE / 2)
      pacGradient.addColorStop(0, '#fef08a')
      pacGradient.addColorStop(0.7, '#facc15')
      pacGradient.addColorStop(1, '#ca8a04')

      ctx.fillStyle = pacGradient
      ctx.beginPath()
      ctx.arc(px, py, CELL_SIZE / 2 - 2, angle + mouthAngle, angle + Math.PI * 2 - mouthAngle)
      ctx.lineTo(px, py)
      ctx.fill()
      ctx.shadowBlur = 0

      // Pac-Man eye
      const eyeAngle = angle - 0.5
      const eyeX = px + Math.cos(eyeAngle) * 5
      const eyeY = py + Math.sin(eyeAngle) * 5 - 2
      ctx.fillStyle = '#000'
      ctx.beginPath()
      ctx.arc(eyeX, eyeY, 2, 0, Math.PI * 2)
      ctx.fill()

      // Draw ghosts with enhanced visuals
      game.ghosts.forEach((ghost, index) => {
        const gx = ghost.x * CELL_SIZE + CELL_SIZE / 2
        const gy = ghost.y * CELL_SIZE + CELL_SIZE / 2

        // Ghost glow
        ctx.shadowColor = game.powerMode ? '#3b82f6' : ghost.color
        ctx.shadowBlur = 8

        // Ghost body color
        const ghostColor = game.powerMode
          ? (game.powerTimer < 30 && Math.floor(time / 100) % 2 === 0 ? '#ffffff' : '#3b82f6')
          : ghost.color

        // Ghost body gradient
        const ghostGradient = ctx.createRadialGradient(gx - 3, gy - 5, 0, gx, gy, CELL_SIZE / 2)
        if (game.powerMode) {
          ghostGradient.addColorStop(0, '#60a5fa')
          ghostGradient.addColorStop(1, '#1d4ed8')
        } else {
          const baseColor = ghost.color
          ghostGradient.addColorStop(0, lightenColor(baseColor, 30))
          ghostGradient.addColorStop(1, baseColor)
        }

        ctx.fillStyle = ghostGradient

        // Ghost body (rounded top, wavy bottom)
        ctx.beginPath()
        ctx.arc(gx, gy - 3, CELL_SIZE / 2 - 2, Math.PI, 0, false)

        // Wavy bottom
        const waveOffset = Math.sin(time / 150 + index) * 2
        const bottomY = gy + CELL_SIZE / 2 - 4
        ctx.lineTo(gx + CELL_SIZE / 2 - 2, bottomY)
        ctx.quadraticCurveTo(gx + CELL_SIZE / 3, bottomY + 4 + waveOffset, gx, bottomY - 2)
        ctx.quadraticCurveTo(gx - CELL_SIZE / 3, bottomY + 4 - waveOffset, gx - CELL_SIZE / 2 + 2, bottomY)
        ctx.closePath()
        ctx.fill()
        ctx.shadowBlur = 0

        // Ghost eyes
        if (game.powerMode) {
          // Scared face
          ctx.fillStyle = '#ffffff'
          ctx.beginPath()
          ctx.arc(gx - 4, gy - 4, 3, 0, Math.PI * 2)
          ctx.arc(gx + 4, gy - 4, 3, 0, Math.PI * 2)
          ctx.fill()

          // Scared mouth
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(gx - 6, gy + 4)
          for (let i = 0; i < 5; i++) {
            ctx.lineTo(gx - 6 + i * 3, gy + 4 + (i % 2 === 0 ? 0 : 3))
          }
          ctx.stroke()
        } else {
          // Normal eyes - track pacman
          const eyeAngleToPac = Math.atan2(py - gy, px - gx)
          const pupilDist = 2

          // Eye whites
          ctx.fillStyle = '#ffffff'
          ctx.beginPath()
          ctx.ellipse(gx - 5, gy - 3, 4, 5, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.beginPath()
          ctx.ellipse(gx + 5, gy - 3, 4, 5, 0, 0, Math.PI * 2)
          ctx.fill()

          // Pupils (tracking pacman)
          ctx.fillStyle = '#1e3a8a'
          ctx.beginPath()
          ctx.arc(gx - 5 + Math.cos(eyeAngleToPac) * pupilDist, gy - 3 + Math.sin(eyeAngleToPac) * pupilDist, 2, 0, Math.PI * 2)
          ctx.fill()
          ctx.beginPath()
          ctx.arc(gx + 5 + Math.cos(eyeAngleToPac) * pupilDist, gy - 3 + Math.sin(eyeAngleToPac) * pupilDist, 2, 0, Math.PI * 2)
          ctx.fill()

          // Eye shine
          ctx.fillStyle = '#ffffff'
          ctx.beginPath()
          ctx.arc(gx - 6, gy - 5, 1.5, 0, Math.PI * 2)
          ctx.arc(gx + 4, gy - 5, 1.5, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      animationId = requestAnimationFrame(gameLoop)
    }

    animationId = requestAnimationFrame(gameLoop)
    return () => cancelAnimationFrame(animationId)
  }, [gameState])

  // Helper function to lighten colors
  function lightenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16)
    const amt = Math.round(2.55 * percent)
    const R = Math.min(255, (num >> 16) + amt)
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt)
    const B = Math.min(255, (num & 0x0000FF) + amt)
    return `rgb(${R}, ${G}, ${B})`
  }

  const texts = {
    title: settings.language === 'zh' ? '吃豆人' : 'Pac-Man',
    score: settings.language === 'zh' ? '得分' : 'Score',
    start: settings.language === 'zh' ? '开始游戏' : 'Start Game',
    playAgain: settings.language === 'zh' ? '再来一次' : 'Play Again',
    gameOver: settings.language === 'zh' ? '游戏结束' : 'Game Over',
    youWin: settings.language === 'zh' ? '🎉 胜利！' : '🎉 You Win!',
    hint: settings.language === 'zh' ? '方向键/WASD 移动，吃掉所有豆子！' : 'Arrow keys/WASD to move, eat all dots!',
  }

  return (
    <div className={`min-h-screen flex flex-col items-center py-4 px-2 ${settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between border-b border-gray-700 pb-3 mb-4">
          <div className="w-8" />
          <h1 className={`text-xl font-bold ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
            🟡 {texts.title}
          </h1>
          <div className="w-8" />
        </div>

        <div className="flex justify-center gap-8 mb-4">
          <div className="text-center">
            <p className={`text-sm opacity-60 ${settings.darkMode ? 'text-slate-400' : 'text-gray-600'}`}>{texts.score}</p>
            <p className={`text-lg font-bold ${settings.darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>{score}</p>
          </div>
        </div>

        <div className="relative mx-auto" style={{ width: COLS * CELL_SIZE }}>
          <canvas
            ref={canvasRef}
            width={COLS * CELL_SIZE}
            height={ROWS * CELL_SIZE}
            className="block mx-auto rounded-lg"
            style={{ border: '4px solid #1e40af', boxShadow: '0 0 20px rgba(30, 64, 175, 0.5)' }}
          />

          {gameState === 'menu' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-lg">
              <div className="text-6xl mb-4 animate-bounce">🟡</div>
              <h2 className="text-2xl font-bold text-white mb-2">{texts.title}</h2>
              <div className="flex gap-2 mb-4">
                <span className="text-2xl">👻</span>
                <span className="text-2xl">👻</span>
                <span className="text-2xl">👻</span>
                <span className="text-2xl">👻</span>
              </div>
              <p className="text-sm text-slate-300 mb-4 text-center px-8">{texts.hint}</p>
              <button onClick={initGame} className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg font-bold text-lg shadow-lg shadow-yellow-500/30 transition-all">
                {texts.start}
              </button>
            </div>
          )}

          {(gameState === 'gameover' || gameState === 'win') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-lg">
              <h2 className={`text-3xl font-bold mb-4 ${gameState === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                {gameState === 'win' ? texts.youWin : texts.gameOver}
              </h2>
              <p className="text-xl text-white mb-4">{texts.score}: {score}</p>
              {gameState === 'win' && (
                <div className="flex gap-2 mb-4">
                  <span className="text-2xl">⭐</span>
                  <span className="text-2xl">🎉</span>
                  <span className="text-2xl">⭐</span>
                </div>
              )}
              <button onClick={initGame} className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg font-bold shadow-lg shadow-yellow-500/30 transition-all">
                {texts.playAgain}
              </button>
            </div>
          )}
        </div>

        {/* Mobile touch controls */}
        {gameState === 'playing' && (
          <div className="mt-4 grid grid-cols-3 gap-2 sm:hidden">
            <div />
            <button
              onTouchStart={() => { gameRef.current.pacman.nextDir = { x: 0, y: -1 } }}
              className="py-4 rounded-lg font-bold text-2xl active:bg-yellow-600 bg-yellow-500/20 text-yellow-400"
            >
              ↑
            </button>
            <div />
            <button
              onTouchStart={() => { gameRef.current.pacman.nextDir = { x: -1, y: 0 } }}
              className="py-4 rounded-lg font-bold text-2xl active:bg-yellow-600 bg-yellow-500/20 text-yellow-400"
            >
              ←
            </button>
            <button
              onTouchStart={() => { gameRef.current.pacman.nextDir = { x: 0, y: 1 } }}
              className="py-4 rounded-lg font-bold text-2xl active:bg-yellow-600 bg-yellow-500/20 text-yellow-400"
            >
              ↓
            </button>
            <button
              onTouchStart={() => { gameRef.current.pacman.nextDir = { x: 1, y: 0 } }}
              className="py-4 rounded-lg font-bold text-2xl active:bg-yellow-600 bg-yellow-500/20 text-yellow-400"
            >
              →
            </button>
          </div>
        )}

        <p className={`mt-4 text-center text-sm ${settings.darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
          {texts.hint}
        </p>
      </div>
    </div>
  )
}
