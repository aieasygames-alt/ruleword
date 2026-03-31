import { useState, useCallback } from 'react'

type CellState = 'empty' | 'black' | 'dot'

type Cell = {
  state: CellState
  clue: number | null
}

type Props = {
  settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }
}

const GRID_SIZE = 8

// Regions: each cell belongs to a region (identified by number)
// Clues tell how many black cells are in that region
type LevelDef = {
  name: string
  nameZh: string
  regions: number[][] // region ID for each cell
  clues: [number, number, number][] // [row, col, count]
  solution: number[][] // 1=black, 0=empty
}

const LEVELS: LevelDef[] = [
  {
    name: 'Level 1',
    nameZh: '第1关',
    regions: [
      [0, 0, 0, 1, 1, 1, 2, 2],
      [0, 0, 0, 1, 1, 1, 2, 2],
      [3, 3, 0, 1, 1, 4, 4, 2],
      [3, 3, 3, 3, 4, 4, 5, 5],
      [3, 6, 6, 3, 4, 4, 5, 5],
      [6, 6, 7, 7, 7, 5, 5, 8],
      [6, 6, 7, 7, 9, 9, 8, 8],
      [6, 9, 9, 9, 9, 8, 8, 8],
    ],
    clues: [[0, 7, 2], [2, 0, 1], [3, 4, 2], [5, 2, 1], [6, 6, 2], [7, 1, 1]],
    solution: [
      [0, 0, 1, 0, 0, 1, 1, 0],
      [1, 0, 0, 0, 0, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 1],
      [0, 1, 1, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 0, 0],
      [1, 0, 0, 1, 0, 0, 1, 0],
      [1, 0, 1, 0, 1, 0, 0, 1],
      [0, 0, 0, 0, 0, 1, 0, 0],
    ],
  },
  {
    name: 'Level 2',
    nameZh: '第2关',
    regions: [
      [0, 0, 1, 1, 1, 2, 2, 2],
      [0, 0, 0, 1, 2, 2, 3, 3],
      [4, 0, 0, 1, 2, 3, 3, 3],
      [4, 4, 5, 5, 5, 6, 6, 3],
      [4, 4, 5, 5, 6, 6, 7, 7],
      [8, 4, 9, 9, 6, 7, 7, 7],
      [8, 8, 9, 9, 9, 7, 10, 10],
      [8, 8, 8, 9, 10, 10, 10, 10],
    ],
    clues: [[0, 0, 2], [1, 7, 1], [3, 3, 1], [4, 6, 1], [6, 0, 2], [7, 4, 2]],
    solution: [
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 1],
      [0, 1, 1, 0, 0, 0, 1, 0],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [0, 0, 0, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 0, 1, 0],
      [1, 0, 1, 0, 0, 1, 0, 0],
    ],
  },
  {
    name: 'Level 3',
    nameZh: '第3关',
    regions: [
      [0, 0, 0, 1, 1, 2, 2, 2],
      [0, 0, 3, 3, 1, 1, 2, 2],
      [3, 3, 3, 4, 4, 1, 5, 5],
      [6, 3, 4, 4, 7, 7, 5, 5],
      [6, 6, 4, 7, 7, 8, 8, 5],
      [6, 6, 9, 9, 7, 8, 8, 10],
      [9, 9, 9, 10, 10, 8, 10, 10],
      [9, 9, 10, 10, 10, 10, 10, 10],
    ],
    clues: [[0, 6, 1], [2, 2, 2], [3, 0, 1], [4, 5, 2], [5, 7, 1], [6, 3, 2]],
    solution: [
      [0, 0, 1, 0, 0, 0, 1, 0],
      [0, 1, 0, 0, 0, 1, 0, 1],
      [0, 0, 1, 1, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 1, 1, 0],
      [0, 1, 0, 0, 1, 0, 0, 0],
      [0, 1, 0, 1, 0, 0, 1, 1],
      [0, 0, 1, 0, 0, 1, 0, 0],
      [1, 0, 0, 0, 1, 0, 1, 0],
    ],
  },
]

const REGION_COLORS = [
  'bg-blue-100 dark:bg-blue-900/30',
  'bg-green-100 dark:bg-green-900/30',
  'bg-yellow-100 dark:bg-yellow-900/30',
  'bg-pink-100 dark:bg-pink-900/30',
  'bg-purple-100 dark:bg-purple-900/30',
  'bg-orange-100 dark:bg-orange-900/30',
  'bg-teal-100 dark:bg-teal-900/30',
  'bg-red-100 dark:bg-red-900/30',
  'bg-indigo-100 dark:bg-indigo-900/30',
  'bg-cyan-100 dark:bg-cyan-900/30',
  'bg-lime-100 dark:bg-lime-900/30',
]

const createInitialGrid = (levelIndex: number = 0): Cell[][] => {
  const grid: Cell[][] = Array(GRID_SIZE).fill(null).map(() =>
    Array(GRID_SIZE).fill(null).map(() => ({
      state: 'empty' as CellState,
      clue: null,
    }))
  )

  const level = LEVELS[levelIndex % LEVELS.length]
  level.clues.forEach(([row, col, clue]) => {
    grid[row][col].clue = clue
  })

  return grid
}

export default function Aqre({ settings }: Props) {
  const [grid, setGrid] = useState<Cell[][]>(() => createInitialGrid(0))
  const [solved, setSolved] = useState(false)
  const [currentLevel, setCurrentLevel] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

  const isDark = settings.darkMode
  const lang = settings.language
  const level = LEVELS[currentLevel % LEVELS.length]
  const regions = level.regions

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
    setErrorMsg('')
  }, [])

  const checkSolution = useCallback(() => {
    setErrorMsg('')

    // Rule 1: No 2x2 black cells
    for (let r = 0; r < GRID_SIZE - 1; r++) {
      for (let c = 0; c < GRID_SIZE - 1; c++) {
        if (grid[r][c].state === 'black' && grid[r + 1][c].state === 'black' &&
            grid[r][c + 1].state === 'black' && grid[r + 1][c + 1].state === 'black') {
          setErrorMsg(lang === 'zh' ? `2x2黑格在 (${r+1},${c+1})` : `2x2 black area at (${r+1},${c+1})`)
          return
        }
      }
    }

    // Rule 2: Max 2 consecutive black cells in each row
    for (let r = 0; r < GRID_SIZE; r++) {
      let consecutive = 0
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c].state === 'black') {
          consecutive++
          if (consecutive > 2) {
            setErrorMsg(lang === 'zh' ? `第${r+1}行超过2个连续黑格` : `Row ${r+1}: more than 2 consecutive black cells`)
            return
          }
        } else {
          consecutive = 0
        }
      }
    }

    // Rule 2b: Max 2 consecutive black cells in each column
    for (let c = 0; c < GRID_SIZE; c++) {
      let consecutive = 0
      for (let r = 0; r < GRID_SIZE; r++) {
        if (grid[r][c].state === 'black') {
          consecutive++
          if (consecutive > 2) {
            setErrorMsg(lang === 'zh' ? `第${c+1}列超过2个连续黑格` : `Col ${c+1}: more than 2 consecutive black cells`)
            return
          }
        } else {
          consecutive = 0
        }
      }
    }

    // Rule 3: All black cells must be connected (BFS)
    const blackCells = new Set<string>()
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c].state === 'black') {
          blackCells.add(`${r},${c}`)
        }
      }
    }

    if (blackCells.size > 0) {
      const visited = new Set<string>()
      const queue: string[] = [Array.from(blackCells)[0]]

      while (queue.length > 0) {
        const current = queue.shift()!
        if (visited.has(current)) continue
        visited.add(current)

        const parts = current.split(',')
        const r = parseInt(parts[0])
        const c = parseInt(parts[1])
        const neighbors = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]

        for (const [nr, nc] of neighbors) {
          const key = `${nr},${nc}`
          if (blackCells.has(key) && !visited.has(key)) {
            queue.push(key)
          }
        }
      }

      if (visited.size !== blackCells.size) {
        setErrorMsg(lang === 'zh' ? '黑格未全部连通' : 'Black cells are not all connected')
        return
      }
    }

    // Rule 4: Validate clues - count black cells in same region
    for (const [row, col, clue] of level.clues) {
      const regionId = regions[row][col]
      let blackCount = 0
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (regions[r][c] === regionId && grid[r][c].state === 'black') {
            blackCount++
          }
        }
      }
      if (blackCount !== clue) {
        setErrorMsg(
          lang === 'zh'
            ? `线索 (${row+1},${col+1}) 需要${clue}个黑格，当前有${blackCount}个`
            : `Clue at (${row+1},${col+1}) needs ${clue} black cells, found ${blackCount}`
        )
        return
      }
    }

    setSolved(true)
  }, [grid, level.clues, regions, lang])

  const reset = () => {
    setGrid(createInitialGrid(currentLevel))
    setSolved(false)
    setErrorMsg('')
  }

  const nextLevel = () => {
    const nextLevelIndex = (currentLevel + 1) % LEVELS.length
    setCurrentLevel(nextLevelIndex)
    setGrid(createInitialGrid(nextLevelIndex))
    setSolved(false)
    setErrorMsg('')
  }

  const showSolution = () => {
    const sol = level.solution
    setGrid(prev => prev.map((row, r) =>
      row.map((cell, c) => ({
        ...cell,
        state: cell.clue !== null ? cell.state : (sol[r][c] === 1 ? 'black' : 'empty') as CellState,
      }))
    ))
    setErrorMsg('')
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-gray-300'}`}>
        <h1 className="text-xl font-bold text-center">🔲 Aqre</h1>
        <p className={`text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
          {level[lang === 'zh' ? 'nameZh' : 'name']} · {lang === 'zh'
            ? '涂黑格子：同行/列≤2连续，无2×2，黑格连通，线索=区域内黑格数'
            : 'Shade cells: ≤2 consecutive, no 2×2, connected, clue=blacks in region'}
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className={`grid gap-0.5 p-2 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white shadow-lg'}`}>
          {grid.map((row, r) => (
            <div key={r} className="flex gap-0.5">
              {row.map((cell, c) => {
                const regionId = regions[r][c]
                const regionColor = REGION_COLORS[regionId % REGION_COLORS.length]
                const isRegionBorderRight = c < GRID_SIZE - 1 && regions[r][c] !== regions[r][c + 1]
                const isRegionBorderBottom = r < GRID_SIZE - 1 && regions[r][c] !== regions[r + 1][c]

                return (
                  <button
                    key={c}
                    onClick={() => cycleCell(r, c)}
                    className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-lg font-bold transition-colors
                      border ${isRegionBorderRight ? 'border-r-2 border-r-gray-800 dark:border-r-gray-200' : ''}
                      ${isRegionBorderBottom ? 'border-b-2 border-b-gray-800 dark:border-b-gray-200' : ''}
                      ${cell.clue !== null
                        ? `${isDark ? 'bg-purple-900 border-purple-700' : 'bg-purple-100 border-purple-300'} font-bold text-purple-600 dark:text-purple-300`
                        : cell.state === 'black'
                        ? 'bg-gray-900 border-gray-700'
                        : cell.state === 'dot'
                        ? `${regionColor} border-gray-300`
                        : `${regionColor} border-gray-300 hover:brightness-95`
                      }`}
                  >
                    {cell.clue !== null ? cell.clue : cell.state === 'dot' ? '·' : ''}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Error message */}
      {errorMsg && (
        <div className="px-4 py-2 text-center">
          <p className="text-sm text-red-400 font-medium">❌ {errorMsg}</p>
        </div>
      )}

      <div className={`p-2 text-center text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
        {lang === 'zh' ? '点击: 空 → 涂黑 → 标记 → 空 | 不同底色=不同区域' : 'Click: Empty → Black → Dot → Empty | Colors = Regions'}
      </div>

      <div className="flex justify-center gap-3 p-4">
        <button onClick={reset} className={`px-4 py-2 rounded-lg font-medium text-sm ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
          {lang === 'zh' ? '重置' : 'Reset'}
        </button>
        <button onClick={checkSolution} className="px-4 py-2 rounded-lg font-medium text-sm bg-green-600 hover:bg-green-500 text-white">
          {lang === 'zh' ? '检查' : 'Check'}
        </button>
        <button onClick={showSolution} className={`px-4 py-2 rounded-lg font-medium text-sm ${isDark ? 'bg-amber-700 hover:bg-amber-600' : 'bg-amber-500 hover:bg-amber-400'} text-white`}>
          {lang === 'zh' ? '答案' : 'Answer'}
        </button>
      </div>

      {solved && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className={`p-8 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-white'} max-w-sm w-full mx-4`}>
            <h2 className="text-2xl font-bold text-center text-green-500 mb-2">🎉 {lang === 'zh' ? '正确！' : 'Correct!'}</h2>
            <p className={`text-center mb-6 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              {lang === 'zh' ? `完成 ${level.nameZh}` : `Completed ${level.name}`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setSolved(false)} className={`flex-1 py-2 rounded-lg font-medium ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
                {lang === 'zh' ? '关闭' : 'Close'}
              </button>
              <button onClick={nextLevel} className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium">
                {lang === 'zh' ? '下一关' : 'Next Level'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
