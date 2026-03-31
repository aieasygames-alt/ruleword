import { useState, useEffect, useCallback, useRef } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type AgarIoProps = {
  settings: Settings
  onBack: () => void
  updateScore?: (score: number) => void
  getHighScore?: () => number
}

interface Cell {
  x: number
  y: number
  radius: number
  color: string
  vx: number
  vy: number
  isPlayer: boolean
  name?: string
}

const WORLD_SIZE = 2000
const FOOD_COUNT = 200
const AI_COUNT = 15
const MIN_RADIUS = 10
const MAX_RADIUS = 150

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8B500', '#00CED1', '#FF69B4', '#32CD32', '#FFD700'
]

export default function AgarIo({
  settings,
  onBack,
  updateScore,
  getHighScore,
}: AgarIoProps) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu')
  const [playerName, setPlayerName] = useState('Player')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<ReturnType<typeof requestAnimationFrame>>()
  const audioContext = useRef<AudioContext | null>(null)
  const cellsRef = useRef<Cell[]>([])
  const playerRef = useRef<Cell | null>(null)
  const mouseRef = useRef({ x: 180, y: 250 }) // center of 360x500 canvas
  const cameraRef = useRef({ x: 0, y: 0, zoom: 1 })
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const isTouchingRef = useRef(false)

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'

  useEffect(() => {
    const saved = localStorage.getItem('agario-highscore')
    if (saved) setHighScore(parseInt(saved, 10))
    if (getHighScore) {
      const stored = getHighScore()
      if (stored > 0) setHighScore(stored)
    }
  }, [getHighScore])

  const playSound = useCallback((type: 'eat' | 'death') => {
    if (!settings.soundEnabled) return
    try {
      if (!audioContext.current) audioContext.current = new AudioContext()
      const ctx = audioContext.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      if (type === 'eat') {
        osc.frequency.value = 600 + Math.random() * 200
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.1, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
      } else if (type === 'death') {
        osc.frequency.value = 150
        osc.type = 'sawtooth'
        gain.gain.setValueAtTime(0.2, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
      }
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.5)
    } catch {}
  }, [settings.soundEnabled])

  const createFood = useCallback((): Cell => ({
    x: Math.random() * WORLD_SIZE,
    y: Math.random() * WORLD_SIZE,
    radius: 5 + Math.random() * 5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    vx: 0,
    vy: 0,
    isPlayer: false,
  }), [])

  const createAI = useCallback((): Cell => ({
    x: Math.random() * WORLD_SIZE,
    y: Math.random() * WORLD_SIZE,
    radius: 15 + Math.random() * 40,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    isPlayer: false,
    name: ['Bot', 'AI', 'CPU', 'NPC', 'Bot2', 'AI2'][Math.floor(Math.random() * 6)],
  }), [])

  const startGame = useCallback(() => {
    const player: Cell = {
      x: WORLD_SIZE / 2,
      y: WORLD_SIZE / 2,
      radius: 20,
      color: '#F59E0B',
      vx: 0,
      vy: 0,
      isPlayer: true,
      name: playerName,
    }

    const cells: Cell[] = [player]

    // Add food
    for (let i = 0; i < FOOD_COUNT; i++) {
      cells.push(createFood())
    }

    // Add AI
    for (let i = 0; i < AI_COUNT; i++) {
      cells.push(createAI())
    }

    cellsRef.current = cells
    playerRef.current = player
    setScore(0)
    setGameState('playing')
  }, [playerName, createFood, createAI])

  // Handle mouse/touch movement
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      mouseRef.current = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const touch = e.touches[0]
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      const x = (touch.clientX - rect.left) * scaleX
      const y = (touch.clientY - rect.top) * scaleY
      touchStartRef.current = { x, y }
      isTouchingRef.current = true
      // Set mouse to touch position
      mouseRef.current = { x, y }
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      if (!touchStartRef.current) return
      const rect = canvas.getBoundingClientRect()
      const touch = e.touches[0]
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      const x = (touch.clientX - rect.left) * scaleX
      const y = (touch.clientY - rect.top) * scaleY

      // Calculate direction from touch start to current position
      const startDX = x - touchStartRef.current.x
      const startDY = y - touchStartRef.current.y
      const startDist = Math.sqrt(startDX * startDX + startDY * startDY)

      // Amplify the direction to make the ball follow finger intent
      // Map the touch delta to a target position relative to canvas center
      const amplify = 3
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      if (startDist > 10) {
        mouseRef.current = {
          x: centerX + startDX * amplify,
          y: centerY + startDY * amplify,
        }
      }
    }

    const handleTouchEnd = () => {
      isTouchingRef.current = false
      // Reset mouse to center so ball stops moving
      mouseRef.current = {
        x: canvas.width / 2,
        y: canvas.height / 2,
      }
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd)

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let lastTime = Date.now()

    const gameLoop = () => {
      const now = Date.now()
      const delta = (now - lastTime) / 1000
      lastTime = now

      const player = playerRef.current
      if (!player) return

      // Update camera
      const canvasWidth = canvas.width
      const canvasHeight = canvas.height
      cameraRef.current.zoom = Math.max(0.5, 1 - (player.radius - 20) / 200)
      cameraRef.current.x = player.x - canvasWidth / 2 / cameraRef.current.zoom
      cameraRef.current.y = player.y - canvasHeight / 2 / cameraRef.current.zoom

      // Move player towards mouse
      const centerX = canvasWidth / 2
      const centerY = canvasHeight / 2
      const dx = mouseRef.current.x - centerX
      const dy = mouseRef.current.y - centerY
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist > 5) {
        const speed = Math.max(1.5, 4 - player.radius / 50)
        // Smooth acceleration instead of instant speed
        const targetVx = (dx / dist) * speed
        const targetVy = (dy / dist) * speed
        player.vx += (targetVx - player.vx) * 0.15
        player.vy += (targetVy - player.vy) * 0.15
      } else {
        player.vx *= 0.9
        player.vy *= 0.9
      }

      // Update all cells
      for (const cell of cellsRef.current) {
        // Move
        cell.x += cell.vx
        cell.y += cell.vy

        // Boundary
        cell.x = Math.max(cell.radius, Math.min(WORLD_SIZE - cell.radius, cell.x))
        cell.y = Math.max(cell.radius, Math.min(WORLD_SIZE - cell.radius, cell.y))

        // AI behavior
        if (!cell.isPlayer && cell.radius > 10) {
          // Random direction change
          if (Math.random() < 0.02) {
            cell.vx = (Math.random() - 0.5) * 3
            cell.vy = (Math.random() - 0.5) * 3
          }

          // Flee from larger cells
          for (const other of cellsRef.current) {
            if (other.isPlayer && other.radius > cell.radius * 1.1) {
              const dx = cell.x - other.x
              const dy = cell.y - other.y
              const d = Math.sqrt(dx * dx + dy * dy)
              if (d < 200) {
                cell.vx += (dx / d) * 0.5
                cell.vy += (dy / d) * 0.5
              }
            }
          }

          // Chase smaller cells
          for (const other of cellsRef.current) {
            if (!other.isPlayer && other !== cell && cell.radius > other.radius * 1.1) {
              const dx = other.x - cell.x
              const dy = other.y - cell.y
              const d = Math.sqrt(dx * dx + dy * dy)
              if (d < 150) {
                cell.vx += (dx / d) * 0.2
                cell.vy += (dy / d) * 0.2
              }
            }
          }

          // Limit AI speed
          const maxSpeed = Math.max(1, 5 - cell.radius / 40)
          const speed = Math.sqrt(cell.vx * cell.vx + cell.vy * cell.vy)
          if (speed > maxSpeed) {
            cell.vx = (cell.vx / speed) * maxSpeed
            cell.vy = (cell.vy / speed) * maxSpeed
          }
        }
      }

      // Check collisions
      const newCells: Cell[] = []
      const toRemove = new Set<Cell>()

      for (let i = 0; i < cellsRef.current.length; i++) {
        const a = cellsRef.current[i]
        if (toRemove.has(a)) continue

        for (let j = i + 1; j < cellsRef.current.length; j++) {
          const b = cellsRef.current[j]
          if (toRemove.has(b)) continue

          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          // Can eat if significantly larger
          if (dist < a.radius - b.radius * 0.5 && a.radius > b.radius * 1.1) {
            a.radius = Math.min(MAX_RADIUS, Math.sqrt(a.radius * a.radius + b.radius * b.radius * 0.5))
            toRemove.add(b)
            if (a.isPlayer) {
              playSound('eat')
              setScore(s => s + Math.floor(b.radius * 10))
            }
          } else if (dist < b.radius - a.radius * 0.5 && b.radius > a.radius * 1.1) {
            b.radius = Math.min(MAX_RADIUS, Math.sqrt(b.radius * b.radius + a.radius * a.radius * 0.5))
            toRemove.add(a)
            if (b.isPlayer) {
              playSound('eat')
              setScore(s => s + Math.floor(a.radius * 10))
            }
          }
        }
      }

      // Player death check
      if (toRemove.has(player)) {
        playSound('death')
        if (updateScore) updateScore(score)
        if (score > highScore) {
          setHighScore(score)
          localStorage.setItem('agario-highscore', score.toString())
        }
        setGameState('gameover')
        return
      }

      // Remove eaten cells and add new food
      cellsRef.current = cellsRef.current.filter(c => !toRemove.has(c))

      // Respawn food
      const foodCount = cellsRef.current.filter(c => c.radius < 15).length
      if (foodCount < FOOD_COUNT) {
        cellsRef.current.push(createFood())
      }

      // Respawn AI
      const aiCount = cellsRef.current.filter(c => !c.isPlayer && c.radius >= 15).length
      if (aiCount < AI_COUNT) {
        cellsRef.current.push(createAI())
      }

      // Render
      const cam = cameraRef.current

      // Clear and draw background
      ctx.fillStyle = settings.darkMode ? '#0a0a15' : '#f0f0f0'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      ctx.save()
      ctx.scale(cam.zoom, cam.zoom)
      ctx.translate(-cam.x, -cam.y)

      // Draw grid
      ctx.strokeStyle = settings.darkMode ? '#1a1a2e' : '#ddd'
      ctx.lineWidth = 1 / cam.zoom
      const gridSize = 50
      for (let x = 0; x <= WORLD_SIZE; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, WORLD_SIZE)
        ctx.stroke()
      }
      for (let y = 0; y <= WORLD_SIZE; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(WORLD_SIZE, y)
        ctx.stroke()
      }

      // Draw world boundary
      ctx.strokeStyle = settings.darkMode ? '#e94560' : '#ff6b6b'
      ctx.lineWidth = 5 / cam.zoom
      ctx.strokeRect(0, 0, WORLD_SIZE, WORLD_SIZE)

      // Draw cells (sorted by size for proper layering)
      const sortedCells = [...cellsRef.current].sort((a, b) => a.radius - b.radius)

      for (const cell of sortedCells) {
        // Cell body
        ctx.beginPath()
        ctx.arc(cell.x, cell.y, cell.radius, 0, Math.PI * 2)
        ctx.fillStyle = cell.color
        ctx.fill()

        // Cell border
        ctx.strokeStyle = settings.darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'
        ctx.lineWidth = 2 / cam.zoom
        ctx.stroke()

        // Name
        if (cell.radius > 15 && cell.name) {
          ctx.fillStyle = 'white'
          ctx.strokeStyle = 'black'
          ctx.lineWidth = 3 / cam.zoom
          ctx.font = `bold ${Math.max(12, cell.radius / 3)}px Arial`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.strokeText(cell.name, cell.x, cell.y)
          ctx.fillText(cell.name, cell.x, cell.y)
        }
      }

      ctx.restore()

      // Draw score
      ctx.fillStyle = 'white'
      ctx.strokeStyle = 'black'
      ctx.lineWidth = 2
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'left'
      ctx.strokeText(`Score: ${Math.floor(player.radius * 10)}`, 10, 30)
      ctx.fillText(`Score: ${Math.floor(player.radius * 10)}`, 10, 30)

      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    }
  }, [gameState, settings.darkMode, playSound, updateScore, score, highScore, createFood, createAI])

  const texts = {
    title: settings.language === 'zh' ? '大球吃小球' : 'Agar.io',
    score: settings.language === 'zh' ? '分数' : 'Score',
    highScore: settings.language === 'zh' ? '最高分' : 'Best',
    start: settings.language === 'zh' ? '开始游戏' : 'Start',
    playAgain: settings.language === 'zh' ? '再来一局' : 'Retry',
    gameOver: settings.language === 'zh' ? '游戏结束' : 'Game Over',
    enterName: settings.language === 'zh' ? '输入名字' : 'Enter Name',
    controls: settings.language === 'zh' ? '鼠标/触摸控制方向，吃掉比你小的细胞' : 'Touch/drag to steer, eat smaller cells',
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
            <div className="text-6xl mb-4">🦠</div>
            <h2 className="text-2xl font-bold mb-6">{texts.title}</h2>

            <div className="mb-6">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value.slice(0, 12))}
                placeholder={texts.enterName}
                className="w-48 px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-center"
              />
            </div>

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
              width={360}
              height={500}
              className="block mx-auto rounded-lg border border-gray-700 max-w-full"
            />

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
