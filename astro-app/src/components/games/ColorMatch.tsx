import { useState, useCallback, useEffect, useRef } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type Props = {
  settings: Settings
  onBack: () => void
  toggleLanguage: () => void
}

type GameMode = 'stroop' | 'memory' | 'speed'

const COLORS = [
  { name: 'RED', bg: 'bg-red-500', text: 'text-red-500' },
  { name: 'BLUE', bg: 'bg-blue-500', text: 'text-blue-500' },
  { name: 'GREEN', bg: 'bg-green-500', text: 'text-green-500' },
  { name: 'YELLOW', bg: 'bg-yellow-500', text: 'text-yellow-500' },
  { name: 'PURPLE', bg: 'bg-purple-500', text: 'text-purple-500' },
  { name: 'ORANGE', bg: 'bg-orange-500', text: 'text-orange-500' },
]

const COLOR_NAMES_EN = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE']
const COLOR_NAMES_ZH = ['红', '蓝', '绿', '黄', '紫', '橙']

export default function ColorMatch({ settings, onBack, toggleLanguage }: Props) {
  const [gameMode, setGameMode] = useState<GameMode>('stroop')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [streak, setStreak] = useState(0)

  // Stroop 模式
  const [displayedWord, setDisplayedWord] = useState('')
  const [displayedColor, setDisplayedColor] = useState(0)
  const [targetColor, setTargetColor] = useState(0)
  const [options, setOptions] = useState<number[]>([])

  const startTimeRef = useRef(Date.now())

  const t = (en: string, zh: string) => settings.language === 'zh' ? zh : en
  const colorNames = settings.language === 'zh' ? COLOR_NAMES_ZH : COLOR_NAMES_EN

  // 生成新题目
  const generateQuestion = useCallback(() => {
    const wordIndex = Math.floor(Math.random() * COLORS.length)
    const colorIndex = Math.floor(Math.random() * COLORS.length)

    setDisplayedWord(colorNames[wordIndex])
    setDisplayedColor(colorIndex)
    setTargetColor(colorIndex)

    // 生成选项
    const opts = [colorIndex]
    while (opts.length < 4) {
      const rand = Math.floor(Math.random() * COLORS.length)
      if (!opts.includes(rand)) {
        opts.push(rand)
      }
    }
    // 打乱选项
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[opts[i], opts[j]] = [opts[j], opts[i]]
    }
    setOptions(opts)
  }, [colorNames])

  // 开始游戏
  const startGame = useCallback(() => {
    setIsPlaying(true)
    setIsFinished(false)
    setScore(0)
    setCorrectCount(0)
    setWrongCount(0)
    setStreak(0)
    setTimeLeft(30)
    startTimeRef.current = Date.now()
    generateQuestion()
  }, [generateQuestion])

  // 计时器
  useEffect(() => {
    if (!isPlaying || isFinished) return

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsFinished(true)
          setIsPlaying(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying, isFinished])

  // 选择答案
  const handleAnswer = (colorIndex: number) => {
    if (!isPlaying) return

    if (colorIndex === targetColor) {
      setCorrectCount(prev => prev + 1)
      setStreak(prev => prev + 1)
      const bonus = streak >= 5 ? 20 : streak >= 3 ? 10 : 0
      setScore(prev => prev + 10 + bonus)
    } else {
      setWrongCount(prev => prev + 1)
      setStreak(0)
      setScore(prev => Math.max(0, prev - 5))
    }

    generateQuestion()
  }

  const accuracy = correctCount + wrongCount > 0
    ? Math.round((correctCount / (correctCount + wrongCount)) * 100)
    : 0

  return (
    <div className={`min-h-screen ${settings.darkMode ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <span>←</span>
              <span className="hidden sm:inline">{t('Back', '返回')}</span>
            </button>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span>🎨</span>
              {t('Color Match', '颜色匹配')}
            </h1>
          </div>
          <button
            onClick={toggleLanguage}
            className="px-2 py-1 bg-slate-700 rounded text-sm"
          >
            {settings.language === 'en' ? '中文' : 'EN'}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Setup */}
        {!isPlaying && !isFinished && (
          <>
            <div className="bg-slate-800 rounded-2xl p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">{t('How to Play', '玩法说明')}</h2>
              <p className="text-slate-400 leading-relaxed">
                {t(
                  'Identify the COLOR of the word, not the word itself! This is the famous Stroop Effect test. Choose the color that matches what you SEE, not what you READ.',
                  '识别单词的颜色，而不是单词本身！这是著名的斯特鲁普效应测试。选择你看到的颜色，而不是你读到的文字。'
                )}
              </p>
            </div>

            <button
              onClick={startGame}
              className="w-full py-4 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-xl transition-colors"
            >
              {t('Start Game', '开始游戏')}
            </button>
          </>
        )}

        {/* Game */}
        {isPlaying && (
          <>
            {/* Stats */}
            <div className="flex justify-between mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{score}</div>
                <div className="text-sm text-slate-400">{t('Score', '得分')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">{timeLeft}</div>
                <div className="text-sm text-slate-400">{t('Seconds', '秒')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">🔥{streak}</div>
                <div className="text-sm text-slate-400">{t('Streak', '连击')}</div>
              </div>
            </div>

            {/* Question */}
            <div className="bg-slate-800 rounded-2xl p-8 text-center mb-6">
              <p className="text-slate-400 mb-4">
                {t('What COLOR is this word?', '这个单词是什么颜色？')}
              </p>
              <div
                className={`text-5xl sm:text-6xl font-bold mb-8 ${COLORS[displayedColor].text}`}
              >
                {displayedWord}
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    className={`py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 ${COLORS[opt].bg} text-white`}
                  >
                    {colorNames[opt]}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex justify-center gap-8 text-slate-400 text-sm">
              <span>✓ {correctCount}</span>
              <span>✗ {wrongCount}</span>
              <span>{accuracy}%</span>
            </div>
          </>
        )}

        {/* Results */}
        {isFinished && (
          <div className="text-center">
            <div className="bg-slate-800 rounded-2xl p-8 mb-6">
              <h2 className="text-3xl font-bold mb-6">
                {t('Time\'s Up!', '时间到！')}
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-700 rounded-xl p-4">
                  <div className="text-4xl font-bold text-green-400">{score}</div>
                  <div className="text-sm text-slate-400 mt-1">{t('Score', '得分')}</div>
                </div>
                <div className="bg-slate-700 rounded-xl p-4">
                  <div className="text-4xl font-bold text-blue-400">{correctCount}</div>
                  <div className="text-sm text-slate-400 mt-1">{t('Correct', '正确')}</div>
                </div>
                <div className="bg-slate-700 rounded-xl p-4">
                  <div className="text-4xl font-bold text-yellow-400">{accuracy}%</div>
                  <div className="text-sm text-slate-400 mt-1">{t('Accuracy', '准确率')}</div>
                </div>
                <div className="bg-slate-700 rounded-xl p-4">
                  <div className="text-4xl font-bold text-purple-400">
                    {correctCount + wrongCount > 0
                      ? Math.round(30 / (correctCount + wrongCount) * 10) / 10
                      : 0}s
                  </div>
                  <div className="text-sm text-slate-400 mt-1">{t('Avg Time', '平均用时')}</div>
                </div>
              </div>
            </div>

            <button
              onClick={startGame}
              className="px-8 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold transition-colors"
            >
              {t('Play Again', '再玩一次')}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
