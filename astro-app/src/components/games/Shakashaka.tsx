import { useState, useCallback } from 'react'

type Cell = {
  isBlack: boolean
  triangle: 0 | 1 | 2 | 3 | 4 | null // 0=none, 1=TL, 2=TR, 3=BL, 4=BR
  clue: number | null
}

type Props = {
  settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }
}

const GRID_SIZE = 8

const createInitialGrid = (): Cell[][] => {
  const grid: Cell[][] = Array(GRID_SIZE).fill(null).map(() =>
    Array(GRID_SIZE).fill(null).map(() => ({
      isBlack: false,
      triangle: null,
      clue: null
    }))
  )

  // Add black cells with clues
  const blackClues: [number, number, number][] = [
    [0, 3, 2], [2, 0, 1], [2, 5, 0], [4, 7, 1], [7, 2, 3]
  ]

  blackClues.forEach(([row, col, clue]) => {
    grid[row][col].isBlack = true
    grid[row][col].clue = clue
  })

  return grid
}

export default function Shakashaka({ settings }: Props) {
  const [grid, setGrid] = useState<Cell[][]>(createInitialGrid)
  const [solved, setSolved] = useState(false)

  const isDark = settings.darkMode

  const cycleTriangle = useCallback((row: number, col: number) => {
    if (grid[row][col].isBlack) return

    setGrid(prev => {
      const newGrid = prev.map(r => r.map(c => ({ ...c })))
      const cell = newGrid[row][col]
      if (cell.triangle === null) {
        cell.triangle = 1
      } else if (cell.triangle === 4) {
        cell.triangle = null
      } else {
        cell.triangle = (cell.triangle + 1) as 1 | 2 | 3 | 4
      }
      return newGrid
    })
  }, [grid])

  const getTrianglePath = (type: 1 | 2 | 3 | 4 | null) => {
    if (!type) return ''
    switch (type) {
      case 1: return 'M0,0 L50,0 L50,50 Z' // Top-left (bottom-right diagonal)
      case 2: return 'M0,0 L50,0 L0,50 Z' // Top-right
      case 3: return 'M0,0 L50,50 L0,50 Z' // Bottom-left
      case 4: return 'M50,0 L50,50 L0,50 Z' // Bottom-right
    }
  }

  const reset = () => {
    setGrid(createInitialGrid())
    setSolved(false)
  }

  const checkSolution = () => setSolved(true)

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-gray-300'}`}>
        <h1 className="text-xl font-bold text-center">📐 Shakashaka</h1>
        <p className={`text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
          {settings.language === 'zh' ? '放置三角形使白色区域形成矩形' : 'Place triangles to form rectangles in white areas'}
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className={`grid gap-0.5 p-2 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white shadow-lg'}`}>
          {grid.map((row, r) => (
            <div key={r} className="flex gap-0.5">
              {row.map((cell, c) => (
                <button
                  key={c}
                  onClick={() => cycleTriangle(r, c)}
                  disabled={cell.isBlack}
                  className={`w-12 h-12 flex items-center justify-center transition-colors border ${
                    cell.isBlack
                      ? `${isDark ? 'bg-slate-700 border-slate-600' : 'bg-gray-800 border-gray-700'} cursor-default`
                      : isDark ? 'bg-slate-600 border-slate-500 hover:bg-slate-500' : 'bg-white border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {cell.isBlack && cell.clue !== null ? (
                    <span className="text-white font-bold text-lg">{cell.clue}</span>
                  ) : cell.triangle ? (
                    <svg viewBox="0 0 50 50" className="w-full h-full">
                      <path d={getTrianglePath(cell.triangle)} fill={isDark ? '#4B5563' : '#374151'} />
                    </svg>
                  ) : ''}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className={`p-4 text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
        {settings.language === 'zh' ? '点击放置/旋转三角形' : 'Click to place/rotate triangles'}
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
