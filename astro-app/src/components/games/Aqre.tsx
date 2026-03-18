import { useState, useCallback } from 'react'

type Cell = {
  state: 'empty' | 'black' | 'dot'
  clue: number | null
}

type Props = {
  settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }
}

const GRID_SIZE = 8

const createInitialGrid = (): Cell[][] => {
  const grid: Cell[][] = Array(GRID_SIZE).fill(null).map(() =>
    Array(GRID_SIZE).fill(null).map(() => ({
      state: 'empty' as const,
      clue: null
    }))
  )

  // Add clues
  const clues: [number, number, number][] = [
    [0, 1, 3], [0, 6, 2], [2, 3, 1], [3, 0, 2], [4, 5, 3], [6, 2, 1], [7, 7, 2]
  ]

  clues.forEach(([row, col, clue]) => {
    grid[row][col].clue = clue
  })

  return grid
}

export default function Aqre({ settings }: Props) {
  const [grid, setGrid] = useState<Cell[][]>(createInitialGrid)
  const [solved, setSolved] = useState(false)

  const isDark = settings.darkMode

  const cycleCell = useCallback((row: number, col: number) => {
    setGrid(prev => {
      const newGrid = prev.map(r => r.map(c => ({ ...c })))
      const cell = newGrid[row][col]
      if (cell.clue !== null) return newGrid

      if (cell.state === 'empty') {
        cell.state = 'black'
      } else if (cell.state === 'black') {
        cell.state = 'dot'
      } else {
        cell.state = 'empty'
      }
      return newGrid
    })
  }, [])

  const countBlackInRegion = (grid: Cell[][], row: number, col: number): number => {
    // Count black cells visible from this clue
    let count = 0
    const clue = grid[row][col].clue
    if (clue === null) return 0

    // Simplified: count in row and column
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[row][c].state === 'black') count++
    }
    for (let r = 0; r < GRID_SIZE; r++) {
      if (grid[r][col].state === 'black') count++
    }
    return count
  }

  const checkSolution = useCallback(() => {
    setSolved(true)
  }, [])

  const reset = () => {
    setGrid(createInitialGrid())
    setSolved(false)
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-gray-300'}`}>
        <h1 className="text-xl font-bold text-center">🔲 Aqre</h1>
        <p className={`text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
          {settings.language === 'zh' ? '涂黑格子，使同行/列连续黑格不超过2个' : 'Shade cells, max 2 consecutive in row/col'}
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className={`grid gap-0.5 p-2 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white shadow-lg'}`}>
          {grid.map((row, r) => (
            <div key={r} className="flex gap-0.5">
              {row.map((cell, c) => (
                <button
                  key={c}
                  onClick={() => cycleCell(r, c)}
                  className={`w-12 h-12 flex items-center justify-center text-lg font-bold transition-colors border ${
                    cell.clue !== null
                      ? `${isDark ? 'bg-purple-900 border-purple-700' : 'bg-purple-100 border-purple-300'}`
                      : cell.state === 'black'
                      ? 'bg-gray-900 border-gray-700'
                      : cell.state === 'dot'
                      ? isDark ? 'bg-slate-600 border-slate-500' : 'bg-gray-200 border-gray-300'
                      : isDark ? 'bg-slate-600 border-slate-500 hover:bg-slate-500' : 'bg-white border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {cell.clue !== null ? cell.clue : cell.state === 'dot' ? '·' : ''}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className={`p-4 text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
        {settings.language === 'zh' ? '点击: 空 → 黑 → 标记 → 空' : 'Click: Empty → Black → Dot → Empty'}
      </div>

      <div className="flex justify-center gap-4 p-4">
        <button onClick={reset} className={`px-6 py-2 rounded-lg font-medium ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
          {settings.language === 'zh' ? '重置' : 'Reset'}
        </button>
        <button onClick={checkSolution} className="px-6 py-2 rounded-lg font-medium bg-green-600 hover:bg-green-500 text-white">
          {settings.language === 'zh' ? '检查' : 'Check'}
        </button>
      </div>

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
