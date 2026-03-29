import { useState, useCallback } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type HeyawakeProps = {
  settings: Settings
  onBack: () => void
  toggleLanguage: () => void
  toggleTheme: () => void
  toggleSound: () => void
}

type CellState = 'empty' | 'black' | 'white'
type Room = { id: number; cells: { row: number; col: number }[]; targetBlack: number | null }

// Puzzle: each room has a target count of black cells
const PUZZLES: { grid: number[][]; targets: (number | null)[] }[] = [
  {
    grid: [
      [0, 0, 0, 1, 1, 1],
      [0, 0, 0, 1, 1, 1],
      [2, 2, 0, 1, 1, 1],
      [2, 2, 3, 3, 3, 4],
      [2, 2, 3, 3, 3, 4],
      [2, 2, 3, 3, 3, 4],
    ],
    targets: [2, 2, 1, 3, 1],
  },
  {
    grid: [
      [0, 0, 1, 1, 2, 2],
      [0, 0, 1, 1, 2, 2],
      [3, 3, 3, 4, 4, 2],
      [3, 3, 3, 4, 4, 5],
      [6, 6, 6, 4, 4, 5],
      [6, 6, 6, 7, 7, 5],
    ],
    targets: [2, 1, 2, 2, 1, 1, 2, 1],
  },
]

export default function Heyawake({ settings, onBack }: HeyawakeProps) {
  const [puzzleIndex, setPuzzleIndex] = useState(0)
  const puzzle = PUZZLES[puzzleIndex]
  const size = puzzle.grid.length

  const [cells, setCells] = useState<CellState[][]>(() =>
    Array(size).fill(null).map(() => Array(size).fill('empty'))
  )
  const [solved, setSolved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isDark = settings.darkMode
  const bgClass = isDark ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = isDark ? 'text-white' : 'text-gray-900'

  // Get rooms from puzzle
  const getRooms = useCallback((): Room[] => {
    const roomMap = new Map<number, { row: number; col: number }[]>()
    puzzle.grid.forEach((row, r) => {
      row.forEach((roomId, c) => {
        if (!roomMap.has(roomId)) {
          roomMap.set(roomId, [])
        }
        roomMap.get(roomId)!.push({ row: r, col: c })
      })
    })

    return Array.from(roomMap.entries()).map(([id, cells], idx) => ({
      id,
      cells,
      targetBlack: puzzle.targets[idx],
    }))
  }, [puzzle])

  // Check if black cells form a continuous line of 3+
  const checkTripleBlack = useCallback((grid: CellState[][], r: number, c: number): boolean => {
    const directions = [
      [0, 1], [1, 0], [0, -1], [-1, 0]
    ]

    for (const [dr, dc] of directions) {
      let count = 1
      // Check forward
      let nr = r + dr, nc = c + dc
      while (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] === 'black') {
        count++
        nr += dr
        nc += dc
      }
      // Check backward
      nr = r - dr
      nc = c - dc
      while (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc] === 'black') {
        count++
        nr -= dr
        nc -= dc
      }
      if (count >= 3) return true
    }
    return false
  }, [size])

  // Check if white cells are connected through room borders
  const checkWhiteConnectivity = useCallback((grid: CellState[][]): boolean => {
    const whiteCells: { row: number; col: number }[] = []
    grid.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell === 'white' || cell === 'empty') {
          whiteCells.push({ row: r, col: c })
        }
      })
    })

    if (whiteCells.length === 0) return true

    const visited = new Set<string>()
    const queue = [whiteCells[0]]
    visited.add(`${whiteCells[0].row},${whiteCells[0].col}`)

    while (queue.length > 0) {
      const current = queue.shift()!
      const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]

      for (const [dr, dc] of directions) {
        const nr = current.row + dr
        const nc = current.col + dc

        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          const key = `${nr},${nc}`
          if (!visited.has(key) && (grid[nr][nc] === 'white' || grid[nr][nc] === 'empty')) {
            visited.add(key)
            queue.push({ row: nr, col: nc })
          }
        }
      }
    }

    return visited.size === whiteCells.length
  }, [size])

  // Validate solution
  const validate = useCallback((grid: CellState[][]): { valid: boolean; error: string | null } => {
    const rooms = getRooms()

    // Check room constraints
    for (const room of rooms) {
      const blackCount = room.cells.filter(({ row, col }) => grid[row][col] === 'black').length
      if (room.targetBlack !== null && blackCount !== room.targetBlack && !room.cells.some(({ row, col }) => grid[row][col] === 'empty')) {
        return { valid: false, error: `Room ${room.id}: need ${room.targetBlack} black cells` }
      }
    }

    // Check triple black
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] === 'black' && checkTripleBlack(grid, r, c)) {
          return { valid: false, error: 'No 3+ consecutive black cells allowed' }
        }
      }
    }

    // Check white connectivity
    if (!checkWhiteConnectivity(grid)) {
      return { valid: false, error: 'White cells must be connected' }
    }

    return { valid: true, error: null }
  }, [getRooms, size, checkTripleBlack, checkWhiteConnectivity])

  const handleCellClick = (row: number, col: number) => {
    if (solved) return

    setCells(prev => {
      const newGrid = prev.map(r => [...r])
      const current = newGrid[row][col]

      // Cycle: empty -> black -> white -> empty
      if (current === 'empty') {
        newGrid[row][col] = 'black'
      } else if (current === 'black') {
        newGrid[row][col] = 'white'
      } else {
        newGrid[row][col] = 'empty'
      }

      const { valid, error } = validate(newGrid)
      setError(error)

      // Check if solved
      if (valid && !newGrid.some(row => row.some(cell => cell === 'empty'))) {
        setSolved(true)
      }

      return newGrid
    })
  }

  const resetPuzzle = () => {
    setCells(Array(size).fill(null).map(() => Array(size).fill('empty')))
    setSolved(false)
    setError(null)
  }

  const nextPuzzle = () => {
    const nextIndex = (puzzleIndex + 1) % PUZZLES.length
    setPuzzleIndex(nextIndex)
    setCells(Array(PUZZLES[nextIndex].grid.length).fill(null).map(() => Array(PUZZLES[nextIndex].grid.length).fill('empty')))
    setSolved(false)
    setError(null)
  }

  const rooms = getRooms()
  const getRoomColor = (roomId: number) => {
    const colors = ['bg-blue-900/30', 'bg-green-900/30', 'bg-purple-900/30', 'bg-red-900/30', 'bg-yellow-900/30', 'bg-pink-900/30', 'bg-cyan-900/30', 'bg-orange-900/30']
    return colors[roomId % colors.length]
  }

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
            <span className="text-lg font-bold">Heyawake</span>
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
        {/* Room Targets */}
        <div className="flex flex-wrap gap-2 justify-center max-w-md">
          {rooms.map((room, idx) => (
            <div
              key={room.id}
              className={`px-3 py-1 rounded-lg text-sm ${getRoomColor(room.id)}`}
            >
              Room {idx + 1}: {room.targetBlack !== null ? `${room.targetBlack} black` : 'any'}
            </div>
          ))}
        </div>

        {/* Game Board */}
        <div className={`rounded-2xl p-3 shadow-2xl ${isDark ? 'bg-gradient-to-br from-slate-700 to-slate-900' : 'bg-gradient-to-br from-gray-300 to-gray-400'}`}>
          <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
            {cells.map((row, r) =>
              row.map((cell, c) => {
                const roomId = puzzle.grid[r][c]
                const room = rooms.find(ro => ro.id === roomId)
                const isRoomEdge = room && !room.cells.some(
                  ({ row, col }) =>
                    (row === r && (col === c - 1 || col === c + 1) && puzzle.grid[row][col] !== roomId) ||
                    (col === c && (row === r - 1 || row === r + 1) && puzzle.grid[row][col] !== roomId)
                )

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-all relative
                      ${getRoomColor(roomId)}
                      ${cell === 'black' ? 'bg-gradient-to-br from-gray-800 to-gray-950 shadow-inner' : ''}
                      ${cell === 'white' ? 'bg-gradient-to-br from-white to-gray-200 shadow-sm' : ''}
                      border border-slate-500
                      hover:brightness-125 hover:scale-102
                    `}
                  >
                    {cell === 'black' && <span className="text-slate-400">■</span>}
                    {cell === 'white' && <span className="text-slate-700">□</span>}
                  </button>
                )
              })
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

        {/* Controls */}
        {solved && (
          <button
            onClick={nextPuzzle}
            className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 transition-colors font-medium"
          >
            Next Puzzle
          </button>
        )}

        {/* Instructions */}
        <div className="text-sm text-slate-400 text-center max-w-md space-y-2">
          <p><strong>Heyawake Rules:</strong></p>
          <ul className="text-left list-disc list-inside space-y-1">
            <li>Fill cells black or white</li>
            <li>Each room must have the target number of black cells</li>
            <li>No 3+ consecutive black cells in any row or column</li>
            <li>All white cells must be connected</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
