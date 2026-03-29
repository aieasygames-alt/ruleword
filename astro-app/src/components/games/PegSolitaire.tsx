import { useState, useCallback, useEffect } from 'react'

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

// Classic English peg solitaire layout
const INITIAL_BOARD = [
  [null, null, 1, 1, 1, null, null],
  [null, null, 1, 1, 1, null, null],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 0, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [null, null, 1, 1, 1, null, null],
  [null, null, 1, 1, 1, null, null],
]
// 1 = peg, 0 = empty, null = invalid

type Position = { row: number; col: number }

export default function PegSolitaire({ settings, onBack, toggleLanguage }: Props) {
  const [board, setBoard] = useState<(number | null)[][]>([])
  const [selected, setSelected] = useState<Position | null>(null)
  const [moves, setMoves] = useState(0)
  const [pegsLeft, setPegsLeft] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const t = (en: string, zh: string) => settings.language === 'zh' ? zh : en

  const initGame = useCallback(() => {
    setBoard(INITIAL_BOARD.map(row => [...row]))
    setSelected(null)
    setMoves(0)
    setGameOver(false)
    const count = INITIAL_BOARD.flat().filter(c => c === 1).length
    setPegsLeft(count)
  }, [])

  useEffect(() => {
    initGame()
  }, [initGame])

  // Count remaining pegs
  useEffect(() => {
    const count = board.flat().filter(c => c === 1).length
    setPegsLeft(count)

    // Check if game is over
    if (count <= 1) {
      setGameOver(true)
      return
    }

    // Check if any moves available
    const hasValidMove = checkForValidMoves(board)
    if (!hasValidMove) {
      setGameOver(true)
    }
  }, [board])

  function checkForValidMoves(b: (number | null)[][]): boolean {
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        if (b[row]?.[col] !== 1) continue
        const directions = [
          { dr: -2, dc: 0, mr: -1, mc: 0 },
          { dr: 2, dc: 0, mr: 1, mc: 0 },
          { dr: 0, dc: -2, mr: 0, mc: -1 },
          { dr: 0, dc: 2, mr: 0, mc: 1 },
        ]
        for (const { dr, dc, mr, mc } of directions) {
          const jumpRow = row + dr
          const jumpCol = col + dc
          const midRow = row + mr
          const midCol = col + mc
          if (b[midRow]?.[midCol] === 1 && b[jumpRow]?.[jumpCol] === 0) {
            return true
          }
        }
      }
    }
    return false
  }

  const canMove = (from: Position, to: Position): boolean => {
    const dr = to.row - from.row
    const dc = to.col - from.col

    // Must be exactly 2 cells in one direction
    if (Math.abs(dr) !== 2 && Math.abs(dc) !== 2) return false
    if (Math.abs(dr) === 2 && dc !== 0) return false
    if (Math.abs(dc) === 2 && dr !== 0) return false

    const midRow = from.row + dr / 2
    const midCol = from.col + dc / 2

    // Check: destination empty, middle has peg
    if (board[to.row]?.[to.col] !== 0) return false
    if (board[midRow]?.[midCol] !== 1) return false

    return true
  }

  const handleCellClick = (row: number, col: number) => {
    if (gameOver) return
    if (board[row]?.[col] === null) return

    if (!selected) {
      if (board[row][col] === 1) {
        setSelected({ row, col })
      }
    } else {
      if (selected.row === row && selected.col === col) {
        setSelected(null)
      } else if (board[row][col] === 0 && canMove(selected, { row, col })) {
        // Execute move
        const midRow = (selected.row + row) / 2
        const midCol = (selected.col + col) / 2

        setBoard(prev => {
          const newBoard = prev.map(r => [...r])
          newBoard[selected.row][selected.col] = 0
          newBoard[midRow][midCol] = 0
          newBoard[row][col] = 1
          return newBoard
        })
        setMoves(m => m + 1)
        setSelected(null)
      } else if (board[row][col] === 1) {
        setSelected({ row, col })
      } else {
        setSelected(null)
      }
    }
  }

  const getValidMoves = (pos: Position): Position[] => {
    const moves: Position[] = []
    const directions = [
      { dr: -2, dc: 0 },
      { dr: 2, dc: 0 },
      { dr: 0, dc: -2 },
      { dr: 0, dc: 2 },
    ]
    for (const { dr, dc } of directions) {
      const to = { row: pos.row + dr, col: pos.col + dc }
      if (canMove(pos, to)) {
        moves.push(to)
      }
    }
    return moves
  }

  const validMoves = selected ? getValidMoves(selected) : []

  const getMessage = () => {
    if (pegsLeft === 1) return t('Perfect! Only 1 peg left!', '完美！只剩1个棋子！')
    if (pegsLeft <= 3) return t('Great job!', '干得好！')
    if (gameOver) return t('No more moves!', '无法移动了！')
    return null
  }

  return (
    <div className={`min-h-screen ${settings.darkMode ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className="sticky top-0 z-50 bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-slate-400 hover:text-white">← {t('Back', '返回')}</button>
            <h1 className="text-xl font-bold">⭕ {t('Peg Solitaire', '孔明棋')}</h1>
          </div>
          <button onClick={toggleLanguage} className="px-2 py-1 bg-slate-700 rounded text-sm">
            {settings.language === 'en' ? '中文' : 'EN'}
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Stats */}
        <div className="flex justify-center gap-8 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">{pegsLeft}</div>
            <div className="text-sm text-slate-400">{t('Pegs Left', '剩余棋子')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{moves}</div>
            <div className="text-sm text-slate-400">{t('Moves', '步数')}</div>
          </div>
        </div>

        {/* Board */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-amber-700 to-amber-900 p-4 rounded-2xl shadow-2xl shadow-amber-900/50 ring-2 ring-amber-600">
            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  if (cell === null) {
                    return <div key={`${rowIndex}-${colIndex}`} className="w-10 h-10" />
                  }

                  const isSelected = selected?.row === rowIndex && selected?.col === colIndex
                  const isValidMove = validMoves.some(m => m.row === rowIndex && m.col === colIndex)

                  return (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      className={`
                        w-10 h-10 rounded-full transition-all duration-200 transform
                        ${cell === 0 ? 'bg-gradient-to-br from-amber-900 to-amber-950' : ''}
                        ${cell === 1 ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30' : ''}
                        ${isSelected ? 'ring-4 ring-yellow-300 scale-110 shadow-lg shadow-yellow-500/50' : ''}
                        ${isValidMove ? 'ring-2 ring-green-400 bg-gradient-to-br from-green-800 to-green-900 scale-105' : ''}
                        ${cell === 1 && !isSelected ? 'hover:from-amber-300 hover:to-amber-500 hover:scale-105' : ''}
                      `}
                    />
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Message */}
        {getMessage() && (
          <div className="text-center text-xl mb-4 text-yellow-400">{getMessage()}</div>
        )}

        {/* Instructions */}
        <div className="text-center text-slate-400 text-sm mb-4">
          {t('Jump over pegs to remove them. Goal: 1 peg left!', '跳过棋子将其移除。目标：只剩1个棋子！')}
        </div>

        <button onClick={initGame} className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold">
          {t('New Game', '新游戏')}
        </button>
      </main>
    </div>
  )
}
