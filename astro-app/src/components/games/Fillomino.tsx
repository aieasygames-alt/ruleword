import { useState, useCallback } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type FillominoProps = {
  settings: Settings
  onBack: () => void
  toggleLanguage: () => void
  toggleTheme: () => void
  toggleSound: () => void
}

// Puzzles: 0 = empty cell, numbers = given values
const PUZZLES: { grid: number[][]; size: number }[] = [
  {
    size: 5,
    grid: [
      [0, 0, 3, 0, 0],
      [0, 0, 0, 0, 0],
      [1, 0, 0, 0, 2],
      [0, 0, 0, 0, 0],
      [0, 0, 2, 0, 0],
    ],
  },
  {
    size: 6,
    grid: [
      [0, 0, 0, 0, 0, 0],
      [0, 2, 0, 0, 3, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 3, 0, 0, 2, 0],
      [0, 0, 0, 0, 0, 0],
    ],
  },
]

export default function Fillomino({ settings, onBack }: FillominoProps) {
  const [puzzleIndex, setPuzzleIndex] = useState(0)
  const puzzle = PUZZLES[puzzleIndex]
  const size = puzzle.size

  const [values, setValues] = useState<number[][]>(() =>
    puzzle.grid.map(row => [...row])
  )
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null)
  const [solved, setSolved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isDark = settings.darkMode
  const bgClass = isDark ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = isDark ? 'text-white' : 'text-gray-900'

  const isGiven = (r: number, c: number) => puzzle.grid[r][c] !== 0

  // Get all regions (connected cells with same value)
  const getRegions = useCallback((grid: number[][]): { value: number; cells: { r: number; c: number }[] }[] => {
    const visited = new Set<string>()
    const regions: { value: number; cells: { r: number; c: number }[] }[] = []

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const key = `${r},${c}`
        if (visited.has(key) || grid[r][c] === 0) continue

        const value = grid[r][c]
        const cells: { r: number; c: number }[] = []
        const queue = [{ r, c }]

        while (queue.length > 0) {
          const curr = queue.shift()!
          const currKey = `${curr.r},${curr.c}`

          if (visited.has(currKey)) continue
          if (curr.r < 0 || curr.r >= size || curr.c < 0 || curr.c >= size) continue
          if (grid[curr.r][curr.c] !== value) continue

          visited.add(currKey)
          cells.push(curr)

          queue.push({ r: curr.r - 1, c: curr.c })
          queue.push({ r: curr.r + 1, c: curr.c })
          queue.push({ r: curr.r, c: curr.c - 1 })
          queue.push({ r: curr.r, c: curr.c + 1 })
        }

        if (cells.length > 0) {
          regions.push({ value, cells })
        }
      }
    }

    return regions
  }, [size])

  // Validate solution
  const validate = useCallback((grid: number[][]): { valid: boolean; error: string | null } => {
    // Check no empty cells
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] === 0) {
          return { valid: false, error: 'Fill all cells' }
        }
      }
    }

    const regions = getRegions(grid)

    // Check each region size equals its value
    for (const region of regions) {
      if (region.cells.length !== region.value) {
        return { valid: false, error: `Region with ${region.value}s has ${region.cells.length} cells (needs ${region.value})` }
      }
    }

    // Check no two regions with same value are adjacent
    for (let i = 0; i < regions.length; i++) {
      for (let j = i + 1; j < regions.length; j++) {
        if (regions[i].value !== regions[j].value) continue

        // Check if adjacent
        for (const cell1 of regions[i].cells) {
          for (const cell2 of regions[j].cells) {
            const dr = Math.abs(cell1.r - cell2.r)
            const dc = Math.abs(cell1.c - cell2.c)
            if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
              return { valid: false, error: `Two regions with ${regions[i].value} are adjacent` }
            }
          }
        }
      }
    }

    return { valid: true, error: null }
  }, [size, getRegions])

  const handleCellClick = (r: number, c: number) => {
    if (solved || isGiven(r, c)) return
    setSelectedCell({ r, c })
  }

  const handleNumberInput = (num: number) => {
    if (!selectedCell || solved || isGiven(selectedCell.r, selectedCell.c)) return

    setValues(prev => {
      const newValues = prev.map(row => [...row])
      newValues[selectedCell.r][selectedCell.c] = num
      return newValues
    })
  }

  const handleClear = () => {
    if (!selectedCell || solved || isGiven(selectedCell.r, selectedCell.c)) return

    setValues(prev => {
      const newValues = prev.map(row => [...row])
      newValues[selectedCell.r][selectedCell.c] = 0
      return newValues
    })
  }

  const checkSolution = () => {
    const { valid, error } = validate(values)
    setError(error)
    if (valid) {
      setSolved(true)
    }
  }

  const resetPuzzle = () => {
    setValues(puzzle.grid.map(row => [...row]))
    setSelectedCell(null)
    setSolved(false)
    setError(null)
  }

  const nextPuzzle = () => {
    const nextIndex = (puzzleIndex + 1) % PUZZLES.length
    setPuzzleIndex(nextIndex)
    setValues(PUZZLES[nextIndex].grid.map(row => [...row]))
    setSelectedCell(null)
    setSolved(false)
    setError(null)
  }

  const getRegionColors = useCallback(() => {
    const regions = getRegions(values)
    const colors: Record<string, string> = {}
    const palette = [
      'bg-blue-500/30', 'bg-green-500/30', 'bg-purple-500/30',
      'bg-red-500/30', 'bg-yellow-500/30', 'bg-pink-500/30',
      'bg-cyan-500/30', 'bg-orange-500/30', 'bg-indigo-500/30',
    ]

    regions.forEach((region, idx) => {
      region.cells.forEach(cell => {
        colors[`${cell.r},${cell.c}`] = palette[idx % palette.length]
      })
    })

    return colors
  }, [values, getRegions])

  const regionColors = getRegionColors()

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
            <span className="text-lg font-bold">Fillomino</span>
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
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
            {values.map((row, r) =>
              row.map((cell, c) => {
                const isSelected = selectedCell?.r === r && selectedCell?.c === c
                const given = isGiven(r, c)
                const colorClass = regionColors[`${r},${c}`] || ''

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-xl font-bold
                      border-2 transition-all
                      ${given ? 'bg-slate-700 border-slate-600' : 'bg-slate-800 border-slate-700'}
                      ${isSelected ? 'ring-2 ring-yellow-400 border-yellow-400' : ''}
                      ${!given && !isSelected ? 'hover:border-slate-500' : ''}
                      ${colorClass}
                    `}
                  >
                    {cell !== 0 ? cell : ''}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Number Input */}
        {selectedCell && !isGiven(selectedCell.r, selectedCell.c) && !solved && (
          <div className="flex flex-wrap gap-2 justify-center max-w-xs">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                onClick={() => handleNumberInput(num)}
                className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 text-lg font-bold transition-colors"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleClear}
              className="w-10 h-10 rounded-lg bg-red-700 hover:bg-red-600 text-sm font-bold transition-colors"
            >
              ✕
            </button>
          </div>
        )}

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
          <p><strong>Fillomino Rules:</strong></p>
          <ul className="text-left list-disc list-inside space-y-1">
            <li>Fill each cell with a number</li>
            <li>Same numbers form connected regions</li>
            <li>Each region's size must equal its number</li>
            <li>Same-valued regions cannot touch (share edge)</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
