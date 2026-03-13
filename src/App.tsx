import { useEffect, useState, useCallback, useRef } from 'react'
import { VALID_WORDS } from './words'
import { IDIOMS, getDailyIdiom, getRandomIdiom } from './idioms'
import type { CellState } from './types'
import { getTranslation, type Language } from './locales'
import Mastermind from './Mastermind'

type GameType = 'menu' | 'wordle' | 'mastermind'

const WORD_LENGTH_EN = 5
const WORD_LENGTH_ZH = 4
const MAX_GUESSES = 6

const KEYBOARD_ROWS_EN = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace'],
]

// 中文拼音键盘
const KEYBOARD_ROWS_ZH = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace'],
]

type KeyState = Record<string, CellState | undefined>
type GameMode = 'daily' | 'practice'

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

// 根据日期和语言获取单词/成语
function getDailyWord(language: Language): string {
  if (language === 'zh') {
    return getDailyIdiom()
  }
  const dayIndex = getDayIndex()
  return VALID_WORDS[dayIndex % VALID_WORDS.length]
}

// 获取随机单词/成语（练习模式）
function getRandomWord(language: Language): string {
  if (language === 'zh') {
    return getRandomIdiom()
  }
  return VALID_WORDS[Math.floor(Math.random() * VALID_WORDS.length)]
}

// 验证单词/成语
function isValidWord(word: string, language: Language): boolean {
  if (language === 'zh') {
    return IDIOMS.includes(word)
  }
  return VALID_WORDS.includes(word)
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
  soundEnabled: boolean
  darkMode: boolean
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
  return { hardMode: false, language: 'en', soundEnabled: true, darkMode: true }
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

// 音效 URLs (使用 Web Audio API 生成)
function playSound(type: 'key' | 'success' | 'fail' | 'win', enabled: boolean) {
  if (!enabled) return

  const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  switch (type) {
    case 'key':
      oscillator.frequency.value = 300
      gainNode.gain.value = 0.1
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.05)
      break
    case 'success':
      oscillator.frequency.value = 523
      gainNode.gain.value = 0.1
      oscillator.start()
      oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1)
      oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2)
      oscillator.stop(audioContext.currentTime + 0.3)
      break
    case 'fail':
      oscillator.frequency.value = 200
      gainNode.gain.value = 0.1
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.15)
      break
    case 'win':
      oscillator.frequency.value = 523
      gainNode.gain.value = 0.1
      oscillator.start()
      oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.15)
      oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.3)
      oscillator.frequency.setValueAtTime(1047, audioContext.currentTime + 0.45)
      oscillator.stop(audioContext.currentTime + 0.6)
      break
  }
}

export default function App() {
  const [gameType, setGameType] = useState<GameType>('menu')
  const [gameMode, setGameMode] = useState<GameMode>('daily')
  const [settings, setSettings] = useState<Settings>(loadSettings)

  // 根据语言决定单词长度
  const wordLength = settings.language === 'zh' ? WORD_LENGTH_ZH : WORD_LENGTH_EN
  const keyboardRows = settings.language === 'zh' ? KEYBOARD_ROWS_ZH : KEYBOARD_ROWS_EN

  const [solution, setSolution] = useState<string>(() => getDailyWord(settings.language))
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
  const [showStats, setShowStats] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [copied, setCopied] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(() => {
    const save = loadSave()
    return save?.hintsUsed ?? 0
  })
  const [revealedHints, setRevealedHints] = useState<Set<number>>(() => {
    const save = loadSave()
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
  const [stats, setStats] = useState<Stats>(loadStats)

  const initializedRef = useRef(false)

  const dayNumber = getDayIndex() + 1
  const t = getTranslation(settings.language)

  const evaluate = useCallback(
    (word: string): CellState[] => {
      const result: CellState[] = new Array(wordLength).fill('absent')
      const solutionChars = solution.split('')
      const wordChars = word.split('')

      for (let i = 0; i < wordLength; i++) {
        if (wordChars[i] === solutionChars[i]) {
          result[i] = 'correct'
          solutionChars[i] = '#'
          wordChars[i] = '*'
        }
      }

      for (let i = 0; i < wordLength; i++) {
        if (wordChars[i] === '*') continue
        const idx = solutionChars.indexOf(wordChars[i])
        if (idx !== -1) {
          result[i] = 'present'
          solutionChars[idx] = '#'
        }
      }

      return result
    },
    [solution, wordLength]
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
    const lines = gameMode === 'daily'
      ? [`RuleWord #${dayNumber} ${won ? guesses.length : 'X'}/${MAX_GUESSES}`]
      : [`RuleWord ${t.practiceMode} ${won ? guesses.length : 'X'}/${MAX_GUESSES}`]
    guesses.forEach((guess) => {
      const states = evaluate(guess)
      lines.push(states.map((s) => emoji[s]).join(''))
    })
    return lines.join('\n')
  }, [guesses, won, dayNumber, evaluate, gameMode, t])

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(generateShareText()).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [generateShareText])

  const handleHint = useCallback(() => {
    if (gameOver || hintsUsed >= wordLength) return

    for (let i = 0; i < wordLength; i++) {
      if (!revealedHints.has(i)) {
        const newHints = new Set(revealedHints)
        newHints.add(i)
        setRevealedHints(newHints)
        setHintsUsed(hintsUsed + 1)
        break
      }
    }
  }, [gameOver, hintsUsed, revealedHints, wordLength])

  const handleKeyPress = useCallback(
    (key: string) => {
      if (gameOver) return

      if (key === 'Enter') {
        if (current.length !== wordLength) {
          setMessage(t.tooShort)
          setShakeRow(true)
          playSound('fail', settings.soundEnabled)
          setTimeout(() => {
            setShakeRow(false)
            setMessage('')
          }, 1500)
          return
        }

        if (!isValidWord(current, settings.language)) {
          setMessage(t.notInList)
          setShakeRow(true)
          playSound('fail', settings.soundEnabled)
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
            playSound('fail', settings.soundEnabled)
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
            playSound('win', settings.soundEnabled)
          } else if (isGameOver) {
            const displaySolution = settings.language === 'zh' ? solution : solution.toUpperCase()
            setMessage(`${t.theWordWas} ${displaySolution}`)
            setGameOver(true)
            setWon(false)
            setShowShare(true)
            playSound('fail', settings.soundEnabled)
          } else {
            setCurrent('')
            playSound('success', settings.soundEnabled)
          }

          // 更新统计（仅每日模式）
          if (isGameOver && gameMode === 'daily') {
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

          // 保存进度（仅每日模式）
          if (gameMode === 'daily') {
            saveSave({
              dayIndex: getDayIndex(),
              guesses: newGuesses,
              gameOver: isGameOver,
              won: isWin,
              hintsUsed,
            })
          }
        }, wordLength * 300 + 100)
      } else if (key === 'Backspace') {
        setCurrent(current.slice(0, -1))
        playSound('key', settings.soundEnabled)
      } else if (settings.language === 'zh') {
        // Chinese mode: accept Chinese characters
        if (/[\u4e00-\u9fff]/.test(key) && current.length < wordLength) {
          setCurrent((c) => c + key)
          playSound('key', settings.soundEnabled)
        }
      } else if (/^[a-zA-Z]$/.test(key)) {
        // English mode: accept English letters
        if (current.length < wordLength) {
          setCurrent((c) => c + key.toLowerCase())
          playSound('key', settings.soundEnabled)
        }
      }
    },
    [current, gameOver, guesses, solution, evaluate, updateKeyStates, settings.hardMode, settings.soundEnabled, settings.language, validateHardMode, t, stats, hintsUsed, gameMode, wordLength]
  )

  // 键盘事件
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => handleKeyPress(e.key)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleKeyPress])

  // 初始化键盘状态
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true
      guesses.forEach((guess) => updateKeyStates(guess, evaluate(guess)))
    }
  }, [])

  // 倒计时
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeToNextWord())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 切换游戏模式
  const switchToDaily = () => {
    setGameMode('daily')
    const save = loadSave()
    setSolution(getDailyWord(settings.language))
    setGuesses(save?.guesses ?? [])
    setCurrent('')
    setGameOver(save?.gameOver ?? false)
    setWon(save?.won ?? false)
    setKeyStates({})
    setHintsUsed(save?.hintsUsed ?? 0)
    setRevealedHints(new Set())
    setShowShare(false)
    setMessage('')
    // 重新加载键盘状态
    if (save?.guesses) {
      save.guesses.forEach((guess) => updateKeyStates(guess, evaluate(guess)))
    }
  }

  const switchToPractice = () => {
    setGameMode('practice')
    setSolution(getRandomWord(settings.language))
    setGuesses([])
    setCurrent('')
    setGameOver(false)
    setWon(false)
    setKeyStates({})
    setHintsUsed(0)
    setRevealedHints(new Set())
    setShowShare(false)
    setMessage('')
  }

  const playAgain = () => {
    setSolution(getRandomWord(settings.language))
    setGuesses([])
    setCurrent('')
    setGameOver(false)
    setWon(false)
    setKeyStates({})
    setHintsUsed(0)
    setRevealedHints(new Set())
    setShowShare(false)
    setMessage('')
  }

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
    // Reset game with new word in new language
    if (gameMode === 'daily') {
      setSolution(getDailyWord(newLang))
    } else {
      setSolution(getRandomWord(newLang))
    }
    setGuesses([])
    setCurrent('')
    setGameOver(false)
    setWon(false)
    setKeyStates({})
    setHintsUsed(0)
    setRevealedHints(new Set())
    setShowShare(false)
    setMessage('')
  }

  const toggleSound = () => {
    const newSettings = { ...settings, soundEnabled: !settings.soundEnabled }
    setSettings(newSettings)
    saveSettings(newSettings)
  }

  const toggleTheme = () => {
    const newSettings = { ...settings, darkMode: !settings.darkMode }
    setSettings(newSettings)
    saveSettings(newSettings)
  }

  // 统计最大分布值
  const maxDist = Math.max(...stats.distribution, 1)

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const borderClass = settings.darkMode ? 'border-gray-700' : 'border-gray-300'
  const modalBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'
  const keyBgClass = settings.darkMode ? 'bg-gray-500' : 'bg-gray-300 text-gray-900'

  // Game selection menu
  if (gameType === 'menu') {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center py-4 px-4 ${bgClass} ${textClass}`}>
        <div className="max-w-md w-full text-center">
          <h1 className="text-4xl font-bold mb-2 tracking-wider">🎮 RuleWord</h1>
          <p className={`text-sm mb-6 ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {settings.language === 'zh' ? '选择一个游戏开始' : 'Choose a game to play'}
          </p>

          {/* How to Play Section */}
          <div className={`mb-6 p-4 rounded-xl ${modalBgClass} border ${borderClass} text-left`}>
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <span>📖</span>
              {settings.language === 'zh' ? '游戏玩法' : 'How to Play'}
            </h3>
            <div className={`text-sm space-y-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <p><strong>📝 {settings.language === 'zh' ? '猜词游戏' : 'Word Guess'}:</strong></p>
              <p className="pl-4">
                {settings.language === 'zh'
                  ? '在6次机会内猜出4字成语。输入汉字后按回车提交。'
                  : 'Guess the 5-letter word in 6 tries. Type and press Enter to submit.'}
              </p>
              <div className="flex gap-2 pl-4 my-2">
                <span className="text-xs px-2 py-1 bg-green-600 rounded">🟩 {settings.language === 'zh' ? '字正确且位置正确' : 'Correct position'}</span>
                <span className="text-xs px-2 py-1 bg-yellow-500 rounded">🟨 {settings.language === 'zh' ? '字正确但位置错误' : 'Wrong position'}</span>
              </div>
              <p className="mt-3"><strong>🔐 {settings.language === 'zh' ? '密码破译' : 'Mastermind'}:</strong></p>
              <p className="pl-4">
                {settings.language === 'zh'
                  ? '在8次机会内破解4个颜色的密码组合。'
                  : 'Crack the 4-color code in 8 tries.'}
              </p>
              <div className="flex gap-2 pl-4 my-2">
                <span className="text-xs px-2 py-1 bg-green-500 rounded">🟢 {settings.language === 'zh' ? '颜色对且位置对' : 'Correct'}</span>
                <span className="text-xs px-2 py-1 bg-white text-gray-800 rounded">⚪ {settings.language === 'zh' ? '颜色对但位置错' : 'Wrong pos'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Wordle Game */}
            <button
              onClick={() => setGameType('wordle')}
              className={`w-full p-5 rounded-2xl text-left transition-transform hover:scale-[1.02] ${modalBgClass} border ${borderClass}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">📝</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{settings.language === 'zh' ? '猜词游戏' : 'Word Guess'}</h2>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {settings.language === 'zh' ? '6次机会猜出4字成语' : '6 tries to guess 5-letter word'}
                  </p>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Mastermind Game */}
            <button
              onClick={() => setGameType('mastermind')}
              className={`w-full p-5 rounded-2xl text-left transition-transform hover:scale-[1.02] ${modalBgClass} border ${borderClass}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🔐</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{settings.language === 'zh' ? '密码破译' : 'Mastermind'}</h2>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {settings.language === 'zh' ? '8次机会破解颜色密码' : '8 tries to crack color code'}
                  </p>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>

          {/* Settings Row */}
          <div className={`mt-8 flex justify-center gap-4 ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <button onClick={toggleLanguage} className="px-3 py-1 rounded hover:bg-gray-700/30 text-sm font-medium">
              {settings.language === 'en' ? '中文' : 'English'}
            </button>
            <button onClick={toggleTheme} className="px-3 py-1 rounded hover:bg-gray-700/30 text-sm">
              {settings.darkMode ? '☀️' : '🌙'}
            </button>
            <button onClick={toggleSound} className="px-3 py-1 rounded hover:bg-gray-700/30 text-sm">
              {settings.soundEnabled ? '🔊' : '🔇'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Mastermind game
  if (gameType === 'mastermind') {
    return <Mastermind settings={settings} onBack={() => setGameType('menu')} />
  }

  // Wordle game (original)
  return (
    <div className={`min-h-screen flex flex-col items-center justify-between py-4 px-2 ${bgClass} ${textClass}`}>
      {/* Header */}
      <div className="w-full max-w-md">
        <div className={`flex items-center justify-between border-b ${borderClass} pb-3 mb-4`}>
          {/* 左侧按钮 */}
          <div className="flex items-center gap-1">
            <button onClick={() => setGameType('menu')} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded" title={settings.language === 'zh' ? '返回菜单' : 'Back to menu'}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button onClick={() => setShowHelp(true)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button onClick={() => setShowStats(true)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
          </div>

          <h1 className="text-2xl font-bold tracking-wider">{t.title}</h1>

          {/* 右侧按钮 */}
          <div className="flex items-center gap-1">
            <button onClick={toggleSound} className={`w-8 h-8 flex items-center justify-center rounded text-xs ${settings.soundEnabled ? 'text-green-500' : 'text-gray-500'}`}>
              {settings.soundEnabled ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              )}
            </button>
            <button onClick={toggleTheme} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded">
              {settings.darkMode ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <button onClick={toggleLanguage} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded text-xs font-bold">
              {settings.language === 'en' ? '中' : 'EN'}
            </button>
            <button onClick={toggleHardMode} className={`w-8 h-8 flex items-center justify-center rounded text-xs ${settings.hardMode ? 'bg-yellow-500 text-black' : 'hover:bg-gray-700/30'}`}>
              H
            </button>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex justify-center gap-2 mb-2">
          <button
            onClick={switchToDaily}
            className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors ${gameMode === 'daily' ? 'bg-green-600 text-white' : settings.darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}
          >
            {t.daily}
          </button>
          <button
            onClick={switchToPractice}
            className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors ${gameMode === 'practice' ? 'bg-blue-600 text-white' : settings.darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}
          >
            {t.practice}
          </button>
        </div>

        {/* Day Number */}
        {gameMode === 'daily' && (
          <div className="text-center text-xs text-gray-400 mb-2">
            #{dayNumber}
          </div>
        )}
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
                {Array.from({ length: wordLength }).map((_, i) => {
                  const char = word[i] ?? ''
                  const state = guesses[row] ? states[i] : undefined
                  const isFilled = char !== ''
                  const isRevealingCell = isRevealing && guesses[row]
                  const isHint = revealedHints.has(i) && row === guesses.length

                  // For Chinese, don't uppercase; for English, do uppercase
                  const displayChar = char || (isHint && row === guesses.length ? solution[i] : '')
                  const finalChar = settings.language === 'zh' ? displayChar : displayChar.toUpperCase()

                  return (
                    <div
                      key={i}
                      className={[
                        'cell',
                        settings.darkMode ? '' : 'border-gray-400',
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
                      <div className="cell-inner">{finalChar}</div>
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
            <div className={`toast px-4 py-2 rounded-lg font-semibold ${won ? 'bg-green-600' : settings.darkMode ? 'bg-gray-700' : 'bg-gray-600 text-white'}`}>
              {message}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons - Hint and Submit */}
      {!gameOver && (
        <div className="mb-2 flex gap-2">
          <button
            onClick={handleHint}
            disabled={hintsUsed >= wordLength}
            className={`px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
              hintsUsed >= wordLength ? 'bg-gray-700 text-gray-500' : 'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            💡 {t.hint} ({wordLength - hintsUsed})
          </button>
          <button
            onClick={() => handleKeyPress('Enter')}
            disabled={current.length !== wordLength}
            className={`px-6 py-3 rounded-lg text-sm font-bold transition-colors ${
              current.length === wordLength ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-gray-700 text-gray-500'
            }`}
          >
            {t.enter}
          </button>
        </div>
      )}

      {/* Play Again Button (Practice Mode) */}
      {gameOver && gameMode === 'practice' && (
        <div className="mb-2">
          <button
            onClick={playAgain}
            className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition-colors"
          >
            {t.playAgain}
          </button>
        </div>
      )}

      {/* Virtual Keyboard */}
      <div className="w-full max-w-md">
        {settings.language === 'zh' ? (
          // Chinese mode: show IME hint and backspace
          <div className="text-center space-y-3">
            <div className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.useIME || '请使用键盘输入汉字'}
            </div>
            <button
              onClick={() => handleKeyPress('Backspace')}
              className={`px-6 py-3 rounded-lg ${keyBgClass}`}
            >
              <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414-6.414A2 2 0 0110.828 5H19a2 2 0 012 2v10a2 2 0 01-2 2h-8.172a2 2 0 01-1.414-.586L3 12z" />
              </svg>
            </button>
          </div>
        ) : (
          // English mode: show full keyboard
          <div className="space-y-2">
            {keyboardRows.map((row, rowIdx) => (
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
                        keyBgClass,
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
        )}
      </div>

      {/* Countdown */}
      {gameOver && gameMode === 'daily' && (
        <div className="mt-3 text-center text-sm text-gray-400">
          <div>{t.nextWord}</div>
          <div className="text-xl font-mono font-bold">{settings.darkMode ? '' : 'text-gray-900'}{countdown}</div>
        </div>
      )}

      {/* Stats Modal */}
      {showStats && (
        <div className="modal-overlay fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowStats(false)}>
          <div className={`modal-content ${modalBgClass} rounded-2xl p-6 max-w-sm w-full`} onClick={(e) => e.stopPropagation()}>
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
                    className={`h-5 flex items-center px-2 text-xs font-bold ${won && guesses.length === i + 1 && gameOver ? 'bg-green-600' : settings.darkMode ? 'bg-gray-600' : 'bg-gray-400'}`}
                    style={{ width: `${Math.max((count / maxDist) * 100, 8)}%`, minWidth: '30px' }}
                  >
                    {count}
                  </div>
                </div>
              ))}
            </div>

            {/* Countdown in stats */}
            {gameOver && gameMode === 'daily' && (
              <div className="mt-4 text-center">
                <div className="text-sm text-gray-400">{t.nextWord}</div>
                <div className="text-xl font-mono font-bold">{countdown}</div>
              </div>
            )}

            <button onClick={() => setShowStats(false)} className={`mt-4 w-full py-2 rounded-lg ${settings.darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
              {t.close}
            </button>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="modal-overlay fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowHelp(false)}>
          <div className={`modal-content ${modalBgClass} rounded-2xl p-6 max-w-sm w-full max-h-[80vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-center mb-4">{t.howToPlayTitle}</h2>

            <div className="space-y-4 text-sm">
              {t.howToPlayContent.map((line, i) => (
                <p key={i}>{line}</p>
              ))}

              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-600 flex items-center justify-center font-bold text-white">W</div>
                  <span className="text-xs text-gray-300">{t.greenMeaning}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-500 flex items-center justify-center font-bold text-white">O</div>
                  <span className="text-xs text-gray-300">{t.yellowMeaning}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-700 flex items-center justify-center font-bold text-white">R</div>
                  <span className="text-xs text-gray-300">{t.grayMeaning}</span>
                </div>
              </div>
            </div>

            <button onClick={() => setShowHelp(false)} className={`mt-6 w-full py-2 rounded-lg ${settings.darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
              {t.close}
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShare && (
        <div className="modal-overlay fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowShare(false)}>
          <div className={`modal-content ${modalBgClass} rounded-2xl p-6 max-w-sm w-full text-center`} onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-2">{won ? t.excellent : t.niceTry}</h2>
            <p className="text-gray-400 mb-4">
              {won ? `${t.gotIt} ${guesses.length} ${guesses.length === 1 ? t.try : t.tries}!` : `${t.theWordWas} ${solution.toUpperCase()}`}
            </p>
            <div className={`${settings.darkMode ? 'bg-slate-700' : 'bg-gray-200'} rounded-lg p-3 mb-4 font-mono text-sm whitespace-pre text-left`}>
              {generateShareText()}
            </div>
            <button onClick={handleShare} className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition-colors text-white">
              {copied ? t.copied : t.copyShare}
            </button>
            {gameMode === 'practice' && (
              <button onClick={playAgain} className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold text-white">
                {t.playAgain}
              </button>
            )}
            <button onClick={() => setShowShare(false)} className="mt-3 text-gray-400 hover:text-white">
              {t.close}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
