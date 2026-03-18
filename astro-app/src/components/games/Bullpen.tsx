import { useState, useCallback, useEffect, useMemo } from 'react'
import GameGuide from './GameGuide'

type CellState = 'empty' | 'bull' | 'grass' | 'rock'
type Difficulty = 'easy' | 'normal' | 'hard'
type GameMode = 'daily' | 'practice'

interface Stats {
  played: number
  completed: number
}

const STATS_KEY = 'bullpen_stats'

// 难度配置
const DIFFICULTY_CONFIG: Record<Difficulty, { size: number; bullsPerLine: number }> = {
  easy: { size: 5, bullsPerLine: 1 },
  normal: { size: 7, bullsPerLine: 1 },
  hard: { size: 8, bullsPerLine: 2 },
}

// 围栏颜色
const PEN_COLORS = [
  'bg-rose-200 dark:bg-rose-900/40',
  'bg-sky-200 dark:bg-sky-900/40',
  'bg-amber-200 dark:bg-amber-900/40',
  'bg-emerald-200 dark:bg-emerald-900/40',
  'bg-violet-200 dark:bg-violet-900/40',
  'bg-orange-200 dark:bg-orange-900/40',
  'bg-cyan-200 dark:bg-cyan-900/40',
  'bg-pink-200 dark:bg-pink-900/40',
  'bg-lime-200 dark:bg-lime-900/40',
  'bg-indigo-200 dark:bg-indigo-900/40',
]

// 加载统计
function loadStats(): Stats {
  try {
    const data = localStorage.getItem(STATS_KEY)
    return data ? JSON.parse(data) : { played: 0, completed: 0 }
  } catch {
    return { played: 0, completed: 0 }
  }
}

// 保存统计
function saveStats(stats: Stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats))
}

// 获取每日种子
function getDailySeed(): number {
  const startDate = new Date('2024-01-01').getTime()
  const now = new Date().setHours(0, 0, 0, 0)
  return Math.floor((now - startDate) / 86400000)
}

// 伪随机数生成器
function seededRandom(seed: number) {
  let s = seed
  return function() {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

// 生成围栏区域
function generatePens(size: number, seed?: number): number[][] {
  const rng = seed !== undefined ? seededRandom(seed) : () => Math.random()
  const pens: number[][] = Array(size).fill(null).map(() => Array(size).fill(0))
  const penCount = size
  const visited: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false))

  // 使用洪水填充算法创建连通的围栏区域
  let currentPen = 0
  const targetSize = Math.floor((size * size) / penCount)

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!visited[r][c]) {
        // BFS 填充当前围栏
        const queue: [number, number][] = [[r, c]]
        let cellCount = 0

        while (queue.length > 0 && cellCount < targetSize) {
          const [cr, cc] = queue.shift()!
          if (visited[cr][cc]) continue

          visited[cr][cc] = true
          pens[cr][cc] = currentPen
          cellCount++

          // 随机添加相邻单元格
          const neighbors = [
            [cr - 1, cc], [cr + 1, cc], [cr, cc - 1], [cr, cc + 1]
          ].filter(([nr, nc]) =>
            nr >= 0 && nr < size && nc >= 0 && nc < size && !visited[nr][nc]
          )

          // 随机打乱顺序
          neighbors.sort(() => rng() - 0.5)
          queue.push(...neighbors as [number, number][])
        }

        currentPen++
        if (currentPen >= penCount) currentPen = 0
      }
    }
  }

  return pens
}

// 生成解（放置公牛的位置）
function generateSolution(size: number, bullsPerLine: number, pens: number[][], seed?: number): boolean[][] {
  const rng = seed !== undefined ? seededRandom(seed || 1) : () => Math.random()
  const bulls: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false))
  const penBulls: Record<number, number> = {}

  // 统计每个围栏的单元格
  const penCells: Record<number, [number, number][]> = {}
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const pen = pens[r][c]
      if (!penCells[pen]) penCells[pen] = []
      penCells[pen].push([r, c])
    }
  }

  // 尝试放置公牛
  const canPlace = (r: number, c: number): boolean => {
    // 检查同行
    const rowBulls = bulls[r].filter(Boolean).length
    if (rowBulls >= bullsPerLine) return false

    // 检查同列
    const colBulls = bulls.filter(row => row[c]).length
    if (colBulls >= bullsPerLine) return false

    // 检查同围栏
    const pen = pens[r][c]
    if ((penBulls[pen] || 0) >= bullsPerLine) return false

    // 检查相邻（包括对角线）
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue
        const nr = r + dr, nc = c + dc
        if (nr >= 0 && nr < size && nc >= 0 && nc < size && bulls[nr][nc]) {
          return false
        }
      }
    }

    return true
  }

  // 按围栏顺序尝试放置
  const penOrder = Object.keys(penCells).map(Number).sort(() => rng() - 0.5)

  for (const pen of penOrder) {
    const cells = penCells[pen]
    cells.sort(() => rng() - 0.5)

    let placed = 0
    for (const [r, c] of cells) {
      if (placed >= bullsPerLine) break
      if (canPlace(r, c)) {
        bulls[r][c] = true
        penBulls[pen] = (penBulls[pen] || 0) + 1
        placed++
      }
    }
  }

  return bulls
}

interface BullpenProps {
  settings: {
    language: 'zh' | 'en'
    soundEnabled: boolean
    darkMode: boolean
  }
  onBack: () => void
}

const Bullpen: React.FC<BullpenProps> = ({ settings, onBack }) => {
  const [grid, setGrid] = useState<CellState[][]>([])
  const [pens, setPens] = useState<number[][]>([])
  const [solution, setSolution] = useState<boolean[][]>([])
  const [difficulty, setDifficulty] = useState<Difficulty>('normal')
  const [gameMode, setGameMode] = useState<GameMode>('practice')
  const [isComplete, setIsComplete] = useState(false)
  const [stats, setStats] = useState<Stats>(loadStats)
  const [showGameGuide, setShowGameGuide] = useState(false)

  const config = DIFFICULTY_CONFIG[difficulty]

  const t = {
    title: '🐂 Bullpen',
    daily: settings.language === 'zh' ? '每日' : 'Daily',
    practice: settings.language === 'zh' ? '练习' : 'Practice',
    newGame: settings.language === 'zh' ? '新游戏' : 'New Game',
    rules: settings.language === 'zh' ? '规则' : 'Rules',
    complete: settings.language === 'zh' ? '恭喜完成！' : 'Puzzle Complete!',
    rule1: settings.language === 'zh' ? '每个围栏放1头公牛' : '1 bull per pen',
    rule2: settings.language === 'zh' ? '每行每列各1头公牛' : '1 bull per row & column',
    rule3: settings.language === 'zh' ? '公牛不能相邻（含对角线）' : 'Bulls cannot touch',
    hardRule: settings.language === 'zh' ? '困难模式：每行/列/围栏2头公牛' : 'Hard: 2 bulls per row/column/pen',
    easy: settings.language === 'zh' ? '简单' : 'Easy',
    normal: settings.language === 'zh' ? '普通' : 'Normal',
    hard: settings.language === 'zh' ? '困难' : 'Hard',
    remaining: settings.language === 'zh' ? '剩余公牛' : 'Bulls Left',
  }

  // 初始化游戏
  const initializeGame = useCallback((mode?: GameMode, diff?: Difficulty) => {
    const newMode = mode || gameMode
    const newDiff = diff || difficulty
    setGameMode(newMode)
    setDifficulty(newDiff)

    const { size, bullsPerLine } = DIFFICULTY_CONFIG[newDiff]
    const seed = newMode === 'daily' ? getDailySeed() + (newDiff === 'easy' ? 0 : newDiff === 'normal' ? 1000 : 2000) : undefined

    // 生成围栏和解
    const newPens = generatePens(size, seed)
    const newSolution = generateSolution(size, bullsPerLine, newPens, seed)

    setPens(newPens)
    setSolution(newSolution)
    setIsComplete(false)

    // 初始化网格（岩石位置）
    const newGrid: CellState[][] = Array(size).fill(null).map(() => Array(size).fill('empty'))
    setGrid(newGrid)
  }, [gameMode, difficulty])

  useEffect(() => {
    initializeGame()
  }, [])

  // 计算剩余公牛数
  const remainingBulls = useMemo(() => {
    if (!grid.length) return 0
    const { size, bullsPerLine } = config
    const placedBulls = grid.flat().filter(c => c === 'bull').length
    const totalBulls = size * bullsPerLine
    return totalBulls - placedBulls
  }, [grid, config])

  // 验证是否完成（检查所有约束是否满足）
  const checkComplete = useCallback((currentGrid: CellState[][]) => {
    if (!currentGrid.length || !pens.length) return false
    const { size, bullsPerLine } = config

    // 检查公牛数量
    const bullCount = currentGrid.flat().filter(c => c === 'bull').length
    if (bullCount !== size * bullsPerLine) return false

    // 检查每行
    for (let r = 0; r < size; r++) {
      const rowBulls = currentGrid[r].filter(c => c === 'bull').length
      if (rowBulls !== bullsPerLine) return false
    }

    // 检查每列
    for (let c = 0; c < size; c++) {
      const colBulls = currentGrid.filter(row => row[c] === 'bull').length
      if (colBulls !== bullsPerLine) return false
    }

    // 检查每个围栏
    const penBulls: Record<number, number> = {}
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const pen = pens[r][c]
        if (currentGrid[r][c] === 'bull') {
          penBulls[pen] = (penBulls[pen] || 0) + 1
        }
      }
    }
    const uniquePens = new Set(pens.flat())
    for (const pen of uniquePens) {
      if ((penBulls[pen] || 0) !== bullsPerLine) return false
    }

    // 检查公牛是否相邻（包括对角线）
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (currentGrid[r][c] !== 'bull') continue
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue
            const nr = r + dr, nc = c + dc
            if (nr >= 0 && nr < size && nc >= 0 && nc < size && currentGrid[nr][nc] === 'bull') {
              return false
            }
          }
        }
      }
    }

    return true
  }, [pens, config])

  // 检查约束违规
  const checkViolations = useCallback((currentGrid: CellState[][], row: number, col: number): string[] => {
    if (!currentGrid.length || currentGrid[row][col] !== 'bull') return []
    const { size, bullsPerLine } = config
    const violations: string[] = []

    // 检查同行
    const rowBulls = currentGrid[row].filter((c, i) => c === 'bull' && i !== col).length
    if (rowBulls >= bullsPerLine) violations.push('row')

    // 检查同列
    const colBulls = currentGrid.filter((r, i) => r[col] === 'bull' && i !== row).length
    if (colBulls >= bullsPerLine) violations.push('col')

    // 检查同围栏
    const pen = pens[row][col]
    const penBullCount = currentGrid.flat().filter((c, i) => {
      const r = Math.floor(i / size), c2 = i % size
      return c === 'bull' && pens[r]?.[c2] === pen && (r !== row || c2 !== col)
    }).length
    if (penBullCount >= bullsPerLine) violations.push('pen')

    // 检查相邻
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue
        const nr = row + dr, nc = col + dc
        if (nr >= 0 && nr < size && nc >= 0 && nc < size && currentGrid[nr][nc] === 'bull') {
          violations.push('touch')
        }
      }
    }

    return violations
  }, [pens, config])

  // 点击单元格
  const handleCellClick = (row: number, col: number) => {
    if (isComplete) return

    setGrid(prev => {
      const newGrid = prev.map(r => [...r])
      const current = newGrid[row][col]

      // 循环：empty -> bull -> grass -> empty
      if (current === 'empty') {
        newGrid[row][col] = 'bull'
      } else if (current === 'bull') {
        newGrid[row][col] = 'grass'
      } else {
        newGrid[row][col] = 'empty'
      }

      // 检查是否完成
      if (checkComplete(newGrid)) {
        setIsComplete(true)
        const newStats = { ...stats, played: stats.played + 1, completed: stats.completed + 1 }
        setStats(newStats)
        saveStats(newStats)
      }

      return newGrid
    })
  }

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'

  return (
    <div className={`min-h-screen flex flex-col items-center py-4 px-2 ${bgClass} ${textClass}`}>
      {/* Header */}
      <div className="w-full max-w-lg mb-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onBack} className={`p-2 rounded-lg ${settings.darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">{t.title}</h1>
          <button onClick={() => setShowGameGuide(true)} className={`p-2 rounded-lg ${settings.darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center gap-2 mb-3">
          {(['daily', 'practice'] as GameMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => initializeGame(mode)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                gameMode === mode
                  ? (mode === 'daily' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white')
                  : settings.darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {mode === 'daily' ? t.daily : t.practice}
            </button>
          ))}
        </div>

        {/* Difficulty Selector */}
        <div className="flex justify-center gap-2 mb-3">
          {(['easy', 'normal', 'hard'] as Difficulty[]).map(d => (
            <button
              key={d}
              onClick={() => initializeGame(gameMode, d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                difficulty === d
                  ? d === 'easy' ? 'bg-green-600 text-white' : d === 'normal' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
                  : settings.darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t[d]}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-4 mb-3">
          <div className={`${cardBgClass} rounded-lg px-4 py-2 text-center min-w-[80px]`}>
            <div className="text-xs opacity-70">{t.remaining}</div>
            <div className="text-xl font-bold text-amber-500">{remainingBulls}</div>
          </div>
          <button
            onClick={() => initializeGame()}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium"
          >
            🔄
          </button>
        </div>

        {/* Rules */}
        <div className={`text-xs text-center ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {difficulty === 'hard' ? t.hardRule : `${t.rule1} · ${t.rule2} · ${t.rule3}`}
        </div>
      </div>

      {/* Game Board */}
      {grid.length > 0 && pens.length > 0 && (
        <div className={`${cardBgClass} rounded-xl p-3`}>
          <div
            className="grid gap-0.5"
            style={{ gridTemplateColumns: `repeat(${config.size}, 1fr)` }}
          >
            {grid.map((row, r) =>
              row.map((cell, c) => {
                const pen = pens[r]?.[c] ?? 0
                const penColor = PEN_COLORS[pen % PEN_COLORS.length]
                const violations = checkViolations(grid, r, c)
                const hasViolation = cell === 'bull' && violations.length > 0

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded flex items-center justify-center text-2xl transition-all ${penColor} ${
                      hasViolation ? 'ring-2 ring-red-500' : ''
                    } ${settings.darkMode ? 'hover:brightness-125' : 'hover:brightness-95'}`}
                  >
                    {cell === 'bull' && '🐂'}
                    {cell === 'grass' && '🌱'}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Complete Message */}
      {isComplete && (
        <div className={`mt-6 ${cardBgClass} rounded-xl p-6 text-center`}>
          <div className="text-4xl mb-3">🎉🐂</div>
          <div className="text-xl font-bold text-green-500 mb-4">{t.complete}</div>
          <button
            onClick={() => initializeGame()}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium"
          >
            {t.newGame}
          </button>
        </div>
      )}

      {/* Legend */}
      <div className={`mt-4 text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <div className="flex items-center justify-center gap-4">
          <span>点击切换: 空白 → 🐂 → 🌱 → 空白</span>
        </div>
      </div>

      {/* Game Guide */}
      {showGameGuide && (
        <GameGuide
          language={settings.language}
          darkMode={settings.darkMode}
          onClose={() => setShowGameGuide(false)}
          initialGame="bullpen"
        />
      )}
    </div>
  )
}

export default Bullpen
