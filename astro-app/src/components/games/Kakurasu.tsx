import React, { useState, useCallback } from 'react';

type Cell = number | null;

const GRID_SIZE = 5;

export default function Kakurasu() {
  const [grid, setGrid] = useState<Cell[][]>(() => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
  const [rowClues, setRowClues] = useState<number[]>(() => Array.from({ length: GRID_SIZE }, () => Math.floor(Math.random() * 15) + 5));
  const [colClues, setColClues] = useState<number[]>(() => Array.from({ length: GRID_SIZE }, () => Math.floor(Math.random() * 15) + 5));
  const [darkMode] = useState(true);

  const initGame = useCallback(() => {
    const newGrid: Cell[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
    setGrid(newGrid);
  }, []);

  const handleCellClick = useCallback((row: number, col: number) => {
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = newGrid[row][col] === null ? 1 : null;
    setGrid(newGrid);
  }, [grid]);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${darkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <div className={`max-w-lg w-full rounded-2xl shadow-2xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
        <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Kakurasu</h1>
        <p className={`text-sm mb-4 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Place cells to match the clues!</p>

        <div className="grid gap-2 mb-4" style={{ gridTemplateColumns: `30px repeat(${GRID_SIZE}, minmax(0, 1fr))` }}>
          <div></div>
          {colClues.map((clue, i) => (
            <div key={i} className={`text-center font-bold py-2 rounded ${darkMode ? 'bg-slate-700 text-blue-400' : 'bg-gray-200 text-blue-600'}`}>{clue}</div>
          ))}
          {grid.map((row, y) => (
            <React.Fragment key={y}>
              <div className={`text-center font-bold py-2 rounded ${darkMode ? 'bg-slate-700 text-green-400' : 'bg-gray-200 text-green-600'}`}>{rowClues[y]}</div>
              {row.map((cell, x) => (
                <button
                  key={x}
                  onClick={() => handleCellClick(y, x)}
                  className={`aspect-square rounded flex items-center justify-center font-bold transition-all ${
                    cell
                      ? darkMode ? 'bg-blue-500 text-white' : 'bg-blue-500 text-white'
                      : darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {cell || ''}
                </button>
              ))}
            </React.Fragment>
          ))}
        </div>

        <button onClick={initGame} className={`w-full py-3 rounded-xl font-semibold transition-all ${darkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
          New Game
        </button>
      </div>
    </div>
  );
}
