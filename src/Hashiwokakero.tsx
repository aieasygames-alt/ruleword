import { useState, useCallback, useEffect } from 'react'
import GameGuide from './GameGuide'

type Difficulty = 'easy' | 'normal' | 'hard'
type EdgeState = 'none' | 'single' | 'double'

interface EdgeCell {
  right: EdgeState
  down: EdgeState
}

interface Stats {
  played: number
  completed: number
}

const STATS_KEY = 'hashiwokakero_stats'

const DIFFICULTY_CONFIG: Record<Difficulty, { size: number }> = {
  easy: { size: 5 },
  normal: { size: 7 },
  hard: { size: 9 },
}

function loadStats(): Stats {
  try {
    const data = localStorage.getItem(STATS_KEY)
    return data ? JSON.parse(data) : { played: 0, completed: 0 }
  } catch {
    return { played: 0, completed: 0 }
  }
}

function saveStats(stats: Stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats))
}

function seededRandom(seed: number) {
  let s = seed
  return function() {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

function getDailySeed(): number {
  const startDate = new Date('2024-01-01').getTime()
  const now = new Date().setHours(0, 0, 0, 0)
  return Math.floor((now - startDate) / 86400000)
}

// 生成岛屿和桥梁
function generatePuzzle(size: number, rng: () => number): { islands: number[][], solution: EdgeCell[][] } {
  const islands = Array(size).fill(null).map(() => Array(size).fill(0))
  const solution: EdgeCell[][] = Array(size).fill(null).map(() =>
    Array(size).fill(null).map(() => ({ right: 'none' as EdgeState, down: 'none' as EdgeState }))
  )

  // 随机放置岛屿
  const islandPositions: [number, number][] = []
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (rng() < 0.35 && (r + c) % 2 === 0) {
        islandPositions.push([r, c])
        islands[r][c] = 1 // 临时标记
      }
    }
  }

  // 连接相邻岛屿
  for (const [r, c] of islandPositions) {
    const bridges: EdgeState[] = []

    // 右边
    for (let nc = c + 1; nc < size; nc++) {
      if (islands[r][nc] > 0) {
        bridges.push(solution[r][c].right = rng() < 0.3 ? 'double' : 'single')
        break
      }
    }

    // 下边
    for (let nr = r + 1; nr < size; nr++) {
      if (islands[nr][c] > 0) {
        bridges.push(solution[r][c].down = rng() < 0.3 ? 'double' : 'single')
        break
      }
    }

    islands[r][c] = bridges.length + Math.floor(rng() * 2)
  }

  return { islands, solution }
}

export default function Hashiwokakero({ settings, onBack }: { settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }; onBack: () => void }) {
  const [islands, setIslands] = useState<number[][]>([])
  const [edges, setEdges] = useState<EdgeCell[][]>([])
  const [solution, setSolution] = useState<EdgeCell[][]>([])
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [isComplete, setIsComplete] = useState(false)
  const [stats, setStats] = useState<Stats>(loadStats)
  const [showGameGuide, setShowGameGuide] = useState(false)
  const [selectedIsland, setSelectedIsland] = useState<{ r: number; c: number } | null>(null)

  const config = DIFFICULTY_CONFIG[difficulty]
  const { size } = config

  const t = {
    title: '🌉 Bridges',
    newGame: settings.language === 'zh' ? '新游戏' : 'New Game',
    complete: settings.language === 'zh' ? '恭喜完成！' : 'Puzzle Complete!',
    difficulty: settings.language === 'zh' ? '难度' : 'Difficulty',
    easy: settings.language === 'zh' ? '简单' : 'Easy',
    normal: settings.language === 'zh' ? '普通' : 'Normal',
    hard: settings.language === 'zh' ? '困难' : 'Hard',
    stats: settings.language === 'zh' ? '统计' : 'Stats',
    played: settings.language === 'zh' ? '已玩' : 'Played',
    completed: settings.language === 'zh' ? '完成' : 'Completed',
  }

  const initializeGame = useCallback(() => {
    const seed = getDailySeed() + Object.keys(DIFFICULTY_CONFIG).indexOf(difficulty) * 1000
    const rng = seededRandom(seed)
    const { islands: newIslands, solution: newSolution } = generatePuzzle(size, rng)

    setIslands(newIslands)
    setSolution(newSolution)
    setEdges(Array(size).fill(null).map(() =>
      Array(size).fill(null).map(() => ({ right: 'none' as EdgeState, down: 'none' as EdgeState }))
    ))
    setIsComplete(false)
    setSelectedIsland(null)
  }, [difficulty, size])

  useEffect(() => {
    initializeGame()
  }, [])

  const countBridges = (edge: EdgeState): number => {
    if (edge === 'single') return 1
    if (edge === 'double') return 2
    return 0
  }

  const checkComplete = useCallback((currentEdges: EdgeCell[][]): boolean => {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (islands[r][c] === 0) continue

        let count = 0
        if (r > 0) count += countBridges(currentEdges[r - 1][c].down)
        if (r < size - 1) count += countBridges(currentEdges[r][c].down)
        if (c > 0) count += countBridges(currentEdges[r][c - 1].right)
        if (c < size - 1) count += countBridges(currentEdges[r][c].right)

        if (count !== islands[r][c]) return false
      }
    }
    return true
  }, [islands, size])

  const toggleEdge = (r: number, c: number, direction: 'right' | 'down') => {
    if (isComplete) return

    setEdges(prev => {
      const newEdges = prev.map(row => row.map(cell => ({ ...cell })))
      const current = newEdges[r][c][direction]

      if (current === 'none') newEdges[r][c][direction] = 'single'
      else if (current === 'single') newEdges[r][c][direction] = 'double'
      else newEdges[r][c][direction] = 'none'

      if (checkComplete(newEdges)) {
        setIsComplete(true)
        const newStats = { ...stats, played: stats.played + 1, completed: stats.completed + 1 }
        setStats(newStats)
        saveStats(newStats)
      }

      return newEdges
    })
  }

  const handleCellClick = (r: number, c: number) => {
    if (islands[r][c] > 0) {
      setSelectedIsland({ r, c })
    }
  }

  const handleEdgeClick = (r: number, c: number, direction: 'right' | 'down') => {
    toggleEdge(r, c, direction)
  }

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'
  const borderClass = settings.darkMode ? 'border-gray-700' : 'border-gray-300'

  const cellSize = size <= 5 ? 64 : size <= 7 ? 52 : 44

  return (
    <div className={`min-h-screen flex flex-col ${bgClass} ${textClass}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 ${cardBgClass} border-b ${borderClass} p-3`}>
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-500/20">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold">{t.title}</h1>
          <button onClick={() => setShowGameGuide(true)} className="p-2 rounded-lg hover:bg-gray-500/20">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {/* Difficulty */}
          <div className="flex gap-2 mb-4 justify-center">
            {(['easy', 'normal', 'hard'] as Difficulty[]).map(d => (
              <button
                key={d}
                onClick={() => { setDifficulty(d); initializeGame() }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  difficulty === d ? 'bg-blue-600 text-white' : `${cardBgClass} border ${borderClass}`
                }`}
              >
                {t[d]}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="flex justify-center mb-4">
            <div className="relative" style={{ width: size * cellSize, height: size * cellSize }}>
              {/* Horizontal edges */}
              {edges.map((row, r) =>
                row.map((cell, c) => (
                  c < size - 1 && islands[r][c] >= 0 && (
                    <div
                      key={`h-${r}-${c}`}
                      onClick={() => handleEdgeClick(r, c, 'right')}
                      className="absolute cursor-pointer flex items-center justify-center"
                      style={{
                        left: c * cellSize + cellSize / 2,
                        top: r * cellSize + cellSize / 2 - 6,
                        width: cellSize,
                        height: 12,
                      }}
                    >
                      {cell.right !== 'none' && (
                        <div className={`w-full ${cell.right === 'double' ? 'h-3 border-y-2' : 'h-1.5'} bg-gray-800 dark:bg-white rounded`} />
                      )}
                    </div>
                  )
                ))
              )}

              {/* Vertical edges */}
              {edges.map((row, r) =>
                row.map((cell, c) => (
                  r < size - 1 && islands[r][c] >= 0 && (
                    <div
                      key={`v-${r}-${c}`}
                      onClick={() => handleEdgeClick(r, c, 'down')}
                      className="absolute cursor-pointer flex items-center justify-center"
                      style={{
                        left: c * cellSize + cellSize / 2 - 6,
                        top: r * cellSize + cellSize / 2,
                        width: 12,
                        height: cellSize,
                      }}
                    >
                      {cell.down !== 'none' && (
                        <div className={`h-full ${cell.down === 'double' ? 'w-3 border-x-2' : 'w-1.5'} bg-gray-800 dark:bg-white rounded`} />
                      )}
                    </div>
                  )
                ))
              )}

              {/* Islands */}
              {islands.map((row, r) =>
                row.map((cell, c) => (
                  cell > 0 && (
                    <div
                      key={`i-${r}-${c}`}
                      onClick={() => handleCellClick(r, c)}
                      className={`absolute rounded-full flex items-center justify-center font-bold text-lg cursor-pointer transition-all ${
                        selectedIsland?.r === r && selectedIsland?.c === c
                          ? 'bg-blue-500 text-white scale-110'
                          : 'bg-gray-800 dark:bg-white text-white dark:text-gray-800'
                      }`}
                      style={{
                        left: c * cellSize + cellSize / 2 - cellSize / 3,
                        top: r * cellSize + cellSize / 2 - cellSize / 3,
                        width: cellSize * 2 / 3,
                        height: cellSize * 2 / 3,
                      }}
                    >
                      {cell}
                    </div>
                  )
                ))
              )}
            </div>
          </div>

          {/* New Game */}
          <div className="flex justify-center mb-4">
            <button
              onClick={initializeGame}
              className={`px-6 py-2 rounded-lg font-medium ${settings.darkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-500'} text-white`}
            >
              {t.newGame}
            </button>
          </div>

          {/* Stats */}
          <div className={`${cardBgClass} rounded-xl p-4 border ${borderClass} max-w-xs mx-auto`}>
            <div className="text-center text-sm opacity-60 mb-2">{t.stats}</div>
            <div className="flex justify-around">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.played}</div>
                <div className="text-xs opacity-60">{t.played}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
                <div className="text-xs opacity-60">{t.completed}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Message */}
      {isComplete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className={`${cardBgClass} rounded-xl p-6 text-center mx-4`}>
            <div className="text-4xl mb-3">🎉🌉</div>
            <div className="text-xl font-bold text-green-500 mb-4">{t.complete}</div>
            <button
              onClick={initializeGame}
              className={`px-6 py-2 rounded-lg font-medium ${settings.darkMode ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-500'} text-white`}
            >
              {t.newGame}
            </button>
          </div>
        </div>
      )}

      {/* Game Guide */}
      {showGameGuide && (
        <GameGuide
          language={settings.language}
          darkMode={settings.darkMode}
          onClose={() => setShowGameGuide(false)}
          initialGame="hashiwokakero"
        />
      )}
    </div>
  )
}
