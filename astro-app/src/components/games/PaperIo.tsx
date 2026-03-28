import { useState, useEffect, useCallback, useRef } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type PaperIoProps = {
  settings: Settings
  onBack: () => void
  updateScore?: (score: number) => void
  getHighScore?: () => number
}

interface Player {
  x: number
  y: number
  direction: { x: number; y: number }
  color: string
  trail: { x: number; y: number }[]
  territory: Set<string>
  alive: boolean
  name?: string
}

const GRID_SIZE = 30
const CELL_SIZE = 12
const WORLD_CELLS = GRID_SIZE
const MOVE_SPEED = 150 // ms per move

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F'
]

export default function PaperIo({
  settings,
  onBack,
  updateScore,
  getHighScore,
}: PaperIoProps) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<ReturnType<typeof setInterval>>()
  const audioContext = useRef<AudioContext | null>(null)
  const playersRef = useRef<Player[]>([])
  const gridRef = useRef<Map<string, string>>(new Map())
  const keysRef = useRef<Set<string>>(new Set())

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'

  useEffect(() => {
    const saved = localStorage.getItem('paperio-highscore')
    if (saved) setHighScore(parseInt(saved, 10))
    if (getHighScore) {
      const stored = getHighScore()
      if (stored > 0) setHighScore(stored)
    }
  }, [getHighScore])

  const playSound = useCallback((type: 'capture' | 'death') => {
    if (!settings.soundEnabled) return
    try {
      if (!audioContext.current) audioContext.current = new AudioContext()
      const ctx = audioContext.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      if (type === 'capture') {
        osc.frequency.value = 500
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.1, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
      } else if (type === 'death') {
        osc.frequency.value = 200
        osc.type = 'sawtooth'
        gain.gain.setValueAtTime(0.2, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
      }
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.4)
    } catch {}
  }, [settings.soundEnabled])

  const createAI = useCallback((color: string): Player => {
    const startX = Math.floor(Math.random() * (GRID_SIZE - 6)) + 3
    const startY = Math.floor(Math.random() * (GRID_SIZE - 6)) + 3
    const directions = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }]

    return {
      x: startX,
      y: startY,
      direction: directions[Math.floor(Math.random() * 4)],
      color,
      trail: [],
      territory: new Set(),
      alive: true,
      name: 'Bot',
    }
  }, [])

  const startGame = useCallback(() => {
    const player: Player = {
      x: Math.floor(GRID_SIZE / 2),
      y: Math.floor(GRID_SIZE / 2),
      direction: { x: 1, y: 0 },
      color: '#F59E0B',
      trail: [],
      territory: new Set(),
      alive: true,
      name: 'You',
    }

    // Initialize player territory (3x3 starting area)
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${player.x + dx},${player.y + dy}`
        player.territory.add(key)
        gridRef.current.set(key, player.color)
      }
    }

    // Create AI players
    const aiPlayers: Player[] = []
    const usedColors = [player.color]
    for (let i = 0; i < 3; i++) {
      let color = COLORS[Math.floor(Math.random() * COLORS.length)]
      while (usedColors.includes(color)) {
        color = COLORS[Math.floor(Math.random() * COLORS.length)]
      }
      usedColors.push(color)
      const ai = createAI(color)

      // Initialize AI territory
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const key = `${ai.x + dx},${ai.y + dy}`
          ai.territory.add(key)
          gridRef.current.set(key, ai.color)
        }
      }
      aiPlayers.push(ai)
    }

    playersRef.current = [player, ...aiPlayers]
    gridRef.current.clear()
    setScore(9)
    setGameState('playing')
  }, [createAI])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key)
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Fill enclosed area using flood fill
  const fillTerritory = useCallback((player: Player) => {
    const playerCells = new Set(player.territory)
    const trailCells = new Set(player.trail.map(t => `${t.x},${t.y}`))

    // Combine territory and trail as boundaries
    const boundaries = new Set([...playerCells, ...trailCells])

    // Find enclosed areas using flood fill from edges
    const visited = new Set<string>()
    const queue: { x: number; y: number }[] = []

    // Start from all edge cells
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        if (x === 0 || x === GRID_SIZE - 1 || y === 0 || y === GRID_SIZE - 1) {
          const key = `${x},${y}`
          if (!boundaries.has(key)) {
            queue.push({ x, y })
            visited.add(key)
          }
        }
      }
    }

    // Flood fill from edges to find cells NOT enclosed
    while (queue.length > 0) {
      const { x, y } = queue.shift()!
      const neighbors = [
        { x: x + 1, y },
        { x: x - 1, y },
        { x, y: y + 1 },
        { x, y: y - 1 },
      ]

      for (const n of neighbors) {
        if (n.x >= 0 && n.x < GRID_SIZE && n.y >= 0 && n.y < GRID_SIZE) {
          const key = `${n.x},${n.y}`
          if (!boundaries.has(key) && !visited.has(key)) {
            visited.add(key)
            queue.push(n)
          }
        }
      }
    }

    // All cells not visited are enclosed
    let newCells = 0
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        const key = `${x},${y}`
        if (!visited.has(key) && !player.territory.has(key)) {
          player.territory.add(key)
          gridRef.current.set(key, player.color)
          newCells++
        }
      }
    }

    // Also add trail cells
    for (const t of player.trail) {
      const key = `${t.x},${t.y}`
      if (!player.territory.has(key)) {
        player.territory.add(key)
        gridRef.current.set(key, player.color)
        newCells++
      }
    }

    player.trail = []
    return newCells
  }, [])

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return

    const gameLoop = setInterval(() => {
      const players = playersRef.current
      if (!players.length) return

      const player = players[0]

      // Handle player input
      if (player.alive) {
        if (keysRef.current.has('ArrowLeft') || keysRef.current.has('a')) {
          if (player.direction.x !== 1) player.direction = { x: -1, y: 0 }
        } else if (keysRef.current.has('ArrowRight') || keysRef.current.has('d')) {
          if (player.direction.x !== -1) player.direction = { x: 1, y: 0 }
        } else if (keysRef.current.has('ArrowUp') || keysRef.current.has('w')) {
          if (player.direction.y !== 1) player.direction = { x: 0, y: -1 }
        } else if (keysRef.current.has('ArrowDown') || keysRef.current.has('s')) {
          if (player.direction.y !== -1) player.direction = { x: 0, y: 1 }
        }
      }

      // Update all players
      for (const p of players) {
        if (!p.alive) continue

        // Move
        const newX = p.x + p.direction.x
        const newY = p.y + p.direction.y

        // Check boundaries
        if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
          p.alive = false
          if (p === player) {
            playSound('death')
          }
          continue
        }

        p.x = newX
        p.y = newY

        const currentKey = `${p.x},${p.y}`

        // Check if hit own trail
        const hitOwnTrail = p.trail.some(t => t.x === p.x && t.y === p.y)
        if (hitOwnTrail && p.trail.length > 0) {
          // Complete the loop - fill territory
          const newCells = fillTerritory(p)
          if (newCells > 0 && p === player) {
            playSound('capture')
            setScore(prev => prev + newCells)
          }
          continue
        }

        // Check if on own territory
        if (p.territory.has(currentKey)) {
          // Complete trail and fill
          if (p.trail.length > 0) {
            const newCells = fillTerritory(p)
            if (newCells > 0 && p === player) {
              playSound('capture')
              setScore(prev => prev + newCells)
            }
          }
        } else {
          // Outside territory - add to trail
          p.trail.push({ x: p.x, y: p.y })
        }

        // Check collision with other players' trails
        for (const other of players) {
          if (other === p || !other.alive) continue

          // Hit other's trail
          if (other.trail.some(t => t.x === p.x && t.y === p.y)) {
            other.alive = false
            // Transfer territory
            for (const cell of other.territory) {
              p.territory.add(cell)
              gridRef.current.set(cell, p.color)
            }
            other.territory.clear()
            other.trail = []
            if (other === player) {
              playSound('death')
            }
          }
        }

        // AI behavior
        if (p !== player && p.alive) {
          // Random direction change
          if (Math.random() < 0.1) {
            const dirs = [
              { x: 1, y: 0 }, { x: -1, y: 0 },
              { x: 0, y: 1 }, { x: 0, y: -1 }
            ].filter(d => d.x !== -p.direction.x || d.y !== -p.direction.y)
            p.direction = dirs[Math.floor(Math.random() * dirs.length)]
          }

          // Avoid boundaries
          if (p.x < 2 && p.direction.x === -1) {
            p.direction = { x: 1, y: 0 }
          } else if (p.x > GRID_SIZE - 3 && p.direction.x === 1) {
            p.direction = { x: -1, y: 0 }
          }
          if (p.y < 2 && p.direction.y === -1) {
            p.direction = { x: 0, y: 1 }
          } else if (p.y > GRID_SIZE - 3 && p.direction.y === 1) {
            p.direction = { x: 0, y: -1 }
          }

          // Return to territory if trail is long
          if (p.trail.length > 8) {
            // Try to head back to territory
            const homeCell = [...p.territory][0]
            if (homeCell) {
              const [hx, hy] = homeCell.split(',').map(Number)
              if (Math.random() < 0.3) {
                if (Math.abs(hx - p.x) > Math.abs(hy - p.y)) {
                  p.direction = { x: hx > p.x ? 1 : -1, y: 0 }
                } else {
                  p.direction = { x: 0, y: hy > p.y ? 1 : -1 }
                }
              }
            }
          }
        }
      }

      // Check game over
      if (!player.alive) {
        if (updateScore) updateScore(score)
        if (score > highScore) {
          setHighScore(score)
          localStorage.setItem('paperio-highscore', score.toString())
        }
        setGameState('gameover')
        return
      }

      // Render
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const canvasWidth = GRID_SIZE * CELL_SIZE
      const canvasHeight = GRID_SIZE * CELL_SIZE

      // Background
      ctx.fillStyle = settings.darkMode ? '#1a1a2e' : '#e0e0e0'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      // Draw grid
      ctx.strokeStyle = settings.darkMode ? '#2a2a3e' : '#ccc'
      ctx.lineWidth = 0.5
      for (let x = 0; x <= GRID_SIZE; x++) {
        ctx.beginPath()
        ctx.moveTo(x * CELL_SIZE, 0)
        ctx.lineTo(x * CELL_SIZE, canvasHeight)
        ctx.stroke()
      }
      for (let y = 0; y <= GRID_SIZE; y++) {
        ctx.beginPath()
        ctx.moveTo(0, y * CELL_SIZE)
        ctx.lineTo(canvasWidth, y * CELL_SIZE)
        ctx.stroke()
      }

      // Draw territories
      for (const p of players) {
        if (!p.alive) continue

        // Territory
        ctx.fillStyle = p.color + '80'
        for (const cell of p.territory) {
          const [x, y] = cell.split(',').map(Number)
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
        }

        // Trail
        ctx.fillStyle = p.color
        for (const t of p.trail) {
          ctx.fillRect(t.x * CELL_SIZE + 2, t.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4)
        }

        // Player position
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(
          p.x * CELL_SIZE + CELL_SIZE / 2,
          p.y * CELL_SIZE + CELL_SIZE / 2,
          CELL_SIZE / 2 - 1,
          0, Math.PI * 2
        )
        ctx.fill()

        // Direction indicator
        ctx.strokeStyle = 'white'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(
          p.x * CELL_SIZE + CELL_SIZE / 2,
          p.y * CELL_SIZE + CELL_SIZE / 2
        )
        ctx.lineTo(
          p.x * CELL_SIZE + CELL_SIZE / 2 + p.direction.x * (CELL_SIZE / 2),
          p.y * CELL_SIZE + CELL_SIZE / 2 + p.direction.y * (CELL_SIZE / 2)
        )
        ctx.stroke()
      }

    }, MOVE_SPEED)

    gameLoopRef.current = gameLoop

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }
  }, [gameState, settings.darkMode, playSound, fillTerritory, updateScore, score, highScore])

  const texts = {
    title: settings.language === 'zh' ? '圈地大作战' : 'Paper.io',
    score: settings.language === 'zh' ? '分数' : 'Score',
    highScore: settings.language === 'zh' ? '最高分' : 'Best',
    start: settings.language === 'zh' ? '开始游戏' : 'Start',
    playAgain: settings.language === 'zh' ? '再来一局' : 'Retry',
    gameOver: settings.language === 'zh' ? '游戏结束' : 'Game Over',
    controls: settings.language === 'zh' ? '方向键/WASD 移动，圈地得分' : 'Arrow keys/WASD to move, enclose area to capture',
  }

  return (
    <div className={`min-h-screen flex flex-col items-center py-4 px-2 ${bgClass} ${textClass}`}>
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between border-b border-gray-700 pb-3 mb-4">
          <button onClick={() => gameState === 'playing' ? setGameState('menu') : onBack()} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">{texts.title}</h1>
          <div className="w-8" />
        </div>

        {gameState === 'menu' && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📄</div>
            <h2 className="text-2xl font-bold mb-4">{texts.title}</h2>
            <p className="text-sm mb-4 opacity-60">{texts.controls}</p>
            <p className="text-sm mb-6">{texts.highScore}: {highScore}</p>
            <button onClick={startGame} className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">
              {texts.start}
            </button>
          </div>
        )}

        {(gameState === 'playing' || gameState === 'gameover') && (
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={GRID_SIZE * CELL_SIZE}
              height={GRID_SIZE * CELL_SIZE}
              className="block mx-auto rounded-lg border border-gray-700"
            />

            {gameState === 'playing' && (
              <div className="absolute top-2 left-2 bg-black/50 px-3 py-1 rounded-lg">
                <span className="font-bold">{texts.score}: {score}</span>
              </div>
            )}

            {gameState === 'gameover' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-lg">
                <h2 className="text-3xl font-bold mb-4">{texts.gameOver}</h2>
                <p className="text-xl mb-2">{texts.score}: {score}</p>
                {score >= highScore && score > 0 && (
                  <p className="text-yellow-400 mb-4">🏆 {settings.language === 'zh' ? '新纪录!' : 'New Record!'}</p>
                )}
                <button onClick={startGame} className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">
                  {texts.playAgain}
                </button>
              </div>
            )}
          </div>
        )}

        <p className="mt-4 text-center text-sm opacity-60">{texts.controls}</p>
      </div>
    </div>
  )
}
