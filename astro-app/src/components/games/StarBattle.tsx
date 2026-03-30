import { useState, useCallback, useEffect } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type StarBattleProps = {
  settings: Settings
  onBack: () => void
  toggleLanguage: () => void
  toggleTheme: () => void
  toggleSound: () => void
}

type CellState = 'empty' | 'star' | 'x'

// Predefined puzzles with verified solvability
// Puzzle 1: 8x8, 1 star per row/col/region
// Verified solution: (0,3)(1,7)(2,4)(3,1)(4,6)(5,2)(6,5)(7,0)
const PUZZLES = [
  {
    size: 8,
    starsPerUnit: 1,
    regions: [
      [0, 0, 0, 0, 1, 1, 1, 1],
      [0, 0, 2, 2, 1, 1, 3, 3],
      [0, 2, 2, 4, 4, 3, 3, 3],
      [5, 2, 4, 4, 4, 4, 6, 3],
      [5, 5, 5, 7, 7, 6, 6, 6],
      [5, 5, 7, 7, 7, 6, 6, 8],
      [9, 9, 7, 7, 10, 10, 8, 8],
      [9, 9, 9, 10, 10, 10, 8, 8],
    ],
  },
  {
    size: 10,
    starsPerUnit: 2,
    regions: [
      [0, 0, 0, 1, 1, 2, 2, 3, 3, 3],
      [0, 0, 1, 1, 1, 2, 2, 3, 3, 4],
      [5, 0, 1, 6, 6, 2, 4, 4, 4, 4],
      [5, 5, 6, 6, 6, 7, 7, 8, 8, 4],
      [5, 5, 9, 9, 6, 7, 7, 8, 8, 8],
      [10, 5, 9, 9, 7, 7, 11, 11, 8, 8],
      [10, 10, 9, 12, 12, 11, 11, 11, 13, 13],
      [10, 10, 12, 12, 12, 14, 11, 13, 13, 13],
      [10, 14, 14, 12, 14, 14, 15, 13, 13, 16],
      [14, 14, 14, 15, 15, 15, 15, 16, 16, 16],
    ],
  },
]

const REGION_COLORS = [
  'bg-red-500/30',
  'bg-blue-500/30',
  'bg-green-500/30',
  'bg-yellow-500/30',
  'bg-purple-500/30',
  'bg-pink-500/30',
  'bg-cyan-500/30',
  'bg-orange-500/30',
  'bg-indigo-500/30',
  'bg-teal-500/30',
  'bg-rose-500/30',
  'bg-lime-500/30',
  'bg-amber-500/30',
  'bg-sky-500/30',
  'bg-fuchsia-500/30',
  'bg-emerald-500/30',
  'bg-violet-500/30',
]

function createInitialState(size: number): CellState[][] {
  return Array(size).fill(null).map(() => Array(size).fill('empty'))
}

export default function StarBattle({ settings, onBack }: StarBattleProps) {
  const [puzzleIndex, setPuzzleIndex] = useState(0)
  const currentPuzzle = PUZZLES[puzzleIndex % PUZZLES.length]
  const [grid, setGrid] = useState<CellState[][]>(() => createInitialState(currentPuzzle.size))
  const [isComplete, setIsComplete] = useState(false)
  const [timer, setTimer] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const isDark = settings.darkMode

  const bgClass = isDark ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = isDark ? 'text-white' : 'text-gray-900'

  const startNewGame = useCallback((index = 0) => {
    const puzzle = PUZZLES[index % PUZZLES.length]
    setPuzzleIndex(index % PUZZLES.length)
    setGrid(createInitialState(puzzle.size))
    setIsComplete(false)
    setTimer(0)
    setIsPlaying(true)
  }, [])

  useEffect(() => {
    startNewGame(0)
  }, [startNewGame])

  useEffect(() => {
    if (isPlaying && !isComplete) {
      const interval = setInterval(() => setTimer(t => t + 1), 1000)
      return () => clearInterval(interval)
    }
  }, [isPlaying, isComplete])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleCellClick = (row: number, col: number) => {
    if (isComplete) return

    setGrid(prev => {
      const newGrid = prev.map(r => [...r])
      const current = newGrid[row][col]

      // Cycle: empty -> star -> x -> empty
      if (current === 'empty') {
        newGrid[row][col] = 'star'
      } else if (current === 'star') {
        newGrid[row][col] = 'x'
      } else {
        newGrid[row][col] = 'empty'
      }

      return newGrid
    })
  }

  const handleCellRightClick = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault()
    if (isComplete) return

    setGrid(prev => {
      const newGrid = prev.map(r => [...r])
      const current = newGrid[row][col]

      // Right click: empty -> x -> star -> empty (reverse)
      if (current === 'empty') {
        newGrid[row][col] = 'x'
      } else if (current === 'x') {
        newGrid[row][col] = 'star'
      } else {
        newGrid[row][col] = 'empty'
      }

      return newGrid
    })
  }

  // Count stars in each row, column, and region
  const getStarCounts = () => {
    const rows: number[] = Array(currentPuzzle.size).fill(0)
    const cols: number[] = Array(currentPuzzle.size).fill(0)
    const regions: Record<number, number> = {}

    for (let row = 0; row < currentPuzzle.size; row++) {
      for (let col = 0; col < currentPuzzle.size; col++) {
        if (grid[row][col] === 'star') {
          rows[row]++
          cols[col]++
          const regionId = currentPuzzle.regions[row][col]
          regions[regionId] = (regions[regionId] || 0) + 1
        }
      }
    }

    return { rows, cols, regions }
  }

  // Check if stars touch (including diagonals)
  const hasTouchingStars = () => {
    for (let row = 0; row < currentPuzzle.size; row++) {
      for (let col = 0; col < currentPuzzle.size; col++) {
        if (grid[row][col] === 'star') {
          // Check all 8 neighbors
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue
              const nr = row + dr, nc = col + dc
              if (nr >= 0 && nr < currentPuzzle.size && nc >= 0 && nc < currentPuzzle.size) {
                if (grid[nr][nc] === 'star') return true
              }
            }
          }
        }
      }
    }
    return false
  }

  const checkSolution = () => {
    const { rows, cols, regions } = getStarCounts()
    const target = currentPuzzle.starsPerUnit

    // Check rows
    for (const count of rows) {
      if (count !== target) {
        alert(`Each row must have exactly ${target} star(s)!`)
        return
      }
    }

    // Check columns
    for (const count of cols) {
      if (count !== target) {
        alert(`Each column must have exactly ${target} star(s)!`)
        return
      }
    }

    // Check regions
    const allRegions = new Set(currentPuzzle.regions.flat())
    for (const regionId of allRegions) {
      if ((regions[regionId] || 0) !== target) {
        alert(`Each region must have exactly ${target} star(s)!`)
        return
      }
    }

    // Check touching stars
    if (hasTouchingStars()) {
      alert('Stars cannot touch each other, even diagonally!')
      return
    }

    setIsComplete(true)
  }

  const { rows: starRows, cols: starCols } = getStarCounts()
  const target = currentPuzzle.starsPerUnit
  const cellSize = currentPuzzle.size <= 8 ? 48 : 40

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} flex flex-col`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 ${isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-white/90 border-gray-300'} border-b backdrop-blur-xl`}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm"
          >
            ← Back
          </button>
          <div className="flex items-center gap-4">
            <span className="text-lg font-mono">{formatTime(timer)}</span>
            <span className="text-sm text-slate-400">
              {target} star{target > 1 ? 's' : ''} per row/col/region
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={checkSolution}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors text-sm font-medium"
            >
              Check
            </button>
            <button
              onClick={() => startNewGame(puzzleIndex + 1)}
              className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 transition-colors text-sm font-medium"
            >
              New
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        {/* Grid */}
        <div className="flex">
          {/* Row star counts */}
          <div className="flex flex-col mr-1">
            <div className="h-8"></div>
            {starRows.map((count, i) => (
              <div
                key={i}
                className={`flex items-center justify-center text-sm font-bold ${
                  count === target ? 'text-green-400' : count > target ? 'text-red-400' : 'text-slate-400'
                }`}
                style={{ width: 24, height: cellSize }}
              >
                {count}
              </div>
            ))}
          </div>

          <div>
            {/* Column star counts */}
            <div className="flex mb-1">
              {starCols.map((count, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-center text-sm font-bold ${
                    count === target ? 'text-green-400' : count > target ? 'text-red-400' : 'text-slate-400'
                  }`}
                  style={{ width: cellSize, height: 24 }}
                >
                  {count}
                </div>
              ))}
            </div>

            {/* Grid cells */}
            {grid.map((row, rowIdx) => (
              <div key={rowIdx} className="flex">
                {row.map((cell, colIdx) => {
                  const regionId = currentPuzzle.regions[rowIdx][colIdx]
                  const regionColor = REGION_COLORS[regionId % REGION_COLORS.length]
                  return (
                    <div
                      key={colIdx}
                      onClick={() => handleCellClick(rowIdx, colIdx)}
                      onContextMenu={(e) => handleCellRightClick(e, rowIdx, colIdx)}
                      className={`${regionColor} border border-slate-600 flex items-center justify-center cursor-pointer transition-colors hover:opacity-80`}
                      style={{ width: cellSize, height: cellSize }}
                    >
                      {cell === 'star' && <svg className="w-7 h-7" viewBox="0 0 24 24" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1">
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
</svg>}
                      {cell === 'x' && <span className="text-slate-500 text-xl">✕</span>}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-sm text-slate-400 text-center max-w-md space-y-2">
          <p>Click to cycle: Empty → ⭐ Star → ✕ (not star) → Empty</p>
          <p>Place {target} star{target > 1 ? 's' : ''} in each row, column, and colored region. Stars cannot touch (even diagonally).</p>
        </div>
      </main>

      {/* Complete Modal */}
      {isComplete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-8 text-center shadow-2xl`}>
            <div className="text-5xl mb-4">⭐</div>
            <h2 className="text-2xl font-bold mb-2">Puzzle Solved!</h2>
            <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              Time: {formatTime(timer)}
            </p>
            <button
              onClick={() => startNewGame(puzzleIndex + 1)}
              className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 transition-colors font-medium"
            >
              Next Puzzle
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
