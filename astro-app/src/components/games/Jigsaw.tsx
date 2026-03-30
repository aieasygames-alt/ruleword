import { useState, useCallback, useEffect } from 'react'

type Piece = {
  id: number
  currentPos: number
  correctPos: number
  image: string
}

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

type Difficulty = 'easy' | 'medium' | 'hard'

const DIFFICULTY_CONFIG = {
  easy: { gridSize: 3, name: '3×3' },
  medium: { gridSize: 4, name: '4×4' },
  hard: { gridSize: 5, name: '5×5' },
}

// Puzzle colors
const COLORS = [
  'from-red-400 to-red-600',
  'from-blue-400 to-blue-600',
  'from-green-400 to-green-600',
  'from-yellow-400 to-yellow-600',
  'from-purple-400 to-purple-600',
  'from-pink-400 to-pink-600',
  'from-cyan-400 to-cyan-600',
  'from-orange-400 to-orange-600',
]

// Count inversions in the permutation
const countInversions = (positions: number[]): number => {
  let inversions = 0
  for (let i = 0; i < positions.length - 1; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      if (positions[i] > positions[j]) {
        inversions++
      }
    }
  }
  return inversions
}

// Check if a puzzle configuration is solvable
// For a sliding puzzle, it's solvable if:
// - Grid width is odd: inversions must be even
// - Grid width is even: (inversions + blank row from bottom) must be odd
const isSolvable = (positions: number[], gridSize: number): boolean => {
  const inversions = countInversions(positions)

  if (gridSize % 2 === 1) {
    // Odd grid: solvable if inversions is even
    return inversions % 2 === 0
  } else {
    // Even grid: need to consider blank position
    // Find where the blank (last piece) is
    const blankIndex = positions.indexOf(positions.length - 1)
    const blankRowFromBottom = gridSize - Math.floor(blankIndex / gridSize)

    // Solvable if (inversions + blankRowFromBottom) is odd
    return (inversions + blankRowFromBottom) % 2 === 1
  }
}

export default function Jigsaw({ settings, onBack, toggleLanguage }: Props) {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [pieces, setPieces] = useState<Piece[]>([])
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null)
  const [moves, setMoves] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [startTime, setStartTime] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)

  const gridSize = DIFFICULTY_CONFIG[difficulty].gridSize
  const totalPieces = gridSize * gridSize

  const t = (en: string, zh: string) => settings.language === 'zh' ? zh : en

  // Generate a solvable puzzle
  const generatePuzzle = useCallback(() => {
    // Create pieces in correct order first
    const newPieces: Piece[] = []
    for (let i = 0; i < totalPieces; i++) {
      newPieces.push({
        id: i,
        currentPos: i,
        correctPos: i,
        image: COLORS[i % COLORS.length],
      })
    }

    // Shuffle positions until we get a solvable configuration
    let attempts = 0
    const maxAttempts = 1000

    while (attempts < maxAttempts) {
      // Shuffle currentPos values
      const positions = Array.from({ length: totalPieces }, (_, i) => i)

      // Fisher-Yates shuffle
      for (let i = positions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[positions[i], positions[j]] = [positions[j], positions[i]]
      }

      // Check if solvable
      if (isSolvable(positions, gridSize)) {
        // Apply positions to pieces
        positions.forEach((pos, index) => {
          newPieces[index].currentPos = pos
        })
        break
      }

      attempts++
    }

    // If we couldn't find a solvable config (shouldn't happen), use a simple swap
    if (attempts >= maxAttempts) {
      // Swap first two pieces - this creates a solvable puzzle for odd grids
      const temp = newPieces[0].currentPos
      newPieces[0].currentPos = newPieces[1].currentPos
      newPieces[1].currentPos = temp
    }

    setPieces(newPieces)
    setMoves(0)
    setIsComplete(false)
    setStartTime(Date.now())
    setElapsedTime(0)
    setSelectedPiece(null)
  }, [totalPieces, gridSize])

  useEffect(() => {
    generatePuzzle()
  }, [generatePuzzle])

  // Timer
  useEffect(() => {
    if (isComplete) return
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime, isComplete])

  // Check completion
  useEffect(() => {
    const complete = pieces.every(p => p.currentPos === p.correctPos)
    if (complete && pieces.length > 0) {
      setIsComplete(true)
    }
  }, [pieces])

  // Click a puzzle piece
  const handlePieceClick = (index: number) => {
    if (isComplete) return

    if (selectedPiece === null) {
      setSelectedPiece(index)
    } else if (selectedPiece === index) {
      setSelectedPiece(null)
    } else {
      // Swap two pieces
      setPieces(prev => {
        const newPieces = [...prev]
        const temp = newPieces[selectedPiece].currentPos
        newPieces[selectedPiece].currentPos = newPieces[index].currentPos
        newPieces[index].currentPos = temp
        return newPieces
      })
      setMoves(m => m + 1)
      setSelectedPiece(null)
    }
  }

  // Get piece at position
  const getPieceAtPosition = (pos: number): Piece | undefined => {
    return pieces.find(p => p.currentPos === pos)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

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
              <span>🧩</span>
              {t('Jigsaw Puzzle', '拼图游戏')}
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

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="flex justify-between mb-4">
          <div className="text-slate-400">
            {t('Moves', '步数')}: <span className="text-white font-bold">{moves}</span>
          </div>
          <div className="text-slate-400">
            {t('Time', '时间')}: <span className="text-white font-bold">{formatTime(elapsedTime)}</span>
          </div>
        </div>

        {/* Difficulty Selector */}
        <div className="flex justify-center gap-2 mb-4">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
            <button
              key={d}
              onClick={() => { setDifficulty(d) }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                difficulty === d
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              {DIFFICULTY_CONFIG[d].name}
            </button>
          ))}
        </div>

        {/* Puzzle Grid */}
        <div className="bg-slate-800 rounded-2xl p-4 mb-4">
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
          >
            {Array.from({ length: totalPieces }).map((_, pos) => {
              const piece = getPieceAtPosition(pos)
              if (!piece) return null

              const isSelected = selectedPiece === pieces.findIndex(p => p.currentPos === pos)
              const isCorrect = piece.currentPos === piece.correctPos

              return (
                <button
                  key={pos}
                  onClick={() => handlePieceClick(pieces.findIndex(p => p.currentPos === pos))}
                  className={`
                    aspect-square rounded-lg flex items-center justify-center
                    text-xl font-bold transition-all duration-200
                    bg-gradient-to-br ${piece.image}
                    ${isSelected ? 'ring-4 ring-white scale-105' : 'hover:scale-105'}
                    ${isCorrect ? 'ring-2 ring-green-400' : ''}
                  `}
                >
                  {piece.correctPos + 1}
                </button>
              )
            })}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center text-sm text-slate-400 mb-4">
          {t('Click two pieces to swap them. Arrange numbers 1-' + totalPieces + ' in order.',
            '点击两块拼图交换位置。将数字1-' + totalPieces + '按顺序排列。')}
        </div>

        {/* New Game Button */}
        <button
          onClick={generatePuzzle}
          className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold transition-colors"
        >
          {t('New Game', '新游戏')}
        </button>
      </main>

      {/* Complete Modal */}
      {isComplete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-8 text-center max-w-sm mx-4">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">
              {t('Puzzle Complete!', '拼图完成！')}
            </h2>
            <p className="text-slate-400 mb-2">
              {t('Time', '时间')}: <span className="text-yellow-400 font-bold">{formatTime(elapsedTime)}</span>
            </p>
            <p className="text-slate-400 mb-4">
              {t('Moves', '步数')}: <span className="text-blue-400 font-bold">{moves}</span>
            </p>
            <button
              onClick={generatePuzzle}
              className="px-8 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold transition-colors"
            >
              {t('Play Again', '再玩一次')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
