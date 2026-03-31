import React, { useState, useEffect, useCallback, useRef } from 'react';

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

  // Drag state
  const [draggingBlock, setDraggingBlock] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [dragGridPos, setDragGridPos] = useState<{ row: number; col: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const gridCellSizeRef = useRef(0);

  // Block definitions with colors (1010! style)
  const BLOCK_TEMPLATES: Omit<Block, 'color'>[][] = [
    [{ shape: [[1]] }],
    [{ shape: [[1, 1]] }],
    [{ shape: [[1], [1]] }],
    [{ shape: [[1, 1], [1, 1]] }],
    [{ shape: [[1, 1, 1], [1, 1, 1], [1, 1, 1]] }],
    [{ shape: [[1, 0], [1, 0], [1, 1]] }],
    [{ shape: [[0, 1], [0, 1], [1, 1]] }],
    [{ shape: [[1, 1, 1], [1, 0, 0]] }],
    [{ shape: [[1, 1, 1], [0, 0, 1]] }],
    [{ shape: [[1, 1, 1], [0, 1, 0]] }],
    [{ shape: [[0, 1], [1, 1], [0, 1]] }],
    [{ shape: [[1, 1, 0], [0, 1, 1]] }],
    [{ shape: [[0, 1, 1], [1, 1, 0]] }],
    [{ shape: [[1, 1, 1]] }],
    [{ shape: [[1], [1], [1]] }],
    [{ shape: [[1, 1, 1, 1]] }],
    [{ shape: [[1], [1], [1], [1]] }],
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

  const generateBlocks = useCallback(() => {
    const newBlocks: Block[] = [];
    for (let i = 0; i < 3; i++) {
      const template = BLOCK_TEMPLATES[Math.floor(Math.random() * BLOCK_TEMPLATES.length)];
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      newBlocks.push({ shape: template[0].shape, color });
    }
    return newBlocks;
  }, []);

  useEffect(() => {
    if (availableBlocks.length === 0 && !gameOver) {
      setAvailableBlocks(generateBlocks());
    }
  }, [availableBlocks.length, gameOver, generateBlocks]);

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

  const placeBlock = (block: Block, startX: number, startY: number): boolean => {
    if (!canPlace(block, startX, startY)) return false;

    const newGrid = grid.map(row => [...row]);
    const { shape } = block;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] === 1) {
          newGrid[startY + r][startX + c] = 1;
        }
      }
    }

    let linesCleared = 0;
    const rowsToClear: number[] = [];
    const colsToClear: number[] = [];

    for (let y = 0; y < 10; y++) {
      if (newGrid[y].every(cell => cell !== null)) rowsToClear.push(y);
    }
    for (let x = 0; x < 10; x++) {
      if (newGrid.every(row => row[x] !== null)) colsToClear.push(x);
    }

    rowsToClear.forEach(y => { for (let x = 0; x < 10; x++) newGrid[y][x] = null; });
    colsToClear.forEach(x => { for (let y = 0; y < 10; y++) newGrid[y][x] = null; });

    linesCleared = rowsToClear.length + colsToClear.length;
    const points = linesCleared > 1 ? linesCleared * 15 * linesCleared : linesCleared * 10;
    setScore(s => s + points);
    setGrid(newGrid);
    return true;
  };

  const doPlaceBlock = (blockIndex: number, gridX: number, gridY: number) => {
    if (gameOver) return;
    const block = availableBlocks[blockIndex];
    if (!block) return;
    if (placeBlock(block, gridX, gridY)) {
      const newBlocks = [...availableBlocks];
      newBlocks.splice(blockIndex, 1);
      setAvailableBlocks(newBlocks);
      setSelectedBlock(null);
    }
  };

  const handlePlaceBlock = (blockIndex: number, gridX: number, gridY: number) => {
    if (gameOver || selectedBlock !== blockIndex) return;
    doPlaceBlock(blockIndex, gridX, gridY);
  };

  // Check game over
  useEffect(() => {
    if (availableBlocks.length === 0 && !gameOver) {
      const newBlocks = generateBlocks();
      setAvailableBlocks(newBlocks);
      let canPlaceAny = false;
      for (const block of newBlocks) {
        for (let y = 0; y < 10; y++) {
          for (let x = 0; x < 10; x++) {
            if (canPlace(block, x, y)) { canPlaceAny = true; break; }
          }
          if (canPlaceAny) break;
        }
        if (canPlaceAny) break;
      }
      if (!canPlaceAny) setGameOver(true);
    }
  }, [availableBlocks, gameOver, generateBlocks]);

  const getBlockCells = (block: Block) => {
    const cells: { x: number; y: number }[] = [];
    block.shape.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell === 1) cells.push({ x: c, y: r });
      });
    });
    return cells;
  };

  // Calculate grid position from screen coordinates
  const screenToGridPos = (screenX: number, screenY: number, block: Block) => {
    const gridEl = gridRef.current;
    if (!gridEl) return null;
    const rect = gridEl.getBoundingClientRect();
    const cellSize = rect.width / 10;
    gridCellSizeRef.current = cellSize;

    // Offset so the block center is under the finger
    const shape = block.shape;
    const halfW = (shape[0].length * cellSize) / 2;
    const halfH = (shape.length * cellSize) / 2;

    const relX = screenX - rect.left - halfW;
    const relY = screenY - rect.top - halfH;

    const col = Math.round(relX / cellSize);
    const row = Math.round(relY / cellSize);

    return { row, col };
  };

  // Drag handlers for mobile
  const handleDragStart = (blockIndex: number, clientX: number, clientY: number) => {
    if (gameOver) return;
    const block = availableBlocks[blockIndex];
    if (!block) return;
    setDraggingBlock(blockIndex);
    setDragPos({ x: clientX, y: clientY });
    setSelectedBlock(null);

    const gridPos = screenToGridPos(clientX, clientY, block);
    setDragGridPos(gridPos);
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (draggingBlock === null) return;
    const block = availableBlocks[draggingBlock];
    if (!block) return;
    setDragPos({ x: clientX, y: clientY });

    const gridPos = screenToGridPos(clientX, clientY, block);
    setDragGridPos(gridPos);
  };

  const handleDragEnd = () => {
    if (draggingBlock !== null && dragGridPos !== null) {
      const block = availableBlocks[draggingBlock];
      if (block && canPlace(block, dragGridPos.col, dragGridPos.row)) {
        doPlaceBlock(draggingBlock, dragGridPos.col, dragGridPos.row);
      }
    }
    setDraggingBlock(null);
    setDragPos(null);
    setDragGridPos(null);
  };

  // Touch events on block items
  const handleBlockTouchStart = (blockIndex: number) => (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleDragStart(blockIndex, touch.clientX, touch.clientY);
  };

  // Global touch move/end
  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (draggingBlock === null) return;
      e.preventDefault();
      const touch = e.touches[0];
      handleDragMove(touch.clientX, touch.clientY);
    };
    const onTouchEnd = () => {
      handleDragEnd();
    };

    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [draggingBlock, dragGridPos, availableBlocks, grid, gameOver]);

  // Mouse drag support (desktop)
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (draggingBlock === null) return;
      handleDragMove(e.clientX, e.clientY);
    };
    const onMouseUp = () => {
      handleDragEnd();
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [draggingBlock, dragGridPos, availableBlocks, grid, gameOver]);

  // Get preview grid cells during drag
  const getPreviewCells = (): Set<string> => {
    if (draggingBlock === null || dragGridPos === null) return new Set();
    const block = availableBlocks[draggingBlock];
    if (!block) return new Set();
    const cells = new Set<string>();
    const valid = canPlace(block, dragGridPos.col, dragGridPos.row);
    if (valid) {
      block.shape.forEach((row, r) => {
        row.forEach((cell, c) => {
          if (cell === 1) cells.add(`${dragGridPos.row + r}-${dragGridPos.col + c}`);
        });
      });
    }
    return cells;
  };

  const previewCells = draggingBlock !== null ? getPreviewCells() : new Set<string>();

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
        <div ref={gridRef} className="grid grid-cols-10 gap-px mb-6 p-2 rounded-lg bg-slate-700">
          {grid.map((row, y) =>
            row.map((cell, x) => {
              const isValidPlacement =
                selectedBlock !== null &&
                availableBlocks[selectedBlock] &&
                canPlace(availableBlocks[selectedBlock], x, y);
              const isPreview = previewCells.has(`${y}-${x}`);

              return (
                <div
                  key={`${y}-${x}`}
                  onClick={() => {
                    if (selectedBlock !== null && isValidPlacement) {
                      handlePlaceBlock(selectedBlock, x, y);
                    }
                  }}
                  className={`aspect-square rounded-sm transition-all ${
                    cell
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                      : isPreview
                        ? 'bg-gradient-to-br from-green-400 to-green-500 opacity-70'
                        : isValidPlacement
                          ? darkMode ? 'bg-slate-600 hover:bg-slate-500' : 'bg-gray-300 hover:bg-gray-400'
                          : darkMode ? 'bg-slate-800' : 'bg-gray-100'
                  }`}
                />
              );
            })
          )}
        </div>

        {/* Available Blocks */}
        <div className="mb-4">
          <p className={`text-sm mb-3 text-center ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            {draggingBlock !== null
              ? 'Drag to place on grid'
              : 'Drag block to grid, or tap to select then tap grid'}
          </p>
          <div className="grid grid-cols-3 gap-4">
            {availableBlocks.map((block, index) => {
              const isSelected = selectedBlock === index;
              const isDragging = draggingBlock === index;

              return (
                <div
                  key={index}
                  onClick={() => !gameOver && !isDragging && setSelectedBlock(isSelected ? null : index)}
                  onTouchStart={handleBlockTouchStart(index)}
                  onMouseDown={() => !gameOver && handleDragStart(index, -1, -1)}
                  className={`aspect-square p-2 rounded-lg cursor-grab transition-all active:cursor-grabbing select-none ${
                    isDragging ? 'opacity-30 scale-90' :
                    gameOver
                      ? 'opacity-50 cursor-not-allowed'
                      : isSelected
                        ? 'ring-4 ring-green-500 scale-105'
                        : 'hover:scale-105'
                  } ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                  style={{ touchAction: 'none' }}
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
                            cell === 1 ? `bg-gradient-to-br ${block.color}` : 'transparent'
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
          className="w-full py-3 rounded-xl font-semibold transition-all bg-green-600 hover:bg-green-500 text-white"
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

      {/* Floating drag preview */}
      {draggingBlock !== null && dragPos && availableBlocks[draggingBlock] && (
        <div
          className="fixed pointer-events-none z-50 opacity-80"
          style={{
            left: dragPos.x - 40,
            top: dragPos.y - 40,
          }}
        >
          <div className="grid gap-0.5" style={{
            gridTemplateColumns: `repeat(${availableBlocks[draggingBlock].shape[0].length}, 32px)`,
            gridTemplateRows: `repeat(${availableBlocks[draggingBlock].shape.length}, 32px)`,
          }}>
            {availableBlocks[draggingBlock].shape.map((row, r) =>
              row.map((cell, c) => (
                <div
                  key={`drag-${r}-${c}`}
                  className={`rounded-sm ${
                    cell === 1 ? `bg-gradient-to-br ${availableBlocks[draggingBlock].color}` : 'transparent'
                  }`}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
