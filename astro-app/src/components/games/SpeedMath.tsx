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

type Operator = '+' | '-' | '×' | '÷'
type Difficulty = 'easy' | 'medium' | 'hard'

const DIFFICULTY_CONFIG = {
  easy: { maxNum: 10, operators: ['+', '-'] as Operator[], time: 60 },
  medium: { maxNum: 20, operators: ['+', '-', '×'] as Operator[], time: 60 },
  hard: { maxNum: 50, operators: ['+', '-', '×', '÷'] as Operator[], time: 45 },
}

export default function SpeedMath({ settings, onBack, toggleLanguage }: Props) {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [num1, setNum1] = useState(0)
  const [num2, setNum2] = useState(0)
  const [operator, setOperator] = useState<Operator('+')>('+')
  const [userAnswer, setUserAnswer] = useState('')
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [score, setScore] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)

  const t = (en: string, zh: string) => settings.language === 'zh' ? zh : en

  // 生成问题
  const generateQuestion = useCallback(() => {
    const config = DIFFICULTY_CONFIG[difficulty]
    const op = config.operators[Math.floor(Math.random() * config.operators.length)]

    let n1 = Math.floor(Math.random() * config.maxNum) + 1
    let n2 = Math.floor(Math.random() * config.maxNum) + 1

    // 确保结果是正整数
    if (op === '-' && n2 > n1) {
      [n1, n2] = [n2, n1]
    }
    if (op === '÷') {
      n1 = n2 * (Math.floor(Math.random() * 10) + 1)
    }

    setNum1(n1)
    setNum2(n2)
    setOperator(op)
    setUserAnswer('')
  }, [difficulty])

  // 开始游戏
  const startGame = useCallback(() => {
    setIsPlaying(true)
    setIsFinished(false)
    setCorrectCount(0)
    setWrongCount(0)
    setStreak(0)
    setBestStreak(0)
    setScore(0)
    setTimeLeft(DIFFICULTY_CONFIG[difficulty].time)
    generateQuestion()
    inputRef.current?.focus()
  }, [difficulty, generateQuestion])

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

  // 检查答案
  const checkAnswer = useCallback(() => {
    if (!userAnswer.trim()) return

    const userNum = parseInt(userAnswer)
    let correctAnswer: number

    switch (operator) {
      case '+': correctAnswer = num1 + num2; break
      case '-': correctAnswer = num1 - num2; break
      case '×': correctAnswer = num1 * num2; break
      case '÷': correctAnswer = num1 / num2; break
      default: correctAnswer = 0
    }

    if (userNum === correctAnswer) {
      setCorrectCount(prev => prev + 1)
      setStreak(prev => {
        const newStreak = prev + 1
        setBestStreak(b => Math.max(b, newStreak))
        return newStreak
      })
      // 连击加分
      const bonus = streak >= 5 ? 2 : streak >= 3 ? 1.5 : 1
      const points = Math.round(10 * bonus)
      setScore(prev => prev + points)
    } else {
      setWrongCount(prev => prev + 1)
      setStreak(0)
      setScore(prev => Math.max(0, prev - 5))
    }

    generateQuestion()
  }, [userAnswer, num1, num2, operator, streak, generateQuestion])

  // 键盘提交
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      checkAnswer()
    }
  }

  // 计算统计数据
  const total = correctCount + wrongCount
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0

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
              <span>➗</span>
              {t('Speed Math', '速算挑战')}
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
              <h2 className="text-xl font-bold mb-4">{t('Difficulty', '难度')}</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'easy', name: t('Easy', '简单'), desc: '0-10' },
                  { id: 'medium', name: t('Medium', '中等'), desc: '0-20' },
                  { id: 'hard', name: t('Hard', '困难'), desc: '0-50' },
                ].map(d => (
                  <button
                    key={d.id}
                    onClick={() => setDifficulty(d.id as Difficulty)}
                    className={`p-4 rounded-xl transition-colors ${
                      difficulty === d.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    <div className="font-bold">{d.name}</div>
                    <div className="text-sm opacity-70">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 rounded-xl font-bold text-xl transition-all shadow-lg shadow-green-500/30 hover:shadow-green-500/50"
            >
              {t('Start Game', '开始游戏')}
            </button>
          </>
        )}

        {/* Game */}
        {isPlaying && (
          <>
            {/* Stats Bar */}
            <div className="flex justify-between mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400">{score}</div>
                <div className="text-sm text-slate-400">{t('Score', '得分')}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-400">{timeLeft}</div>
                <div className="text-sm text-slate-400">{t('Seconds', '秒')}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400">🔥{streak}</div>
                <div className="text-sm text-slate-400">{t('Streak', '连击')}</div>
              </div>
            </div>

            {/* Question */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-center mb-6 shadow-2xl shadow-slate-900/50 ring-1 ring-slate-700">
              <div className="text-6xl font-mono font-bold mb-6">
                {num1} {operator} {num2} = ?
              </div>

              <input
                ref={inputRef}
                type="number"
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                className="w-48 text-center text-4xl font-mono bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 shadow-inner"
                placeholder="?"
              />

              <button
                onClick={checkAnswer}
                className="block mx-auto mt-4 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 rounded-xl font-bold transition-all shadow-lg shadow-green-500/30"
              >
                {t('Submit', '提交')}
              </button>
            </div>

            {/* Quick Stats */}
            <div className="flex justify-center gap-8 text-slate-400">
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
                  <div className="text-4xl font-bold text-purple-400">🔥{bestStreak}</div>
                  <div className="text-sm text-slate-400 mt-1">{t('Best Streak', '最佳连击')}</div>
                </div>
              </div>

              <p className="text-slate-400 mb-6">
                {t(`${total} problems attempted in ${DIFFICULTY_CONFIG[difficulty].time} seconds`,
                  `在 ${DIFFICULTY_CONFIG[difficulty].time} 秒内尝试了 ${total} 道题`)}
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={startGame}
                className="px-8 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold transition-colors"
              >
                {t('Play Again', '再玩一次')}
              </button>
              <button
                onClick={() => setIsFinished(false)}
                className="px-8 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition-colors"
              >
                {t('Change Difficulty', '切换难度')}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
