import { useState, useCallback } from 'react'

type Cell = {
  state: 'empty' | 'black' | 'dot'
  clues: number[] | null
}

type Props = {
  settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }
}

const GRID_SIZE = 10

const createInitialGrid = (): Cell[][] => {
  const grid: Cell[][] = Array(GRID_SIZE).fill(null).map(() =>
    Array(GRID_SIZE).fill(null).map(() => ({
      state: 'empty' as const,
      clues: null
    }))
  )

  // Add clue cells (clues show lengths of black cell runs around them)
  const clueCells: [number, number, number[]][] = [
    [1, 1, [2, 2]],
    [1, 8, [3]],
    [4, 4, [1, 1, 1]],
    [5, 5, [2, 3]],
    [8, 1, [4]],
    [8, 8, [1, 2, 1]],
  ]

  clueCells.forEach(([row, col, clues]) => {
    grid[row][col].clues = clues
  })

  return grid
}

export default function Tapa({ settings }: Props) {
  const [grid, setGrid] = useState<Cell[][]>(createInitialGrid)
  const [solved, setSolved] = useState(false)

  const isDark = settings.darkMode

  const cycleCell = useCallback((row: number, col: number) => {
    if (grid[row][col].clues !== null) return

    setGrid(prev => {
      const newGrid = prev.map(r => r.map(c => ({ ...c })))
      const cell = newGrid[row][col]
      if (cell.state === 'empty') {
        cell.state = 'black'
      } else if (cell.state === 'black') {
        cell.state = 'dot'
      } else {
        cell.state = 'empty'
      }
      return newGrid
    })
  }, [grid])

  const checkSolution = useCallback(() => {
    // Validate Tapa solution
    const blackCells = new Set<string>()

    // Collect all black cells
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c].state === 'black') {
          blackCells.add(`${r},${c}`)
        }
      }
    }

    // Rule 1: Check all black cells form a single connected component
    if (blackCells.size === 0) return

    const visited = new Set<string>()
    const queue: string[] = [Array.from(blackCells)[0]]

    while (queue.length > 0) {
      const current = queue.shift()!
      if (visited.has(current)) continue
      visited.add(current)

      const [r, c] = current.split(',').map(Number)
      const neighbors = [
        [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]
      ]

      for (const [nr, nc] of neighbors) {
        const key = `${nr},${nc}`
        if (blackCells.has(key) && !visited.has(key)) {
          queue.push(key)
        }
      }
    }

    // All black cells must be visited (connected)
    if (visited.size !== blackCells.size) return

    // Rule 2: Check no 2x2 area of black cells
    for (let r = 0; r < GRID_SIZE - 1; r++) {
      for (let c = 0; c < GRID_SIZE - 1; c++) {
        if (grid[r][c].state === 'black' &&
            grid[r + 1][c].state === 'black' &&
            grid[r][c + 1].state === 'black' &&
            grid[r + 1][c + 1].state === 'black') {
          return
        }
      }
    }

    // Rule 3: Validate clues match
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const clues = grid[r][c].clues
        if (clues === null) continue

        // Get black cells around this clue (8 directions)
        const directions = [
          [-1, 0], [-1, 1], [0, 1], [1, 1],
          [1, 0], [1, -1], [0, -1], [-1, -1]
        ]

        // Find consecutive black cell runs in clockwise order
        const runs: number[] = []
        let inRun = false
        let currentRun = 0

        // Start from top and go clockwise
        const order = [0, 1, 2, 3, 4, 5, 6, 7]
        for (let i = 0; i < 8; i++) {
          const dir = directions[order[i]]
          const nr = r + dir[0]
          const nc = c + dir[1]

          if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && grid[nr][nc].state === 'black') {
            if (!inRun || (i > 0 && directions[order[i - 1]][0] === dir[0] && directions[order[i - 1]][1] === dir[1])) {
              inRun = true
              currentRun++
            } else {
              if (currentRun > 0) runs.push(currentRun)
              currentRun = 1
              inRun = true
            }
          } else {
            if (inRun) {
              runs.push(currentRun)
              currentRun = 0
              inRun = false
            }
          }
        }

        if (currentRun > 0) runs.push(currentRun)

        // Check if runs match clues
        if (runs.length !== clues.length) return

        for (let i = 0; i < clues.length; i++) {
          if (runs[i] !== clues[i]) return
        }
      }
    }

    // All checks passed
    setSolved(true)
  }, [grid])

  const reset = () => {
    setGrid(createInitialGrid())
    setSolved(false)
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-gray-300'}`}>
        <h1 className="text-xl font-bold text-center">⬛ Tapa</h1>
        <p className={`text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
          {settings.language === 'zh' ? '涂黑格子形成连续区域' : 'Shade cells to form a connected wall'}
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        <div className={`grid gap-0.5 p-2 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white shadow-lg'}`}>
          {grid.map((row, r) => (
            <div key={r} className="flex gap-0.5">
              {row.map((cell, c) => (
                <button
                  key={c}
                  onClick={() => cycleCell(r, c)}
                  disabled={cell.clues !== null}
                  className={`w-10 h-10 sm:w-11 sm:h-11 flex flex-wrap items-center justify-center text-xs font-bold transition-colors border ${
                    cell.clues !== null
                      ? `${isDark ? 'bg-amber-900 border-amber-700' : 'bg-amber-100 border-amber-300'} cursor-default`
                      : cell.state === 'black'
                      ? 'bg-gray-900 border-gray-700'
                      : cell.state === 'dot'
                      ? isDark ? 'bg-slate-600 border-slate-500' : 'bg-gray-200 border-gray-300'
                      : isDark ? 'bg-slate-600 border-slate-500 hover:bg-slate-500' : 'bg-white border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {cell.clues ? cell.clues.join(',') : cell.state === 'dot' ? '·' : ''}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className={`p-4 text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
        {settings.language === 'zh' ? '数字表示周围黑色格子的连续长度' : 'Numbers show lengths of consecutive black cell runs'}
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
