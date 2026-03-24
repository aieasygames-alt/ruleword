import React, { useState, useCallback, useEffect } from 'react';

interface Block {
  id: string;
  type: 'caocao' | 'guanyu' | 'zhangfei' | 'zhaoyun' | 'ma' | 'bing' | 'kong';
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  nameZh: string;
}

const GRID_SIZE = 4;
const CELL_SIZE = 70;

// Classic Huarong Pass layout
const INITIAL_LAYOUT: Block[] = [
  // Row 0
  { id: 'caocao', type: 'caocao', x: 1, y: 0, width: 2, height: 2, name: '曹操', nameZh: '曹操' },
  { id: 'zhangfei', type: 'zhangfei', x: 0, y: 0, width: 1, height: 2, name: '张飞', nameZh: '张飞' },
  { id: 'zhaoyun', type: 'zhaoyun', x: 3, y: 0, width: 1, height: 2, name: '赵云', nameZh: '赵云' },
  // Row 1 (Caocao occupies 1,1 to 2,2)
  // Row 2
  { id: 'guanyu', type: 'guanyu', x: 1, y: 2, width: 2, height: 1, name: '关羽', nameZh: '关羽' },
  { id: 'ma1', type: 'ma', x: 0, y: 2, width: 1, height: 1, name: '马', nameZh: '马' },
  { id: 'ma2', type: 'ma', x: 3, y: 2, width: 1, height: 1, name: '马', nameZh: '马' },
  // Row 3
  { id: 'bing1', type: 'bing', x: 0, y: 3, width: 1, height: 1, name: '兵', nameZh: '兵' },
  { id: 'bing2', type: 'bing', x: 1, y: 3, width: 1, height: 1, name: '兵', nameZh: '兵' },
  { id: 'bing3', type: 'bing', x: 2, y: 3, width: 1, height: 1, name: '兵', nameZh: '兵' },
  { id: 'bing4', type: 'bing', x: 3, y: 3, width: 1, height: 1, name: '兵', nameZh: '兵' },
];

export default function HuarongPass() {
  const [blocks, setBlocks] = useState<Block[]>(INITIAL_LAYOUT);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [moveCount, setMoveCount] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [darkMode] = useState(true);

  const getOccupiedCells = useCallback(() => {
    const occupied = new Set<string>();
    blocks.forEach(block => {
      for (let dx = 0; dx < block.width; dx++) {
        for (let dy = 0; dy < block.height; dy++) {
          occupied.add(`${block.x + dx},${block.y + dy}`);
        }
      }
    });
    return occupied;
  }, [blocks]);

  const canMove = useCallback((block: Block, dx: number, dy: number) => {
    if (dx !== 0 && dy !== 0) return false; // Can only move in one direction

    const newX = block.x + dx;
    const newY = block.y + dy;

    // Check bounds
    if (newX < 0 || newX + block.width > GRID_SIZE) return false;
    if (newY < 0 || newY + block.height > GRID_SIZE) return false;

    // Check collision with other blocks
    const occupied = getOccupiedCells();
    for (let bx = 0; bx < block.width; bx++) {
      for (let by = 0; by < block.height; by++) {
        const checkX = newX + bx;
        const checkY = newY + by;
        const key = `${checkX},${checkY}`;

        // Skip current block's cells
        let isCurrentBlock = false;
        for (let cbx = 0; cbx < block.width; cbx++) {
          for (let cby = 0; cby < block.height; cby++) {
            if (`${block.x + cbx},${block.y + cby}` === key) {
              isCurrentBlock = true;
            }
          }
        }
        if (!isCurrentBlock && occupied.has(key)) return false;
      }
    }

    return true;
  }, [getOccupiedCells]);

  const moveBlock = useCallback((blockId: string, dx: number, dy: number) => {
    setBlocks(prev => prev.map(block => {
      if (block.id === blockId) {
        return { ...block, x: block.x + dx, y: block.y + dy };
      }
      return block;
    }));
    setMoveCount(c => c + 1);
  }, []);

  const handleClick = useCallback((block: Block) => {
    if (gameWon) return;

    if (selectedBlock === block.id) {
      setSelectedBlock(null);
    } else {
      setSelectedBlock(block.id);
    }
  }, [selectedBlock, gameWon]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!selectedBlock || gameWon) return;

    const block = blocks.find(b => b.id === selectedBlock);
    if (!block) return;

    switch (e.key) {
      case 'ArrowUp':
        if (canMove(block, 0, -1)) moveBlock(block.id, 0, -1);
        break;
      case 'ArrowDown':
        if (canMove(block, 0, 1)) moveBlock(block.id, 0, 1);
        break;
      case 'ArrowLeft':
        if (canMove(block, -1, 0)) moveBlock(block.id, -1, 0);
        break;
      case 'ArrowRight':
        if (canMove(block, 1, 0)) moveBlock(block.id, 1, 0);
        break;
    }
  }, [selectedBlock, blocks, canMove, moveBlock, gameWon]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Check win condition
  useEffect(() => {
    const caocao = blocks.find(b => b.id === 'caocao');
    if (caocao && caocao.x === 1 && caocao.y === 2) {
      setGameWon(true);
    }
  }, [blocks]);

  const resetGame = useCallback(() => {
    setBlocks(INITIAL_LAYOUT);
    setSelectedBlock(null);
    setMoveCount(0);
    setGameWon(false);
  }, []);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${darkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <div className={`max-w-2xl w-full rounded-2xl shadow-2xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              华容道 Huarong Pass
            </h1>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              Move 曹操 to the bottom center exit
            </p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
              {moveCount}
            </div>
            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Moves</div>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex justify-center mb-6">
          <div
            className="relative border-4 border-amber-700 bg-amber-100 rounded"
            style={{
              width: GRID_SIZE * CELL_SIZE + 32,
              height: GRID_SIZE * CELL_SIZE + 32,
              padding: 16
            }}
          >
            {/* Exit marker */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full text-amber-600 text-sm font-semibold">
              ▼ EXIT ▼
            </div>

            {blocks.map(block => (
              <div
                key={block.id}
                onClick={() => handleClick(block)}
                className={`absolute rounded-lg cursor-pointer transition-all flex items-center justify-center font-semibold ${
                  selectedBlock === block.id
                    ? 'ring-4 ring-amber-500 scale-105'
                    : 'hover:scale-102'
                } ${
                  block.type === 'caocao'
                    ? 'bg-gradient-to-br from-red-500 to-red-700 text-white text-lg'
                    : block.type === 'guanyu'
                      ? 'bg-gradient-to-br from-green-500 to-green-700 text-white'
                      : block.type === 'zhangfei' || block.type === 'zhaoyun'
                        ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white text-sm'
                        : block.type === 'ma'
                          ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-white text-sm'
                          : 'bg-gradient-to-br from-slate-400 to-slate-600 text-white text-xs'
                }`}
                style={{
                  left: block.x * CELL_SIZE + 16,
                  top: block.y * CELL_SIZE + 16,
                  width: block.width * CELL_SIZE - 4,
                  height: block.height * CELL_SIZE - 4,
                }}
              >
                <div className="text-center">
                  <div className="text-xs opacity-80">{block.nameZh}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className={`p-4 rounded-xl mb-4 ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
          <div className={`text-sm font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
            How to Play:
          </div>
          <ul className={`text-sm space-y-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            <li>• Click a block to select it, then use Arrow Keys to move</li>
            <li>• Move 曹操 (red 2x2 block) to the bottom center to win</li>
            <li>• Blocks can only slide, not jump over others</li>
          </ul>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={resetGame}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              darkMode
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white'
                : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white'
            }`}
          >
            Reset Game
          </button>
        </div>

        {/* Win Message */}
        {gameWon && (
          <div className={`mt-6 p-6 rounded-xl text-center ${darkMode ? 'bg-green-900/50' : 'bg-green-100'}`}>
            <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              🎉 Victory!
            </h2>
            <p className={`text-lg mb-4 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              You escaped in {moveCount} moves!
            </p>
            <button
              onClick={resetGame}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                darkMode
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white'
              }`}
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
