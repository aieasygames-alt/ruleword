import { useState, useCallback } from 'react'

type Props = {
  settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }
}

// Sudoku X puzzle with diagonal constraints
const PUZZLE = [
  [5, 0, 0, 0, 8, 0, 0, 0, 9],
  [0, 0, 3, 0, 0, 0, 7, 0, 0],
  [0, 4, 0, 0, 0, 0, 0, 6, 0],
  [0, 0, 0, 2, 0, 5, 0, 0, 0],
  [7, 0, 0, 0, 4, 0, 0, 0, 1],
  [0, 0, 0, 9, 0, 3, 0, 0, 0],
  [0, 8, 0, 0, 0, 0, 0, 2, 0],
  [0, 0, 1, 0, 0, 0, 9, 0, 0],
  [3, 0, 0, 0, 5, 0, 0, 0, 7],
]

export default function SudokuX({ settings }: Props) {
  const [grid, setGrid] = useState<number[][]>(PUZZLE.map(row => [...row]))
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null)
  const [solved, setSolved] = useState(false)
  const [errors, setErrors] = useState<Set<string>>(new Set())

  const isDark = settings.darkMode
  const isGiven = (row: number, col: number) => PUZZLE[row][col] !== 0

  const checkValid = useCallback((g: number[][]) => {
    const newErrors = new Set<string>()

    // Check rows
    for (let r = 0; r < 9; r++) {
      const seen = new Map<number, number>()
      for (let c = 0; c < 9; c++) {
        if (g[r][c] !== 0) {
          if (seen.has(g[r][c])) {
            newErrors.add(`${r}-${c}`)
            newErrors.add(`${r}-${seen.get(g[r][c])!}`)
          }
          seen.set(g[r][c], c)
        }
      }
    }

    // Check columns
    for (let c = 0; c < 9; c++) {
      const seen = new Map<number, number>()
      for (let r = 0; r < 9; r++) {
        if (g[r][c] !== 0) {
          if (seen.has(g[r][c])) {
            newErrors.add(`${r}-${c}`)
            newErrors.add(`${seen.get(g[r][c])!}-${c}`)
          }
          seen.set(g[r][c], r)
        }
      }
    }

    // Check 3x3 boxes
    for (let boxR = 0; boxR < 3; boxR++) {
      for (let boxC = 0; boxC < 3; boxC++) {
        const seen = new Map<number, [number, number]>()
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const rr = boxR * 3 + r
            const cc = boxC * 3 + c
            if (g[rr][cc] !== 0) {
              if (seen.has(g[rr][cc])) {
                newErrors.add(`${rr}-${cc}`)
                const [pr, pc] = seen.get(g[rr][cc])!
                newErrors.add(`${pr}-${pc}`)
              }
              seen.set(g[rr][cc], [rr, cc])
            }
          }
        }
      }
    }

    // Check main diagonal
    const diag1 = new Map<number, number>()
    for (let i = 0; i < 9; i++) {
      if (g[i][i] !== 0) {
        if (diag1.has(g[i][i])) {
          newErrors.add(`${i}-${i}`)
          newErrors.add(`${diag1.get(g[i][i])!}-${diag1.get(g[i][i])!}`)
        }
        diag1.set(g[i][i], i)
      }
    }

    // Check anti-diagonal
    const diag2 = new Map<number, number>()
    for (let i = 0; i < 9; i++) {
      if (g[i][8 - i] !== 0) {
        if (diag2.has(g[i][8 - i])) {
          newErrors.add(`${i}-${8 - i}`)
          newErrors.add(`${diag2.get(g[i][8 - i])!}-${8 - diag2.get(g[i][8 - i])!}`)
        }
        diag2.set(g[i][8 - i], i)
      }
    }

    setErrors(newErrors)
    return newErrors.size === 0
  }, [])

  const handleInput = useCallback((num: number) => {
    if (!selected || isGiven(selected.row, selected.col)) return

    setGrid(prev => {
      const newGrid = prev.map(row => [...row])
      newGrid[selected.row][selected.col] = num
      checkValid(newGrid)

      // Check if solved
      const isComplete = newGrid.every(row => row.every(cell => cell !== 0))
      if (isComplete && checkValid(newGrid)) {
        setSolved(true)
      }

      return newGrid
    })
  }, [selected, checkValid])

  const handleClick = useCallback((row: number, col: number) => {
    if (!isGiven(row, col)) {
      setSelected({ row, col })
    }
  }, [])

  const reset = () => {
    setGrid(PUZZLE.map(row => [...row]))
    setSelected(null)
    setSolved(false)
    setErrors(new Set())
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>❌ Sudoku X</h1>
      <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
        {settings.language === 'zh' ? '对角线也要1-9' : 'Diagonals must also contain 1-9'}
      </p>

      <div className="grid grid-cols-9 border-2 border-blue-600">
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const isSelected = selected?.row === r && selected?.col === c
            const isDiag = r === c || r + c === 8
            const hasError = errors.has(`${r}-${c}`)
            const boxBorder = (c % 3 === 0 ? 'border-l border-blue-600' : '') + (r % 3 === 0 ? 'border-t border-blue-600' : '')

            return (
              <button
                key={`${r}-${c}`}
                onClick={() => handleClick(r, c)}
                className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-lg font-medium border border-gray-300
                  ${isGiven(r, c) ? 'font-bold' : ''}
                  ${isSelected ? 'bg-blue-200' : isDiag && !isGiven(r, c) ? 'bg-blue-50' : isDark ? 'bg-slate-700' : 'bg-white'}
                  ${hasError ? 'text-red-500' : isDark ? 'text-white' : 'text-gray-900'}
                  ${boxBorder}
                `}
              >
                {cell !== 0 ? cell : ''}
              </button>
            )
          })
        )}
      </div>

      {/* Number pad */}
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

      <button
        onClick={reset}
        className={`mt-4 px-6 py-2 rounded-lg font-medium ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
      >
        {settings.language === 'zh' ? '重置' : 'Reset'}
      </button>

      {solved && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className={`p-8 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <h2 className="text-2xl font-bold text-center text-green-500">
              {settings.language === 'zh' ? '🎉 正确！' : '🎉 Correct!'}
            </h2>
            <button onClick={() => setSolved(false)} className="mt-4 w-full py-2 bg-green-600 text-white rounded-lg">
              {settings.language === 'zh' ? '继续' : 'Continue'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
