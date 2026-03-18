import { useState, useCallback } from 'react'

type Props = {
  settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }
}

type Category = {
  name: string
  nameZh: string
  words: string[]
  color: string
}

const CATEGORIES: Category[] = [
  { name: 'FRUITS', nameZh: '水果', words: ['APPLE', 'BANANA', 'ORANGE', 'GRAPE'], color: 'bg-yellow-500' },
  { name: 'PLANETS', nameZh: '行星', words: ['MARS', 'VENUS', 'SATURN', 'EARTH'], color: 'bg-green-500' },
  { name: 'COLORS', nameZh: '颜色', words: ['RED', 'BLUE', 'GREEN', 'PINK'], color: 'bg-blue-500' },
  { name: 'ANIMALS', nameZh: '动物', words: ['LION', 'TIGER', 'BEAR', 'WOLF'], color: 'bg-purple-500' },
]

const GROUP_COLORS = ['bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500']

export default function Connections({ settings }: Props) {
  const [words, setWords] = useState<string[]>(() => {
    return CATEGORIES.flatMap(c => c.words).sort(() => Math.random() - 0.5)
  })
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [solved, setSolved] = useState<Category[]>([])
  const [mistakes, setMistakes] = useState(0)
  const [message, setMessage] = useState('')
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing')

  const isDark = settings.darkMode
  const lang = settings.language

  const MAX_MISTAKES = 4
  const remainingWords = words.filter(w => !solved.some(s => s.words.includes(w)))

  const toggleWord = useCallback((word: string) => {
    if (solved.some(s => s.words.includes(word))) return

    setSelected(prev => {
      const newSet = new Set(prev)
      if (newSet.has(word)) {
        newSet.delete(word)
      } else if (newSet.size < 4) {
        newSet.add(word)
      }
      return newSet
    })
  }, [solved])

  const shuffle = useCallback(() => {
    setWords(prev => [...prev].sort(() => Math.random() - 0.5))
  }, [])

  const submit = useCallback(() => {
    if (selected.size !== 4) return

    const selectedArr = Array.from(selected)

    // Find matching category
    for (const category of CATEGORIES) {
      if (!solved.includes(category) && category.words.every(w => selectedArr.includes(w))) {
        // Correct!
        setSolved(prev => [...prev, category])
        setSelected(new Set())
        setMessage('')

        if (solved.length === 3) {
          setGameState('won')
        }
        return
      }
    }

    // Wrong - check if close (3 correct)
    let closest = 0
    for (const category of CATEGORIES) {
      if (!solved.includes(category)) {
        const match = category.words.filter(w => selectedArr.includes(w)).length
        closest = Math.max(closest, match)
      }
    }

    if (closest === 3) {
      setMessage(lang === 'zh' ? '差一个！' : 'One away!')
    } else {
      setMessage('')
    }

    setMistakes(prev => {
      const newMistakes = prev + 1
      if (newMistakes >= MAX_MISTAKES) {
        setGameState('lost')
        // Reveal remaining categories
        setSolved(CATEGORIES)
      }
      return newMistakes
    })
  }, [selected, solved, lang])

  const deselectAll = () => setSelected(new Set())

  const resetGame = () => {
    setWords(CATEGORIES.flatMap(c => c.words).sort(() => Math.random() - 0.5))
    setSelected(new Set())
    setSolved([])
    setMistakes(0)
    setMessage('')
    setGameState('playing')
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        🔗 {lang === 'zh' ? '词语连线' : 'Connections'}
      </h1>
      <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
        {lang === 'zh' ? '找出4组相关词语' : 'Find 4 groups of related words'}
      </p>

      {/* Mistakes */}
      <div className="mb-4 flex gap-1">
        {Array(MAX_MISTAKES).fill(null).map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full ${i < MAX_MISTAKES - mistakes ? 'bg-gray-400' : 'bg-gray-700'}`}
          />
        ))}
      </div>

      {/* Solved categories */}
      <div className="w-full max-w-md space-y-2 mb-2">
        {solved.map((category, i) => (
          <div
            key={category.name}
            className={`${GROUP_COLORS[CATEGORIES.indexOf(category)]} p-3 rounded-lg text-white text-center`}
          >
            <div className="font-bold">{lang === 'zh' ? category.nameZh : category.name}</div>
            <div className="text-sm">{category.words.join(', ')}</div>
          </div>
        ))}
      </div>

      {/* Grid */}
      {gameState === 'playing' && remainingWords.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-4 w-full max-w-md">
          {remainingWords.map(word => (
            <button
              key={word}
              onClick={() => toggleWord(word)}
              className={`p-3 rounded-lg font-medium text-sm transition-all ${
                selected.has(word)
                  ? 'bg-gray-800 text-white scale-95'
                  : isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-amber-100 text-gray-800 hover:bg-amber-200'
              }`}
            >
              {word}
            </button>
          ))}
        </div>
      )}

      {message && <p className="text-yellow-500 font-bold mb-2">{message}</p>}

      {gameState === 'playing' && (
        <div className="flex gap-2">
          <button
            onClick={shuffle}
            className={`px-4 py-2 rounded-lg font-medium ${isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            🔀 {lang === 'zh' ? '打乱' : 'Shuffle'}
          </button>
          <button
            onClick={deselectAll}
            className={`px-4 py-2 rounded-lg font-medium ${isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {lang === 'zh' ? '取消选择' : 'Deselect'}
          </button>
          <button
            onClick={submit}
            disabled={selected.size !== 4}
            className={`px-6 py-2 rounded-lg font-medium ${
              selected.size === 4 ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-gray-400 text-gray-600 cursor-not-allowed'
            }`}
          >
            {lang === 'zh' ? '提交' : 'Submit'}
          </button>
        </div>
      )}

      {gameState !== 'playing' && (
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${gameState === 'won' ? 'text-green-500' : 'text-red-500'}`}>
            {gameState === 'won' ? (lang === 'zh' ? '🎉 太棒了！' : '🎉 Great!') : (lang === 'zh' ? '游戏结束' : 'Game Over')}
          </h2>
          <button onClick={resetGame} className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium">
            {lang === 'zh' ? '再来一次' : 'Play Again'}
          </button>
        </div>
      )}
    </div>
  )
}
