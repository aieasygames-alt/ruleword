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

// Character colors
const COLORS = ['bg-yellow-500', 'bg-blue-500', 'bg-green-500', 'bg-pink-500', 'bg-purple-500', 'bg-orange-500']

export default function AmongUs({ settings }: AmongUsProps) {
  const [gameMode, setGameMode] = useState<'menu' | 'mini' | 'move'>('menu')
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

  // Menu Screen
  if (gameMode === 'menu') {
    return (
      <div className="w-full h-full min-h-[600px] flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
        <h1 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-500 drop-shadow-lg">
          Among Us
        </h1>

        <img
          src="/games/amongus/assets/Image/banner.png"
          alt="Among Us"
          className="max-w-sm w-full mb-8 drop-shadow-2xl"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />

        <div className="flex flex-col gap-4">
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

        <p className="mt-8 text-slate-400 text-sm text-center max-w-xs">
          Use <span className="text-white font-mono">Arrow Keys</span> or <span className="text-white font-mono">WASD</span> to move<br/>
          Press <span className="text-white font-mono">K</span> for Kill, <span className="text-white font-mono">S</span> for Sabotage
        </p>
      </div>
    )
  }

  // Mini Game Mode
  if (gameMode === 'mini') {
    return <MiniGame goBack={goBack} playSound={playSound} />
  }

  // Character Move Mode
  return <CharacterMove goBack={goBack} playSound={playSound} />
}

// ============ MINI GAME ============
function MiniGame({ goBack, playSound }: { goBack: () => void; playSound: (type: 'move' | 'kill' | 'sabotage') => void }) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [facing, setFacing] = useState<'left' | 'right'>('right')
  const [score, setScore] = useState(0)
  const [targetPos, setTargetPos] = useState({ x: 200, y: 150 })
  const [targetColor, setTargetColor] = useState(COLORS[0])
  const [showDeadBody, setShowDeadBody] = useState(false)
  const [deadBodyPos, setDeadBodyPos] = useState({ x: 0, y: 0 })
  const [isSabotage, setIsSabotage] = useState(false)
  const [canKill, setCanKill] = useState(true)
  const [legAnim, setLegAnim] = useState<'left' | 'right' | null>(null)

  const gameRef = useRef<HTMLDivElement>(null)

  // Spawn target at random position
  const spawnTarget = useCallback(() => {
    const x = 100 + Math.random() * 300
    const y = 50 + Math.random() * 200
    setTargetPos({ x, y })
    setTargetColor(COLORS[Math.floor(Math.random() * COLORS.length)])
    setShowDeadBody(false)
    setCanKill(true)
  }, [])

  // Handle kill action
  const handleKill = useCallback(() => {
    if (!canKill) return

    playSound('kill')
    setCanKill(false)
    setShowDeadBody(true)
    setDeadBodyPos({ ...targetPos })
    setScore(s => s + 1)

    // Respawn after delay
    setTimeout(() => {
      spawnTarget()
    }, 3000)
  }, [canKill, targetPos, playSound, spawnTarget])

  // Handle sabotage action
  const handleSabotage = useCallback(() => {
    if (isSabotage) return

    playSound('sabotage')
    setIsSabotage(true)

    // Flashing effect
    const timings = [0, 1700, 2700, 3700, 5000, 6000, 7000, 8000, 9000, 10000]
    timings.forEach((t, i) => {
      setTimeout(() => setIsSabotage(i % 2 === 0), t)
    })

    setTimeout(() => setIsSabotage(false), 11000)
  }, [isSabotage, playSound])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const step = 15

      // Animate legs
      setLegAnim('left')
      setTimeout(() => setLegAnim('right'), 100)
      setTimeout(() => setLegAnim(null), 200)

      playSound('move')

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          setPosition(p => ({ ...p, x: p.x - step }))
          setFacing('left')
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          setPosition(p => ({ ...p, x: p.x + step }))
          setFacing('right')
          break
        case 'ArrowUp':
        case 'w':
        case 'W':
          setPosition(p => ({ ...p, y: p.y - step }))
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          setPosition(p => ({ ...p, y: p.y + step }))
          break
        case 'k':
        case 'K':
          handleKill()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [playSound, handleKill])

  // Initialize
  useEffect(() => {
    spawnTarget()
  }, [spawnTarget])

  return (
    <div ref={gameRef} className="w-full h-full min-h-[600px] relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Back button */}
      <button
        onClick={goBack}
        className="absolute top-4 left-4 z-50 px-4 py-2 text-white bg-white/10 border border-white/30 rounded-full backdrop-blur-sm hover:bg-white/20 transition-all"
      >
        ← Back
      </button>

      {/* Score */}
      <div className="absolute top-4 right-4 z-50 px-4 py-2 text-white bg-black/50 rounded-lg font-bold">
        Score: {score}
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
            <div className="relative">
              <div className="w-20 h-28 rounded-3xl shadow-lg">
                <div className="absolute top-3 right-1 w-9 h-7 bg-cyan-200 rounded-full shadow-inner" />
                <div className="absolute top-3 right-10 w-3 h-7 bg-cyan-200 rounded-l-full shadow-inner" />
              </div>
              <div className="absolute bottom-0 left-1 w-7 h-10 rounded-b-xl" />
              <div className="absolute bottom-0 right-1 w-7 h-10 rounded-b-xl" />
            </div>
          </div>
        )}

        {/* Dead body */}
        {showDeadBody && (
          <img
            src="/games/amongus/assets/Image/dead.png"
            alt="Dead body"
            className="absolute w-32 h-32"
            style={{ left: deadBodyPos.x, top: deadBodyPos.y }}
            onError={(e) => {
              // Fallback: show a bone emoji
              e.currentTarget.outerHTML = '<div class="absolute text-6xl" style="left: ' + deadBodyPos.x + 'px; top: ' + deadBodyPos.y + 'px">💀</div>'
            }}
          />
        )}

        {/* Player character */}
        <div
          className="absolute transition-all duration-75"
          style={{
            left: `calc(50% + ${position.x}px)`,
            top: `calc(50% + ${position.y}px)`,
            transform: facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)'
          }}
        >
          <div className="relative">
            {/* Hand */}
            <div className="absolute -left-3 top-10 w-5 h-8 bg-red-500 rounded-full" />
            {/* Body */}
            <div className="w-24 h-32 bg-red-500 rounded-3xl shadow-lg relative">
              {/* Visor */}
              <div className="absolute top-4 right-2 w-10 h-8 bg-cyan-200 rounded-full shadow-inner" />
              <div className="absolute top-4 right-12 w-4 h-8 bg-cyan-200 rounded-l-full shadow-inner" />
            </div>
            {/* Legs */}
            <div
              className={`absolute bottom-0 left-2 w-8 h-12 bg-red-500 rounded-b-xl origin-top transition-transform ${legAnim === 'left' ? 'rotate-[-15deg]' : ''}`}
            />
            <div
              className={`absolute bottom-0 right-2 w-8 h-12 bg-red-500 rounded-b-xl origin-top transition-transform ${legAnim === 'right' ? 'rotate-[15deg]' : ''}`}
            />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-50">
        <button
          onClick={handleKill}
          disabled={!canKill}
          className={`px-8 py-4 text-white rounded-lg font-bold shadow-lg transition-all ${
            canKill
              ? 'bg-red-600 hover:bg-red-500 active:scale-95'
              : 'bg-gray-600 cursor-not-allowed opacity-50'
          }`}
        >
          🔪 Kill
        </button>
        <button
          onClick={handleSabotage}
          disabled={isSabotage}
          className={`px-8 py-4 text-white rounded-lg font-bold shadow-lg transition-all ${
            !isSabotage
              ? 'bg-orange-600 hover:bg-orange-500 active:scale-95'
              : 'bg-gray-600 cursor-not-allowed opacity-50'
          }`}
        >
          ⚡ Sabotage
        </button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-slate-400 text-sm text-center z-50">
        Arrow Keys / WASD to move • K to Kill
      </div>
    </div>
  )
}

// ============ CHARACTER MOVE ============
function CharacterMove({ goBack, playSound }: { goBack: () => void; playSound: (type: 'move' | 'kill' | 'sabotage') => void }) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [facing, setFacing] = useState<'left' | 'right'>('right')
  const [legAnim, setLegAnim] = useState<'left' | 'right' | null>(null)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const step = 12

      // Animate legs
      setLegAnim('left')
      setTimeout(() => setLegAnim('right'), 100)
      setTimeout(() => setLegAnim(null), 200)

      playSound('move')

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          setPosition(p => ({ ...p, x: p.x - step }))
          setFacing('left')
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          setPosition(p => ({ ...p, x: p.x + step }))
          setFacing('right')
          break
        case 'ArrowUp':
        case 'w':
        case 'W':
          setPosition(p => ({ ...p, y: p.y - step }))
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          setPosition(p => ({ ...p, y: p.y + step }))
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [playSound])

  const bgColor = theme === 'dark'
    ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
    : 'bg-gradient-to-br from-slate-100 via-white to-slate-100'
  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-800'

  return (
    <div className={`w-full h-full min-h-[600px] relative overflow-hidden ${bgColor} transition-colors duration-300`}>
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
          className="absolute transition-all duration-75"
          style={{
            left: `calc(50% + ${position.x}px)`,
            top: `calc(50% + ${position.y}px)`,
            transform: facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)'
          }}
        >
          <div className="relative">
            {/* Hand */}
            <div className="absolute -left-3 top-10 w-5 h-8 bg-red-500 rounded-full" />
            {/* Body */}
            <div className="w-24 h-32 bg-red-500 rounded-3xl shadow-lg relative">
              {/* Visor */}
              <div className="absolute top-4 right-2 w-10 h-8 bg-cyan-200 rounded-full shadow-inner" />
              <div className="absolute top-4 right-12 w-4 h-8 bg-cyan-200 rounded-l-full shadow-inner" />
            </div>
            {/* Legs */}
            <div
              className={`absolute bottom-0 left-2 w-8 h-12 bg-red-500 rounded-b-xl origin-top transition-transform duration-100 ${legAnim === 'left' ? 'rotate-[-20deg]' : ''}`}
            />
            <div
              className={`absolute bottom-0 right-2 w-8 h-12 bg-red-500 rounded-b-xl origin-top transition-transform duration-100 ${legAnim === 'right' ? 'rotate-[20deg]' : ''}`}
            />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className={`absolute top-20 left-1/2 -translate-x-1/2 ${textColor} text-lg text-center`}>
        Use Arrow Keys (⬆️⬇️⬅️➡️) or WASD to move!
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
    </div>
  )
}
