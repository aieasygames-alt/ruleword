import React, { useState, useEffect, useCallback } from 'react';

interface Block {
  shape: number[][];
  color: string;
}

export default function BlockPuzzle() {
  const [grid, setGrid] = useState<(number | null)[][]>(() =>
    Array(10).fill(null).map(() => Array(10).fill(null))
  );
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [darkMode] = useState(true);
  const [availableBlocks, setAvailableBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<number | null>(null);

  // Block definitions with colors (1010! style)
  const BLOCK_TEMPLATES: Omit<Block, 'color'>[][] = [
    // Single blocks
    [{ shape: [[1]] }],
    [{ shape: [[1, 1]] }],
    [{ shape: [[1], [1]] }],
    // 2x2 square
    [{ shape: [[1, 1], [1, 1]] }],
    // 3x3 square
    [{ shape: [[1, 1, 1], [1, 1, 1], [1, 1, 1]] }],
    // L shapes
    [{ shape: [[1, 0], [1, 0], [1, 1]] }],
    [{ shape: [[0, 1], [0, 1], [1, 1]] }],
    [{ shape: [[1, 1, 1], [1, 0, 0]] }],
    [{ shape: [[1, 1, 1], [0, 0, 1]] }],
    // T shapes
    [{ shape: [[1, 1, 1], [0, 1, 0]] }],
    [{ shape: [[0, 1], [1, 1], [0, 1]] }],
    // Z/S shapes
    [{ shape: [[1, 1, 0], [0, 1, 1]] }],
    [{ shape: [[0, 1, 1], [1, 1, 0]] }],
    // Line shapes
    [{ shape: [[1, 1, 1]] }],
    [{ shape: [[1], [1], [1]] }],
    [{ shape: [[1, 1, 1, 1]] }],
    [{ shape: [[1], [1], [1], [1]] }],
    // Plus shape
    [{ shape: [[0, 1, 0], [1, 1, 1], [0, 1, 0]] }],
  ];

  const COLORS = [
    'from-red-500 to-red-600',
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600',
    'from-yellow-500 to-yellow-600',
    'from-purple-500 to-purple-600',
    'from-pink-500 to-pink-600',
    'from-indigo-500 to-indigo-600',
    'from-teal-500 to-teal-600',
  ];

  // Generate 3 random blocks
  const generateBlocks = useCallback(() => {
    const newBlocks: Block[] = [];
    for (let i = 0; i < 3; i++) {
      const template = BLOCK_TEMPLATES[Math.floor(Math.random() * BLOCK_TEMPLATES.length)];
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      newBlocks.push({
        shape: template[0].shape,
        color,
      });
    }
    return newBlocks;
  }, []);

  // Initialize blocks on mount and when depleted
  useEffect(() => {
    if (availableBlocks.length === 0 && !gameOver) {
      setAvailableBlocks(generateBlocks());
    }
  }, [availableBlocks.length, gameOver, generateBlocks]);

  // Check if a block can be placed
  const canPlace = (block: Block, startX: number, startY: number): boolean => {
    const { shape } = block;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] === 1) {
          const x = startX + c;
          const y = startY + r;
          if (x >= 10 || y >= 10 || x < 0 || y < 0) return false;
          if (grid[y][x] !== null) return false;
        }
      }
    }
    return true;
  };

  // Place a block on the grid
  const placeBlock = (block: Block, startX: number, startY: number): boolean => {
    if (!canPlace(block, startX, startY)) return false;

    const newGrid = grid.map(row => [...row]);
    const { shape } = block;

    // Place the block
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] === 1) {
          newGrid[startY + r][startX + c] = 1;
        }
      }
    }

    // Check for completed rows and columns
    let linesCleared = 0;
    const rowsToClear: number[] = [];
    const colsToClear: number[] = [];

    // Check rows
    for (let y = 0; y < 10; y++) {
      if (newGrid[y].every(cell => cell !== null)) {
        rowsToClear.push(y);
      }
    }

    // Check columns
    for (let x = 0; x < 10; x++) {
      if (newGrid.every(row => row[x] !== null)) {
        colsToClear.push(x);
      }
    }

    // Clear completed lines
    rowsToClear.forEach(y => {
      for (let x = 0; x < 10; x++) {
        newGrid[y][x] = null;
      }
    });

    colsToClear.forEach(x => {
      for (let y = 0; y < 10; y++) {
        newGrid[y][x] = null;
      }
    });

    linesCleared = rowsToClear.length + colsToClear.length;

    // Score calculation (bonus for multiple lines)
    const points = linesCleared > 1 ? linesCleared * 15 * linesCleared : linesCleared * 10;
    setScore(s => s + points);
    setGrid(newGrid);

    return true;
  };

  // Handle block placement
  const handlePlaceBlock = (blockIndex: number, gridX: number, gridY: number) => {
    if (gameOver || selectedBlock !== blockIndex) return;

    const block = availableBlocks[blockIndex];
    if (placeBlock(block, gridX, gridY)) {
      // Remove the used block
      const newBlocks = [...availableBlocks];
      newBlocks.splice(blockIndex, 1);
      setAvailableBlocks(newBlocks);
      setSelectedBlock(null);
    }
  };

  // Check if any block can be placed
  useEffect(() => {
    if (availableBlocks.length === 0 && !gameOver) {
      // Generate new blocks
      const newBlocks = generateBlocks();
      setAvailableBlocks(newBlocks);

      // Check if game over (no blocks can be placed)
      let canPlaceAny = false;
      for (const block of newBlocks) {
        for (let y = 0; y < 10; y++) {
          for (let x = 0; x < 10; x++) {
            if (canPlace(block, x, y)) {
              canPlaceAny = true;
              break;
            }
          }
          if (canPlaceAny) break;
        }
        if (canPlaceAny) break;
      }

      if (!canPlaceAny) {
        setGameOver(true);
      }
    }
  }, [availableBlocks, gameOver, generateBlocks]);

  // Get grid cells for a block
  const getBlockCells = (block: Block) => {
    const cells: { x: number; y: number }[] = [];
    block.shape.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell === 1) cells.push({ x: c, y: r });
      });
    });
    return cells;
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${darkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <div className={`max-w-lg w-full rounded-2xl shadow-2xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Block Puzzle</h1>
          <div className="text-right">
            <div className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{score}</div>
            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Score</div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-10 gap-px mb-6 p-2 rounded-lg bg-slate-700">
          {grid.map((row, y) =>
            row.map((cell, x) => {
              const isValidPlacement =
                selectedBlock !== null &&
                availableBlocks[selectedBlock] &&
                canPlace(availableBlocks[selectedBlock], x, y);

              return (
                <div
                  key={`${y}-${x}`}
                  onClick={() => {
                    if (selectedBlock !== null && isValidPlacement) {
                      handlePlaceBlock(selectedBlock, x, y);
                    }
                  }}
                  className={`aspect-square rounded-sm transition-all cursor-pointer ${
                    cell
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                      : isValidPlacement
                        ? darkMode
                          ? 'bg-slate-600 hover:bg-slate-500'
                          : 'bg-gray-300 hover:bg-gray-400'
                        : darkMode
                          ? 'bg-slate-800'
                          : 'bg-gray-100'
                  }`}
                />
              );
            })
          )}
        </div>

        {/* Available Blocks */}
        <div className="mb-4">
          <p className={`text-sm mb-3 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            Select a block, then click on the grid to place it
          </p>
          <div className="grid grid-cols-3 gap-4">
            {availableBlocks.map((block, index) => {
              const blockCells = getBlockCells(block);
              const isSelected = selectedBlock === index;

              return (
                <div
                  key={index}
                  onClick={() => !gameOver && setSelectedBlock(isSelected ? null : index)}
                  className={`aspect-square p-2 rounded-lg cursor-pointer transition-all ${
                    gameOver
                      ? 'opacity-50 cursor-not-allowed'
                      : isSelected
                        ? 'ring-4 ring-green-500 scale-105'
                        : 'hover:scale-105'
                  } ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  <div className="grid gap-px w-full h-full" style={{
                    gridTemplateColumns: `repeat(${block.shape[0].length}, 1fr)`,
                    gridTemplateRows: `repeat(${block.shape.length}, 1fr)`
                  }}>
                    {block.shape.map((row, r) =>
                      row.map((cell, c) => (
                        <div
                          key={`${r}-${c}`}
                          className={`rounded-sm ${
                            cell === 1
                              ? `bg-gradient-to-br ${block.color}`
                              : 'transparent'
                          }`}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* New Game Button */}
        <button
          onClick={() => {
            setGrid(Array(10).fill(null).map(() => Array(10).fill(null)));
            setScore(0);
            setGameOver(false);
            setAvailableBlocks(generateBlocks());
            setSelectedBlock(null);
          }}
          className={`w-full py-3 rounded-xl font-semibold transition-all ${
            darkMode ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-green-600 hover:bg-green-500 text-white'
          }`}
        >
          New Game
        </button>

        {gameOver && (
          <div className={`mt-4 p-4 rounded-xl text-center ${darkMode ? 'bg-red-900/50' : 'bg-red-100'}`}>
            <p className={`font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
              Game Over! Score: {score}
            </p>
            <p className={`text-sm mt-2 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              No more blocks can be placed!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
