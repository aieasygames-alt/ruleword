import { useState, useCallback, useEffect, useRef } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type SimonGameProps = {
  settings: Settings
  onBack: () => void
  toggleLanguage: () => void
  toggleTheme: () => void
  toggleSound: () => void
}

type ColorType = 'red' | 'green' | 'blue' | 'yellow'

const COLORS: ColorType[] = ['red', 'green', 'blue', 'yellow']

const COLOR_STYLES: Record<ColorType, { base: string; active: string; glow: string }> = {
  red: { base: 'bg-red-700', active: 'bg-red-400', glow: 'shadow-red-500/50' },
  green: { base: 'bg-green-700', active: 'bg-green-400', glow: 'shadow-green-500/50' },
  blue: { base: 'bg-blue-700', active: 'bg-blue-400', glow: 'shadow-blue-500/50' },
  yellow: { base: 'bg-yellow-600', active: 'bg-yellow-300', glow: 'shadow-yellow-500/50' },
}

export default function SimonGame({ settings, onBack }: SimonGameProps) {
  const [sequence, setSequence] = useState<ColorType[]>([])
  const [playerIndex, setPlayerIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isShowingSequence, setIsShowingSequence] = useState(false)
  const [activeColor, setActiveColor] = useState<ColorType | null>(null)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [canStart, setCanStart] = useState(true)

  const audioContext = useRef<AudioContext | null>(null)

  const isDark = settings.darkMode
  const bgClass = isDark ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = isDark ? 'text-white' : 'text-gray-900'

  // Frequencies for each color
  const FREQUENCIES: Record<ColorType, number> = {
    red: 329.63,    // E4
    green: 392.00,  // G4
    blue: 261.63,   // C4
    yellow: 220.00, // A3
  }

  const playSound = useCallback((color: ColorType) => {
    if (!settings.soundEnabled) return

    try {
      if (!audioContext.current) {
        audioContext.current = new AudioContext()
      }

      const ctx = audioContext.current
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.value = FREQUENCIES[color]
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.3)
    } catch (e) {
      // Audio not supported
    }
  }, [settings.soundEnabled])

  const playErrorSound = useCallback(() => {
    if (!settings.soundEnabled) return

    try {
      if (!audioContext.current) {
        audioContext.current = new AudioContext()
      }

      const ctx = audioContext.current
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.value = 100
      oscillator.type = 'square'

      gainNode.gain.setValueAtTime(0.2, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.5)
    } catch (e) {
      // Audio not supported
    }
  }, [settings.soundEnabled])

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('simonGame_highScore')
    if (saved) setHighScore(parseInt(saved) || 0)
  }, [])

  // Save high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('simonGame_highScore', score.toString())
    }
  }, [score, highScore])

  // Show sequence to player
  const showSequence = useCallback(async (seq: ColorType[]) => {
    setIsShowingSequence(true)
    setCanStart(false)

    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600))

      const color = seq[i]
      setActiveColor(color)
      playSound(color)

      await new Promise(resolve => setTimeout(resolve, 400))
      setActiveColor(null)
    }

    setIsShowingSequence(false)
  }, [playSound])

  // Start new round
  const startRound = useCallback(() => {
    const newColor = COLORS[Math.floor(Math.random() * COLORS.length)]
    const newSequence = [...sequence, newColor]

    setSequence(newSequence)
    setPlayerIndex(0)
    setGameOver(false)

    showSequence(newSequence)
  }, [sequence, showSequence])

  // Start new game
  const startGame = useCallback(() => {
    setSequence([])
    setScore(0)
    setPlayerIndex(0)
    setGameOver(false)
    setIsPlaying(true)
    setCanStart(false)

    setTimeout(() => {
      const newColor = COLORS[Math.floor(Math.random() * COLORS.length)]
      setSequence([newColor])
      showSequence([newColor])
    }, 500)
  }, [showSequence])

  // Handle player click
  const handleColorClick = useCallback((color: ColorType) => {
    if (isShowingSequence || gameOver || !isPlaying) return

    setActiveColor(color)
    playSound(color)

    setTimeout(() => setActiveColor(null), 200)

    if (color === sequence[playerIndex]) {
      // Correct!
      const newIndex = playerIndex + 1

      if (newIndex === sequence.length) {
        // Completed the sequence
        setScore(prev => prev + 1)
        setPlayerIndex(0)

        // Start next round after a short delay
        setTimeout(() => {
          startRound()
        }, 1000)
      } else {
        setPlayerIndex(newIndex)
      }
    } else {
      // Wrong!
      playErrorSound()
      setGameOver(true)
      setIsPlaying(false)
      setCanStart(true)
    }
  }, [isShowingSequence, gameOver, isPlaying, sequence, playerIndex, playSound, playErrorSound, startRound])

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} flex flex-col`}>
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
              <div className="text-lg font-bold text-green-400">{score}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400">Best</div>
              <div className="text-lg font-bold text-yellow-400">{highScore}</div>
            </div>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        {/* Status */}
        <div className="text-center">
          {gameOver ? (
            <div className="text-red-400 font-bold text-xl">Game Over!</div>
          ) : isShowingSequence ? (
            <div className="text-blue-400 font-bold text-xl">Watch the sequence...</div>
          ) : isPlaying ? (
            <div className="text-green-400 font-bold text-xl">Your turn! ({playerIndex + 1}/{sequence.length})</div>
          ) : (
            <div className="text-slate-400">Press Start to play</div>
          )}
        </div>

        {/* Game Board */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80">
          {COLORS.map((color, idx) => {
            const style = COLOR_STYLES[color]
            const isActive = activeColor === color
            const position = idx === 0 ? 'top-0 left-0' :
                            idx === 1 ? 'top-0 right-0' :
                            idx === 2 ? 'bottom-0 left-0' :
                            'bottom-0 right-0'
            const rounded = idx === 0 ? 'rounded-tl-3xl' :
                           idx === 1 ? 'rounded-tr-3xl' :
                           idx === 2 ? 'rounded-bl-3xl' :
                           'rounded-br-3xl'

            return (
              <button
                key={color}
                onClick={() => handleColorClick(color)}
                disabled={isShowingSequence || gameOver || !isPlaying}
                className={`
                  absolute w-32 h-32 sm:w-36 sm:h-36 ${position} ${rounded}
                  transition-all duration-150
                  ${isActive ? style.active + ' shadow-xl ' + style.glow : style.base}
                  ${!isShowingSequence && !gameOver && isPlaying ? 'hover:brightness-125 cursor-pointer' : ''}
                  disabled:cursor-not-allowed
                `}
              />
            )
          })}

          {/* Center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center shadow-lg border-4 border-slate-800">
            <span className="text-2xl">🎮</span>
          </div>
        </div>

        {/* Start Button */}
        {!isPlaying && (
          <button
            onClick={startGame}
            disabled={!canStart}
            className="px-8 py-3 rounded-xl bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors font-bold text-lg"
          >
            {gameOver ? 'Play Again' : 'Start'}
          </button>
        )}

        {/* Instructions */}
        <div className="text-sm text-slate-400 text-center max-w-md">
          <p>Watch the color sequence, then repeat it by clicking the colors in the same order!</p>
        </div>
      </main>
    </div>
  )
}
