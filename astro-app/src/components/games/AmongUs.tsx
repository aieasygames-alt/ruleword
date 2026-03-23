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
  { id: 'red', name: 'Red', bg: 'bg-red-500', text: 'text-red-500' },
  { id: 'blue', name: 'Blue', bg: 'bg-blue-500', text: 'text-blue-500' },
  { id: 'green', name: 'Green', bg: 'bg-green-500', text: 'text-green-500' },
  { id: 'pink', name: 'Pink', bg: 'bg-pink-500', text: 'text-pink-500' },
  { id: 'orange', name: 'Orange', bg: 'bg-orange-500', text: 'text-orange-500' },
  { id: 'yellow', name: 'Yellow', bg: 'bg-yellow-500', text: 'text-yellow-500' },
  { id: 'black', name: 'Black', bg: 'bg-gray-800', text: 'text-gray-800' },
  { id: 'white', name: 'White', bg: 'bg-gray-100', text: 'text-gray-100' },
  { id: 'purple', name: 'Purple', bg: 'bg-purple-500', text: 'text-purple-500' },
  { id: 'cyan', name: 'Cyan', bg: 'bg-cyan-500', text: 'text-cyan-500' },
]

// Cooldown durations (in seconds)
const KILL_COOLDOWN = 5
const SABOTAGE_COOLDOWN = 15

// Local storage keys
const STORAGE_KEYS = {
  highScore: 'amongus_highscore',
  selectedColor: 'amongus_color',
}

// Target colors (for enemies)
const TARGET_COLORS = ['bg-yellow-500', 'bg-blue-500', 'bg-green-500', 'bg-pink-500', 'bg-purple-500', 'bg-orange-500']

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
      audio.volume = 0.3
      audio.play().catch(() => {})
    } catch (e) {
      // Audio failed, ignore
    }
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
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />

        {/* Character Color Selection */}
        <div className="mb-6">
          <p className="text-center text-slate-400 text-sm mb-2">Select Your Character</p>
          <div className="flex flex-wrap justify-center gap-2 max-w-xs">
            {CHARACTER_COLORS.map(color => (
              <button
                key={color.id}
                onClick={() => handleColorSelect(color)}
                className={`w-10 h-10 rounded-full ${color.bg} border-2 transition-all ${
                  selectedColor.id === color.id
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110'
                    : 'hover:scale-105'
                }`}
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
            👽 Character Move
          </button>
        </div>

        <p className="mt-6 text-slate-400 text-xs text-center max-w-xs">
          Keyboard: Arrow Keys / WASD to move • K for Kill<br/>
          Mobile: Touch and drag to move • Tap buttons for actions
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

// ============ MINI GAME ============
function MiniGame({
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
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem(STORAGE_KEYS.highScore) || '0')
    }
    return 0
  })
  const [targetPos, setTargetPos] = useState({ x: 200, y: 150 })
  const [targetColor, setTargetColor] = useState(TARGET_COLORS[0])
  const [showDeadBody, setShowDeadBody] = useState(false)
  const [deadBodyPos, setDeadBodyPos] = useState({ x: 0, y: 0 })
  const [isSabotage, setIsSabotage] = useState(false)
  const [legAnim, setLegAnim] = useState<'left' | 'right' | null>(null)

  // Cooldown states
  const [killCooldown, setKillCooldown] = useState(0)
  const [sabotageCooldown, setSabotageCooldown] = useState(0)

  const gameRef = useRef<HTMLDivElement>(null)
  const joystickRef = useRef<{ startX: number; startY: number; active: boolean }>({ startX: 0, startY: 0, active: false })
  const moveIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Save high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem(STORAGE_KEYS.highScore, score.toString())
    }
  }, [score, highScore])

  // Cooldown timers
  useEffect(() => {
    if (killCooldown <= 0) return
    const timer = setInterval(() => {
      setKillCooldown(c => Math.max(0, c - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [killCooldown > 0])

  useEffect(() => {
    if (sabotageCooldown <= 0) return
    const timer = setInterval(() => {
      setSabotageCooldown(c => Math.max(0, c - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [sabotageCooldown > 0])

  // Spawn target at random position
  const spawnTarget = useCallback(() => {
    const x = 100 + Math.random() * 300
    const y = 50 + Math.random() * 200
    setTargetPos({ x, y })
    setTargetColor(TARGET_COLORS[Math.floor(Math.random() * TARGET_COLORS.length)])
    setShowDeadBody(false)
  }, [])

  // Handle kill action
  const handleKill = useCallback(() => {
    if (killCooldown > 0) return

    playSound('kill')
    setShowDeadBody(true)
    setDeadBodyPos({ ...targetPos })
    setScore(s => s + 1)
    setKillCooldown(KILL_COOLDOWN)

    // Respawn after delay
    setTimeout(() => {
      spawnTarget()
    }, 3000)
  }, [killCooldown, targetPos, playSound, spawnTarget])

  // Handle sabotage action
  const handleSabotage = useCallback(() => {
    if (sabotageCooldown > 0 || isSabotage) return

    playSound('sabotage')
    setIsSabotage(true)
    setSabotageCooldown(SABOTAGE_COOLDOWN)

    // Flashing effect
    const timings = [0, 1700, 2700, 3700, 5000, 6000, 7000, 8000, 9000, 10000]
    timings.forEach((t, i) => {
      setTimeout(() => setIsSabotage(i % 2 === 0), t)
    })

    setTimeout(() => setIsSabotage(false), 11000)
  }, [sabotageCooldown, isSabotage, playSound])

  // Move character
  const moveCharacter = useCallback((dx: number, dy: number) => {
    const step = 10

    setLegAnim('left')
    setTimeout(() => setLegAnim('right'), 100)
    setTimeout(() => setLegAnim(null), 200)

    playSound('move')

    setPosition(p => ({ x: p.x + dx * step, y: p.y + dy * step }))
    if (dx < 0) setFacing('left')
    if (dx > 0) setFacing('right')
  }, [playSound])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          moveCharacter(-1, 0)
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          moveCharacter(1, 0)
          break
        case 'ArrowUp':
        case 'w':
        case 'W':
          moveCharacter(0, -1)
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          moveCharacter(0, 1)
          break
        case 'k':
        case 'K':
          handleKill()
          break
        case 'j':
        case 'J':
          handleSabotage()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [moveCharacter, handleKill, handleSabotage])

  // Touch controls - Virtual Joystick
  useEffect(() => {
    const gameArea = gameRef.current
    if (!gameArea) return

    let animationFrame: number

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

      if (distance > 20) {
        const normalizedDx = dx / distance
        const normalizedDy = dy / distance

        setPosition(p => {
          const newX = p.x + normalizedDx * 8
          const newY = p.y + normalizedDy * 8
          return { x: newX, y: newY }
        })

        if (dx < -10) setFacing('left')
        if (dx > 10) setFacing('right')

        // Leg animation
        setLegAnim(prev => prev === 'left' ? 'right' : 'left')

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
      if (animationFrame) cancelAnimationFrame(animationFrame)
    }
  }, [])

  // Initialize
  useEffect(() => {
    spawnTarget()
  }, [spawnTarget])

  const canKill = killCooldown === 0
  const canSabotage = sabotageCooldown === 0 && !isSabotage

  return (
    <div ref={gameRef} className="w-full h-full min-h-[600px] relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 select-none touch-none">
      {/* Back button */}
      <button
        onClick={goBack}
        className="absolute top-4 left-4 z-50 px-4 py-2 text-white bg-white/10 border border-white/30 rounded-full backdrop-blur-sm hover:bg-white/20 transition-all"
      >
        ← Back
      </button>

      {/* Score & High Score */}
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-1">
        <div className="px-4 py-2 text-white bg-black/50 rounded-lg font-bold">
          Score: {score}
        </div>
        <div className="px-3 py-1 text-yellow-400 bg-black/50 rounded-lg text-sm">
          🏆 Best: {highScore}
        </div>
      </div>

      {/* Sabotage overlay */}
      {isSabotage && (
        <div className="absolute inset-0 bg-red-500/40 pointer-events-none z-40 animate-pulse" />
      )}

      {/* Game area */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Target character */}
        {!showDeadBody && (
          <div
            className={`absolute transition-all duration-300 ${targetColor}`}
            style={{ left: targetPos.x, top: targetPos.y }}
          >
            <CharacterSVG color="currentColor" />
          </div>
        )}

        {/* Dead body */}
        {showDeadBody && (
          <div className="absolute text-6xl" style={{ left: deadBodyPos.x, top: deadBodyPos.y }}>
            💀
          </div>
        )}

        {/* Player character */}
        <div
          className={`absolute transition-all duration-75 ${selectedColor.bg}`}
          style={{
            left: `calc(50% + ${position.x}px)`,
            top: `calc(50% + ${position.y}px)`,
            transform: facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)'
          }}
        >
          <CharacterSVG color="currentColor" legAnim={legAnim} showHand />
        </div>
      </div>

      {/* Action buttons with cooldown */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-4 z-50">
        <button
          onClick={handleKill}
          disabled={!canKill}
          className={`relative px-8 py-4 text-white rounded-lg font-bold shadow-lg transition-all ${
            canKill
              ? 'bg-red-600 hover:bg-red-500 active:scale-95'
              : 'bg-gray-600 cursor-not-allowed opacity-70'
          }`}
        >
          🔪 Kill
          {killCooldown > 0 && (
            <span className="absolute -top-2 -right-2 w-8 h-8 bg-black/80 rounded-full flex items-center justify-center text-sm">
              {killCooldown}
            </span>
          )}
        </button>
        <button
          onClick={handleSabotage}
          disabled={!canSabotage}
          className={`relative px-8 py-4 text-white rounded-lg font-bold shadow-lg transition-all ${
            canSabotage
              ? 'bg-orange-600 hover:bg-orange-500 active:scale-95'
              : 'bg-gray-600 cursor-not-allowed opacity-70'
          }`}
        >
          ⚡ Sabotage
          {sabotageCooldown > 0 && (
            <span className="absolute -top-2 -right-2 w-8 h-8 bg-black/80 rounded-full flex items-center justify-center text-sm">
              {sabotageCooldown}
            </span>
          )}
        </button>
      </div>

      {/* Mobile instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-slate-400 text-xs text-center z-50">
        Touch & drag to move • K / J keys for actions
      </div>

      {/* Virtual joystick indicator (mobile) */}
      <div className="md:hidden absolute bottom-32 left-4 w-16 h-16 border-2 border-white/30 rounded-full flex items-center justify-center">
        <div className="w-8 h-8 bg-white/30 rounded-full" />
      </div>
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
  const joystickRef = useRef<{ startX: number; startY: number; active: boolean }>({ startX: 0, startY: 0, active: false })

  // Move character
  const moveCharacter = useCallback((dx: number, dy: number) => {
    const step = 12

    setLegAnim('left')
    setTimeout(() => setLegAnim('right'), 100)
    setTimeout(() => setLegAnim(null), 200)

    playSound('move')

    setPosition(p => ({ x: p.x + dx * step, y: p.y + dy * step }))
    if (dx < 0) setFacing('left')
    if (dx > 0) setFacing('right')
  }, [playSound])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          moveCharacter(-1, 0)
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          moveCharacter(1, 0)
          break
        case 'ArrowUp':
        case 'w':
        case 'W':
          moveCharacter(0, -1)
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          moveCharacter(0, 1)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [moveCharacter])

  // Touch controls
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

      if (distance > 20) {
        const normalizedDx = dx / distance
        const normalizedDy = dy / distance

        setPosition(p => ({
          x: p.x + normalizedDx * 10,
          y: p.y + normalizedDy * 10
        }))

        if (dx < -10) setFacing('left')
        if (dx > 10) setFacing('right')

        setLegAnim(prev => prev === 'left' ? 'right' : 'left')

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
  }, [])

  const bgColor = theme === 'dark'
    ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
    : 'bg-gradient-to-br from-slate-100 via-white to-slate-100'
  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-800'

  return (
    <div ref={gameRef} className={`w-full h-full min-h-[600px] relative overflow-hidden ${bgColor} transition-colors duration-300 select-none touch-none`}>
      {/* Back button */}
      <button
        onClick={goBack}
        className={`absolute top-4 left-4 z-50 px-4 py-2 ${textColor} ${theme === 'dark' ? 'bg-white/10 border-white/30' : 'bg-black/10 border-black/30'} border rounded-full backdrop-blur-sm hover:bg-white/20 transition-all`}
      >
        ← Back
      </button>

      {/* Game area */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Player character */}
        <div
          className={`absolute transition-all duration-75 ${selectedColor.bg}`}
          style={{
            left: `calc(50% + ${position.x}px)`,
            top: `calc(50% + ${position.y}px)`,
            transform: facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)'
          }}
        >
          <CharacterSVG color="currentColor" legAnim={legAnim} showHand />
        </div>
      </div>

      {/* Instructions */}
      <div className={`absolute top-20 left-1/2 -translate-x-1/2 ${textColor} text-lg text-center`}>
        Use Arrow Keys (⬆️⬇️⬅️➡️) or WASD to move!
      </div>

      {/* Current color indicator */}
      <div className={`absolute top-20 right-4 ${textColor} text-sm`}>
        Color: <span className={`px-2 py-1 rounded ${selectedColor.bg}`}>{selectedColor.name}</span>
      </div>

      {/* Warning */}
      <div className={`absolute bottom-24 left-1/2 -translate-x-1/2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} text-sm text-center`}>
        You will get stuck by blackhole if you go beyond the limit! 😜
      </div>

      {/* Theme buttons */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-50">
        <button
          onClick={() => setTheme('light')}
          className={`px-6 py-3 rounded-lg font-bold transition-all ${
            theme === 'light'
              ? 'bg-white text-black ring-2 ring-black'
              : 'bg-gray-200 text-gray-700 hover:bg-white'
          }`}
        >
          ☀️ Light
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`px-6 py-3 rounded-lg font-bold transition-all ${
            theme === 'dark'
              ? 'bg-slate-800 text-white ring-2 ring-white'
              : 'bg-slate-700 text-gray-200 hover:bg-slate-800'
          }`}
        >
          🌙 Dark
        </button>
      </div>

      {/* Virtual joystick indicator (mobile) */}
      <div className="md:hidden absolute bottom-32 left-4 w-16 h-16 border-2 border-white/30 rounded-full flex items-center justify-center">
        <div className="w-8 h-8 bg-white/30 rounded-full" />
      </div>
    </div>
  )
}

// ============ CHARACTER SVG COMPONENT ============
function CharacterSVG({
  color = 'currentColor',
  legAnim,
  showHand = false
}: {
  color?: string
  legAnim?: 'left' | 'right' | null
  showHand?: boolean
}) {
  return (
    <div className="relative">
      {/* Hand */}
      {showHand && (
        <div className="absolute -left-3 top-10 w-5 h-8 rounded-full" style={{ backgroundColor: color === 'currentColor' ? undefined : color }} />
      )}
      {/* Body */}
      <div className="w-20 h-28 rounded-3xl shadow-lg relative" style={{ backgroundColor: color === 'currentColor' ? undefined : color }}>
        {/* Visor */}
        <div className="absolute top-3 right-1 w-9 h-7 bg-cyan-200 rounded-full shadow-inner" />
        <div className="absolute top-3 right-10 w-3 h-7 bg-cyan-200 rounded-l-full shadow-inner" />
      </div>
      {/* Legs */}
      <div
        className={`absolute bottom-0 left-1 w-7 h-10 rounded-b-xl origin-top transition-transform duration-100 ${legAnim === 'left' ? 'rotate-[-15deg]' : ''}`}
        style={{ backgroundColor: color === 'currentColor' ? undefined : color }}
      />
      <div
        className={`absolute bottom-0 right-1 w-7 h-10 rounded-b-xl origin-top transition-transform duration-100 ${legAnim === 'right' ? 'rotate-[15deg]' : ''}`}
        style={{ backgroundColor: color === 'currentColor' ? undefined : color }}
      />
    </div>
  )
}
