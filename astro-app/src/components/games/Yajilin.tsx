import { useState, useCallback } from 'react'

type Cell = {
  isBlack: boolean
  clue: number | null
  clueDir: 'up' | 'down' | 'left' | 'right' | null
  isPath: boolean
}

type Props = {
  settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }
}

const GRID_SIZE = 8

// Pre-defined puzzle with clues
const createInitialGrid = (): Cell[][] => {
  const grid: Cell[][] = Array(GRID_SIZE).fill(null).map(() =>
    Array(GRID_SIZE).fill(null).map(() => ({
      isBlack: false,
      clue: null,
      clueDir: null,
      isPath: false
    }))
  )

  // Add some clues
  const clues: [number, number, number, 'up' | 'down' | 'left' | 'right'][] = [
    [0, 1, 2, 'down'],
    [0, 5, 1, 'left'],
    [2, 0, 1, 'right'],
    [2, 7, 2, 'up'],
    [4, 2, 0, 'down'],
    [5, 6, 1, 'left'],
    [7, 3, 2, 'up'],
  ]

  clues.forEach(([row, col, num, dir]) => {
    grid[row][col].clue = num
    grid[row][col].clueDir = dir
  })

  return grid
}

export default function Yajilin({ settings }: Props) {
  const [grid, setGrid] = useState<Cell[][]>(createInitialGrid)
  const [mode, setMode] = useState<'black' | 'path'>('black')
  const [solved, setSolved] = useState(false)

  const isDark = settings.darkMode

  const toggleCell = useCallback((row: number, col: number) => {
    if (grid[row][col].clue !== null) return // Can't modify clue cells

    setGrid(prev => {
      const newGrid = prev.map(r => r.map(c => ({ ...c })))
      if (mode === 'black') {
        newGrid[row][col].isBlack = !newGrid[row][col].isBlack
        newGrid[row][col].isPath = false
      } else {
        newGrid[row][col].isPath = !newGrid[row][col].isPath
        newGrid[row][col].isBlack = false
      }
      return newGrid
    })
  }, [grid, mode])

  const checkSolution = useCallback(() => {
    // 1. Black cells must not touch orthogonally
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c].isBlack) {
          const neighbors = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]
          for (const [nr, nc] of neighbors) {
            if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
              if (grid[nr][nc].isBlack) {
                setSolved(false)
                return
              }
            }
          }
        }
      }
    }

    // 2. Clue cells must have correct number of black cells in the indicated direction
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c].clue !== null && grid[r][c].clueDir) {
          let count = 0
          let dr = 0, dc = 0
          if (grid[r][c].clueDir === 'up') dr = -1
          else if (grid[r][c].clueDir === 'down') dr = 1
          else if (grid[r][c].clueDir === 'left') dc = -1
          else if (grid[r][c].clueDir === 'right') dc = 1

          let nr = r + dr, nc = c + dc
          while (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
            if (grid[nr][nc].isBlack) count++
            nr += dr
            nc += dc
          }
          if (count !== grid[r][c].clue) {
            setSolved(false)
            return
          }
        }
      }
    }

    // 3. Path cells must form a single connected path visiting all non-black, non-clue cells
    const pathCells: [number, number][] = []
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c].isPath) pathCells.push([r, c])
      }
    }

    if (pathCells.length < 2) {
      setSolved(false)
      return
    }

    // Check connectivity via BFS
    const visited = new Set<string>()
    const queue: [number, number][] = [pathCells[0]]
    visited.add(`${pathCells[0][0]}-${pathCells[0][1]}`)

    while (queue.length > 0) {
      const [cr, cc] = queue.shift()!
      const neighbors = [[cr - 1, cc], [cr + 1, cc], [cr, cc - 1], [cr, cc + 1]]
      for (const [nr, nc] of neighbors) {
        const key = `${nr}-${nc}`
        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE &&
            grid[nr][nc].isPath && !visited.has(key)) {
          visited.add(key)
          queue.push([nr, nc])
        }
      }
    }

    if (visited.size !== pathCells.length) {
      setSolved(false)
      return
    }

    // 4. Every path cell must have exactly 2 path neighbors (forming a loop/line)
    for (const [r, c] of pathCells) {
      let neighborCount = 0
      const neighbors = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]
      for (const [nr, nc] of neighbors) {
        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && grid[nr][nc].isPath) {
          neighborCount++
        }
      }
      if (neighborCount !== 2) {
        setSolved(false)
        return
      }
    }

    setSolved(true)
  }, [grid])

  const reset = () => {
    setGrid(createInitialGrid())
    setSolved(false)
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-gray-300'}`}>
        <h1 className="text-xl font-bold text-center">🧩 Yajilin</h1>
        <p className={`text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
          {settings.language === 'zh' ? '涂黑格并画一条连续回路' : 'Shade cells and draw a single loop'}
        </p>
      </div>

      {/* Mode Selector */}
      <div className="flex justify-center gap-2 p-4">
        <button
          onClick={() => setMode('black')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'black'
              ? 'bg-gray-800 text-white'
              : isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-700'
          }`}
        >
          {settings.language === 'zh' ? '涂黑' : 'Shade'}
        </button>
        <button
          onClick={() => setMode('path')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'path'
              ? 'bg-blue-600 text-white'
              : isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-700'
          }`}
        >
          {settings.language === 'zh' ? '路径' : 'Path'}
        </button>
      </div>

      {/* Grid */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className={`grid gap-0.5 p-2 rounded-2xl shadow-2xl ${isDark ? 'bg-gradient-to-br from-slate-600 to-slate-800' : 'bg-gradient-to-br from-gray-300 to-gray-400'}`}>
          {grid.map((row, r) => (
            <div key={r} className="flex gap-0.5">
              {row.map((cell, c) => (
                <button
                  key={c}
                  onClick={() => toggleCell(r, c)}
                  disabled={cell.clue !== null}
                  className={`relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-sm font-bold transition-all border ${
                    cell.clue !== null
                      ? `${isDark ? 'bg-gradient-to-br from-slate-500 to-slate-600 border-slate-400' : 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300'} cursor-default`
                      : cell.isBlack
                      ? 'bg-gradient-to-br from-gray-800 to-gray-950 border-gray-700 shadow-inner'
                      : cell.isPath
                      ? 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-300 shadow-lg shadow-blue-500/30'
                      : isDark
                      ? 'bg-gradient-to-br from-slate-500 to-slate-600 border-slate-400 hover:from-slate-400 hover:to-slate-500'
                      : 'bg-gradient-to-br from-white to-gray-100 border-gray-300 hover:from-gray-50 hover:to-gray-200'
                  }`}
                >
                  {cell.clue !== null && (
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-bold">{cell.clue}</span>
                      <span className="text-xs text-amber-500">
                        {cell.clueDir === 'up' && '↑'}
                        {cell.clueDir === 'down' && '↓'}
                        {cell.clueDir === 'left' && '←'}
                        {cell.clueDir === 'right' && '→'}
                      </span>
                    </div>
                  )}
                  {cell.isPath && !cell.clue && (() => {
                    const hasPathUp = r > 0 && grid[r - 1][c].isPath
                    const hasPathDown = r < GRID_SIZE - 1 && grid[r + 1][c].isPath
                    const hasPathLeft = c > 0 && grid[r][c - 1].isPath
                    const hasPathRight = c < GRID_SIZE - 1 && grid[r][c + 1].isPath
                    const neighborCount = [hasPathUp, hasPathDown, hasPathLeft, hasPathRight].filter(Boolean).length
                    return (
                      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                        {hasPathUp && <line x1="50" y1="50" x2="50" y2="0" stroke="white" strokeWidth="6" strokeLinecap="round" />}
                        {hasPathDown && <line x1="50" y1="50" x2="50" y2="100" stroke="white" strokeWidth="6" strokeLinecap="round" />}
                        {hasPathLeft && <line x1="50" y1="50" x2="0" y2="50" stroke="white" strokeWidth="6" strokeLinecap="round" />}
                        {hasPathRight && <line x1="50" y1="50" x2="100" y2="50" stroke="white" strokeWidth="6" strokeLinecap="round" />}
                        {neighborCount !== 2 && <circle cx="50" cy="50" r="4" fill="white" />}
                      </svg>
                    )
                  })()}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 p-4">
        <button
          onClick={reset}
          className={`px-6 py-2 rounded-lg font-medium ${
            isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          {settings.language === 'zh' ? '重置' : 'Reset'}
        </button>
        <button
          onClick={checkSolution}
          className="px-6 py-2 rounded-lg font-medium bg-green-600 hover:bg-green-500 text-white"
        >
          {settings.language === 'zh' ? '检查' : 'Check'}
        </button>
      </div>

      {/* Solved Message */}
      {solved && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className={`p-8 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <h2 className="text-2xl font-bold text-center text-green-500">
              {settings.language === 'zh' ? '🎉 正确！' : '🎉 Correct!'}
            </h2>
            <button
              onClick={() => setSolved(false)}
              className="mt-4 w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg"
            >
              {settings.language === 'zh' ? '继续' : 'Continue'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
