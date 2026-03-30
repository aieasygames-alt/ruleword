import { useState, useCallback, useEffect } from 'react'

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

export default function HuarongPass({ settings }: Props) {
  const [blocks, setBlocks] = useState<Block[]>(INITIAL_LAYOUT)
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  const [moveCount, setMoveCount] = useState(0)
  const [gameWon, setGameWon] = useState(false)
  const [startTime, setStartTime] = useState(Date.now())
  const [elapsedTime, setElapsedTime] = useState(0)

  const isDark = settings.darkMode
  const isZh = settings.language === 'zh'

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <div className={`max-w-2xl w-full rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {isZh ? '华容道' : 'Huarong Pass'}
            </h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              {isZh ? '将曹操移到底部出口' : 'Move Cao Cao to the bottom center exit'}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
              {isZh ? '步数' : 'Moves'}: {moveCount}
            </div>
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              {formatTime(elapsedTime)}
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex justify-center mb-6">
          <div
            className="relative border-4 border-amber-700 rounded-lg"
            style={{
              width: GRID_SIZE * CELL_SIZE + 32,
              height: GRID_SIZE * CELL_SIZE + 32,
              padding: 16,
              background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)'
            }}
          >
            {/* Exit marker */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
              <div className="bg-amber-600 text-white px-4 py-1 rounded-b-lg text-sm font-bold">
                {isZh ? '出口' : 'EXIT'}
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
            {isZh ? '玩法' : 'How to Play'}:
          </div>
          <ul className={`text-sm space-y-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            <li>• {isZh ? '点击棋子选中，然后用方向键移动' : 'Click a block to select, then use arrow keys to move'}</li>
            <li>• {isZh ? '将曹操（红色大方块）移到底部中央出口' : 'Move Cao Cao (red 2×2 block) to the bottom center exit'}</li>
            <li>• {isZh ? '棋子只能滑动，不能跳跃' : 'Blocks can only slide, not jump over others'}</li>
          </ul>
        </div>

        {/* Controls */}
        <button
          onClick={resetGame}
          className="w-full py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white"
        >
          {isZh ? '重新开始' : 'Reset Game'}
        </button>

        {/* Win Message */}
        {gameWon && (
          <div className={`mt-6 p-6 rounded-xl text-center ${isDark ? 'bg-green-900/50' : 'bg-green-100'}`}>
            <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
              🎉 {isZh ? '胜利！' : 'Victory!'}
            </h2>
            <p className={`text-lg mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              {isZh ? `曹操成功逃脱！用了 ${moveCount} 步` : `Cao Cao escaped in ${moveCount} moves!`}
            </p>
            <p className={`text-lg mb-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              {isZh ? `用时: ${formatTime(elapsedTime)}` : `Time: ${formatTime(elapsedTime)}`}
            </p>
            <button
              onClick={resetGame}
              className="px-6 py-3 rounded-xl font-semibold bg-green-600 hover:bg-green-500 text-white"
            >
              {isZh ? '再来一次' : 'Play Again'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Add React import for Fragment
import React from 'react'
