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

const WORDS_EN = [
  { word: 'APPLE', hint: 'A fruit' },
  { word: 'HOUSE', hint: 'Where you live' },
  { word: 'TIGER', hint: 'Big cat' },
  { word: 'WATER', hint: 'Essential liquid' },
  { word: 'MUSIC', hint: 'Art of sound' },
  { word: 'BEACH', hint: 'Sandy shore' },
  { word: 'CLOUD', hint: 'In the sky' },
  { word: 'DREAM', hint: 'During sleep' },
  { word: 'FLAME', hint: 'Fire produces this' },
  { word: 'GRAPE', hint: 'Wine ingredient' },
  { word: 'HAPPY', hint: 'Feeling of joy' },
  { word: 'LEMON', hint: 'Sour citrus' },
  { word: 'OCEAN', hint: 'Large body of water' },
  { word: 'PIANO', hint: 'Musical instrument' },
  { word: 'QUEEN', hint: 'Female ruler' },
]

const WORDS_ZH = [
  { word: '苹果', hint: '水果' },
  { word: '房子', hint: '住的地方' },
  { word: '老虎', hint: '大猫' },
  { word: '音乐', hint: '声音的艺术' },
  { word: '大海', hint: '很多水' },
  { word: '梦想', hint: '睡觉时' },
  { word: '快乐', hint: '高兴的感觉' },
  { word: '柠檬', hint: '酸的柑橘' },
  { word: '月亮', hint: '晚上的光' },
  { word: '太阳', hint: '白天的光' },
]

export default function WordScramble({ settings, onBack, toggleLanguage }: Props) {
  const [currentWord, setCurrentWord] = useState<{ word: string; hint: string } | null>(null)
  const [scrambled, setScrambled] = useState('')
  const [userAnswer, setUserAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [isPlaying, setIsPlaying] = useState(false)
  const [wordsGuessed, setWordsGuessed] = useState(0)

  const t = (en: string, zh: string) => settings.language === 'zh' ? zh : en
  const wordList = settings.language === 'zh' ? WORDS_ZH : WORDS_EN

  const scrambleWord = (word: string) => {
    const chars = word.split('')
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]]
    }
    return chars.join('')
  }

  const nextWord = useCallback(() => {
    const available = wordList.filter(w => w.word !== currentWord?.word)
    const word = available[Math.floor(Math.random() * available.length)]
    setCurrentWord(word)
    setScrambled(scrambleWord(word.word))
    setUserAnswer('')
    setShowHint(false)
    setIsCorrect(null)
  }, [currentWord, wordList])

  const startGame = useCallback(() => {
    setScore(0)
    setStreak(0)
    setHintsUsed(0)
    setWordsGuessed(0)
    setTimeLeft(60)
    setIsPlaying(true)
    nextWord()
  }, [nextWord])

  // Timer
  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsPlaying(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isPlaying])

  const checkAnswer = () => {
    if (!currentWord) return
    const correct = userAnswer.toUpperCase() === currentWord.word.toUpperCase()
    setIsCorrect(correct)

    if (correct) {
      const bonus = showHint ? 5 : 10
      const streakBonus = Math.min(streak * 2, 10)
      setScore(s => s + bonus + streakBonus)
      setStreak(s => s + 1)
      setWordsGuessed(w => w + 1)
      setTimeout(nextWord, 1000)
    } else {
      setStreak(0)
    }
  }

  const useHint = () => {
    setShowHint(true)
    setHintsUsed(h => h + 1)
  }

  return (
    <div className={`min-h-screen ${settings.darkMode ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className="sticky top-0 z-50 bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-slate-400 hover:text-white">← {t('Back', '返回')}</button>
            <h1 className="text-xl font-bold">🔀 {t('Word Scramble', '单词重组')}</h1>
          </div>
          <button onClick={toggleLanguage} className="px-2 py-1 bg-slate-700 rounded text-sm">
            {settings.language === 'en' ? '中文' : 'EN'}
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {!isPlaying && timeLeft === 0 ? (
          // Results
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">{t('Time\'s Up!', '时间到！')}</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-800 rounded-xl p-4">
                <div className="text-3xl font-bold text-green-400">{score}</div>
                <div className="text-slate-400">{t('Score', '得分')}</div>
              </div>
              <div className="bg-slate-800 rounded-xl p-4">
                <div className="text-3xl font-bold text-blue-400">{wordsGuessed}</div>
                <div className="text-slate-400">{t('Words', '单词')}</div>
              </div>
            </div>
            <button onClick={startGame} className="px-8 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold">
              {t('Play Again', '再玩一次')}
            </button>
          </div>
        ) : !isPlaying ? (
          // Start
          <div className="text-center">
            <p className="text-slate-400 mb-6">
              {t('Unscramble as many words as you can in 60 seconds!', '在60秒内重组尽可能多的单词！')}
            </p>
            <button onClick={startGame} className="px-8 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold">
              {t('Start Game', '开始游戏')}
            </button>
          </div>
        ) : (
          // Game
          <>
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

            {/* Scrambled Word */}
            <div className="bg-slate-800 rounded-2xl p-6 text-center mb-6">
              <div className="text-4xl font-mono font-bold tracking-widest mb-4">
                {scrambled}
              </div>
              {showHint && currentWord && (
                <div className="text-slate-400 mb-4">💡 {t('Hint', '提示')}: {currentWord.hint}</div>
              )}
              <input
                type="text"
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && checkAnswer()}
                autoFocus
                className="w-full text-center text-2xl font-mono bg-slate-700 border-2 border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                placeholder={t('Type your answer...', '输入你的答案...')}
              />
              {isCorrect !== null && (
                <div className={`mt-4 text-lg font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {isCorrect ? t('Correct!', '正确！') : t('Try again!', '再试一次！')}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button onClick={useHint} disabled={showHint} className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 rounded-xl font-bold">
                💡 {t('Hint', '提示')}
              </button>
              <button onClick={checkAnswer} className="flex-1 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold">
                {t('Check', '检查')}
              </button>
              <button onClick={nextWord} className="py-3 px-4 bg-slate-700 hover:bg-slate-600 rounded-xl">
                ⏭️
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
