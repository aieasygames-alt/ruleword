import { useState, useCallback } from 'react'

type Cell = {
  isWall: boolean | null // null = unknown, true = wall, false = no wall
  clue: number | null
  clueDir: 'up' | 'down' | 'left' | 'right' | null
}

type Props = {
  settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }
}

const GRID_SIZE = 7

const createInitialGrid = (): Cell[][] => {
  const grid: Cell[][] = Array(GRID_SIZE).fill(null).map(() =>
    Array(GRID_SIZE).fill(null).map(() => ({
      isWall: null,
      clue: null,
      clueDir: null
    }))
  )

  // Add clues
  const clues: [number, number, number, 'up' | 'down' | 'left' | 'right'][] = [
    [0, 2, 2, 'down'],
    [1, 5, 1, 'left'],
    [3, 1, 3, 'right'],
    [4, 6, 1, 'up'],
    [6, 3, 2, 'left'],
  ]

  clues.forEach(([row, col, num, dir]) => {
    grid[row][col].clue = num
    grid[row][col].clueDir = dir
  })

  return grid
}

export default function CastleWall({ settings }: Props) {
  const [grid, setGrid] = useState<Cell[][]>(createInitialGrid)
  const [solved, setSolved] = useState(false)

  const isDark = settings.darkMode

  const cycleCell = useCallback((row: number, col: number) => {
    if (grid[row][col].clue !== null) return

    setGrid(prev => {
      const newGrid = prev.map(r => r.map(c => ({ ...c })))
      const cell = newGrid[row][col]
      if (cell.isWall === null) {
        cell.isWall = true
      } else if (cell.isWall === true) {
        cell.isWall = false
      } else {
        cell.isWall = null
      }
      return newGrid
    })
  }, [grid])

  const checkSolution = useCallback(() => {
    // Rule 1: Validate clues - count cells until wall in arrow direction
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const clue = grid[r][c].clue
        const dir = grid[r][c].clueDir
        if (clue === null || dir === null) continue

        let count = 0
        let cr = r
        let cc = c

        // Count cells in arrow direction until we hit a wall or edge
        while (true) {
          if (dir === 'up') cr--
          else if (dir === 'down') cr++
          else if (dir === 'left') cc--
          else if (dir === 'right') cc++

          // Check bounds
          if (cr < 0 || cr >= GRID_SIZE || cc < 0 || cc >= GRID_SIZE) break

          // Check if this cell is a wall
          if (grid[cr][cc].isWall === true) break

          count++
        }

        if (count !== clue) {
          return
        }
      }
    }

    // Rule 2: Check walls form a single continuous loop
    const wallCells = new Set<string>()

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c].isWall === true) {
          wallCells.add(`${r},${c}`)
        }
      }
    }

    // Walls must form a loop (connected and forms cycle)
    if (wallCells.size > 0) {
      const visited = new Set<string>()
      const queue: string[] = [Array.from(wallCells)[0]]

      while (queue.length > 0) {
        const current = queue.shift()!
        if (visited.has(current)) continue
        visited.add(current)

        const [r, c] = current.split(',').map(Number)
        const neighbors = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]

        for (const [nr, nc] of neighbors) {
          const key = `${nr},${nc}`
          if (wallCells.has(key) && !visited.has(key)) {
            queue.push(key)
          }
        }
      }

      // All wall cells must be connected
      if (visited.size !== wallCells.size) return
    }

    // Rule 3: Check no 2x2 wall cells
    for (let r = 0; r < GRID_SIZE - 1; r++) {
      for (let c = 0; c < GRID_SIZE - 1; c++) {
        if (grid[r][c].isWall === true && grid[r + 1][c].isWall === true &&
            grid[r][c + 1].isWall === true && grid[r + 1][c + 1].isWall === true) {
          return
        }
      }
    }

    // Rule 4: All cells must be determined (no null values)
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c].isWall === null) {
          return
        }
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
      <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-gray-300'}`}>
        <h1 className="text-xl font-bold text-center">🏰 Castle Wall</h1>
        <p className={`text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
          {settings.language === 'zh' ? '画出城墙包围数字' : 'Draw walls to enclose the clues'}
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
                  disabled={cell.clue !== null}
                  className={`w-12 h-12 flex items-center justify-center text-sm font-bold transition-colors border-2 ${
                    cell.clue !== null
                      ? `${isDark ? 'bg-amber-900 border-amber-700' : 'bg-amber-100 border-amber-300'} cursor-default`
                      : cell.isWall === true
                      ? isDark ? 'bg-slate-700 border-slate-600' : 'bg-gray-700 border-gray-600'
                      : cell.isWall === false
                      ? 'bg-blue-200 border-blue-300'
                      : isDark ? 'bg-slate-600 border-slate-500' : 'bg-white border-gray-300'
                  }`}
                >
                  {cell.clue !== null ? (
                    <div className="flex flex-col items-center">
                      <span className="text-lg">{cell.clue}</span>
                      <span className="text-xs">
                        {cell.clueDir === 'up' && '↑'}
                        {cell.clueDir === 'down' && '↓'}
                        {cell.clueDir === 'left' && '←'}
                        {cell.clueDir === 'right' && '→'}
                      </span>
                    </div>
                  ) : cell.isWall === true ? '█' : cell.isWall === false ? '·' : ''}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className={`p-4 text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
        {settings.language === 'zh' ? '点击: 空 → 墙 → 非墙 → 空' : 'Click: Empty → Wall → No Wall → Empty'}
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
            <button onClick={() => setSolved(false)} className="mt-4 w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg">
              {settings.language === 'zh' ? '继续' : 'Continue'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
