import { useState, useCallback, useEffect } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type NimProps = {
  settings: Settings
  onBack: () => void
  toggleLanguage: () => void
  toggleTheme: () => void
  toggleSound: () => void
}

type Row = {
  id: number
  count: number
}

export default function Nim({ settings, onBack }: NimProps) {
  const [rows, setRows] = useState<Row[]>([])
  const [selectedRow, setSelectedRow] = useState<number | null>(null)
  const [removeCount, setRemoveCount] = useState(0)
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null)
  const [score, setScore] = useState({ player: 0, ai: 0 })
  const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('easy')
  const [gameStarted, setGameStarted] = useState(false)

  const isDark = settings.darkMode
  const bgClass = isDark ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = isDark ? 'text-white' : 'text-gray-900'

  const initGame = useCallback(() => {
    // Classic Nim starting position: 1, 3, 5, 7 items
    setRows([
      { id: 0, count: 1 },
      { id: 1, count: 3 },
      { id: 2, count: 5 },
      { id: 3, count: 7 },
    ])
    setSelectedRow(null)
    setRemoveCount(0)
    setIsPlayerTurn(true)
    setGameOver(false)
    setWinner(null)
    setGameStarted(true)
  }, [])

  // Calculate XOR sum (nim-sum) for optimal AI
  const calculateNimSum = useCallback((currentRows: Row[]): number => {
    return currentRows.reduce((sum, row) => sum ^ row.count, 0)
  }, [])

  // Check if game is over
  const checkGameOver = useCallback((currentRows: Row[]): boolean => {
    return currentRows.every(row => row.count === 0)
  }, [])

  // AI move
  const makeAIMove = useCallback(() => {
    if (gameOver || isPlayerTurn) return

    setTimeout(() => {
      setRows(prevRows => {
        const newRows = prevRows.map(r => ({ ...r }))

        if (difficulty === 'easy' && Math.random() < 0.3) {
          // 30% chance of random move in easy mode
          const nonEmptyRows = newRows.filter(r => r.count > 0)
          const randomRow = nonEmptyRows[Math.floor(Math.random() * nonEmptyRows.length)]
          const remove = Math.floor(Math.random() * randomRow.count) + 1
          randomRow.count -= remove
        } else {
          // Optimal move using XOR strategy
          const nimSum = calculateNimSum(newRows)

          if (nimSum === 0) {
            // No winning move, make any valid move
            const nonEmptyRows = newRows.filter(r => r.count > 0)
            const randomRow = nonEmptyRows[Math.floor(Math.random() * nonEmptyRows.length)]
            randomRow.count -= 1
          } else {
            // Find row where (row.count XOR nimSum) < row.count
            let foundMove = false
            for (const row of newRows) {
              const target = row.count ^ nimSum
              if (target < row.count) {
                row.count = target
                foundMove = true
                break
              }
            }

            if (!foundMove) {
              // Fallback: remove 1 from first non-empty row
              const nonEmptyRow = newRows.find(r => r.count > 0)
              if (nonEmptyRow) nonEmptyRow.count -= 1
            }
          }
        }

        // Check if AI took the last item
        if (checkGameOver(newRows)) {
          setGameOver(true)
          setWinner('player')
          setScore(prev => ({ ...prev, player: prev.player + 1 }))
        } else {
          setIsPlayerTurn(true)
        }

        return newRows
      })
    }, 600)
  }, [gameOver, isPlayerTurn, difficulty, calculateNimSum, checkGameOver])

  // Trigger AI move
  useEffect(() => {
    if (!isPlayerTurn && !gameOver && gameStarted) {
      makeAIMove()
    }
  }, [isPlayerTurn, gameOver, gameStarted, makeAIMove])

  const handleRowSelect = (rowId: number) => {
    if (!isPlayerTurn || gameOver) return

    if (selectedRow === rowId) {
      setSelectedRow(null)
      setRemoveCount(0)
    } else {
      setSelectedRow(rowId)
      setRemoveCount(1)
    }
  }

  const handleRemoveChange = (delta: number) => {
    const newCount = removeCount + delta
    const row = rows.find(r => r.id === selectedRow)
    if (row && newCount >= 1 && newCount <= row.count) {
      setRemoveCount(newCount)
    }
  }

  const handleConfirmMove = () => {
    if (selectedRow === null || removeCount === 0) return

    setRows(prevRows => {
      const newRows = prevRows.map(r =>
        r.id === selectedRow ? { ...r, count: r.count - removeCount } : r
      )

      // Check if player took the last item
      if (checkGameOver(newRows)) {
        setGameOver(true)
        setWinner('ai')
        setScore(prev => ({ ...prev, ai: prev.ai + 1 }))
      } else {
        setIsPlayerTurn(false)
      }

      return newRows
    })

    setSelectedRow(null)
    setRemoveCount(0)
  }

  const renderStones = (count: number, rowId: number) => {
    return (
      <div className="flex gap-1 flex-wrap justify-center">
        {Array(count).fill(null).map((_, idx) => (
          <div
            key={idx}
            className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full transition-all ${
              isPlayerTurn && selectedRow === rowId && idx >= count - removeCount
                ? 'bg-red-500/50 scale-90'
                : 'bg-amber-600'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} flex flex-col`}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/90 border-b border-slate-800 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm"
          >
            ← Back
          </button>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-xs text-slate-400">You</div>
              <div className="text-lg font-bold text-green-400">{score.player}</div>
            </div>
            <span className="text-slate-500">-</span>
            <div className="text-center">
              <div className="text-xs text-slate-400">AI</div>
              <div className="text-lg font-bold text-red-400">{score.ai}</div>
            </div>
          </div>
          <button
            onClick={initGame}
            className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 transition-colors text-sm font-medium"
          >
            New Game
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        {!gameStarted ? (
          // Start Screen
          <div className="text-center space-y-6">
            <div className="text-6xl">🪨</div>
            <h1 className="text-3xl font-bold">Nim</h1>
            <p className="text-slate-400 max-w-sm mx-auto">
              Take turns removing stones. The player who takes the last stone loses!
            </p>
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Difficulty:</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setDifficulty('easy')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    difficulty === 'easy' ? 'bg-green-600' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  Easy
                </button>
                <button
                  onClick={() => setDifficulty('hard')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    difficulty === 'hard' ? 'bg-red-600' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  Hard
                </button>
              </div>
            </div>
            <button
              onClick={initGame}
              className="px-8 py-3 rounded-xl bg-green-600 hover:bg-green-500 transition-colors font-bold text-lg"
            >
              Start Game
            </button>
          </div>
        ) : (
          <>
            {/* Status */}
            <div className="text-center">
              {gameOver ? (
                <span className={`font-bold text-xl ${winner === 'player' ? 'text-green-400' : 'text-red-400'}`}>
                  {winner === 'player' ? '🎉 You Win!' : '🤖 AI Wins!'}
                </span>
              ) : (
                <span className={isPlayerTurn ? 'text-green-400' : 'text-slate-400'}>
                  {isPlayerTurn ? "Your turn - select a row and remove stones" : "AI is thinking..."}
                </span>
              )}
            </div>

            {/* Game Board */}
            <div className="space-y-4 w-full max-w-md">
              {rows.map(row => (
                <button
                  key={row.id}
                  onClick={() => handleRowSelect(row.id)}
                  disabled={!isPlayerTurn || gameOver || row.count === 0}
                  className={`w-full p-4 rounded-xl transition-all ${
                    selectedRow === row.id
                      ? 'bg-slate-700 ring-2 ring-green-500'
                      : 'bg-slate-800 hover:bg-slate-700'
                  } ${row.count === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm w-8">Row {row.id + 1}</span>
                    {renderStones(row.count, row.id)}
                    <span className="text-slate-400 text-sm w-8 text-right">{row.count}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Remove Controls */}
            {selectedRow !== null && isPlayerTurn && !gameOver && (
              <div className="flex items-center gap-4">
                <span className="text-slate-400">Remove:</span>
                <button
                  onClick={() => handleRemoveChange(-1)}
                  className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 text-xl font-bold"
                >
                  -
                </button>
                <span className="text-2xl font-bold w-8 text-center">{removeCount}</span>
                <button
                  onClick={() => handleRemoveChange(1)}
                  className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 text-xl font-bold"
                >
                  +
                </button>
                <button
                  onClick={handleConfirmMove}
                  className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 transition-colors font-bold"
                >
                  Confirm
                </button>
              </div>
            )}

            {/* Instructions */}
            <div className="text-sm text-slate-400 text-center max-w-md">
              <p>Click a row to select it, then choose how many stones to remove.</p>
              <p>The player who takes the last stone loses!</p>
            </div>
          </>
        )}
      </main>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-8 text-center shadow-2xl`}>
            <div className="text-5xl mb-4">{winner === 'player' ? '🎉' : '🤖'}</div>
            <h2 className="text-2xl font-bold mb-2">
              {winner === 'player' ? 'You Win!' : 'AI Wins!'}
            </h2>
            <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              {winner === 'player' ? 'Great strategy!' : 'The last stone was your undoing!'}
            </p>
            <button
              onClick={initGame}
              className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 transition-colors font-medium"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
