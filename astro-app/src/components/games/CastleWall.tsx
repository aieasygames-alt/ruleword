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

// 验证过的谜题 - 格式: [row, col, clue, direction]
// clue 表示箭头方向上连续的非城墙格子数量（遇到城墙或边界停止）
const PUZZLES: { clues: [number, number, number, 'up' | 'down' | 'left' | 'right'][], solution: boolean[][] }[] = [
  // Puzzle 1 - 简单正方形城墙
  {
    clues: [
      [0, 3, 3, 'down'],
      [3, 0, 3, 'right'],
      [3, 6, 3, 'left'],
      [6, 3, 3, 'up'],
    ],
    // true = wall, false = no wall
    solution: [
      [false, false, false, true, false, false, false],
      [false, false, false, true, false, false, false],
      [false, false, false, true, false, false, false],
      [true, true, true, false, true, true, true],
      [false, false, false, true, false, false, false],
      [false, false, false, true, false, false, false],
      [false, false, false, true, false, false, false],
    ]
  },
  // Puzzle 2 - L形城墙
  {
    clues: [
      [0, 1, 2, 'down'],
      [1, 5, 2, 'left'],
      [5, 1, 2, 'up'],
      [5, 5, 1, 'right'],
    ],
    solution: [
      [false, true, false, false, false, false, false],
      [false, true, false, false, false, true, false],
      [false, true, false, false, false, true, false],
      [false, true, false, false, false, true, false],
      [false, true, false, false, false, true, false],
      [false, true, true, true, true, true, false],
      [false, false, false, false, false, false, false],
    ]
  },
  // Puzzle 3 - 凹形城墙
  {
    clues: [
      [0, 2, 2, 'down'],
      [0, 4, 2, 'down'],
      [4, 1, 2, 'right'],
      [4, 5, 2, 'left'],
      [6, 3, 2, 'up'],
    ],
    solution: [
      [false, false, true, false, true, false, false],
      [false, false, true, false, true, false, false],
      [false, false, true, false, true, false, false],
      [false, false, true, false, true, false, false],
      [false, true, true, false, true, true, false],
      [false, false, false, false, false, false, false],
      [false, false, false, true, false, false, false],
    ]
  },
]

const createInitialGrid = (puzzleIndex: number): Cell[][] => {
  const grid: Cell[][] = Array(GRID_SIZE).fill(null).map(() =>
    Array(GRID_SIZE).fill(null).map(() => ({
      isWall: null,
      clue: null,
      clueDir: null
    }))
  )

  // Add clues for the selected puzzle
  const puzzle = PUZZLES[puzzleIndex % PUZZLES.length]
  puzzle.clues.forEach(([row, col, num, dir]) => {
    grid[row][col].clue = num
    grid[row][col].clueDir = dir
  })

  return grid
}

export default function CastleWall({ settings }: Props) {
  const [puzzleIndex, setPuzzleIndex] = useState(0)
  const [grid, setGrid] = useState<Cell[][]>(() => createInitialGrid(0))
  const [solved, setSolved] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

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
    setErrorMsg(null)
  }, [grid])

  const checkSolution = useCallback(() => {
    const isZh = settings.language === 'zh'
    const puzzle = PUZZLES[puzzleIndex % PUZZLES.length]

    // Rule 1: All cells must be determined (no null values)
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c].isWall === null) {
          setErrorMsg(isZh ? '还有未确定的格子' : 'All cells must be filled')
          return
        }
      }
    }

    // Rule 2: Validate clues - count non-wall cells in arrow direction until wall or edge
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const clue = grid[r][c].clue
        const dir = grid[r][c].clueDir
        if (clue === null || dir === null) continue

        let count = 0
        let cr = r
        let cc = c

        // Count non-wall cells in arrow direction
        while (true) {
          // Move in direction
          if (dir === 'up') cr--
          else if (dir === 'down') cr++
          else if (dir === 'left') cc--
          else if (dir === 'right') cc++

          // Check bounds
          if (cr < 0 || cr >= GRID_SIZE || cc < 0 || cc >= GRID_SIZE) break

          // Check if this cell is a wall - stop counting
          if (grid[cr][cc].isWall === true) break

          count++
        }

        if (count !== clue) {
          const dirName = dir === 'up' ? '↑' : dir === 'down' ? '↓' : dir === 'left' ? '←' : '→'
          setErrorMsg(isZh
            ? `位置 (${r+1},${c+1}) 的线索 ${clue}${dirName} 不匹配 (实际: ${count})`
            : `Clue ${clue}${dirName} at row ${r+1}, col ${c+1} doesn't match (expected ${clue}, got ${count})`)
          return
        }
      }
    }

    // Rule 3: Check walls form a single continuous loop (each wall cell has exactly 2 wall neighbors)
    const wallCells: [number, number][] = []

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c].isWall === true) {
          wallCells.push([r, c])
        }
      }
    }

    if (wallCells.length === 0) {
      setErrorMsg(isZh ? '没有城墙' : 'No walls placed')
      return
    }

    // Check each wall cell has exactly 2 adjacent wall neighbors (for a proper loop)
    for (const [r, c] of wallCells) {
      let neighbors = 0
      const adjacent = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]
      for (const [nr, nc] of adjacent) {
        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
          if (grid[nr][nc].isWall === true) neighbors++
        }
      }
      if (neighbors !== 2) {
        setErrorMsg(isZh
          ? '城墙必须形成单一连续回路'
          : 'Walls must form a single continuous loop (each wall needs exactly 2 neighbors)')
        return
      }
    }

    // Rule 4: Check all walls are connected (single component)
    const visited = new Set<string>()
    const queue: [number, number][] = [wallCells[0]]

    while (queue.length > 0) {
      const [r, c] = queue.shift()!
      const key = `${r},${c}`
      if (visited.has(key)) continue
      visited.add(key)

      const neighbors = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]
      for (const [nr, nc] of neighbors) {
        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
          if (grid[nr][nc].isWall === true && !visited.has(`${nr},${nc}`)) {
            queue.push([nr, nc])
          }
        }
      }
    }

    if (visited.size !== wallCells.length) {
      setErrorMsg(isZh ? '城墙没有连通' : 'Walls must be connected')
      return
    }

    // Rule 5: Check no 2x2 wall cells
    for (let r = 0; r < GRID_SIZE - 1; r++) {
      for (let c = 0; c < GRID_SIZE - 1; c++) {
        if (grid[r][c].isWall === true && grid[r + 1][c].isWall === true &&
            grid[r][c + 1].isWall === true && grid[r + 1][c + 1].isWall === true) {
          setErrorMsg(isZh ? '不能有2×2的城墙区域' : 'No 2×2 wall areas allowed')
          return
        }
      }
    }

    // Rule 6: Clue cells cannot be walls
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c].clue !== null && grid[r][c].isWall === true) {
          setErrorMsg(isZh ? '线索格不能是城墙' : 'Clue cells cannot be walls')
          return
        }
      }
    }

    setErrorMsg(null)
    setSolved(true)
  }, [grid, puzzleIndex, settings.language])

  const showSolution = useCallback(() => {
    const puzzle = PUZZLES[puzzleIndex % PUZZLES.length]
    setGrid(prev => {
      const newGrid = prev.map(r => r.map(c => ({ ...c })))
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (newGrid[r][c].clue === null) {
            newGrid[r][c].isWall = puzzle.solution[r][c]
          } else {
            newGrid[r][c].isWall = false // Clue cells are never walls
          }
        }
      }
      return newGrid
    })
    setErrorMsg(null)
  }, [puzzleIndex])

  const reset = () => {
    setGrid(createInitialGrid(puzzleIndex))
    setSolved(false)
    setErrorMsg(null)
  }

  const nextPuzzle = () => {
    const nextIndex = (puzzleIndex + 1) % PUZZLES.length
    setPuzzleIndex(nextIndex)
    setGrid(createInitialGrid(nextIndex))
    setSolved(false)
    setErrorMsg(null)
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-gray-300'}`}>
        <h1 className="text-xl font-bold text-center">🏰 Castle Wall</h1>
        <p className={`text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
          {settings.language === 'zh' ? '画出城墙形成回路，数字表示该方向非城墙格数' : 'Draw a wall loop. Numbers show non-wall cells in that direction'}
        </p>
        <p className={`text-center text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
          {settings.language === 'zh'
            ? `谜题 ${puzzleIndex + 1} / ${PUZZLES.length}`
            : `Puzzle ${puzzleIndex + 1} of ${PUZZLES.length}`}
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
                  disabled={cell.clue !== null}
                  className={`w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center text-sm font-bold transition-colors border-2 rounded ${
                    cell.clue !== null
                      ? `${isDark ? 'bg-amber-900/50 border-amber-700' : 'bg-amber-100 border-amber-300'} cursor-default`
                      : cell.isWall === true
                      ? isDark ? 'bg-slate-600 border-slate-500' : 'bg-gray-700 border-gray-600'
                      : cell.isWall === false
                      ? isDark ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-100 border-blue-300'
                      : isDark ? 'bg-slate-700 border-slate-600 hover:bg-slate-600' : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {cell.clue !== null ? (
                    <div className="flex flex-col items-center">
                      <span className={`text-lg font-bold ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>{cell.clue}</span>
                      <span className={`text-xs ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                        {cell.clueDir === 'up' && '↑'}
                        {cell.clueDir === 'down' && '↓'}
                        {cell.clueDir === 'left' && '←'}
                        {cell.clueDir === 'right' && '→'}
                      </span>
                    </div>
                  ) : cell.isWall === true ? (
                    <span className="text-white">■</span>
                  ) : cell.isWall === false ? (
                    <span className={isDark ? 'text-blue-300' : 'text-blue-500'}>·</span>
                  ) : (
                    <span className={isDark ? 'text-slate-500' : 'text-gray-300'}>?</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className={`p-4 text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
        {settings.language === 'zh' ? '点击: ? → 墙(■) → 非墙(·) → ?' : 'Click: ? → Wall(■) → Empty(·) → ?'}
      </div>

      <div className="flex flex-wrap justify-center gap-2 p-4">
        <button onClick={nextPuzzle} className={`px-4 py-2 rounded-lg font-medium ${isDark ? 'bg-indigo-700 hover:bg-indigo-600 text-white' : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800'}`}>
          {settings.language === 'zh' ? '新谜题' : 'New Puzzle'}
        </button>
        <button onClick={reset} className={`px-4 py-2 rounded-lg font-medium ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
          {settings.language === 'zh' ? '重置' : 'Reset'}
        </button>
        <button onClick={checkSolution} className="px-4 py-2 rounded-lg font-medium bg-green-600 hover:bg-green-500 text-white">
          {settings.language === 'zh' ? '检查' : 'Check'}
        </button>
        <button onClick={showSolution} className={`px-4 py-2 rounded-lg font-medium ${isDark ? 'bg-amber-700 hover:bg-amber-600 text-white' : 'bg-amber-100 hover:bg-amber-200 text-amber-800'}`}>
          {settings.language === 'zh' ? '答案' : 'Solution'}
        </button>
      </div>

      {errorMsg && (
        <div className="text-center px-4 py-2">
          <p className="text-red-500 text-sm">{errorMsg}</p>
        </div>
      )}

      {solved && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className={`p-8 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-2xl`}>
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
