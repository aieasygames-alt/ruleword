import { useState, useEffect } from 'react'

type Piece = 0 | 1 | 2 | 3 | 4 // 0=empty, 1=black, 2=white, 3=black king, 4=white king
type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type CheckersProps = {
  settings: Settings
  onBack: () => void
  toggleLanguage: () => void
  toggleTheme: () => void
  toggleSound: () => void
}

const BOARD_SIZE = 8

// Create initial board setup
function createInitialState(): Piece[][] {
  const board: Piece[][] = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0))

  // Place black pieces (top 3 rows)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = 1
      }
    }
  }

  // Place white pieces (bottom 3 rows)
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = 2
      }
    }
  }

  return board
}

// Get valid moves for a piece
function getValidMoves(board: Piece[][], row: number, col: number, mustCapture: boolean): { row: number; col: number; captures: { row: number; col: number }[] }[] {
  const piece = board[row][col]
  if (piece === 0) return []

  const isKing = piece === 3 || piece === 4
  const isBlack = piece === 1 || piece === 3
  const moves: { row: number; col: number; captures: { row: number; col: number }[] }[] = []

  // Direction for regular pieces
  const directions = isKing
    ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
    : isBlack
    ? [[1, -1], [1, 1]] // Black moves down
    : [[-1, -1], [-1, 1]] // White moves up

  // Check capture moves (mandatory if available)
  for (const [dr, dc] of (isKing ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] : directions)) {
    const jumpRow = row + dr * 2
    const jumpCol = col + dc * 2
    const midRow = row + dr
    const midCol = col + dc

    if (jumpRow >= 0 && jumpRow < BOARD_SIZE && jumpCol >= 0 && jumpCol < BOARD_SIZE) {
      const midPiece = board[midRow][midCol]
      const isOpponent = isBlack
        ? (midPiece === 2 || midPiece === 4)
        : (midPiece === 1 || midPiece === 3)

      if (isOpponent && board[jumpRow][jumpCol] === 0) {
        moves.push({ row: jumpRow, col: jumpCol, captures: [{ row: midRow, col: midCol }] })
      }
    }
  }

  // If captures available, only return capture moves
  if (moves.length > 0 || mustCapture) return moves

  // Regular moves
  for (const [dr, dc] of directions) {
    const newRow = row + dr
    const newCol = col + dc

    if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE && board[newRow][newCol] === 0) {
      moves.push({ row: newRow, col: newCol, captures: [] })
    }
  }

  return moves
}

// Check if any piece has capture available
function hasCaptureAvailable(board: Piece[][], isBlack: boolean): boolean {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col]
      if (piece === 0) continue
      const pieceIsBlack = piece === 1 || piece === 3
      if (pieceIsBlack !== isBlack) continue

      const moves = getValidMoves(board, row, col, true)
      if (moves.some(m => m.captures.length > 0)) return true
    }
  }
  return false
}

// Get all capture moves from a specific position (for multi-jump)
function getCaptureMoves(board: Piece[][], row: number, col: number): { row: number; col: number; captures: { row: number; col: number }[] }[] {
  const piece = board[row][col]
  if (piece === 0) return []

  const isKing = piece === 3 || piece === 4
  const isBlack = piece === 1 || piece === 3
  const moves: { row: number; col: number; captures: { row: number; col: number }[] }[] = []

  for (const [dr, dc] of (isKing ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] : (isBlack ? [[1, -1], [1, 1]] : [[-1, -1], [-1, 1]]))) {
    const jumpRow = row + dr * 2
    const jumpCol = col + dc * 2
    const midRow = row + dr
    const midCol = col + dc

    if (jumpRow >= 0 && jumpRow < BOARD_SIZE && jumpCol >= 0 && jumpCol < BOARD_SIZE) {
      const midPiece = board[midRow][midCol]
      const isOpponent = isBlack
        ? (midPiece === 2 || midPiece === 4)
        : (midPiece === 1 || midPiece === 3)

      if (isOpponent && board[jumpRow][jumpCol] === 0) {
        moves.push({ row: jumpRow, col: jumpCol, captures: [{ row: midRow, col: midCol }] })
      }
    }
  }

  return moves
}

// Check if a piece should be promoted to king, and return the promoted piece value
function promoteIfNeeded(piece: Piece, toRow: number): Piece {
  if (piece === 1 && toRow === 7) return 3 // black regular -> black king
  if (piece === 2 && toRow === 0) return 4 // white regular -> white king
  return piece
}

// Execute a complete AI multi-jump sequence and return the final board state
function executeAIMultiJump(board: Piece[][], startRow: number, startCol: number): { board: Piece[][]; capturedCount: number } {
  const newBoard = board.map(r => [...r])
  let currentRow = startRow
  let currentCol = startCol
  let capturedCount = 0

  // Keep jumping as long as captures are available
  while (true) {
    const captureMoves = getCaptureMoves(newBoard, currentRow, currentCol)
    if (captureMoves.length === 0) break

    // Pick the first available capture (simple AI strategy)
    const move = captureMoves[0]
    const piece = newBoard[currentRow][currentCol]
    newBoard[currentRow][currentCol] = 0

    // Remove captured piece
    for (const cap of move.captures) {
      newBoard[cap.row][cap.col] = 0
      capturedCount++
    }

    // Place piece in new position
    newBoard[move.row][move.col] = piece

    // Check promotion BEFORE continuing multi-jump
    const promoted = promoteIfNeeded(piece, move.row)
    newBoard[move.row][move.col] = promoted

    currentRow = move.row
    currentCol = move.col

    // If the piece was just promoted, stop the multi-jump
    if (promoted !== piece) break
  }

  return { board: newBoard, capturedCount }
}

// AI move logic with multi-jump support
function getAIMove(board: Piece[][]) {
  const pieces: { row: number; col: number }[] = []

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col]
      if (piece === 1 || piece === 3) {
        pieces.push({ row, col })
      }
    }
  }

  const mustCapture = hasCaptureAvailable(board, true)

  // Evaluate all possible first moves
  type EvaluatedMove = {
    from: { row: number; col: number }
    to: { row: number; col: number }
    captures: { row: number; col: number }[]
    totalCaptures: number
    becomesKing: boolean
    board: Piece[][]
  }

  let bestMove: EvaluatedMove | null = null

  for (const { row, col } of pieces) {
    const moves = getValidMoves(board, row, col, mustCapture)
    for (const move of moves) {
      const isCapture = move.captures.length > 0

      // Simulate the full multi-jump if it's a capture
      let totalCaptures = move.captures.length
      let resultingBoard: Piece[][]

      if (isCapture) {
        // Execute full multi-jump sequence
        const tempBoard = board.map(r => [...r])
        const piece = tempBoard[row][col]
        tempBoard[row][col] = 0
        for (const cap of move.captures) {
          tempBoard[cap.row][cap.col] = 0
        }
        tempBoard[move.row][move.col] = piece
        const promoted = promoteIfNeeded(piece, move.row)
        tempBoard[move.row][move.col] = promoted

        // Continue multi-jumping if not promoted
        if (promoted === piece) {
          const continuation = executeAIMultiJump(tempBoard, move.row, move.col)
          totalCaptures += continuation.capturedCount
          resultingBoard = continuation.board
        } else {
          resultingBoard = tempBoard
        }
      } else {
        resultingBoard = board.map(r => [...r])
        const piece = resultingBoard[row][col]
        resultingBoard[row][col] = 0
        resultingBoard[move.row][move.col] = piece
        const promoted = promoteIfNeeded(piece, move.row)
        resultingBoard[move.row][move.col] = promoted
      }

      const becomesKing = board[row][col] === 1 && resultingBoard[move.row][move.col] === 3

      const evaluated: EvaluatedMove = {
        from: { row, col },
        to: move,
        captures: move.captures,
        totalCaptures,
        becomesKing,
        board: resultingBoard
      }

      if (!bestMove ||
          (totalCaptures > bestMove.totalCaptures) ||
          (totalCaptures === bestMove.totalCaptures && becomesKing && !bestMove.becomesKing)) {
        bestMove = evaluated
      }
    }
  }

  return bestMove
}

export default function Checkers({ settings, onBack }: CheckersProps) {
  const [board, setBoard] = useState<Piece[][]>(createInitialState)
  const [selectedPiece, setSelectedPiece] = useState<{ row: number; col: number } | null>(null)
  const [validMoves, setValidMoves] = useState<{ row: number; col: number }[]>([])
  const [isPlayerTurn, setIsPlayerTurn] = useState(true) // Player is white (bottom)
  const [gameOver, setGameOver] = useState<0 | 1 | 2>(0) // 0=playing, 1=player wins, 2=ai wins
  const [capturedWhite, setCapturedWhite] = useState(0)
  const [capturedBlack, setCapturedBlack] = useState(0)
  const [multiJumpFrom, setMultiJumpFrom] = useState<{ row: number; col: number } | null>(null)

  const isDark = settings.darkMode
  const bgClass = isDark ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = isDark ? 'text-white' : 'text-gray-900'

  // Check for game over
  useEffect(() => {
    let whiteCount = 0, blackCount = 0
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = board[row][col]
        if (piece === 2 || piece === 4) whiteCount++
        if (piece === 1 || piece === 3) blackCount++
      }
    }

    if (whiteCount === 0) setGameOver(2)
    else if (blackCount === 0) setGameOver(1)
  }, [board])

  // AI turn with multi-jump support
  useEffect(() => {
    if (isPlayerTurn || gameOver) return

    const timer = setTimeout(() => {
      const aiMove = getAIMove(board)
      if (aiMove) {
        // The AI move now returns the fully computed board after multi-jump
        setBoard(aiMove.board)

        // Count captured pieces for display
        const capturedInMove = aiMove.totalCaptures
        if (capturedInMove > 0) {
          setCapturedWhite(c => c + capturedInMove)
        }
      }
      setIsPlayerTurn(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [isPlayerTurn, board, gameOver])

  const handleCellClick = (row: number, col: number) => {
    if (!isPlayerTurn || gameOver) return

    const clickedPiece = board[row][col]
    const isWhitePiece = clickedPiece === 2 || clickedPiece === 4

    // If we are in a multi-jump sequence, only the jumping piece can move
    if (multiJumpFrom) {
      if (!validMoves.some(m => m.row === row && m.col === col)) return

      const moves = getCaptureMoves(board, multiJumpFrom.row, multiJumpFrom.col)
      const move = moves.find(m => m.row === row && m.col === col)
      if (!move) return

      // Compute the new board locally
      const newBoard = board.map(r => [...r])
      const movingPiece = newBoard[multiJumpFrom.row][multiJumpFrom.col]
      newBoard[multiJumpFrom.row][multiJumpFrom.col] = 0

      // Remove captured piece
      for (const cap of move.captures) {
        newBoard[cap.row][cap.col] = 0
      }

      // Check promotion
      const promoted = promoteIfNeeded(movingPiece, row)
      newBoard[row][col] = promoted
      const wasPromoted = promoted !== movingPiece

      // Apply the new board
      setBoard(newBoard)
      setCapturedBlack(c => c + move.captures.length)

      if (wasPromoted) {
        // Promotion ends the multi-jump
        setMultiJumpFrom(null)
        setSelectedPiece(null)
        setValidMoves([])
        setIsPlayerTurn(false)
      } else {
        // Check for additional captures from the new position
        const furtherCaptures = getCaptureMoves(newBoard, row, col)
        if (furtherCaptures.length > 0) {
          // Must continue jumping
          setMultiJumpFrom({ row, col })
          setSelectedPiece({ row, col })
          setValidMoves(furtherCaptures.map(m => ({ row: m.row, col: m.col })))
        } else {
          // No more captures, turn ends
          setMultiJumpFrom(null)
          setSelectedPiece(null)
          setValidMoves([])
          setIsPlayerTurn(false)
        }
      }
      return
    }

    // If clicking on own piece, select it
    if (isWhitePiece) {
      const mustCapture = hasCaptureAvailable(board, false)
      const moves = getValidMoves(board, row, col, mustCapture)
      setSelectedPiece({ row, col })
      setValidMoves(moves.map(m => ({ row: m.row, col: m.col })))
      return
    }

    // If piece is selected and clicking on valid move
    if (selectedPiece && validMoves.some(m => m.row === row && m.col === col)) {
      const mustCapture = hasCaptureAvailable(board, false)
      const moves = getValidMoves(board, selectedPiece.row, selectedPiece.col, mustCapture)
      const move = moves.find(m => m.row === row && m.col === col)

      if (move) {
        const isCapture = move.captures.length > 0

        // Compute the new board locally
        const newBoard = board.map(r => [...r])
        const movingPiece = newBoard[selectedPiece.row][selectedPiece.col]
        newBoard[selectedPiece.row][selectedPiece.col] = 0

        // Remove captured pieces
        for (const cap of move.captures) {
          newBoard[cap.row][cap.col] = 0
        }

        // Promote to king
        const promoted = promoteIfNeeded(movingPiece, row)
        newBoard[row][col] = promoted
        const wasPromoted = promoted !== movingPiece

        // Apply the new board
        setBoard(newBoard)
        if (isCapture) {
          setCapturedBlack(c => c + move.captures.length)
        }

        // Check if this was a capture and multi-jump is possible
        if (isCapture && !wasPromoted) {
          // Check for additional captures from the landing position
          const furtherCaptures = getCaptureMoves(newBoard, row, col)
          if (furtherCaptures.length > 0) {
            // Must continue jumping - set multiJumpFrom
            setMultiJumpFrom({ row, col })
            setSelectedPiece({ row, col })
            setValidMoves(furtherCaptures.map(m => ({ row: m.row, col: m.col })))
          } else {
            // No more captures, end turn
            setSelectedPiece(null)
            setValidMoves([])
            setIsPlayerTurn(false)
          }
        } else {
          // Regular move or promotion on capture, end turn
          setSelectedPiece(null)
          setValidMoves([])
          setIsPlayerTurn(false)
        }
      }
    }
  }

  const startNewGame = () => {
    setBoard(createInitialState())
    setSelectedPiece(null)
    setValidMoves([])
    setIsPlayerTurn(true)
    setGameOver(0)
    setCapturedWhite(0)
    setCapturedBlack(0)
    setMultiJumpFrom(null)
  }

  const renderPiece = (piece: Piece) => {
    if (piece === 0) return null
    const isKing = piece === 3 || piece === 4
    const isBlack = piece === 1 || piece === 3

    return (
      <div
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-xl transition-transform ${
          isBlack
            ? 'bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-gray-600 text-gray-300 shadow-black/50'
            : 'bg-gradient-to-br from-white to-gray-200 border-2 border-gray-300 text-gray-700 shadow-white/30'
        }`}
        style={{
          boxShadow: isBlack
            ? '0 4px 15px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1)'
            : '0 4px 15px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.8)'
        }}
      >
        {isKing && <span className="drop-shadow-lg text-yellow-400">{isBlack ? '♚' : '♔'}</span>}
      </div>
    )
  }

  const cellSize = 56

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
              <div className="text-xs text-slate-400">Captured</div>
              <div className="text-sm">⚫ {capturedBlack} | ⚪ {capturedWhite}</div>
            </div>
          </div>
          <button
            onClick={startNewGame}
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
          {gameOver ? (
            <span className="font-bold text-lg">
              {gameOver === 1 ? '🎉 You Win!' : '🤖 AI Wins!'}
            </span>
          ) : (
            <span className={isPlayerTurn ? 'text-green-400' : 'text-slate-400'}>
              {multiJumpFrom
                ? "Multi-jump! Continue capturing!"
                : isPlayerTurn
                  ? "Your turn (White)"
                  : "AI's turn (Black)"}
            </span>
          )}
        </div>

        {/* Board */}
        <div className="bg-amber-800 rounded-lg p-2 shadow-lg">
          {board.map((row, rowIdx) => (
            <div key={rowIdx} className="flex">
              {row.map((cell, colIdx) => {
                const isLight = (rowIdx + colIdx) % 2 === 0
                const isSelected = selectedPiece?.row === rowIdx && selectedPiece?.col === colIdx
                const isMultiJumping = multiJumpFrom?.row === rowIdx && multiJumpFrom?.col === colIdx
                const isValidMove = validMoves.some(m => m.row === rowIdx && m.col === colIdx)

                return (
                  <div
                    key={colIdx}
                    onClick={() => handleCellClick(rowIdx, colIdx)}
                    className={`flex items-center justify-center cursor-pointer transition-colors ${
                      isLight ? 'bg-amber-200' : 'bg-amber-700'
                    } ${isSelected ? 'ring-2 ring-green-400 ring-inset' : ''} ${
                      isMultiJumping ? 'ring-2 ring-yellow-400 ring-inset' : ''
                    } ${
                      isValidMove ? 'hover:bg-green-600/50' : ''
                    }`}
                    style={{ width: cellSize, height: cellSize }}
                  >
                    {cell !== 0 && renderPiece(cell)}
                    {isValidMove && cell === 0 && (
                      <div className="w-4 h-4 rounded-full bg-green-500/50" />
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="text-sm text-slate-400 text-center max-w-md">
          <p>Click your piece to select, then click a valid square to move.</p>
          <p>Captures are mandatory. Multiple jumps are required when available. Reach the opposite end to become a King!</p>
        </div>
      </main>

      {/* Game Over Modal */}
      {gameOver > 0 && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-8 text-center shadow-2xl`}>
            <div className="text-5xl mb-4">{gameOver === 1 ? '🎉' : '🤖'}</div>
            <h2 className="text-2xl font-bold mb-2">
              {gameOver === 1 ? 'You Win!' : 'AI Wins!'}
            </h2>
            <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              {gameOver === 1 ? 'Excellent strategy!' : 'Better luck next time!'}
            </p>
            <button
              onClick={startNewGame}
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
