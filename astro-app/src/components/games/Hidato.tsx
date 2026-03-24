import React, { useState, useCallback, useEffect } from 'react';

type Cell = number | null;

interface HidatoProps {
  size?: number;
}

const generatePuzzle = (size: number): { grid: Cell[][], solution: number[][] } => {
  // Simple Hidato puzzle generator
  const grid: Cell[][] = Array(size).fill(null).map(() => Array(size).fill(null));
  const solution: number[][] = Array(size).fill(null).map(() => Array(size).fill(0));

  // Create a valid Hidato puzzle
  const total = size * size;
  const sequence = Array.from({ length: total }, (_, i) => i + 1);

  // Simple pattern - snake fill
  let index = 0;
  for (let y = 0; y < size; y++) {
    if (y % 2 === 0) {
      for (let x = 0; x < size; x++) {
        solution[y][x] = sequence[index++];
      }
    } else {
      for (let x = size - 1; x >= 0; x--) {
        solution[y][x] = sequence[index++];
      }
    }
  }

  // Copy some cells as hints
  const hintCount = Math.floor(total * 0.4);
  const hints = new Set<number>();
  while (hints.size < hintCount) {
    hints.add(Math.floor(Math.random() * total) + 1);
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (hints.has(solution[y][x])) {
        grid[y][x] = solution[y][x];
      }
    }
  }

  return { grid, solution };
};

const isValidMove = (grid: Cell[][], row: number, col: number, value: number, size: number): boolean => {
  // Check if placing value is valid (adjacent to value-1 and will have value+1 adjacent)
  const hasNeighbor = (target: number): boolean => {
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    for (const [dr, dc] of dirs) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
        if (grid[nr][nc] === target) return true;
      }
    }
    return false;
  };

  // Must be adjacent to value-1 (if it exists and is placed)
  if (value > 1 && !hasNeighbor(value - 1)) {
    // Check if value-1 exists anywhere in grid
    let prevExists = false;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (grid[y][x] === value - 1) prevExists = true;
      }
    }
    if (prevExists && !hasNeighbor(value - 1)) return false;
  }

  return true;
};

export default function Hidato({ size = 6 }: HidatoProps) {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [gameWon, setGameWon] = useState(false);
  const [darkMode] = useState(true);

  const initGame = useCallback(() => {
    const { grid: newGrid, solution: newSolution } = generatePuzzle(size);
    setGrid(newGrid);
    setSolution(newSolution);
    setCurrentNumber(1);
    setGameWon(false);
    setSelectedCell(null);
  }, [size]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const findNextNumber = useCallback(() => {
    for (let num = currentNumber + 1; num <= size * size; num++) {
      let found = false;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          if (grid[y][x] === num) {
            setCurrentNumber(num);
            return num;
          }
        }
      }
      if (found) break;
    }
    return currentNumber;
  }, [currentNumber, grid, size]);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameWon || grid[row][col] !== null) return;

    if (isValidMove(grid, row, col, currentNumber, size)) {
      const newGrid = grid.map(r => [...r]);
      newGrid[row][col] = currentNumber;
      setGrid(newGrid);

      // Move to next number
      if (currentNumber === size * size) {
        setGameWon(true);
      } else {
        const nextNum = currentNumber + 1;
        setCurrentNumber(nextNum);
      }
    }
  }, [grid, currentNumber, size, gameWon]);

  const handleRightClick = useCallback((e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    if (gameWon) return;

    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = null;
    setGrid(newGrid);

    // Update current number to max placed + 1
    let maxPlaced = 0;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (newGrid[y][x] && newGrid[y][x]! > maxPlaced) {
          maxPlaced = newGrid[y][x]!;
        }
      }
    }
    setCurrentNumber(maxPlaced + 1);
    setGameWon(false);
  }, [grid, size, gameWon]);

  const getCellClass = (value: Cell, row: number, col: number): string => {
    const base = 'aspect-square flex items-center justify-center font-bold rounded-lg transition-all cursor-pointer ';
    if (value === null) {
      return base + (darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900');
    }
    if (value === currentNumber) {
      return base + 'bg-green-500 text-white ring-4 ring-green-300 scale-110';
    }
    if (value < currentNumber) {
      return base + 'bg-slate-600 text-slate-400';
    }
    return base + (darkMode ? 'bg-blue-500 text-white' : 'bg-blue-500 text-white');
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${darkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <div className={`max-w-lg w-full rounded-2xl shadow-2xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Hidato
            </h1>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              Fill in consecutive numbers connecting horizontally, vertically, or diagonally
            </p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {currentNumber}/{size * size}
            </div>
            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Next</div>
          </div>
        </div>

        {/* Game Grid */}
        <div className="grid gap-2 mb-6" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
          {grid.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${y}-${x}`}
                onClick={() => handleCellClick(y, x)}
                onContextMenu={(e) => handleRightClick(e, y, x)}
                className={getCellClass(cell, y, x)}
              >
                {cell || ''}
              </div>
            ))
          )}
        </div>

        {/* Instructions */}
        <div className={`p-4 rounded-xl mb-4 ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
          <div className={`text-sm font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
            How to Play:
          </div>
          <ul className={`text-sm space-y-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            <li>• Click empty cells to place the next number</li>
            <li>• Numbers must connect consecutively (horizontally, vertically, or diagonally)</li>
            <li>• Right-click to remove a number</li>
            <li>• Fill all cells with numbers 1-{size * size}</li>
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
              🎉 Complete!
            </h2>
            <p className={`text-lg mb-4 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              You solved the Hidato puzzle!
            </p>
            <button
              onClick={initGame}
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
