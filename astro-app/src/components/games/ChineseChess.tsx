import { useState, useCallback } from 'react'

type Piece = {
  type: 'K' | 'A' | 'E' | 'H' | 'R' | 'C' | 'P'
  color: 'red' | 'black'
}

type Props = {
  settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }
}

// 正确的中国象棋初始布局（红方在下，黑方在上）
// 行0-4是黑方区域，行5-9是红方区域
// 楚河汉界在行4和行5之间
const INITIAL_BOARD: (Piece | null)[][] = [
  // 行0: 黑方底线 车-马-象-士-将-士-象-马-车
  [{ type: 'R', color: 'black' }, { type: 'H', color: 'black' }, { type: 'E', color: 'black' }, { type: 'A', color: 'black' }, { type: 'K', color: 'black' }, { type: 'A', color: 'black' }, { type: 'E', color: 'black' }, { type: 'H', color: 'black' }, { type: 'R', color: 'black' }],
  // 行1: 空
  [null, null, null, null, null, null, null, null, null],
  // 行2: 黑炮在第2列和第8列（索引1和7）
  [null, { type: 'C', color: 'black' }, null, null, null, null, null, { type: 'C', color: 'black' }, null],
  // 行3: 黑卒
  [{ type: 'P', color: 'black' }, null, { type: 'P', color: 'black' }, null, { type: 'P', color: 'black' }, null, { type: 'P', color: 'black' }, null, { type: 'P', color: 'black' }],
  // 行4: 空（楚河）
  [null, null, null, null, null, null, null, null, null],
  // 行5: 空（汉界）
  [null, null, null, null, null, null, null, null, null],
  // 行6: 红兵
  [{ type: 'P', color: 'red' }, null, { type: 'P', color: 'red' }, null, { type: 'P', color: 'red' }, null, { type: 'P', color: 'red' }, null, { type: 'P', color: 'red' }],
  // 行7: 红炮在第2列和第8列（索引1和7）
  [null, { type: 'C', color: 'red' }, null, null, null, null, null, { type: 'C', color: 'red' }, null],
  // 行8: 空
  [null, null, null, null, null, null, null, null, null],
  // 行9: 红方底线 车-马-相-仕-帥-仕-相-马-车
  [{ type: 'R', color: 'red' }, { type: 'H', color: 'red' }, { type: 'E', color: 'red' }, { type: 'A', color: 'red' }, { type: 'K', color: 'red' }, { type: 'A', color: 'red' }, { type: 'E', color: 'red' }, { type: 'H', color: 'red' }, { type: 'R', color: 'red' }],
]

const PIECE_NAMES: Record<string, string> = {
  'K-red': '帥', 'A-red': '仕', 'E-red': '相', 'H-red': '馬', 'R-red': '車', 'C-red': '炮', 'P-red': '兵',
  'K-black': '將', 'A-black': '士', 'E-black': '象', 'H-black': '馬', 'R-black': '車', 'C-black': '砲', 'P-black': '卒',
}

export default function ChineseChess({ settings }: Props) {
  const [board, setBoard] = useState<(Piece | null)[][]>(INITIAL_BOARD.map(row => [...row]))
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null)
  const [turn, setTurn] = useState<'red' | 'black'>('red')
  const [validMoves, setValidMoves] = useState<{ row: number; col: number }[]>([])
  const [gameOver, setGameOver] = useState<string | null>(null)
  const [moveHistory, setMoveHistory] = useState<string[]>([])

  const isDark = settings.darkMode
  const isZh = settings.language === 'zh'

  // 检查是否在九宫格内
  const inPalace = (row: number, col: number, color: 'red' | 'black') => {
    if (col < 3 || col > 5) return false
    return color === 'red' ? row >= 7 && row <= 9 : row >= 0 && row <= 2
  }

  // 检查两个将帅是否照面（飞将）
  const kingsFacing = useCallback((boardState: (Piece | null)[][]): boolean => {
    let redKing: [number, number] | null = null
    let blackKing: [number, number] | null = null

    for (let r = 0; r < 10; r++) {
      for (let c = 3; c <= 5; c++) {
        const piece = boardState[r][c]
        if (piece?.type === 'K') {
          if (piece.color === 'red') redKing = [r, c]
          else blackKing = [r, c]
        }
      }
    }

    if (!redKing || !blackKing) return false
    if (redKing[1] !== blackKing[1]) return false

    // 检查两将之间是否有棋子
    const minR = Math.min(redKing[0], blackKing[0])
    const maxR = Math.max(redKing[0], blackKing[0])
    for (let r = minR + 1; r < maxR; r++) {
      if (boardState[r][redKing[1]]) return false
    }
    return true
  }, [])

  // 获取有效移动
  const getValidMoves = useCallback((row: number, col: number, boardState: (Piece | null)[][]): { row: number; col: number }[] => {
    const piece = boardState[row][col]
    if (!piece) return []

    const moves: { row: number; col: number }[] = []

    const addMove = (r: number, c: number) => {
      if (r >= 0 && r < 10 && c >= 0 && c < 9) {
        const target = boardState[r][c]
        if (!target || target.color !== piece.color) {
          moves.push({ row: r, col: c })
        }
      }
    }

    switch (piece.type) {
      case 'K': // 将/帅 - 只能在九宫格内移动，每次一步
        [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
          const nr = row + dr, nc = col + dc
          if (inPalace(nr, nc, piece.color)) addMove(nr, nc)
        })
        break

      case 'A': // 士/仕 - 只能在九宫格内斜着走
        [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
          const nr = row + dr, nc = col + dc
          if (inPalace(nr, nc, piece.color)) addMove(nr, nc)
        })
        break

      case 'E': // 象/相 - 走"田"字，不能过河，有塞象眼
        [[2, 2, 1, 1], [2, -2, 1, -1], [-2, 2, -1, 1], [-2, -2, -1, -1]].forEach(([dr, dc, br, bc]) => {
          const nr = row + dr, nc = col + dc
          const blockRow = row + br, blockCol = col + bc
          // 检查是否塞象眼
          if (boardState[blockRow]?.[blockCol]) return
          // 检查是否过河
          if (piece.color === 'red' && nr < 5) return
          if (piece.color === 'black' && nr > 4) return
          addMove(nr, nc)
        })
        break

      case 'H': // 马 - 走"日"字，有蹩马腿
        // 马的8个方向和对应的蹩马腿位置
        [
          [-2, -1, -1, 0], // 上左
          [-2, 1, -1, 0],  // 上右
          [2, -1, 1, 0],   // 下左
          [2, 1, 1, 0],    // 下右
          [-1, -2, 0, -1], // 左上
          [-1, 2, 0, 1],   // 左下
          [1, -2, 0, -1],  // 右上
          [1, 2, 0, 1],    // 右下
        ].forEach(([dr, dc, br, bc]) => {
          const nr = row + dr, nc = col + dc
          const blockRow = row + br, blockCol = col + bc
          // 检查是否蹩马腿
          if (boardState[blockRow]?.[blockCol]) return
          addMove(nr, nc)
        })
        break

      case 'R': // 车 - 直线走，不能跳过棋子
        // 上
        for (let r = row - 1; r >= 0; r--) {
          addMove(r, col)
          if (boardState[r][col]) break
        }
        // 下
        for (let r = row + 1; r < 10; r++) {
          addMove(r, col)
          if (boardState[r][col]) break
        }
        // 左
        for (let c = col - 1; c >= 0; c--) {
          addMove(row, c)
          if (boardState[row][c]) break
        }
        // 右
        for (let c = col + 1; c < 9; c++) {
          addMove(row, c)
          if (boardState[row][c]) break
        }
        break

      case 'C': // 炮 - 移动时直线走，吃子时需要翻山
        // 四个方向
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]
        directions.forEach(([dr, dc]) => {
          let foundPlatform = false
          let r = row + dr
          let c = col + dc
          while (r >= 0 && r < 10 && c >= 0 && c < 9) {
            const target = boardState[r][c]
            if (!foundPlatform) {
              // 还没有翻山，可以移动
              if (!target) {
                addMove(r, c)
              } else {
                // 遇到棋子，开始翻山
                foundPlatform = true
              }
            } else {
              // 已经翻山，只能吃子
              if (target) {
                addMove(r, c)
                break
              }
            }
            r += dr
            c += dc
          }
        })
        break

      case 'P': // 兵/卒 - 过河前只能向前，过河后可以左右
        const dir = piece.color === 'red' ? -1 : 1 // 红方向上（负），黑方向下（正）
        const hasCrossedRiver = piece.color === 'red' ? row <= 4 : row >= 5

        // 向前
        addMove(row + dir, col)

        // 过河后可以左右移动
        if (hasCrossedRiver) {
          addMove(row, col - 1)
          addMove(row, col + 1)
        }
        break
    }

    return moves
  }, [])

  // 检查是否被将军
  const isInCheck = useCallback((color: 'red' | 'black', boardState: (Piece | null)[][]): boolean => {
    // 找到该方的将/帅
    let kingPos: [number, number] | null = null
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const piece = boardState[r][c]
        if (piece?.type === 'K' && piece.color === color) {
          kingPos = [r, c]
          break
        }
      }
      if (kingPos) break
    }
    if (!kingPos) return true // 将/帅被吃了

    // 检查对方所有棋子是否能吃到将/帅
    const enemyColor = color === 'red' ? 'black' : 'red'
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const piece = boardState[r][c]
        if (piece && piece.color === enemyColor) {
          const moves = getValidMoves(r, c, boardState)
          if (moves.some(m => m.row === kingPos![0] && m.col === kingPos![1])) {
            return true
          }
        }
      }
    }

    // 检查飞将
    if (kingsFacing(boardState)) return true

    return false
  }, [getValidMoves, kingsFacing])

  // 获取合法移动（排除会导致自己被将军的移动）
  const getLegalMoves = useCallback((row: number, col: number): { row: number; col: number }[] => {
    const piece = board[row][col]
    if (!piece) return []

    const moves = getValidMoves(row, col, board)

    return moves.filter(move => {
      // 模拟移动
      const newBoard = board.map(r => [...r])
      newBoard[move.row][move.col] = newBoard[row][col]
      newBoard[row][col] = null

      // 检查移动后是否会被将军
      return !isInCheck(piece.color, newBoard)
    })
  }, [board, getValidMoves, isInCheck])

  // 检查是否将死
  const isCheckmate = useCallback((color: 'red' | 'black'): boolean => {
    // 检查该方是否有任何合法移动
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const piece = board[r][c]
        if (piece && piece.color === color) {
          const tempSelected = { row: r, col: c }
          const moves = getValidMoves(r, c, board)
          // 检查是否有合法移动
          for (const move of moves) {
            const newBoard = board.map(row => [...row])
            newBoard[move.row][move.col] = newBoard[r][c]
            newBoard[r][c] = null
            if (!isInCheck(color, newBoard)) {
              return false // 有合法移动，不是将死
            }
          }
        }
      }
    }
    return true // 没有合法移动，将死
  }, [board, getValidMoves, isInCheck])

  const handleClick = useCallback((row: number, col: number) => {
    if (gameOver) return

    const piece = board[row][col]

    if (selected) {
      const isValidMove = validMoves.some(m => m.row === row && m.col === col)
      if (isValidMove) {
        const newBoard = board.map(r => [...r])
        const movingPiece = newBoard[selected.row][selected.col]
        const capturedPiece = board[row][col]
        newBoard[row][col] = movingPiece
        newBoard[selected.row][selected.col] = null

        // 记录移动
        const fromPos = `${String.fromCharCode(65 + selected.col)}${10 - selected.row}`
        const toPos = `${String.fromCharCode(65 + col)}${10 - row}`
        const pieceName = PIECE_NAMES[`${movingPiece!.type}-${movingPiece!.color}`]
        const captureText = capturedPiece ? ` 吃${PIECE_NAMES[`${capturedPiece.type}-${capturedPiece.color}`]}` : ''
        setMoveHistory(prev => [...prev, `${pieceName} ${fromPos}-${toPos}${captureText}`])

        // 检查是否吃掉了将/帅
        if (capturedPiece?.type === 'K') {
          setGameOver(turn === 'red'
            ? (isZh ? '红方胜利！' : 'Red wins!')
            : (isZh ? '黑方胜利！' : 'Black wins!'))
        }

        setBoard(newBoard)
        const nextTurn = turn === 'red' ? 'black' : 'red'
        setTurn(nextTurn)

        // 检查对方是否被将军或将死
        setTimeout(() => {
          if (isInCheck(nextTurn, newBoard)) {
            if (isCheckmate(nextTurn)) {
              setGameOver(turn === 'red'
                ? (isZh ? '红方将死黑方获胜！' : 'Red checkmates and wins!')
                : (isZh ? '黑方将死红方获胜！' : 'Black checkmates and wins!'))
            }
          }
        }, 100)

        setSelected(null)
        setValidMoves([])
      } else if (piece && piece.color === turn) {
        setSelected({ row, col })
        setValidMoves(getLegalMoves(row, col))
      } else {
        setSelected(null)
        setValidMoves([])
      }
    } else if (piece && piece.color === turn) {
      setSelected({ row, col })
      setValidMoves(getLegalMoves(row, col))
    }
  }, [board, selected, turn, validMoves, gameOver, getLegalMoves, isInCheck, isCheckmate, isZh])

  const resetGame = () => {
    setBoard(INITIAL_BOARD.map(row => [...row]))
    setSelected(null)
    setValidMoves([])
    setTurn('red')
    setGameOver(null)
    setMoveHistory([])
  }

  // 检查当前位置是否是有效移动目标
  const isValidMoveTarget = (row: number, col: number) =>
    validMoves.some(m => m.row === row && m.col === col)

  // 渲染棋盘格子的辅助函数
  const renderCell = (row: number, col: number) => {
    const piece = board[row][col]
    const isSelected = selected?.row === row && selected?.col === col
    const isValidMove = isValidMoveTarget(row, col)
    const isRiver = row === 4 || row === 5
    const isPalace = (row <= 2 || row >= 7) && col >= 3 && col <= 5

    // 计算是否显示斜线（九宫格）
    const showDiagonal = isPalace && (
      // 上方九宫格的斜线
      (row === 0 && (col === 3 || col === 5)) ||
      (row === 1 && col === 4) ||
      (row === 2 && (col === 3 || col === 5)) ||
      // 下方九宫格的斜线
      (row === 7 && (col === 3 || col === 5)) ||
      (row === 8 && col === 4) ||
      (row === 9 && (col === 3 || col === 5))
    )

    // 兵/卒和炮的标记点位置
    const isMarkerPos =
      // 黑炮位置
      (row === 2 && (col === 1 || col === 7)) ||
      // 黑卒位置
      (row === 3 && col % 2 === 0) ||
      // 红兵位置
      (row === 6 && col % 2 === 0) ||
      // 红炮位置
      (row === 7 && (col === 1 || col === 7))

    return (
      <button
        key={`${row}-${col}`}
        onClick={() => handleClick(row, col)}
        className={`
          w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center
          relative transition-all duration-150
          ${isSelected ? 'z-10' : ''}
        `}
        style={{
          background: isRiver
            ? 'linear-gradient(180deg, #DEB887 0%, #D2B48C 50%, #DEB887 100%)'
            : 'linear-gradient(135deg, #F5DEB3 0%, #DEB887 100%)',
        }}
      >
        {/* 棋盘格子线 */}
        <div className="absolute inset-0 pointer-events-none">
          {/* 横线 */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-amber-800/60" />
          {/* 竖线（楚河汉界处断开） */}
          {!isRiver && (
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-amber-800/60" />
          )}
          {/* 楚河汉界文字 */}
          {row === 4 && col === 4 && (
            <div className="absolute inset-0 flex items-center justify-center text-amber-800/40 text-lg font-bold tracking-widest">
              {isZh ? '楚 河' : 'RIVER'}
            </div>
          )}
          {row === 5 && col === 4 && (
            <div className="absolute inset-0 flex items-center justify-center text-amber-800/40 text-lg font-bold tracking-widest">
              {isZh ? '漢 界' : 'BORDER'}
            </div>
          )}
          {/* 兵/卒和炮的标记点 */}
          {isMarkerPos && !piece && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full border border-amber-800/40" />
            </div>
          )}
        </div>

        {/* 棋子 */}
        {piece && (
          <div
            className={`
              w-9 h-9 sm:w-10 sm:h-10 rounded-full
              flex items-center justify-center
              font-bold text-lg sm:text-xl
              shadow-lg border-2
              transition-transform duration-150
              ${isSelected ? 'scale-110 ring-2 ring-yellow-400 ring-offset-1' : ''}
              ${piece.color === 'red'
                ? 'bg-gradient-to-br from-rose-50 to-rose-100 text-red-600 border-red-500 shadow-red-500/20'
                : 'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-800 border-emerald-600 shadow-emerald-500/20'
              }
            `}
          >
            <span className="drop-shadow-sm">{PIECE_NAMES[`${piece.type}-${piece.color}`]}</span>
          </div>
        )}

        {/* 有效移动指示器 */}
        {isValidMove && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div
              className={`
                rounded-full animate-pulse
                ${piece ? 'w-8 h-8 border-2 border-red-500/70' : 'w-4 h-4 bg-green-500/60'}
              `}
            />
          </div>
        )}
      </button>
    )
  }

  return (
    <div className={`min-h-screen flex flex-col items-center py-6 px-4 ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <h1 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {isZh ? '中国象棋' : 'Chinese Chess'}
      </h1>

      {/* 游戏状态 */}
      <div className={`mb-3 flex items-center gap-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        <span className="font-medium">
          {isZh ? '回合:' : 'Turn:'}{' '}
          <span className={turn === 'red' ? 'text-red-500' : 'text-emerald-600'}>
            {turn === 'red' ? (isZh ? '红方' : 'Red') : (isZh ? '黑方' : 'Black')}
          </span>
        </span>
        {isInCheck(turn, board) && !gameOver && (
          <span className="text-red-500 font-bold animate-pulse">
            {isZh ? '将军！' : 'Check!'}
          </span>
        )}
      </div>

      {/* 棋盘 */}
      <div className="relative">
        {/* 外边框 */}
        <div
          className="absolute -inset-2 rounded-lg shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #8B4513 0%, #654321 50%, #8B4513 100%)',
          }}
        />

        {/* 棋盘主体 */}
        <div
          className="relative grid gap-0 rounded overflow-hidden"
          style={{
            gridTemplateColumns: 'repeat(9, 1fr)',
            boxShadow: 'inset 0 0 20px rgba(139, 69, 19, 0.3)',
          }}
        >
          {board.map((row, r) => row.map((_, c) => renderCell(r, c)))}
        </div>

        {/* 坐标标签 */}
        <div className="absolute -left-6 top-0 bottom-0 flex flex-col justify-around text-xs text-amber-800/60">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="h-11 sm:h-12 flex items-center">{10 - i}</span>
          ))}
        </div>
        <div className="absolute -right-6 top-0 bottom-0 flex flex-col justify-around text-xs text-amber-800/60">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="h-11 sm:h-12 flex items-center">{10 - i}</span>
          ))}
        </div>
        <div className="absolute -bottom-5 left-0 right-0 flex justify-around text-xs text-amber-800/60 px-5">
          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map(label => (
            <span key={label} className="w-11 sm:w-12 text-center">{label}</span>
          ))}
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={resetGame}
          className={`
            px-6 py-2 rounded-lg font-medium transition-colors
            ${isDark
              ? 'bg-slate-700 hover:bg-slate-600 text-white'
              : 'bg-amber-600 hover:bg-amber-500 text-white'}
          `}
        >
          {isZh ? '重新开始' : 'New Game'}
        </button>
        <button
          onClick={() => setMoveHistory([])}
          className={`
            px-6 py-2 rounded-lg font-medium transition-colors
            ${isDark
              ? 'bg-slate-700 hover:bg-slate-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}
          `}
        >
          {isZh ? '清除记录' : 'Clear History'}
        </button>
      </div>

      {/* 移动历史 */}
      {moveHistory.length > 0 && (
        <div className={`mt-4 w-full max-w-md ${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg p-4 shadow-lg`}>
          <h3 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {isZh ? '移动记录' : 'Move History'}
          </h3>
          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
            {moveHistory.map((move, i) => (
              <span
                key={i}
                className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
              >
                {i + 1}. {move}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 游戏结束弹窗 */}
      {gameOver && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className={`p-8 rounded-2xl text-center shadow-2xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <h2 className="text-3xl font-bold text-green-500 mb-4">{gameOver}</h2>
            <button
              onClick={resetGame}
              className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
            >
              {isZh ? '再来一次' : 'Play Again'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
