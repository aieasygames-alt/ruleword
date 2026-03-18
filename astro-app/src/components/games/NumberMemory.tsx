import { useState, useCallback, useEffect, useRef } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type NumberMemoryProps = {
  settings: Settings
  onBack: () => void
  toggleLanguage: () => void
  toggleTheme: () => void
  toggleSound: () => void
}

type GameState = 'idle' | 'showing' | 'input' | 'correct' | 'wrong'

export default function NumberMemory({ settings, onBack }: NumberMemoryProps) {
  const [gameState, setGameState] = useState<GameState>('idle')
  const [level, setLevel] = useState(1)
  const [currentNumber, setCurrentNumber] = useState('')
  const [userInput, setUserInput] = useState('')
  const [highScore, setHighScore] = useState(0)
  const [showTime, setShowTime] = useState(0)
  const [attempts, setAttempts] = useState(3)
  const [totalAttempts, setTotalAttempts] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const isDark = settings.darkMode

  const bgClass = isDark ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = isDark ? 'text-white' : 'text-gray-900'

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('numberMemory_highScore')
    if (saved) setHighScore(parseInt(saved) || 0)
  }, [])

  // Save high score
  useEffect(() => {
    if (level > highScore) {
      setHighScore(level)
      localStorage.setItem('numberMemory_highScore', level.toString())
    }
  }, [level, highScore])

  // Focus input when in input state
  useEffect(() => {
    if (gameState === 'input' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [gameState])

  // Generate random number with specified digits
  const generateNumber = useCallback((digits: number) => {
    let num = ''
    for (let i = 0; i < digits; i++) {
      // First digit shouldn't be 0
      if (i === 0) {
        num += Math.floor(Math.random() * 9 + 1).toString()
      } else {
        num += Math.floor(Math.random() * 10).toString()
      }
    }
    return num
  }, [])

  // Calculate show time based on level
  const getShowTime = useCallback((lvl: number) => {
    // Start with 2 seconds, add 0.5 seconds per level
    return Math.max(1000, 2000 + (lvl - 3) * 500)
  }, [])

  const startGame = useCallback(() => {
    const number = generateNumber(level)
    setCurrentNumber(number)
    setUserInput('')
    setGameState('showing')
    setShowTime(getShowTime(level))
    setTotalAttempts(prev => prev + 1)
  }, [level, generateNumber, getShowTime])

  // Handle showing state timing
  useEffect(() => {
    if (gameState === 'showing') {
      timerRef.current = setTimeout(() => {
        setGameState('input')
      }, showTime)
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current)
      }
    }
  }, [gameState, showTime])

  const handleSubmit = () => {
    if (userInput === currentNumber) {
      setGameState('correct')
      setAttempts(3) // Reset attempts on success
      // Auto advance after 1 second
      setTimeout(() => {
        setLevel(prev => prev + 1)
        startGame()
      }, 1500)
    } else {
      setGameState('wrong')
      const newAttempts = attempts - 1
      setAttempts(newAttempts)

      if (newAttempts <= 0) {
        // Game over
        setTimeout(() => {
          setGameState('idle')
          setLevel(1)
          setAttempts(3)
        }, 2000)
      } else {
        // Try again
        setTimeout(() => {
          setUserInput('')
          setGameState('input')
        }, 1500)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && gameState === 'input') {
      handleSubmit()
    }
  }

  const getLevelLabel = (lvl: number) => {
    if (lvl <= 3) return 'Easy'
    if (lvl <= 6) return 'Medium'
    if (lvl <= 9) return 'Hard'
    if (lvl <= 12) return 'Expert'
    return 'Master'
  }

  const getLevelColor = (lvl: number) => {
    if (lvl <= 3) return 'text-green-400'
    if (lvl <= 6) return 'text-yellow-400'
    if (lvl <= 9) return 'text-orange-400'
    if (lvl <= 12) return 'text-red-400'
    return 'text-purple-400'
  }

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
              <div className="text-xs text-slate-400">Level</div>
              <div className={`text-lg font-bold ${getLevelColor(level)}`}>
                {level} <span className="text-xs">({getLevelLabel(level)})</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400">High Score</div>
              <div className="text-lg font-bold text-yellow-400">{highScore}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400">Attempts</div>
              <div className="text-lg font-bold text-blue-400">{attempts}/3</div>
            </div>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-8">
        {/* Game Area */}
        <div className="w-full max-w-md">
          {gameState === 'idle' && (
            <div className="text-center space-y-6">
              <div className="text-6xl mb-4">🧠</div>
              <h1 className="text-3xl font-bold">Number Memory</h1>
              <p className="text-slate-400 max-w-sm mx-auto">
                Memorize the number shown on screen, then type it back. Each level adds one more digit!
              </p>
              <button
                onClick={startGame}
                className="px-8 py-3 rounded-xl bg-green-600 hover:bg-green-500 transition-colors font-bold text-lg"
              >
                Start Game
              </button>
              {highScore > 0 && (
                <p className="text-slate-400 text-sm">
                  Your best: Level {highScore} ({highScore} digits)
                </p>
              )}
            </div>
          )}

          {gameState === 'showing' && (
            <div className="text-center space-y-6">
              <p className="text-slate-400">Memorize this number:</p>
              <div className="bg-slate-800 rounded-2xl p-8 shadow-xl">
                <div className="text-4xl sm:text-5xl font-mono font-bold tracking-widest text-green-400">
                  {currentNumber.split('').map((digit, i) => (
                    <span key={i} className="inline-block mx-0.5">{digit}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-slate-400 text-sm">Memorizing...</span>
              </div>
            </div>
          )}

          {gameState === 'input' && (
            <div className="text-center space-y-6">
              <p className="text-slate-400">Enter the number ({currentNumber.length} digits):</p>
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value.replace(/\D/g, ''))}
                onKeyDown={handleKeyDown}
                placeholder="Type the number..."
                className="w-full bg-slate-800 border-2 border-slate-600 rounded-xl px-6 py-4 text-3xl font-mono text-center focus:border-green-500 focus:outline-none transition-colors"
                maxLength={currentNumber.length}
                autoFocus
              />
              <button
                onClick={handleSubmit}
                disabled={userInput.length !== currentNumber.length}
                className="px-8 py-3 rounded-xl bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors font-bold text-lg"
              >
                Submit
              </button>
            </div>
          )}

          {gameState === 'correct' && (
            <div className="text-center space-y-6">
              <div className="text-6xl">✅</div>
              <h2 className="text-2xl font-bold text-green-400">Correct!</h2>
              <p className="text-slate-400">Advancing to Level {level + 1}...</p>
            </div>
          )}

          {gameState === 'wrong' && (
            <div className="text-center space-y-6">
              <div className="text-6xl">❌</div>
              <h2 className="text-2xl font-bold text-red-400">Wrong!</h2>
              <div className="bg-slate-800 rounded-xl p-4">
                <p className="text-slate-400 text-sm">The number was:</p>
                <p className="text-2xl font-mono font-bold text-yellow-400">{currentNumber}</p>
              </div>
              <p className="text-slate-400">
                {attempts > 0
                  ? `${attempts} attempt${attempts > 1 ? 's' : ''} remaining`
                  : 'Game Over! Starting over...'}
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
        {totalAttempts > 0 && (
          <div className="text-center text-sm text-slate-500">
            Total attempts: {totalAttempts}
          </div>
        )}

        {/* Instructions */}
        <div className="text-sm text-slate-400 text-center max-w-md space-y-2">
          <p>💡 Tip: Try to chunk the numbers into groups of 2-3 digits</p>
          <p>For example: 3847291 → 384-729-1</p>
        </div>
      </main>
    </div>
  )
}
