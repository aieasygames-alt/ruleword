import { useState, useEffect, useCallback, useRef } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type WordscapesProps = {
  settings: Settings
  onBack: () => void
  updateScore?: (score: number) => void
  getHighScore?: () => number
}

interface Level {
  letters: string[]
  words: string[]
  crosswordPattern: { word: string; row: number; col: number; direction: 'across' | 'down' }[]
}

const LEVELS: Level[] = [
  {
    letters: ['C', 'A', 'T', 'S'],
    words: ['CAT', 'SAT', 'ACT', 'CATS', 'CAST', 'ACTS'],
    crosswordPattern: [
      { word: 'CAT', row: 0, col: 0, direction: 'across' },
      { word: 'ACT', row: 0, col: 0, direction: 'down' },
      { word: 'SAT', row: 2, col: 0, direction: 'across' },
    ]
  },
  {
    letters: ['R', 'A', 'C', 'E', 'S'],
    words: ['ACE', 'CAR', 'EAR', 'ACE', 'RACE', 'CARE', 'SCAR', 'ACES', 'CARS', 'EARS', 'CARES', 'RACES', 'SCARE', 'ACRES'],
    crosswordPattern: [
      { word: 'RACE', row: 0, col: 0, direction: 'across' },
      { word: 'CARE', row: 2, col: 0, direction: 'across' },
      { word: 'CAR', row: 0, col: 0, direction: 'down' },
      { word: 'ACE', row: 0, col: 2, direction: 'down' },
    ]
  },
  {
    letters: ['S', 'T', 'O', 'N', 'E'],
    words: ['SON', 'TON', 'NET', 'SET', 'ONE', 'TOE', 'STONE', 'TONES', 'NOTES', 'ONSET', 'TENONS'],
    crosswordPattern: [
      { word: 'STONE', row: 0, col: 0, direction: 'across' },
      { word: 'TONES', row: 2, col: 0, direction: 'across' },
      { word: 'SON', row: 0, col: 0, direction: 'down' },
      { word: 'TON', row: 0, col: 2, direction: 'down' },
      { word: 'ONE', row: 0, col: 4, direction: 'down' },
    ]
  }
]

export default function Wordscapes({
  settings,
  onBack,
  updateScore,
  getHighScore,
}: WordscapesProps) {
  const [level, setLevel] = useState(0)
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set())
  const [currentWord, setCurrentWord] = useState('')
  const [selectedLetters, setSelectedLetters] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [levelComplete, setLevelComplete] = useState(false)
  const [gameComplete, setGameComplete] = useState(false)
  const [crosswordGrid, setCrosswordGrid] = useState<(string | null)[][]>([])
  const [revealedCells, setRevealedCells] = useState<Set<string>>(new Set())

  const audioContext = useRef<AudioContext | null>(null)

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'

  const currentLevel = LEVELS[level]
  const isZh = settings.language === 'zh'

  const playSound = useCallback((type: 'select' | 'submit' | 'correct' | 'wrong' | 'complete') => {
    if (!settings.soundEnabled) return
    try {
      if (!audioContext.current) audioContext.current = new AudioContext()
      const ctx = audioContext.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      if (type === 'select') {
        osc.frequency.value = 400
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.1, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
      } else if (type === 'correct') {
        osc.frequency.value = 600
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.15, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
      } else if (type === 'wrong') {
        osc.frequency.value = 200
        osc.type = 'sawtooth'
        gain.gain.setValueAtTime(0.1, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
      } else if (type === 'complete') {
        osc.frequency.value = 800
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.2, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      }
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.3)
    } catch {}
  }, [settings.soundEnabled])

  // Initialize crossword grid
  useEffect(() => {
    if (!currentLevel) return

    // Find grid dimensions
    let maxRow = 0, maxCol = 0
    for (const pattern of currentLevel.crosswordPattern) {
      const endRow = pattern.row + (pattern.direction === 'down' ? pattern.word.length - 1 : 0)
      const endCol = pattern.col + (pattern.direction === 'across' ? pattern.word.length - 1 : 0)
      maxRow = Math.max(maxRow, endRow)
      maxCol = Math.max(maxCol, endCol)
    }

    // Create empty grid
    const grid: (string | null)[][] = Array(maxRow + 1).fill(null).map(() => Array(maxCol + 1).fill(null))

    // Fill grid with words
    for (const pattern of currentLevel.crosswordPattern) {
      for (let i = 0; i < pattern.word.length; i++) {
        const row = pattern.row + (pattern.direction === 'down' ? i : 0)
        const col = pattern.col + (pattern.direction === 'across' ? i : 0)
        grid[row][col] = pattern.word[i]
      }
    }

    setCrosswordGrid(grid)
    setRevealedCells(new Set())
  }, [level])

  const selectLetter = (index: number) => {
    if (selectedLetters.includes(index)) {
      // Deselect from this point
      const newIndex = selectedLetters.indexOf(index)
      const newSelected = selectedLetters.slice(0, newIndex)
      setSelectedLetters(newSelected)
      setCurrentWord(newSelected.map(i => currentLevel.letters[i]).join(''))
    } else {
      setSelectedLetters(prev => [...prev, index])
      setCurrentWord(prev => prev + currentLevel.letters[index])
      playSound('select')
    }
  }

  const submitWord = () => {
    if (currentWord.length < 3) {
      playSound('wrong')
      return
    }

    const upperWord = currentWord.toUpperCase()

    if (foundWords.has(upperWord)) {
      playSound('wrong')
      return
    }

    if (currentLevel.words.includes(upperWord)) {
      playSound('correct')
      setFoundWords(prev => new Set([...prev, upperWord]))
      const points = upperWord.length * 10
      setScore(prev => prev + points)

      // Reveal letters in crossword
      const newRevealed = new Set(revealedCells)
      for (const pattern of currentLevel.crosswordPattern) {
        if (pattern.word === upperWord) {
          for (let i = 0; i < pattern.word.length; i++) {
            const row = pattern.row + (pattern.direction === 'down' ? i : 0)
            const col = pattern.col + (pattern.direction === 'across' ? i : 0)
            newRevealed.add(`${row}-${col}`)
          }
        }
      }
      setRevealedCells(newRevealed)

      // Check level complete
      const allWordsFound = currentLevel.crosswordPattern.every(p =>
        foundWords.has(p.word) || upperWord === p.word
      )
      if (allWordsFound) {
        setTimeout(() => {
          playSound('complete')
          setLevelComplete(true)
        }, 500)
      }
    } else {
      playSound('wrong')
    }

    setCurrentWord('')
    setSelectedLetters([])
  }

  const clearSelection = () => {
    setCurrentWord('')
    setSelectedLetters([])
  }

  const nextLevel = () => {
    if (level >= LEVELS.length - 1) {
      setGameComplete(true)
    } else {
      setTotalScore(prev => prev + score)
      setScore(0)
      setFoundWords(new Set())
      setLevelComplete(false)
      setLevel(prev => prev + 1)
    }
  }

  const restartGame = () => {
    setLevel(0)
    setScore(0)
    setTotalScore(0)
    setFoundWords(new Set())
    setLevelComplete(false)
    setGameComplete(false)
  }

  const texts = {
    title: isZh ? '字母组词' : 'Wordscapes',
    level: isZh ? '关卡' : 'Level',
    score: isZh ? '分数' : 'Score',
    found: isZh ? '已找到' : 'Found',
    words: isZh ? '个单词' : 'words',
    submit: isZh ? '提交' : 'Submit',
    clear: isZh ? '清除' : 'Clear',
    hint: isZh ? '提示' : 'Hint',
    nextLevel: isZh ? '下一关' : 'Next Level',
    complete: isZh ? '恭喜过关！' : 'Level Complete!',
    gameComplete: isZh ? '游戏通关！' : 'Game Complete!',
    playAgain: isZh ? '再玩一次' : 'Play Again',
    shuffle: isZh ? '打乱' : 'Shuffle',
    extraWords: isZh ? '额外单词' : 'Extra Words',
  }

  // Calculate extra words (found but not in crossword)
  const crosswordWords = new Set(currentLevel?.crosswordPattern.map(p => p.word) || [])
  const extraWords = [...foundWords].filter(w => !crosswordWords.has(w))

  return (
    <div className={`min-h-screen flex flex-col items-center py-4 px-2 ${bgClass} ${textClass}`}>
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between border-b border-gray-700 pb-3 mb-4">
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">{texts.title}</h1>
          <div className="w-8" />
        </div>

        <div className="flex justify-center gap-8 mb-4">
          <div className="text-center">
            <p className="text-sm opacity-60">{texts.level}</p>
            <p className="text-lg font-bold">{level + 1}/{LEVELS.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm opacity-60">{texts.score}</p>
            <p className="text-lg font-bold">{score + totalScore}</p>
          </div>
          <div className="text-center">
            <p className="text-sm opacity-60">{texts.found}</p>
            <p className="text-lg font-bold">{foundWords.size}/{currentLevel?.words.length}</p>
          </div>
        </div>

        {/* Crossword Grid */}
        <div className={`${cardBgClass} border border-gray-700 rounded-lg p-4 mb-4`}>
          <div className="flex justify-center">
            <div className="inline-block">
              {crosswordGrid.map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                  {row.map((cell, colIndex) => (
                    <div
                      key={colIndex}
                      className={`w-10 h-10 m-0.5 flex items-center justify-center font-bold text-lg rounded ${
                        cell
                          ? revealedCells.has(`${rowIndex}-${colIndex}`)
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-600 text-gray-600'
                          : 'bg-transparent'
                      }`}
                    >
                      {revealedCells.has(`${rowIndex}-${colIndex}`) ? cell : ''}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Current Word Display */}
        <div className={`${cardBgClass} border border-gray-700 rounded-lg p-4 mb-4`}>
          <div className="text-center">
            <p className="text-2xl font-bold tracking-widest min-h-[2rem]">
              {currentWord || '_'.repeat(3)}
            </p>
          </div>
        </div>

        {/* Letter Wheel */}
        <div className={`${cardBgClass} border border-gray-700 rounded-lg p-6 mb-4`}>
          <div className="flex justify-center gap-3 flex-wrap">
            {currentLevel?.letters.map((letter, index) => (
              <button
                key={index}
                onClick={() => selectLetter(index)}
                className={`w-14 h-14 rounded-full font-bold text-xl flex items-center justify-center transition-all ${
                  selectedLetters.includes(index)
                    ? 'bg-yellow-500 text-black scale-90'
                    : 'bg-gradient-to-br from-amber-500 to-orange-600 text-white hover:scale-105'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={clearSelection}
            className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-500"
          >
            {texts.clear}
          </button>
          <button
            onClick={submitWord}
            disabled={currentWord.length < 3}
            className={`px-6 py-2 rounded-lg font-bold ${
              currentWord.length >= 3
                ? 'bg-green-600 hover:bg-green-500'
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            {texts.submit}
          </button>
        </div>

        {/* Found Words */}
        <div className={`${cardBgClass} border border-gray-700 rounded-lg p-4`}>
          <div className="flex flex-wrap gap-2 justify-center">
            {currentLevel?.words.map(word => (
              <span
                key={word}
                className={`px-3 py-1 rounded-full text-sm ${
                  foundWords.has(word)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-500'
                }`}
              >
                {foundWords.has(word) ? word : '•'.repeat(word.length)}
              </span>
            ))}
          </div>
          {extraWords.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-600">
              <p className="text-xs opacity-60 mb-2">{texts.extraWords}:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {extraWords.map(word => (
                  <span key={word} className="px-2 py-1 rounded bg-blue-600/50 text-xs">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Level Complete Modal */}
        {levelComplete && !gameComplete && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
            <div className={`${cardBgClass} border border-gray-700 rounded-xl p-8 text-center`}>
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-4">{texts.complete}</h2>
              <p className="text-xl mb-4">{texts.score}: {score}</p>
              <button
                onClick={nextLevel}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
              >
                {texts.nextLevel}
              </button>
            </div>
          </div>
        )}

        {/* Game Complete Modal */}
        {gameComplete && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
            <div className={`${cardBgClass} border border-gray-700 rounded-xl p-8 text-center`}>
              <div className="text-5xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold mb-4">{texts.gameComplete}</h2>
              <p className="text-xl mb-4">{texts.score}: {score + totalScore}</p>
              <button
                onClick={restartGame}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
              >
                {texts.playAgain}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
