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
  dir: { x: number; y: number }
}

export default function PacMan({ settings }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover' | 'win'>('menu')
  const [score, setScore] = useState(0)

  const gameRef = useRef({
    maze: [] as number[][],
    pacman: { x: 9, y: 15, dir: { x: 0, y: 0 }, nextDir: { x: 0, y: 0 } },
    ghosts: [] as Ghost[],
    powerMode: false,
    powerTimer: 0,
    dotsRemaining: 0,
    animFrame: 0
  })

  const initGame = useCallback(() => {
    const game = gameRef.current
    game.maze = MAZE_TEMPLATE.map(row => [...row])
    game.pacman = { x: 9, y: 15, dir: { x: 0, y: 0 }, nextDir: { x: 0, y: 0 } }
    game.ghosts = [
      { x: 9, y: 9, color: '#ef4444', dir: { x: 0, y: -1 } },
      { x: 8, y: 9, color: '#ec4899', dir: { x: -1, y: 0 } },
      { x: 10, y: 9, color: '#06b6d4', dir: { x: 1, y: 0 } },
      { x: 9, y: 8, color: '#f97316', dir: { x: 0, y: 1 } },
    ]
    game.powerMode = false
    game.powerTimer = 0
    game.dotsRemaining = 0

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

    const gameLoop = (time: number) => {
      const game = gameRef.current

      // Draw
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, COLS * CELL_SIZE, ROWS * CELL_SIZE)

      // Draw maze
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const cell = game.maze[y][x]
          const cx = x * CELL_SIZE + CELL_SIZE / 2
          const cy = y * CELL_SIZE + CELL_SIZE / 2

          if (cell === 1) {
            ctx.fillStyle = '#1e40af'
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
          } else if (cell === 2) {
            ctx.fillStyle = '#fef08a'
            ctx.beginPath()
            ctx.arc(cx, cy, 3, 0, Math.PI * 2)
            ctx.fill()
          } else if (cell === 3) {
            ctx.fillStyle = '#fef08a'
            ctx.beginPath()
            ctx.arc(cx, cy, 8, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }

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
        } else if (game.maze[game.pacman.y]?.[game.pacman.x] === 3) {
          game.maze[game.pacman.y][game.pacman.x] = 0
          game.dotsRemaining--
          game.powerMode = true
          game.powerTimer = 100
          setScore(prev => prev + 50)
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
            } else {
              setGameState('gameover')
              return
            }
          }
        }
      }

      // Draw pacman
      ctx.fillStyle = '#facc15'
      ctx.beginPath()
      const px = game.pacman.x * CELL_SIZE + CELL_SIZE / 2
      const py = game.pacman.y * CELL_SIZE + CELL_SIZE / 2
      const angle = Math.atan2(game.pacman.dir.y, game.pacman.dir.x)
      const mouthAngle = 0.3 + Math.sin(time / 100) * 0.2
      ctx.arc(px, py, CELL_SIZE / 2 - 2, angle + mouthAngle, angle + Math.PI * 2 - mouthAngle)
      ctx.lineTo(px, py)
      ctx.fill()

      // Draw ghosts
      game.ghosts.forEach(ghost => {
        ctx.fillStyle = game.powerMode ? '#3b82f6' : ghost.color
        const gx = ghost.x * CELL_SIZE + CELL_SIZE / 2
        const gy = ghost.y * CELL_SIZE + CELL_SIZE / 2
        ctx.beginPath()
        ctx.arc(gx, gy - 3, CELL_SIZE / 2 - 2, Math.PI, 0, false)
        ctx.lineTo(gx + CELL_SIZE / 2 - 2, gy + CELL_SIZE / 2 - 4)
        ctx.lineTo(gx, gy + CELL_SIZE / 4 - 2)
        ctx.lineTo(gx - CELL_SIZE / 2 + 2, gy + CELL_SIZE / 2 - 4)
        ctx.closePath()
        ctx.fill()
      })

      animationId = requestAnimationFrame(gameLoop)
    }

    animationId = requestAnimationFrame(gameLoop)
    return () => cancelAnimationFrame(animationId)
  }, [gameState])

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <h1 className={`text-2xl font-bold mb-4 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
        🟡 Pac-Man
      </h1>

      <div className={`mb-2 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
        {settings.language === 'zh' ? '得分' : 'Score'}: {score}
      </div>

      <canvas
        ref={canvasRef}
        width={COLS * CELL_SIZE}
        height={ROWS * CELL_SIZE}
        className="border-4 border-blue-800 rounded"
      />

      {gameState === 'menu' && (
        <div className="mt-4 text-center">
          <button onClick={initGame} className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg font-medium text-lg">
            {settings.language === 'zh' ? '开始游戏' : 'Start Game'}
          </button>
          <p className={`mt-4 text-sm ${settings.darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            {settings.language === 'zh' ? '方向键/WASD 移动' : 'Arrow keys/WASD to move'}
          </p>
        </div>
      )}

      {(gameState === 'gameover' || gameState === 'win') && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70">
          <div className="bg-slate-800 p-8 rounded-2xl text-center">
            <h2 className={`text-3xl font-bold mb-4 ${gameState === 'win' ? 'text-green-500' : 'text-red-500'}`}>
              {gameState === 'win' ? (settings.language === 'zh' ? '🎉 胜利！' : '🎉 You Win!') : (settings.language === 'zh' ? '游戏结束' : 'Game Over')}
            </h2>
            <p className="text-xl text-white mb-4">{settings.language === 'zh' ? '得分' : 'Score'}: {score}</p>
            <button onClick={initGame} className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg font-medium">
              {settings.language === 'zh' ? '再来一次' : 'Play Again'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
