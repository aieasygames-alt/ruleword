import { useState, useCallback, useEffect } from 'react'

// Word list for the game
const WORDS = [
  'JAVASCRIPT', 'TYPESCRIPT', 'REACT', 'ASTRO', 'FRAMEWORK',
  'PUZZLE', 'CHALLENGE', 'ADVENTURE', 'MYSTERY', 'FANTASY',
  'ELEPHANT', 'BUTTERFLY', 'CHOCOLATE', 'COMPUTER', 'KEYBOARD',
  'MOUNTAIN', 'OCEAN', 'DESERT', 'FOREST', 'RIVER',
  'DIAMOND', 'CRYSTAL', 'RAINBOW', 'SUNSHINE', 'MOONLIGHT',
  'DRAGON', 'PHOENIX', 'UNICORN', 'GRIFFIN', 'SPHINX',
  'PIZZA', 'HAMBURGER', 'SPAGHETTI', 'SANDWICH', 'PANCAKE',
  'GUITAR', 'PIANO', 'VIOLIN', 'DRUMS', 'SAXOPHONE',
  'SCIENCE', 'HISTORY', 'GEOGRAPHY', 'MATHEMATICS', 'LITERATURE',
  'CHAMPION', 'VICTORY', 'SUCCESS', 'ACHIEVE', 'TRIUMPH',
]

const MAX_WRONG_GUESSES = 6

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type HangmanProps = {
  settings: Settings
  onBack: () => void
  toggleLanguage: () => void
  toggleTheme: () => void
  toggleSound: () => void
}

export default function Hangman({ settings, onBack }: HangmanProps) {
  const [word, setWord] = useState('')
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set())
  const [wrongGuesses, setWrongGuesses] = useState(0)
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing')
  const [wins, setWins] = useState(0)
  const [losses, setLosses] = useState(0)

  const isDark = settings.darkMode

  const bgClass = isDark ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = isDark ? 'text-white' : 'text-gray-900'

  const startNewGame = useCallback(() => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)]
    setWord(randomWord)
    setGuessedLetters(new Set())
    setWrongGuesses(0)
    setGameState('playing')
  }, [])

  useEffect(() => {
    startNewGame()
  }, [startNewGame])

  // Load stats from localStorage
  useEffect(() => {
    const savedWins = localStorage.getItem('hangman_wins')
    const savedLosses = localStorage.getItem('hangman_losses')
    if (savedWins) setWins(parseInt(savedWins) || 0)
    if (savedLosses) setLosses(parseInt(savedLosses) || 0)
  }, [])

  const handleGuess = (letter: string) => {
    if (gameState !== 'playing' || guessedLetters.has(letter)) return

    const newGuessed = new Set(guessedLetters)
    newGuessed.add(letter)
    setGuessedLetters(newGuessed)

    if (!word.includes(letter)) {
      const newWrong = wrongGuesses + 1
      setWrongGuesses(newWrong)

      if (newWrong >= MAX_WRONG_GUESSES) {
        setGameState('lost')
        const newLosses = losses + 1
        setLosses(newLosses)
        localStorage.setItem('hangman_losses', newLosses.toString())
      }
    } else {
      // Check if won
      const allGuessed = word.split('').every(l => newGuessed.has(l))
      if (allGuessed) {
        setGameState('won')
        const newWins = wins + 1
        setWins(newWins)
        localStorage.setItem('hangman_wins', newWins.toString())
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (gameState !== 'playing') return
    const key = e.key.toUpperCase()
    if (/^[A-Z]$/.test(key)) {
      handleGuess(key)
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState, guessedLetters, word, wrongGuesses])

  const renderHangman = () => {
    const parts = [
      // Head
      wrongGuesses >= 1 && (
        <circle key="head" cx="100" cy="60" r="20" fill="none" stroke="currentColor" strokeWidth="3" />
      ),
      // Body
      wrongGuesses >= 2 && (
        <line key="body" x1="100" y1="80" x2="100" y2="130" stroke="currentColor" strokeWidth="3" />
      ),
      // Left Arm
      wrongGuesses >= 3 && (
        <line key="left-arm" x1="100" y1="90" x2="60" y2="110" stroke="currentColor" strokeWidth="3" />
      ),
      // Right Arm
      wrongGuesses >= 4 && (
        <line key="right-arm" x1="100" y1="90" x2="140" y2="110" stroke="currentColor" strokeWidth="3" />
      ),
      // Left Leg
      wrongGuesses >= 5 && (
        <line key="left-leg" x1="100" y1="130" x2="60" y2="170" stroke="currentColor" strokeWidth="3" />
      ),
      // Right Leg
      wrongGuesses >= 6 && (
        <line key="right-leg" x1="100" y1="130" x2="140" y2="170" stroke="currentColor" strokeWidth="3" />
      ),
    ]

    return (
      <svg width="200" height="200" viewBox="0 0 200 200" className="mx-auto">
        {/* Gallows */}
        <line x1="20" y1="180" x2="100" y2="180" stroke="currentColor" strokeWidth="4" />
        <line x1="60" y1="180" x2="60" y2="20" stroke="currentColor" strokeWidth="4" />
        <line x1="60" y1="20" x2="100" y2="20" stroke="currentColor" strokeWidth="4" />
        <line x1="100" y1="20" x2="100" y2="40" stroke="currentColor" strokeWidth="4" />
        {/* Hangman parts */}
        {parts}
      </svg>
    )
  }

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

  const getLetterStatus = (letter: string) => {
    if (!guessedLetters.has(letter)) return 'unused'
    if (word.includes(letter)) return 'correct'
    return 'wrong'
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
            <span className="text-sm">
              <span className="text-green-400">✓ {wins}</span>
              <span className="text-slate-500 mx-2">|</span>
              <span className="text-red-400">✗ {losses}</span>
            </span>
          </div>
          <button
            onClick={startNewGame}
            className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 transition-colors text-sm font-medium"
          >
            New Word
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        {/* Hangman Drawing */}
        <div className={`${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
          {renderHangman()}
        </div>

        {/* Wrong guesses indicator */}
        <div className="flex items-center gap-2">
          {[...Array(MAX_WRONG_GUESSES)].map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                i < wrongGuesses ? 'bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-500/50 scale-110' : isDark ? 'bg-slate-700' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Word Display */}
        <div className="flex items-center gap-2 text-4xl font-mono">
          {word.split('').map((letter, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className={`transition-all duration-200 ${guessedLetters.has(letter) ? 'text-green-400 scale-110 font-bold drop-shadow-lg' : isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                {guessedLetters.has(letter) || gameState === 'lost' ? letter : '_'}
              </span>
              <div className={`w-8 h-1 rounded ${guessedLetters.has(letter) ? 'bg-green-500' : isDark ? 'bg-slate-600' : 'bg-gray-400'} mt-1 transition-colors`} />
            </div>
          ))}
        </div>

        {/* Keyboard */}
        {gameState === 'playing' && (
          <div className="flex flex-wrap justify-center gap-2 max-w-md">
            {alphabet.split('').map(letter => {
              const status = getLetterStatus(letter)
              return (
                <button
                  key={letter}
                  onClick={() => handleGuess(letter)}
                  disabled={guessedLetters.has(letter)}
                  className={`w-10 h-10 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg ${
                    status === 'correct'
                      ? 'bg-gradient-to-br from-green-500 to-green-700 text-white scale-105 shadow-green-500/30'
                      : status === 'wrong'
                      ? 'bg-gradient-to-br from-red-400 to-red-600 text-red-200 line-through opacity-60 shadow-red-500/20'
                      : isDark
                      ? 'bg-gradient-to-br from-slate-600 to-slate-800 hover:from-slate-500 hover:to-slate-700 text-white hover:scale-105'
                      : 'bg-gradient-to-br from-gray-100 to-gray-300 hover:from-gray-200 hover:to-gray-400 text-gray-800 hover:scale-105 shadow-gray-500/20'
                  }`}
                >
                  {letter}
                </button>
              )
            })}
          </div>
        )}

        {/* Game Over Message */}
        {gameState !== 'playing' && (
          <div className="text-center">
            <div className="text-5xl mb-4">
              {gameState === 'won' ? '🎉' : '😢'}
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${gameState === 'won' ? 'text-green-400' : 'text-red-400'}`}>
              {gameState === 'won' ? 'You Won!' : 'Game Over!'}
            </h2>
            {gameState === 'lost' && (
              <p className="text-slate-400 mb-4">
                The word was: <span className="font-bold text-yellow-400">{word}</span>
              </p>
            )}
            <button
              onClick={startNewGame}
              className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 transition-colors font-medium"
            >
              Play Again
            </button>
          </div>
        )}

        {/* Instructions */}
        <p className="text-sm text-slate-400 text-center">
          Click letters or use your keyboard to guess. You have {MAX_WRONG_GUESSES} wrong guesses before game over!
        </p>
      </main>
    </div>
  )
}
