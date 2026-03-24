import React, { useState, useCallback, useEffect } from 'react';

type Cell = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
};

const GRID_SIZE = 10;
const MINE_COUNT = 15;

export default function MinesweeperFlags() {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [flags, setFlags] = useState(MINE_COUNT);
  const [score, setScore] = useState(0);
  const [darkMode] = useState(true);

  const initGame = useCallback(() => {
    const newGrid: Cell[][] = [];
    const mines = new Set<string>();

    // Place mines randomly
    while (mines.size < MINE_COUNT) {
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);
      mines.add(`${x},${y}`);
    }

    // Create grid
    for (let y = 0; y < GRID_SIZE; y++) {
      const row: Cell[] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        const isMine = mines.has(`${x},${y}`);
        let neighborMines = 0;

        if (!isMine) {
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
                if (mines.has(`${nx},${ny}`)) neighborMines++;
              }
            }
          }
        }

        row.push({
          isMine,
          isRevealed: false,
          isFlagged: false,
          neighborMines
        });
      }
      newGrid.push(row);
    }

    setGrid(newGrid);
    setGameOver(false);
    setGameWon(false);
    setFlags(MINE_COUNT);
    setScore(0);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const revealCell = useCallback((x: number, y: number) => {
    if (gameOver || gameWon || grid[y][x].isRevealed || grid[y][x].isFlagged) return;

    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));

    const reveal = (cx: number, cy: number) => {
      if (cx < 0 || cx >= GRID_SIZE || cy < 0 || cy >= GRID_SIZE) return;
      if (newGrid[cy][cx].isRevealed || newGrid[cy][cx].isFlagged) return;

      newGrid[cy][cx].isRevealed = true;

      if (newGrid[cy][cx].isMine) {
        setGameOver(true);
        // Reveal all mines
        for (let y = 0; y < GRID_SIZE; y++) {
          for (let x = 0; x < GRID_SIZE; x++) {
            if (newGrid[y][x].isMine) {
              newGrid[y][x].isRevealed = true;
            }
          }
        }
        return;
      }

      // Auto-reveal adjacent cells if no neighbor mines
      if (newGrid[cy][cx].neighborMines === 0) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            reveal(cx + dx, cy + dy);
          }
        }
      }
    };

    reveal(x, y);
    setGrid(newGrid);
    setScore(s => s + 1);
  }, [grid, gameOver, gameWon]);

  const toggleFlag = useCallback((e: React.MouseEvent, x: number, y: number) => {
    e.preventDefault();
    if (gameOver || gameWon || grid[y][x].isRevealed) return;

    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    newGrid[y][x].isFlagged = !newGrid[y][x].isFlagged;
    setGrid(newGrid);
    setFlags(f => newGrid[y][x].isFlagged ? f - 1 : f + 1);
  }, [grid, gameOver, gameWon]);

  const getCellClass = (cell: Cell): string => {
    if (cell.isRevealed) {
      if (cell.isMine) {
        return 'bg-red-500';
      }
      if (cell.neighborMines === 0) {
        return 'bg-slate-300';
      }
      return 'bg-slate-200';
    }
    if (cell.isFlagged) {
      return 'bg-amber-500';
    }
    return darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-300 hover:bg-gray-400';
  };

  const getCellContent = (cell: Cell): string => {
    if (cell.isFlagged) return '🚩';
    if (!cell.isRevealed) return '';
    if (cell.isMine) return '💣';
    if (cell.neighborMines > 0) return cell.neighborMines.toString();
    return '';
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${darkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <div className={`max-w-lg w-full rounded-2xl shadow-2xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Minesweeper
            </h1>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              Classic minesweeper game
            </p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
              🚩 {flags}
            </div>
            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Flags</div>
          </div>
        </div>

        {/* Game Grid */}
        <div className="grid gap-1 mb-6" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}>
          {grid.map((row, y) =>
            row.map((cell, x) => (
              <button
                key={`${y}-${x}`}
                onClick={() => revealCell(x, y)}
                onContextMenu={(e) => toggleFlag(e, x, y)}
                className={`aspect-square rounded ${getCellClass(cell)} flex items-center justify-center font-bold text-sm transition-all ${
                  !cell.isRevealed && !cell.isFlagged ? 'cursor-pointer hover:scale-105' : ''
                } ${darkMode ? 'text-white' : 'text-gray-900'}`}
              >
                {getCellContent(cell)}
              </button>
            ))
          )}
        </div>

        {/* Instructions */}
        <div className={`p-4 rounded-xl mb-4 ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
          <div className={`text-sm font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
            How to Play:
          </div>
          <ul className={`text-sm space-y-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            <li>• Click to reveal a cell</li>
            <li>• Right-click to place/remove a flag</li>
            <li>• Numbers show adjacent mine count</li>
            <li>• Reveal all non-mine cells to win</li>
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

        {/* Game Over Message */}
        {gameOver && (
          <div className={`mt-6 p-6 rounded-xl text-center ${darkMode ? 'bg-red-900/50' : 'bg-red-100'}`}>
            <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
              💥 Game Over!
            </h2>
            <p className={`text-lg mb-4 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              You hit a mine!
            </p>
            <button
              onClick={initGame}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                darkMode
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white'
              }`}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
