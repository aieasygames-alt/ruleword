import { useState, useEffect, useCallback, useMemo } from 'react'

// Word list for the puzzle
const WORD_LIST = [
  'PUZZLE', 'GAME', 'PLAY', 'WORD', 'FIND', 'SEARCH', 'GRID', 'HIDDEN',
  'LETTER', 'SPELL', 'SCORE', 'LEVEL', 'TIMER', 'BOARD', 'CLICK',
  'HORIZONTAL', 'VERTICAL', 'DIAGONAL', 'REVERSE', 'FORWARD',
  'CHALLENGE', 'BRAIN', 'THINK', 'SOLVE', 'LOGIC', 'FUN', 'COOL',
]

type Direction = 'horizontal' | 'vertical' | 'diagonal-down' | 'diagonal-up' | 'horizontal-reverse' | 'vertical-reverse' | 'diagonal-down-reverse' | 'diagonal-up-reverse'

const DIRECTIONS: { dir: Direction; dr: number; dc: number }[] = [
  { dir: 'horizontal', dr: 0, dc: 1 },
  { dir: 'horizontal-reverse', dr: 0, dc: -1 },
  { dir: 'vertical', dr: 1, dc: 0 },
  { dir: 'vertical-reverse', dr: -1, dc: 0 },
  { dir: 'diagonal-down', dr: 1, dc: 1 },
  { dir: 'diagonal-down-reverse', dr: -1, dc: -1 },
  { dir: 'diagonal-up', dr: -1, dc: 1 },
  { dir: 'diagonal-up-reverse', dr: 1, dc: -1 },
]

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type WordSearchProps = {
  settings: Settings
  onBack: () => void
  toggleLanguage: () => void
  toggleTheme: () => void
  toggleSound: () => void
}

type Cell = {
  letter: string
  inWord: boolean
  found: boolean
}

type FoundWord = {
  word: string
  cells: { row: number; col: number }[]
}

function generatePuzzle(words: string[], gridSize: number): { grid: Cell[][]; placedWords: string[] } {
  const grid: Cell[][] = Array(gridSize).fill(null).map(() =>
    Array(gridSize).fill(null).map(() => ({ letter: '', inWord: false, found: false }))
  )
  const placedWords: string[] = []

  // Sort words by length (longer first)
  const sortedWords = [...words].sort((a, b) => b.length - a.length)

  for (const word of sortedWords) {
    if (word.length > gridSize) continue

    let placed = false
    let attempts = 0
    const maxAttempts = 100

    while (!placed && attempts < maxAttempts) {
      attempts++
      const direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)]
      const startRow = Math.floor(Math.random() * gridSize)
      const startCol = Math.floor(Math.random() * gridSize)

      // Check if word fits
      let canPlace = true
      const cells: { row: number; col: number }[] = []

      for (let i = 0; i < word.length; i++) {
        const row = startRow + direction.dr * i
        const col = startCol + direction.dc * i

        if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
          canPlace = false
          break
        }

        if (grid[row][col].letter !== '' && grid[row][col].letter !== word[i]) {
          canPlace = false
          break
        }

        cells.push({ row, col })
      }

      if (canPlace) {
        // Place the word
        for (let i = 0; i < word.length; i++) {
          const { row, col } = cells[i]
          grid[row][col].letter = word[i]
          grid[row][col].inWord = true
        }
        placedWords.push(word)
        placed = true
      }
    }
  }

  // Fill empty cells with random letters
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (grid[row][col].letter === '') {
        grid[row][col].letter = alphabet[Math.floor(Math.random() * alphabet.length)]
      }
    }
  }

  return { grid, placedWords }
}

export default function WordSearch({ settings, onBack }: WordSearchProps) {
  const [gridSize] = useState(12)
  const [grid, setGrid] = useState<Cell[][]>([])
  const [words, setWords] = useState<string[]>([])
  const [foundWords, setFoundWords] = useState<FoundWord[]>([])
  const [isSelecting, setIsSelecting] = useState(false)
  const [selection, setSelection] = useState<{ row: number; col: number }[]>([])
  const [gameComplete, setGameComplete] = useState(false)
  const [timer, setTimer] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const isDark = settings.darkMode

  const bgClass = isDark ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = isDark ? 'text-white' : 'text-gray-900'
  const cellBgClass = isDark ? 'bg-slate-800' : 'bg-white'
  const selectedBgClass = isDark ? 'bg-green-600/50' : 'bg-green-200'
  const foundBgClass = isDark ? 'bg-green-600' : 'bg-green-400'

  const startNewGame = useCallback(() => {
    const shuffledWords = [...WORD_LIST].sort(() => Math.random() - 0.5).slice(0, 8)
    const { grid: newGrid, placedWords } = generatePuzzle(shuffledWords, gridSize)
    setGrid(newGrid)
    setWords(placedWords)
    setFoundWords([])
    setSelection([])
    setGameComplete(false)
    setTimer(0)
    setIsPlaying(true)
  }, [gridSize])

  useEffect(() => {
    startNewGame()
  }, [startNewGame])

  useEffect(() => {
    if (isPlaying && !gameComplete) {
      const interval = setInterval(() => setTimer(t => t + 1), 1000)
      return () => clearInterval(interval)
    }
  }, [isPlaying, gameComplete])

  useEffect(() => {
    if (foundWords.length === words.length && words.length > 0) {
      setGameComplete(true)
      if (settings.soundEnabled) {
        // Play success sound
      }
    }
  }, [foundWords.length, words.length, settings.soundEnabled])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleMouseDown = (row: number, col: number) => {
    if (gameComplete) return
    setIsSelecting(true)
    setSelection([{ row, col }])
  }

  const handleMouseEnter = (row: number, col: number) => {
    if (!isSelecting || gameComplete) return
    setSelection(prev => {
      const newSelection = [...prev]
      const exists = newSelection.find(c => c.row === row && c.col === col)
      if (!exists) {
        newSelection.push({ row, col })
      }
      return newSelection
    })
  }

  const handleMouseUp = () => {
    if (!isSelecting) return
    setIsSelecting(false)

    // Check if selection forms a valid word
    if (selection.length > 1) {
      const selectedWord = selection.map(c => grid[c.row][c.col].letter).join('')
      const reversedWord = selectedWord.split('').reverse().join('')

      const matchedWord = words.find(w =>
        (w === selectedWord || w === reversedWord) &&
        !foundWords.find(f => f.word === w)
      )

      if (matchedWord) {
        const newFound: FoundWord = {
          word: matchedWord,
          cells: [...selection]
        }
        setFoundWords(prev => [...prev, newFound])

        // Mark cells as found
        setGrid(prev => {
          const newGrid = prev.map(row => row.map(cell => ({ ...cell })))
          selection.forEach(c => {
            newGrid[c.row][c.col].found = true
          })
          return newGrid
        })
      }
    }

    setSelection([])
  }

  const isCellSelected = (row: number, col: number) => {
    return selection.some(c => c.row === row && c.col === col)
  }

  const isCellFound = (row: number, col: number) => {
    return grid[row]?.[col]?.found
  }

  const isWordFound = (word: string) => {
    return foundWords.some(f => f.word === word)
  }

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} flex flex-col`}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/90 border-b border-slate-800 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm"
          >
            ← Back
          </button>
          <div className="flex items-center gap-4">
            <span className="text-lg font-mono">{formatTime(timer)}</span>
            <span className="text-sm text-slate-400">{foundWords.length}/{words.length} words</span>
          </div>
          <button
            onClick={startNewGame}
            className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 transition-colors text-sm font-medium"
          >
            New Game
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        {/* Word List */}
        <div className="flex flex-wrap justify-center gap-2 max-w-md">
          {words.map(word => (
            <span
              key={word}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                isWordFound(word)
                  ? 'bg-green-600 text-white line-through'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {word}
            </span>
          ))}
        </div>

        {/* Grid */}
        <div
          className={`${cellBgClass} rounded-xl p-2 shadow-lg select-none`}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {grid.map((row, rowIdx) => (
            <div key={rowIdx} className="flex">
              {row.map((cell, colIdx) => (
                <div
                  key={colIdx}
                  onMouseDown={() => handleMouseDown(rowIdx, colIdx)}
                  onMouseEnter={() => handleMouseEnter(rowIdx, colIdx)}
                  onTouchStart={() => handleMouseDown(rowIdx, colIdx)}
                  onTouchMove={(e) => {
                    const touch = e.touches[0]
                    const element = document.elementFromPoint(touch.clientX, touch.clientY)
                    if (element) {
                      const row = element.getAttribute('data-row')
                      const col = element.getAttribute('data-col')
                      if (row && col) {
                        handleMouseEnter(parseInt(row), parseInt(col))
                      }
                    }
                  }}
                  onTouchEnd={handleMouseUp}
                  data-row={rowIdx}
                  data-col={colIdx}
                  className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-bold text-sm sm:text-base cursor-pointer rounded-lg transition-all transform ${
                    isCellFound(rowIdx, colIdx)
                      ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg shadow-green-500/30'
                      : isCellSelected(rowIdx, colIdx)
                      ? 'bg-gradient-to-br from-blue-300 to-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105'
                      : isDark
                        ? 'bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700'
                        : 'bg-gradient-to-br from-white to-gray-100 hover:from-gray-50 hover:to-gray-200 shadow-md'
                  }`}
                >
                  {cell.letter}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Instructions */}
        <p className="text-sm text-slate-400 text-center max-w-md">
          Click and drag to select letters. Find all hidden words horizontally, vertically, or diagonally!
        </p>
      </main>

      {/* Game Complete Modal */}
      {gameComplete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-8 text-center shadow-2xl`}>
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
            <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              You found all {words.length} words in {formatTime(timer)}!
            </p>
            <button
              onClick={startNewGame}
              className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 transition-colors font-medium"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
