import { useEffect, useState, useCallback } from 'react'
import { VALID_WORDS } from './words'
import type { CellState } from './types'

const WORD_LENGTH = 5
const MAX_GUESSES = 6

const KEYBOARD_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['Enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace'],
]

type KeyState = Record<string, CellState | undefined>

function getRandomWord(): string {
  return VALID_WORDS[Math.floor(Math.random() * VALID_WORDS.length)]
}

export default function App() {
  const [solution, setSolution] = useState<string>(() => getRandomWord())
  const [guesses, setGuesses] = useState<string[]>([])
  const [current, setCurrent] = useState('')
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [message, setMessage] = useState('')
  const [keyStates, setKeyStates] = useState<KeyState>({})
  const [shakeRow, setShakeRow] = useState(false)
  const [revealingRow, setRevealingRow] = useState<number | null>(null)

  const evaluate = useCallback(
    (word: string): CellState[] => {
      const result: CellState[] = new Array(WORD_LENGTH).fill('absent')
      const solutionChars = solution.split('')
      const wordChars = word.split('')

      // First pass: mark correct (green)
      for (let i = 0; i < WORD_LENGTH; i++) {
        if (wordChars[i] === solutionChars[i]) {
          result[i] = 'correct'
          solutionChars[i] = '#'
          wordChars[i] = '*'
        }
      }

      // Second pass: mark present (yellow)
      for (let i = 0; i < WORD_LENGTH; i++) {
        if (wordChars[i] === '*') continue
        const idx = solutionChars.indexOf(wordChars[i])
        if (idx !== -1) {
          result[i] = 'present'
          solutionChars[idx] = '#'
        }
      }

      return result
    },
    [solution]
  )

  const updateKeyStates = useCallback(
    (word: string, states: CellState[]) => {
      setKeyStates((prev) => {
        const newStates = { ...prev }
        word.split('').forEach((char, i) => {
          const currentState = newStates[char]
          const newState = states[i]
          // Priority: correct > present > absent
          if (
            currentState === 'correct' ||
            (currentState === 'present' && newState === 'absent')
          ) {
            return
          }
          newStates[char] = newState
        })
        return newStates
      })
    },
    []
  )

  const handleKeyPress = useCallback(
    (key: string) => {
      if (gameOver) return

      if (key === 'Enter') {
        if (current.length !== WORD_LENGTH) {
          setShakeRow(true)
          setTimeout(() => setShakeRow(false), 500)
          return
        }

        // 验证单词是否在词库中（可选：移除此检查允许任意单词）
        if (!VALID_WORDS.includes(current)) {
          setMessage('Not in word list')
          setShakeRow(true)
          setTimeout(() => {
            setShakeRow(false)
            setMessage('')
          }, 1500)
          return
        }

        const states = evaluate(current)
        const newGuesses = [...guesses, current]
        setRevealingRow(guesses.length)
        setGuesses(newGuesses)

        // 延迟更新键盘状态和检查胜负
        setTimeout(() => {
          updateKeyStates(current, states)
          setRevealingRow(null)

          if (current === solution) {
            setMessage('🎉 Brilliant!')
            setGameOver(true)
            setWon(true)
          } else if (newGuesses.length >= MAX_GUESSES) {
            setMessage(`The word was "${solution.toUpperCase()}"`)
            setGameOver(true)
            setWon(false)
          } else {
            setCurrent('')
          }
        }, WORD_LENGTH * 300 + 100)
      } else if (key === 'Backspace') {
        setCurrent(current.slice(0, -1))
      } else if (/^[a-zA-Z]$/.test(key)) {
        if (current.length < WORD_LENGTH) {
          setCurrent((c) => c + key.toLowerCase())
        }
      }
    },
    [current, gameOver, guesses, solution, evaluate, updateKeyStates]
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      handleKeyPress(e.key)
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleKeyPress])

  const resetGame = () => {
    setSolution(getRandomWord())
    setGuesses([])
    setCurrent('')
    setGameOver(false)
    setWon(false)
    setMessage('')
    setKeyStates({})
    setRevealingRow(null)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-between py-4 px-2 bg-gray-900 text-white">
      {/* Header */}
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between border-b border-gray-700 pb-3 mb-4">
          <div className="w-10" />
          <h1 className="text-2xl font-bold tracking-wider">RuleWord</h1>
          <button
            onClick={resetGame}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-700 transition-colors"
            title="New Game"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Game Board */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="grid grid-rows-6 gap-1.5 mb-4">
          {Array.from({ length: MAX_GUESSES }).map((_, row) => {
            const word = guesses[row] ?? (row === guesses.length ? current : '')
            const states =
              row < guesses.length
                ? evaluate(guesses[row])
                : row === guesses.length && revealingRow !== null
                  ? []
                  : []
            const isRevealing = revealingRow === row
            const isCurrentRow = row === guesses.length && !gameOver
            const isShaking = shakeRow && isCurrentRow

            return (
              <div
                key={row}
                className={`flex gap-1.5 ${isShaking ? 'animate-shake' : ''}`}
              >
                {Array.from({ length: WORD_LENGTH }).map((_, i) => {
                  const char = word[i] ?? ''
                  const state = guesses[row] ? states[i] : undefined
                  const isFilled = char !== ''
                  const isRevealingCell = isRevealing && guesses[row]

                  return (
                    <div
                      key={i}
                      className={[
                        'cell',
                        state === 'correct' && 'cell-correct',
                        state === 'present' && 'cell-present',
                        state === 'absent' && guesses[row] && 'cell-absent',
                        isFilled && !state && 'cell-filled',
                        isRevealingCell && 'cell-reveal',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      style={{
                        animationDelay: isRevealingCell ? `${i * 300}ms` : '0ms',
                      }}
                    >
                      {char}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* Message */}
        <div className="h-8 flex items-center justify-center">
          {message && (
            <div
              className={`px-4 py-2 rounded-lg font-semibold ${
                won ? 'bg-green-600' : won === false && gameOver ? 'bg-red-600' : 'bg-gray-700'
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>

      {/* Virtual Keyboard */}
      <div className="w-full max-w-md space-y-2">
        {KEYBOARD_ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-1.5">
            {row.map((key) => {
              const state = keyStates[key.toLowerCase()]
              const isSpecial = key === 'Enter' || key === 'Backspace'

              return (
                <button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  className={[
                    'keyboard-key',
                    state === 'correct' && 'key-correct',
                    state === 'present' && 'key-present',
                    state === 'absent' && 'key-absent',
                    isSpecial && 'key-special',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {key === 'Backspace' ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414-6.414A2 2 0 0110.828 5H19a2 2 0 012 2v10a2 2 0 01-2 2h-8.172a2 2 0 01-1.414-.586L3 12z"
                      />
                    </svg>
                  ) : key === 'Enter' ? (
                    'ENTER'
                  ) : (
                    key.toUpperCase()
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
