import { useEffect, useState, useCallback, useMemo } from 'react'
import { VALID_WORDS } from './words'
import type { CellState } from './types'
import { getTranslation, type Language } from './locales'

const WORD_LENGTH = 5
const MAX_GUESSES = 6

const KEYBOARD_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['Enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace'],
]

type KeyState = Record<string, CellState | undefined>

// 统计数据类型
type Stats = {
  played: number
  won: number
  currentStreak: number
  maxStreak: number
  distribution: number[]
}

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

// 存储键名
const SAVE_KEY = 'ruleword_save'
const STATS_KEY = 'ruleword_stats'
const SETTINGS_KEY = 'ruleword_settings'

type SaveData = {
  dayIndex: number
  guesses: string[]
  gameOver: boolean
  won: boolean
  hintsUsed: number
}

type Settings = {
  hardMode: boolean
  language: Language
}

// 默认统计
const defaultStats: Stats = {
  played: 0,
  won: 0,
  currentStreak: 0,
  maxStreak: 0,
  distribution: [0, 0, 0, 0, 0, 0],
}

// 加载存档
function loadSave(): SaveData | null {
  try {
    const data = localStorage.getItem(SAVE_KEY)
    if (data) {
      const parsed = JSON.parse(data) as SaveData
      if (parsed.dayIndex === getDayIndex()) {
        return parsed
      }
    }
  } catch {}
  return null
}

function saveSave(data: SaveData): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(data))
}

// 加载统计
function loadStats(): Stats {
  try {
    const data = localStorage.getItem(STATS_KEY)
    if (data) {
      return { ...defaultStats, ...JSON.parse(data) }
    }
  } catch {}
  return defaultStats
}

function saveStats(stats: Stats): void {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats))
}

// 加载设置
function loadSettings(): Settings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch {}
  return { hardMode: false, language: 'en' }
}

function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

// 计算倒计时
function getTimeToNextWord(): string {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setHours(24, 0, 0, 0)
  const diff = tomorrow.getTime() - now.getTime()
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export default function App() {
  const [solution] = useState<string>(() => getDailyWord())
  const save = useMemo(() => loadSave(), [])
  const [guesses, setGuesses] = useState<string[]>(() => save?.guesses ?? [])
  const [current, setCurrent] = useState('')
  const [gameOver, setGameOver] = useState(() => save?.gameOver ?? false)
  const [won, setWon] = useState(() => save?.won ?? false)
  const [message, setMessage] = useState('')
  const [keyStates, setKeyStates] = useState<KeyState>({})
  const [shakeRow, setShakeRow] = useState(false)
  const [revealingRow, setRevealingRow] = useState<number | null>(null)
  const [showShare, setShowShare] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [copied, setCopied] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(() => save?.hintsUsed ?? 0)
  const [revealedHints, setRevealedHints] = useState<Set<number>>(() => {
    if (save?.guesses?.length && save.hintsUsed > 0) {
      const hints = new Set<number>()
      for (let i = 0; i < save.hintsUsed; i++) {
        hints.add(i)
      }
      return hints
    }
    return new Set()
  })
  const [countdown, setCountdown] = useState(getTimeToNextWord())
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [stats, setStats] = useState<Stats>(loadStats)

  const dayNumber = getDayIndex() + 1
  const t = getTranslation(settings.language)

  const evaluate = useCallback(
    (word: string): CellState[] => {
      const result: CellState[] = new Array(WORD_LENGTH).fill('absent')
      const solutionChars = solution.split('')
      const wordChars = word.split('')

      for (let i = 0; i < WORD_LENGTH; i++) {
        if (wordChars[i] === solutionChars[i]) {
          result[i] = 'correct'
          solutionChars[i] = '#'
          wordChars[i] = '*'
        }
      }

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

  const updateKeyStates = useCallback((word: string, states: CellState[]) => {
    setKeyStates((prev) => {
      const newStates = { ...prev }
      word.split('').forEach((char, i) => {
        const currentState = newStates[char]
        const newState = states[i]
        if (currentState === 'correct' || (currentState === 'present' && newState === 'absent')) {
          return
        }
        newStates[char] = newState
      })
      return newStates
    })
  }, [])

  // Hard Mode 验证
  const validateHardMode = useCallback(
    (word: string): string | null => {
      const requiredChars: Map<string, number[]> = new Map()

      guesses.forEach((guess) => {
        const states = evaluate(guess)
        guess.split('').forEach((char, i) => {
          if (states[i] === 'correct') {
            if (!requiredChars.has(char)) {
              requiredChars.set(char, [])
            }
            requiredChars.get(char)!.push(i)
          } else if (states[i] === 'present') {
            if (!requiredChars.has(char)) {
              requiredChars.set(char, [-1])
            }
          }
        })
      })

      for (const [char, positions] of requiredChars) {
        if (!word.includes(char)) {
          return `${t.mustUse} "${char.toUpperCase()}"`
        }
        for (const pos of positions) {
          if (pos >= 0 && word[pos] !== char) {
            return `${t.mustUse} "${char.toUpperCase()}" ${settings.language === 'en' ? 'at position' : '在位置'} ${pos + 1}`
          }
        }
      }

      return null
    },
    [guesses, evaluate, t, settings.language]
  )

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
      lines.push(states.map((s) => emoji[s]).join(''))
    })
    return lines.join('\n')
  }, [guesses, won, dayNumber, evaluate])

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(generateShareText()).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [generateShareText])

  const handleHint = useCallback(() => {
    if (gameOver || hintsUsed >= WORD_LENGTH) return

    // 找到一个未揭示的位置
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (!revealedHints.has(i)) {
        const newHints = new Set(revealedHints)
        newHints.add(i)
        setRevealedHints(newHints)
        setHintsUsed(hintsUsed + 1)
        break
      }
    }
  }, [gameOver, hintsUsed, revealedHints])

  const handleKeyPress = useCallback(
    (key: string) => {
      if (gameOver) return

      if (key === 'Enter') {
        if (current.length !== WORD_LENGTH) {
          setMessage(t.tooShort)
          setShakeRow(true)
          setTimeout(() => {
            setShakeRow(false)
            setMessage('')
          }, 1500)
          return
        }

        if (!VALID_WORDS.includes(current)) {
          setMessage(t.notInList)
          setShakeRow(true)
          setTimeout(() => {
            setShakeRow(false)
            setMessage('')
          }, 1500)
          return
        }

        // Hard Mode 检查
        if (settings.hardMode && guesses.length > 0) {
          const error = validateHardMode(current)
          if (error) {
            setMessage(error)
            setShakeRow(true)
            setTimeout(() => {
              setShakeRow(false)
              setMessage('')
            }, 1500)
            return
          }
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
            setMessage(t.brilliant)
            setGameOver(true)
            setWon(true)
            setShowShare(true)
          } else if (isGameOver) {
            setMessage(`${t.theWordWas} ${solution.toUpperCase()}`)
            setGameOver(true)
            setWon(false)
            setShowShare(true)
          } else {
            setCurrent('')
          }

          // 更新统计
          if (isGameOver) {
            const newStats = { ...stats }
            newStats.played++
            if (isWin) {
              newStats.won++
              newStats.currentStreak++
              newStats.maxStreak = Math.max(newStats.maxStreak, newStats.currentStreak)
              newStats.distribution[newGuesses.length - 1]++
            } else {
              newStats.currentStreak = 0
            }
            setStats(newStats)
            saveStats(newStats)
          }

          // 保存进度
          saveSave({
            dayIndex: getDayIndex(),
            guesses: newGuesses,
            gameOver: isGameOver,
            won: isWin,
            hintsUsed,
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
    [current, gameOver, guesses, solution, evaluate, updateKeyStates, settings.hardMode, validateHardMode, t, stats, hintsUsed]
  )

  // 键盘事件
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => handleKeyPress(e.key)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleKeyPress])

  // 初始化键盘状态
  useEffect(() => {
    guesses.forEach((guess) => updateKeyStates(guess, evaluate(guess)))
  }, [])

  // 倒计时
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeToNextWord())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 切换设置
  const toggleHardMode = () => {
    const newSettings = { ...settings, hardMode: !settings.hardMode }
    setSettings(newSettings)
    saveSettings(newSettings)
  }

  const toggleLanguage = () => {
    const newLang: Language = settings.language === 'en' ? 'zh' : 'en'
    const newSettings = { ...settings, language: newLang }
    setSettings(newSettings)
    saveSettings(newSettings)
  }

  // 统计最大分布值
  const maxDist = Math.max(...stats.distribution, 1)

  return (
    <div className="min-h-screen flex flex-col items-center justify-between py-4 px-2 bg-slate-900 text-white">
      {/* Header */}
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between border-b border-gray-700 pb-3 mb-4">
          {/* 左侧按钮 */}
          <div className="flex items-center gap-2">
            <button onClick={() => setShowHelp(true)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button onClick={() => setShowStats(true)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
          </div>

          <h1 className="text-2xl font-bold tracking-wider">{t.title}</h1>

          {/* 右侧按钮 */}
          <div className="flex items-center gap-2">
            <button onClick={toggleLanguage} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded text-xs font-bold">
              {settings.language === 'en' ? '中' : 'EN'}
            </button>
            <button onClick={toggleHardMode} className={`w-8 h-8 flex items-center justify-center rounded text-xs ${settings.hardMode ? 'bg-yellow-500 text-black' : 'hover:bg-gray-700'}`}>
              H
            </button>
          </div>
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
              <div key={row} className={`flex gap-1.5 ${isShaking ? 'animate-shake' : ''}`}>
                {Array.from({ length: WORD_LENGTH }).map((_, i) => {
                  const char = word[i] ?? ''
                  const state = guesses[row] ? states[i] : undefined
                  const isFilled = char !== ''
                  const isRevealingCell = isRevealing && guesses[row]
                  const isHint = revealedHints.has(i) && row === guesses.length

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
                        isHint && 'border-green-500',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      style={{
                        animationDelay: isRevealingCell ? `${i * 300}ms` : isWinRow ? `${i * 100}ms` : '0ms',
                      }}
                    >
                      <div className="cell-inner">{char || (isHint && row === guesses.length ? solution[i].toUpperCase() : '')}</div>
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
            <div className={`toast px-4 py-2 rounded-lg font-semibold ${won ? 'bg-green-600' : 'bg-gray-700'}`}>
              {message}
            </div>
          )}
        </div>
      </div>

      {/* Hint Button */}
      {!gameOver && (
        <div className="mb-2">
          <button
            onClick={handleHint}
            disabled={hintsUsed >= WORD_LENGTH}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              hintsUsed >= WORD_LENGTH ? 'bg-gray-700 text-gray-500' : 'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            💡 {t.hint} ({WORD_LENGTH - hintsUsed})
          </button>
        </div>
      )}

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
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414-6.414A2 2 0 0110.828 5H19a2 2 0 012 2v10a2 2 0 01-2 2h-8.172a2 2 0 01-1.414-.586L3 12z" />
                    </svg>
                  ) : key === 'Enter' ? (
                    t.enter
                  ) : (
                    key.toUpperCase()
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Countdown */}
      {gameOver && (
        <div className="mt-3 text-center text-sm text-gray-400">
          <div>{t.nextWord}</div>
          <div className="text-xl font-mono font-bold text-white">{countdown}</div>
        </div>
      )}

      {/* Stats Modal */}
      {showStats && (
        <div className="modal-overlay fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowStats(false)}>
          <div className="modal-content bg-slate-800 rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-center mb-4">{t.statistics}</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.played}</div>
                <div className="text-xs text-gray-400">{t.played}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.played ? Math.round((stats.won / stats.played) * 100) : 0}</div>
                <div className="text-xs text-gray-400">{t.winRate}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.currentStreak}</div>
                <div className="text-xs text-gray-400">{t.streak}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.maxStreak}</div>
                <div className="text-xs text-gray-400">{t.maxStreak}</div>
              </div>
            </div>

            {/* Distribution */}
            <h3 className="text-sm font-bold mb-2">{t.guessDistribution}</h3>
            <div className="space-y-1">
              {stats.distribution.map((count, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-4 text-right text-sm">{i + 1}</div>
                  <div
                    className={`h-5 flex items-center px-2 text-xs font-bold ${won && guesses.length === i + 1 && gameOver ? 'bg-green-600' : 'bg-gray-600'}`}
                    style={{ width: `${Math.max((count / maxDist) * 100, 8)}%`, minWidth: '30px' }}
                  >
                    {count}
                  </div>
                </div>
              ))}
            </div>

            {/* Countdown in stats */}
            {gameOver && (
              <div className="mt-4 text-center">
                <div className="text-sm text-gray-400">{t.nextWord}</div>
                <div className="text-xl font-mono font-bold">{countdown}</div>
              </div>
            )}

            <button onClick={() => setShowStats(false)} className="mt-4 w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
              {t.close}
            </button>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="modal-overlay fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowHelp(false)}>
          <div className="modal-content bg-slate-800 rounded-2xl p-6 max-w-sm w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-center mb-4">{t.howToPlayTitle}</h2>

            <div className="space-y-4 text-sm">
              {t.howToPlayContent.map((line, i) => (
                <p key={i}>{line}</p>
              ))}

              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-600 flex items-center justify-center font-bold">W</div>
                  <span className="text-xs text-gray-300">{t.greenMeaning}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-500 flex items-center justify-center font-bold">O</div>
                  <span className="text-xs text-gray-300">{t.yellowMeaning}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-700 flex items-center justify-center font-bold">R</div>
                  <span className="text-xs text-gray-300">{t.grayMeaning}</span>
                </div>
              </div>
            </div>

            <button onClick={() => setShowHelp(false)} className="mt-6 w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
              {t.close}
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShare && (
        <div className="modal-overlay fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowShare(false)}>
          <div className="modal-content bg-slate-800 rounded-2xl p-6 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-2">{won ? t.excellent : t.niceTry}</h2>
            <p className="text-gray-400 mb-4">
              {won ? `${t.gotIt} ${guesses.length} ${guesses.length === 1 ? t.try : t.tries}!` : `${t.theWordWas} ${solution.toUpperCase()}`}
            </p>
            <div className="bg-slate-700 rounded-lg p-3 mb-4 font-mono text-sm whitespace-pre text-left">
              {generateShareText()}
            </div>
            <button onClick={handleShare} className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition-colors">
              {copied ? t.copied : t.copyShare}
            </button>
            <button onClick={() => setShowShare(false)} className="mt-3 text-gray-400 hover:text-white">
              {t.close}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
