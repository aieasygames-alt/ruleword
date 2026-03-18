import { useState, useCallback } from 'react'

type Props = {
  settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }
}

const WORDS = ['APPLE', 'BRAVE', 'CRANE', 'DREAM', 'EAGLE', 'FLAME', 'GRAPE', 'HOUSE', 'IMAGE', 'JUICE', 'KNIFE', 'LEMON', 'MUSIC', 'NIGHT', 'OCEAN', 'PIANO', 'QUEEN', 'RIVER', 'STORM', 'TIGER', 'ULTRA', 'VIVID', 'WATER', 'XENON', 'YOUTH', 'ZEBRA', 'BRAIN', 'CLOUD', 'DANCE', 'EARTH', 'FROST', 'GHOST', 'HEART', 'IVORY', 'JELLY', 'KAYAK', 'LIGHT', 'MANGO', 'NOBLE', 'OLIVE', 'PEACE', 'QUEST', 'ROBOT', 'SUGAR', 'TRAIN', 'UNITY', 'VAPOR', 'WORLD', 'XEROX', 'YACHT']

const MAX_GUESSES = 6
const WORD_LENGTH = 5

type LetterState = 'correct' | 'present' | 'absent' | 'empty'

export default function Wordle({ settings }: Props) {
  const [targetWord, setTargetWord] = useState<string>(() => WORDS[Math.floor(Math.random() * WORDS.length)])
  const [guesses, setGuesses] = useState<string[]>([])
  const [currentGuess, setCurrentGuess] = useState('')
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing')
  const [shake, setShake] = useState(false)

  const isDark = settings.darkMode
  const lang = settings.language

  const getLetterState = (letter: string, index: number, guess: string): LetterState => {
    if (!guess[index]) return 'empty'
    if (guess[index] === targetWord[index]) return 'correct'
    if (targetWord.includes(guess[index])) return 'present'
    return 'absent'
  }

  const handleKeyPress = useCallback((key: string) => {
    if (gameState !== 'playing') return

    if (key === 'ENTER') {
      if (currentGuess.length !== WORD_LENGTH) {
        setShake(true)
        setTimeout(() => setShake(false), 500)
        return
      }

      const newGuesses = [...guesses, currentGuess]
      setGuesses(newGuesses)

      if (currentGuess === targetWord) {
        setGameState('won')
      } else if (newGuesses.length >= MAX_GUESSES) {
        setGameState('lost')
      }

      setCurrentGuess('')
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1))
    } else if (currentGuess.length < WORD_LENGTH && /^[A-Z]$/.test(key)) {
      setCurrentGuess(prev => prev + key)
    }
  }, [currentGuess, gameState, guesses, targetWord])

  // Keyboard event
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter') handleKeyPress('ENTER')
    else if (e.key === 'Backspace') handleKeyPress('BACKSPACE')
    else if (/^[a-zA-Z]$/.test(e.key)) handleKeyPress(e.key.toUpperCase())
  }, [handleKeyPress])

  useState(() => {
    window.addEventListener('keydown', handleKeyDown as any)
    return () => window.removeEventListener('keydown', handleKeyDown as any)
  })

  const getKeyState = (key: string): LetterState => {
    for (let i = 0; i < guesses.length; i++) {
      for (let j = 0; j < WORD_LENGTH; j++) {
        if (guesses[i][j] === key) {
          if (targetWord[j] === key) return 'correct'
          if (targetWord.includes(key)) return 'present'
          return 'absent'
        }
      }
    }
    return 'empty'
  }

  const resetGame = () => {
    setTargetWord(WORDS[Math.floor(Math.random() * WORDS.length)])
    setGuesses([])
    setCurrentGuess('')
    setGameState('playing')
  }

  const keyColors: Record<LetterState, string> = {
    correct: 'bg-green-600 text-white',
    present: 'bg-yellow-500 text-white',
    absent: isDark ? 'bg-slate-700 text-white' : 'bg-gray-400 text-white',
    empty: isDark ? 'bg-slate-600 text-white' : 'bg-gray-200'
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <h1 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        🟩 Wordle
      </h1>

      {/* Grid */}
      <div className={`grid gap-1.5 mb-4 ${shake ? 'animate-pulse' : ''}`}>
        {Array(MAX_GUESSES).fill(null).map((_, rowIndex) => {
          const guess = rowIndex < guesses.length ? guesses[rowIndex] : (rowIndex === guesses.length ? currentGuess : '')
          return (
            <div key={rowIndex} className="flex gap-1.5">
              {Array(WORD_LENGTH).fill(null).map((_, colIndex) => {
                const letter = guess[colIndex] || ''
                const state = rowIndex < guesses.length ? getLetterState(letter, colIndex, guess) : 'empty'
                const bgColor =
                  state === 'correct' ? 'bg-green-600' :
                  state === 'present' ? 'bg-yellow-500' :
                  state === 'absent' ? (isDark ? 'bg-slate-700' : 'bg-gray-400') :
                  letter ? (isDark ? 'bg-slate-600' : 'bg-gray-200') : (isDark ? 'bg-slate-700' : 'bg-white')

                return (
                  <div
                    key={colIndex}
                    className={`w-14 h-14 flex items-center justify-center text-2xl font-bold border-2 rounded ${bgColor} ${isDark ? 'border-slate-500' : 'border-gray-300'} ${letter ? 'border-gray-500' : ''}`}
                  >
                    {letter}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Keyboard */}
      <div className="flex flex-col gap-1.5">
        {['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map((row, ri) => (
          <div key={ri} className="flex gap-1 justify-center">
            {ri === 2 && (
              <button onClick={() => handleKeyPress('ENTER')} className={`px-3 h-12 rounded text-sm font-medium ${isDark ? 'bg-slate-600 text-white' : 'bg-gray-300'}`}>
                {lang === 'zh' ? '确定' : 'ENTER'}
              </button>
            )}
            {row.split('').map(key => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className={`w-9 h-12 rounded text-sm font-medium ${keyColors[getKeyState(key)]}`}
              >
                {key}
              </button>
            ))}
            {ri === 2 && (
              <button onClick={() => handleKeyPress('BACKSPACE')} className={`px-3 h-12 rounded text-sm font-medium ${isDark ? 'bg-slate-600 text-white' : 'bg-gray-300'}`}>
                ⌫
              </button>
            )}
          </div>
        ))}
      </div>

      <button onClick={resetGame} className={`mt-4 px-6 py-2 rounded-lg font-medium ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
        {lang === 'zh' ? '新游戏' : 'New Game'}
      </button>

      {(gameState === 'won' || gameState === 'lost') && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70">
          <div className={`p-8 rounded-2xl text-center ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <h2 className={`text-3xl font-bold mb-2 ${gameState === 'won' ? 'text-green-500' : 'text-red-500'}`}>
              {gameState === 'won' ? (lang === 'zh' ? '🎉 正确！' : '🎉 Correct!') : (lang === 'zh' ? '游戏结束' : 'Game Over')}
            </h2>
            <p className={`text-xl mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {lang === 'zh' ? '答案' : 'Answer'}: {targetWord}
            </p>
            <p className={`mb-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              {guesses.length} {lang === 'zh' ? '次尝试' : 'attempts'}
            </p>
            <button onClick={resetGame} className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium">
              {lang === 'zh' ? '再来一次' : 'Play Again'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
