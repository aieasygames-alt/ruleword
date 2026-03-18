import { useState, useCallback, useEffect } from 'react'
import GameGuide from './GameGuide'

type Difficulty = 'easy' | 'normal' | 'hard'
type EdgeState = 'none' | 'on'

interface Stats {
  played: number
  completed: number
}

const STATS_KEY = 'slitherlink_stats'

const DIFFICULTY_CONFIG: Record<Difficulty, { size: number }> = {
  easy: { size: 5 },
  normal: { size: 7 },
  hard: { size: 10 },
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

// 生成简单环和提示
function generatePuzzle(size: number, rng: () => number): { clues: number[][], solution: EdgeState[][][] } {
  const clues = Array(size).fill(null).map(() => Array(size).fill(-1))
  const solution: EdgeState[][][] = Array(size + 1).fill(null).map(() =>
    Array(size + 1).fill(null).map(() => ({ right: 'none' as EdgeState, down: 'none' as EdgeState }))
  )

  // 生成简单的矩形环
  const margin = 1
  const r1 = margin
  const c1 = margin
  const r2 = size - margin - 1
  const c2 = size - margin - 1

  // 画上边
  for (let c = c1; c < c2; c++) solution[r1][c].right = 'on'
  // 画下边
  for (let c = c1; c < c2; c++) solution[r2][c].right = 'on'
  // 画左边
  for (let r = r1; r < r2; r++) solution[r][c1].down = 'on'
  // 画右边
  for (let r = r1; r < r2; r++) solution[r][c2].down = 'on'

  // 计算每个格子的边数
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      let count = 0
      if (solution[r][c].right === 'on') count++
      if (solution[r][c].down === 'on') count++
      if (r > 0 && solution[r - 1][c].down === 'on') count++
      if (c > 0 && solution[r][c - 1].right === 'on') count++

      // 只显示部分提示
      if (count > 0 && rng() < 0.6) {
        clues[r][c] = count
      }
    }
  }

  return { clues, solution }
}

export default function Slitherlink({ settings, onBack }: { settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }; onBack: () => void }) {
  const [clues, setClues] = useState<number[][]>([])
  const [edges, setEdges] = useState<EdgeState[][][]>([])
  const [solution, setSolution] = useState<EdgeState[][][]>([])
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [isComplete, setIsComplete] = useState(false)
  const [stats, setStats] = useState<Stats>(loadStats)
  const [showGameGuide, setShowGameGuide] = useState(false)

  const config = DIFFICULTY_CONFIG[difficulty]
  const { size } = config

  const t = {
    title: '⭕ Slitherlink',
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
    const { clues: newClues, solution: newSolution } = generatePuzzle(size, rng)

    setClues(newClues)
    setSolution(newSolution)
    setEdges(Array(size + 1).fill(null).map(() =>
      Array(size + 1).fill(null).map(() => ({ right: 'none' as EdgeState, down: 'none' as EdgeState }))
    ))
    setIsComplete(false)
  }, [difficulty, size])

  useEffect(() => {
    initializeGame()
  }, [])

  const checkComplete = useCallback((currentEdges: EdgeState[][][]): boolean => {
    for (let r = 0; r <= size; r++) {
      for (let c = 0; c <= size; c++) {
        if (r < size && currentEdges[r][c].right !== solution[r][c].right) return false
        if (c < size && currentEdges[r][c].down !== solution[r][c].down) return false
      }
    }
    return true
  }, [solution, size])

  const toggleEdge = (r: number, c: number, direction: 'right' | 'down') => {
    if (isComplete) return

    setEdges(prev => {
      const newEdges = prev.map(row => row.map(cell => ({ ...cell })))
      const current = newEdges[r][c][direction]
      newEdges[r][c][direction] = current === 'on' ? 'none' : 'on'

      if (checkComplete(newEdges)) {
        setIsComplete(true)
        const newStats = { ...stats, played: stats.played + 1, completed: stats.completed + 1 }
        setStats(newStats)
        saveStats(newStats)
      }

      return newEdges
    })
  }

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'
  const borderClass = settings.darkMode ? 'border-gray-700' : 'border-gray-300'

  const cellSize = size <= 5 ? 64 : size <= 7 ? 52 : 40

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
            <div className="relative" style={{ width: size * cellSize + 2, height: size * cellSize + 2 }}>
              {/* Clues */}
              {clues.map((row, r) =>
                row.map((clue, c) => (
                  <div
                    key={`c-${r}-${c}`}
                    className="absolute flex items-center justify-center font-bold text-xl"
                    style={{
                      left: c * cellSize + 2,
                      top: r * cellSize + 2,
                      width: cellSize - 4,
                      height: cellSize - 4,
                    }}
                  >
                    {clue >= 0 && (
                      <span className={clue === 0 ? 'text-gray-400' : clue === 3 ? 'text-green-600' : ''}>{clue}</span>
                    )}
                  </div>
                ))
              )}

              {/* Horizontal edges */}
              {edges.map((row, r) =>
                row.map((cell, c) => (
                  c < size && (
                    <div
                      key={`h-${r}-${c}`}
                      onClick={() => toggleEdge(r, c, 'right')}
                      className="absolute cursor-pointer"
                      style={{
                        left: c * cellSize,
                        top: r * cellSize - 4,
                        width: cellSize,
                        height: 8,
                      }}
                    >
                      <div className={`h-full w-full rounded transition-colors ${
                        cell.right === 'on' ? 'bg-blue-500' : 'bg-transparent hover:bg-blue-200 dark:hover:bg-blue-800'
                      }`} />
                    </div>
                  )
                ))
              )}

              {/* Vertical edges */}
              {edges.map((row, r) =>
                row.map((cell, c) => (
                  r < size && (
                    <div
                      key={`v-${r}-${c}`}
                      onClick={() => toggleEdge(r, c, 'down')}
                      className="absolute cursor-pointer"
                      style={{
                        left: c * cellSize - 4,
                        top: r * cellSize,
                        width: 8,
                        height: cellSize,
                      }}
                    >
                      <div className={`h-full w-full rounded transition-colors ${
                        cell.down === 'on' ? 'bg-blue-500' : 'bg-transparent hover:bg-blue-200 dark:hover:bg-blue-800'
                      }`} />
                    </div>
                  )
                ))
              )}

              {/* Dots at vertices */}
              {edges.map((row, r) =>
                row.map((_, c) => (
                  <div
                    key={`d-${r}-${c}`}
                    className="absolute rounded-full bg-gray-800 dark:bg-white"
                    style={{
                      left: c * cellSize - 3,
                      top: r * cellSize - 3,
                      width: 6,
                      height: 6,
                    }}
                  />
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
            <div className="text-4xl mb-3">🎉⭕</div>
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
          initialGame="slitherlink"
        />
      )}
    </div>
  )
}
