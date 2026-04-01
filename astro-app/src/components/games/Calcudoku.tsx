import React, { useState, useCallback, useEffect } from 'react';

interface Cell {
  value: number;
  cageId: number;
  isGiven: boolean;
}

interface Cage {
  id: number;
  cells: [number, number][];
  target: number;
  operation: '+' | '-' | '*' | '/';
}

const GRID_SIZE = 4;

// Generate a valid Latin square (each row/column has 1-4 exactly once)
const generateLatinSquare = (): number[][] => {
  const grid: number[][] = [];

  // Use a shifted pattern for valid Latin square
  for (let i = 0; i < GRID_SIZE; i++) {
    grid.push([]);
    for (let j = 0; j < GRID_SIZE; j++) {
      grid[i].push(((i + j) % GRID_SIZE) + 1);
    }
  }

  // Shuffle rows to add variety
  for (let i = grid.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [grid[i], grid[j]] = [grid[j], grid[i]];
  }

  return grid;
};

// Calculate cage target based on actual cell values
// Rules: - Subtraction and division ONLY for 2-cell cages
//       - Addition and multiplication for any size cage
const calculateCageTarget = (values: number[], operation: '+' | '-' | '*' | '/'): { target: number; operation: '+' | '-' | '*' | '/' } => {
  if (values.length === 1) {
    return { target: values[0], operation: '+' };
  }

  // For 2-cell cages, allow all operations
  if (values.length === 2) {
    const [a, b] = values;
    const max = Math.max(a, b);
    const min = Math.min(a, b);

    if (operation === '/') {
      // Division: larger / smaller must be exact
      if (max % min === 0) {
        return { target: max / min, operation: '/' };
      }
      // Fallback to addition if not divisible
      return { target: a + b, operation: '+' };
    }

    if (operation === '-') {
      return { target: max - min, operation: '-' };
    }

    if (operation === '*') {
      return { target: a * b, operation: '*' };
    }

    return { target: a + b, operation: '+' };
  }

  // For cages with 3+ cells, only allow addition and multiplication
  if (operation === '*' && values.length >= 3) {
    return { target: values.reduce((a, b) => a * b, 1), operation: '*' };
  }

  // Default to addition for all other cases
  return { target: values.reduce((a, b) => a + b, 0), operation: '+' };
};

const generateCages = (solution: number[][]): Cage[] => {
  const cages: Cage[] = [];
  const usedCells = new Set<string>();
  let cageId = 0;

  // Operations for 2-cell cages
  const twoCellOperations: Array<'+' | '-' | '*' | '/'> = ['+', '-', '*', '/'];
  // Operations for larger cages (only + and *)
  const multiCellOperations: Array<'+' | '*'> = ['+', '*'];

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const key = `${row},${col}`;
      if (usedCells.has(key)) continue;

      const cells: [number, number][] = [[row, col]];
      usedCells.add(key);

      // Randomly decide to add adjacent cell (60% chance for larger cages)
      if (Math.random() > 0.4) {
        const directions = [[0, 1], [1, 0]];
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const newRow = row + dir[0];
        const newCol = col + dir[1];

        if (newRow < GRID_SIZE && newCol < GRID_SIZE) {
          const newKey = `${newRow},${newCol}`;
          if (!usedCells.has(newKey)) {
            cells.push([newRow, newCol]);
            usedCells.add(newKey);
          }
        }
      }

      // Get actual values from solution
      const cellValues = cells.map(([r, c]) => solution[r][c]);

      // Choose appropriate operation based on cage size
      let operation: '+' | '-' | '*' | '/';
      if (cells.length === 2) {
        operation = twoCellOperations[Math.floor(Math.random() * twoCellOperations.length)];
      } else {
        operation = multiCellOperations[Math.floor(Math.random() * multiCellOperations.length)];
      }

      const { target, operation: finalOp } = calculateCageTarget(cellValues, operation);

      cages.push({ id: cageId++, cells, target, operation: finalOp });
    }
  }

  return cages;
};

const createPuzzle = (): { grid: Cell[][], cages: Cage[], solution: number[][] } => {
  // Generate valid solution first
  const solution = generateLatinSquare();

  // Generate cages based on solution
  const cages = generateCages(solution);

  const grid: Cell[][] = [];

  // Create grid from cages
  for (let i = 0; i < GRID_SIZE; i++) {
    grid.push([]);
    for (let j = 0; j < GRID_SIZE; j++) {
      const cage = cages.find(c => c.cells.some(([r, c]) => r === i && c === j));
      grid[i].push({
        value: 0,
        cageId: cage?.id || 0,
        isGiven: Math.random() > 0.75 // 25% chance of being given (fewer hints = more challenging)
      });
    }
  }

  // Fill in some given cells with solution
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (grid[i][j].isGiven) {
        grid[i][j].value = solution[i][j];
      }
    }
  }

  return { grid, cages, solution };
};

export default function Calcudoku() {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [cages, setCages] = useState<Cage[]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [gameWon, setGameWon] = useState(false);
  const [darkMode] = useState(true);

  const initGame = useCallback(() => {
    const { grid: newGrid, cages: newCages } = createPuzzle();
    setGrid(newGrid);
    setCages(newCages);
    setSelectedCell(null);
    setGameWon(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const getCageColor = (cageId: number): string => {
    const colors = [
      'bg-red-100 dark:bg-red-900/30',
      'bg-blue-100 dark:bg-blue-900/30',
      'bg-green-100 dark:bg-green-900/30',
      'bg-yellow-100 dark:bg-yellow-900/30',
      'bg-purple-100 dark:bg-purple-900/30',
      'bg-pink-100 dark:bg-pink-900/30',
      'bg-indigo-100 dark:bg-indigo-900/30',
      'bg-orange-100 dark:bg-orange-900/30',
    ];
    return colors[cageId % colors.length];
  };

  const setCellValue = useCallback((row: number, col: number, value: number) => {
    if (grid[row][col].isGiven) return;

    const newGrid = grid.map((r, i) =>
      r.map((cell, j) => (i === row && j === col ? { ...cell, value } : cell))
    );
    setGrid(newGrid);

    // Check win condition
    const isFull = newGrid.every(r => r.every(c => c.value > 0));
    if (isFull) {
      setGameWon(true);
    }
  }, [grid]);

  const handleCellClick = (row: number, col: number) => {
    setSelectedCell([row, col]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (!selectedCell) return;
    const [row, col] = selectedCell;

    if (e.key >= '1' && e.key <= '4') {
      setCellValue(row, col, parseInt(e.key));
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      setCellValue(row, col, 0);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 ${darkMode ? 'bg-slate-900' : 'bg-gray-100'}`}
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      <div className={`max-w-2xl w-full rounded-2xl shadow-2xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Calcudoku
          </h1>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            Fill the grid so each row/column has unique numbers!
          </p>
        </div>

        {/* Game Grid */}
        <div className="flex justify-center mb-6">
          <div className="inline-block border-2 border-slate-400 rounded-lg overflow-hidden">
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} className="flex">
                {row.map((cell, colIndex) => {
                  const cage = cages.find(c => c.id === cell.cageId);
                  const isFirstInCage = cage && cage.cells[0][0] === rowIndex && cage.cells[0][1] === colIndex;

                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      className={`
                        relative w-16 h-16 border border-slate-300 flex items-center justify-center
                        ${getCageColor(cell.cageId)}
                        ${selectedCell?.[0] === rowIndex && selectedCell?.[1] === colIndex ? 'ring-2 ring-blue-500' : ''}
                        ${!cell.isGiven ? 'cursor-pointer hover:opacity-80' : ''}
                      `}
                    >
                      {isFirstInCage && cage && (
                        <div className={`absolute top-0.5 left-1 text-xs font-bold ${darkMode ? 'text-slate-700' : 'text-gray-700'}`}>
                          {cage.target}{cage.operation}
                        </div>
                      )}
                      {cell.value > 0 && (
                        <span className={`text-2xl font-bold ${darkMode ? 'text-white drop-shadow-[0_2_2px_rgba(0,0,0,0.8)]' : 'text-gray-900'}`}>
                          {cell.value}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Number Pad */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4].map(num => (
            <button
              key={num}
              onClick={() => selectedCell && setCellValue(selectedCell[0], selectedCell[1], num)}
              disabled={!selectedCell}
              className={`w-12 h-12 rounded-lg font-bold text-lg transition-all ${
                darkMode
                  ? 'bg-slate-700 hover:bg-slate-600 text-white disabled:opacity-50'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900 disabled:opacity-50'
              }`}
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => selectedCell && setCellValue(selectedCell[0], selectedCell[1], 0)}
            disabled={!selectedCell}
            className={`w-12 h-12 rounded-lg font-bold text-lg transition-all ${
              darkMode
                ? 'bg-red-600 hover:bg-red-500 text-white disabled:opacity-50'
                : 'bg-red-500 hover:bg-red-400 text-white disabled:opacity-50'
            }`}
          >
            ✕
          </button>
        </div>

        {/* Instructions */}
        <div className={`p-4 rounded-xl mb-4 ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
          <div className={`text-sm font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
            How to Play:
          </div>
          <ul className={`text-sm space-y-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            <li>• Each row and column must contain numbers 1-4 exactly once</li>
            <li>• Cages show target result and operation (+, -, ×, ÷)</li>
            <li>• Numbers in a cage must produce the target result</li>
            <li>• Click cells and use number pad or keyboard (1-4)</li>
          </ul>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={initGame}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              darkMode
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white'
            }`}
          >
            New Game
          </button>
        </div>

        {/* Win Message */}
        {gameWon && (
          <div className={`mt-6 p-6 rounded-xl text-center ${darkMode ? 'bg-green-900/50' : 'bg-green-100'}`}>
            <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              🎉 You Win!
            </h2>
            <p className={`text-lg ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              Great job solving the puzzle!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
