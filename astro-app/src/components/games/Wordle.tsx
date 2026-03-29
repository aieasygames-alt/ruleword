import { useState, useCallback, useMemo, useEffect } from 'react'
import { WORD_DICTIONARY, getWordsByLetter, getAllLetters, searchWords, type WordEntry } from '../../data/wordDictionary'
import { IDIOM_DICTIONARY, getIdiomsByChar, getAllFirstChars, searchIdioms, type IdiomEntry } from '../../data/idiomDictionary'

type Props = {
  settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }
  onShare?: (data: { result: string; attempts: number; score?: number }) => void
  gameName?: string
}

const WORDS = ['APPLE', 'BRAVE', 'CRANE', 'DREAM', 'EAGLE', 'FLAME', 'GRAPE', 'HOUSE', 'IMAGE', 'JUICE', 'KNIFE', 'LEMON', 'MUSIC', 'NIGHT', 'OCEAN', 'PIANO', 'QUEEN', 'RIVER', 'STORM', 'TIGER', 'ULTRA', 'VIVID', 'WATER', 'XENON', 'YOUTH', 'ZEBRA', 'BRAIN', 'CLOUD', 'DANCE', 'EARTH', 'FROST', 'GHOST', 'HEART', 'IVORY', 'JELLY', 'KAYAK', 'LIGHT', 'MANGO', 'NOBLE', 'OLIVE', 'PEACE', 'QUEST', 'ROBOT', 'SUGAR', 'TRAIN', 'UNITY', 'VAPOR', 'WORLD', 'XEROX', 'YACHT']

const MAX_GUESSES = 6
const WORD_LENGTH = 5

type LetterState = 'correct' | 'present' | 'absent' | 'empty'
type DictLanguage = 'en' | 'zh'

export default function Wordle({ settings, onShare, gameName = 'Wordle' }: Props) {
  const [targetWord, setTargetWord] = useState<string>(() => WORDS[Math.floor(Math.random() * WORDS.length)])
  const [guesses, setGuesses] = useState<string[]>([])
  const [currentGuess, setCurrentGuess] = useState('')
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing')
  const [shake, setShake] = useState(false)

  // Dictionary modal state
  const [showDict, setShowDict] = useState(false)
  const [dictLang, setDictLang] = useState<DictLanguage>('en')
  const [selectedLetter, setSelectedLetter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const isDark = settings.darkMode
  const lang = settings.language

  // Get filtered dictionary entries
  const filteredEntries = useMemo(() => {
    if (searchQuery.trim()) {
      return dictLang === 'zh' ? searchIdioms(searchQuery) : searchWords(searchQuery)
    }
    if (selectedLetter) {
      return dictLang === 'zh' ? getIdiomsByChar(selectedLetter) : getWordsByLetter(selectedLetter)
    }
    return dictLang === 'zh' ? IDIOM_DICTIONARY : WORD_DICTIONARY
  }, [dictLang, selectedLetter, searchQuery])

  // Get all filter options
  const allFilters = useMemo(() => {
    return dictLang === 'zh' ? getAllFirstChars() : getAllLetters()
  }, [dictLang])

  const getLetterState = (letter: string, index: number, guess: string): LetterState => {
    if (!guess[index]) return 'empty'
    if (guess[index] === targetWord[index]) return 'correct'
    if (targetWord.includes(guess[index])) return 'present'
    return 'absent'
  }

  const handleKeyPress = useCallback((key: string) => {
    if (gameState !== 'playing') return

    if (key === 'ENTER') {
      if (currentGuess.length !== WORD_LENGTH) {
        setShake(true)
        setTimeout(() => setShake(false), 500)
        return
      }

      const newGuesses = [...guesses, currentGuess]
      setGuesses(newGuesses)

      if (currentGuess === targetWord) {
        setGameState('won')
      } else if (newGuesses.length >= MAX_GUESSES) {
        setGameState('lost')
      }

      setCurrentGuess('')
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1))
    } else if (currentGuess.length < WORD_LENGTH && /^[A-Z]$/.test(key)) {
      setCurrentGuess(prev => prev + key)
    }
  }, [currentGuess, gameState, guesses, targetWord])

  // Keyboard event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showDict) return // Don't handle game keys when dictionary is open
      if (e.key === 'Enter') handleKeyPress('ENTER')
      else if (e.key === 'Backspace') handleKeyPress('BACKSPACE')
      else if (/^[a-zA-Z]$/.test(e.key)) handleKeyPress(e.key.toUpperCase())
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyPress, showDict])

  const getKeyState = (key: string): LetterState => {
    for (let i = 0; i < guesses.length; i++) {
      for (let j = 0; j < WORD_LENGTH; j++) {
        if (guesses[i][j] === key) {
          if (targetWord[j] === key) return 'correct'
          if (targetWord.includes(key)) return 'present'
          return 'absent'
        }
      }
    }
    return 'empty'
  }

  const resetGame = () => {
    setTargetWord(WORDS[Math.floor(Math.random() * WORDS.length)])
    setGuesses([])
    setCurrentGuess('')
    setGameState('playing')
  }

  // Generate Wordle-style emoji result
  const generateEmojiResult = (): string => {
    return guesses.map(guess => {
      return guess.split('').map((letter, index) => {
        const state = getLetterState(letter, index, guess)
        if (state === 'correct') return '🟩'
        if (state === 'present') return '🟨'
        return '⬛'
      }).join('')
    }).join('\n')
  }

  // Handle share
  const handleShare = () => {
    if (onShare) {
      onShare({
        result: generateEmojiResult(),
        attempts: guesses.length,
        score: gameState === 'won' ? Math.max(1, 7 - guesses.length) : 0
      })
    }
  }

  const keyColors: Record<LetterState, string> = {
    correct: 'bg-green-600 text-white',
    present: 'bg-yellow-500 text-white',
    absent: isDark ? 'bg-slate-700 text-white' : 'bg-gray-400 text-white',
    empty: isDark ? 'bg-slate-600 text-white' : 'bg-gray-200'
  }

  const cardBgClass = isDark ? 'bg-slate-800' : 'bg-gray-50'
  const borderClass = isDark ? 'border-slate-700' : 'border-gray-200'
  const inputBgClass = isDark ? 'bg-slate-700 text-white' : 'bg-white text-gray-900'

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>
      {/* Header with Dictionary button */}
      <div className="flex items-center gap-4 mb-4">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          🟩 Wordle
        </h1>
        <button
          onClick={() => setShowDict(true)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 ${
            isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          📖 {lang === 'zh' ? '词典' : 'Dictionary'}
        </button>
      </div>

      {/* Grid */}
      <div className={`grid gap-1.5 mb-4 ${shake ? 'animate-pulse' : ''}`}>
        {Array(MAX_GUESSES).fill(null).map((_, rowIndex) => {
          const guess = rowIndex < guesses.length ? guesses[rowIndex] : (rowIndex === guesses.length ? currentGuess : '')
          return (
            <div key={rowIndex} className="flex gap-1.5">
              {Array(WORD_LENGTH).fill(null).map((_, colIndex) => {
                const letter = guess[colIndex] || ''
                const state = rowIndex < guesses.length ? getLetterState(letter, colIndex, guess) : 'empty'
                const bgClass =
                  state === 'correct' ? 'bg-gradient-to-br from-green-500 to-green-700 shadow-lg shadow-green-500/30' :
                  state === 'present' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/30' :
                  state === 'absent' ? (isDark ? 'bg-gradient-to-br from-slate-600 to-slate-800' : 'bg-gradient-to-br from-gray-300 to-gray-500') :
                  letter ? (isDark ? 'bg-gradient-to-br from-slate-500 to-slate-700 shadow-lg' : 'bg-gradient-to-br from-gray-100 to-gray-300 shadow-lg') : (isDark ? 'bg-slate-700' : 'bg-white')

                return (
                  <div
                    key={colIndex}
                    className={`w-14 h-14 flex items-center justify-center text-2xl font-bold border-2 rounded-lg transition-all duration-200 ${bgClass} ${isDark ? 'border-slate-500' : 'border-gray-300'} ${letter ? 'border-gray-500 scale-105' : ''} ${state === 'correct' || state === 'present' ? 'scale-105 ring-2 ring-white/20' : ''}`}
                  >
                    <span className="drop-shadow-md text-white">{letter}</span>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Keyboard */}
      <div className="flex flex-col gap-1.5">
        {['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map((row, ri) => (
          <div key={ri} className="flex gap-1 justify-center">
            {ri === 2 && (
              <button onClick={() => handleKeyPress('ENTER')} className={`px-3 h-12 rounded text-sm font-medium ${isDark ? 'bg-slate-600 text-white' : 'bg-gray-300'}`}>
                {lang === 'zh' ? '确定' : 'ENTER'}
              </button>
            )}
            {row.split('').map(key => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className={`w-9 h-12 rounded text-sm font-medium ${keyColors[getKeyState(key)]}`}
              >
                {key}
              </button>
            ))}
            {ri === 2 && (
              <button onClick={() => handleKeyPress('BACKSPACE')} className={`px-3 h-12 rounded text-sm font-medium ${isDark ? 'bg-slate-600 text-white' : 'bg-gray-300'}`}>
                ⌫
              </button>
            )}
          </div>
        ))}
      </div>

      <button onClick={resetGame} className={`mt-4 px-6 py-2 rounded-lg font-medium ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
        {lang === 'zh' ? '新游戏' : 'New Game'}
      </button>

      {(gameState === 'won' || gameState === 'lost') && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-40">
          <div className={`p-8 rounded-2xl text-center ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <h2 className={`text-3xl font-bold mb-2 ${gameState === 'won' ? 'text-green-500' : 'text-red-500'}`}>
              {gameState === 'won' ? (lang === 'zh' ? '🎉 正确！' : '🎉 Correct!') : (lang === 'zh' ? '游戏结束' : 'Game Over')}
            </h2>
            <p className={`text-xl mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {lang === 'zh' ? '答案' : 'Answer'}: {targetWord}
            </p>
            <p className={`mb-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              {guesses.length} {lang === 'zh' ? '次尝试' : 'attempts'}
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={resetGame} className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium">
                {lang === 'zh' ? '再来一次' : 'Play Again'}
              </button>
              <button onClick={handleShare} className={`px-6 py-3 rounded-lg font-medium ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'} ${isDark ? 'text-white' : 'text-gray-900'}`}>
                📢 {lang === 'zh' ? '分享' : 'Share'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dictionary Modal */}
      {showDict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl ${isDark ? 'bg-slate-900' : 'bg-white'} shadow-2xl`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b ${borderClass}">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                📖 {dictLang === 'zh' ? '成语词典' : 'Word Dictionary'}
              </h2>
              <button
                onClick={() => setShowDict(false)}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Language Toggle */}
              <div className="flex gap-2 mb-4 justify-center">
                <button
                  onClick={() => {
                    setDictLang('en')
                    setSelectedLetter('')
                    setSearchQuery('')
                  }}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    dictLang === 'en'
                      ? 'bg-blue-600 text-white'
                      : isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => {
                    setDictLang('zh')
                    setSelectedLetter('')
                    setSearchQuery('')
                  }}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    dictLang === 'zh'
                      ? 'bg-blue-600 text-white'
                      : isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  中文
                </button>
              </div>

              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setSelectedLetter('')
                  }}
                  placeholder={dictLang === 'zh' ? '搜索成语或含义...' : 'Search words or meanings...'}
                  className={`w-full px-4 py-3 rounded-lg border ${borderClass} ${inputBgClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              {/* Letter Filter */}
              {!searchQuery && (
                <div className="mb-4">
                  <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    {dictLang === 'zh' ? '按首字筛选：' : 'Filter by first letter:'}
                  </h3>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    <button
                      onClick={() => setSelectedLetter('')}
                      className={`px-2.5 py-1 rounded text-sm font-medium transition-colors ${
                        !selectedLetter
                          ? 'bg-blue-500 text-white'
                          : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {dictLang === 'zh' ? '全部' : 'All'}
                    </button>
                    {allFilters.map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setSelectedLetter(filter)}
                        className={`px-2.5 py-1 rounded text-sm font-medium transition-colors ${
                          selectedLetter === filter
                            ? 'bg-blue-500 text-white'
                            : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Results Count */}
              <div className={`mb-3 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                {searchQuery ? (
                  dictLang === 'zh' ? `找到 ${filteredEntries.length} 个成语` : `${filteredEntries.length} words found`
                ) : selectedLetter ? (
                  dictLang === 'zh' ? `以 "${selectedLetter}" 开头的成语 (${filteredEntries.length})` : `Words starting with "${selectedLetter.toUpperCase()}" (${filteredEntries.length})`
                ) : (
                  dictLang === 'zh' ? `共 ${filteredEntries.length} 个成语` : `${filteredEntries.length} words total`
                )}
              </div>

              {/* Results Grid */}
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {filteredEntries.slice(0, 50).map((entry) => (
                  <div
                    key={(entry as WordEntry).word || (entry as IdiomEntry).idiom}
                    className={`p-3 rounded-lg border ${borderClass} ${cardBgClass} hover:shadow-md transition-shadow`}
                  >
                    {'word' in entry ? (
                      // English word
                      <>
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="text-lg font-bold text-blue-600">{entry.word}</h4>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-600'}`}>
                            {entry.category}
                          </span>
                        </div>
                        <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{entry.meaning}</p>
                      </>
                    ) : (
                      // Chinese idiom
                      <>
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="text-xl font-bold text-blue-600">{entry.idiom}</h4>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            entry.category === '褒义' ? 'bg-green-100 text-green-700' :
                            entry.category === '贬义' ? 'bg-red-100 text-red-700' :
                            isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {entry.category}
                          </span>
                        </div>
                        <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>[{entry.pinyin}]</p>
                        <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{entry.meaning}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* No Results */}
              {filteredEntries.length === 0 && (
                <div className={`text-center py-8 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {dictLang === 'zh' ? '未找到匹配的成语' : 'No matching words found'}
                </div>
              )}

              {filteredEntries.length > 50 && (
                <p className={`text-center mt-4 text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {dictLang === 'zh' ? `显示前 50 条，共 ${filteredEntries.length} 条` : `Showing first 50 of ${filteredEntries.length} results`}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
