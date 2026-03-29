import { useState, useCallback, useEffect } from 'react'

type CellState = 'empty' | 'black' | 'white'
type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type NurikabeProps = {
  settings: Settings
  onBack: () => void
  toggleLanguage: () => void
  toggleTheme: () => void
  toggleSound: () => void
}

// Predefined puzzles - each number represents a region with that count
const PUZZLES = [
  {
    size: 8,
    numbers: [
      [0, 0, 2, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 3, 0],
      [0, 3, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 2, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 2, 0, 0, 0, 3, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 3, 0, 0, 0, 0, 0, 0],
    ],
  },
  {
    size: 10,
    numbers: [
      [0, 0, 0, 2, 0, 0, 0, 0, 0, 0],
      [0, 3, 0, 0, 0, 0, 0, 4, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
      [2, 0, 0, 0, 0, 0, 3, 0, 0, 0],
      [0, 0, 0, 3, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 4, 0, 0, 0, 0, 0, 0, 3, 0],
      [0, 0, 0, 0, 0, 2, 0, 0, 0, 0],
    ],
  },
]

function createInitialState(puzzle: typeof PUZZLES[0]): CellState[][] {
  return Array(puzzle.size).fill(null).map(() =>
    Array(puzzle.size).fill('empty')
  )
}

// Check if solution is valid
function validateSolution(
  grid: CellState[][],
  numbers: number[][],
  size: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // 1. Each numbered cell must be part of a white region of exactly that size
  const visited = Array(size).fill(null).map(() => Array(size).fill(false))

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (numbers[row][col] > 0 && !visited[row][col]) {
        const targetSize = numbers[row][col]
        const regionCells: { row: number; col: number }[] = []
        const queue = [{ row, col }]
        visited[row][col] = true

        while (queue.length > 0) {
          const current = queue.shift()!
          regionCells.push(current)

          const neighbors = [
            [current.row - 1, current.col],
            [current.row + 1, current.col],
            [current.row, current.col - 1],
            [current.row, current.col + 1],
          ]

          for (const [nr, nc] of neighbors) {
            if (nr >= 0 && nr < size && nc >= 0 && nc < size &&
                !visited[nr][nc] && grid[nr][nc] === 'white') {
              visited[nr][nc] = true
              queue.push({ row: nr, col: nc })
            }
          }
        }

        if (regionCells.length !== targetSize) {
          errors.push(`Region at (${row}, ${col}) has ${regionCells.length} cells, needs ${targetSize}`)
        }
      }
    }
  }

  // 2. Each white region must have exactly one number
  const whiteVisited = Array(size).fill(null).map(() => Array(size).fill(false))
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col] === 'white' && !whiteVisited[row][col]) {
        const queue = [{ row, col }]
        whiteVisited[row][col] = true
        let numberCount = numbers[row][col] > 0 ? 1 : 0

        while (queue.length > 0) {
          const current = queue.shift()!
          const neighbors = [
            [current.row - 1, current.col],
            [current.row + 1, current.col],
            [current.row, current.col - 1],
            [current.row, current.col + 1],
          ]

          for (const [nr, nc] of neighbors) {
            if (nr >= 0 && nr < size && nc >= 0 && nc < size &&
                !whiteVisited[nr][nc] && grid[nr][nc] === 'white') {
              if (numbers[nr][nc] > 0) numberCount++
              whiteVisited[nr][nc] = true
              queue.push({ row: nr, col: nc })
            }
          }
        }

        if (numberCount !== 1) {
          errors.push('A white region must have exactly one number')
        }
      }
    }
  }

  // 3. Black cells must be connected (form one continuous area)
  const blackCells: { row: number; col: number }[] = []
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col] === 'black') {
        blackCells.push({ row, col })
      }
    }
  }

  if (blackCells.length > 0) {
    const blackVisited = Array(size).fill(null).map(() => Array(size).fill(false))
    const queue = [blackCells[0]]
    blackVisited[blackCells[0].row][blackCells[0].col] = true
    let connectedCount = 1

    while (queue.length > 0) {
      const current = queue.shift()!
      const neighbors = [
        [current.row - 1, current.col],
        [current.row + 1, current.col],
        [current.row, current.col - 1],
        [current.row, current.col + 1],
      ]

      for (const [nr, nc] of neighbors) {
        if (nr >= 0 && nr < size && nc >= 0 && nc < size &&
            !blackVisited[nr][nc] && grid[nr][nc] === 'black') {
          blackVisited[nr][nc] = true
          connectedCount++
          queue.push({ row: nr, col: nc })
        }
      }
    }

    if (connectedCount !== blackCells.length) {
      errors.push('Black cells must be connected')
    }
  }

  // 4. No 2x2 blocks of black cells
  for (let row = 0; row < size - 1; row++) {
    for (let col = 0; col < size - 1; col++) {
      if (grid[row][col] === 'black' &&
          grid[row][col + 1] === 'black' &&
          grid[row + 1][col] === 'black' &&
          grid[row + 1][col + 1] === 'black') {
        errors.push('No 2x2 blocks of black cells allowed')
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

export default function Nurikabe({ settings, onBack }: NurikabeProps) {
  const [puzzleIndex, setPuzzleIndex] = useState(0)
  const currentPuzzle = PUZZLES[puzzleIndex]
  const [grid, setGrid] = useState<CellState[][]>(() => createInitialState(currentPuzzle))
  const [isComplete, setIsComplete] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [showErrors, setShowErrors] = useState(false)
  const [timer, setTimer] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const isDark = settings.darkMode

  const bgClass = isDark ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = isDark ? 'text-white' : 'text-gray-900'
  const cellBgClass = isDark ? 'bg-slate-700' : 'bg-gray-200'

  const startNewGame = useCallback((index = 0) => {
    const puzzle = PUZZLES[index % PUZZLES.length]
    setPuzzleIndex(index % PUZZLES.length)
    setGrid(createInitialState(puzzle))
    setIsComplete(false)
    setErrors([])
    setShowErrors(false)
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
    if (currentPuzzle.numbers[row][col] > 0) return // Can't change numbered cells

    setGrid(prev => {
      const newGrid = prev.map(r => [...r])
      const current = newGrid[row][col]

      // Cycle through states: empty -> black -> white -> empty
      if (current === 'empty') {
        newGrid[row][col] = 'black'
      } else if (current === 'black') {
        newGrid[row][col] = 'white'
      } else {
        newGrid[row][col] = 'empty'
      }

      return newGrid
    })
    setShowErrors(false)
  }

  const handleCellRightClick = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault()
    if (currentPuzzle.numbers[row][col] > 0) return

    setGrid(prev => {
      const newGrid = prev.map(r => [...r])
      const current = newGrid[row][col]

      // Right click: empty -> white -> black -> empty (reverse order)
      if (current === 'empty') {
        newGrid[row][col] = 'white'
      } else if (current === 'white') {
        newGrid[row][col] = 'black'
      } else {
        newGrid[row][col] = 'empty'
      }

      return newGrid
    })
    setShowErrors(false)
  }

  const checkSolution = () => {
    const result = validateSolution(grid, currentPuzzle.numbers, currentPuzzle.size)
    if (result.valid) {
      setIsComplete(true)
      setShowErrors(false)
    } else {
      setErrors(result.errors)
      setShowErrors(true)
    }
  }

  const getCellClass = (state: CellState, isNumber: boolean) => {
    if (isNumber) {
      return 'bg-white text-slate-900'
    }
    switch (state) {
      case 'black':
        return 'bg-slate-900'
      case 'white':
        return 'bg-white'
      default:
        return cellBgClass
    }
  }

  const cellSize = currentPuzzle.size === 8 ? 44 : 36

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
            <span className="text-sm text-slate-400">Puzzle #{puzzleIndex + 1}</span>
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
        {/* Errors */}
        {showErrors && errors.length > 0 && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 text-sm max-w-md">
            {errors.map((error, i) => (
              <p key={i}>❌ {error}</p>
            ))}
          </div>
        )}

        {/* Grid */}
        <div className={`rounded-2xl p-2 shadow-2xl ${isDark ? 'bg-gradient-to-br from-slate-600 to-slate-800' : 'bg-gradient-to-br from-gray-400 to-gray-500'}`}>
          {grid.map((row, rowIdx) => (
            <div key={rowIdx} className="flex">
              {row.map((cell, colIdx) => {
                const isNumber = currentPuzzle.numbers[rowIdx][colIdx] > 0
                return (
                  <div
                    key={colIdx}
                    onClick={() => handleCellClick(rowIdx, colIdx)}
                    onContextMenu={(e) => handleCellRightClick(e, rowIdx, colIdx)}
                    className={`flex items-center justify-center font-bold cursor-pointer transition-all ${
                      isNumber
                        ? 'bg-gradient-to-br from-white to-gray-200 text-slate-900 shadow-inner'
                        : cell === 'black'
                        ? 'bg-gradient-to-br from-gray-800 to-gray-950 shadow-inner'
                        : cell === 'white'
                        ? 'bg-gradient-to-br from-white to-gray-100'
                        : isDark
                        ? 'bg-gradient-to-br from-slate-500 to-slate-600 hover:from-slate-400 hover:to-slate-500'
                        : 'bg-gradient-to-br from-gray-200 to-gray-300 hover:from-gray-100 hover:to-gray-200'
                    }`}
                    style={{ width: cellSize, height: cellSize }}
                  >
                    {isNumber && (
                      <span className="text-lg font-bold">{currentPuzzle.numbers[rowIdx][colIdx]}</span>
                    )}
                    {cell === 'white' && !isNumber && (
                      <span className="text-slate-400 text-xs">●</span>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-900"></div>
            <span>Black (Wall)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-white"></div>
            <span>White (Island)</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-sm text-slate-400 text-center max-w-md space-y-2">
          <p>Click to cycle: Empty → Black → White → Empty</p>
          <p>Rules: Each number shows island size. Islands are separated by black walls. Walls must be connected. No 2x2 black blocks.</p>
        </div>
      </main>

      {/* Complete Modal */}
      {isComplete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-8 text-center shadow-2xl`}>
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">Puzzle Solved!</h2>
            <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              Time: {formatTime(timer)}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => startNewGame(puzzleIndex + 1)}
                className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 transition-colors font-medium"
              >
                Next Puzzle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
