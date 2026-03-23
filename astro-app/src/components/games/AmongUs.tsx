import { useEffect, useState, useCallback, useRef } from 'react'

type AmongUsProps = {
  settings?: {
    darkMode: boolean
    soundEnabled: boolean
    language: 'en' | 'zh'
  }
  onBack?: () => void
}

// Sound URLs
const SOUNDS = {
  move: '/games/amongus/assets/Sound/amongus.mp3',
  kill: '/games/amongus/assets/Sound/kill.mp3',
  sabotage: '/games/amongus/assets/Sound/sabotage.mp3',
}

// Character colors with names
const CHARACTER_COLORS = [
  { id: 'red', name: 'Red', bg: 'bg-red-500', hex: '#ef4444' },
  { id: 'blue', name: 'Blue', bg: 'bg-blue-500', hex: '#3b82f6' },
  { id: 'green', name: 'Green', bg: 'bg-green-500', hex: '#22c55e' },
  { id: 'pink', name: 'Pink', bg: 'bg-pink-500', hex: '#ec4899' },
  { id: 'orange', name: 'Orange', bg: 'bg-orange-500', hex: '#f97316' },
  { id: 'yellow', name: 'Yellow', bg: 'bg-yellow-500', hex: '#eab308' },
  { id: 'black', name: 'Black', bg: 'bg-gray-800', hex: '#1f2937' },
  { id: 'white', name: 'White', bg: 'bg-gray-100', hex: '#f3f4f6' },
  { id: 'purple', name: 'Purple', bg: 'bg-purple-500', hex: '#a855f7' },
  { id: 'cyan', name: 'Cyan', bg: 'bg-cyan-500', hex: '#06b6d4' },
]

// Game constants
const KILL_COOLDOWN = 3
const SABOTAGE_COOLDOWN = 12
const DETECTION_RADIUS = 100
const KILL_RANGE = 60
const ENEMY_SPEED = 1.5
const PLAYER_SPEED = 4
const GAME_TIME = 60 // seconds

// Local storage keys
const STORAGE_KEYS = {
  highScore: 'amongus_highscore',
  selectedColor: 'amongus_color',
}

// Enemy type
interface Enemy {
  id: number
  x: number
  y: number
  color: string
  hex: string
  vx: number
  vy: number
  state: 'patrol' | 'flee' | 'alert'
  alertTimer: number
}

export default function AmongUs({ settings }: AmongUsProps) {
  const [gameMode, setGameMode] = useState<'menu' | 'mini' | 'move'>('menu')
  const [selectedColor, setSelectedColor] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.selectedColor)
      return CHARACTER_COLORS.find(c => c.id === saved) || CHARACTER_COLORS[0]
    }
    return CHARACTER_COLORS[0]
  })
  const soundEnabled = settings?.soundEnabled ?? true

  const playSound = useCallback((type: 'move' | 'kill' | 'sabotage') => {
    if (!soundEnabled) return
    try {
      const audio = new Audio(SOUNDS[type])
      audio.volume = 0.2
      audio.play().catch(() => {})
    } catch (e) {}
  }, [soundEnabled])

  const goBack = () => setGameMode('menu')

  const handleColorSelect = (color: typeof CHARACTER_COLORS[0]) => {
    setSelectedColor(color)
    localStorage.setItem(STORAGE_KEYS.selectedColor, color.id)
  }

  // Menu Screen
  if (gameMode === 'menu') {
    return (
      <div className="w-full h-full min-h-[600px] flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
        <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-500 drop-shadow-lg">
          Among Us
        </h1>

        <img
          src="/games/amongus/assets/Image/banner.png"
          alt="Among Us"
          className="max-w-xs w-full mb-6 drop-shadow-2xl"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />

        {/* Character Color Selection */}
        <div className="mb-6">
          <p className="text-center text-slate-400 text-sm mb-2">Select Your Character</p>
          <div className="flex flex-wrap justify-center gap-2 max-w-xs">
            {CHARACTER_COLORS.map(color => (
              <button
                key={color.id}
                onClick={() => handleColorSelect(color)}
                className={`w-10 h-10 rounded-full border-2 transition-all ${
                  selectedColor.id === color.id
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110'
                    : 'hover:scale-105'
                } ${color.bg}`}
                title={color.name}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => setGameMode('mini')}
            className="px-10 py-4 text-xl font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 active:scale-95"
          >
            🎮 Mini Game
          </button>

          <button
            onClick={() => setGameMode('move')}
            className="px-10 py-4 text-xl font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 active:scale-95"
          >
            👽 Free Move
          </button>
        </div>

        <p className="mt-6 text-slate-400 text-xs text-center max-w-xs">
          Chase & kill enemies before they escape!<br/>
          Arrow Keys / WASD to move • K to Kill • J for Sabotage
        </p>
      </div>
    )
  }

  // Mini Game Mode
  if (gameMode === 'mini') {
    return <MiniGame goBack={goBack} playSound={playSound} selectedColor={selectedColor} />
  }

  // Character Move Mode
  return <CharacterMove goBack={goBack} playSound={playSound} selectedColor={selectedColor} />
}

// ============ MINI GAME WITH AI ============
function MiniGame({
  goBack,
  playSound,
  selectedColor
}: {
  goBack: () => void
  playSound: (type: 'move' | 'kill' | 'sabotage') => void
  selectedColor: typeof CHARACTER_COLORS[0]
}) {
  // Game state
  const [gameState, setGameState] = useState<'playing' | 'gameover'>('playing')
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 })
  const [facing, setFacing] = useState<'left' | 'right'>('right')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem(STORAGE_KEYS.highScore) || '0')
    }
    return 0
  })
  const [timeLeft, setTimeLeft] = useState(GAME_TIME)
  const [enemies, setEnemies] = useState<Enemy[]>([])
  const [deadBodies, setDeadBodies] = useState<{ x: number; y: number }[]>([])
  const [isSabotage, setIsSabotage] = useState(false)
  const [alertLevel, setAlertLevel] = useState(0)
  const [legAnim, setLegAnim] = useState<'left' | 'right' | null>(null)

  // Cooldowns
  const [killCooldown, setKillCooldown] = useState(0)
  const [sabotageCooldown, setSabotageCooldown] = useState(0)

  // Refs
  const gameRef = useRef<HTMLDivElement>(null)
  const joystickRef = useRef({ startX: 0, startY: 0, active: false })
  const keysPressed = useRef<Set<string>>(new Set())
  const animationRef = useRef<number>()

  // Enemy colors
  const enemyColors = CHARACTER_COLORS.filter(c => c.id !== selectedColor.id)

  // Spawn new enemy
  const spawnEnemy = useCallback(() => {
    const color = enemyColors[Math.floor(Math.random() * enemyColors.length)]
    const angle = Math.random() * Math.PI * 2
    const distance = 200 + Math.random() * 150

    const newEnemy: Enemy = {
      id: Date.now() + Math.random(),
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      color: color.bg,
      hex: color.hex,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      state: 'patrol',
      alertTimer: 0
    }

    return newEnemy
  }, [enemyColors])

  // Initialize enemies
  useEffect(() => {
    const initialEnemies = Array.from({ length: 3 }, () => spawnEnemy())
    setEnemies(initialEnemies)
  }, [spawnEnemy])

  // Game timer
  useEffect(() => {
    if (gameState !== 'playing') return

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameState('gameover')
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState])

  // Cooldown timers
  useEffect(() => {
    if (killCooldown <= 0) return
    const timer = setInterval(() => setKillCooldown(c => Math.max(0, c - 1)), 1000)
    return () => clearInterval(timer)
  }, [killCooldown > 0])

  useEffect(() => {
    if (sabotageCooldown <= 0) return
    const timer = setInterval(() => setSabotageCooldown(c => Math.max(0, c - 1)), 1000)
    return () => clearInterval(timer)
  }, [sabotageCooldown > 0])

  // Save high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem(STORAGE_KEYS.highScore, score.toString())
    }
  }, [score, highScore])

  // Main game loop - Enemy AI
  useEffect(() => {
    if (gameState !== 'playing') return

    const gameLoop = () => {
      setEnemies(prevEnemies => {
        return prevEnemies.map(enemy => {
          const dx = playerPos.x - enemy.x
          const dy = playerPos.y - enemy.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          let newVx = enemy.vx
          let newVy = enemy.vy
          let newState = enemy.state
          let newAlertTimer = enemy.alertTimer

          // State machine
          if (distance < DETECTION_RADIUS) {
            // Player detected - flee!
            newState = 'flee'
            newAlertTimer = 3

            // Run away from player
            const fleeAngle = Math.atan2(-dy, -dx)
            newVx = Math.cos(fleeAngle) * ENEMY_SPEED * 2
            newVy = Math.sin(fleeAngle) * ENEMY_SPEED * 2
          } else if (enemy.alertTimer > 0) {
            // Still alert, slow down
            newAlertTimer = enemy.alertTimer - 0.016
            newState = 'alert'
          } else {
            // Patrol randomly
            newState = 'patrol'

            // Random direction change
            if (Math.random() < 0.02) {
              newVx = (Math.random() - 0.5) * 3
              newVy = (Math.random() - 0.5) * 3
            }

            // Limit patrol speed
            const speed = Math.sqrt(newVx * newVx + newVy * newVy)
            if (speed > ENEMY_SPEED) {
              newVx = (newVx / speed) * ENEMY_SPEED
              newVy = (newVy / speed) * ENEMY_SPEED
            }
          }

          // Update position
          let newX = enemy.x + newVx
          let newY = enemy.y + newVy

          // Boundary check
          const boundary = 280
          if (Math.abs(newX) > boundary) {
            newVx = -newVx
            newX = Math.sign(newX) * boundary
          }
          if (Math.abs(newY) > boundary) {
            newVy = -newVy
            newY = Math.sign(newY) * boundary
          }

          return {
            ...enemy,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            state: newState,
            alertTimer: newAlertTimer
          }
        })
      })

      // Update alert level
      const alertEnemies = enemies.filter(e => e.state === 'alert' || e.state === 'flee')
      setAlertLevel(Math.min(100, alertEnemies.length * 30))

      animationRef.current = requestAnimationFrame(gameLoop)
    }

    animationRef.current = requestAnimationFrame(gameLoop)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [gameState, playerPos, enemies])

  // Player movement
  const movePlayer = useCallback((dx: number, dy: number) => {
    if (gameState !== 'playing') return

    setLegAnim('left')
    setTimeout(() => setLegAnim('right'), 100)
    setTimeout(() => setLegAnim(null), 200)

    setPlayerPos(p => ({
      x: Math.max(-300, Math.min(300, p.x + dx * PLAYER_SPEED)),
      y: Math.max(-250, Math.min(250, p.y + dy * PLAYER_SPEED))
    }))

    if (dx < 0) setFacing('left')
    if (dx > 0) setFacing('right')
  }, [gameState])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase())

      if (e.key.toLowerCase() === 'k') handleKill()
      if (e.key.toLowerCase() === 'j') handleSabotage()
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase())
    }

    const moveLoop = () => {
      let dx = 0, dy = 0
      if (keysPressed.current.has('arrowleft') || keysPressed.current.has('a')) dx -= 1
      if (keysPressed.current.has('arrowright') || keysPressed.current.has('d')) dx += 1
      if (keysPressed.current.has('arrowup') || keysPressed.current.has('w')) dy -= 1
      if (keysPressed.current.has('arrowdown') || keysPressed.current.has('s')) dy += 1

      if (dx !== 0 || dy !== 0) {
        const len = Math.sqrt(dx * dx + dy * dy)
        movePlayer(dx / len, dy / len)
      }

      requestAnimationFrame(moveLoop)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    const animId = requestAnimationFrame(moveLoop)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      cancelAnimationFrame(animId)
    }
  }, [movePlayer])

  // Kill action
  const handleKill = useCallback(() => {
    if (killCooldown > 0 || gameState !== 'playing') return

    // Find enemy in range
    const killableEnemy = enemies.find(enemy => {
      const dx = playerPos.x - enemy.x
      const dy = playerPos.y - enemy.y
      return Math.sqrt(dx * dx + dy * dy) < KILL_RANGE
    })

    if (killableEnemy) {
      playSound('kill')
      setScore(s => s + 1)
      setKillCooldown(KILL_COOLDOWN)

      // Add dead body
      setDeadBodies(b => [...b.slice(-5), { x: killableEnemy.x, y: killableEnemy.y }])

      // Remove enemy and spawn new one
      setEnemies(prev => {
        const filtered = prev.filter(e => e.id !== killableEnemy.id)
        return [...filtered, spawnEnemy()]
      })
    }
  }, [killCooldown, enemies, playerPos, gameState, playSound, spawnEnemy])

  // Sabotage action
  const handleSabotage = useCallback(() => {
    if (sabotageCooldown > 0 || isSabotage || gameState !== 'playing') return

    playSound('sabotage')
    setIsSabotage(true)
    setSabotageCooldown(SABOTAGE_COOLDOWN)

    // Confuse enemies - reverse their movement
    setEnemies(prev => prev.map(e => ({
      ...e,
      vx: -e.vx * 2,
      vy: -e.vy * 2,
      state: 'patrol' as const,
      alertTimer: 0
    })))

    // Flash effect
    const timings = [0, 500, 1000, 1500, 2000]
    timings.forEach((t, i) => {
      setTimeout(() => setIsSabotage(i % 2 === 0), t)
    })
    setTimeout(() => setIsSabotage(false), 2500)
  }, [sabotageCooldown, isSabotage, gameState, playSound])

  // Touch controls
  useEffect(() => {
    const gameArea = gameRef.current
    if (!gameArea) return

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      joystickRef.current = { startX: touch.clientX, startY: touch.clientY, active: true }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!joystickRef.current.active || gameState !== 'playing') return

      const touch = e.touches[0]
      const dx = touch.clientX - joystickRef.current.startX
      const dy = touch.clientY - joystickRef.current.startY
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance > 15) {
        movePlayer(dx / distance, dy / distance)
        joystickRef.current.startX = touch.clientX
        joystickRef.current.startY = touch.clientY
      }
    }

    const handleTouchEnd = () => {
      joystickRef.current.active = false
      setLegAnim(null)
    }

    gameArea.addEventListener('touchstart', handleTouchStart, { passive: true })
    gameArea.addEventListener('touchmove', handleTouchMove, { passive: true })
    gameArea.addEventListener('touchend', handleTouchEnd)

    return () => {
      gameArea.removeEventListener('touchstart', handleTouchStart)
      gameArea.removeEventListener('touchmove', handleTouchMove)
      gameArea.removeEventListener('touchend', handleTouchEnd)
    }
  }, [movePlayer, gameState])

  // Restart game
  const restartGame = () => {
    setGameState('playing')
    setScore(0)
    setTimeLeft(GAME_TIME)
    setPlayerPos({ x: 0, y: 0 })
    setDeadBodies([])
    setAlertLevel(0)
    setKillCooldown(0)
    setSabotageCooldown(0)
    setIsSabotage(false)
    const newEnemies = Array.from({ length: 3 }, () => spawnEnemy())
    setEnemies(newEnemies)
  }

  const canKill = killCooldown === 0
  const canSabotage = sabotageCooldown === 0 && !isSabotage

  // Check for enemies in kill range
  const nearestEnemy = enemies.find(enemy => {
    const dx = playerPos.x - enemy.x
    const dy = playerPos.y - enemy.y
    return Math.sqrt(dx * dx + dy * dy) < KILL_RANGE
  })

  return (
    <div ref={gameRef} className="w-full h-full min-h-[600px] relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 select-none touch-none">
      {/* Back button */}
      <button
        onClick={goBack}
        className="absolute top-4 left-4 z-50 px-4 py-2 text-white bg-white/10 border border-white/30 rounded-full backdrop-blur-sm hover:bg-white/20 transition-all"
      >
        ← Back
      </button>

      {/* Score & Time */}
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-1">
        <div className="px-4 py-2 text-white bg-black/50 rounded-lg font-bold text-lg">
          ⭐ {score}
        </div>
        <div className="px-3 py-1 text-yellow-400 bg-black/50 rounded-lg text-sm">
          🏆 {highScore}
        </div>
        <div className={`px-3 py-1 rounded-lg text-sm font-bold ${timeLeft <= 10 ? 'bg-red-600 text-white animate-pulse' : 'bg-black/50 text-white'}`}>
          ⏱️ {timeLeft}s
        </div>
      </div>

      {/* Alert meter */}
      {alertLevel > 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
          <div className="px-4 py-1 bg-red-600/80 rounded-lg flex items-center gap-2">
            <span className="text-white text-sm">⚠️ ALERT</span>
            <div className="w-20 h-2 bg-black/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-400 transition-all"
                style={{ width: `${alertLevel}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Sabotage overlay */}
      {isSabotage && (
        <div className="absolute inset-0 bg-red-500/30 pointer-events-none z-40 animate-pulse" />
      )}

      {/* Game area */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Detection range indicator (subtle) */}
        <div
          className="absolute rounded-full border border-dashed border-white/10 pointer-events-none"
          style={{
            width: DETECTION_RADIUS * 2,
            height: DETECTION_RADIUS * 2,
            left: `calc(50% + ${playerPos.x}px - ${DETECTION_RADIUS}px)`,
            top: `calc(50% + ${playerPos.y}px - ${DETECTION_RADIUS}px)`
          }}
        />

        {/* Kill range indicator */}
        <div
          className={`absolute rounded-full border-2 pointer-events-none transition-all ${nearestEnemy ? 'border-red-500/50 bg-red-500/10' : 'border-white/5'}`}
          style={{
            width: KILL_RANGE * 2,
            height: KILL_RANGE * 2,
            left: `calc(50% + ${playerPos.x}px - ${KILL_RANGE}px)`,
            top: `calc(50% + ${playerPos.y}px - ${KILL_RANGE}px)`
          }}
        />

        {/* Dead bodies */}
        {deadBodies.map((body, i) => (
          <div
            key={i}
            className="absolute text-4xl opacity-70"
            style={{
              left: `calc(50% + ${body.x}px)`,
              top: `calc(50% + ${body.y}px)`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            💀
          </div>
        ))}

        {/* Enemies */}
        {enemies.map(enemy => (
          <div
            key={enemy.id}
            className="absolute transition-transform"
            style={{
              left: `calc(50% + ${enemy.x}px)`,
              top: `calc(50% + ${enemy.y}px)`,
              transform: `translate(-50%, -50%) ${enemy.vx < 0 ? 'scaleX(-1)' : 'scaleX(1)'}`
            }}
          >
            <div className={`relative ${enemy.color}`}>
              <CharacterSVG color={enemy.hex} />
              {/* State indicator */}
              {enemy.state === 'flee' && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl animate-bounce">😱</div>
              )}
              {enemy.state === 'alert' && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl">⚠️</div>
              )}
            </div>
          </div>
        ))}

        {/* Player */}
        <div
          className="absolute"
          style={{
            left: `calc(50% + ${playerPos.x}px)`,
            top: `calc(50% + ${playerPos.y}px)`,
            transform: `translate(-50%, -50%) ${facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)'}`
          }}
        >
          <div className={selectedColor.bg}>
            <CharacterSVG color={selectedColor.hex} legAnim={legAnim} showHand />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-4 z-50">
        <button
          onClick={handleKill}
          disabled={!canKill || gameState !== 'playing'}
          className={`relative px-6 py-3 text-white rounded-lg font-bold shadow-lg transition-all ${
            canKill && gameState === 'playing'
              ? nearestEnemy
                ? 'bg-red-500 hover:bg-red-400 animate-pulse ring-2 ring-white'
                : 'bg-red-600 hover:bg-red-500'
              : 'bg-gray-600 cursor-not-allowed opacity-50'
          }`}
        >
          🔪 Kill
          {killCooldown > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-black/80 rounded-full flex items-center justify-center text-xs">
              {killCooldown}
            </span>
          )}
        </button>
        <button
          onClick={handleSabotage}
          disabled={!canSabotage || gameState !== 'playing'}
          className={`relative px-6 py-3 text-white rounded-lg font-bold shadow-lg transition-all ${
            canSabotage && gameState === 'playing'
              ? 'bg-orange-600 hover:bg-orange-500'
              : 'bg-gray-600 cursor-not-allowed opacity-50'
          }`}
        >
          ⚡ Sabotage
          {sabotageCooldown > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-black/80 rounded-full flex items-center justify-center text-xs">
              {sabotageCooldown}
            </span>
          )}
        </button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-slate-400 text-xs text-center z-50">
        Get close to enemies and press K to kill!
      </div>

      {/* Game Over overlay */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-4">Game Over!</h2>
            <p className="text-2xl text-yellow-400 mb-2">Score: {score}</p>
            <p className="text-lg text-slate-400 mb-6">Best: {highScore}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={restartGame}
                className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition-all"
              >
                🔄 Play Again
              </button>
              <button
                onClick={goBack}
                className="px-8 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-bold transition-all"
              >
                ← Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============ CHARACTER MOVE ============
function CharacterMove({
  goBack,
  playSound,
  selectedColor
}: {
  goBack: () => void
  playSound: (type: 'move' | 'kill' | 'sabotage') => void
  selectedColor: typeof CHARACTER_COLORS[0]
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [facing, setFacing] = useState<'left' | 'right'>('right')
  const [legAnim, setLegAnim] = useState<'left' | 'right' | null>(null)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  const gameRef = useRef<HTMLDivElement>(null)
  const joystickRef = useRef({ startX: 0, startY: 0, active: false })

  const moveCharacter = useCallback((dx: number, dy: number) => {
    const step = 8

    setLegAnim('left')
    setTimeout(() => setLegAnim('right'), 100)
    setTimeout(() => setLegAnim(null), 200)

    setPosition(p => ({ x: p.x + dx * step, y: p.y + dy * step }))
    if (dx < 0) setFacing('left')
    if (dx > 0) setFacing('right')
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft': case 'a': case 'A': moveCharacter(-1, 0); break
        case 'ArrowRight': case 'd': case 'D': moveCharacter(1, 0); break
        case 'ArrowUp': case 'w': case 'W': moveCharacter(0, -1); break
        case 'ArrowDown': case 's': case 'S': moveCharacter(0, 1); break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [moveCharacter])

  useEffect(() => {
    const gameArea = gameRef.current
    if (!gameArea) return

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      joystickRef.current = { startX: touch.clientX, startY: touch.clientY, active: true }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!joystickRef.current.active) return

      const touch = e.touches[0]
      const dx = touch.clientX - joystickRef.current.startX
      const dy = touch.clientY - joystickRef.current.startY
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance > 15) {
        moveCharacter(dx / distance, dy / distance)
        joystickRef.current.startX = touch.clientX
        joystickRef.current.startY = touch.clientY
      }
    }

    const handleTouchEnd = () => {
      joystickRef.current.active = false
      setLegAnim(null)
    }

    gameArea.addEventListener('touchstart', handleTouchStart, { passive: true })
    gameArea.addEventListener('touchmove', handleTouchMove, { passive: true })
    gameArea.addEventListener('touchend', handleTouchEnd)

    return () => {
      gameArea.removeEventListener('touchstart', handleTouchStart)
      gameArea.removeEventListener('touchmove', handleTouchMove)
      gameArea.removeEventListener('touchend', handleTouchEnd)
    }
  }, [moveCharacter])

  const bgColor = theme === 'dark'
    ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
    : 'bg-gradient-to-br from-slate-100 via-white to-slate-100'
  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-800'

  return (
    <div ref={gameRef} className={`w-full h-full min-h-[600px] relative overflow-hidden ${bgColor} transition-colors duration-300 select-none touch-none`}>
      <button
        onClick={goBack}
        className={`absolute top-4 left-4 z-50 px-4 py-2 ${textColor} ${theme === 'dark' ? 'bg-white/10 border-white/30' : 'bg-black/10 border-black/30'} border rounded-full backdrop-blur-sm hover:bg-white/20 transition-all`}
      >
        ← Back
      </button>

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`absolute ${selectedColor.bg}`}
          style={{
            left: `calc(50% + ${position.x}px)`,
            top: `calc(50% + ${position.y}px)`,
            transform: `translate(-50%, -50%) ${facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)'}`
          }}
        >
          <CharacterSVG color={selectedColor.hex} legAnim={legAnim} showHand />
        </div>
      </div>

      <div className={`absolute top-20 left-1/2 -translate-x-1/2 ${textColor} text-lg text-center`}>
        Use Arrow Keys or WASD to move!
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-50">
        <button
          onClick={() => setTheme('light')}
          className={`px-6 py-3 rounded-lg font-bold transition-all ${theme === 'light' ? 'bg-white text-black ring-2 ring-black' : 'bg-gray-200 text-gray-700 hover:bg-white'}`}
        >
          ☀️ Light
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`px-6 py-3 rounded-lg font-bold transition-all ${theme === 'dark' ? 'bg-slate-800 text-white ring-2 ring-white' : 'bg-slate-700 text-gray-200 hover:bg-slate-800'}`}
        >
          🌙 Dark
        </button>
      </div>
    </div>
  )
}

// ============ CHARACTER SVG ============
function CharacterSVG({
  color = '#ef4444',
  legAnim,
  showHand = false
}: {
  color?: string
  legAnim?: 'left' | 'right' | null
  showHand?: boolean
}) {
  return (
    <div className="relative" style={{ width: 80, height: 110 }}>
      {/* Hand */}
      {showHand && (
        <div
          className="absolute rounded-full"
          style={{
            backgroundColor: color,
            width: 20,
            height: 32,
            left: -12,
            top: 40
          }}
        />
      )}

      {/* Body */}
      <div
        className="rounded-3xl relative"
        style={{
          backgroundColor: color,
          width: 80,
          height: 90,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}
      >
        {/* Visor */}
        <div
          className="absolute rounded-full"
          style={{
            backgroundColor: '#a5f3fc',
            width: 40,
            height: 30,
            top: 12,
            right: 4,
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2)'
          }}
        />
        <div
          className="absolute rounded-l-full"
          style={{
            backgroundColor: '#a5f3fc',
            width: 14,
            height: 30,
            top: 12,
            right: 44
          }}
        />
      </div>

      {/* Left Leg */}
      <div
        className="absolute rounded-b-2xl origin-top transition-transform duration-75"
        style={{
          backgroundColor: color,
          width: 28,
          height: 40,
          bottom: 0,
          left: 8,
          transform: legAnim === 'left' ? 'rotate(-15deg)' : 'rotate(0deg)'
        }}
      />

      {/* Right Leg */}
      <div
        className="absolute rounded-b-2xl origin-top transition-transform duration-75"
        style={{
          backgroundColor: color,
          width: 28,
          height: 40,
          bottom: 0,
          right: 8,
          transform: legAnim === 'right' ? 'rotate(15deg)' : 'rotate(0deg)'
        }}
      />
    </div>
  )
}
