import { useState, useCallback, useEffect } from 'react'
import {
  SHAKASHAKA_PUZZLES,
  checkShakashakaGrid,
  createShakashakaPuzzleGrid,
  cycleShakashakaTriangle,
  type ShakashakaCell as Cell,
  type ShakashakaCheckError as CheckError,
  type ShakashakaTriangle as Triangle,
} from '../../games/shakashaka/logic'

type Props = {
  settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }
  onBack?: () => void
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

// Note on rule model: a triangle cell is treated as "filled" for the rectangle and 2x2 rules.
// The clue rule counts orthogonal neighbors containing a triangle. This is the simplified
// Shakashaka model used by several casual implementations; it keeps the puzzle deterministic
// and lets Check produce unambiguous feedback.

const createInitialGrid = (puzzleIndex: number, solved = false): Cell[][] => {
  return createShakashakaPuzzleGrid(
    SHAKASHAKA_PUZZLES[puzzleIndex % SHAKASHAKA_PUZZLES.length],
    solved,
  )
}

export default function Shakashaka({ settings, onBack }: Props) {
  const [puzzleIndex, setPuzzleIndex] = useState(0)
  const [grid, setGrid] = useState<Cell[][]>(() => createInitialGrid(0))
  const [solved, setSolved] = useState(false)
  const [error, setError] = useState<CheckError | null>(null)

  const isDark = settings.darkMode
  const zh = settings.language === 'zh'

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('fixture') === 'solved') {
      setGrid(createInitialGrid(0, true))
    }
  }, [])

  const cycleTriangle = useCallback((row: number, col: number) => {
    setGrid(prev => {
      const newGrid = prev.map(r => r.map(c => ({ ...c })))
      const cell = newGrid[row][col]
      if (cell.isBlack) return prev
      newGrid[row][col] = cycleShakashakaTriangle(cell)
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
    const nextIndex = (puzzleIndex + 1) % SHAKASHAKA_PUZZLES.length
    setPuzzleIndex(nextIndex)
    setGrid(createInitialGrid(nextIndex))
    setSolved(false)
    setError(null)
  }

  const checkSolution = () => {
    const violation = checkShakashakaGrid(grid)
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
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              data-testid="shakashaka-back"
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors shrink-0 ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              ← {zh ? '返回' : 'Back'}
            </button>
          )}
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold">📐 Shakashaka</h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              {zh ? '放置三角形：黑格数字 = 正交邻居的三角形数，白色区域须为矩形' : 'Place triangles: black numbers count orthogonal triangle neighbors; white areas must be rectangles'}
            </p>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
              {zh ? `谜题 ${puzzleIndex + 1} / ${SHAKASHAKA_PUZZLES.length}` : `Puzzle ${puzzleIndex + 1} of ${SHAKASHAKA_PUZZLES.length}`}
            </p>
          </div>
          <div className="w-[72px] shrink-0" aria-hidden="true" />
        </div>
      </div>

      {error && (
        <div data-testid="shakashaka-error" className="mx-4 mt-4 px-4 py-3 rounded-lg bg-red-100 border border-red-300 text-red-800 text-sm flex items-start gap-2">
          <span className="text-lg leading-none">⚠️</span>
          <span>{error.message}</span>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-4">
        <div data-testid="shakashaka-board" className={`grid gap-0.5 p-2 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white shadow-lg'}`}>
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
                    data-testid={`shakashaka-cell-${r}-${c}`}
                    data-triangle={cell.triangle ?? 'empty'}
                    data-black={cell.isBlack}
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
        <button data-testid="shakashaka-next" onClick={nextPuzzle} className={`px-4 py-2 rounded-lg font-medium ${isDark ? 'bg-indigo-700 hover:bg-indigo-600 text-white' : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800'}`}>
          {zh ? '新谜题' : 'New Puzzle'}
        </button>
        <button data-testid="shakashaka-reset" onClick={reset} className={`px-6 py-2 rounded-lg font-medium ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
          {zh ? '重置' : 'Reset'}
        </button>
        <button data-testid="shakashaka-check" onClick={checkSolution} className="px-6 py-2 rounded-lg font-medium bg-green-600 hover:bg-green-500 text-white">
          {zh ? '检查' : 'Check'}
        </button>
      </div>

      {solved && (
        <div data-testid="shakashaka-win" className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className={`p-8 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <h2 className="text-2xl font-bold text-center text-green-500">🎉 {zh ? '正确！' : 'Correct!'}</h2>
            <p className={`mt-2 text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              {zh ? `谜题 ${puzzleIndex + 1} / ${SHAKASHAKA_PUZZLES.length}` : `Puzzle ${puzzleIndex + 1} of ${SHAKASHAKA_PUZZLES.length}`}
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
