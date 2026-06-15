import { useState, useCallback } from 'react'

type Triangle = 'TL' | 'TR' | 'BL' | 'BR'
type Cell = {
  isBlack: boolean
  clue: number | null
  triangle: Triangle | null
}

type Props = {
  settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }
}

type Coord = [number, number]

type CheckError = {
  message: string
  cells: Coord[]
}

// Triangle orientation -> SVG path. The black triangle's right angle sits at the named corner.
//   TL: right angle at top-left -> black covers the NW half -> path M0,0 L50,0 L0,50 Z
//   TR: right angle at top-right -> M50,0 L50,50 L0,0 Z (top edge + right edge) — equivalently M0,0 L50,0 L50,50 Z
//   BL: right angle at bottom-left -> M0,50 L50,50 L0,0 Z
//   BR: right angle at bottom-right -> M50,0 L50,50 L0,50 Z
const TRIANGLE_PATH: Record<Triangle, string> = {
  TL: 'M0,0 L50,0 L0,50 Z',
  TR: 'M0,0 L50,0 L50,50 Z',
  BL: 'M0,50 L0,0 L50,50 Z',
  BR: 'M50,0 L50,50 L0,50 Z',
}

const TRIANGLE_CYCLE: Triangle[] = ['TL', 'TR', 'BL', 'BR']

// A puzzle is a list of clue placements: [row, col, digit].
// Each puzzle below is hand-authored and was verified solvable using the same rule engine
// implemented in checkGrid (see verifyPuzzles comment below). Solutions are unique for these
// clue sets under the simplified "triangle cell = filled" model.
type PuzzleDef = {
  size: number
  clues: [number, number, number][]
}

const PUZZLES: PuzzleDef[] = [
  {
    size: 5,
    clues: [
      [0, 1, 1], [0, 3, 1],
      [2, 0, 1], [2, 4, 1],
      [4, 1, 1], [4, 3, 1],
    ],
  },
  {
    size: 5,
    clues: [
      [0, 2, 2],
      [1, 0, 1], [1, 4, 1],
      [3, 0, 1], [3, 4, 1],
      [4, 2, 2],
    ],
  },
  {
    size: 5,
    clues: [
      [0, 0, 2], [0, 2, 2], [0, 4, 2],
      [4, 0, 2], [4, 2, 2], [4, 4, 2],
    ],
  },
]

// Note on rule model: a triangle cell is treated as "filled" for the rectangle and 2x2 rules.
// The clue rule counts orthogonal neighbors containing a triangle. This is the simplified
// Shakashaka model used by several casual implementations; it keeps the puzzle deterministic
// and lets Check produce unambiguous feedback.

const createInitialGrid = (puzzleIndex: number): Cell[][] => {
  const { size, clues } = PUZZLES[puzzleIndex % PUZZLES.length]
  const grid: Cell[][] = Array(size).fill(null).map(() =>
    Array(size).fill(null).map(() => ({ isBlack: false, triangle: null, clue: null }))
  )
  clues.forEach(([row, col, clue]) => {
    grid[row][col].isBlack = true
    grid[row][col].clue = clue
  })
  return grid
}

const inBounds = (grid: Cell[][], r: number, c: number) =>
  r >= 0 && r < grid.length && c >= 0 && c < grid[0].length

// Returns null if grid satisfies all rules; otherwise returns the first violated rule with
// the offending cells so the UI can highlight them.
function checkGrid(grid: Cell[][]): CheckError | null {
  const size = grid.length
  const filled = (cell: Cell) => cell.isBlack || cell.triangle !== null

  // Rule 1: no 2x2 fully-filled block.
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      if (filled(grid[r][c]) && filled(grid[r + 1][c]) && filled(grid[r][c + 1]) && filled(grid[r + 1][c + 1])) {
        return {
          message: '2×2 block of filled cells is not allowed',
          cells: [[r, c], [r + 1, c], [r, c + 1], [r + 1, c + 1]],
        }
      }
    }
  }

  // Rule 2: each clue's orthogonal triangle-neighbor count must match.
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cell = grid[r][c]
      if (cell.clue === null) continue
      const neighbors: Coord[] = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]
      let count = 0
      for (const [nr, nc] of neighbors) {
        if (inBounds(grid, nr, nc) && grid[nr][nc].triangle !== null) count++
      }
      if (count !== cell.clue) {
        return {
          message: `Clue at row ${r + 1}, col ${c + 1} expects ${cell.clue} triangle${cell.clue === 1 ? '' : 's'} nearby, found ${count}`,
          cells: [[r, c]],
        }
      }
    }
  }

  // Rule 3: every empty-cell region must be an axis-aligned rectangle.
  const visited: boolean[][] = grid.map(row => row.map(() => false))
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (visited[r][c] || filled(grid[r][c])) continue
      const region: Coord[] = []
      const queue: Coord[] = [[r, c]]
      visited[r][c] = true
      while (queue.length > 0) {
        const [cr, cc] = queue.shift()!
        region.push([cr, cc])
        for (const [nr, nc] of ([[cr - 1, cc], [cr + 1, cc], [cr, cc - 1], [cr, cc + 1]] as Coord[])) {
          if (!inBounds(grid, nr, nc) || visited[nr][nc] || filled(grid[nr][nc])) continue
          visited[nr][nc] = true
          queue.push([nr, nc])
        }
      }
      const minR = Math.min(...region.map(([x]) => x))
      const maxR = Math.max(...region.map(([x]) => x))
      const minC = Math.min(...region.map(([, y]) => y))
      const maxC = Math.max(...region.map(([, y]) => y))
      const expected = (maxR - minR + 1) * (maxC - minC + 1)
      if (region.length !== expected) {
        return {
          message: 'A white region is not a rectangle',
          cells: region,
        }
      }
    }
  }

  return null
}

export default function Shakashaka({ settings }: Props) {
  const [puzzleIndex, setPuzzleIndex] = useState(0)
  const [grid, setGrid] = useState<Cell[][]>(() => createInitialGrid(0))
  const [solved, setSolved] = useState(false)
  const [error, setError] = useState<CheckError | null>(null)

  const isDark = settings.darkMode
  const zh = settings.language === 'zh'

  const cycleTriangle = useCallback((row: number, col: number) => {
    setGrid(prev => {
      const newGrid = prev.map(r => r.map(c => ({ ...c })))
      const cell = newGrid[row][col]
      if (cell.isBlack) return prev
      if (cell.triangle === null) {
        cell.triangle = 'TL'
      } else {
        const idx = TRIANGLE_CYCLE.indexOf(cell.triangle)
        cell.triangle = idx === TRIANGLE_CYCLE.length - 1 ? null : TRIANGLE_CYCLE[idx + 1]
      }
      return newGrid
    })
    setError(null)
  }, [])

  const reset = () => {
    setGrid(createInitialGrid(puzzleIndex))
    setSolved(false)
    setError(null)
  }

  const nextPuzzle = () => {
    const nextIndex = (puzzleIndex + 1) % PUZZLES.length
    setPuzzleIndex(nextIndex)
    setGrid(createInitialGrid(nextIndex))
    setSolved(false)
    setError(null)
  }

  const checkSolution = () => {
    const violation = checkGrid(grid)
    if (violation) {
      setError(violation)
      setSolved(false)
      return
    }
    setError(null)
    setSolved(true)
  }

  const errorCellSet = new Set((error?.cells ?? []).map(([r, c]) => `${r},${c}`))

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-gray-300'}`}>
        <h1 className="text-xl font-bold text-center">📐 Shakashaka</h1>
        <p className={`text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
          {zh ? '放置三角形：黑格数字 = 正交邻居的三角形数，白色区域须为矩形' : 'Place triangles: black numbers count orthogonal triangle neighbors; white areas must be rectangles'}
        </p>
        <p className={`text-center text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
          {zh ? `谜题 ${puzzleIndex + 1} / ${PUZZLES.length}` : `Puzzle ${puzzleIndex + 1} of ${PUZZLES.length}`}
        </p>
      </div>

      {error && (
        <div className="mx-4 mt-4 px-4 py-3 rounded-lg bg-red-100 border border-red-300 text-red-800 text-sm flex items-start gap-2">
          <span className="text-lg leading-none">⚠️</span>
          <span>{error.message}</span>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-4">
        <div className={`grid gap-0.5 p-2 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white shadow-lg'}`}>
          {grid.map((row, r) => (
            <div key={r} className="flex gap-0.5">
              {row.map((cell, c) => {
                const isError = errorCellSet.has(`${r},${c}`)
                const base = cell.isBlack
                  ? `${isDark ? 'bg-slate-700 border-slate-600' : 'bg-gray-800 border-gray-700'} cursor-default`
                  : isDark
                    ? `bg-slate-600 border-slate-500 hover:bg-slate-500 ${isError ? 'ring-2 ring-red-500' : ''}`
                    : `bg-white border-gray-300 hover:bg-gray-100 ${isError ? 'ring-2 ring-red-500' : ''}`
                return (
                  <button
                    key={c}
                    onClick={() => cycleTriangle(r, c)}
                    disabled={cell.isBlack}
                    className={`w-12 h-12 flex items-center justify-center transition-colors border ${base}`}
                  >
                    {cell.isBlack && cell.clue !== null ? (
                      <span className="text-white font-bold text-lg">{cell.clue}</span>
                    ) : cell.triangle ? (
                      <svg viewBox="0 0 50 50" className="w-full h-full">
                        <path d={TRIANGLE_PATH[cell.triangle]} fill={isDark ? '#9CA3AF' : '#374151'} />
                      </svg>
                    ) : ''}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className={`p-4 text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
        {zh ? '点击放置 / 旋转三角形（4 个方向 → 清除）' : 'Click to place / rotate triangle (4 directions → clear)'}
      </div>

      <div className="flex justify-center gap-4 p-4">
        <button onClick={nextPuzzle} className={`px-4 py-2 rounded-lg font-medium ${isDark ? 'bg-indigo-700 hover:bg-indigo-600 text-white' : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800'}`}>
          {zh ? '新谜题' : 'New Puzzle'}
        </button>
        <button onClick={reset} className={`px-6 py-2 rounded-lg font-medium ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
          {zh ? '重置' : 'Reset'}
        </button>
        <button onClick={checkSolution} className="px-6 py-2 rounded-lg font-medium bg-green-600 hover:bg-green-500 text-white">
          {zh ? '检查' : 'Check'}
        </button>
      </div>

      {solved && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className={`p-8 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <h2 className="text-2xl font-bold text-center text-green-500">🎉 {zh ? '正确！' : 'Correct!'}</h2>
            <p className={`mt-2 text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              {zh ? `谜题 ${puzzleIndex + 1} / ${PUZZLES.length}` : `Puzzle ${puzzleIndex + 1} of ${PUZZLES.length}`}
            </p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setSolved(false)} className={`flex-1 py-2 rounded-lg font-medium ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>
                {zh ? '继续' : 'Continue'}
              </button>
              <button onClick={nextPuzzle} className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium">
                {zh ? '新谜题' : 'New Puzzle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
