import React, { useState, useCallback, useEffect } from 'react';

type JewelType = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

interface Jewel {
  type: JewelType;
  id: number;
}

const GRID_SIZE = 8;
const JEWEL_TYPES: JewelType[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

const JEWEL_COLORS: Record<JewelType, string> = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
};

const createBoard = (): Jewel[][] => {
  const board: Jewel[][] = [];
  let id = 0;

  for (let row = 0; row < GRID_SIZE; row++) {
    board[row] = [];
    for (let col = 0; col < GRID_SIZE; col++) {
      let type: JewelType;
      do {
        type = JEWEL_TYPES[Math.floor(Math.random() * JEWEL_TYPES.length)];
      } while (
        (col >= 2 && board[row][col - 1].type === type && board[row][col - 2].type === type) ||
        (row >= 2 && board[row - 1][col].type === type && board[row - 2][col].type === type)
      );
      board[row][col] = { type, id: id++ };
    }
  }
  return board;
};

const findMatches = (board: Jewel[][]): [number, number][] => {
  const matches = new Set<string>();

  // Horizontal matches
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE - 2; col++) {
      const type = board[row][col].type;
      if (type === board[row][col + 1].type && type === board[row][col + 2].type) {
        matches.add(`${row},${col}`);
        matches.add(`${row},${col + 1}`);
        matches.add(`${row},${col + 2}`);

        // Check for more
        let i = col + 3;
        while (i < GRID_SIZE && board[row][i].type === type) {
          matches.add(`${row},${i}`);
          i++;
        }
      }
    }
  }

  // Vertical matches
  for (let row = 0; row < GRID_SIZE - 2; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const type = board[row][col].type;
      if (type === board[row + 1][col].type && type === board[row + 2][col].type) {
        matches.add(`${row},${col}`);
        matches.add(`${row + 1},${col}`);
        matches.add(`${row + 2},${col}`);

        // Check for more
        let i = row + 3;
        while (i < GRID_SIZE && board[i][col].type === type) {
          matches.add(`${i},${col}`);
          i++;
        }
      }
    }
  }

  return Array.from(matches).map(s => {
    const [row, col] = s.split(',').map(Number);
    return [row, col];
  });
};

const removeMatches = (board: Jewel[][], matches: [number, number][]): Jewel[][] => {
  const newBoard = board.map(row => [...row]);
  matches.forEach(([row, col]) => {
    newBoard[row][col] = { type: 'empty' as JewelType, id: -1 };
  });
  return newBoard;
};

const applyGravity = (board: Jewel[][]): Jewel[][] => {
  const newBoard = board.map(row => [...row]);

  for (let col = 0; col < GRID_SIZE; col++) {
    let emptyRow = GRID_SIZE - 1;

    for (let row = GRID_SIZE - 1; row >= 0; row--) {
      if (newBoard[row][col].type !== 'empty') {
        if (row !== emptyRow) {
          newBoard[emptyRow][col] = newBoard[row][col];
          newBoard[row][col] = { type: 'empty' as JewelType, id: -1 };
        }
        emptyRow--;
      }
    }

    // Fill empty spaces at top
    for (let row = emptyRow; row >= 0; row--) {
      const type = JEWEL_TYPES[Math.floor(Math.random() * JEWEL_TYPES.length)];
      newBoard[row][col] = { type, id: Date.now() + row * GRID_SIZE + col };
    }
  }

  return newBoard;
};

export default function JewelQuest() {
  const [board, setBoard] = useState<Jewel[][]>([]);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [darkMode] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const initGame = useCallback(() => {
    setBoard(createBoard());
    setSelected(null);
    setScore(0);
    setMoves(30);
    setGameOver(false);
    setGameWon(false);
    setIsProcessing(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const processMatches = useCallback((currentBoard: Jewel[][], currentScore: number) => {
    const matches = findMatches(currentBoard);

    if (matches.length === 0) {
      setBoard(currentBoard);
      setIsProcessing(false);
      return;
    }

    const newBoard = removeMatches(currentBoard, matches);
    const newScore = currentScore + matches.length * 10;

    setTimeout(() => {
      const droppedBoard = applyGravity(newBoard);
      processMatches(droppedBoard, newScore);
    }, 200);
  }, []);

  const swapJewels = useCallback((pos1: [number, number], pos2: [number, number]) => {
    if (isProcessing) return;

    const [row1, col1] = pos1;
    const [row2, col2] = pos2;

    // Check if adjacent
    const isAdjacent = (Math.abs(row1 - row2) === 1 && col1 === col2) ||
                       (Math.abs(col1 - col2) === 1 && row1 === row2);

    if (!isAdjacent) {
      setSelected(null);
      return;
    }

    const newBoard = board.map(row => [...row]);
    [newBoard[row1][col1], newBoard[row2][col2]] = [newBoard[row2][col2], newBoard[row1][col1]];

    // Check if this creates matches
    const testBoard = removeMatches(newBoard, findMatches(newBoard));
    const hasEmpty = testBoard.some(row => row.some(j => j.type === 'empty'));

    if (!hasEmpty) {
      setSelected(null);
      return;
    }

    setIsProcessing(true);
    setMoves(m => m - 1);
    setSelected(null);
    processMatches(newBoard, score);
  }, [board, isProcessing, score, processMatches]);

  const handleClick = (row: number, col: number) => {
    if (isProcessing || gameOver || gameWon) return;

    if (!selected) {
      setSelected([row, col]);
    } else {
      if (selected[0] === row && selected[1] === col) {
        setSelected(null);
      } else {
        swapJewels(selected, [row, col]);
      }
    }
  };

  useEffect(() => {
    if (moves === 0 && !isProcessing) {
      setGameOver(true);
    }
    if (score >= 1000) {
      setGameWon(true);
    }
  }, [moves, isProcessing, score]);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${darkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <div className={`max-w-md w-full rounded-2xl shadow-2xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Jewel Quest
            </h1>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              Match 3 or more jewels!
            </p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              {score}
            </div>
            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Score</div>
          </div>
        </div>

        {/* Moves */}
        <div className="mb-4 text-center">
          <span className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Moves: <span className={moves <= 5 ? 'text-red-500' : ''}>{moves}</span>
          </span>
        </div>

        {/* Game Board */}
        <div className="flex justify-center mb-6">
          <div className="grid gap-1 p-3 rounded-xl bg-slate-700/50">
            {board.map((row, rowIndex) =>
              row.map((jewel, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}-${jewel.id}`}
                  onClick={() => handleClick(rowIndex, colIndex)}
                  className={`
                    w-12 h-12 rounded-lg cursor-pointer transition-all
                    ${JEWEL_COLORS[jewel.type] || 'bg-gray-400'}
                    ${selected?.[0] === rowIndex && selected?.[1] === colIndex
                      ? 'ring-4 ring-white scale-110'
                      : 'hover:scale-105 hover:shadow-lg'}
                  `}
                />
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className={`p-4 rounded-xl mb-4 ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
          <div className={`text-sm font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
            How to Play:
          </div>
          <ul className={`text-sm space-y-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            <li>• Click two adjacent jewels to swap them</li>
            <li>• Match 3+ same-colored jewels to score</li>
            <li>• Reach 1000 points within 30 moves</li>
            <li>• Plan ahead for combo matches!</li>
          </ul>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={initGame}
            disabled={isProcessing}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              darkMode
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white disabled:opacity-50'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white disabled:opacity-50'
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
          </div>
        )}

        {gameWon && (
          <div className={`mt-6 p-6 rounded-xl text-center ${darkMode ? 'bg-green-900/50' : 'bg-green-100'}`}>
            <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              🎉 You Win!
            </h2>
            <p className={`text-lg ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              Score: {score} | Moves left: {moves}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
