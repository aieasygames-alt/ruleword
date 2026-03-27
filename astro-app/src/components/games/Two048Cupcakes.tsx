import React, { useState, useCallback, useEffect } from 'react';

const GRID_SIZE = 4;
const WIN_VALUE = 2048;

type Grid = (number | null)[][];

type Props = {
  settings?: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }
  onShare?: (data: { score: number; result?: string }) => void
  gameName?: string
}

const ITEMS: Record<number, { name: string; emoji: string; color: string }> = {
  2: { name: 'Vanilla', emoji: '🧁', color: 'from-yellow-200 to-yellow-300' },
  4: { name: 'Chocolate', emoji: '🍩', color: 'from-amber-300 to-amber-400' },
  8: { name: 'Strawberry', emoji: '🍰', color: 'from-pink-300 to-pink-400' },
  16: { name: 'Lemon', emoji: '🍋', color: 'from-yellow-300 to-yellow-400' },
  32: { name: 'Blueberry', emoji: '🫐', color: 'from-blue-300 to-blue-400' },
  64: { name: 'Raspberry', emoji: '🍓', color: 'from-red-300 to-red-400' },
  128: { name: 'Coconut', emoji: '🥥', color: 'from-stone-200 to-stone-300' },
  256: { name: 'Mint', emoji: '🍃', color: 'from-green-300 to-green-400' },
  512: { name: 'Peach', emoji: '🍑', color: 'from-orange-300 to-orange-400' },
  1024: { name: 'Cherry', emoji: '🍒', color: 'from-red-400 to-red-500' },
  2048: { name: 'Rainbow', emoji: '🌈', color: 'from-purple-400 via-pink-400 to-blue-400' },
  4096: { name: 'Golden', emoji: '⭐', color: 'from-yellow-400 to-amber-500' },
};

const createEmptyGrid = (): Grid => {
  return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
};

const addRandomTile = (grid: Grid): Grid => {
  const emptyCells: [number, number][] = [];
  grid.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell === null) emptyCells.push([i, j]);
    });
  });

  if (emptyCells.length === 0) return grid;

  const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const newGrid = grid.map(r => [...r]);
  newGrid[row][col] = Math.random() < 0.9 ? 2 : 4;
  return newGrid;
};

const slideRow = (row: (number | null)[]): (number | null)[] => {
  let filtered = row.filter(x => x !== null);
  let merged: (number | null)[] = [];
  let skip = false;

  for (let i = 0; i < filtered.length; i++) {
    if (skip) {
      skip = false;
      continue;
    }
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      merged.push(filtered[i]! * 2);
      skip = true;
    } else {
      merged.push(filtered[i]);
    }
  }

  while (merged.length < GRID_SIZE) {
    merged.push(null);
  }

  return merged;
};

const moveGrid = (grid: Grid, direction: 'up' | 'down' | 'left' | 'right'): Grid => {
  const newGrid = grid.map(row => [...row]);

  if (direction === 'left') {
    for (let i = 0; i < GRID_SIZE; i++) {
      newGrid[i] = slideRow(newGrid[i]);
    }
  } else if (direction === 'right') {
    for (let i = 0; i < GRID_SIZE; i++) {
      newGrid[i] = slideRow(newGrid[i].reverse()).reverse();
    }
  } else if (direction === 'up') {
    for (let j = 0; j < GRID_SIZE; j++) {
      const col = newGrid.map(row => row[j]);
      const newCol = slideRow(col);
      for (let i = 0; i < GRID_SIZE; i++) {
        newGrid[i][j] = newCol[i];
      }
    }
  } else if (direction === 'down') {
    for (let j = 0; j < GRID_SIZE; j++) {
      const col = newGrid.map(row => row[j]);
      const newCol = slideRow(col.reverse()).reverse();
      for (let i = 0; i < GRID_SIZE; i++) {
        newGrid[i][j] = newCol[i];
      }
    }
  }

  return newGrid;
};

const isGameOver = (grid: Grid): boolean => {
  // Check for empty cells
  if (grid.some(row => row.some(cell => cell === null))) return false;

  // Check for possible merges
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      const val = grid[i][j];
      if (i < GRID_SIZE - 1 && grid[i + 1][j] === val) return false;
      if (j < GRID_SIZE - 1 && grid[i][j + 1] === val) return false;
    }
  }

  return true;
};

const getScore = (grid: Grid): number => {
  return grid.flat().filter((x): x is number => x !== null).reduce((sum, x) => sum + x, 0);
};

export default function Two048Cupcakes({ settings = { darkMode: true, soundEnabled: true, language: 'en' }, onShare, gameName = '2048 Cupcakes' }: Props) {
  const [grid, setGrid] = useState<Grid>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const darkMode = settings.darkMode;

  const initGame = useCallback(() => {
    let newGrid = createEmptyGrid();
    newGrid = addRandomTile(newGrid);
    newGrid = addRandomTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
    setGameWon(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver || gameWon) return;

    const newGrid = moveGrid(grid, direction);

    // Check if grid changed
    const changed = JSON.stringify(grid) !== JSON.stringify(newGrid);
    if (!changed) return;

    const updatedGrid = addRandomTile(newGrid);
    setGrid(updatedGrid);
    setScore(getScore(updatedGrid));

    // Check win condition
    if (updatedGrid.some(row => row.some(cell => cell === WIN_VALUE))) {
      setGameWon(true);
    }

    // Check game over
    if (isGameOver(updatedGrid)) {
      setGameOver(true);
    }
  }, [grid, gameOver, gameWon]);

  // Handle share
  const handleShare = () => {
    if (onShare) {
      // Find highest cupcake achieved
      let maxTile = 0;
      grid.forEach(row => {
        row.forEach(cell => {
          if (cell && cell > maxTile) {
            maxTile = cell;
          }
        });
      });

      const highestCupcake = ITEMS[maxTile] || ITEMS[2];

      onShare({
        score,
        result: `🧁 2048 Cupcakes\n🏆 Score: ${score}\n🎯 Highest: ${highestCupcake.emoji} ${highestCupcake.name} (${maxTile})`
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        e.preventDefault();
        move('up');
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        move('down');
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        move('left');
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        move('right');
        break;
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 ${darkMode ? 'bg-slate-900' : 'bg-gray-100'}`}
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      <div className={`max-w-md w-full rounded-2xl shadow-2xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              2048 Cupcakes
            </h1>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              Combine cupcakes to reach Rainbow!
            </p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
              {score}
            </div>
            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Score</div>
          </div>
        </div>

        {/* Game Grid */}
        <div className="mb-6">
          <div className={`grid grid-cols-4 gap-2 p-3 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const item = cell !== null ? ITEMS[cell] || ITEMS[2] : null;
                const displayValue = cell && cell > 4096 ? 4096 : cell;

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`
                      aspect-square rounded-lg flex flex-col items-center justify-center
                      transition-all duration-150
                      ${item
                        ? `bg-gradient-to-br ${item.color} shadow-lg`
                        : darkMode ? 'bg-slate-600' : 'bg-gray-300'}
                    `}
                  >
                    {cell !== null && (
                      <>
                        <span className="text-2xl">{item?.emoji}</span>
                        <span className={`text-sm font-bold ${darkMode ? 'text-slate-800' : 'text-gray-900'}`}>
                          {displayValue}
                        </span>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
            <div></div>
            <button
              onClick={() => move('up')}
              className={`p-4 rounded-lg font-bold ${
                darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              ↑
            </button>
            <div></div>
            <button
              onClick={() => move('left')}
              className={`p-4 rounded-lg font-bold ${
                darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              ←
            </button>
            <button
              onClick={() => move('down')}
              className={`p-4 rounded-lg font-bold ${
                darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              ↓
            </button>
            <button
              onClick={() => move('right')}
              className={`p-4 rounded-lg font-bold ${
                darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              →
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className={`p-4 rounded-xl mb-4 ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
          <div className={`text-sm font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
            How to Play:
          </div>
          <ul className={`text-sm space-y-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            <li>• Use Arrow Keys, WASD, or buttons to move cupcakes</li>
            <li>• Same cupcakes merge when they collide</li>
            <li>• Reach the Rainbow (2048) to win!</li>
          </ul>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={initGame}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              darkMode
                ? 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white'
                : 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white'
            }`}
          >
            New Game
          </button>
        </div>

        {/* Game Over Message */}
        {gameOver && (
          <div className={`mt-6 p-6 rounded-xl text-center ${darkMode ? 'bg-red-900/50' : 'bg-red-100'}`}>
            <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
              Game Over
            </h2>
            <p className={`text-lg ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              Final Score: {score}
            </p>
            <button onClick={handleShare} className={`mt-4 px-6 py-2 rounded-lg font-medium ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'} ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              📢 Share Score
            </button>
          </div>
        )}

        {gameWon && (
          <div className={`mt-6 p-6 rounded-xl text-center ${darkMode ? 'bg-green-900/50' : 'bg-green-100'}`}>
            <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              🎉 You Win!
            </h2>
            <p className={`text-lg ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              You reached the Rainbow! Score: {score}
            </p>
            <button onClick={handleShare} className={`mt-4 px-6 py-2 rounded-lg font-medium ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'} ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              📢 Share Score
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
