import React, { useState } from 'react';

export default function BlockPuzzle() {
  const [grid, setGrid] = useState<(number | null)[][]>(() => Array(8).fill(null).map(() => Array(8).fill(null)));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [darkMode] = useState(true);

  const SHAPES = [
    [1, 0, 0, 0],
    [1, 1, 0, 0],
    [2, 0, 0, 0],
    [2, 1, 1, 0],
    [2, 1, 0, 1],
    [2, 0, 1, 1],
    [3, 0, 0, 0, 0],
    [3, 0, 0, 1, 1],
    [3, 0, 1, 1, 0],
    [3, 0, 1, 0, 1],
    [4, 0, 0, 0, 0],
  ];

  const canPlace = (shape: number[], x: number, y: number): boolean => {
    for (let r = 0; r < shape[0]; r++) {
      for (let c = 0; c < shape[1]; c++) {
        if (shape[r + 2] && shape[r + 2][c]) continue;
        if (y + r >= 8 || x + c >= 8) return false;
        if (grid[y + r][x + c] !== null) return false;
      }
    }
    return true;
  };

  const placeShape = (shapeIndex: number) => {
    if (gameOver) return;

    const shape = SHAPES[shapeIndex];
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (canPlace(shape, x, y)) {
          // Place and clear lines
          const newGrid = grid.map(row => [...row]);

          for (let r = 0; r < shape[0]; r++) {
            for (let c = 0; c < shape[1]; c++) {
              if (shape[r + 2] && shape[r + 2][c]) continue;
              newGrid[y + r][x + c] = 1;
            }
          }

          // Check and clear lines
          let linesCleared = 0;
          for (let row = 7; row >= 0; row--) {
            if (newGrid[row].every(cell => cell !== null)) {
              newGrid.splice(row, 1);
              newGrid.unshift(Array(8).fill(null));
              linesCleared++;
            }
          }

          setGrid(newGrid);
          setScore(s => s + linesCleared * 10);

          // Check game over
          if (newGrid[0].some(c => c !== null)) {
            setGameOver(true);
          }
          return;
        }
      }
    }
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

        <div className="grid grid-cols-8 gap-1 mb-6">
          {grid.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${y}-${x}`}
                className={`aspect-square rounded ${cell ? (darkMode ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gradient-to-br from-purple-500 to-pink-500') : (darkMode ? 'bg-slate-700' : 'bg-gray-200')}`}
              />
            ))
          )}
        </div>

        <div className="grid grid-cols-5 gap-2 mb-4">
          {SHAPES.map((_, i) => (
            <button
              key={i}
              onClick={() => placeShape(i)}
              disabled={gameOver}
              className={`py-3 rounded-lg font-semibold text-sm transition-all ${
                gameOver
                  ? 'bg-slate-600 cursor-not-allowed'
                  : darkMode
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setGrid(Array(8).fill(null).map(() => Array(8).fill(null)));
            setScore(0);
            setGameOver(false);
          }}
          className={`w-full py-3 rounded-xl font-semibold transition-all ${darkMode ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-green-600 hover:bg-green-500 text-white'}`}
        >
          New Game
        </button>

        {gameOver && (
          <div className={`mt-4 p-4 rounded-xl text-center ${darkMode ? 'bg-red-900/50' : 'bg-red-100'}`}>
            <p className={`font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>Game Over! Score: {score}</p>
          </div>
        )}
      </div>
    </div>
  );
}
