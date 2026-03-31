import { useState, useCallback, useMemo } from 'react'

type Props = {
  settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }
}

// Simple word list for the game
const WORD_LIST = new Set([
  'a', 'i', 'am', 'an', 'as', 'at', 'be', 'by', 'do', 'go', 'he', 'if', 'in', 'is', 'it', 'me', 'my', 'no', 'of', 'on', 'or', 'so', 'to', 'up', 'us', 'we',
  'ace', 'act', 'add', 'age', 'ago', 'aid', 'aim', 'air', 'all', 'and', 'ant', 'any', 'ape', 'arc', 'are', 'ark', 'arm', 'art', 'ask', 'ate', 'awe', 'axe',
  'able', 'ache', 'acid', 'aged', 'aide', 'also', 'area', 'army', 'away', 'baby', 'back', 'bake', 'ball', 'band', 'bank', 'bare', 'bark', 'barn', 'base', 'bath', 'bear', 'beat', 'been', 'beer', 'bell', 'belt', 'bend', 'bent', 'best', 'bike', 'bill', 'bind', 'bird', 'bite', 'blow', 'blue', 'boat', 'body', 'boil', 'bold', 'bolt', 'bomb', 'bond', 'bone', 'book', 'boot', 'bore', 'born', 'boss', 'both', 'bowl', 'bulk', 'burn', 'bury', 'bush', 'busy', 'cafe', 'cage', 'cake', 'calf', 'call', 'calm', 'came', 'camp', 'card', 'care', 'cart', 'case', 'cash', 'cast', 'cave', 'cell', 'chat', 'chef', 'chip', 'chop', 'city', 'clam', 'clap', 'clay', 'clip', 'club', 'clue', 'coal', 'coat', 'code', 'coin', 'cold', 'come', 'cook', 'cool', 'cope', 'copy', 'cord', 'core', 'corn', 'cost', 'cozy', 'crab', 'crew', 'crop', 'cube', 'cult', 'cure', 'curl', 'cute',
  'about', 'above', 'abuse', 'actor', 'acute', 'admit', 'adopt', 'adult', 'after', 'again', 'agent', 'agree', 'ahead', 'alarm', 'album', 'alert', 'alien', 'align', 'alike', 'alive', 'alley', 'allow', 'alloy', 'alone', 'along', 'alter', 'among', 'angel', 'anger', 'angle', 'angry', 'ankle', 'apart', 'apple', 'apply', 'arena', 'argue', 'arise', 'armor', 'aroma', 'array', 'arrow', 'asset', 'attic', 'audio', 'audit', 'avoid', 'award', 'aware', 'awful',
  'aboard', 'absent', 'absorb', 'access', 'accident', 'account', 'achieve', 'action', 'active', 'actual', 'adjust', 'admire', 'advice', 'advise', 'affair', 'affect', 'afford', 'afraid', 'agency', 'agenda', 'almost', 'always', 'amount', 'animal', 'annual', 'answer', 'anyone', 'anyway', 'appeal', 'appear', 'around', 'artist', 'aspect', 'assess', 'assist', 'assume', 'attack', 'attend', 'author', 'autumn', 'avenue',
])

const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const generatePuzzle = (): { centerLetter: string; outerLetters: string[] } => {
  // Pick 7 unique random letters
  const available = ALL_LETTERS.split('')
  const chosen: string[] = []
  for (let i = 0; i < 7; i++) {
    const idx = Math.floor(Math.random() * available.length)
    chosen.push(available.splice(idx, 1)[0])
  }
  const centerLetter = chosen[0]
  const outerLetters = chosen.slice(1)
  return { centerLetter, outerLetters }
}

export default function SpellingBee({ settings }: Props) {
  const [puzzle, setPuzzle] = useState(() => generatePuzzle())
  const [input, setInput] = useState('')
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState('')

  const isDark = settings.darkMode
  const lang = settings.language

  const centerLetter = puzzle.centerLetter
  const outerLetters = puzzle.outerLetters
  const allLetters = [centerLetter, ...outerLetters]

  const newPuzzle = () => {
    setPuzzle(generatePuzzle())
    setInput('')
    setFoundWords(new Set())
    setMessage('')
  }

  const isValidWord = useCallback((word: string): { valid: boolean; reason?: string } => {
    const upperWord = word.toUpperCase()
    if (upperWord.length < 4) return { valid: false, reason: lang === 'zh' ? '太短' : 'Too short' }
    if (!upperWord.includes(centerLetter)) return { valid: false, reason: lang === 'zh' ? '缺少中心字母' : 'Missing center letter' }
    if (!upperWord.split('').every(l => allLetters.includes(l))) return { valid: false, reason: lang === 'zh' ? '无效字母' : 'Invalid letter' }
    if (!WORD_LIST.has(word.toLowerCase())) return { valid: false, reason: lang === 'zh' ? '不在词库中' : 'Not in word list' }
    if (foundWords.has(upperWord)) return { valid: false, reason: lang === 'zh' ? '已找到' : 'Already found' }
    return { valid: true }
  }, [centerLetter, allLetters, foundWords, lang])

  const calculateScore = (word: string): number => {
    let score = word.length === 4 ? 1 : word.length
    if (new Set(word).size === 7) score += 7 // Pangram bonus
    return score
  }

  const handleSubmit = () => {
    const result = isValidWord(input)
    if (result.valid) {
      const upperWord = input.toUpperCase()
      setFoundWords(prev => new Set([...prev, upperWord]))
      const score = calculateScore(upperWord)
      const isPangram = new Set(upperWord).size === 7
      setMessage(isPangram ? (lang === 'zh' ? '🎉 全字母词！' : '🎉 Pangram!') : `+${score}`)
      setInput('')
    } else {
      setMessage(result.reason || '')
    }
    setTimeout(() => setMessage(''), 2000)
  }

  const handleKeyPress = (key: string) => {
    if (key === 'DELETE') {
      setInput(prev => prev.slice(0, -1))
    } else if (key === 'ENTER') {
      handleSubmit()
    } else if (input.length < 15) {
      setInput(prev => prev + key)
    }
  }

  const totalScore = useMemo(() => {
    return Array.from(foundWords).reduce((sum, word) => sum + calculateScore(word), 0)
  }, [foundWords])

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${isDark ? 'bg-slate-900' : 'bg-amber-50'}`}>
      <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        🐝 {lang === 'zh' ? '拼字蜜蜂' : 'Spelling Bee'}
      </h1>
      <p className={`text-sm mb-2 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
        {lang === 'zh' ? '使用中心字母造词（4+字母）' : 'Make words using the center letter (4+ letters)'}
      </p>
      <p className={`text-lg font-bold mb-4 ${isDark ? 'text-yellow-400' : 'text-amber-600'}`}>
        {lang === 'zh' ? '得分' : 'Score'}: {totalScore}
      </p>

      {/* Input */}
      <div className={`mb-4 text-2xl font-bold h-10 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {input || <span className="opacity-30">...</span>}
      </div>

      {message && <p className="mb-2 text-yellow-500 font-bold">{message}</p>}

      {/* Hexagon keyboard */}
      <div className="relative w-64 h-56 mb-4">
        {/* Center */}
        <button
          onClick={() => handleKeyPress(centerLetter)}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-yellow-400 text-xl font-bold text-gray-900 hover:bg-yellow-300"
        >
          {centerLetter}
        </button>
        {/* Outer hexagon positions */}
        {outerLetters.map((letter, i) => {
          const angle = (i * 60 - 90) * Math.PI / 180
          const x = Math.cos(angle) * 70
          const y = Math.sin(angle) * 70
          return (
            <button
              key={letter}
              onClick={() => handleKeyPress(letter)}
              className="absolute left-1/2 top-1/2 w-14 h-14 rounded-full bg-gray-200 text-xl font-bold text-gray-800 hover:bg-gray-300"
              style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
            >
              {letter}
            </button>
          )
        })}
      </div>

      {/* Buttons */}
      <div className="flex gap-2 mb-4">
        <button onClick={newPuzzle} className={`px-4 py-2 rounded-lg font-medium ${isDark ? 'bg-indigo-700 hover:bg-indigo-600 text-white' : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800'}`}>
          {lang === 'zh' ? '新谜题' : 'New Puzzle'}
        </button>
        <button onClick={() => handleKeyPress('DELETE')} className={`px-6 py-2 rounded-lg font-medium ${isDark ? 'bg-slate-700 text-white' : 'bg-gray-200'}`}>
          {lang === 'zh' ? '删除' : 'Delete'}
        </button>
        <button onClick={handleKeyPress.bind(null, 'ENTER')} className="px-6 py-2 rounded-lg font-medium bg-yellow-500 text-gray-900 hover:bg-yellow-400">
          {lang === 'zh' ? '确定' : 'Enter'}
        </button>
      </div>

      {/* Found words */}
      <div className="max-w-md">
        <h3 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {lang === 'zh' ? '已找到' : 'Found'}: {foundWords.size}
        </h3>
        <div className="flex flex-wrap gap-2">
          {Array.from(foundWords).sort().map(word => (
            <span key={word} className={`px-2 py-1 rounded text-sm ${isDark ? 'bg-slate-700 text-yellow-400' : 'bg-amber-100 text-amber-800'}`}>
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
