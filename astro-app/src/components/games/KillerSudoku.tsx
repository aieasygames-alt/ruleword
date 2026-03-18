import { useState, useCallback } from 'react'

type Props = {
  settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }
}

type Cage = {
  cells: [number, number][]
  sum: number
  color: string
}

const CAGES: Cage[] = [
  { cells: [[0, 0], [0, 1]], sum: 3, color: 'bg-red-200' },
  { cells: [[0, 2], [1, 2]], sum: 15, color: 'bg-blue-200' },
  { cells: [[0, 3], [0, 4], [1, 3]], sum: 22, color: 'bg-green-200' },
  { cells: [[0, 5], [0, 6], [0, 7]], sum: 4, color: 'bg-yellow-200' },
  { cells: [[0, 8], [1, 8], [2, 8]], sum: 16, color: 'bg-purple-200' },
  { cells: [[1, 0], [1, 1], [2, 0]], sum: 20, color: 'bg-pink-200' },
  { cells: [[1, 4], [1, 5], [2, 5]], sum: 14, color: 'bg-indigo-200' },
  { cells: [[1, 6], [1, 7], [2, 7]], sum: 13, color: 'bg-orange-200' },
  { cells: [[2, 1], [2, 2], [3, 2]], sum: 16, color: 'bg-teal-200' },
  { cells: [[2, 3], [2, 4], [3, 4]], sum: 17, color: 'bg-cyan-200' },
  { cells: [[2, 6], [3, 6]], sum: 17, color: 'bg-lime-200' },
  { cells: [[3, 0], [4, 0]], sum: 13, color: 'bg-amber-200' },
  { cells: [[3, 1], [4, 1]], sum: 20, color: 'bg-rose-200' },
  { cells: [[3, 3], [4, 3]], sum: 6, color: 'bg-emerald-200' },
  { cells: [[3, 5], [4, 5]], sum: 14, color: 'bg-violet-200' },
  { cells: [[3, 7], [3, 8]], sum: 13, color: 'bg-fuchsia-200' },
  { cells: [[4, 2], [5, 2]], sum: 9, color: 'bg-sky-200' },
  { cells: [[4, 4], [5, 4], [5, 5]], sum: 11, color: 'bg-red-300' },
  { cells: [[4, 6], [5, 6]], sum: 13, color: 'bg-blue-300' },
  { cells: [[4, 7], [4, 8], [5, 8]], sum: 16, color: 'bg-green-300' },
  { cells: [[5, 0], [5, 1], [6, 0]], sum: 12, color: 'bg-yellow-300' },
  { cells: [[5, 3], [6, 3]], sum: 16, color: 'bg-purple-300' },
  { cells: [[5, 7], [6, 7]], sum: 7, color: 'bg-pink-300' },
  { cells: [[6, 1], [6, 2]], sum: 5, color: 'bg-indigo-300' },
  { cells: [[6, 4], [6, 5], [7, 5]], sum: 20, color: 'bg-orange-300' },
  { cells: [[6, 6], [7, 6]], sum: 6, color: 'bg-teal-300' },
  { cells: [[6, 8], [7, 8]], sum: 15, color: 'bg-cyan-300' },
  { cells: [[7, 0], [7, 1]], sum: 8, color: 'bg-lime-300' },
  { cells: [[7, 2], [7, 3], [7, 4]], sum: 16, color: 'bg-amber-300' },
  { cells: [[7, 7], [8, 7], [8, 8]], sum: 13, color: 'bg-rose-300' },
  { cells: [[8, 0], [8, 1], [8, 2]], sum: 17, color: 'bg-emerald-300' },
  { cells: [[8, 3], [8, 4], [8, 5]], sum: 15, color: 'bg-violet-300' },
  { cells: [[8, 6]], sum: 9, color: 'bg-fuchsia-300' },
]

export default function KillerSudoku({ settings }: Props) {
  const [grid, setGrid] = useState<number[][]>(Array(9).fill(null).map(() => Array(9).fill(0)))
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null)
  const [solved, setSolved] = useState(false)

  const isDark = settings.darkMode

  const getCage = (row: number, col: number) => {
    return CAGES.find(cage => cage.cells.some(([r, c]) => r === row && c === col))
  }

  const checkValid = useCallback((g: number[][]) => {
    // Check all basic Sudoku rules + cage sums
    for (let r = 0; r < 9; r++) {
      const rowSet = new Set(g[r].filter(x => x !== 0))
      if (rowSet.size !== g[r].filter(x => x !== 0).length) return false
    }
    for (let c = 0; c < 9; c++) {
      const colSet = new Set<number>()
      for (let r = 0; r < 9; r++) {
        if (g[r][c] !== 0) {
          if (colSet.has(g[r][c])) return false
          colSet.add(g[r][c])
        }
      }
    }
    for (let br = 0; br < 3; br++) {
      for (let bc = 0; bc < 3; bc++) {
        const boxSet = new Set<number>()
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const val = g[br * 3 + r][bc * 3 + c]
            if (val !== 0) {
              if (boxSet.has(val)) return false
              boxSet.add(val)
            }
          }
        }
      }
    }

    // Check cage sums
    for (const cage of CAGES) {
      const values = cage.cells.map(([r, c]) => g[r][c])
      if (values.every(v => v !== 0)) {
        const sum = values.reduce((a, b) => a + b, 0)
        if (sum !== cage.sum) return false
        if (new Set(values).size !== values.length) return false
      }
    }

    return true
  }, [])

  const handleInput = useCallback((num: number) => {
    if (!selected) return

    setGrid(prev => {
      const newGrid = prev.map(row => [...row])
      newGrid[selected.row][selected.col] = num

      const isComplete = newGrid.every(row => row.every(cell => cell !== 0))
      if (isComplete && checkValid(newGrid)) {
        setSolved(true)
      }

      return newGrid
    })
  }, [selected, checkValid])

  const handleClick = useCallback((row: number, col: number) => {
    setSelected({ row, col })
  }, [])

  const reset = () => {
    setGrid(Array(9).fill(null).map(() => Array(9).fill(0)))
    setSelected(null)
    setSolved(false)
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>💀 Killer Sudoku</h1>
      <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
        {settings.language === 'zh' ? '虚线格内数字之和等于角上数字' : 'Numbers in dotted areas sum to the corner value'}
      </p>

      <div className="grid grid-cols-9 border-2 border-gray-800">
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const isSelected = selected?.row === r && selected?.col === c
            const cage = getCage(r, c)
            const isCageStart = cage && cage.cells[0][0] === r && cage.cells[0][1] === c
            const boxBorder = (c % 3 === 0 ? 'border-l-2 border-gray-800' : 'border-l border-gray-400') +
                              (r % 3 === 0 ? 'border-t-2 border-gray-800' : 'border-t border-gray-400')

            return (
              <button
                key={`${r}-${c}`}
                onClick={() => handleClick(r, c)}
                className={`w-10 h-10 sm:w-12 sm:h-12 flex flex-col items-center justify-center text-lg font-medium relative
                  ${cage?.color || (isDark ? 'bg-slate-700' : 'bg-white')}
                  ${isSelected ? 'ring-2 ring-blue-500 z-10' : ''}
                  ${boxBorder}
                `}
              >
                {isCageStart && <span className="absolute top-0.5 left-1 text-xs font-bold opacity-70">{cage!.sum}</span>}
                <span className={`text-xl ${isDark ? 'text-gray-900' : 'text-gray-900'}`}>{cell !== 0 ? cell : ''}</span>
              </button>
            )
          })
        )}
      </div>

      <div className="flex gap-2 mt-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            onClick={() => handleInput(num)}
            className={`w-10 h-10 rounded-lg font-medium text-lg ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleInput(0)}
          className={`w-10 h-10 rounded-lg font-medium ${isDark ? 'bg-red-900 hover:bg-red-800 text-white' : 'bg-red-100 hover:bg-red-200 text-red-600'}`}
        >
          ✕
        </button>
      </div>

      <button onClick={reset} className={`mt-4 px-6 py-2 rounded-lg font-medium ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
        {settings.language === 'zh' ? '重置' : 'Reset'}
      </button>

      {solved && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className={`p-8 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <h2 className="text-2xl font-bold text-center text-green-500">🎉 {settings.language === 'zh' ? '正确！' : 'Correct!'}</h2>
            <button onClick={() => setSolved(false)} className="mt-4 w-full py-2 bg-green-600 text-white rounded-lg">
              {settings.language === 'zh' ? '继续' : 'Continue'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
