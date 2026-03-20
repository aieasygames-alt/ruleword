import { useState, useCallback, useEffect } from 'react'

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

type Phase = 'ready' | 'showing' | 'guessing' | 'correct' | 'wrong'

export default function ChimpTest({ settings, onBack, toggleLanguage }: Props) {
  const [phase, setPhase] = useState<Phase>('ready')
  const [level, setLevel] = useState(4)
  const [squares, setSquares] = useState<number[]>([])
  const [userInput, setUserInput] = useState<number[]>([])
  const [numbersVisible, setNumbersVisible] = useState(true)
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [totalCorrect, setTotalCorrect] = useState(0)
  const [attempts, setAttempts] = useState(0)

  const t = (en: string, zh: string) => settings.language === 'zh' ? zh : en

  // 生成随机方块位置
  const generateSquares = useCallback((count: number) => {
    const positions: Set<number> = new Set()
    while (positions.size < count) {
      positions.add(Math.floor(Math.random() * 16))
    }
    return Array.from(positions)
  }, [])

  // 开始新回合
  const startRound = useCallback(() => {
    const newSquares = generateSquares(level)
    setSquares(newSquares)
    setUserInput([])
    setNumbersVisible(true)
    setPhase('showing')

    // 显示数字一段时间后隐藏
    const showTime = Math.max(1000, 2000 - level * 100)
    setTimeout(() => {
      setNumbersVisible(false)
      setPhase('guessing')
    }, showTime)
  }, [level, generateSquares])

  // 处理用户点击
  const handleSquareClick = (index: number) => {
    if (phase !== 'guessing') return
    if (userInput.includes(index)) return

    const newInput = [...userInput, index]
    setUserInput(newInput)

    // 检查是否点击正确
    const expectedIndex = userInput.length
    if (squares[expectedIndex] !== index) {
      // 点击错误
      setPhase('wrong')
      setAttempts(prev => prev + 1)

      // 如果错误，降低难度
      setTimeout(() => {
        if (level > 4) {
          setLevel(prev => prev - 1)
        }
        setPhase('correct')
        setTimeout(() => {
          setPhase('ready')
        }, 1500)
      }, 1500)
      return
    }

    // 检查是否完成
    if (newInput.length === squares.length) {
      // 全部正确！
      setPhase('correct')
      setScore(prev => prev + level)
      setTotalCorrect(prev => prev + 1)
      setAttempts(prev => prev + 1)

      // 更新最高分
      setBestScore(prev => Math.max(prev, level))

      // 增加难度
      setTimeout(() => {
        setLevel(prev => prev + 1)
        setPhase('ready')
      }, 1500)
    }
  }

  // 获取方块显示内容
  const getSquareContent = (index: number) => {
    if (!squares.includes(index)) return null

    if (numbersVisible) {
      // 显示数字
      const numIndex = squares.indexOf(index)
      return numIndex + 1
    }

    if (userInput.includes(index)) {
      // 用户已点击
      const clickOrder = userInput.indexOf(index)
      return clickOrder + 1
    }

    // 隐藏状态，未点击
    return ''
  }

  // 获取方块样式
  const getSquareStyle = (index: number) => {
    const isActive = squares.includes(index)
    const isClicked = userInput.includes(index)

    if (!isActive) {
      return 'bg-slate-700 cursor-default'
    }

    if (phase === 'wrong') {
      const isCorrectClick = squares.indexOf(index) < userInput.length && squares[squares.indexOf(index)] === index
      return isCorrectClick ? 'bg-green-600' : 'bg-red-600'
    }

    if (isClicked) {
      return 'bg-blue-600'
    }

    if (phase === 'guessing') {
      return 'bg-slate-600 hover:bg-slate-500 cursor-pointer'
    }

    return 'bg-slate-600'
  }

  // 重置游戏
  const resetGame = () => {
    setLevel(4)
    setScore(0)
    setTotalCorrect(0)
    setAttempts(0)
    setPhase('ready')
  }

  // 键盘控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (phase === 'ready') {
          startRound()
        } else if (phase === 'wrong') {
          setPhase('ready')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [phase, startRound])

  return (
    <div className={`min-h-screen ${settings.darkMode ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <span>←</span>
              <span className="hidden sm:inline">{t('Back', '返回')}</span>
            </button>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span>🐒</span>
              {t('Chimp Test', '黑猩猩测试')}
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

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="flex justify-center gap-8 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{score}</div>
            <div className="text-sm text-slate-400">{t('Score', '得分')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">{bestScore}</div>
            <div className="text-sm text-slate-400">{t('Best Level', '最高等级')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{totalCorrect}/{attempts}</div>
            <div className="text-sm text-slate-400">{t('Correct', '正确')}</div>
          </div>
        </div>

        {/* Current Level */}
        <div className="text-center mb-6">
          <span className="text-xl text-slate-400">
            {t('Level', '等级')}: <span className="text-white font-bold">{level}</span>
            <span className="text-slate-500 ml-2">({level} {t('numbers', '个数字')})</span>
          </span>
        </div>

        {/* Game Grid */}
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {Array.from({ length: 16 }).map((_, index) => (
              <button
                key={index}
                onClick={() => handleSquareClick(index)}
                disabled={phase !== 'guessing'}
                className={`
                  w-16 h-16 sm:w-20 sm:h-20 rounded-lg
                  flex items-center justify-center
                  text-2xl font-bold
                  transition-all duration-200
                  ${getSquareStyle(index)}
                `}
              >
                {getSquareContent(index)}
              </button>
            ))}
          </div>
        </div>

        {/* Status Message */}
        <div className="text-center mb-8">
          {phase === 'ready' && (
            <div>
              <p className="text-slate-400 mb-4">
                {t('Remember the numbers in order, then click the squares in the same order.',
                  '记住数字的顺序，然后按相同顺序点击方块。')}
              </p>
              <button
                onClick={startRound}
                className="px-8 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-lg transition-colors"
              >
                {t('Start', '开始')}
              </button>
            </div>
          )}

          {phase === 'showing' && (
            <p className="text-xl text-blue-400">
              {t('Memorize the numbers...', '记住数字...')}
            </p>
          )}

          {phase === 'guessing' && (
            <p className="text-xl text-yellow-400">
              {t('Click the squares in order!', '按顺序点击方块！')}
            </p>
          )}

          {phase === 'correct' && (
            <p className="text-xl text-green-400">
              {t('Correct! Level up!', '正确！升级！')}
            </p>
          )}

          {phase === 'wrong' && (
            <div>
              <p className="text-xl text-red-400 mb-2">
                {t('Wrong! Try again.', '错误！再试一次。')}
              </p>
              <p className="text-slate-400">
                {t('The correct order was:', '正确顺序是：')}
              </p>
              <p className="text-lg text-blue-400 mt-2">
                {squares.map((_, i) => i + 1).join(' → ')}
              </p>
            </div>
          )}
        </div>

        {/* Info Box */}
        {phase === 'ready' && (
          <div className="bg-slate-800 rounded-xl p-6 max-w-lg mx-auto">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <span>🧠</span>
              {t('Did you know?', '你知道吗？')}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {t(
                'Young chimpanzees can remember the position of numbers 1-9 better than adult humans! They can do this in just 0.5 seconds. Can you beat a chimp?',
                '年轻的黑猩猩比成年人更能记住1-9数字的位置！它们只需要0.5秒就能记住。你能打败黑猩猩吗？'
              )}
            </p>
          </div>
        )}

        {/* Reset Button */}
        {(score > 0 || attempts > 0) && phase === 'ready' && (
          <div className="text-center mt-6">
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
            >
              {t('Reset Score', '重置得分')}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
