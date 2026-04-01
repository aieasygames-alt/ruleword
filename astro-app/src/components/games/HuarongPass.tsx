import React, { useState, useCallback, useEffect, useRef } from 'react'

interface Block {
  id: string
  type: 'caocao' | 'guanyu' | 'zhangfei' | 'zhaoyun' | 'ma' | 'bing'
  x: number
  y: number
  width: number
  height: number
  name: string
}

type Props = {
  settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }
  onBack: () => void
  toggleLanguage: () => void
  toggleTheme: () => void
  toggleSound: () => void
}

const GRID_SIZE = 4
const CELL_SIZE = 70

// Classic Huarong Pass layout - "横刀立马"
const INITIAL_LAYOUT: Block[] = [
  // Row 0
  { id: 'zhangfei', type: 'zhangfei', x: 0, y: 0, width: 1, height: 2, name: '张飞' },
  { id: 'caocao', type: 'caocao', x: 1, y: 0, width: 2, height: 2, name: '曹操' },
  { id: 'zhaoyun', type: 'zhaoyun', x: 3, y: 0, width: 1, height: 2, name: '赵云' },
  // Row 2
  { id: 'guanyu', type: 'guanyu', x: 1, y: 2, width: 2, height: 1, name: '关羽' },
  { id: 'ma1', type: 'ma', x: 0, y: 2, width: 1, height: 1, name: '马' },
  { id: 'ma2', type: 'ma', x: 3, y: 2, width: 1, height: 1, name: '马' },
  // Row 3
  { id: 'bing1', type: 'bing', x: 0, y: 3, width: 1, height: 1, name: '兵' },
  { id: 'bing2', type: 'bing', x: 1, y: 3, width: 1, height: 1, name: '兵' },
  { id: 'bing3', type: 'bing', x: 2, y: 3, width: 1, height: 1, name: '兵' },
  { id: 'bing4', type: 'bing', x: 3, y: 3, width: 1, height: 1, name: '兵' },
]

export default function HuarongPass({ settings, onBack }: Props) {
  const [blocks, setBlocks] = useState<Block[]>(INITIAL_LAYOUT)
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  const [moveCount, setMoveCount] = useState(0)
  const [gameWon, setGameWon] = useState(false)
  const [startTime, setStartTime] = useState(Date.now())
  const [elapsedTime, setElapsedTime] = useState(0)

  // Touch/drag state
  const [dragStart, setDragStart] = useState<{ x: number; y: number; blockId: string } | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)

  const isDark = settings.darkMode
  const isZh = settings.language === 'zh'

  const texts = {
    title: isZh ? '华容道' : 'Huarong Pass',
    back: isZh ? '返回' : 'Back',
    reset: isZh ? '重新开始' : 'Reset',
    moves: isZh ? '步数' : 'Moves',
    exit: isZh ? '出口' : 'EXIT',
    goal: isZh ? '将曹操移到底部出口' : 'Move Cao Cao to bottom exit',
    victory: isZh ? '胜利！' : 'Victory!',
    escaped: isZh ? '曹操成功逃脱！用了' : 'Cao Cao escaped in',
    steps: isZh ? '步' : 'steps',
    time: isZh ? '用时' : 'Time',
    playAgain: isZh ? '再来一次' : 'Play Again',
    howToPlay: isZh ? '玩法' : 'How to Play',
    instruction1: isZh ? '点击或拖拽棋子移动' : 'Tap or drag blocks to move',
    instruction2: isZh ? '将曹操（红色大方块）移到底部中央出口' : 'Move Cao Cao (red 2×2) to bottom center',
    instruction3: isZh ? '棋子只能滑动，不能跳跃' : 'Blocks slide only, no jumping',
  }

  // Timer
  useEffect(() => {
    if (gameWon) return
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime, gameWon])

  const getOccupiedCells = useCallback(() => {
    const occupied = new Set<string>()
    blocks.forEach(block => {
      for (let dx = 0; dx < block.width; dx++) {
        for (let dy = 0; dy < block.height; dy++) {
          occupied.add(`${block.x + dx},${block.y + dy}`)
        }
      }
    })
    return occupied
  }, [blocks])

  const canMove = useCallback((block: Block, dx: number, dy: number) => {
    if (dx !== 0 && dy !== 0) return false // Can only move in one direction

    const newX = block.x + dx
    const newY = block.y + dy

    // Check bounds
    if (newX < 0 || newX + block.width > GRID_SIZE) return false
    if (newY < 0 || newY + block.height > GRID_SIZE) return false

    // Check collision with other blocks
    const occupied = getOccupiedCells()
    for (let bx = 0; bx < block.width; bx++) {
      for (let by = 0; by < block.height; by++) {
        const checkX = newX + bx
        const checkY = newY + by
        const key = `${checkX},${checkY}`

        // Skip current block's cells
        let isCurrentBlock = false
        for (let cbx = 0; cbx < block.width; cbx++) {
          for (let cby = 0; cby < block.height; cby++) {
            if (`${block.x + cbx},${block.y + cby}` === key) {
              isCurrentBlock = true
            }
          }
        }
        if (!isCurrentBlock && occupied.has(key)) return false
      }
    }

    return true
  }, [getOccupiedCells])

  const moveBlock = useCallback((blockId: string, dx: number, dy: number) => {
    setBlocks(prev => prev.map(block => {
      if (block.id === blockId) {
        return { ...block, x: block.x + dx, y: block.y + dy }
      }
      return block
    }))
    setMoveCount(c => c + 1)
  }, [])

  const handleClick = useCallback((block: Block) => {
    if (gameWon) return

    if (selectedBlock === block.id) {
      setSelectedBlock(null)
    } else {
      setSelectedBlock(block.id)
    }
  }, [selectedBlock, gameWon])

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!selectedBlock || gameWon) return

    const block = blocks.find(b => b.id === selectedBlock)
    if (!block) return

    switch (e.key) {
      case 'ArrowUp':
        if (canMove(block, 0, -1)) moveBlock(block.id, 0, -1)
        break
      case 'ArrowDown':
        if (canMove(block, 0, 1)) moveBlock(block.id, 0, 1)
        break
      case 'ArrowLeft':
        if (canMove(block, -1, 0)) moveBlock(block.id, -1, 0)
        break
      case 'ArrowRight':
        if (canMove(block, 1, 0)) moveBlock(block.id, 1, 0)
        break
    }
  }, [selectedBlock, blocks, canMove, moveBlock, gameWon])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  // Check win condition - Cao Cao must reach the bottom center exit
  // Exit is at position (1, 3) for a 2x2 block
  useEffect(() => {
    const caocao = blocks.find(b => b.id === 'caocao')
    // Cao Cao wins when at x=1, y=3 (bottom center, filling the exit)
    if (caocao && caocao.x === 1 && caocao.y === 3) {
      setGameWon(true)
    }
  }, [blocks])

  const resetGame = useCallback(() => {
    setBlocks(INITIAL_LAYOUT)
    setSelectedBlock(null)
    setMoveCount(0)
    setGameWon(false)
    setStartTime(Date.now())
    setElapsedTime(0)
  }, [])

  // Touch handlers for mobile drag support
  const handleTouchStart = useCallback((e: React.TouchEvent, block: Block) => {
    if (gameWon) return
    e.preventDefault()
    const touch = e.touches[0]
    setDragStart({ x: touch.clientX, y: touch.clientY, blockId: block.id })
    setSelectedBlock(block.id)
  }, [gameWon])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragStart) return
    e.preventDefault()
  }, [dragStart])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!dragStart || gameWon) return
    e.preventDefault()

    const touch = e.changedTouches[0]
    const dx = touch.clientX - dragStart.x
    const dy = touch.clientY - dragStart.y

    const block = blocks.find(b => b.id === dragStart.blockId)
    if (!block) {
      setDragStart(null)
      return
    }

    // Determine direction based on drag distance
    const threshold = CELL_SIZE / 2
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
      // Horizontal swipe
      if (dx > 0 && canMove(block, 1, 0)) {
        moveBlock(block.id, 1, 0)
      } else if (dx < 0 && canMove(block, -1, 0)) {
        moveBlock(block.id, -1, 0)
      }
    } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > threshold) {
      // Vertical swipe
      if (dy > 0 && canMove(block, 0, 1)) {
        moveBlock(block.id, 0, 1)
      } else if (dy < 0 && canMove(block, 0, -1)) {
        moveBlock(block.id, 0, -1)
      }
    }

    setDragStart(null)
  }, [dragStart, blocks, canMove, moveBlock, gameWon])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/90 border-b border-slate-800 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm text-white"
          >
            ← {texts.back}
          </button>
          <div className="text-center">
            <span className="text-lg font-bold text-white">{texts.title}</span>
          </div>
          <button
            onClick={resetGame}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 transition-colors text-sm text-white"
          >
            {texts.reset}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className={`max-w-2xl w-full rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          {/* Stats Header */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {texts.title}
              </h1>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                {texts.goal}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                {texts.moves}: {moveCount}
              </div>
              <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                {formatTime(elapsedTime)}
              </div>
            </div>
          </div>

          {/* Game Board */}
          <div className="flex justify-center mb-6">
            <div
              ref={boardRef}
              className="relative border-4 border-amber-700 rounded-lg"
              style={{
                width: GRID_SIZE * CELL_SIZE + 32,
                height: GRID_SIZE * CELL_SIZE + 32,
                padding: 16,
                background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                touchAction: 'none'
              }}
            >
              {/* Exit marker */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                <div className="bg-amber-600 text-white px-4 py-1 rounded-b-lg text-sm font-bold">
                  {texts.exit}
                </div>
              </div>

              {/* Grid lines */}
              <div className="absolute inset-4 pointer-events-none">
                {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
                  <React.Fragment key={`line-${i}`}>
                    {/* Horizontal line */}
                    <div
                      className="absolute left-0 right-0 border-t border-amber-300"
                      style={{ top: `${(i / GRID_SIZE) * 100}%` }}
                    />
                    {/* Vertical line */}
                    <div
                      className="absolute top-0 bottom-0 border-l border-amber-300"
                      style={{ left: `${(i / GRID_SIZE) * 100}%` }}
                    />
                  </React.Fragment>
                ))}
              </div>

              {/* Blocks */}
              {blocks.map(block => (
                <div
                  key={block.id}
                  onClick={() => handleClick(block)}
                  onTouchStart={(e) => handleTouchStart(e, block)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className={`absolute rounded-lg cursor-pointer transition-all flex items-center justify-center font-semibold ${
                    selectedBlock === block.id
                      ? 'ring-4 ring-amber-400 scale-105 z-10'
                      : 'hover:scale-102'
                  } ${
                    block.type === 'caocao'
                      ? 'bg-gradient-to-br from-red-500 to-red-700 text-white text-xl shadow-lg shadow-red-500/30'
                      : block.type === 'guanyu'
                        ? 'bg-gradient-to-br from-green-500 to-green-700 text-white'
                        : block.type === 'zhangfei' || block.type === 'zhaoyun'
                          ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white'
                          : block.type === 'ma'
                            ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-white'
                            : 'bg-gradient-to-br from-slate-400 to-slate-600 text-white'
                  }`}
                  style={{
                    left: block.x * CELL_SIZE + 16,
                    top: block.y * CELL_SIZE + 16,
                    width: block.width * CELL_SIZE - 4,
                    height: block.height * CELL_SIZE - 4,
                  }}
                >
                  <div className="text-center">
                    <div>{block.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className={`p-4 rounded-xl mb-4 ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`}>
            <div className={`text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              {texts.howToPlay}:
            </div>
            <ul className={`text-sm space-y-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              <li>• {texts.instruction1}</li>
              <li>• {texts.instruction2}</li>
              <li>• {texts.instruction3}</li>
            </ul>
          </div>

          {/* Win Message */}
          {gameWon && (
            <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-green-900/50' : 'bg-green-100'}`}>
              <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                🎉 {texts.victory}
              </h2>
              <p className={`text-lg mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                {texts.escaped} {moveCount} {texts.steps}
              </p>
              <p className={`text-lg mb-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                {texts.time}: {formatTime(elapsedTime)}
              </p>
              <button
                onClick={resetGame}
                className="px-6 py-3 rounded-xl font-semibold bg-green-600 hover:bg-green-500 text-white"
              >
                {texts.playAgain}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
