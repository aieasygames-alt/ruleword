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

// 获取每日单词索引
function getDayIndex(): number {
  const startDate = new Date('2024-01-01').getTime()
  const now = new Date().setHours(0, 0, 0, 0)
  return Math.floor((now - startDate) / 86400000)
}

// 根据日期获取单词
function getDailyWord(): string {
  const dayIndex = getDayIndex()
  return VALID_WORDS[dayIndex % VALID_WORDS.length]
}

// 本地存储键名
const STORAGE_KEY = 'ruleword_save'

type SaveData = {
  dayIndex: number
  guesses: string[]
  gameOver: boolean
  won: boolean
}

// 加载存档
function loadSave(): SaveData | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data) as SaveData
      // 只恢复当天的存档
      if (parsed.dayIndex === getDayIndex()) {
        return parsed
      }
    }
  } catch {
    // ignore
  }
  return null
}

// 保存进度
function saveSave(data: SaveData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// 清除存档
function clearSave(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export default function App() {
  const [solution] = useState<string>(() => getDailyWord())
  const [guesses, setGuesses] = useState<string[]>(() => {
    const save = loadSave()
    return save?.guesses ?? []
  })
  const [current, setCurrent] = useState('')
  const [gameOver, setGameOver] = useState(() => {
    const save = loadSave()
    return save?.gameOver ?? false
  })
  const [won, setWon] = useState(() => {
    const save = loadSave()
    return save?.won ?? false
  })
  const [message, setMessage] = useState('')
  const [keyStates, setKeyStates] = useState<KeyState>({})
  const [shakeRow, setShakeRow] = useState(false)
  const [revealingRow, setRevealingRow] = useState<number | null>(null)
  const [showShare, setShowShare] = useState(false)
  const [copied, setCopied] = useState(false)

  const dayNumber = getDayIndex() + 1

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

  // 生成分享文本
  const generateShareText = useCallback(() => {
    const emoji: Record<CellState, string> = {
      correct: '🟩',
      present: '🟨',
      absent: '⬛',
      empty: '⬜',
    }
    const lines = [`RuleWord #${dayNumber} ${won ? guesses.length : 'X'}/${MAX_GUESSES}`]
    guesses.forEach((guess) => {
      const states = evaluate(guess)
      const line = states.map((s) => emoji[s]).join('')
      lines.push(line)
    })
    return lines.join('\n')
  }, [guesses, won, dayNumber, evaluate])

  const handleShare = useCallback(() => {
    const text = generateShareText()
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [generateShareText])

  const handleKeyPress = useCallback(
    (key: string) => {
      if (gameOver) return

      if (key === 'Enter') {
        if (current.length !== WORD_LENGTH) {
          setShakeRow(true)
          setTimeout(() => setShakeRow(false), 500)
          return
        }

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

        setTimeout(() => {
          updateKeyStates(current, states)
          setRevealingRow(null)

          const isWin = current === solution
          const isGameOver = isWin || newGuesses.length >= MAX_GUESSES

          if (isWin) {
            setMessage('🎉 Brilliant!')
            setGameOver(true)
            setWon(true)
            setShowShare(true)
          } else if (isGameOver) {
            setMessage(solution.toUpperCase())
            setGameOver(true)
            setWon(false)
            setShowShare(true)
          } else {
            setCurrent('')
          }

          // 保存进度
          saveSave({
            dayIndex: getDayIndex(),
            guesses: newGuesses,
            gameOver: isGameOver,
            won: isWin,
          })
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

  // 初始化键盘状态
  useEffect(() => {
    guesses.forEach((guess) => {
      updateKeyStates(guess, evaluate(guess))
    })
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-between py-4 px-2 bg-slate-900 text-white">
      {/* Header */}
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between border-b border-gray-700 pb-3 mb-4">
          <div className="w-10 text-left text-xs text-gray-400">
            #{dayNumber}
          </div>
          <h1 className="text-2xl font-bold tracking-wider">RuleWord</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Game Board */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="grid grid-rows-6 gap-1.5 mb-4">
          {Array.from({ length: MAX_GUESSES }).map((_, row) => {
            const word = guesses[row] ?? (row === guesses.length ? current : '')
            const states = row < guesses.length ? evaluate(guesses[row]) : []
            const isRevealing = revealingRow === row
            const isCurrentRow = row === guesses.length && !gameOver
            const isShaking = shakeRow && isCurrentRow
            const isWinRow = gameOver && won && row === guesses.length - 1

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
                        isWinRow && 'cell-win',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      style={{
                        animationDelay: isRevealingCell
                          ? `${i * 300}ms`
                          : isWinRow
                            ? `${i * 100}ms`
                            : '0ms',
                      }}
                    >
                      <div className="cell-inner">{char}</div>
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
              className={`toast px-4 py-2 rounded-lg font-semibold ${
                won ? 'bg-green-600' : won === false && gameOver ? 'bg-gray-700' : 'bg-gray-700'
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

      {/* Share Modal */}
      {showShare && (
        <div
          className="modal-overlay fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowShare(false)}
        >
          <div
            className="modal-content bg-slate-800 rounded-2xl p-6 max-w-sm w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-2">
              {won ? '🎉 Excellent!' : '😢 Nice Try!'}
            </h2>
            <p className="text-gray-400 mb-4">
              {won
                ? `You got it in ${guesses.length} ${guesses.length === 1 ? 'try' : 'tries'}!`
                : `The word was ${solution.toUpperCase()}`}
            </p>
            <div className="bg-slate-700 rounded-lg p-3 mb-4 font-mono text-sm whitespace-pre text-left">
              {generateShareText()}
            </div>
            <button
              onClick={handleShare}
              className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition-colors"
            >
              {copied ? '✓ Copied!' : '📋 Copy & Share'}
            </button>
            <button
              onClick={() => setShowShare(false)}
              className="mt-3 text-gray-400 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
