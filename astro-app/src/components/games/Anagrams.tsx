import { useState, useCallback, useEffect } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type AnagramsProps = {
  settings: Settings
  onBack: () => void
  toggleLanguage: () => void
  toggleTheme: () => void
  toggleSound: () => void
}

// Word list with hints
const WORDS = [
  { word: 'REACT', hint: 'JavaScript library' },
  { word: 'PLANET', hint: 'Celestial body' },
  { word: 'GARDEN', hint: 'Where plants grow' },
  { word: 'FOREST', hint: 'Many trees' },
  { word: 'SILENT', hint: 'Quiet' },
  { word: 'LISTEN', hint: 'Hear carefully' },
  { word: 'BREAD', hint: 'Baked food' },
  { word: 'DANCE', hint: 'Move to music' },
  { word: 'OCEAN', hint: 'Large body of water' },
  { word: 'MUSIC', hint: 'Art of sound' },
  { word: 'FLAME', hint: 'Fire' },
  { word: 'GRAPE', hint: 'Fruit' },
  { word: 'DREAM', hint: 'While sleeping' },
  { word: 'STONE', hint: 'Rock' },
  { word: 'CLOUD', hint: 'In the sky' },
  { word: 'BRAIN', hint: 'Think with this' },
  { word: 'SWORD', hint: 'Weapon' },
  { word: 'WORLD', hint: 'Planet Earth' },
  { word: 'HEART', hint: 'Pumps blood' },
  { word: 'EARTH', hint: 'Our planet' },
  { word: 'SMART', hint: 'Clever' },
  { word: 'START', hint: 'Begin' },
  { word: 'TIGER', hint: 'Big cat' },
  { word: 'HORSE', hint: 'Animal you ride' },
  { word: 'BEACH', hint: 'Sandy shore' },
  { word: 'PEACE', hint: 'No war' },
  { word: 'CHAIR', hint: 'Sit on it' },
  { word: 'TABLE', hint: 'Furniture for eating' },
  { word: 'CLOCK', hint: 'Tells time' },
  { word: 'TRAIN', hint: 'Rail transport' },
]

// Shuffle letters
function shuffleWord(word: string): string {
  const arr = word.split('')
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.join('')
}

export default function Anagrams({ settings, onBack }: AnagramsProps) {
  const [currentWord, setCurrentWord] = useState<{ word: string; hint: string } | null>(null)
  const [shuffled, setShuffled] = useState('')
  const [guess, setGuess] = useState('')
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info')
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set())

  const isDark = settings.darkMode
  const bgClass = isDark ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = isDark ? 'text-white' : 'text-gray-900'

  // Load best streak
  useEffect(() => {
    const saved = localStorage.getItem('anagrams_bestStreak')
    if (saved) setBestStreak(parseInt(saved) || 0)
  }, [])

  // Save best streak
  useEffect(() => {
    if (streak > bestStreak) {
      setBestStreak(streak)
      localStorage.setItem('anagrams_bestStreak', streak.toString())
    }
  }, [streak, bestStreak])

  const showMessage = useCallback((msg: string, type: 'success' | 'error' | 'info') => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(''), 2000)
  }, [])

  const getNextWord = useCallback(() => {
    const availableWords = WORDS.filter(w => !usedWords.has(w.word))

    if (availableWords.length === 0) {
      // Reset if all words used
      setUsedWords(new Set())
      const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)]
      setCurrentWord(randomWord)
      setShuffled(shuffleWord(randomWord.word))
    } else {
      const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)]
      setCurrentWord(randomWord)
      setShuffled(shuffleWord(randomWord.word))
      setUsedWords(prev => new Set([...prev, randomWord.word]))
    }

    setGuess('')
    setShowHint(false)
    setAttempts(0)
  }, [usedWords])

  useEffect(() => {
    getNextWord()
  }, [])

  const handleGuess = useCallback(() => {
    if (!currentWord || !guess.trim()) return

    const upperGuess = guess.trim().toUpperCase()

    if (upperGuess === currentWord.word) {
      // Correct!
      setScore(prev => prev + 10 + streak * 2)
      setStreak(prev => prev + 1)
      showMessage('✓ Correct!', 'success')
      setTimeout(() => getNextWord(), 1500)
    } else {
      // Wrong
      setStreak(0)
      setAttempts(prev => prev + 1)
      showMessage('✗ Try again!', 'error')

      if (attempts >= 2) {
        // Show answer after 3 wrong attempts
        showMessage(`Answer: ${currentWord.word}`, 'info')
        setTimeout(() => getNextWord(), 2000)
      }
    }

    setGuess('')
  }, [currentWord, guess, streak, attempts, showMessage, getNextWord])

  const handleReshuffle = useCallback(() => {
    if (currentWord) {
      setShuffled(shuffleWord(currentWord.word))
    }
  }, [currentWord])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGuess()
    }
  }, [handleGuess])

  const handleLetterClick = useCallback((letter: string) => {
    setGuess(prev => prev + letter)
  }, [])

  const handleClear = useCallback(() => {
    setGuess('')
  }, [])

  const handleBackspace = useCallback(() => {
    setGuess(prev => prev.slice(0, -1))
  }, [])

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
              <div className="text-xs text-slate-400">Streak</div>
              <div className="text-lg font-bold text-yellow-400">{streak}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400">Best</div>
              <div className="text-lg font-bold text-blue-400">{bestStreak}</div>
            </div>
          </div>
          <button
            onClick={getNextWord}
            className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 transition-colors text-sm font-medium"
          >
            Skip
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        {/* Shuffled Letters */}
        <div className="text-center space-y-2">
          <p className="text-slate-400 text-sm">Unscramble the word:</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {shuffled.split('').map((letter, idx) => (
              <button
                key={idx}
                onClick={() => handleLetterClick(letter)}
                className="w-12 h-14 sm:w-14 sm:h-16 bg-slate-700 hover:bg-slate-600 rounded-lg text-2xl font-bold flex items-center justify-center transition-colors"
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* Hint */}
        {showHint && currentWord && (
          <div className="text-center">
            <span className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm">
              Hint: {currentWord.hint}
            </span>
          </div>
        )}

        {/* Guess Input */}
        <div className="w-full max-w-sm space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="Type your answer..."
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-center text-xl font-bold uppercase tracking-wider focus:outline-none focus:border-green-500"
              autoFocus
            />
          </div>

          {/* Quick Actions */}
          <div className="flex justify-center gap-2">
            <button
              onClick={handleBackspace}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
            >
              ← Del
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleReshuffle}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
            >
              🔀 Shuffle
            </button>
          </div>

          <button
            onClick={handleGuess}
            disabled={!guess.trim()}
            className="w-full px-6 py-3 rounded-lg bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors font-bold text-lg"
          >
            Submit
          </button>
        </div>

        {/* Hint Button */}
        {!showHint && attempts >= 1 && (
          <button
            onClick={() => setShowHint(true)}
            className="text-yellow-400 text-sm hover:underline"
          >
            Need a hint?
          </button>
        )}

        {/* Message */}
        {message && (
          <div
            className={`text-lg font-bold ${
              messageType === 'success' ? 'text-green-400' :
              messageType === 'error' ? 'text-red-400' : 'text-blue-400'
            }`}
          >
            {message}
          </div>
        )}

        {/* Attempts */}
        {attempts > 0 && (
          <div className="text-slate-400 text-sm">
            Attempts: {attempts + 1}/3
          </div>
        )}
      </main>
    </div>
  )
}
