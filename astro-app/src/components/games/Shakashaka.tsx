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

const PUZZLES: [number, number, number][][] = [
  // Puzzle 1
  [
    [0, 3, 2], [2, 0, 1], [2, 5, 0], [4, 7, 1], [7, 2, 3]
  ],
  // Puzzle 2
  [
    [0, 0, 1], [1, 4, 2], [3, 7, 0], [5, 1, 3], [6, 6, 2], [7, 3, 1]
  ],
  // Puzzle 3
  [
    [0, 5, 1], [1, 1, 2], [3, 3, 0], [4, 0, 3], [5, 6, 2], [7, 4, 1]
  ],
]

const createInitialGrid = (puzzleIndex: number): Cell[][] => {
  const grid: Cell[][] = Array(GRID_SIZE).fill(null).map(() =>
    Array(GRID_SIZE).fill(null).map(() => ({
      isBlack: false,
      triangle: null,
      clue: null
    }))
  )

  // Add black cells with clues for the selected puzzle
  const blackClues = PUZZLES[puzzleIndex % PUZZLES.length]

  blackClues.forEach(([row, col, clue]) => {
    grid[row][col].isBlack = true
    grid[row][col].clue = clue
  })

  return grid
}

export default function Shakashaka({ settings }: Props) {
  const [puzzleIndex, setPuzzleIndex] = useState(0)
  const [grid, setGrid] = useState<Cell[][]>(() => createInitialGrid(0))
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
    setGrid(createInitialGrid(puzzleIndex))
    setSolved(false)
  }

  const nextPuzzle = () => {
    const nextIndex = (puzzleIndex + 1) % PUZZLES.length
    setPuzzleIndex(nextIndex)
    setGrid(createInitialGrid(nextIndex))
    setSolved(false)
  }

  const checkSolution = () => {
    // Rule 1: Check no 2x2 black cells
    for (let r = 0; r < GRID_SIZE - 1; r++) {
      for (let c = 0; c < GRID_SIZE - 1; c++) {
        if (grid[r][c].isBlack && grid[r + 1][c].isBlack &&
            grid[r][c + 1].isBlack && grid[r + 1][c + 1].isBlack) {
          return
        }
      }
    }

    // Rule 2: Validate triangle count matches clues
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c].clue === null) continue

        // Count triangles around this cell
        let triangleCount = 0

        // Check all 8 adjacent cells for triangles
        const neighbors = [
          [r - 1, c - 1], [r - 1, c], [r - 1, c + 1],
          [r, c - 1], [r, c + 1],
          [r + 1, c - 1], [r + 1, c], [r + 1, c + 1]
        ]

        for (const [nr, nc] of neighbors) {
          if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
            if (grid[nr][nc].triangle !== null) {
              triangleCount++
            }
          }
        }

        if (triangleCount !== grid[r][c].clue) {
          return
        }
      }
    }

    // Rule 3: Check white areas are rectangles (no L-shapes)
    // Use flood fill to find white regions and check if each is a rectangle
    const visited = new Set<string>()

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c].isBlack) continue
        const key = `${r},${c}`
        if (visited.has(key)) continue

        // Start flood fill to find white region
        const region: [number, number][] = []
        const queue: [number, number][] = [[r, c]]
        visited.add(key)

        while (queue.length > 0) {
          const [cr, cc] = queue.shift()!
          region.push([cr, cc])

          const neighbors = [[cr - 1, cc], [cr + 1, cc], [cr, cc - 1], [cr, cc + 1]]
          for (const [nr, nc] of neighbors) {
            if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && !grid[nr][nc].isBlack) {
              const nkey = `${nr},${nc}`
              if (!visited.has(nkey)) {
                visited.add(nkey)
                queue.push([nr, nc])
              }
            }
          }
        }

        // Check if region forms a rectangle
        if (region.length > 0) {
          const minR = Math.min(...region.map(([x]) => x))
          const maxR = Math.max(...region.map(([x]) => x))
          const minC = Math.min(...region.map(([, x]) => x))
          const maxC = Math.max(...region.map(([, x]) => x))

          // Count cells that should be in the rectangle
          const expectedCells = (maxR - minR + 1) * (maxC - minC + 1)

          // Check if region matches rectangle
          const regionSet = new Set(region.map(([x, y]) => `${x},${y}`))
          let actualCells = 0
          for (let i = minR; i <= maxR; i++) {
            for (let j = minC; j <= maxC; j++) {
              if (!grid[i][j].isBlack) {
                actualCells++
                if (!regionSet.has(`${i},${j}`)) {
                  // Region doesn't fill the rectangle completely
                  return
                }
              }
            }
          }

          if (actualCells !== region.length) {
            return
          }
        }
      }
    }

    setSolved(true)
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-gray-300'}`}>
        <h1 className="text-xl font-bold text-center">📐 Shakashaka</h1>
        <p className={`text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
          {settings.language === 'zh' ? '放置三角形使白色区域形成矩形' : 'Place triangles to form rectangles in white areas'}
        </p>
        <p className={`text-center text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
          {settings.language === 'zh'
            ? `谜题 ${puzzleIndex + 1} / ${PUZZLES.length}`
            : `Puzzle ${puzzleIndex + 1} of ${PUZZLES.length}`}
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
        <button onClick={nextPuzzle} className={`px-4 py-2 rounded-lg font-medium ${isDark ? 'bg-indigo-700 hover:bg-indigo-600 text-white' : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800'}`}>
          {settings.language === 'zh' ? '新谜题' : 'New Puzzle'}
        </button>
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
            <p className={`mt-2 text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              {settings.language === 'zh'
                ? `谜题 ${puzzleIndex + 1} / ${PUZZLES.length}`
                : `Puzzle ${puzzleIndex + 1} of ${PUZZLES.length}`}
            </p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setSolved(false)} className={`flex-1 py-2 rounded-lg font-medium ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>
                {settings.language === 'zh' ? '继续' : 'Continue'}
              </button>
              <button onClick={nextPuzzle} className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium">
                {settings.language === 'zh' ? '新谜题' : 'New Puzzle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
