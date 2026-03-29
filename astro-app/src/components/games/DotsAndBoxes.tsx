import { useState, useCallback, useEffect } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type DotsAndBoxesProps = {
  settings: Settings
  onBack: () => void
  toggleLanguage: () => void
  toggleTheme: () => void
  toggleSound: () => void
}

type Line = {
  row: number
  col: number
  horizontal: boolean
  player: 0 | 1 | 2 // 0 = none, 1 = player, 2 = AI
}

const GRID_SIZE = 5 // 5x5 dots = 4x4 boxes

export default function DotsAndBoxes({ settings, onBack }: DotsAndBoxesProps) {
  const [horizontalLines, setHorizontalLines] = useState<(0 | 1 | 2)[][]>([])
  const [verticalLines, setVerticalLines] = useState<(0 | 1 | 2)[][]>([])
  const [boxes, setBoxes] = useState<(0 | 1 | 2)[][]>([])
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1)
  const [gameOver, setGameOver] = useState(false)
  const [playerScore, setPlayerScore] = useState(0)
  const [aiScore, setAiScore] = useState(0)
  const [isAIThinking, setIsAIThinking] = useState(false)

  const isDark = settings.darkMode

  const bgClass = isDark ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = isDark ? 'text-white' : 'text-gray-900'

  const initGame = useCallback(() => {
    // Horizontal lines: GRID_SIZE rows, GRID_SIZE-1 columns
    setHorizontalLines(
      Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE - 1).fill(0))
    )
    // Vertical lines: GRID_SIZE-1 rows, GRID_SIZE columns
    setVerticalLines(
      Array(GRID_SIZE - 1).fill(null).map(() => Array(GRID_SIZE).fill(0))
    )
    // Boxes: GRID_SIZE-1 x GRID_SIZE-1
    setBoxes(
      Array(GRID_SIZE - 1).fill(null).map(() => Array(GRID_SIZE - 1).fill(0))
    )
    setCurrentPlayer(1)
    setGameOver(false)
    setPlayerScore(0)
    setAiScore(0)
    setIsAIThinking(false)
  }, [])

  useEffect(() => {
    initGame()
  }, [initGame])

  // Check if a box is completed
  const checkBox = (row: number, col: number, hLines: (0|1|2)[][], vLines: (0|1|2)[][]): boolean => {
    const top = hLines[row]?.[col] !== 0
    const bottom = hLines[row + 1]?.[col] !== 0
    const left = vLines[row]?.[col] !== 0
    const right = vLines[row]?.[col + 1] !== 0
    return top && bottom && left && right
  }

  // Check all boxes and update scores
  const updateBoxes = useCallback((hLines: (0|1|2)[][], vLines: (0|1|2)[][], player: 1 | 2) => {
    const newBoxes = boxes.map(r => [...r])
    let completedCount = 0

    for (let row = 0; row < GRID_SIZE - 1; row++) {
      for (let col = 0; col < GRID_SIZE - 1; col++) {
        if (newBoxes[row][col] === 0 && checkBox(row, col, hLines, vLines)) {
          newBoxes[row][col] = player
          completedCount++
        }
      }
    }

    setBoxes(newBoxes)
    return completedCount
  }, [boxes])

  // Check if game is over
  const checkGameOver = useCallback((hLines: (0|1|2)[][], vLines: (0|1|2)[][]) => {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE - 1; col++) {
        if (hLines[row][col] === 0) return false
      }
    }
    for (let row = 0; row < GRID_SIZE - 1; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (vLines[row][col] === 0) return false
      }
    }
    return true
  }, [])

  // Make a move
  const makeMove = useCallback((type: 'h' | 'v', row: number, col: number, player: 1 | 2) => {
    if (gameOver) return

    if (type === 'h') {
      setHorizontalLines(prev => {
        if (prev[row][col] !== 0) return prev
        const newLines = prev.map(r => [...r])
        newLines[row][col] = player

        const completed = updateBoxes(newLines, verticalLines, player)
        if (player === 1) setPlayerScore(s => s + completed)
        else setAiScore(s => s + completed)

        if (checkGameOver(newLines, verticalLines)) {
          setGameOver(true)
        } else if (completed === 0) {
          setCurrentPlayer(player === 1 ? 2 : 1)
        }

        return newLines
      })
    } else {
      setVerticalLines(prev => {
        if (prev[row][col] !== 0) return prev
        const newLines = prev.map(r => [...r])
        newLines[row][col] = player

        const completed = updateBoxes(horizontalLines, newLines, player)
        if (player === 1) setPlayerScore(s => s + completed)
        else setAiScore(s => s + completed)

        if (checkGameOver(horizontalLines, newLines)) {
          setGameOver(true)
        } else if (completed === 0) {
          setCurrentPlayer(player === 1 ? 2 : 1)
        }

        return newLines
      })
    }
  }, [gameOver, horizontalLines, verticalLines, updateBoxes, checkGameOver])

  // Handle horizontal line click
  const handleHLineClick = (row: number, col: number) => {
    if (currentPlayer !== 1 || isAIThinking || horizontalLines[row]?.[col] !== 0) return
    makeMove('h', row, col, 1)
  }

  // Handle vertical line click
  const handleVLineClick = (row: number, col: number) => {
    if (currentPlayer !== 1 || isAIThinking || verticalLines[row]?.[col] !== 0) return
    makeMove('v', row, col, 1)
  }

  // AI move
  useEffect(() => {
    if (currentPlayer !== 2 || gameOver || isAIThinking) return

    setIsAIThinking(true)

    const timer = setTimeout(() => {
      // Simple AI: try to complete a box, otherwise random
      let bestMove: { type: 'h' | 'v'; row: number; col: number } | null = null

      // Check for completing moves
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE - 1; col++) {
          if (horizontalLines[row]?.[col] === 0) {
            // Check if this completes a box above or below
            const tempH = horizontalLines.map(r => [...r])
            tempH[row][col] = 2
            if (row > 0 && checkBox(row - 1, col, tempH, verticalLines)) {
              bestMove = { type: 'h', row, col }
              break
            }
            if (row < GRID_SIZE - 1 && checkBox(row, col, tempH, verticalLines)) {
              bestMove = { type: 'h', row, col }
              break
            }
          }
        }
        if (bestMove) break
      }

      if (!bestMove) {
        for (let row = 0; row < GRID_SIZE - 1; row++) {
          for (let col = 0; col < GRID_SIZE; col++) {
            if (verticalLines[row]?.[col] === 0) {
              const tempV = verticalLines.map(r => [...r])
              tempV[row][col] = 2
              if (col > 0 && checkBox(row, col - 1, horizontalLines, tempV)) {
                bestMove = { type: 'v', row, col }
                break
              }
              if (col < GRID_SIZE - 1 && checkBox(row, col, horizontalLines, tempV)) {
                bestMove = { type: 'v', row, col }
                break
              }
            }
          }
          if (bestMove) break
        }
      }

      // If no completing move, find random available move
      if (!bestMove) {
        const availableMoves: { type: 'h' | 'v'; row: number; col: number }[] = []

        for (let row = 0; row < GRID_SIZE; row++) {
          for (let col = 0; col < GRID_SIZE - 1; col++) {
            if (horizontalLines[row]?.[col] === 0) {
              availableMoves.push({ type: 'h', row, col })
            }
          }
        }
        for (let row = 0; row < GRID_SIZE - 1; row++) {
          for (let col = 0; col < GRID_SIZE; col++) {
            if (verticalLines[row]?.[col] === 0) {
              availableMoves.push({ type: 'v', row, col })
            }
          }
        }

        if (availableMoves.length > 0) {
          bestMove = availableMoves[Math.floor(Math.random() * availableMoves.length)]
        }
      }

      if (bestMove) {
        makeMove(bestMove.type, bestMove.row, bestMove.col, 2)
      }

      setIsAIThinking(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [currentPlayer, gameOver, isAIThinking, horizontalLines, verticalLines, makeMove])

  const dotSize = 12
  const lineLength = 48
  const boxSize = lineLength

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
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-xs text-slate-400">You (Blue)</div>
              <div className="text-lg font-bold text-blue-400">{playerScore}</div>
            </div>
            <span className="text-slate-500">-</span>
            <div className="text-center">
              <div className="text-xs text-slate-400">AI (Red)</div>
              <div className="text-lg font-bold text-red-400">{aiScore}</div>
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
      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        {/* Status */}
        <div className="text-center">
          {isAIThinking ? (
            <span className="text-slate-400">AI is thinking...</span>
          ) : gameOver ? (
            <span className="font-bold text-lg">
              {playerScore > aiScore ? '🎉 You Win!' : playerScore < aiScore ? '🤖 AI Wins!' : "It's a Tie!"}
            </span>
          ) : (
            <span className={currentPlayer === 1 ? 'text-blue-400' : 'text-slate-400'}>
              {currentPlayer === 1 ? "Your turn" : "AI's turn"}
            </span>
          )}
        </div>

        {/* Game Board */}
        <div className="p-4">
          {Array(GRID_SIZE).fill(null).map((_, row) => (
            <div key={row} className="flex flex-col">
              {/* Horizontal lines + dots */}
              <div className="flex">
                {Array(GRID_SIZE).fill(null).map((_, col) => (
                  <div key={col} className="flex">
                    <div
                      className={`rounded-full shadow-lg ${isDark ? 'bg-gradient-to-br from-slate-300 to-slate-500 shadow-slate-500/50' : 'bg-gradient-to-br from-gray-500 to-gray-700 shadow-gray-500/50'}`}
                      style={{ width: dotSize, height: dotSize }}
                    />
                    {col < GRID_SIZE - 1 && (
                      <div
                        onClick={() => handleHLineClick(row, col)}
                        className={`flex items-center justify-center cursor-pointer transition-all transform hover:scale-105 ${
                          horizontalLines[row]?.[col] === 1
                            ? 'bg-gradient-to-r from-blue-400 to-blue-600 shadow-lg shadow-blue-500/50'
                            : horizontalLines[row]?.[col] === 2
                            ? 'bg-gradient-to-r from-red-400 to-red-600 shadow-lg shadow-red-500/50'
                            : isDark
                            ? 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600'
                            : 'bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400'
                        }`}
                        style={{ width: lineLength, height: dotSize }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Vertical lines + boxes */}
              {row < GRID_SIZE - 1 && (
                <div className="flex">
                  {Array(GRID_SIZE).fill(null).map((_, col) => (
                    <div key={col} className="flex">
                      <div
                        onClick={() => handleVLineClick(row, col)}
                        className={`flex items-center justify-center cursor-pointer transition-all transform hover:scale-105 ${
                          verticalLines[row]?.[col] === 1
                            ? 'bg-gradient-to-b from-blue-400 to-blue-600 shadow-lg shadow-blue-500/50'
                            : verticalLines[row]?.[col] === 2
                            ? 'bg-gradient-to-b from-red-400 to-red-600 shadow-lg shadow-red-500/50'
                            : isDark
                            ? 'bg-gradient-to-b from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600'
                            : 'bg-gradient-to-b from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400'
                        }`}
                        style={{ width: dotSize, height: lineLength }}
                      />
                      {col < GRID_SIZE - 1 && (
                        <div
                          className={`flex items-center justify-center transition-all ${
                            boxes[row]?.[col] === 1
                              ? 'bg-gradient-to-br from-blue-400/40 to-blue-600/40 shadow-inner'
                              : boxes[row]?.[col] === 2
                              ? 'bg-gradient-to-br from-red-400/40 to-red-600/40 shadow-inner'
                              : isDark
                              ? 'bg-gradient-to-br from-slate-800 to-slate-900'
                              : 'bg-gradient-to-br from-gray-50 to-gray-100'
                          }`}
                          style={{ width: lineLength, height: lineLength }}
                        >
                          {boxes[row]?.[col] === 1 && <span className="text-2xl">🔵</span>}
                          {boxes[row]?.[col] === 2 && <span className="text-2xl">🔴</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="text-sm text-slate-400 text-center max-w-md">
          <p>Click on lines to draw them. Complete a box to score a point and get another turn!</p>
        </div>
      </main>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-8 text-center shadow-2xl`}>
            <div className="text-5xl mb-4">
              {playerScore > aiScore ? '🎉' : playerScore < aiScore ? '🤖' : '🤝'}
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {playerScore > aiScore ? 'You Win!' : playerScore < aiScore ? 'AI Wins!' : "It's a Tie!"}
            </h2>
            <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              Final Score: You {playerScore} - AI {aiScore}
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
