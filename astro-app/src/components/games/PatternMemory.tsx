import { useState, useCallback, useEffect } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type PatternMemoryProps = {
  settings: Settings
  onBack: () => void
  toggleLanguage: () => void
  toggleTheme: () => void
  toggleSound: () => void
}

type GameState = 'idle' | 'showing' | 'input' | 'correct' | 'wrong'

const GRID_SIZES = [3, 3, 4, 4, 5, 5, 6, 6] // Grid size for each level
const PATTERN_COUNTS = [3, 4, 4, 5, 5, 6, 6, 7] // Number of cells to remember

const COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
]

export default function PatternMemory({ settings, onBack }: PatternMemoryProps) {
  const [gameState, setGameState] = useState<GameState>('idle')
  const [level, setLevel] = useState(1)
  const [gridSize, setGridSize] = useState(3)
  const [pattern, setPattern] = useState<{ row: number; col: number; color: string }[]>([])
  const [userPattern, setUserPattern] = useState<{ row: number; col: number; color: string }[]>([])
  const [highlightedCells, setHighlightedCells] = useState<Set<string>>(new Set())
  const [selectedColor, setSelectedColor] = useState(COLORS[0])
  const [showTime, setShowTime] = useState(2000)
  const [highScore, setHighScore] = useState(0)
  const [attempts, setAttempts] = useState(3)

  const isDark = settings.darkMode

  const bgClass = isDark ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = isDark ? 'text-white' : 'text-gray-900'

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('patternMemory_highScore')
    if (saved) setHighScore(parseInt(saved) || 0)
  }, [])

  // Save high score
  useEffect(() => {
    if (level > highScore) {
      setHighScore(level)
      localStorage.setItem('patternMemory_highScore', level.toString())
    }
  }, [level, highScore])

  const generatePattern = useCallback((lvl: number) => {
    const size = GRID_SIZES[Math.min(lvl - 1, GRID_SIZES.length - 1)]
    const count = PATTERN_COUNTS[Math.min(lvl - 1, PATTERN_COUNTS.length - 1)]
    const time = Math.max(1000, 2000 + (lvl - 1) * 500)

    setGridSize(size)
    setShowTime(time)

    // Generate random pattern
    const cells: { row: number; col: number; color: string }[] = []
    const used = new Set<string>()

    while (cells.length < count) {
      const row = Math.floor(Math.random() * size)
      const col = Math.floor(Math.random() * size)
      const key = `${row}-${col}`

      if (!used.has(key)) {
        used.add(key)
        const color = COLORS[Math.floor(Math.random() * COLORS.length)]
        cells.push({ row, col, color })
      }
    }

    setPattern(cells)
    return cells
  }, [])

  const startGame = useCallback(() => {
    const cells = generatePattern(level)
    setUserPattern([])
    setHighlightedCells(new Set(cells.map(c => `${c.row}-${c.col}`)))
    setGameState('showing')

    // Hide pattern after show time
    setTimeout(() => {
      setHighlightedCells(new Set())
      setGameState('input')
    }, showTime)
  }, [level, generatePattern, showTime])

  const handleCellClick = (row: number, col: number) => {
    if (gameState !== 'input') return

    const key = `${row}-${col}`
    const newHighlighted = new Set(highlightedCells)

    if (newHighlighted.has(key)) {
      // Remove cell
      newHighlighted.delete(key)
      setUserPattern(prev => prev.filter(c => !(c.row === row && c.col === col)))
    } else {
      // Add cell with selected color
      newHighlighted.add(key)
      setUserPattern(prev => [...prev, { row, col, color: selectedColor }])
    }

    setHighlightedCells(newHighlighted)
  }

  const getColorForCell = (row: number, col: number) => {
    const userCell = userPattern.find(c => c.row === row && c.col === col)
    return userCell?.color || null
  }

  const checkPattern = () => {
    // Check if pattern matches
    if (userPattern.length !== pattern.length) {
      setGameState('wrong')
      handleWrong()
      return
    }

    const userSet = new Set(userPattern.map(c => `${c.row}-${c.col}-${c.color}`))
    const patternSet = new Set(pattern.map(c => `${c.row}-${c.col}-${c.color}`))

    let allMatch = true
    for (const cell of patternSet) {
      if (!userSet.has(cell)) {
        allMatch = false
        break
      }
    }

    if (allMatch) {
      setGameState('correct')
      setTimeout(() => {
        setLevel(prev => prev + 1)
        startGame()
      }, 1500)
    } else {
      setGameState('wrong')
      handleWrong()
    }
  }

  const handleWrong = () => {
    const newAttempts = attempts - 1
    setAttempts(newAttempts)

    if (newAttempts <= 0) {
      setTimeout(() => {
        setGameState('idle')
        setLevel(1)
        setAttempts(3)
      }, 2000)
    } else {
      setTimeout(() => {
        setUserPattern([])
        setHighlightedCells(new Set())
        setGameState('input')
      }, 1500)
    }
  }

  const showCorrectPattern = () => {
    const correctCells = new Set(pattern.map(c => `${c.row}-${c.col}`))
    setHighlightedCells(correctCells)
  }

  useEffect(() => {
    if (gameState === 'wrong') {
      showCorrectPattern()
    }
  }, [gameState])

  const getCellSize = () => {
    if (gridSize <= 3) return 80
    if (gridSize <= 4) return 64
    if (gridSize <= 5) return 52
    return 44
  }

  const cellSize = getCellSize()

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} flex flex-col`}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/90 border-b border-slate-800 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm"
          >
            ← Back
          </button>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-xs text-slate-400">Level</div>
              <div className="text-lg font-bold text-green-400">{level}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400">Best</div>
              <div className="text-lg font-bold text-yellow-400">{highScore}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400">Tries</div>
              <div className="text-lg font-bold text-blue-400">{attempts}/3</div>
            </div>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        {/* Idle State */}
        {gameState === 'idle' && (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🎨</div>
            <h1 className="text-3xl font-bold">Pattern Memory</h1>
            <p className="text-slate-400 max-w-sm mx-auto">
              Memorize the colored pattern shown on the grid, then recreate it exactly!
            </p>
            <button
              onClick={startGame}
              className="px-8 py-3 rounded-xl bg-green-600 hover:bg-green-500 transition-colors font-bold text-lg"
            >
              Start Game
            </button>
            {highScore > 0 && (
              <p className="text-slate-400 text-sm">
                Your best: Level {highScore}
              </p>
            )}
          </div>
        )}

        {/* Showing State */}
        {gameState === 'showing' && (
          <div className="text-center space-y-4">
            <p className="text-slate-400">Memorize this pattern:</p>
            <div className="bg-slate-800 rounded-xl p-4 inline-block">
              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)` }}>
                {Array(gridSize).fill(null).map((_, row) =>
                  Array(gridSize).fill(null).map((_, col) => {
                    const patternCell = pattern.find(c => c.row === row && c.col === col)
                    return (
                      <div
                        key={`${row}-${col}`}
                        className={`rounded-lg transition-colors ${
                          patternCell ? patternCell.color : isDark ? 'bg-slate-700' : 'bg-gray-300'
                        }`}
                        style={{ width: cellSize, height: cellSize }}
                      />
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Input State */}
        {gameState === 'input' && (
          <div className="text-center space-y-4">
            <p className="text-slate-400">Recreate the pattern ({pattern.length} cells):</p>

            {/* Color Picker */}
            <div className="flex justify-center gap-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-lg ${color} transition-transform ${
                    selectedColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>

            <div className="bg-slate-800 rounded-xl p-4 inline-block">
              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)` }}>
                {Array(gridSize).fill(null).map((_, row) =>
                  Array(gridSize).fill(null).map((_, col) => {
                    const cellColor = getColorForCell(row, col)
                    return (
                      <div
                        key={`${row}-${col}`}
                        onClick={() => handleCellClick(row, col)}
                        className={`rounded-lg transition-colors cursor-pointer ${
                          cellColor
                            ? cellColor
                            : isDark
                            ? 'bg-slate-700 hover:bg-slate-600'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        style={{ width: cellSize, height: cellSize }}
                      />
                    )
                  })
                )}
              </div>
            </div>

            <button
              onClick={checkPattern}
              disabled={userPattern.length !== pattern.length}
              className="px-8 py-3 rounded-xl bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors font-bold"
            >
              Check ({userPattern.length}/{pattern.length})
            </button>
          </div>
        )}

        {/* Correct State */}
        {gameState === 'correct' && (
          <div className="text-center space-y-4">
            <div className="text-6xl">✅</div>
            <h2 className="text-2xl font-bold text-green-400">Correct!</h2>
            <p className="text-slate-400">Advancing to Level {level + 1}...</p>
          </div>
        )}

        {/* Wrong State */}
        {gameState === 'wrong' && (
          <div className="text-center space-y-4">
            <div className="text-6xl">❌</div>
            <h2 className="text-2xl font-bold text-red-400">Wrong!</h2>
            <div className="bg-slate-800 rounded-xl p-4 inline-block">
              <p className="text-xs text-slate-400 mb-2">Correct pattern:</p>
              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)` }}>
                {Array(gridSize).fill(null).map((_, row) =>
                  Array(gridSize).fill(null).map((_, col) => {
                    const patternCell = pattern.find(c => c.row === row && c.col === col)
                    return (
                      <div
                        key={`${row}-${col}`}
                        className={`rounded-lg ${patternCell ? patternCell.color : isDark ? 'bg-slate-700' : 'bg-gray-300'}`}
                        style={{ width: cellSize, height: cellSize }}
                      />
                    )
                  })
                )}
              </div>
            </div>
            <p className="text-slate-400">
              {attempts > 0 ? `${attempts} attempt${attempts > 1 ? 's' : ''} remaining` : 'Game Over! Starting over...'}
            </p>
          </div>
        )}

        {/* Instructions */}
        {gameState !== 'idle' && (
          <div className="text-sm text-slate-400 text-center max-w-md">
            <p>💡 Tip: Pay attention to both the positions AND colors of each cell!</p>
          </div>
        )}
      </main>
    </div>
  )
}
