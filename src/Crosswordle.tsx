import { useState, useCallback, useEffect, useRef } from 'react'
import { getTranslation, type Language } from './locales'

// 网格尺寸类型
type GridSize = 3 | 7 | 9

// 默认网格大小
const DEFAULT_GRID_SIZE: GridSize = 3
const MAX_SWAPS_BASE = 15 // 基础最大交换次数
const STORAGE_KEY = 'crosswordle_save'
const STATS_KEY = 'crosswordle_stats'
const SETTINGS_KEY = 'crosswordle_settings'

// 字母格子的状态
type CellState = 'correct' | 'wrongPosition' | 'wrong' | 'empty'

// 游戏模式
type GameMode = 'daily' | 'practice' | 'unlimited'

// 网格配置
interface GridConfig {
  size: GridSize
  maxSwaps: number
  cellSize: string // CSS class for cell size
}

// 网格配置映射
const GRID_CONFIGS: Record<GridSize, GridConfig> = {
  3: { size: 3, maxSwaps: 15, cellSize: 'w-20 h-20' },
  7: { size: 7, maxSwaps: 40, cellSize: 'w-12 h-12' },
  9: { size: 9, maxSwaps: 60, cellSize: 'w-10 h-10' },
}

// Crosswordle 设置类型
interface CrosswordleSettings {
  gridSize: GridSize
}

// 加载 Crosswordle 设置
function loadCrosswordleSettings(): CrosswordleSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY)
    return data ? JSON.parse(data) : { gridSize: DEFAULT_GRID_SIZE }
  } catch {
    return { gridSize: DEFAULT_GRID_SIZE }
  }
}

// 保存 Crosswordle 设置
function saveCrosswordleSettings(settings: CrosswordleSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (e) {
    console.error('Failed to save settings:', e)
  }
}
interface Cell {
  letter: string
  state: CellState
  row: number
  col: number
}

// 历史记录（用于撤销）
interface HistoryEntry {
  grid: Cell[][]
  swapsLeft: number
}

// 单词定义（交叉词）
interface WordDef {
  letters: string
  direction: 'horizontal' | 'vertical'
  startRow: number
  startCol: number
}

// 扩展的3x3交叉词库
const CROSSWORD_PUZZLES_EN: WordDef[][] = [
  [
    { letters: 'CAT', direction: 'horizontal', startRow: 0, startCol: 0 },
    { letters: 'AT', direction: 'vertical', startRow: 0, startCol: 1 },
  ],
  [
    { letters: 'DOG', direction: 'horizontal', startRow: 1, startCol: 0 },
    { letters: 'GO', direction: 'vertical', startRow: 0, startCol: 2 },
  ],
  [
    { letters: 'SUN', direction: 'horizontal', startRow: 0, startCol: 0 },
    { letters: 'US', direction: 'vertical', startRow: 0, startCol: 1 },
  ],
  [
    { letters: 'TOP', direction: 'horizontal', startRow: 1, startCol: 0 },
    { letters: 'TO', direction: 'vertical', startRow: 1, startCol: 0 },
  ],
  [
    { letters: 'PEN', direction: 'horizontal', startRow: 0, startCol: 0 },
    { letters: 'EN', direction: 'vertical', startRow: 0, startCol: 2 },
  ],
  [
    { letters: 'BAT', direction: 'horizontal', startRow: 0, startCol: 0 },
    { letters: 'AT', direction: 'vertical', startRow: 0, startCol: 1 },
  ],
  [
    { letters: 'HAT', direction: 'horizontal', startRow: 0, startCol: 0 },
    { letters: 'AT', direction: 'vertical', startRow: 0, startCol: 1 },
  ],
  [
    { letters: 'CAR', direction: 'horizontal', startRow: 0, startCol: 0 },
    { letters: 'AR', direction: 'vertical', startRow: 0, startCol: 1 },
  ],
  [
    { letters: 'MAP', direction: 'horizontal', startRow: 0, startCol: 0 },
    { letters: 'AP', direction: 'vertical', startRow: 0, startCol: 1 },
  ],
  [
    { letters: 'RUN', direction: 'horizontal', startRow: 1, startCol: 0 },
    { letters: 'UN', direction: 'vertical', startRow: 0, startCol: 2 },
  ],
  [
    { letters: 'FUN', direction: 'horizontal', startRow: 1, startCol: 0 },
    { letters: 'UN', direction: 'vertical', startRow: 0, startCol: 2 },
  ],
  [
    { letters: 'CUP', direction: 'horizontal', startRow: 0, startCol: 0 },
    { letters: 'UP', direction: 'vertical', startRow: 0, startCol: 1 },
  ],
]

// 7x7 交叉词库
const CROSSWORD_PUZZLES_7X7: WordDef[][] = [
  [
    { letters: 'COUNTRY', direction: 'horizontal', startRow: 0, startCol: 0 },
    { letters: 'COUNT', direction: 'vertical', startRow: 0, startCol: 0 },
    { letters: 'TREE', direction: 'vertical', startRow: 0, startCol: 6 },
  ],
  [
    { letters: 'PLAYING', direction: 'horizontal', startRow: 0, startCol: 0 },
    { letters: 'PLAY', direction: 'vertical', startRow: 0, startCol: 0 },
    { letters: 'PING', direction: 'vertical', startRow: 0, startCol: 4 },
  ],
  [
    { letters: 'FOREST', direction: 'horizontal', startRow: 0, startCol: 0 },
    { letters: 'FOR', direction: 'vertical', startRow: 0, startCol: 0 },
    { letters: 'REST', direction: 'vertical', startRow: 0, startCol: 3 },
  ],
  [
    { letters: 'SUMMER', direction: 'horizontal', startRow: 0, startCol: 0 },
    { letters: 'SUM', direction: 'vertical', startRow: 0, startCol: 0 },
    { letters: 'MER', direction: 'vertical', startRow: 0, startCol: 4 },
  ],
  [
    { letters: 'WINTER', direction: 'horizontal', startRow: 0, startCol: 0 },
    { letters: 'WIN', direction: 'vertical', startRow: 0, startCol: 0 },
    { letters: 'NET', direction: 'vertical', startRow: 0, startCol: 3 },
  ],
]

// 9x9 交叉词库
const CROSSWORD_PUZZLES_9X9: WordDef[][] = [
  [
    { letters: 'BEAUTIFUL', direction: 'horizontal', startRow: 0, startCol: 0 },
    { letters: 'BEAUTY', direction: 'vertical', startRow: 0, startCol: 0 },
    { letters: 'FULL', direction: 'vertical', startRow: 0, startCol: 6 },
  ],
  [
    { letters: 'WONDERFUL', direction: 'horizontal', startRow: 0, startCol: 0 },
    { letters: 'WONDER', direction: 'vertical', startRow: 0, startCol: 0 },
    { letters: 'FULL', direction: 'vertical', startRow: 0, startCol: 6 },
  ],
  [
    { letters: 'CHALLENGE', direction: 'horizontal', startRow: 0, startCol: 0 },
    { letters: 'CHANGE', direction: 'vertical', startRow: 0, startCol: 0 },
    { letters: 'LEVEL', direction: 'vertical', startRow: 0, startCol: 5 },
  ],
  [
    { letters: 'DANGEROUS', direction: 'horizontal', startRow: 0, startCol: 0 },
    { letters: 'DANGER', direction: 'vertical', startRow: 0, startCol: 0 },
    { letters: 'ROUS', direction: 'vertical', startRow: 0, startCol: 5 },
  ],
  [
    { letters: 'IMPORTANT', direction: 'horizontal', startRow: 0, startCol: 0 },
    { letters: 'IMPORT', direction: 'vertical', startRow: 0, startCol: 0 },
    { letters: 'ANT', direction: 'vertical', startRow: 0, startCol: 6 },
  ],
]

// 获取对应尺寸的谜题库
function getPuzzleForSize(size: GridSize): WordDef[][] {
  switch (size) {
    case 7:
      return CROSSWORD_PUZZLES_7X7
    case 9:
      return CROSSWORD_PUZZLES_9X9
    default:
      return CROSSWORD_PUZZLES_EN
  }
}

// 获取每日谜题索引
function getDailyPuzzleIndex(): number {
  const startDate = new Date('2024-01-01').getTime()
  const now = new Date().setHours(0, 0, 0, 0)
  return Math.floor((now - startDate) / 86400000) % CROSSWORD_PUZZLES_EN.length
}

type Settings = {
  language: Language
  soundEnabled: boolean
  darkMode: boolean
}

// 保存数据类型
type SaveData = {
  dayIndex: number
  grid: Cell[][]
  swapsLeft: number
  gameOver: boolean
  won: boolean
  gameMode: GameMode
}

// 统计数据类型
type Stats = {
  played: number
  won: number
  currentStreak: number
  maxStreak: number
  bestSwaps: number // 最少剩余交换次数
}

// 默认统计
const defaultStats: Stats = {
  played: 0,
  won: 0,
  currentStreak: 0,
  maxStreak: 0,
  bestSwaps: 0,
}

// 加载保存数据
function loadSave(): SaveData | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

// 保存游戏数据
function saveGame(data: SaveData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save game:', e)
  }
}

// 加载统计数据
function loadStats(): Stats {
  try {
    const data = localStorage.getItem(STATS_KEY)
    return data ? { ...defaultStats, ...JSON.parse(data) } : defaultStats
  } catch {
    return defaultStats
  }
}

// 保存统计数据
function saveStats(stats: Stats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  } catch (e) {
    console.error('Failed to save stats:', e)
  }
}

// 更新统计数据
function updateStats(won: boolean, swapsLeft: number): Stats {
  const stats = loadStats()
  stats.played++

  if (won) {
    stats.won++
    stats.currentStreak++
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak)
    stats.bestSwaps = Math.max(stats.bestSwaps, swapsLeft)
  } else {
    stats.currentStreak = 0
  }

  saveStats(stats)
  return stats
}

// 生成打乱的网格
function generateShuffledGrid(puzzle: WordDef[], size: GridSize): Cell[][] {
  const grid: Cell[][] = Array(size).fill(null).map(() =>
    Array(size).fill(null).map(() => ({ letter: '', state: 'empty' as CellState, row: 0, col: 0 }))
  )

  // 先填充正确答案
  puzzle.forEach(word => {
    for (let i = 0; i < word.letters.length; i++) {
      const row = word.direction === 'horizontal' ? word.startRow : word.startRow + i
      const col = word.direction === 'horizontal' ? word.startCol + i : word.startCol
      if (row < size && col < size) {
        grid[row][col] = {
          letter: word.letters[i],
          state: 'empty',
          row,
          col
        }
      }
    }
  })

  // 收集所有字母并打乱
  const letters: string[] = []
  const positions: { row: number; col: number }[] = []

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c].letter) {
        letters.push(grid[r][c].letter)
        positions.push({ row: r, col: c })
      }
    }
  }

  // Fisher-Yates 洗牌
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[letters[i], letters[j]] = [letters[j], letters[i]]
  }

  // 填充打乱后的字母
  positions.forEach((pos, i) => {
    grid[pos.row][pos.col].letter = letters[i]
  })

  return grid
}

// 检查网格是否正确
function checkGrid(grid: Cell[][], puzzle: WordDef[], size: GridSize): { cells: CellState[][], isCorrect: boolean } {
  const newStates: CellState[][] = Array(size).fill(null).map(() =>
    Array(size).fill('empty' as CellState)
  )

  let allCorrect = true

  puzzle.forEach(word => {
    for (let i = 0; i < word.letters.length; i++) {
      const row = word.direction === 'horizontal' ? word.startRow : word.startRow + i
      const col = word.direction === 'horizontal' ? word.startCol + i : word.startCol

      if (row < size && col < size) {
        const currentLetter = grid[row][col].letter
        const correctLetter = word.letters[i]

        if (currentLetter === correctLetter) {
          newStates[row][col] = 'correct'
        } else {
          allCorrect = false
          // 检查该字母是否在单词中（黄色）
          const isInWord = word.letters.includes(currentLetter)
          newStates[row][col] = isInWord ? 'wrongPosition' : 'wrong'
        }
      }
    }
  })

  // 对于交叉点，如果任一方向是correct则设为correct
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // 检查这个位置是否被多个单词覆盖
      const coveredBy = puzzle.filter(word => {
        if (word.direction === 'horizontal') {
          return r === word.startRow && c >= word.startCol && c < word.startCol + word.letters.length
        } else {
          return c === word.startCol && r >= word.startRow && r < word.startRow + word.letters.length
        }
      })

      if (coveredBy.length > 1) {
        // 交叉点，如果任一方向正确就是正确
        const anyCorrect = coveredBy.some(word => {
          const idx = word.direction === 'horizontal' ? c - word.startCol : r - word.startRow
          return grid[r][c].letter === word.letters[idx]
        })
        if (anyCorrect) {
          newStates[r][c] = 'correct'
        }
      }
    }
  }

  return { cells: newStates, isCorrect: allCorrect }
}

// 音效
function playSound(type: 'swap' | 'win', enabled: boolean) {
  if (!enabled) return
  const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  if (type === 'swap') {
    oscillator.frequency.value = 300
    gainNode.gain.value = 0.05
    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.05)
  } else {
    oscillator.frequency.value = 523
    gainNode.gain.value = 0.1
    oscillator.start()
    oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.15)
    oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.3)
    oscillator.stop(audioContext.currentTime + 0.4)
  }
}

interface CrosswordleProps {
  settings: Settings
  onBack: () => void
}

export default function Crosswordle({ settings, onBack }: CrosswordleProps) {
  const [gameMode, setGameMode] = useState<GameMode>('daily')
  const [gridSize, setGridSize] = useState<GridSize>(() => loadCrosswordleSettings().gridSize)
  const [grid, setGrid] = useState<Cell[][]>([])
  const [cellStates, setCellStates] = useState<CellState[][]>([])
  const [puzzle, setPuzzle] = useState<WordDef[]>(CROSSWORD_PUZZLES_EN[0])
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [swapsLeft, setSwapsLeft] = useState(GRID_CONFIGS[3].maxSwaps)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [stats, setStats] = useState<Stats>(() => loadStats())

  const gridConfig = GRID_CONFIGS[gridSize]
  const t = getTranslation(settings.language)

  const initializeGame = useCallback((mode?: GameMode, size?: GridSize) => {
    const newMode = mode || gameMode
    const newSize = size || gridSize
    setGameMode(newMode)
    setGridSize(newSize)

    // 切换到 unlimited 模式时自动调整网格大小
    let actualMode = newMode
    let actualSize = newSize

    if (newMode === 'unlimited' && newSize === 3) {
      actualSize = 7 // unlimited 模式默认使用 7x7
      setGridSize(7)
    }

    const newConfig = GRID_CONFIGS[actualSize]
    const puzzleLibrary = getPuzzleForSize(actualSize)

    let puzzleIndex: number
    if (actualMode === 'daily') {
      // 每日模式只支持 3x3
      const dailySize = 3
      setGridSize(dailySize)
      puzzleIndex = getDailyPuzzleIndex() % CROSSWORD_PUZZLES_EN.length
      const save = loadSave()
      const todayIndex = getDailyPuzzleIndex()
      if (save && save.dayIndex === todayIndex && save.gameMode === 'daily') {
        setPuzzle(CROSSWORD_PUZZLES_EN[save.dayIndex])
        setGrid(save.grid)
        setSwapsLeft(save.swapsLeft)
        setGameOver(save.gameOver)
        setWon(save.won)
        setCellStates(Array(3).fill(null).map(() => Array(3).fill('empty')))
        setHistory([])
        setSelectedCell(null)
        return
      }
    } else {
      puzzleIndex = Math.floor(Math.random() * puzzleLibrary.length)
    }

    const selectedPuzzle = puzzleLibrary[puzzleIndex]
    setPuzzle(selectedPuzzle)
    const newGrid = generateShuffledGrid(selectedPuzzle, actualSize)
    setGrid(newGrid)
    setCellStates(Array(actualSize).fill(null).map(() => Array(actualSize).fill('empty')))
    setSwapsLeft(newConfig.maxSwaps)
    setGameOver(false)
    setWon(false)
    setHistory([])
    setSelectedCell(null)
  }, [gameMode, gridSize])

  useEffect(() => {
    initializeGame()
  }, [initializeGame])

  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameOver || swapsLeft <= 0) return

    if (!selectedCell) {
      // 选择第一个格子
      setSelectedCell({ row, col })
    } else if (selectedCell.row === row && selectedCell.col === col) {
      // 取消选择
      setSelectedCell(null)
    } else {
      // 保存历史记录
      const historyEntry: HistoryEntry = {
        grid: grid.map(r => r.map(c => ({ ...c }))),
        swapsLeft: swapsLeft
      }

      // 交换字母
      const newGrid = grid.map(r => r.map(c => ({ ...c })))
      const temp = newGrid[row][col].letter
      newGrid[row][col].letter = newGrid[selectedCell.row][selectedCell.col].letter
      newGrid[selectedCell.row][selectedCell.col].letter = temp

      setGrid(newGrid)
      setSelectedCell(null)
      setSwapsLeft(prev => prev - 1)
      setHistory(prev => [...prev, historyEntry])
      playSound('swap', settings.soundEnabled)

      // 检查是否完成
      const result = checkGrid(newGrid, puzzle, gridSize)
      setCellStates(result.cells)

      const newSwapsLeft = swapsLeft - 1
      const isWin = result.isCorrect
      const isGameOver = isWin || newSwapsLeft <= 0

      if (isWin) {
        setWon(true)
        setGameOver(true)
        playSound('win', settings.soundEnabled)
        // 更新统计（只对练习和无限模式）
        if (gameMode === 'practice' || gameMode === 'unlimited') {
          setStats(updateStats(true, newSwapsLeft))
        }
      } else if (isGameOver) {
        setGameOver(true)
        // 更新统计（只对练习和无限模式）
        if (gameMode === 'practice' || gameMode === 'unlimited') {
          setStats(updateStats(false, 0))
        }
      }

      // 保存每日模式进度
      if (gameMode === 'daily') {
        saveGame({
          dayIndex: getDailyPuzzleIndex(),
          grid: newGrid,
          swapsLeft: newSwapsLeft,
          gameOver: isGameOver,
          won: isWin,
          gameMode: 'daily'
        })
      }
    }
  }, [selectedCell, grid, puzzle, gameOver, swapsLeft, settings.soundEnabled, gameMode])

  // 撤销功能
  const handleUndo = useCallback(() => {
    if (history.length === 0 || gameOver) return

    const lastState = history[history.length - 1]
    setGrid(lastState.grid)
    setSwapsLeft(lastState.swapsLeft)
    setHistory(prev => prev.slice(0, -1))
    setSelectedCell(null)
    setCellStates(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('empty')))
  }, [history, gameOver])

  const getCellColor = useCallback((row: number, col: number) => {
    const state = cellStates[row]?.[col]
    if (state === 'correct') return 'bg-green-500'
    if (state === 'wrongPosition') return 'bg-yellow-500'
    if (state === 'wrong') return 'bg-gray-400'
    return settings.darkMode ? 'bg-gray-700' : 'bg-gray-200'
  }, [cellStates, settings.darkMode])

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'

  return (
    <div className={`min-h-screen flex flex-col items-center py-4 px-2 ${bgClass} ${textClass}`}>
      {/* Header */}
      <div className="w-full max-w-md mb-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className={`p-2 rounded-lg ${settings.darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">Crosswordle</h1>
        </div>

        {/* Game Mode Selector */}
        <div className="flex justify-center gap-2 mb-3">
          {[
            { id: 'daily' as GameMode, label: settings.language === 'zh' ? '每日' : 'Daily', color: 'purple' },
            { id: 'unlimited' as GameMode, label: settings.language === 'zh' ? '无限' : 'Unlimited', color: 'orange' },
            { id: 'practice' as GameMode, label: settings.language === 'zh' ? '练习' : 'Practice', color: 'blue' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => initializeGame(mode.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                gameMode === mode.id
                  ? `bg-${mode.color}-600 text-white`
                  : settings.darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Undo Button */}
        {!gameOver && (
          <div className="flex justify-center mb-3">
            <button
              onClick={handleUndo}
              disabled={history.length === 0}
              className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 ${
                history.length > 0
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              {settings.language === 'zh' ? '撤销' : 'Undo'} {history.length > 0 && `(${history.length})`}
            </button>
          </div>
        )}

        {/* Grid Size Selector - 始终显示 */}
        <div className="flex justify-center gap-2 mb-3">
          {[3, 7, 9].map((size) => {
            const isDisabled = gameMode === 'daily' && size !== 3
            return (
              <button
                key={size}
                onClick={() => {
                  if (isDisabled) return
                  setGridSize(size as GridSize)
                  saveCrosswordleSettings({ gridSize: size as GridSize })
                  initializeGame(gameMode, size as GridSize)
                }}
                disabled={isDisabled}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  gridSize === size
                    ? 'bg-green-600 text-white'
                    : settings.darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } ${isDisabled ? 'opacity-40 cursor-not-allowed hover:bg-opacity-100' : ''}`}
                title={isDisabled ? (settings.language === 'zh' ? '每日模式仅支持 3×3' : 'Daily mode only supports 3×3') : ''}
              >
                {size}×{size}
              </button>
            )
          })}
        </div>

        {/* Instructions */}
        <div className={`text-center text-xs ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {gameMode === 'daily'
            ? (settings.language === 'zh' ? '每日挑战 (3×3)' : 'Daily Challenge (3×3)')
            : gameMode === 'unlimited'
            ? `${settings.language === 'zh' ? '无限模式' : 'Unlimited'} (${gridSize}×${gridSize})`
            : `${settings.language === 'zh' ? '练习模式' : 'Practice'} (${gridSize}×${gridSize})`
          } • {settings.language === 'zh' ? '剩余' : ''} {swapsLeft} {settings.language === 'zh' ? '次交换' : 'swaps left'}
        </div>

        {/* Swap Counter */}
        <div className="flex justify-center gap-1 mt-3 flex-wrap">
          {Array.from({ length: gridConfig.maxSwaps }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${
                i < swapsLeft
                  ? 'bg-green-500'
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Game Board */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div
          className="grid gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            maxWidth: gridSize === 9 ? '400px' : gridSize === 7 ? '350px' : '300px'
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => cell.letter && handleCellClick(r, c)}
                disabled={!cell.letter || gameOver}
                className={`
                  ${gridConfig.cellSize} rounded-lg flex items-center justify-center font-bold
                  transition-all duration-200
                  ${gridSize === 3 ? 'text-3xl' : gridSize === 7 ? 'text-lg' : 'text-base'}
                  ${getCellColor(r, c)}
                  ${!cell.letter ? 'invisible' : 'visible'}
                  ${selectedCell?.row === r && selectedCell?.col === c ? 'ring-4 ring-blue-500 scale-105' : ''}
                  ${cell.letter && !gameOver ? 'hover:scale-105 cursor-pointer' : 'cursor-default'}
                  ${gameOver && cellStates[r]?.[c] === 'correct' ? 'animate-pulse' : ''}
                `}
              >
                {cell.letter}
              </button>
            ))
          )}
        </div>

        {/* Legend */}
        <div className={`mt-6 flex gap-4 text-xs ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span>{settings.language === 'zh' ? '正确' : 'Correct'}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-yellow-500" />
            <span>{settings.language === 'zh' ? '在词中' : 'In word'}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-gray-400" />
            <span>{settings.language === 'zh' ? '错误' : 'Wrong'}</span>
          </div>
        </div>
      </div>

      {/* Game Over Message */}
      {gameOver && (
        <div className={`w-full max-w-md ${cardBgClass} rounded-xl p-4 text-center`}>
          {won ? (
            <>
              <div className="text-3xl mb-2">🎉</div>
              <div className="font-bold text-green-500 mb-2">
                {settings.language === 'zh' ? '完美破解！' : 'Perfect!'}
              </div>
              <div className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {settings.language === 'zh' ? '剩余' : ''} {swapsLeft} {settings.language === 'zh' ? '次交换' : 'swaps remaining'} - {swapsLeft >= 10 ? '⭐⭐⭐' : swapsLeft >= 5 ? '⭐⭐' : '⭐'}
              </div>
            </>
          ) : (
            <>
              <div className="text-3xl mb-2">😅</div>
              <div className="font-bold text-red-500 mb-2">
                {settings.language === 'zh' ? '用完交换次数' : 'Out of swaps!'}
              </div>
            </>
          )}

          {/* 统计信息（练习和无限模式） */}
          {(gameMode === 'practice' || gameMode === 'unlimited') && (
            <div className={`mt-4 pt-4 border-t ${settings.darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className={`grid grid-cols-3 gap-4 text-center ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.played}</div>
                  <div className="text-xs">{settings.language === 'zh' ? '已玩' : 'Played'}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0}%
                  </div>
                  <div className="text-xs">{settings.language === 'zh' ? '胜率' : 'Win Rate'}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{stats.currentStreak}</div>
                  <div className="text-xs">{settings.language === 'zh' ? '连胜' : 'Streak'}</div>
                </div>
              </div>
              {stats.bestSwaps > 0 && (
                <div className={`mt-3 text-xs ${settings.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {settings.language === 'zh' ? '最佳成绩：' : 'Best: '} {settings.language === 'zh' ? '剩余' : ''} {stats.bestSwaps} {settings.language === 'zh' ? '次交换' : 'swaps'}
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => initializeGame(gameMode)}
            className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-semibold text-white"
          >
            {gameMode === 'daily'
              ? (settings.language === 'zh' ? '明天再战' : 'Come back tomorrow')
              : (settings.language === 'zh' ? '再来一局' : 'Play Again')
            }
          </button>
        </div>
      )}

      {/* Instructions */}
      {!gameOver && (
        <div className={`w-full max-w-md ${cardBgClass} rounded-t-2xl p-4`}>
          <div className={`text-center text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <p className="font-semibold mb-2">
              {settings.language === 'zh' ? '游戏说明：' : 'How to play:'}
            </p>
            <ol className="text-left list-decimal list-inside space-y-1">
              <li>{settings.language === 'zh' ? '点击两个字母进行交换' : 'Tap two letters to swap them'}</li>
              <li>🟢 {settings.language === 'zh' ? '绿色 = 位置正确' : 'Green = correct position'}</li>
              <li>🟡 {settings.language === 'zh' ? '黄色 = 在单词中但位置错误' : 'Yellow = in word, wrong position'}</li>
              <li>⬜ {settings.language === 'zh' ? '灰色 = 字母错误' : 'Gray = wrong letter'}</li>
              <li>{settings.language === 'zh' ? '用完交换次数前解开所有单词！' : 'Solve all words before running out of swaps!'}</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}
