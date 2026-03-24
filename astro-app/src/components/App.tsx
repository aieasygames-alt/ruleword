import { useEffect, useState, useCallback, useRef } from 'react'
import { VALID_WORDS, getWordBySeed } from './words'
import { IDIOMS, getDailyIdiom, getRandomIdiom, getIdiomBySeed } from './idioms'
import type { CellState } from './types'
import { getTranslation, type Language } from './locales'
import Mastermind from './Mastermind'
import WordList from './WordList'
import Dictionary from './Dictionary'
import Crosswordle from './Crosswordle'
import Sudoku from './Sudoku'
import Minesweeper from './Minesweeper'
import Game2048 from './Game2048'
import Snake from './Snake'
import Memory from './Memory'
import Tetris from './Tetris'
import TicTacToe from './TicTacToe'
import ConnectFour from './ConnectFour'
import WhackAMole from './WhackAMole'
import SimonSays from './SimonSays'
import FifteenPuzzle from './FifteenPuzzle'
import LightsOut from './LightsOut'
import BrickBreaker from './BrickBreaker'
import Bullpen from './Bullpen'
import Nonogram from './Nonogram'
import Kakuro from './Kakuro'
import Hitori from './Hitori'
import Skyscrapers from './Skyscrapers'
import KenKen from './KenKen'
import Threes from './Threes'
import Suguru from './Suguru'
import Hashiwokakero from './Hashiwokakero'
import Slitherlink from './Slitherlink'
import Binary from './Binary'
import GameGuide from './GameGuide'
import Feedback from './Feedback'
import Home from './Home'
import { usePageMeta } from './hooks/usePageMeta'

type GameType = 'menu' | 'wordle' | 'mastermind' | 'dictionary' | 'crosswordle' | 'sudoku' | 'minesweeper' | 'game2048' | 'snake' | 'memory' | 'tetris' | 'tictactoe' | 'connectfour' | 'whackamole' | 'simonsays' | 'fifteenpuzzle' | 'lightsout' | 'brickbreaker' | 'bullpen' | 'nonogram' | 'kakuro' | 'hitori' | 'skyscrapers' | 'kenken' | 'threes' | 'suguru' | 'hashiwokakero' | 'slitherlink' | 'binary'

// 根据种子获取单词/成语
function getWordBySeedWithLang(seed: number, language: Language): string {
  if (language === 'zh') {
    return getIdiomBySeed(seed)
  }
  return getWordBySeed(seed)
}

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
type GameMode = 'daily' | 'practice' | 'challenge'

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
  } catch {
    // Invalid JSON, return null
  }
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
  } catch {
    // Invalid JSON, return defaults
  }
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
  } catch {
    // Invalid JSON, return defaults
  }
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
  const [showHowToPlay, setShowHowToPlay] = useState(false)
  const [showGameGuide, setShowGameGuide] = useState(false)

  // Update page meta based on current game
  usePageMeta(gameType === 'menu' ? undefined : gameType, settings.language)
  const [challengeSeed, setChallengeSeed] = useState<number | null>(null)

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
  const [showWordList, setShowWordList] = useState(false)
  const [copied, setCopied] = useState(false)
  const [challengeCopied, setChallengeCopied] = useState(false)
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

  // 解析 URL 参数，处理挑战模式
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const challenge = params.get('challenge')
    const seed = params.get('seed')

    if (challenge === 'wordle' && seed) {
      const seedNum = parseInt(seed, 10)
      if (!isNaN(seedNum)) {
        setChallengeSeed(seedNum)
        setGameMode('challenge')
        setSolution(getWordBySeedWithLang(seedNum, settings.language))
        // 清除 URL 参数，避免刷新时重置
        window.history.replaceState({}, '', window.location.pathname)
      }
    }
  }, [settings.language])

  const initializedRef = useRef(false)
  const hiddenInputRef = useRef<HTMLInputElement>(null)

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

  // 生成挑战链接
  const generateChallengeLink = useCallback(() => {
    const seed = Math.floor(Math.random() * 1000000)
    const baseUrl = window.location.origin
    return `${baseUrl}?challenge=wordle&seed=${seed}`
  }, [])

  // 复制挑战链接
  const handleChallengeShare = useCallback(() => {
    const link = generateChallengeLink()
    navigator.clipboard.writeText(link).then(() => {
      setChallengeCopied(true)
      setTimeout(() => setChallengeCopied(false), 2000)
    })
  }, [generateChallengeLink])

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
      } else if (/^[a-zA-Z]$/.test(key) && settings.language === 'en') {
        // English mode only: accept English letters
        // Chinese mode: input is handled by hidden input's onChange
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

  // 中文模式下点击游戏区域时聚焦隐藏输入框
  const focusHiddenInput = () => {
    if (settings.language === 'zh' && hiddenInputRef.current && !gameOver) {
      hiddenInputRef.current.focus()
    }
  }

  // 处理隐藏输入框的输入
  const handleHiddenInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value && /[\u4e00-\u9fff]/.test(value[value.length - 1])) {
      // 只处理新输入的中文字符
      const newChar = value[value.length - 1]
      if (current.length < wordLength) {
        setCurrent((c) => c + newChar)
        playSound('key', settings.soundEnabled)
      }
    }
    // 清空输入框以便继续输入
    e.target.value = ''
  }, [current, wordLength, settings.soundEnabled])

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

          {/* Dictionary Button */}
          <button
            onClick={() => setGameType('dictionary')}
            className={`w-full p-3 rounded-xl text-left transition-transform hover:scale-[1.02] ${modalBgClass} border ${borderClass} mb-4`}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">📖</div>
              <div className="flex-1">
                <h2 className="text-base font-bold">{settings.language === 'zh' ? '词库词典' : 'Dictionary'}</h2>
                <p className={`text-xs ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {settings.language === 'zh' ? '浏览所有成语和单词' : 'Browse all words and idioms'}
                </p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* How to Play Section */}
          <div className={`mb-6 rounded-xl ${modalBgClass} border ${borderClass} text-left overflow-hidden`}>
            <button
              onClick={() => setShowHowToPlay(!showHowToPlay)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-500/10 transition-colors"
            >
              <h3 className="font-bold flex items-center gap-2">
                <span>📖</span>
                {settings.language === 'zh' ? '游戏玩法' : 'How to Play'}
              </h3>
              <svg
                className={`w-5 h-5 transition-transform ${showHowToPlay ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showHowToPlay && (
              <>
                <div className={`px-4 pb-4 text-sm space-y-3 ${settings.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {/* Word Guess */}
                  <div>
                    <p className="font-semibold">📝 {settings.language === 'zh' ? '猜词游戏' : 'Word Guess'}:</p>
                    <p className="pl-4 mt-1">
                      {settings.language === 'zh'
                        ? '在6次机会内猜出4字成语。输入汉字后按回车提交。'
                        : 'Guess the 5-letter word in 6 tries. Type and press Enter to submit.'}
                    </p>
                    <div className="flex gap-2 pl-4 mt-2">
                      <span className="text-xs px-2 py-1 bg-green-600 rounded">🟩 {settings.language === 'zh' ? '正确位置' : 'Correct'}</span>
                      <span className="text-xs px-2 py-1 bg-yellow-500 rounded">🟨 {settings.language === 'zh' ? '错误位置' : 'Wrong pos'}</span>
                    </div>
                  </div>

                  {/* Mastermind */}
                  <div>
                    <p className="font-semibold">🔐 {settings.language === 'zh' ? '密码破译' : 'Mastermind'}:</p>
                    <p className="pl-4 mt-1">
                      {settings.language === 'zh'
                        ? '在8次机会内破解4个颜色的密码组合。'
                        : 'Crack the 4-color code in 8 tries.'}
                    </p>
                    <div className="flex gap-2 pl-4 mt-2">
                      <span className="text-xs px-2 py-1 bg-green-500 rounded">🟢 {settings.language === 'zh' ? '正确' : 'Correct'}</span>
                      <span className="text-xs px-2 py-1 bg-white text-gray-800 rounded">⚪ {settings.language === 'zh' ? '位置错误' : 'Wrong pos'}</span>
                      <span className="text-xs px-2 py-1 bg-red-600 rounded text-white">🔴 {settings.language === 'zh' ? '错误' : 'Wrong'}</span>
                    </div>
                  </div>

                  {/* Crosswordle */}
                  <div>
                    <p className="font-semibold">🔤 {settings.language === 'zh' ? '字母交换填字' : 'Crosswordle'}:</p>
                    <p className="pl-4 mt-1">
                      {settings.language === 'zh'
                        ? '通过交换字母位置解开交叉单词谜题，在限制次数内完成。'
                        : 'Swap letters to solve crossword puzzles. Complete within the swap limit.'}
                    </p>
                    <div className="flex gap-2 pl-4 mt-2">
                      <span className="text-xs px-2 py-1 bg-green-500 rounded">🟢 {settings.language === 'zh' ? '正确' : 'Correct'}</span>
                      <span className="text-xs px-2 py-1 bg-yellow-500 rounded">🟡 {settings.language === 'zh' ? '在词中' : 'In word'}</span>
                      <span className="text-xs px-2 py-1 bg-gray-400 rounded">⬜ {settings.language === 'zh' ? '错误' : 'Wrong'}</span>
                    </div>
                  </div>

                  {/* Sudoku */}
                  <div>
                    <p className="font-semibold">🧩 Sudoku:</p>
                    <p className="pl-4 mt-1">
                      {settings.language === 'zh'
                        ? '在9×9网格中填入1-9，每行、每列、每个3×3宫格内数字不重复。'
                        : 'Fill 1-9 in a 9×9 grid. Each row, column, and 3×3 box must contain unique digits.'}
                    </p>
                    <div className="flex gap-2 pl-4 mt-2">
                      <span className="text-xs px-2 py-1 bg-blue-500 rounded text-white">💡 {settings.language === 'zh' ? '提示' : 'Hint'}</span>
                      <span className="text-xs px-2 py-1 bg-yellow-500 rounded">📝 {settings.language === 'zh' ? '笔记' : 'Notes'}</span>
                      <span className="text-xs px-2 py-1 bg-red-500 rounded text-white">🔴 {settings.language === 'zh' ? '错误' : 'Error'}</span>
                    </div>
                  </div>
                </div>

                {/* Detailed Guide Button */}
                <button
                  onClick={() => setShowGameGuide(true)}
                  className={`w-full mt-4 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                    settings.darkMode
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {settings.language === 'zh' ? '查看详细游戏指南' : 'View Detailed Game Guide'}
                </button>
              </>
            )}
          </div>

          <div className="space-y-4">
            {/* Word Guess */}
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

            {/* Crosswordle */}
            <button
              onClick={() => setGameType('crosswordle')}
              className={`w-full p-5 rounded-2xl text-left transition-transform hover:scale-[1.02] ${modalBgClass} border ${borderClass}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🔤</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">Crosswordle</h2>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {settings.language === 'zh' ? '字母交换填字游戏' : 'Swap letters to solve words'}
                  </p>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Sudoku */}
            <button
              onClick={() => setGameType('sudoku')}
              className={`w-full p-5 rounded-2xl text-left transition-transform hover:scale-[1.02] ${modalBgClass} border ${borderClass}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🧩</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">Sudoku</h2>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {settings.language === 'zh' ? '经典数字逻辑游戏' : 'Classic number logic puzzle'}
                  </p>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Mastermind */}
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

            {/* Minesweeper */}
            <button
              onClick={() => setGameType('minesweeper')}
              className={`w-full p-5 rounded-2xl text-left transition-transform hover:scale-[1.02] ${modalBgClass} border ${borderClass}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🧨</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{settings.language === 'zh' ? '扫雷' : 'Minesweeper'}</h2>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {settings.language === 'zh' ? '经典扫雷益智游戏' : 'Classic mine-finding puzzle'}
                  </p>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Bullpen */}
            <button
              onClick={() => setGameType('bullpen')}
              className={`w-full p-5 rounded-2xl text-left transition-transform hover:scale-[1.02] ${modalBgClass} border ${borderClass}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🐂</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{settings.language === 'zh' ? '牛栏逻辑' : 'Bullpen'}</h2>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {settings.language === 'zh' ? '数独与扫雷的结合' : 'Sudoku meets Minesweeper'}
                  </p>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* 2048 */}
            <button
              onClick={() => setGameType('game2048')}
              className={`w-full p-5 rounded-2xl text-left transition-transform hover:scale-[1.02] ${modalBgClass} border ${borderClass}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🧱</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">2048</h2>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {settings.language === 'zh' ? '数字合并挑战' : 'Merge numbers challenge'}
                  </p>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Snake */}
            <button
              onClick={() => setGameType('snake')}
              className={`w-full p-5 rounded-2xl text-left transition-transform hover:scale-[1.02] ${modalBgClass} border ${borderClass}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🐍</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{settings.language === 'zh' ? '贪吃蛇' : 'Snake'}</h2>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {settings.language === 'zh' ? '经典贪吃蛇游戏' : 'Classic snake game'}
                  </p>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Memory */}
            <button
              onClick={() => setGameType('memory')}
              className={`w-full p-5 rounded-2xl text-left transition-transform hover:scale-[1.02] ${modalBgClass} border ${borderClass}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🃏</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{settings.language === 'zh' ? '记忆翻牌' : 'Memory'}</h2>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {settings.language === 'zh' ? '翻转卡片找到配对' : 'Flip cards to find pairs'}
                  </p>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Tetris */}
            <button
              onClick={() => setGameType('tetris')}
              className={`w-full p-5 rounded-2xl text-left transition-transform hover:scale-[1.02] ${modalBgClass} border ${borderClass}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🧱</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">Tetris</h2>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {settings.language === 'zh' ? '经典俄罗斯方块' : 'Classic block puzzle'}
                  </p>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Tic-Tac-Toe */}
            <button
              onClick={() => setGameType('tictactoe')}
              className={`w-full p-5 rounded-2xl text-left transition-transform hover:scale-[1.02] ${modalBgClass} border ${borderClass}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">⭕</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{settings.language === 'zh' ? '井字棋' : 'Tic-Tac-Toe'}</h2>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {settings.language === 'zh' ? '经典双人策略游戏' : 'Classic strategy game'}
                  </p>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Connect Four */}
            <button
              onClick={() => setGameType('connectfour')}
              className={`w-full p-5 rounded-2xl text-left transition-transform hover:scale-[1.02] ${modalBgClass} border ${borderClass}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🔴</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{settings.language === 'zh' ? '四子棋' : 'Connect Four'}</h2>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {settings.language === 'zh' ? '连成四子获胜' : 'Connect four to win'}
                  </p>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Whack-a-Mole */}
            <button
              onClick={() => setGameType('whackamole')}
              className={`w-full p-5 rounded-2xl text-left transition-transform hover:scale-[1.02] ${modalBgClass} border ${borderClass}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🔨</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{settings.language === 'zh' ? '打地鼠' : 'Whack-a-Mole'}</h2>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {settings.language === 'zh' ? '快速反应打地鼠' : 'Quick reflexes game'}
                  </p>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Simon Says */}
            <button
              onClick={() => setGameType('simonsays')}
              className={`w-full p-5 rounded-2xl text-left transition-transform hover:scale-[1.02] ${modalBgClass} border ${borderClass}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🔴</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{settings.language === 'zh' ? '西蒙说' : 'Simon Says'}</h2>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {settings.language === 'zh' ? '记忆颜色序列' : 'Memory color sequence'}
                  </p>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* 15 Puzzle */}
            <button
              onClick={() => setGameType('fifteenpuzzle')}
              className={`w-full p-5 rounded-2xl text-left transition-transform hover:scale-[1.02] ${modalBgClass} border ${borderClass}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🔢</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{settings.language === 'zh' ? '数字推盘' : '15 Puzzle'}</h2>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {settings.language === 'zh' ? '滑动数字排序' : 'Slide numbers in order'}
                  </p>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Lights Out */}
            <button
              onClick={() => setGameType('lightsout')}
              className={`w-full p-5 rounded-2xl text-left transition-transform hover:scale-[1.02] ${modalBgClass} border ${borderClass}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">💡</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{settings.language === 'zh' ? '熄灯游戏' : 'Lights Out'}</h2>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {settings.language === 'zh' ? '关闭所有灯泡' : 'Turn off all lights'}
                  </p>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Brick Breaker */}
            <button
              onClick={() => setGameType('brickbreaker')}
              className={`w-full p-5 rounded-2xl text-left transition-transform hover:scale-[1.02] ${modalBgClass} border ${borderClass}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🏓</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{settings.language === 'zh' ? '打砖块' : 'Brick Breaker'}</h2>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {settings.language === 'zh' ? '经典弹球游戏' : 'Classic ball and paddle'}
                  </p>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Nonogram */}
            <button
              onClick={() => setGameType('nonogram')}
              className={`w-full p-5 rounded-2xl text-left transition-transform hover:scale-[1.02] ${modalBgClass} border ${borderClass}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🖼️</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{settings.language === 'zh' ? '数织' : 'Nonogram'}</h2>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {settings.language === 'zh' ? '填充格子画出图案' : 'Fill cells to reveal picture'}
                  </p>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Kakuro */}
            <button
              onClick={() => setGameType('kakuro')}
              className={`w-full p-5 rounded-2xl text-left transition-transform hover:scale-[1.02] ${modalBgClass} border ${borderClass}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">➕</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{settings.language === 'zh' ? '数和' : 'Kakuro'}</h2>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {settings.language === 'zh' ? '填数字使和等于提示' : 'Fill numbers to match sums'}
                  </p>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Hitori */}
            <button
              onClick={() => setGameType('hitori')}
              className={`w-full p-5 rounded-2xl text-left transition-transform hover:scale-[1.02] ${modalBgClass} border ${borderClass}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">⬛</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{settings.language === 'zh' ? '数一' : 'Hitori'}</h2>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {settings.language === 'zh' ? '涂黑数字使行列无重复' : 'Shade cells to remove duplicates'}
                  </p>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Skyscrapers */}
            <button
              onClick={() => setGameType('skyscrapers')}
              className={`w-full p-5 rounded-2xl text-left transition-transform hover:scale-[1.02] ${modalBgClass} border ${borderClass}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🏙️</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{settings.language === 'zh' ? '摩天大楼' : 'Skyscrapers'}</h2>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {settings.language === 'zh' ? '根据高度提示排列数字' : 'Place buildings by visibility'}
                  </p>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* KenKen */}
            <button
              onClick={() => setGameType('kenken')}
              className={`w-full p-5 rounded-2xl text-left transition-transform hover:scale-[1.02] ${modalBgClass} border ${borderClass}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🔢</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{settings.language === 'zh' ? '算独' : 'KenKen'}</h2>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {settings.language === 'zh' ? '结合四则运算的数独' : 'Sudoku with math operations'}
                  </p>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Threes */}
            <button
              onClick={() => setGameType('threes')}
              className={`w-full p-5 rounded-2xl text-left transition-transform hover:scale-[1.02] ${modalBgClass} border ${borderClass}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">3️⃣</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{settings.language === 'zh' ? '三消数字' : 'Threes'}</h2>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {settings.language === 'zh' ? '滑动合并数字挑战' : 'Slide and merge numbers'}
                  </p>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Suguru */}
            <button
              onClick={() => setGameType('suguru')}
              className={`w-full p-5 rounded-2xl text-left transition-transform hover:scale-[1.02] ${modalBgClass} border ${borderClass}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🧩</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{settings.language === 'zh' ? '数块' : 'Suguru'}</h2>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {settings.language === 'zh' ? '区域内填1-N不重复' : 'Fill regions with unique numbers'}
                  </p>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Hashiwokakero */}
            <button
              onClick={() => setGameType('hashiwokakero')}
              className={`w-full p-5 rounded-2xl text-left transition-transform hover:scale-[1.02] ${modalBgClass} border ${borderClass}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🌉</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{settings.language === 'zh' ? '桥梁' : 'Bridges'}</h2>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {settings.language === 'zh' ? '连接岛屿形成通路' : 'Connect islands with bridges'}
                  </p>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Slitherlink */}
            <button
              onClick={() => setGameType('slitherlink')}
              className={`w-full p-5 rounded-2xl text-left transition-transform hover:scale-[1.02] ${modalBgClass} border ${borderClass}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">⭕</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{settings.language === 'zh' ? '连环线' : 'Slitherlink'}</h2>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {settings.language === 'zh' ? '画线围成数字提示的环' : 'Draw a single loop around clues'}
                  </p>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Binary */}
            <button
              onClick={() => setGameType('binary')}
              className={`w-full p-5 rounded-2xl text-left transition-transform hover:scale-[1.02] ${modalBgClass} border ${borderClass}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">01️⃣</div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{settings.language === 'zh' ? '0和1' : 'Binary'}</h2>
                  <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {settings.language === 'zh' ? '填充二进制使行列平衡' : 'Fill 0s and 1s, no three in a row'}
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
          <Feedback language={settings.language} inline />
        </div>
      </div>

      {/* Game Guide Modal */}
      {showGameGuide && (
        <GameGuide
          language={settings.language}
          darkMode={settings.darkMode}
          onClose={() => setShowGameGuide(false)}
        />
      )}
    </div>
  )
  }

  // Mastermind game
  if (gameType === 'mastermind') {
    return <Mastermind settings={settings} onBack={() => setGameType('menu')} />
  }

  // Dictionary page
  if (gameType === 'dictionary') {
    return <Dictionary settings={settings} onBack={() => setGameType('menu')} />
  }

  // Crosswordle game
  if (gameType === 'crosswordle') {
    return <Crosswordle settings={settings} onBack={() => setGameType('menu')} />
  }

  // Sudoku game
  if (gameType === 'sudoku') {
    return <Sudoku settings={settings} onBack={() => setGameType('menu')} />
  }

  // Minesweeper game
  if (gameType === 'minesweeper') {
    return <Minesweeper settings={settings} onBack={() => setGameType('menu')} />
  }

  // 2048 game
  if (gameType === 'game2048') {
    return <Game2048 settings={settings} onBack={() => setGameType('menu')} />
  }

  // Snake game
  if (gameType === 'snake') {
    return <Snake settings={settings} onBack={() => setGameType('menu')} />
  }

  // Memory game
  if (gameType === 'memory') {
    return <Memory settings={settings} onBack={() => setGameType('menu')} />
  }

  // Tetris game
  if (gameType === 'tetris') {
    return <Tetris settings={settings} onBack={() => setGameType('menu')} />
  }

  // Tic-Tac-Toe game
  if (gameType === 'tictactoe') {
    return <TicTacToe settings={settings} onBack={() => setGameType('menu')} />
  }

  // Connect Four game
  if (gameType === 'connectfour') {
    return <ConnectFour settings={settings} onBack={() => setGameType('menu')} />
  }

  // Whack-a-Mole game
  if (gameType === 'whackamole') {
    return <WhackAMole settings={settings} onBack={() => setGameType('menu')} />
  }

  // Simon Says game
  if (gameType === 'simonsays') {
    return <SimonSays settings={settings} onBack={() => setGameType('menu')} />
  }

  // 15 Puzzle game
  if (gameType === 'fifteenpuzzle') {
    return <FifteenPuzzle settings={settings} onBack={() => setGameType('menu')} />
  }

  // Lights Out game
  if (gameType === 'lightsout') {
    return <LightsOut settings={settings} onBack={() => setGameType('menu')} />
  }

  // Brick Breaker game
  if (gameType === 'brickbreaker') {
    return <BrickBreaker settings={settings} onBack={() => setGameType('menu')} />
  }

  // Bullpen game
  if (gameType === 'bullpen') {
    return <Bullpen settings={settings} onBack={() => setGameType('menu')} />
  }

  // Nonogram game
  if (gameType === 'nonogram') {
    return <Nonogram settings={settings} onBack={() => setGameType('menu')} />
  }

  // Kakuro game
  if (gameType === 'kakuro') {
    return <Kakuro settings={settings} onBack={() => setGameType('menu')} />
  }

  // Hitori game
  if (gameType === 'hitori') {
    return <Hitori settings={settings} onBack={() => setGameType('menu')} />
  }

  // Skyscrapers game
  if (gameType === 'skyscrapers') {
    return <Skyscrapers settings={settings} onBack={() => setGameType('menu')} />
  }

  // KenKen game
  if (gameType === 'kenken') {
    return <KenKen settings={settings} onBack={() => setGameType('menu')} />
  }

  // Threes game
  if (gameType === 'threes') {
    return <Threes settings={settings} onBack={() => setGameType('menu')} />
  }

  // Suguru game
  if (gameType === 'suguru') {
    return <Suguru settings={settings} onBack={() => setGameType('menu')} />
  }

  // Hashiwokakero game
  if (gameType === 'hashiwokakero') {
    return <Hashiwokakero settings={settings} onBack={() => setGameType('menu')} />
  }

  // Slitherlink game
  if (gameType === 'slitherlink') {
    return <Slitherlink settings={settings} onBack={() => setGameType('menu')} />
  }

  // Binary game
  if (gameType === 'binary') {
    return <Binary settings={settings} onBack={() => setGameType('menu')} />
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
            <button onClick={() => setShowGameGuide(true)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded" title={settings.language === 'zh' ? '详细指南' : 'Game Guide'}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </button>
            <button onClick={() => setShowStats(true)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
            <button onClick={() => setShowWordList(true)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded" title={settings.language === 'zh' ? '词库' : 'Word List'}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
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

      {/* Hidden input for Chinese IME */}
      {settings.language === 'zh' && (
        <input
          ref={hiddenInputRef}
          type="text"
          onChange={handleHiddenInput}
          className="absolute opacity-0 pointer-events-none"
          style={{ width: 0, height: 0 }}
          inputMode="text"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        />
      )}

      {/* Game Board */}
      <div
        className="flex-1 flex flex-col items-center justify-center"
        onClick={focusHiddenInput}
      >
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
            <button
              onClick={focusHiddenInput}
              className={`text-sm px-4 py-2 rounded-lg ${settings.darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-colors`}
            >
              {t.useIME || '请使用键盘输入汉字'}
            </button>
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
            <button onClick={handleChallengeShare} className="mt-3 w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold transition-colors text-white">
              {challengeCopied
                ? (settings.language === 'zh' ? '链接已复制!' : 'Link copied!')
                : (settings.language === 'zh' ? '🔗 挑战好友' : '🔗 Challenge Friends')}
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

      {/* Word List Modal */}
      {showWordList && (
        <WordList
          language={settings.language}
          darkMode={settings.darkMode}
          onClose={() => setShowWordList(false)}
        />
      )}

      {/* Game Guide Modal */}
      {showGameGuide && (
        <GameGuide
          language={settings.language}
          darkMode={settings.darkMode}
          onClose={() => setShowGameGuide(false)}
          initialGame="wordle"
        />
      )}
    </div>
  )
}
