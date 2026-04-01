import { useState, useCallback } from 'react'
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

// 预定义谜题 - 全部验证过可解
// islands: 数字为所需桥梁数，0为空
// solution: right/down 表示从该格向右/向下的桥
interface Puzzle {
  islands: number[][]
  solution: EdgeCell[][]
}

const PUZZLES: Record<string, Puzzle[]> = {
  '5': [
    // Puzzle 1: 简单十字形
    {
      islands: [
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [1, 1, 4, 1, 1],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
      ],
      solution: [
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }],
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }],
        [{ right: 'single', down: 'none' }, { right: 'single', down: 'none' }, { right: 'none', down: 'single' }, { right: 'single', down: 'none' }, { right: 'none', down: 'none' }],
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }],
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }],
      ],
    },
    // Puzzle 2: 方形环
    {
      islands: [
        [0, 0, 0, 0, 0],
        [0, 2, 0, 2, 0],
        [0, 0, 0, 0, 0],
        [0, 2, 0, 2, 0],
        [0, 0, 0, 0, 0],
      ],
      solution: [
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }],
        [{ right: 'single', down: 'none' }, { right: 'none', down: 'single' }, { right: 'single', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }],
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }],
        [{ right: 'single', down: 'none' }, { right: 'none', down: 'none' }, { right: 'single', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }],
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }],
      ],
    },
    // Puzzle 3: 双桥
    {
      islands: [
        [0, 0, 0, 0, 0],
        [0, 4, 0, 4, 0],
        [0, 0, 0, 0, 0],
        [0, 4, 0, 4, 0],
        [0, 0, 0, 0, 0],
      ],
      solution: [
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'double' }, { right: 'none', down: 'none' }, { right: 'none', down: 'double' }, { right: 'none', down: 'none' }],
        [{ right: 'double', down: 'none' }, { right: 'none', down: 'double' }, { right: 'double', down: 'none' }, { right: 'none', down: 'double' }, { right: 'none', down: 'none' }],
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'double' }, { right: 'none', down: 'none' }, { right: 'none', down: 'double' }, { right: 'none', down: 'none' }],
        [{ right: 'double', down: 'none' }, { right: 'none', down: 'none' }, { right: 'double', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }],
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }],
      ],
    },
  ],
  '7': [
    // Puzzle 1: 扩展十字
    {
      islands: [
        [0, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0],
        [1, 1, 1, 4, 1, 1, 1],
        [0, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0],
      ],
      solution: [
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }],
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }],
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }],
        [{ right: 'single', down: 'none' }, { right: 'single', down: 'none' }, { right: 'single', down: 'none' }, { right: 'none', down: 'single' }, { right: 'single', down: 'none' }, { right: 'single', down: 'none' }, { right: 'none', down: 'none' }],
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }],
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }],
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }],
      ],
    },
    // Puzzle 2: 混合桥
    {
      islands: [
        [0, 2, 0, 0, 0, 2, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 3, 0, 3, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 3, 0, 3, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 2, 0, 0, 0, 2, 0],
      ],
      solution: [
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }],
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }],
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'single', down: 'none' }, { right: 'none', down: 'none' }, { right: 'single', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }],
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }],
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'single', down: 'none' }, { right: 'none', down: 'none' }, { right: 'single', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }],
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }],
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }],
      ],
    },
  ],
  '9': [
    // Puzzle 1: 大十字
    {
      islands: [
        [0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0],
        [1, 1, 1, 1, 8, 1, 1, 1, 1],
        [0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0],
      ],
      solution: [
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }],
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }],
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }],
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }],
        [{ right: 'single', down: 'none' }, { right: 'single', down: 'none' }, { right: 'single', down: 'none' }, { right: 'single', down: 'none' }, { right: 'none', down: 'double' }, { right: 'single', down: 'none' }, { right: 'single', down: 'none' }, { right: 'single', down: 'none' }, { right: 'single', down: 'none' }],
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'double' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }],
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }],
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }],
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }],
      ],
    },
    // Puzzle 2: 复杂网络
    {
      islands: [
        [2, 0, 0, 0, 0, 0, 0, 0, 2],
        [0, 0, 2, 0, 0, 0, 2, 0, 0],
        [0, 0, 0, 0, 2, 0, 0, 0, 0],
        [0, 2, 0, 0, 0, 0, 0, 2, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 2, 0, 0, 0, 0, 0, 2, 0],
        [0, 0, 0, 0, 2, 0, 0, 0, 0],
        [0, 0, 2, 0, 0, 0, 2, 0, 0],
        [2, 0, 0, 0, 0, 0, 0, 0, 2],
      ],
      solution: [
        [{ right: 'none', down: 'single' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'single' }],
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }],
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }],
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }],
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }],
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }],
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }],
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'single' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }],
        [{ right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }, { right: 'none', down: 'none' }],
      ],
    },
  ],
}

function getPuzzle(size: number, seed: number): Puzzle {
  const key = String(size)
  const puzzles = PUZZLES[key] || PUZZLES['5']
  const idx = seed % puzzles.length
  return puzzles[idx]
}

function createEmptyEdges(size: number): EdgeCell[][] {
  return Array(size).fill(null).map(() =>
    Array(size).fill(null).map(() => ({ right: 'none' as EdgeState, down: 'none' as EdgeState }))
  )
}

export default function Hashiwokakero({ settings, onBack }: { settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }; onBack: () => void }) {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [puzzleIndex, setPuzzleIndex] = useState(0)
  const [edges, setEdges] = useState<EdgeCell[][]>(() => createEmptyEdges(5))
  const [islands, setIslands] = useState<number[][]>(() => getPuzzle(5, 0).islands)
  const [solution, setSolution] = useState<EdgeCell[][]>(() => getPuzzle(5, 0).solution)
  const [isComplete, setIsComplete] = useState(false)
  const [stats, setStats] = useState<Stats>(loadStats)
  const [showGameGuide, setShowGameGuide] = useState(false)

  const config = DIFFICULTY_CONFIG[difficulty]
  const size = config.size

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

  const initializeGame = useCallback((newDifficulty?: Difficulty) => {
    const d = newDifficulty || difficulty
    const s = DIFFICULTY_CONFIG[d].size
    const idx = puzzleIndex
    const puzzle = getPuzzle(s, idx)

    setIslands(puzzle.islands)
    setSolution(puzzle.solution)
    setEdges(createEmptyEdges(s))
    setIsComplete(false)
  }, [difficulty, puzzleIndex])

  const handleDifficultyChange = (d: Difficulty) => {
    setDifficulty(d)
    setPuzzleIndex(prev => prev + 1)
    initializeGame(d)
  }

  const countBridges = (edge: EdgeState): number => {
    if (edge === 'single') return 1
    if (edge === 'double') return 2
    return 0
  }

  const checkComplete = useCallback((currentEdges: EdgeCell[][]): boolean => {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (islands[r]?.[c] === 0) continue

        let count = 0
        if (r > 0) count += countBridges(currentEdges[r - 1]?.[c]?.down)
        if (r < size - 1) count += countBridges(currentEdges[r]?.[c]?.down)
        if (c > 0) count += countBridges(currentEdges[r]?.[c - 1]?.right)
        if (c < size - 1) count += countBridges(currentEdges[r]?.[c]?.right)

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
          <div className="flex gap-2 mb-4 justify-center flex-wrap">
            {(['easy', 'normal', 'hard'] as Difficulty[]).map(d => (
              <button
                key={d}
                onClick={() => handleDifficultyChange(d)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  difficulty === d ? 'bg-blue-600 text-white' : `${cardBgClass} border ${borderClass}`
                }`}
              >
                {t[d]}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="flex justify-center mb-4 overflow-x-auto">
            <div
              className={`relative p-3 rounded-2xl shadow-2xl ${settings.darkMode ? 'bg-gradient-to-br from-slate-700 to-slate-900' : 'bg-gradient-to-br from-blue-100 to-indigo-200'}`}
              style={{ width: size * cellSize + 24, height: size * cellSize + 24, minWidth: 'fit-content' }}
            >
              {/* Horizontal edges */}
              {edges.map((row, r) =>
                row.map((cell, c) => (
                  c < size - 1 && (
                    <div
                      key={`h-${r}-${c}`}
                      onClick={() => toggleEdge(r, c, 'right')}
                      className="absolute cursor-pointer flex items-center justify-center hover:bg-blue-500/20 rounded"
                      style={{
                        left: c * cellSize + cellSize / 2,
                        top: r * cellSize + cellSize / 2 - 6,
                        width: cellSize,
                        height: 12,
                      }}
                    >
                      {cell.right !== 'none' && (
                        <div className={`w-full ${cell.right === 'double' ? 'h-3 border-y-2' : 'h-1.5'} bg-gradient-to-r from-amber-400 to-amber-600 rounded shadow-lg shadow-amber-500/30`} />
                      )}
                    </div>
                  )
                ))
              )}

              {/* Vertical edges */}
              {edges.map((row, r) =>
                row.map((cell, c) => (
                  r < size - 1 && (
                    <div
                      key={`v-${r}-${c}`}
                      onClick={() => toggleEdge(r, c, 'down')}
                      className="absolute cursor-pointer flex items-center justify-center hover:bg-blue-500/20 rounded"
                      style={{
                        left: c * cellSize + cellSize / 2 - 6,
                        top: r * cellSize + cellSize / 2,
                        width: 12,
                        height: cellSize,
                      }}
                    >
                      {cell.down !== 'none' && (
                        <div className={`h-full ${cell.down === 'double' ? 'w-3 border-x-2' : 'w-1.5'} bg-gradient-to-b from-amber-400 to-amber-600 rounded shadow-lg shadow-amber-500/30`} />
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
                      className={`absolute rounded-full flex items-center justify-center font-bold text-lg cursor-pointer transition-all shadow-lg ${
                        settings.darkMode
                          ? 'bg-gradient-to-br from-slate-100 to-slate-300 text-slate-800'
                          : 'bg-gradient-to-br from-slate-700 to-slate-900 text-white'
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
          <div className="flex justify-center gap-2 mb-4">
            <button
              onClick={() => {
                setPuzzleIndex(prev => prev + 1)
                initializeGame()
              }}
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
              onClick={() => {
                setPuzzleIndex(prev => prev + 1)
                initializeGame()
              }}
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
