import { useState, useCallback, useEffect, useRef } from 'react'
import { getTranslation, type Language } from './locales'

const GRID_SIZE = 3 // 3x3 网格
const MAX_SWAPS = 15 // 最大交换次数

// 字母格子的状态
type CellState = 'correct' | 'wrongPosition' | 'wrong' | 'empty'

// 网格中的每个格子
interface Cell {
  letter: string
  state: CellState
  row: number
  col: number
}

// 单词定义（交叉词）
interface WordDef {
  letters: string
  direction: 'horizontal' | 'vertical'
  startRow: number
  startCol: number
}

// 简单的3x3交叉词库
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
]

type Settings = {
  language: Language
  soundEnabled: boolean
  darkMode: boolean
}

// 生成打乱的网格
function generateShuffledGrid(puzzle: WordDef[]): Cell[][] {
  const grid: Cell[][] = Array(GRID_SIZE).fill(null).map(() =>
    Array(GRID_SIZE).fill(null).map(() => ({ letter: '', state: 'empty' as CellState, row: 0, col: 0 }))
  )

  // 先填充正确答案
  puzzle.forEach(word => {
    for (let i = 0; i < word.letters.length; i++) {
      const row = word.direction === 'horizontal' ? word.startRow : word.startRow + i
      const col = word.direction === 'horizontal' ? word.startCol + i : word.startCol
      if (row < GRID_SIZE && col < GRID_SIZE) {
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

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
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
function checkGrid(grid: Cell[][], puzzle: WordDef[]): { cells: CellState[][], isCorrect: boolean } {
  const newStates: CellState[][] = Array(GRID_SIZE).fill(null).map(() =>
    Array(GRID_SIZE).fill('empty' as CellState)
  )

  let allCorrect = true

  puzzle.forEach(word => {
    for (let i = 0; i < word.letters.length; i++) {
      const row = word.direction === 'horizontal' ? word.startRow : word.startRow + i
      const col = word.direction === 'horizontal' ? word.startCol + i : word.startCol

      if (row < GRID_SIZE && col < GRID_SIZE) {
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
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
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
  const [grid, setGrid] = useState<Cell[][]>([])
  const [cellStates, setCellStates] = useState<CellState[][]>([])
  const [puzzle, setPuzzle] = useState<WordDef[]>(CROSSWORD_PUZZLES_EN[0])
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [swapsLeft, setSwapsLeft] = useState(MAX_SWAPS)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)

  const t = getTranslation(settings.language)

  const initializeGame = useCallback(() => {
    const randomPuzzle = CROSSWORD_PUZZLES_EN[Math.floor(Math.random() * CROSSWORD_PUZZLES_EN.length)]
    setPuzzle(randomPuzzle)
    const newGrid = generateShuffledGrid(randomPuzzle)
    setGrid(newGrid)
    setCellStates(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('empty')))
    setSwapsLeft(MAX_SWAPS)
    setGameOver(false)
    setWon(false)
    setSelectedCell(null)
  }, [])

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
      // 交换字母
      const newGrid = grid.map(r => r.map(c => ({ ...c })))
      const temp = newGrid[row][col].letter
      newGrid[row][col].letter = newGrid[selectedCell.row][selectedCell.col].letter
      newGrid[selectedCell.row][selectedCell.col].letter = temp

      setGrid(newGrid)
      setSelectedCell(null)
      setSwapsLeft(prev => prev - 1)
      playSound('swap', settings.soundEnabled)

      // 检查是否完成
      const result = checkGrid(newGrid, puzzle)
      setCellStates(result.cells)

      if (result.isCorrect) {
        setWon(true)
        setGameOver(true)
        playSound('win', settings.soundEnabled)
      } else if (swapsLeft - 1 <= 0) {
        setGameOver(true)
      }
    }
  }, [selectedCell, grid, puzzle, gameOver, swapsLeft, settings.soundEnabled])

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
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className={`p-2 rounded-lg ${settings.darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">Crosswordle</h1>
          <button
            onClick={initializeGame}
            className={`p-2 rounded-lg ${settings.darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Instructions */}
        <div className={`text-center text-xs ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
          Swap letters to make all words green! {swapsLeft} swaps left
        </div>

        {/* Swap Counter */}
        <div className="flex justify-center gap-2 mt-3">
          {Array.from({ length: MAX_SWAPS }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
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
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => cell.letter && handleCellClick(r, c)}
                disabled={!cell.letter || gameOver}
                className={`
                  w-20 h-20 rounded-lg flex items-center justify-center text-3xl font-bold
                  transition-all duration-200
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
            <span>Correct</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-yellow-500" />
            <span>Wrong position</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-gray-400" />
            <span>Wrong</span>
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
                {swapsLeft} swaps remaining - {swapsLeft >= 10 ? '⭐⭐⭐' : swapsLeft >= 5 ? '⭐⭐' : '⭐'}
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
          <button
            onClick={initializeGame}
            className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-semibold text-white"
          >
            {settings.language === 'zh' ? '再来一局' : 'Play Again'}
          </button>
        </div>
      )}

      {/* Instructions */}
      {!gameOver && (
        <div className={`w-full max-w-md ${cardBgClass} rounded-t-2xl p-4`}>
          <div className={`text-center text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <p className="font-semibold mb-2">How to play:</p>
            <ol className="text-left list-decimal list-inside space-y-1">
              <li>Tap two letters to swap them</li>
              <li>🟢 Green = correct position</li>
              <li>🟡 Yellow = in the word, wrong position</li>
              <li>⬜ Gray = wrong letter</li>
              <li>Solve all words before running out of swaps!</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}
