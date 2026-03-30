import React, { useState, useCallback, useEffect } from 'react';

type Cell = number | null;

interface HidatoProps {
  settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }
}

// Generate a valid Hidato puzzle using backtracking
function generatePuzzle(size: number): { grid: Cell[][], solution: number[][] } {
  const solution: number[][] = Array(size).fill(null).map(() => Array(size).fill(0));

  // All 8 directions for adjacency
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],          [0, 1],
    [1, -1],  [1, 0], [1, 1]
  ];

  // Check if position is valid
  const isValid = (r: number, c: number): boolean => {
    return r >= 0 && r < size && c >= 0 && c < size;
  };

  // Get all empty neighbors
  const getEmptyNeighbors = (r: number, c: number): [number, number][] => {
    const neighbors: [number, number][] = [];
    for (const [dr, dc] of directions) {
      const nr = r + dr, nc = c + dc;
      if (isValid(nr, nc) && solution[nr][nc] === 0) {
        neighbors.push([nr, nc]);
      }
    }
    return neighbors;
  };

  // Get all neighbors (including filled)
  const getNeighbors = (r: number, c: number): [number, number][] => {
    const neighbors: [number, number][] = [];
    for (const [dr, dc] of directions) {
      const nr = r + dr, nc = c + dc;
      if (isValid(nr, nc)) {
        neighbors.push([nr, nc]);
      }
    }
    return neighbors;
  };

  // Shuffle array
  const shuffle = <T,>(arr: T[]): T[] => {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  // Backtracking to fill the grid
  const solve = (num: number, r: number, c: number): boolean => {
    solution[r][c] = num;

    if (num === size * size) {
      return true; // All cells filled
    }

    // Get empty neighbors and shuffle for randomness
    const neighbors = shuffle(getEmptyNeighbors(r, c));

    for (const [nr, nc] of neighbors) {
      if (solve(num + 1, nr, nc)) {
        return true;
      }
    }

    // Backtrack
    solution[r][c] = 0;
    return false;
  };

  // Try multiple starting positions until we find a solution
  let found = false;
  const starts = shuffle(
    Array.from({ length: size * size }, (_, i) =>
      [Math.floor(i / size), i % size] as [number, number]
    )
  );

  for (const [sr, sc] of starts) {
    // Reset solution
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        solution[r][c] = 0;
      }
    }
    if (solve(1, sr, sc)) {
      found = true;
      break;
    }
  }

  if (!found) {
    // Fallback: create a simple spiral pattern
    let num = 1;
    let r = 0, c = 0;
    let dir = 0;
    const dirOrder = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    const visited = new Set<string>();

    while (num <= size * size) {
      solution[r][c] = num++;
      visited.add(`${r},${c}`);

      const [dr, dc] = dirOrder[dir];
      const nr = r + dr, nc = c + dc;

      if (!isValid(nr, nc) || visited.has(`${nr},${nc}`)) {
        dir = (dir + 1) % 4;
        const [ndr, ndc] = dirOrder[dir];
        r += ndr;
        c += ndc;
      } else {
        r = nr;
        c = nc;
      }
    }
  }

  // Create puzzle by keeping some numbers as hints (about 30-40%)
  const grid: Cell[][] = Array(size).fill(null).map(() => Array(size).fill(null));
  const total = size * size;
  const hintCount = Math.floor(total * 0.35);

  // Always show 1 and the last number
  const hintsToShow = new Set([1, total]);

  // Randomly select other hints
  while (hintsToShow.size < hintCount + 2) {
    hintsToShow.add(Math.floor(Math.random() * (total - 2)) + 2);
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (hintsToShow.has(solution[r][c])) {
        grid[r][c] = solution[r][c];
      }
    }
  }

  return { grid, solution };
}

// Check if a move is valid
const isValidMove = (
  grid: Cell[][],
  row: number,
  col: number,
  value: number,
  size: number
): boolean => {
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],          [0, 1],
    [1, -1],  [1, 0], [1, 1]
  ];

  const isValid = (r: number, c: number): boolean =>
    r >= 0 && r < size && c >= 0 && c < size;

  // Check if previous number exists and is adjacent
  if (value > 1) {
    let hasPrev = false;
    for (const [dr, dc] of directions) {
      const nr = row + dr, nc = col + dc;
      if (isValid(nr, nc) && grid[nr][nc] === value - 1) {
        hasPrev = true;
        break;
      }
    }
    // If previous number is in grid but not adjacent, invalid
    let prevInGrid = false;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] === value - 1) {
          prevInGrid = true;
          break;
        }
      }
      if (prevInGrid) break;
    }
    if (prevInGrid && !hasPrev) return false;
  }

  // Check if next number exists and is adjacent
  if (value < size * size) {
    let hasNext = false;
    for (const [dr, dc] of directions) {
      const nr = row + dr, nc = col + dc;
      if (isValid(nr, nc) && grid[nr][nc] === value + 1) {
        hasNext = true;
        break;
      }
    }
    // If next number is in grid but not adjacent, invalid
    let nextInGrid = false;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] === value + 1) {
          nextInGrid = true;
          break;
        }
      }
      if (nextInGrid) break;
    }
    if (nextInGrid && !hasNext) return false;
  }

  return true;
};

export default function Hidato({ settings }: HidatoProps) {
  const size = 5;
  const [puzzleData, setPuzzleData] = useState(() => generatePuzzle(size));
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [gameWon, setGameWon] = useState(false);

  const isDark = settings.darkMode;
  const isZh = settings.language === 'zh';

  const initGame = useCallback(() => {
    const newData = generatePuzzle(size);
    setPuzzleData(newData);
    setGrid(newData.grid.map(row => [...row]));
    setCurrentNumber(1);
    setGameWon(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Find the next number to place (smallest gap)
  const findNextNumber = useCallback((): number => {
    const placed = new Set<number>();
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] !== null) {
          placed.add(grid[r][c]!);
        }
      }
    }

    for (let n = 1; n <= size * size; n++) {
      if (!placed.has(n)) {
        return n;
      }
    }
    return size * size;
  }, [grid]);

  // Update current number when grid changes
  useEffect(() => {
    if (!gameWon) {
      setCurrentNumber(findNextNumber());
    }
  }, [grid, gameWon, findNextNumber]);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameWon) return;

    // Can't modify hint cells
    if (puzzleData.grid[row][col] !== null) return;

    const cell = grid[row][col];

    // If already filled, allow clearing
    if (cell !== null) {
      const newGrid = grid.map(r => [...r]);
      newGrid[row][col] = null;
      setGrid(newGrid);
      return;
    }

    // Try to place current number
    if (isValidMove(grid, row, col, currentNumber, size)) {
      const newGrid = grid.map(r => [...r]);
      newGrid[row][col] = currentNumber;
      setGrid(newGrid);

      // Check if complete
      let complete = true;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (newGrid[r][c] === null) {
            complete = false;
            break;
          }
        }
        if (!complete) break;
      }

      if (complete) {
        setGameWon(true);
      }
    }
  }, [grid, currentNumber, size, gameWon, puzzleData.grid]);

  const handleRightClick = useCallback((e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    if (gameWon) return;
    if (puzzleData.grid[row][col] !== null) return; // Can't clear hints

    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = null;
    setGrid(newGrid);
  }, [grid, gameWon, puzzleData.grid]);

  const getCellClass = (value: Cell, row: number, col: number, isHint: boolean): string => {
    const base = 'aspect-square flex items-center justify-center font-bold rounded-lg transition-all cursor-pointer text-sm sm:text-base ';

    if (isHint) {
      return base + 'bg-amber-500 text-white';
    }
    if (value === null) {
      return base + (isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300');
    }
    if (value === currentNumber) {
      return base + 'bg-green-500 text-white ring-2 ring-green-300';
    }
    return base + 'bg-blue-500 text-white';
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <div className={`max-w-md w-full rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Hidato
            </h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              {isZh ? '连接连续数字（包括对角线）' : 'Connect consecutive numbers (including diagonals)'}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              {currentNumber}
            </div>
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              {isZh ? '下一个' : 'Next'}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          {(() => {
            const filled = grid.flat().filter(c => c !== null).length;
            const progress = (filled / (size * size)) * 100;
            return (
              <>
                <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className={`text-center mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  {filled}/{size * size}
                </div>
              </>
            );
          })()}
        </div>

        {/* Game Grid */}
        <div className="grid gap-1.5 mb-4" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
          {grid.map((row, y) =>
            row.map((cell, x) => {
              const isHint = puzzleData.grid[y][x] !== null;
              return (
                <div
                  key={`${y}-${x}`}
                  onClick={() => handleCellClick(y, x)}
                  onContextMenu={(e) => handleRightClick(e, y, x)}
                  className={getCellClass(cell, y, x, isHint)}
                >
                  {cell || ''}
                </div>
              );
            })
          )}
        </div>

        {/* Number selector */}
        <div className="mb-4">
          <div className={`text-sm mb-2 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            {isZh ? '选择数字：' : 'Select number:'}
          </div>
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: Math.min(15, size * size) }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => setCurrentNumber(num)}
                className={`w-7 h-7 rounded text-sm font-medium transition-all ${
                  currentNumber === num
                    ? 'bg-blue-500 text-white'
                    : isDark
                      ? 'bg-slate-700 hover:bg-slate-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {num}
              </button>
            ))}
            {size * size > 15 && (
              <span className={`w-7 h-7 flex items-center justify-center text-sm ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                ...
              </span>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className={`p-3 rounded-xl mb-4 text-sm ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-700'}`}>
          <p>{isZh ? '点击空格放置数字，右键清除' : 'Click empty cells to place numbers, right-click to clear'}</p>
          <p className="mt-1">{isZh ? '黄色数字是提示，不能修改' : 'Yellow numbers are hints and cannot be changed'}</p>
        </div>

        {/* Controls */}
        <button
          onClick={initGame}
          className="w-full py-3 rounded-xl font-semibold transition-all bg-blue-600 hover:bg-blue-500 text-white"
        >
          {isZh ? '新游戏' : 'New Game'}
        </button>

        {/* Win Message */}
        {gameWon && (
          <div className={`mt-6 p-6 rounded-xl text-center ${isDark ? 'bg-green-900/50' : 'bg-green-100'}`}>
            <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
              🎉 {isZh ? '完成！' : 'Complete!'}
            </h2>
            <p className={`text-lg mb-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              {isZh ? '你解开了 Hidato 谜题！' : 'You solved the Hidato puzzle!'}
            </p>
            <button
              onClick={initGame}
              className="px-6 py-3 rounded-xl font-semibold bg-green-600 hover:bg-green-500 text-white"
            >
              {isZh ? '再来一次' : 'Play Again'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
