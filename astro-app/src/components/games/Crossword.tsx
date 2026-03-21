import { useState, useCallback, useEffect, useRef } from 'react'

type Cell = {
  letter: string
  answer: string
  number: number | null
  isBlack: boolean
}

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type Props = {
  settings: Settings
  onBack: () => void
  toggleLanguage: () => void
}

// Simple crossword puzzle data
const PUZZLES = [
  {
    grid: [
      ['C', 'A', 'T', '#', 'D', 'O', 'G'],
      ['A', '#', 'O', '#', 'A', '#', 'O'],
      ['R', 'U', 'N', '#', 'Y', 'E', 'S'],
      ['#', 'P', '#', 'S', '#', 'A', '#'],
      ['B', 'A', 'T', 'U', 'N', 'T', 'I'],
      ['I', '#', '#', 'N', '#', '#', '#'],
      ['R', 'E', 'D', '#', 'S', 'U', 'N'],
    ],
    clues: {
      across: [
        { num: 1, clue: 'Feline pet', row: 0, col: 0 },
        { num: 4, clue: 'Canine companion', row: 0, col: 4 },
        { num: 7, clue: 'Move quickly', row: 2, col: 0 },
        { num: 8, clue: 'Affirmative', row: 2, col: 4 },
        { num: 10, clue: 'Flying mammal', row: 4, col: 0 },
        { num: 11, clue: 'Not out', row: 4, col: 3 },
        { num: 12, clue: 'Color of fire', row: 6, col: 0 },
        { num: 13, clue: 'Star at center of solar system', row: 6, col: 4 },
      ],
      down: [
        { num: 1, clue: 'Automobile', row: 0, col: 0 },
        { num: 2, clue: 'Highest point', row: 0, col: 2 },
        { num: 3, clue: 'Twenty-four hours', row: 2, col: 4 },
        { num: 5, clue: 'Consumed food', row: 2, col: 6 },
        { num: 6, clue: 'Flying insect', row: 4, col: 5 },
        { num: 9, clue: 'Avian creature', row: 4, col: 0 },
      ],
    },
  },
]

export default function Crossword({ settings, onBack, toggleLanguage }: Props) {
  const [grid, setGrid] = useState<Cell[][]>([])
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [direction, setDirection] = useState<'across' | 'down'>('across')
  const [currentPuzzle, setCurrentPuzzle] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const t = (en: string, zh: string) => settings.language === 'zh' ? zh : en

  const initPuzzle = useCallback(() => {
    const puzzle = PUZZLES[currentPuzzle]
    const newGrid: Cell[][] = []
    let cellNum = 1

    for (let row = 0; row < puzzle.grid.length; row++) {
      const newRow: Cell[] = []
      for (let col = 0; col < puzzle.grid[row].length; col++) {
        const char = puzzle.grid[row][col]
        const isBlack = char === '#'
        const needsNumber = !isBlack && (
          row === 0 || puzzle.grid[row - 1]?.[col] === '#' ||
          col === 0 || puzzle.grid[row]?.[col - 1] === '#'
        )

        newRow.push({
          letter: '',
          answer: isBlack ? '' : char,
          number: needsNumber && !isBlack ? cellNum++ : null,
          isBlack,
        })
      }
      newGrid.push(newRow)
    }
    setGrid(newGrid)
    setIsComplete(false)
    setSelectedCell(null)
  }, [currentPuzzle])

  useEffect(() => {
    initPuzzle()
  }, [initPuzzle])

  useEffect(() => {
    inputRef.current?.focus()
  }, [selectedCell])

  // Check completion
  useEffect(() => {
    const complete = grid.every(row =>
      row.every(cell => cell.isBlack || cell.letter.toUpperCase() === cell.answer)
    )
    if (complete && grid.length > 0) {
      setIsComplete(true)
    }
  }, [grid])

  const handleCellClick = (row: number, col: number) => {
    if (grid[row]?.[col]?.isBlack) return
    if (selectedCell?.row === row && selectedCell?.col === col) {
      setDirection(d => d === 'across' ? 'down' : 'across')
    } else {
      setSelectedCell({ row, col })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!selectedCell) return
    const { row, col } = selectedCell

    if (e.key === 'Backspace') {
      setGrid(prev => {
        const newGrid = prev.map(r => r.map(c => ({ ...c })))
        if (newGrid[row][col].letter) {
          newGrid[row][col].letter = ''
        } else {
          // Move back
          const prevCell = direction === 'across'
            ? { row, col: Math.max(0, col - 1) }
            : { row: Math.max(0, row - 1), col }
          if (!newGrid[prevCell.row][prevCell.col].isBlack) {
            newGrid[prevCell.row][prevCell.col].letter = ''
            setSelectedCell(prevCell)
          }
        }
        return newGrid
      })
    } else if (e.key === 'ArrowRight') {
      const next = { row, col: Math.min(grid[0].length - 1, col + 1) }
      if (!grid[next.row][next.col].isBlack) setSelectedCell(next)
      setDirection('across')
    } else if (e.key === 'ArrowLeft') {
      const next = { row, col: Math.max(0, col - 1) }
      if (!grid[next.row][next.col].isBlack) setSelectedCell(next)
      setDirection('across')
    } else if (e.key === 'ArrowDown') {
      const next = { row: Math.min(grid.length - 1, row + 1), col }
      if (!grid[next.row][next.col].isBlack) setSelectedCell(next)
      setDirection('down')
    } else if (e.key === 'ArrowUp') {
      const next = { row: Math.max(0, row - 1), col }
      if (!grid[next.row][next.col].isBlack) setSelectedCell(next)
      setDirection('down')
    } else if (/^[a-zA-Z]$/.test(e.key)) {
      setGrid(prev => {
        const newGrid = prev.map(r => r.map(c => ({ ...c })))
        newGrid[row][col].letter = e.key.toUpperCase()
        return newGrid
      })
      // Move to next cell
      const next = direction === 'across'
        ? { row, col: Math.min(grid[0].length - 1, col + 1) }
        : { row: Math.min(grid.length - 1, row + 1), col }
      if (!grid[next.row]?.[next.col]?.isBlack) {
        setSelectedCell(next)
      }
    }
  }

  const getCurrentClue = () => {
    if (!selectedCell) return null
    const puzzle = PUZZLES[currentPuzzle]
    const clues = puzzle.clues[direction]
    const { row, col } = selectedCell

    for (const clue of clues) {
      if (direction === 'across' && clue.row === row && col >= clue.col) {
        const endCol = clue.col
        while (endCol < puzzle.grid[0].length && puzzle.grid[row][endCol] !== '#') endCol++
        if (col < endCol) return clue
      } else if (direction === 'down' && clue.col === col && row >= clue.row) {
        const endRow = clue.row
        while (endRow < puzzle.grid.length && puzzle.grid[endRow][col] !== '#') endRow++
        if (row < endRow) return clue
      }
    }
    return null
  }

  const currentClue = getCurrentClue()

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="sticky top-0 z-50 bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-slate-400 hover:text-white">← {t('Back', '返回')}</button>
            <h1 className="text-xl font-bold">📝 {t('Crossword', '填字游戏')}</h1>
          </div>
          <button onClick={toggleLanguage} className="px-2 py-1 bg-slate-700 rounded text-sm">
            {settings.language === 'en' ? '中文' : 'EN'}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <input
          ref={inputRef}
          type="text"
          onKeyDown={handleKeyDown}
          className="opacity-0 absolute -z-10"
          autoFocus
        />

        {/* Current Clue */}
        {currentClue && (
          <div className="bg-blue-600 rounded-lg p-3 mb-4">
            <span className="font-bold">{currentClue.num}{direction === 'across' ? 'A' : 'D'}:</span> {currentClue.clue}
          </div>
        )}

        {/* Grid */}
        <div className="flex justify-center mb-6">
          <div className="inline-grid gap-0.5 bg-black p-0.5 rounded-lg">
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-0.5">
                {row.map((cell, colIndex) => (
                  <button
                    key={colIndex}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    className={`
                      w-10 h-10 relative flex items-center justify-center text-xl font-bold
                      ${cell.isBlack ? 'bg-black' : 'bg-white text-black'}
                      ${selectedCell?.row === rowIndex && selectedCell?.col === colIndex ? 'ring-2 ring-blue-500' : ''}
                      ${!cell.isBlack && cell.letter === cell.answer && cell.letter ? 'bg-green-200' : ''}
                    `}
                  >
                    {cell.number && (
                      <span className="absolute top-0 left-0.5 text-[10px] font-normal">{cell.number}</span>
                    )}
                    {!cell.isBlack && cell.letter}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Clues */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-lg mb-2">{t('Across', '横向')}</h3>
            <ul className="space-y-1 text-sm">
              {PUZZLES[currentPuzzle].clues.across.map(clue => (
                <li key={clue.num} className={`${currentClue?.num === clue.num && direction === 'across' ? 'text-blue-400' : 'text-slate-400'}`}>
                  {clue.num}. {clue.clue}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">{t('Down', '纵向')}</h3>
            <ul className="space-y-1 text-sm">
              {PUZZLES[currentPuzzle].clues.down.map(clue => (
                <li key={clue.num} className={`${currentClue?.num === clue.num && direction === 'down' ? 'text-blue-400' : 'text-slate-400'}`}>
                  {clue.num}. {clue.clue}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button onClick={initPuzzle} className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold">
            {t('Reset Puzzle', '重置谜题')}
          </button>
        </div>
      </main>

      {/* Complete Modal */}
      {isComplete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-4">{t('Puzzle Complete!', '谜题完成！')}</h2>
            <button onClick={initPuzzle} className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold">
              {t('Play Again', '再玩一次')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
