import { useState, useCallback, useEffect } from 'react'
import {
  SOKOBAN_LEVELS,
  isSokobanWon,
  moveSokoban,
  parseSokobanLevel,
  type SokobanCell as Cell,
  type SokobanPosition as Position,
} from '../../games/sokoban/logic'

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

// 关卡数据 (# = 墙, $ = 箱子, . = 目标, @ = 玩家, + = 玩家在目标上, * = 箱子在目标上)
export default function Sokoban({ settings, onBack, toggleLanguage }: Props) {
  const [currentLevel, setCurrentLevel] = useState(1)
  const [board, setBoard] = useState<Cell[][]>([])
  const [player, setPlayer] = useState<Position>({ row: 0, col: 0 })
  const [moves, setMoves] = useState(0)
  const [pushes, setPushes] = useState(0)
  const [history, setHistory] = useState<{
    board: Cell[][]
    player: Position
    moves: number
    pushes: number
  }[]>([])
  const [gameWon, setGameWon] = useState(false)

  // 初始化关卡
  const initLevel = useCallback((level: number) => {
    const levelData = SOKOBAN_LEVELS[level] || SOKOBAN_LEVELS[1]
    const { board, player } = parseSokobanLevel(levelData)
    setBoard(board)
    setPlayer(player)
    setMoves(0)
    setPushes(0)
    setHistory([])
    setGameWon(false)
  }, [])

  useEffect(() => {
    initLevel(currentLevel)
  }, [currentLevel, initLevel])

  // 移动玩家
  const movePlayer = useCallback((dRow: number, dCol: number) => {
    if (gameWon) return
    const result = moveSokoban({ board, player }, dRow, dCol)
    if (!result.moved) return

    setHistory(prev => [...prev, {
      board: board.map(row => [...row]),
      player: { ...player },
      moves,
      pushes,
    }])
    setBoard(result.state.board)
    setPlayer(result.state.player)
    setMoves(moves + 1)
    setPushes(pushes + (result.pushed ? 1 : 0))

    // 检查获胜
    if (isSokobanWon(result.state.board)) {
      setGameWon(true)
    }
  }, [board, player, gameWon, moves, pushes])

  // 撤销
  const undo = useCallback(() => {
    if (history.length === 0) return
    const last = history[history.length - 1]
    setBoard(last.board)
    setPlayer(last.player)
    setHistory(history.slice(0, -1))
    setMoves(last.moves)
    setPushes(last.pushes)
    setGameWon(false)
  }, [history])

  // 重置关卡
  const resetLevel = () => {
    initLevel(currentLevel)
  }

  // 键盘控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault()
          movePlayer(-1, 0)
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault()
          movePlayer(1, 0)
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault()
          movePlayer(0, -1)
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault()
          movePlayer(0, 1)
          break
        case 'z':
        case 'Z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            undo()
          }
          break
        case 'r':
        case 'R':
          resetLevel()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [movePlayer, undo])

  // 下一关
  const nextLevel = () => {
    if (currentLevel < Object.keys(SOKOBAN_LEVELS).length) {
      setCurrentLevel(currentLevel + 1)
    }
  }

  // 上一关
  const prevLevel = () => {
    if (currentLevel > 1) {
      setCurrentLevel(currentLevel - 1)
    }
  }

  // 渲染单元格
  const renderCell = (cell: Cell, row: number, col: number) => {
    let content = ''
    let bgClass = 'bg-gradient-to-br from-slate-700 to-slate-800'
    let textClass = ''
    let extraClass = ''

    switch (cell) {
      case '#':
        bgClass = 'bg-gradient-to-br from-amber-600 to-amber-800 shadow-lg shadow-amber-900/50'
        content = ''
        extraClass = 'border-amber-900'
        break
      case '$':
        bgClass = 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30'
        content = '📦'
        textClass = 'text-2xl drop-shadow-lg'
        break
      case '.':
        bgClass = 'bg-gradient-to-br from-slate-500 to-slate-600'
        content = '✖️'
        textClass = 'text-xl opacity-70'
        break
      case '@':
        bgClass = 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/30'
        content = '😊'
        textClass = 'text-2xl animate-pulse'
        break
      case '+':
        bgClass = 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/30'
        content = '😊'
        textClass = 'text-2xl animate-pulse'
        break
      case '*':
        bgClass = 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/30'
        content = '📦'
        textClass = 'text-2xl drop-shadow-lg'
        extraClass = 'ring-2 ring-green-400'
        break
      case ' ':
        bgClass = 'bg-gradient-to-br from-slate-700 to-slate-800'
        break
    }

    return (
      <div
        key={`${row}-${col}`}
        className={`w-10 h-10 flex items-center justify-center ${bgClass} ${textClass} border border-slate-600/50 ${extraClass} transition-all duration-200`}
      >
        {content}
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${settings.darkMode ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <span>←</span>
              <span className="hidden sm:inline">{settings.language === 'zh' ? '返回' : 'Back'}</span>
            </button>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span>📦</span>
              {settings.language === 'zh' ? '推箱子' : 'Sokoban'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-400">
              {settings.language === 'zh' ? '关卡' : 'Level'}: {currentLevel}/{Object.keys(SOKOBAN_LEVELS).length}
            </div>
            <button
              onClick={toggleLanguage}
              className="px-2 py-1 bg-slate-700 rounded text-sm"
            >
              {settings.language === 'en' ? '中文' : 'EN'}
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex gap-4 text-sm">
            <span data-testid="sokoban-moves" className="text-slate-400">
              {settings.language === 'zh' ? '步数' : 'Moves'}: {moves}
            </span>
            <span data-testid="sokoban-pushes" className="text-slate-400">
              {settings.language === 'zh' ? '推动' : 'Pushes'}: {pushes}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              data-testid="sokoban-undo"
              onClick={undo}
              disabled={history.length === 0}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded text-sm transition-colors"
            >
              {settings.language === 'zh' ? '撤销' : 'Undo'}
            </button>
            <button
              data-testid="sokoban-reset"
              onClick={resetLevel}
              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 rounded text-sm transition-colors"
            >
              {settings.language === 'zh' ? '重置' : 'Reset'}
            </button>
          </div>
        </div>
      </div>

      {/* Level Selector */}
      <div className="max-w-4xl mx-auto px-4 mb-4">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={prevLevel}
            disabled={currentLevel === 1}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded text-sm transition-colors"
          >
            ◀
          </button>
          <span className="text-sm text-slate-400">
            {settings.language === 'zh' ? '关卡' : 'Level'} {currentLevel}
          </span>
          <button
            onClick={nextLevel}
            disabled={currentLevel === Object.keys(SOKOBAN_LEVELS).length}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded text-sm transition-colors"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Game Board */}
      <div className="flex justify-center pb-8">
        <div data-testid="sokoban-board" className="border-2 border-slate-600 rounded-lg overflow-hidden">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              {row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Controls */}
      <div className="max-w-xs mx-auto px-4 pb-8">
        <div className="grid grid-cols-3 gap-2">
          <div></div>
          <button
            onClick={() => movePlayer(-1, 0)}
            className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-2xl"
          >
            ⬆️
          </button>
          <div></div>
          <button
            onClick={() => movePlayer(0, -1)}
            className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-2xl"
          >
            ⬅️
          </button>
          <button
            onClick={() => movePlayer(1, 0)}
            className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-2xl"
          >
            ⬇️
          </button>
          <button
            onClick={() => movePlayer(0, 1)}
            className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-2xl"
          >
            ➡️
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="text-center text-sm text-slate-400">
          <p>{settings.language === 'zh' ? '将所有📦推到✖️位置' : 'Push all 📦 to ✖️ positions'}</p>
          <p className="mt-1">{settings.language === 'zh' ? '使用方向键或WASD移动' : 'Use arrow keys or WASD to move'}</p>
        </div>
      </div>

      {/* Win Modal */}
      {gameWon && (
        <div data-testid="sokoban-win" className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-8 text-center max-w-sm mx-4">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">
              {settings.language === 'zh' ? '关卡完成！' : 'Level Complete!'}
            </h2>
            <p className="text-slate-400 mb-4">
              {settings.language === 'zh'
                ? `${moves} 步，${pushes} 次推动`
                : `${moves} moves, ${pushes} pushes`}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={resetLevel}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
              >
                {settings.language === 'zh' ? '重玩' : 'Replay'}
              </button>
              {currentLevel < Object.keys(SOKOBAN_LEVELS).length && (
                <button
                  onClick={nextLevel}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition-colors"
                >
                  {settings.language === 'zh' ? '下一关' : 'Next Level'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
