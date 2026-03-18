import { useState, useCallback, useEffect, useRef } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type ReactionTestProps = {
  settings: Settings
  onBack: () => void
  toggleLanguage: () => void
  toggleTheme: () => void
  toggleSound: () => void
}

type GameState = 'idle' | 'waiting' | 'ready' | 'result' | 'tooEarly'

export default function ReactionTest({ settings, onBack }: ReactionTestProps) {
  const [gameState, setGameState] = useState<GameState>('idle')
  const [reactionTime, setReactionTime] = useState(0)
  const [bestTime, setBestTime] = useState<number | null>(null)
  const [attempts, setAttempts] = useState<number[]>([])
  const [startTime, setStartTime] = useState(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const isDark = settings.darkMode
  const bgClass = isDark ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = isDark ? 'text-white' : 'text-gray-900'

  // Load best time
  useEffect(() => {
    const saved = localStorage.getItem('reactionTest_bestTime')
    if (saved) setBestTime(parseFloat(saved))
  }, [])

  // Save best time
  useEffect(() => {
    if (bestTime !== null) {
      localStorage.setItem('reactionTest_bestTime', bestTime.toString())
    }
  }, [bestTime])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const startGame = useCallback(() => {
    setGameState('waiting')
    setReactionTime(0)

    // Random delay between 2-5 seconds
    const delay = 2000 + Math.random() * 3000

    timeoutRef.current = setTimeout(() => {
      setGameState('ready')
      setStartTime(Date.now())
    }, delay)
  }, [])

  const handleClick = useCallback(() => {
    if (gameState === 'waiting') {
      // Clicked too early
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      setGameState('tooEarly')
    } else if (gameState === 'ready') {
      // Calculate reaction time
      const time = Date.now() - startTime
      setReactionTime(time)
      setGameState('result')

      // Update attempts
      const newAttempts = [...attempts, time].slice(-5)
      setAttempts(newAttempts)

      // Update best time
      if (bestTime === null || time < bestTime) {
        setBestTime(time)
      }
    }
  }, [gameState, startTime, attempts, bestTime])

  const getAverageTime = () => {
    if (attempts.length === 0) return null
    return Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length)
  }

  const getRating = () => {
    if (reactionTime < 150) return { emoji: '🚀', text: 'Incredible!', color: 'text-purple-400' }
    if (reactionTime < 200) return { emoji: '⚡', text: 'Excellent!', color: 'text-green-400' }
    if (reactionTime < 250) return { emoji: '🔥', text: 'Great!', color: 'text-blue-400' }
    if (reactionTime < 300) return { emoji: '👍', text: 'Good', color: 'text-yellow-400' }
    if (reactionTime < 400) return { emoji: '🙂', text: 'Average', color: 'text-orange-400' }
    return { emoji: '🐢', text: 'Keep practicing', color: 'text-slate-400' }
  }

  const rating = reactionTime > 0 ? getRating() : null

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
              <div className="text-xs text-slate-400">Best</div>
              <div className="text-lg font-bold text-yellow-400">
                {bestTime ? `${bestTime}ms` : '-'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400">Avg (5)</div>
              <div className="text-lg font-bold text-blue-400">
                {getAverageTime() ? `${getAverageTime()}ms` : '-'}
              </div>
            </div>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Game Area */}
        <div
          onClick={gameState === 'waiting' || gameState === 'ready' ? handleClick : undefined}
          className={`
            w-full max-w-md aspect-square rounded-2xl flex flex-col items-center justify-center
            transition-all duration-300 cursor-pointer select-none
            ${gameState === 'idle' ? 'bg-slate-700 hover:bg-slate-600' : ''}
            ${gameState === 'waiting' ? 'bg-red-600' : ''}
            ${gameState === 'ready' ? 'bg-green-500' : ''}
            ${gameState === 'result' ? 'bg-slate-700' : ''}
            ${gameState === 'tooEarly' ? 'bg-orange-600' : ''}
          `}
        >
          {gameState === 'idle' && (
            <div className="text-center space-y-4">
              <div className="text-6xl">⚡</div>
              <h1 className="text-2xl font-bold">Reaction Test</h1>
              <p className="text-slate-300 text-sm max-w-xs mx-auto">
                Click as fast as you can when the screen turns green!
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); startGame(); }}
                className="px-8 py-3 rounded-xl bg-green-600 hover:bg-green-500 transition-colors font-bold text-lg"
              >
                Start
              </button>
            </div>
          )}

          {gameState === 'waiting' && (
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">Wait...</div>
              <p className="text-red-200">Click when it turns green</p>
            </div>
          )}

          {gameState === 'ready' && (
            <div className="text-center">
              <div className="text-5xl font-bold">CLICK!</div>
            </div>
          )}

          {gameState === 'tooEarly' && (
            <div className="text-center space-y-4">
              <div className="text-6xl">😅</div>
              <div className="text-2xl font-bold">Too Early!</div>
              <p className="text-orange-200">Wait for green before clicking</p>
              <button
                onClick={(e) => { e.stopPropagation(); startGame(); }}
                className="px-8 py-3 rounded-xl bg-green-600 hover:bg-green-500 transition-colors font-bold"
              >
                Try Again
              </button>
            </div>
          )}

          {gameState === 'result' && rating && (
            <div className="text-center space-y-4">
              <div className="text-6xl">{rating.emoji}</div>
              <div className="text-5xl font-bold">{reactionTime}ms</div>
              <div className={`text-xl font-bold ${rating.color}`}>{rating.text}</div>
              <button
                onClick={(e) => { e.stopPropagation(); startGame(); }}
                className="px-8 py-3 rounded-xl bg-green-600 hover:bg-green-500 transition-colors font-bold"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        {attempts.length > 0 && (
          <div className="mt-6 w-full max-w-md">
            <div className="bg-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-slate-400 mb-3">Recent Attempts</h3>
              <div className="flex justify-between">
                {attempts.map((time, idx) => (
                  <div
                    key={idx}
                    className={`
                      w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold
                      ${time === bestTime ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700'}
                    `}
                  >
                    {time}ms
                  </div>
                ))}
                {attempts.length < 5 && Array(5 - attempts.length).fill(null).map((_, idx) => (
                  <div
                    key={`empty-${idx}`}
                    className="w-12 h-12 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-500"
                  >
                    -
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 text-sm text-slate-400 text-center max-w-md">
          <p>The average human reaction time is about 250ms. How fast are you?</p>
        </div>
      </main>
    </div>
  )
}
