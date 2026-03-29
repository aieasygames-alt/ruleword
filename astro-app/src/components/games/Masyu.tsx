import { useState, useCallback } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type MasyuProps = {
  settings: Settings
  onBack: () => void
  toggleLanguage: () => void
  toggleTheme: () => void
  toggleSound: () => void
}

type CellType = 'empty' | 'black' | 'white'
type EdgeState = 'none' | 'used'

// Puzzles: 0 = empty, 1 = white pearl, 2 = black pearl
const PUZZLES: { grid: number[][]; size: number }[] = [
  {
    size: 6,
    grid: [
      [0, 0, 0, 0, 0, 0],
      [0, 1, 0, 0, 2, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 2, 0, 0, 1, 0],
      [0, 0, 0, 0, 0, 0],
    ],
  },
  {
    size: 8,
    grid: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 0, 0, 0, 2, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 2, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
  },
]

export default function Masyu({ settings, onBack }: MasyuProps) {
  const [puzzleIndex, setPuzzleIndex] = useState(0)
  const puzzle = PUZZLES[puzzleIndex]
  const size = puzzle.size

  // Edges: horizontal edges are indexed by [row][col] for edge to the right of cell
  // vertical edges are indexed by [row][col] for edge below cell
  const [hEdges, setHEdges] = useState<EdgeState[][]>(() =>
    Array(size).fill(null).map(() => Array(size).fill('none'))
  )
  const [vEdges, setVEdges] = useState<EdgeState[][]>(() =>
    Array(size).fill(null).map(() => Array(size).fill('none'))
  )
  const [solved, setSolved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isDark = settings.darkMode
  const bgClass = isDark ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = isDark ? 'text-white' : 'text-gray-900'

  const getCellType = (r: number, c: number): CellType => {
    const val = puzzle.grid[r][c]
    if (val === 1) return 'white'
    if (val === 2) return 'black'
    return 'empty'
  }

  // Get edges connected to a cell
  const getConnectedEdges = useCallback((r: number, c: number): string[] => {
    const connected: string[] = []
    if (c > 0 && vEdges[r]?.[c - 1] === 'used') connected.push('left')
    if (c < size - 1 && vEdges[r]?.[c] === 'used') connected.push('right')
    if (r > 0 && hEdges[r - 1]?.[c] === 'used') connected.push('up')
    if (r < size - 1 && hEdges[r]?.[c] === 'used') connected.push('down')
    return connected
  }, [hEdges, vEdges, size])

  // Validate the loop
  const validateLoop = useCallback((): { valid: boolean; error: string | null } => {
    // Count edges
    let edgeCount = 0
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (hEdges[r][c] === 'used') edgeCount++
        if (vEdges[r][c] === 'used') edgeCount++
      }
    }

    if (edgeCount === 0) return { valid: false, error: null }

    // Find starting point
    let startR = -1, startC = -1
    for (let r = 0; r < size && startR === -1; r++) {
      for (let c = 0; c < size; c++) {
        if (hEdges[r][c] === 'used' || vEdges[r][c] === 'used') {
          startR = r
          startC = c
          break
        }
      }
    }

    if (startR === -1) return { valid: false, error: null }

    // Check if loop is single continuous path
    const visited = new Set<string>()
    let current = { r: startR, c: startC }
    let prevDir = ''

    while (true) {
      const key = `${current.r},${current.c}`
      if (visited.has(key)) {
        // Check if we're back at start
        if (current.r === startR && current.c === startC && visited.size > 2) {
          break // Valid loop
        }
        return { valid: false, error: 'Path crosses itself!' }
      }
      visited.add(key)

      // Find next cell
      const connections = getConnectedEdgesForCell(current.r, current.c)
      const nextDir = connections.find(d => d !== prevDir)

      if (!nextDir) {
        return { valid: false, error: 'Path has loose ends!' }
      }

      prevDir = oppositeDir(nextDir)
      switch (nextDir) {
        case 'up': current = { r: current.r - 1, c: current.c }; break
        case 'down': current = { r: current.r + 1, c: current.c }; break
        case 'left': current = { r: current.r, c: current.c - 1 }; break
        case 'right': current = { r: current.r, c: current.c + 1 }; break
      }

      if (current.r < 0 || current.r >= size || current.c < 0 || current.c >= size) {
        return { valid: false, error: 'Path goes out of bounds!' }
      }

      if (current.r === startR && current.c === startC) break
    }

    // Check pearl constraints
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cellType = getCellType(r, c)
        if (cellType === 'empty') continue

        const conn = getConnectedEdgesForCell(r, c)
        if (conn.length !== 2) continue // No path through this pearl yet

        if (cellType === 'white') {
          // White pearl: must go straight through
          const isStraight = (conn.includes('up') && conn.includes('down')) ||
            (conn.includes('left') && conn.includes('right'))
          if (!isStraight) {
            return { valid: false, error: `White pearl at (${r + 1}, ${c + 1}) must turn` }
          }
        } else if (cellType === 'black') {
          // Black pearl: must turn
          const isTurn = !((conn.includes('up') && conn.includes('down')) ||
            (conn.includes('left') && conn.includes('right')))
          if (!isTurn) {
            return { valid: false, error: `Black pearl at (${r + 1}, ${c + 1}) must not turn` }
          }
        }
      }
    }

    return { valid: true, error: null }
  }, [hEdges, vEdges, size, getConnectedEdges])

  const getConnectedEdgesForCell = (r: number, c: number): string[] => {
    const connected: string[] = []
    if (r > 0 && hEdges[r - 1][c] === 'used') connected.push('up')
    if (r < size - 1 && hEdges[r][c] === 'used') connected.push('down')
    if (c > 0 && vEdges[r][c - 1] === 'used') connected.push('left')
    if (c < size - 1 && vEdges[r][c] === 'used') connected.push('right')
    return connected
  }

  const oppositeDir = (dir: string): string => {
    switch (dir) {
      case 'up': return 'down'
      case 'down': return 'up'
      case 'left': return 'right'
      case 'right': return 'left'
      default: return ''
    }
  }

  const handleHEdgeClick = (r: number, c: number) => {
    if (solved) return
    setHEdges(prev => {
      const newEdges = prev.map(row => [...row])
      newEdges[r][c] = newEdges[r][c] === 'used' ? 'none' : 'used'
      return newEdges
    })
  }

  const handleVEdgeClick = (r: number, c: number) => {
    if (solved) return
    setVEdges(prev => {
      const newEdges = prev.map(row => [...row])
      newEdges[r][c] = newEdges[r][c] === 'used' ? 'none' : 'used'
      return newEdges
    })
  }

  const resetPuzzle = () => {
    setHEdges(Array(size).fill(null).map(() => Array(size).fill('none')))
    setVEdges(Array(size).fill(null).map(() => Array(size).fill('none')))
    setSolved(false)
    setError(null)
  }

  const nextPuzzle = () => {
    const nextIndex = (puzzleIndex + 1) % PUZZLES.length
    const nextSize = PUZZLES[nextIndex].size
    setPuzzleIndex(nextIndex)
    setHEdges(Array(nextSize).fill(null).map(() => Array(nextSize).fill('none')))
    setVEdges(Array(nextSize).fill(null).map(() => Array(nextSize).fill('none')))
    setSolved(false)
    setError(null)
  }

  const checkSolution = () => {
    const { valid, error } = validateLoop()
    setError(error)
    if (valid) {
      setSolved(true)
    }
  }

  const cellSize = size <= 6 ? 48 : 40

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
          <div className="text-center">
            <span className="text-lg font-bold">Masyu</span>
            <span className="text-slate-400 text-sm ml-2">#{puzzleIndex + 1}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={resetPuzzle}
              className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors text-sm"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        {/* Game Board */}
        <div className={`rounded-2xl p-4 shadow-2xl ${isDark ? 'bg-gradient-to-br from-slate-700 to-slate-900' : 'bg-gradient-to-br from-gray-200 to-gray-400'}`}>
          <div className="relative" style={{ width: size * cellSize + 20, height: size * cellSize + 20 }}>
            {/* Grid cells with pearls */}
            {puzzle.grid.map((row, r) =>
              row.map((cell, c) => {
                const cellType = getCellType(r, c)
                return (
                  <div
                    key={`cell-${r}-${c}`}
                    className={`absolute flex items-center justify-center rounded-full
                      ${cellType === 'black' ? 'bg-slate-950 border-2 border-white' : ''}
                      ${cellType === 'white' ? 'bg-white border-2 border-slate-900' : ''}
                    `}
                    style={{
                      left: c * cellSize + 10 - (cellType !== 'empty' ? 8 : 0),
                      top: r * cellSize + 10 - (cellType !== 'empty' ? 8 : 0),
                      width: cellType !== 'empty' ? 16 : 0,
                      height: cellType !== 'empty' ? 16 : 0,
                    }}
                  />
                )
              })
            )}

            {/* Horizontal edges */}
            {hEdges.map((row, r) =>
              row.map((edge, c) => (
                <button
                  key={`h-${r}-${c}`}
                  onClick={() => handleHEdgeClick(r, c)}
                  className="absolute hover:bg-yellow-500/30"
                  style={{
                    left: c * cellSize + 10,
                    top: r * cellSize + 10 + cellSize / 2 - 3,
                    width: cellSize,
                    height: 6,
                  }}
                >
                  {edge === 'used' && (
                    <div className="w-full h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded shadow-lg shadow-amber-500/30" />
                  )}
                </button>
              ))
            )}

            {/* Vertical edges */}
            {vEdges.map((row, r) =>
              row.map((edge, c) => (
                <button
                  key={`v-${r}-${c}`}
                  onClick={() => handleVEdgeClick(r, c)}
                  className="absolute hover:bg-yellow-500/30"
                  style={{
                    left: c * cellSize + 10 + cellSize / 2 - 3,
                    top: r * cellSize + 10,
                    width: 6,
                    height: cellSize,
                  }}
                >
                  {edge === 'used' && (
                    <div className="w-full h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded shadow-lg shadow-amber-500/30" />
                  )}
                </button>
              ))
            )}

            {/* Grid dots */}
            {Array(size + 1).fill(null).map((_, r) =>
              Array(size + 1).fill(null).map((_, c) => (
                <div
                  key={`dot-${r}-${c}`}
                  className={`absolute w-2 h-2 rounded-full shadow-md ${isDark ? 'bg-gradient-to-br from-slate-300 to-slate-500' : 'bg-gradient-to-br from-gray-600 to-gray-800'}`}
                  style={{
                    left: c * cellSize + 9,
                    top: r * cellSize + 9,
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* Status */}
        {error && (
          <div className="text-red-400 text-sm">{error}</div>
        )}
        {solved && (
          <div className="text-green-400 font-bold text-xl">🎉 Solved!</div>
        )}

        {/* Check Button */}
        {!solved && (
          <button
            onClick={checkSolution}
            className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 transition-colors font-medium"
          >
            Check Solution
          </button>
        )}

        {/* Controls */}
        {solved && (
          <button
            onClick={nextPuzzle}
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors font-medium"
          >
            Next Puzzle
          </button>
        )}

        {/* Instructions */}
        <div className="text-sm text-slate-400 text-center max-w-md space-y-2">
          <p><strong>Masyu Rules:</strong></p>
          <ul className="text-left list-disc list-inside space-y-1">
            <li>Draw a single continuous loop</li>
            <li>⚪ White pearl: loop goes straight through</li>
            <li>⚫ Black pearl: loop must turn</li>
            <li>Click on edges to draw the loop</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
