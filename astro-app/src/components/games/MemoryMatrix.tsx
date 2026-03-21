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

type Phase = 'ready' | 'showing' | 'guessing' | 'result'

export default function MemoryMatrix({ settings, onBack, toggleLanguage }: Props) {
  const [level, setLevel] = useState(1)
  const [gridSize, setGridSize] = useState(3)
  const [pattern, setPattern] = useState<number[]>([])
  const [userGuess, setUserGuess] = useState<number[]>([])
  const [phase, setPhase] = useState<Phase>('ready')
  const [score, setScore] = useState(0)
  const [bestLevel, setBestLevel] = useState(0)
  const [lives, setLives] = useState(3)

  const t = (en: string, zh: string) => settings.language === 'zh' ? zh : en

  const totalCells = gridSize * gridSize
  const patternSize = Math.min(Math.floor(level * 1.5) + 2, Math.floor(totalCells * 0.6))

  const generatePattern = useCallback(() => {
    const cells: number[] = []
    while (cells.length < patternSize) {
      const cell = Math.floor(Math.random() * totalCells)
      if (!cells.includes(cell)) cells.push(cell)
    }
    setPattern(cells)
    setUserGuess([])
  }, [patternSize, totalCells])

  const startRound = useCallback(() => {
    generatePattern()
    setPhase('showing')
    const showTime = Math.max(1000, 3000 - level * 200)
    setTimeout(() => setPhase('guessing'), showTime)
  }, [generatePattern, level])

  const handleCellClick = (index: number) => {
    if (phase !== 'guessing') return
    if (userGuess.includes(index)) {
      setUserGuess(prev => prev.filter(i => i !== index))
    } else if (userGuess.length < patternSize) {
      setUserGuess(prev => [...prev, index])
    }
  }

  const checkAnswer = () => {
    const correct = pattern.every(p => userGuess.includes(p)) && userGuess.length === pattern.length

    if (correct) {
      setScore(prev => prev + level * 10)
      setLevel(prev => {
        const newLevel = prev + 1
        if (newLevel > bestLevel) setBestLevel(newLevel)
        if (newLevel % 3 === 0) setGridSize(Math.min(7, Math.floor(3 + newLevel / 3)))
        return newLevel
      })
      setPhase('result')
    } else {
      setLives(prev => prev - 1)
      if (lives <= 1) {
        setPhase('result')
      } else {
        setPhase('result')
      }
    }
  }

  const nextRound = () => {
    if (lives <= 0) {
      // Game over - reset
      setLevel(1)
      setGridSize(3)
      setScore(0)
      setLives(3)
    }
    setPhase('ready')
  }

  useEffect(() => {
    if (phase === 'ready' && lives > 0) {
      const timer = setTimeout(startRound, 500)
      return () => clearTimeout(timer)
    }
  }, [phase, startRound, lives])

  return (
    <div className={`min-h-screen ${settings.darkMode ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className="sticky top-0 z-50 bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-slate-400 hover:text-white">← {t('Back', '返回')}</button>
            <h1 className="text-xl font-bold">🧠 {t('Memory Matrix', '矩阵记忆')}</h1>
          </div>
          <button onClick={toggleLanguage} className="px-2 py-1 bg-slate-700 rounded text-sm">
            {settings.language === 'en' ? '中文' : 'EN'}
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Stats */}
        <div className="flex justify-between mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{score}</div>
            <div className="text-sm text-slate-400">{t('Score', '得分')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">Lv.{level}</div>
            <div className="text-sm text-slate-400">{t('Level', '等级')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{'❤️'.repeat(lives)}</div>
            <div className="text-sm text-slate-400">{t('Lives', '生命')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">⭐{bestLevel}</div>
            <div className="text-sm text-slate-400">{t('Best', '最佳')}</div>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center mb-4">
          {phase === 'showing' && (
            <p className="text-xl text-blue-400">{t('Memorize the pattern!', '记住图案！')}</p>
          )}
          {phase === 'guessing' && (
            <p className="text-xl text-yellow-400">{t('Recreate the pattern', '重现图案')} ({userGuess.length}/{patternSize})</p>
          )}
          {phase === 'result' && (
            lives > 0 ? (
              <p className="text-xl text-green-400">{t('Correct! Level up!', '正确！升级！')}</p>
            ) : (
              <p className="text-xl text-red-400">{t('Game Over!', '游戏结束！')}</p>
            )
          )}
        </div>

        {/* Grid */}
        <div className="flex justify-center mb-6">
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
          >
            {Array.from({ length: totalCells }).map((_, index) => {
              const isPattern = pattern.includes(index)
              const isGuessed = userGuess.includes(index)
              const showPattern = phase === 'showing' && isPattern

              return (
                <button
                  key={index}
                  onClick={() => handleCellClick(index)}
                  disabled={phase !== 'guessing'}
                  className={`
                    w-14 h-14 sm:w-16 sm:h-16 rounded-lg transition-all duration-200
                    ${showPattern ? 'bg-blue-500 scale-105' : ''}
                    ${phase === 'guessing' && isGuessed ? 'bg-blue-500 scale-105' : ''}
                    ${phase === 'guessing' && !isGuessed ? 'bg-slate-700 hover:bg-slate-600 cursor-pointer' : ''}
                    ${phase === 'result' && isPattern ? 'bg-green-500' : ''}
                    ${phase === 'result' && isGuessed && !isPattern ? 'bg-red-500' : ''}
                    ${!showPattern && !isGuessed && phase !== 'result' && phase !== 'guessing' ? 'bg-slate-700' : ''}
                  `}
                />
              )
            })}
          </div>
        </div>

        {/* Submit Button */}
        {phase === 'guessing' && userGuess.length === patternSize && (
          <button
            onClick={checkAnswer}
            className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold"
          >
            {t('Check Answer', '检查答案')}
          </button>
        )}

        {/* Next/Restart Button */}
        {phase === 'result' && (
          <button
            onClick={nextRound}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold"
          >
            {lives > 0 ? t('Next Level', '下一关') : t('Play Again', '重新开始')}
          </button>
        )}
      </main>
    </div>
  )
}
