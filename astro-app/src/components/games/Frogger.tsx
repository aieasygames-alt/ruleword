import { useState, useCallback, useEffect, useRef } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type FroggerProps = {
  settings: Settings
  onBack: () => void
  toggleLanguage: () => void
  toggleTheme: () => void
  toggleSound: () => void
}

const GRID_COLS = 13
const GRID_ROWS = 14
const CELL_SIZE = 30

type MovingObject = {
  x: number
  y: number
  width: number
  speed: number
  type: 'car' | 'truck' | 'log' | 'turtle'
  direction: 1 | -1
}

export default function Frogger({ settings, onBack }: FroggerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver' | 'win'>('menu')
  const [lives, setLives] = useState(3)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [frogPos, setFrogPos] = useState({ x: 6, y: 13 })
  const [goals, setGoals] = useState<boolean[]>([false, false, false, false, false])

  const objectsRef = useRef<MovingObject[]>([])
  const gameLoopRef = useRef<number | null>(null)
  const invulnerableRef = useRef(false)

  const isDark = settings.darkMode

  // Initialize objects
  const initObjects = useCallback(() => {
    const objects: MovingObject[] = []

    // Road rows (8-12) - cars and trucks going right
    objects.push({ x: 0, y: 8, width: 2, speed: 1.5, type: 'car', direction: 1 })
    objects.push({ x: 6, y: 8, width: 2, speed: 1.5, type: 'car', direction: 1 })
    objects.push({ x: 10, y: 8, width: 2, speed: 1.5, type: 'car', direction: 1 })

    objects.push({ x: 0, y: 9, width: 3, speed: 1, type: 'truck', direction: -1 })
    objects.push({ x: 7, y: 9, width: 3, speed: 1, type: 'truck', direction: -1 })

    objects.push({ x: 2, y: 10, width: 2, speed: 2, type: 'car', direction: 1 })
    objects.push({ x: 8, y: 10, width: 2, speed: 2, type: 'car', direction: 1 })

    objects.push({ x: 0, y: 11, width: 2, speed: 1.2, type: 'car', direction: -1 })
    objects.push({ x: 5, y: 11, width: 2, speed: 1.2, type: 'car', direction: -1 })
    objects.push({ x: 10, y: 11, width: 2, speed: 1.2, type: 'car', direction: -1 })

    objects.push({ x: 1, y: 12, width: 3, speed: 0.8, type: 'truck', direction: 1 })
    objects.push({ x: 9, y: 12, width: 3, speed: 0.8, type: 'truck', direction: 1 })

    // Water rows (2-6) - logs and turtles
    objects.push({ x: 0, y: 2, width: 4, speed: 0.8, type: 'log', direction: 1 })
    objects.push({ x: 7, y: 2, width: 4, speed: 0.8, type: 'log', direction: 1 })

    objects.push({ x: 0, y: 3, width: 2, speed: 1.2, type: 'turtle', direction: -1 })
    objects.push({ x: 4, y: 3, width: 2, speed: 1.2, type: 'turtle', direction: -1 })
    objects.push({ x: 8, y: 3, width: 2, speed: 1.2, type: 'turtle', direction: -1 })

    objects.push({ x: 1, y: 4, width: 5, speed: 0.6, type: 'log', direction: 1 })
    objects.push({ x: 8, y: 4, width: 5, speed: 0.6, type: 'log', direction: 1 })

    objects.push({ x: 0, y: 5, width: 3, speed: 1, type: 'log', direction: -1 })
    objects.push({ x: 5, y: 5, width: 3, speed: 1, type: 'log', direction: -1 })
    objects.push({ x: 10, y: 5, width: 3, speed: 1, type: 'log', direction: -1 })

    objects.push({ x: 2, y: 6, width: 2, speed: 1.5, type: 'turtle', direction: 1 })
    objects.push({ x: 6, y: 6, width: 2, speed: 1.5, type: 'turtle', direction: 1 })
    objects.push({ x: 10, y: 6, width: 2, speed: 1.5, type: 'turtle', direction: 1 })

    objectsRef.current = objects
  }, [])

  const startGame = useCallback(() => {
    invulnerableRef.current = false
    setLives(3)
    setScore(0)
    setLevel(1)
    setFrogPos({ x: 6, y: 13 })
    setGoals([false, false, false, false, false])
    initObjects()
    setGameState('playing')
  }, [initObjects])

  // Handle keyboard input
  useEffect(() => {
    if (gameState !== 'playing') return

    const handleKeyDown = (e: KeyboardEvent) => {
      const { x, y } = frogPos
      let newX = x, newY = y

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          newY = Math.max(0, y - 1)
          break
        case 'ArrowDown':
        case 's':
          newY = Math.min(GRID_ROWS - 1, y + 1)
          break
        case 'ArrowLeft':
        case 'a':
          newX = Math.max(0, x - 1)
          break
        case 'ArrowRight':
        case 'd':
          newX = Math.min(GRID_COLS - 1, x + 1)
          break
        default:
          return
      }

      e.preventDefault()
      setFrogPos({ x: newX, y: newY })

      // Score for moving forward
      if (newY < y) {
        setScore(prev => prev + 10)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState, frogPos])

  // Check collision with objects
  const checkCollision = useCallback((fx: number, fy: number): { hit: boolean; onLog: MovingObject | null } => {
    const frogLeft = fx
    const frogRight = fx + 1

    for (const obj of objectsRef.current) {
      if (obj.y !== fy) continue

      const objLeft = obj.x
      const objRight = obj.x + obj.width

      // Check if frog overlaps with object
      if (frogRight > objLeft && frogLeft < objRight) {
        if (obj.type === 'car' || obj.type === 'truck') {
          return { hit: true, onLog: null }
        } else {
          return { hit: false, onLog: obj }
        }
      }
    }

    return { hit: false, onLog: null }
  }, [])

  // Check if frog is in water without a log
  const isInWater = useCallback((y: number): boolean => {
    return y >= 2 && y <= 6
  }, [])

  // Check goals
  const checkGoal = useCallback((x: number): number => {
    const goalPositions = [1, 4, 6, 9, 11] // x positions of goal slots
    for (let i = 0; i < goalPositions.length; i++) {
      if (x >= goalPositions[i] && x <= goalPositions[i] + 1) {
        return i
      }
    }
    return -1
  }, [])

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let lastTime = 0

    const loseLife = () => {
      if (invulnerableRef.current) return
      invulnerableRef.current = true
      setLives(prev => {
        const newLives = prev - 1
        if (newLives <= 0) {
          setGameState('gameOver')
        } else {
          setFrogPos({ x: 6, y: 13 })
        }
        return newLives
      })
      setTimeout(() => {
        invulnerableRef.current = false
      }, 2000)
    }

    const gameLoop = (time: number) => {
      const delta = (time - lastTime) / 1000
      lastTime = time

      // Update objects
      for (const obj of objectsRef.current) {
        obj.x += obj.speed * obj.direction * delta * 60 / 60

        // Wrap around
        if (obj.direction === 1 && obj.x > GRID_COLS) {
          obj.x = -obj.width
        } else if (obj.direction === -1 && obj.x + obj.width < 0) {
          obj.x = GRID_COLS
        }
      }

      // Clear canvas
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, GRID_COLS * CELL_SIZE, GRID_ROWS * CELL_SIZE)

      // Draw goal zone (row 0-1)
      ctx.fillStyle = '#065f46'
      ctx.fillRect(0, 0, GRID_COLS * CELL_SIZE, 2 * CELL_SIZE)

      // Draw goal slots
      const goalPositions = [1, 4, 6, 9, 11]
      goalPositions.forEach((gx, i) => {
        ctx.fillStyle = goals[i] ? '#22c55e' : '#0d9488'
        ctx.fillRect(gx * CELL_SIZE, 0, 2 * CELL_SIZE, CELL_SIZE)
        if (goals[i]) {
          ctx.font = '20px Arial'
          ctx.fillText('🐸', gx * CELL_SIZE + 5, CELL_SIZE - 8)
        }
      })

      // Draw water zone (rows 2-6)
      ctx.fillStyle = '#1e40af'
      ctx.fillRect(0, 2 * CELL_SIZE, GRID_COLS * CELL_SIZE, 5 * CELL_SIZE)

      // Draw logs and turtles
      for (const obj of objectsRef.current) {
        if (obj.type === 'log') {
          ctx.fillStyle = '#78350f'
          ctx.fillRect(obj.x * CELL_SIZE, obj.y * CELL_SIZE, obj.width * CELL_SIZE, CELL_SIZE)
          ctx.strokeStyle = '#92400e'
          ctx.lineWidth = 2
          ctx.strokeRect(obj.x * CELL_SIZE, obj.y * CELL_SIZE, obj.width * CELL_SIZE, CELL_SIZE)
        } else if (obj.type === 'turtle') {
          ctx.fillStyle = '#065f46'
          for (let i = 0; i < obj.width; i++) {
            ctx.beginPath()
            ctx.arc((obj.x + i + 0.5) * CELL_SIZE, (obj.y + 0.5) * CELL_SIZE, CELL_SIZE * 0.4, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }

      // Draw safe zone (row 7)
      ctx.fillStyle = '#7c3aed'
      ctx.fillRect(0, 7 * CELL_SIZE, GRID_COLS * CELL_SIZE, CELL_SIZE)

      // Draw road (rows 8-12)
      ctx.fillStyle = '#374151'
      ctx.fillRect(0, 8 * CELL_SIZE, GRID_COLS * CELL_SIZE, 5 * CELL_SIZE)

      // Draw road lines
      ctx.strokeStyle = '#fbbf24'
      ctx.setLineDash([10, 10])
      for (let r = 8; r < 13; r++) {
        ctx.beginPath()
        ctx.moveTo(0, (r + 0.5) * CELL_SIZE)
        ctx.lineTo(GRID_COLS * CELL_SIZE, (r + 0.5) * CELL_SIZE)
        ctx.stroke()
      }
      ctx.setLineDash([])

      // Draw cars and trucks
      for (const obj of objectsRef.current) {
        if (obj.type === 'car') {
          ctx.fillStyle = obj.direction === 1 ? '#ef4444' : '#3b82f6'
          ctx.fillRect(obj.x * CELL_SIZE + 2, obj.y * CELL_SIZE + 4, (obj.width * CELL_SIZE) - 4, CELL_SIZE - 8)
        } else if (obj.type === 'truck') {
          ctx.fillStyle = obj.direction === 1 ? '#f59e0b' : '#10b981'
          ctx.fillRect(obj.x * CELL_SIZE + 2, obj.y * CELL_SIZE + 2, (obj.width * CELL_SIZE) - 4, CELL_SIZE - 4)
        }
      }

      // Draw start zone (row 13)
      ctx.fillStyle = '#065f46'
      ctx.fillRect(0, 13 * CELL_SIZE, GRID_COLS * CELL_SIZE, CELL_SIZE)

      // Check frog status
      const { hit, onLog } = checkCollision(frogPos.x, frogPos.y)

      if (hit) {
        // Frog got hit by car
        loseLife()
      } else if (isInWater(frogPos.y) && !onLog) {
        // Frog drowned
        loseLife()
      } else if (onLog) {
        // Move frog with log
        const newX = frogPos.x + onLog.speed * onLog.direction * delta * 60 / 60
        if (newX >= 0 && newX < GRID_COLS - 1) {
          setFrogPos(prev => ({ ...prev, x: newX }))
        } else {
          // Frog went off screen
          loseLife()
        }
      }

      // Check if reached goal
      if (frogPos.y === 0) {
        const goalIndex = checkGoal(frogPos.x)
        if (goalIndex !== -1 && !goals[goalIndex]) {
          setGoals(prev => {
            const newGoals = [...prev]
            newGoals[goalIndex] = true
            return newGoals
          })
          setScore(prev => prev + 100)
          setFrogPos({ x: 6, y: 13 })

          // Check if all goals filled
          setGoals(current => {
            if (current.every(g => g)) {
              setLevel(prev => prev + 1)
              setScore(prev => prev + 500)
              return [false, false, false, false, false]
            }
            return current
          })
        } else {
          // Invalid position
          loseLife()
        }
      }

      // Draw frog
      ctx.font = `${CELL_SIZE - 4}px Arial`
      ctx.fillText('🐸', frogPos.x * CELL_SIZE + 2, frogPos.y * CELL_SIZE + CELL_SIZE - 4)

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [gameState, frogPos, goals, checkCollision, isInWater, checkGoal])

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-gray-100'} ${isDark ? 'text-white' : 'text-gray-900'} flex flex-col`}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/90 border-b border-slate-800 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm"
          >
            ← Back
          </button>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-xs text-slate-400">Score</div>
              <div className="text-lg font-bold text-yellow-400">{score}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400">Level</div>
              <div className="text-lg font-bold text-green-400">{level}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400">Lives</div>
              <div className="text-lg font-bold text-red-400">{'❤️'.repeat(lives)}</div>
            </div>
          </div>
          <div className="w-16"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        {gameState === 'menu' ? (
          <div className="text-center space-y-6">
            <div className="text-6xl">🐸</div>
            <h1 className="text-3xl font-bold">Frogger</h1>
            <p className="text-slate-400 max-w-sm mx-auto">
              Help the frog cross the busy road and dangerous river to reach the goal zones!
            </p>
            <button
              onClick={startGame}
              className="px-8 py-3 rounded-xl bg-green-600 hover:bg-green-500 transition-colors font-bold text-lg"
            >
              Start Game
            </button>
            <div className="text-sm text-slate-400">
              <p>Controls: Arrow keys or WASD</p>
              <p>Fill all 5 goal slots to advance!</p>
            </div>
          </div>
        ) : (
          <>
            <canvas
              ref={canvasRef}
              width={GRID_COLS * CELL_SIZE}
              height={GRID_ROWS * CELL_SIZE}
              className="rounded-xl border-2 border-slate-700"
            />

            {/* Mobile Controls */}
            <div className="grid grid-cols-3 gap-2 sm:hidden">
              <div></div>
              <button
                onClick={() => setFrogPos(p => ({ ...p, y: Math.max(0, p.y - 1) }))}
                className="w-14 h-14 rounded-full bg-slate-700 active:bg-slate-600 flex items-center justify-center text-xl"
              >
                ↑
              </button>
              <div></div>
              <button
                onClick={() => setFrogPos(p => ({ ...p, x: Math.max(0, p.x - 1) }))}
                className="w-14 h-14 rounded-full bg-slate-700 active:bg-slate-600 flex items-center justify-center text-xl"
              >
                ←
              </button>
              <button
                onClick={() => setFrogPos(p => ({ ...p, y: Math.min(GRID_ROWS - 1, p.y + 1) }))}
                className="w-14 h-14 rounded-full bg-slate-700 active:bg-slate-600 flex items-center justify-center text-xl"
              >
                ↓
              </button>
              <button
                onClick={() => setFrogPos(p => ({ ...p, x: Math.min(GRID_COLS - 1, p.x + 1) }))}
                className="w-14 h-14 rounded-full bg-slate-700 active:bg-slate-600 flex items-center justify-center text-xl"
              >
                →
              </button>
            </div>

            {/* Game Over Overlay */}
            {gameState === 'gameOver' && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-8 text-center shadow-2xl`}>
                  <div className="text-5xl mb-4">💀</div>
                  <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
                  <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                    Final Score: {score}
                  </p>
                  <button
                    onClick={startGame}
                    className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 transition-colors font-medium"
                  >
                    Play Again
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
