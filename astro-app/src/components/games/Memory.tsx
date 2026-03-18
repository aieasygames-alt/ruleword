import { useState, useCallback, useEffect } from 'react'
import GameGuide from './GameGuide'

type Difficulty = 'easy' | 'medium' | 'hard'
type GameMode = 'daily' | 'practice'

interface Card {
  id: number
  emoji: string
  isFlipped: boolean
  isMatched: boolean
}

interface Stats {
  played: number
  bestMoves: Record<Difficulty, number | null>
}

const STORAGE_KEY = 'memory_save'
const STATS_KEY = 'memory_stats'

const DIFFICULTY_CONFIG = {
  easy: { pairs: 6, label: '简单', labelEn: 'Easy', cols: 4 },
  medium: { pairs: 8, label: '中等', labelEn: 'Medium', cols: 4 },
  hard: { pairs: 10, label: '困难', labelEn: 'Hard', cols: 5 },
}

// 卡牌 emoji 池
const EMOJI_POOL = [
  '🐶', '🐱', '🐼', '🦊', '🦁', '🐸', '🐵', '🐰',
  '🐻', '🐨', '🐯', '🦄', '🐝', '🦋', '🐙', '🦀',
]

// 获取每日种子
function getDailySeed(): number {
  const startDate = new Date('2024-01-01').getTime()
  const now = new Date().setHours(0, 0, 0, 0)
  return Math.floor((now - startDate) / 86400000)
}

// 伪随机数生成器
function seededRandom(seed: number) {
  let s = seed
  return function() {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

// 加载统计
function loadStats(): Stats {
  try {
    const data = localStorage.getItem(STATS_KEY)
    return data ? JSON.parse(data) : { played: 0, bestMoves: { easy: null, medium: null, hard: null } }
  } catch {
    return { played: 0, bestMoves: { easy: null, medium: null, hard: null } }
  }
}

// 保存统计
function saveStats(stats: Stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats))
}

// Fisher-Yates 洗牌
function shuffleArray<T>(array: T[], seed?: number): T[] {
  const arr = [...array]
  const rng = seed !== undefined ? seededRandom(seed) : null

  for (let i = arr.length - 1; i > 0; i--) {
    const random = rng ? rng() : Math.random()
    const j = Math.floor(random * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// 生成卡牌
function generateCards(pairs: number, seed?: number): Card[] {
  const selectedEmojis = shuffleArray(EMOJI_POOL).slice(0, pairs)
  const cardPairs: Card[] = []

  selectedEmojis.forEach((emoji, index) => {
    cardPairs.push({ id: index * 2, emoji, isFlipped: false, isMatched: false })
    cardPairs.push({ id: index * 2 + 1, emoji, isFlipped: false, isMatched: false })
  })

  return shuffleArray(cardPairs, seed)
}

interface MemoryProps {
  settings: {
    language: 'zh' | 'en'
    soundEnabled: boolean
    darkMode: boolean
  }
  onBack: () => void
}

const Memory: React.FC<MemoryProps> = ({ settings, onBack }) => {
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [moves, setMoves] = useState(0)
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [gameMode, setGameMode] = useState<GameMode>('practice')
  const [gameWon, setGameWon] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [timer, setTimer] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [stats, setStats] = useState<Stats>(loadStats)
  const [showGameGuide, setShowGameGuide] = useState(false)

  const config = DIFFICULTY_CONFIG[difficulty]
  const totalPairs = config.pairs

  const t = {
    title: '🎴 Memory',
    daily: settings.language === 'zh' ? '每日' : 'Daily',
    practice: settings.language === 'zh' ? '练习' : 'Practice',
    newGame: settings.language === 'zh' ? '新游戏' : 'New Game',
    moves: settings.language === 'zh' ? '步数' : 'Moves',
    pairs: settings.language === 'zh' ? '配对' : 'Pairs',
    time: settings.language === 'zh' ? '时间' : 'Time',
    youWin: settings.language === 'zh' ? '恭喜你赢了！' : 'You Win!',
    bestMoves: settings.language === 'zh' ? '最佳步数' : 'Best Moves',
    howToPlay: settings.language === 'zh' ? '翻开卡片找到相同的配对' : 'Find matching pairs of cards',
  }

  // 初始化游戏
  const initializeGame = useCallback((mode?: GameMode, diff?: Difficulty) => {
    const newMode = mode || gameMode
    const newDiff = diff || difficulty
    setGameMode(newMode)
    setDifficulty(newDiff)

    const newConfig = DIFFICULTY_CONFIG[newDiff]
    const seed = newMode === 'daily' ? getDailySeed() + Object.keys(DIFFICULTY_CONFIG).indexOf(newDiff) * 1000 : undefined

    setCards(generateCards(newConfig.pairs, seed))
    setFlippedCards([])
    setMatchedPairs(0)
    setMoves(0)
    setGameWon(false)
    setIsLocked(false)
    setTimer(0)
    setIsRunning(false)
  }, [gameMode, difficulty])

  useEffect(() => {
    initializeGame()
  }, [])

  // 计时器
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isRunning && !gameWon) {
      interval = setInterval(() => setTimer(t => t + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, gameWon])

  // 处理卡牌点击
  const handleCardClick = useCallback((cardId: number) => {
    if (isLocked || gameWon) return

    const card = cards.find(c => c.id === cardId)
    if (!card || card.isFlipped || card.isMatched) return

    // 开始计时
    if (!isRunning) setIsRunning(true)

    // 翻开卡牌
    setCards(prev => prev.map(c =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    ))

    const newFlipped = [...flippedCards, cardId]
    setFlippedCards(newFlipped)

    // 检查是否翻开了两张
    if (newFlipped.length === 2) {
      setMoves(m => m + 1)
      setIsLocked(true)

      const [first, second] = newFlipped.map(id => cards.find(c => c.id === id)!)

      if (first.emoji === second.emoji) {
        // 匹配成功
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === first.id || c.id === second.id
              ? { ...c, isMatched: true }
              : c
          ))
          setMatchedPairs(p => p + 1)
          setFlippedCards([])
          setIsLocked(false)
        }, 500)
      } else {
        // 匹配失败
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.id === first.id || c.id === second.id
              ? { ...c, isFlipped: false }
              : c
          ))
          setFlippedCards([])
          setIsLocked(false)
        }, 1000)
      }
    }
  }, [cards, flippedCards, isLocked, gameWon, isRunning])

  // 检查胜利
  useEffect(() => {
    if (matchedPairs === totalPairs && totalPairs > 0) {
      setGameWon(true)
      setIsRunning(false)

      const newStats = { ...stats }
      newStats.played++
      if (!newStats.bestMoves[difficulty] || moves < newStats.bestMoves[difficulty]!) {
        newStats.bestMoves[difficulty] = moves
      }
      setStats(newStats)
      saveStats(newStats)
    }
  }, [matchedPairs, totalPairs, stats, difficulty, moves])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'

  return (
    <div className={`min-h-screen flex flex-col items-center py-4 px-2 ${bgClass} ${textClass}`}>
      {/* Header */}
      <div className="w-full max-w-lg mb-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onBack} className={`p-2 rounded-lg ${settings.darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">{t.title}</h1>
          <button onClick={() => setShowGameGuide(true)} className={`p-2 rounded-lg ${settings.darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center gap-2 mb-3">
          {(['daily', 'practice'] as GameMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => initializeGame(mode, difficulty)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                gameMode === mode
                  ? (mode === 'daily' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white')
                  : settings.darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {mode === 'daily' ? t.daily : t.practice}
            </button>
          ))}
        </div>

        {/* Difficulty Selector */}
        <div className="flex justify-center gap-2 mb-3">
          {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map(diff => (
            <button
              key={diff}
              onClick={() => initializeGame(gameMode, diff)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                difficulty === diff
                  ? 'bg-green-600 text-white'
                  : settings.darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {settings.language === 'zh' ? DIFFICULTY_CONFIG[diff].label : DIFFICULTY_CONFIG[diff].labelEn}
            </button>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="flex justify-center gap-4 mb-3">
          <div className={`${cardBgClass} rounded-lg px-3 py-1.5 text-center`}>
            <div className="text-xs opacity-70">{t.moves}</div>
            <div className="font-bold">{moves}</div>
          </div>
          <div className={`${cardBgClass} rounded-lg px-3 py-1.5 text-center`}>
            <div className="text-xs opacity-70">{t.pairs}</div>
            <div className="font-bold">{matchedPairs}/{totalPairs}</div>
          </div>
          <div className={`${cardBgClass} rounded-lg px-3 py-1.5 text-center`}>
            <div className="text-xs opacity-70">{t.time}</div>
            <div className="font-bold">{formatTime(timer)}</div>
          </div>
          <button
            onClick={() => initializeGame()}
            className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-medium"
          >
            🔄
          </button>
        </div>

        <p className="text-center text-xs opacity-70">{t.howToPlay}</p>
      </div>

      {/* Game Board */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${config.cols}, 1fr)` }}
        >
          {cards.map(card => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={card.isMatched || card.isFlipped}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl text-3xl sm:text-4xl transition-all duration-300 transform ${
                card.isMatched
                  ? 'bg-green-500 scale-95 opacity-70'
                  : card.isFlipped
                  ? `${settings.darkMode ? 'bg-slate-600' : 'bg-white'} rotate-0`
                  : `${settings.darkMode ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-blue-400 to-purple-500'} hover:scale-105`
              }`}
            >
              {card.isFlipped || card.isMatched ? card.emoji : '❓'}
            </button>
          ))}
        </div>
      </div>

      {/* Win Message */}
      {gameWon && (
        <div className={`mt-6 ${cardBgClass} rounded-xl p-4 text-center`}>
          <div className="text-3xl mb-2">🎉</div>
          <div className="font-bold text-green-500 mb-2">{t.youWin}</div>
          <div className="text-sm mb-1">{t.moves}: {moves}</div>
          <div className="text-sm mb-4">{t.time}: {formatTime(timer)}</div>
          {stats.bestMoves[difficulty] && (
            <div className="text-xs text-green-500 mb-4">
              {t.bestMoves}: {stats.bestMoves[difficulty]}
            </div>
          )}
          <button
            onClick={() => initializeGame()}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium"
          >
            {t.newGame}
          </button>
        </div>
      )}

      {/* Game Guide */}
      {showGameGuide && (
        <GameGuide
          language={settings.language}
          darkMode={settings.darkMode}
          onClose={() => setShowGameGuide(false)}
          initialGame="memory"
        />
      )}
    </div>
  )
}

export default Memory
