import React, { useState, useCallback } from 'react';

type Cell = number | null;

const GRID_SIZE = 5;

// Generate a valid Kakurasu puzzle
// In Kakurasu, row clues = sum of (col_index + 1) for all selected cells in that row
// Column clues = sum of (row_index + 1) for all selected cells in that column
function generatePuzzle(): {
  solution: boolean[][],
  rowClues: number[],
  colClues: number[]
} {
  // Generate a random solution first
  const solution: boolean[][] = Array(GRID_SIZE).fill(null).map(() =>
    Array(GRID_SIZE).fill(false)
  );

  // Randomly select some cells (about 40-60% filled)
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      solution[row][col] = Math.random() > 0.5;
    }
  }

  // Calculate row clues: sum of (col + 1) for each selected cell
  const rowClues = solution.map(row => {
    let sum = 0;
    row.forEach((selected, col) => {
      if (selected) sum += col + 1;
    });
    return sum;
  });

  // Calculate column clues: sum of (row + 1) for each selected cell
  const colClues = Array(GRID_SIZE).fill(0);
  for (let col = 0; col < GRID_SIZE; col++) {
    let sum = 0;
    for (let row = 0; row < GRID_SIZE; row++) {
      if (solution[row][col]) sum += row + 1;
    }
    colClues[col] = sum;
  }

  return { solution, rowClues, colClues };
}

type Props = {
  settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }
}

export default function Kakurasu({ settings }: Props) {
  const [puzzleData, setPuzzleData] = useState(() => generatePuzzle());
  const [grid, setGrid] = useState<Cell[][]>(() =>
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null))
  );
  const [gameWon, setGameWon] = useState(false);

  const isDark = settings.darkMode;
  const isZh = settings.language === 'zh';

  const initGame = useCallback(() => {
    const newData = generatePuzzle();
    setPuzzleData(newData);
    setGrid(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
    setGameWon(false);
  }, []);

  // Calculate current row and column sums
  const getCurrentRowSums = useCallback((g: Cell[][]) => {
    return g.map(row => {
      let sum = 0;
      row.forEach((cell, col) => {
        if (cell === 1) sum += col + 1;
      });
      return sum;
    });
  }, []);

  const getCurrentColSums = useCallback((g: Cell[][]) => {
    const sums = Array(GRID_SIZE).fill(0);
    for (let col = 0; col < GRID_SIZE; col++) {
      let sum = 0;
      for (let row = 0; row < GRID_SIZE; row++) {
        if (g[row][col] === 1) sum += row + 1;
      }
      sums[col] = sum;
    }
    return sums;
  }, []);

  const checkWin = useCallback((g: Cell[][]) => {
    const rowSums = getCurrentRowSums(g);
    const colSums = getCurrentColSums(g);

    // Check if all row sums match
    for (let i = 0; i < GRID_SIZE; i++) {
      if (rowSums[i] !== puzzleData.rowClues[i]) return false;
    }

    // Check if all column sums match
    for (let i = 0; i < GRID_SIZE; i++) {
      if (colSums[i] !== puzzleData.colClues[i]) return false;
    }

    return true;
  }, [puzzleData, getCurrentRowSums, getCurrentColSums]);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameWon) return;

    const newGrid = grid.map(r => [...r]);
    // Cycle through: null -> 1 (selected) -> null (deselected)
    newGrid[row][col] = newGrid[row][col] === null ? 1 : null;
    setGrid(newGrid);

    if (checkWin(newGrid)) {
      setGameWon(true);
    }
  }, [grid, gameWon, checkWin]);

  const currentRowSums = getCurrentRowSums(grid);
  const currentColSums = getCurrentColSums(grid);

  // Column weights (1, 2, 3, 4, 5)
  const colWeights = Array.from({ length: GRID_SIZE }, (_, i) => i + 1);
  // Row weights (1, 2, 3, 4, 5)
  const rowWeights = Array.from({ length: GRID_SIZE }, (_, i) => i + 1);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <div className={`max-w-lg w-full rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {isZh ? '数和' : 'Kakurasu'}
        </h1>
        <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
          {isZh ? '点击格子使行/列和等于提示数字' : 'Click cells so row/column sums match the clues'}
        </p>

        {/* Game grid with clues */}
        <div className="mb-4">
          {/* Column weights and clues */}
          <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: `40px 40px repeat(${GRID_SIZE}, minmax(0, 1fr))` }}>
            <div></div>
            <div></div>
            {colWeights.map((w, i) => (
              <div key={i} className={`text-center text-xs font-medium ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                {w}
              </div>
            ))}
          </div>

          <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: `40px 40px repeat(${GRID_SIZE}, minmax(0, 1fr))` }}>
            <div></div>
            <div></div>
            {puzzleData.colClues.map((clue, i) => {
              const isMatch = currentColSums[i] === clue;
              return (
                <div
                  key={i}
                  className={`text-center font-bold py-1 rounded text-sm ${
                    isMatch
                      ? 'bg-green-500 text-white'
                      : isDark ? 'bg-slate-700 text-blue-400' : 'bg-gray-200 text-blue-600'
                  }`}
                >
                  {clue}
                </div>
              );
            })}
          </div>

          {/* Rows with weights, clues, and cells */}
          {grid.map((row, y) => (
            <div key={y} className="grid gap-1 mb-1" style={{ gridTemplateColumns: `40px 40px repeat(${GRID_SIZE}, minmax(0, 1fr))` }}>
              {/* Row weight */}
              <div className={`text-center text-xs font-medium flex items-center justify-center ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                {rowWeights[y]}
              </div>
              {/* Row clue */}
              <div className={`text-center font-bold flex items-center justify-center rounded ${
                currentRowSums[y] === puzzleData.rowClues[y]
                  ? 'bg-green-500 text-white'
                  : isDark ? 'bg-slate-700 text-green-400' : 'bg-gray-200 text-green-600'
              }`}>
                {puzzleData.rowClues[y]}
              </div>
              {/* Cells */}
              {row.map((cell, x) => (
                <button
                  key={x}
                  onClick={() => handleCellClick(y, x)}
                  className={`aspect-square rounded flex items-center justify-center font-bold transition-all ${
                    cell
                      ? 'bg-blue-500 text-white'
                      : isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {cell ? '✓' : ''}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Current sums display */}
        <div className={`mb-4 p-3 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`}>
          <div className="text-sm font-medium mb-2">
            <span className={isDark ? 'text-slate-300' : 'text-gray-700'}>
              {isZh ? '当前和' : 'Current Sums'}:
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>Rows: </span>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>
                {currentRowSums.join(', ')}
              </span>
            </div>
            <div>
              <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>Cols: </span>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>
                {currentColSums.join(', ')}
              </span>
            </div>
          </div>
        </div>

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
              🎉 {isZh ? '正确！' : 'Correct!'}
            </h2>
            <p className={`text-lg mb-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              {isZh ? '你解开了这个谜题！' : 'You solved the puzzle!'}
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
