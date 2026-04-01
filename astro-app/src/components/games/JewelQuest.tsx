import React, { useState, useCallback, useEffect, useRef } from 'react';

type JewelType = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

interface Jewel {
  type: JewelType;
  id: number;
}

interface Level {
  id: number;
  name: string;
  nameZh: string;
  targetScore: number;
  moves: number;
  gridSize: number;
  jewelTypes: number; // Number of different jewel types (2-6)
}

const LEVELS: Level[] = [
  { id: 1, name: 'Beginner', nameZh: '新手村', targetScore: 500, moves: 25, gridSize: 6, jewelTypes: 4 },
  { id: 2, name: 'Easy', nameZh: '简单模式', targetScore: 800, moves: 25, gridSize: 6, jewelTypes: 5 },
  { id: 3, name: 'Medium', nameZh: '中等难度', targetScore: 1200, moves: 30, gridSize: 7, jewelTypes: 5 },
  { id: 4, name: 'Challenge', nameZh: '挑战模式', targetScore: 1500, moves: 28, gridSize: 7, jewelTypes: 6 },
  { id: 5, name: 'Hard', nameZh: '困难模式', targetScore: 2000, moves: 30, gridSize: 8, jewelTypes: 6 },
  { id: 6, name: 'Expert', nameZh: '专家模式', targetScore: 2500, moves: 28, gridSize: 8, jewelTypes: 6 },
  { id: 7, name: 'Master', nameZh: '大师级', targetScore: 3000, moves: 30, gridSize: 8, jewelTypes: 6 },
  { id: 8, name: 'Legend', nameZh: '传奇', targetScore: 4000, moves: 35, gridSize: 8, jewelTypes: 6 },
];

const JEWEL_COLORS: Record<JewelType, string> = {
  red: 'bg-gradient-to-br from-red-400 to-red-600',
  blue: 'bg-gradient-to-br from-blue-400 to-blue-600',
  green: 'bg-gradient-to-br from-green-400 to-green-600',
  yellow: 'bg-gradient-to-br from-yellow-300 to-yellow-500',
  purple: 'bg-gradient-to-br from-purple-400 to-purple-600',
  orange: 'bg-gradient-to-br from-orange-400 to-orange-600',
};

const JEWEL_GLOW: Record<JewelType, string> = {
  red: 'shadow-red-500/50',
  blue: 'shadow-blue-500/50',
  green: 'shadow-green-500/50',
  yellow: 'shadow-yellow-500/50',
  purple: 'shadow-purple-500/50',
  orange: 'shadow-orange-500/50',
};

const JEWEL_EMOJI: Record<JewelType, string> = {
  red: '💎',
  blue: '💠',
  green: '🟢',
  yellow: '⭐',
  purple: '🔮',
  orange: '🟠',
};

const JEWEL_HEX: Record<JewelType, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  purple: '#a855f7',
  orange: '#f97316',
};

type Props = {
  settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }
  onBack: () => void
  toggleLanguage: () => void
  toggleTheme: () => void
  toggleSound: () => void
}

const createBoard = (gridSize: number, jewelTypeCount: number): Jewel[][] => {
  const board: Jewel[][] = [];
  let id = 0;
  const types = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'].slice(0, jewelTypeCount) as JewelType[];

  for (let row = 0; row < gridSize; row++) {
    board[row] = [];
    for (let col = 0; col < gridSize; col++) {
      let type: JewelType;
      do {
        type = types[Math.floor(Math.random() * types.length)];
      } while (
        (col >= 2 && board[row][col - 1].type === type && board[row][col - 2].type === type) ||
        (row >= 2 && board[row - 1][col].type === type && board[row - 2][col].type === type)
      );
      board[row][col] = { type, id: id++ };
    }
  }
  return board;
};

const findMatches = (board: Jewel[][], gridSize: number): [number, number][] => {
  const matches = new Set<string>();

  // Horizontal matches
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize - 2; col++) {
      const type = board[row][col].type;
      if (type === board[row][col + 1].type && type === board[row][col + 2].type) {
        matches.add(`${row},${col}`);
        matches.add(`${row},${col + 1}`);
        matches.add(`${row},${col + 2}`);

        let i = col + 3;
        while (i < gridSize && board[row][i].type === type) {
          matches.add(`${row},${i}`);
          i++;
        }
      }
    }
  }

  // Vertical matches
  for (let row = 0; row < gridSize - 2; row++) {
    for (let col = 0; col < gridSize; col++) {
      const type = board[row][col].type;
      if (type === board[row + 1][col].type && type === board[row + 2][col].type) {
        matches.add(`${row},${col}`);
        matches.add(`${row + 1},${col}`);
        matches.add(`${row + 2},${col}`);

        let i = row + 3;
        while (i < gridSize && board[i][col].type === type) {
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

const applyGravity = (board: Jewel[][], gridSize: number, jewelTypeCount: number): Jewel[][] => {
  const newBoard = board.map(row => [...row]);
  const types = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'].slice(0, jewelTypeCount) as JewelType[];

  for (let col = 0; col < gridSize; col++) {
    let emptyRow = gridSize - 1;

    for (let row = gridSize - 1; row >= 0; row--) {
      if (newBoard[row][col].type !== 'empty') {
        if (row !== emptyRow) {
          newBoard[emptyRow][col] = newBoard[row][col];
          newBoard[row][col] = { type: 'empty' as JewelType, id: -1 };
        }
        emptyRow--;
      }
    }

    for (let row = emptyRow; row >= 0; row--) {
      const type = types[Math.floor(Math.random() * types.length)];
      newBoard[row][col] = { type, id: Date.now() + row * gridSize + col };
    }
  }

  return newBoard;
};

// Check if there are any possible moves
const hasValidMoves = (board: Jewel[][], gridSize: number): boolean => {
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      // Check swap with right neighbor
      if (col < gridSize - 1) {
        const testBoard = board.map(r => [...r]);
        [testBoard[row][col], testBoard[row][col + 1]] = [testBoard[row][col + 1], testBoard[row][col]];
        if (findMatches(testBoard, gridSize).length > 0) return true;
      }
      // Check swap with bottom neighbor
      if (row < gridSize - 1) {
        const testBoard = board.map(r => [...r]);
        [testBoard[row][col], testBoard[row + 1][col]] = [testBoard[row + 1][col], testBoard[row][col]];
        if (findMatches(testBoard, gridSize).length > 0) return true;
      }
    }
  }
  return false;
};

export default function JewelQuest({ settings, onBack }: Props) {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [board, setBoard] = useState<Jewel[][]>([]);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [levelComplete, setLevelComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(true);

  const isDark = settings.darkMode;
  const isZh = settings.language === 'zh';
  const audioContext = useRef<AudioContext | null>(null);

  const level = LEVELS[currentLevel];
  const gridSize = level?.gridSize || 8;
  const cellSize = gridSize <= 6 ? 48 : gridSize === 7 ? 44 : 40;

  const texts = {
    title: isZh ? '宝石消消乐' : 'Jewel Quest',
    back: isZh ? '返回' : 'Back',
    levelSelect: isZh ? '选择关卡' : 'Select Level',
    newGame: isZh ? '新游戏' : 'New Game',
    score: isZh ? '分数' : 'Score',
    target: isZh ? '目标' : 'Target',
    movesLeft: isZh ? '剩余步数' : 'Moves',
    levelComplete: isZh ? '关卡完成！' : 'Level Complete!',
    nextLevel: isZh ? '下一关' : 'Next Level',
    gameOver: isZh ? '游戏结束' : 'Game Over',
    youWin: isZh ? '胜利！' : 'You Win!',
    playAgain: isZh ? '再玩一次' : 'Play Again',
    finalScore: isZh ? '最终分数' : 'Final Score',
    howToPlay: isZh ? '玩法' : 'How to Play',
    instruction1: isZh ? '点击两个相邻宝石交换位置' : 'Click two adjacent jewels to swap',
    instruction2: isZh ? '匹配3个或更多相同宝石得分' : 'Match 3+ same jewels to score',
    instruction3: isZh ? '在步数用完前达到目标分数' : 'Reach target score before moves run out',
    noMoves: isZh ? '没有可移动的步数了！' : 'No valid moves available!',
  };

  const playSound = useCallback((type: 'match' | 'swap' | 'win' | 'lose') => {
    if (!settings.soundEnabled) return;
    try {
      if (!audioContext.current) audioContext.current = new AudioContext();
      const ctx = audioContext.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'match') {
        osc.frequency.value = 600;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      } else if (type === 'swap') {
        osc.frequency.value = 400;
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      } else if (type === 'win') {
        osc.frequency.value = 800;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      } else {
        osc.frequency.value = 200;
        osc.type = 'sawtooth';
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      }
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch {}
  }, [settings.soundEnabled]);

  const initLevel = useCallback((levelIndex: number) => {
    const lvl = LEVELS[levelIndex];
    let newBoard = createBoard(lvl.gridSize, lvl.jewelTypes);

    // Ensure the board has valid moves
    let attempts = 0;
    while (!hasValidMoves(newBoard, lvl.gridSize) && attempts < 100) {
      newBoard = createBoard(lvl.gridSize, lvl.jewelTypes);
      attempts++;
    }

    setBoard(newBoard);
    setSelected(null);
    setScore(0);
    setMoves(lvl.moves);
    setGameOver(false);
    setGameWon(false);
    setLevelComplete(false);
    setIsProcessing(false);
    setShowLevelSelect(false);
  }, []);

  const processMatches = useCallback((currentBoard: Jewel[][], currentScore: number, remainingMoves: number) => {
    const lvl = LEVELS[currentLevel];
    const matches = findMatches(currentBoard, lvl.gridSize);

    if (matches.length === 0) {
      setBoard(currentBoard);
      setIsProcessing(false);

      // Check for no valid moves
      if (!hasValidMoves(currentBoard, lvl.gridSize)) {
        // Shuffle the board
        const shuffledBoard = createBoard(lvl.gridSize, lvl.jewelTypes);
        setBoard(shuffledBoard);
      }
      return;
    }

    playSound('match');
    const newBoard = removeMatches(currentBoard, matches);
    const newScore = currentScore + matches.length * 10;

    setTimeout(() => {
      const droppedBoard = applyGravity(newBoard, lvl.gridSize, lvl.jewelTypes);
      processMatches(droppedBoard, newScore, remainingMoves);
    }, 150);
  }, [currentLevel, playSound]);

  const swapJewels = useCallback((pos1: [number, number], pos2: [number, number]) => {
    if (isProcessing) return;

    const [row1, col1] = pos1;
    const [row2, col2] = pos2;

    const isAdjacent = (Math.abs(row1 - row2) === 1 && col1 === col2) ||
                       (Math.abs(col1 - col2) === 1 && row1 === row2);

    if (!isAdjacent) {
      setSelected(null);
      return;
    }

    const newBoard = board.map(row => [...row]);
    [newBoard[row1][col1], newBoard[row2][col2]] = [newBoard[row2][col2], newBoard[row1][col1]];

    const matches = findMatches(newBoard, gridSize);
    if (matches.length === 0) {
      setSelected(null);
      return;
    }

    playSound('swap');
    setIsProcessing(true);
    const newMoves = moves - 1;
    setMoves(newMoves);
    setSelected(null);
    setScore(s => s);
    processMatches(newBoard, score, newMoves);
  }, [board, isProcessing, score, moves, gridSize, processMatches, playSound]);

  const handleClick = (row: number, col: number) => {
    if (isProcessing || gameOver || levelComplete) return;

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

  // Touch support
  const touchStart = useRef<{ row: number; col: number; x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent, row: number, col: number) => {
    const touch = e.touches[0];
    touchStart.current = { row, col, x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent, row: number, col: number) => {
    if (!touchStart.current) return;
    e.preventDefault();

    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;
    const threshold = cellSize / 2;

    let targetRow = row;
    let targetCol = col;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
      targetCol = dx > 0 ? col + 1 : col - 1;
    } else if (Math.abs(dy) > threshold) {
      targetRow = dy > 0 ? row + 1 : row - 1;
    } else {
      // Tap without swipe - treat as click
      handleClick(row, col);
      touchStart.current = null;
      return;
    }

    if (targetRow >= 0 && targetRow < gridSize && targetCol >= 0 && targetCol < gridSize) {
      setSelected([row, col]);
      swapJewels([row, col], [targetRow, targetCol]);
    }

    touchStart.current = null;
  };

  // Update score during match processing
  useEffect(() => {
    const lvl = LEVELS[currentLevel];
    if (score >= lvl.targetScore && !levelComplete && !isProcessing) {
      setLevelComplete(true);
      playSound('win');
    }
  }, [score, currentLevel, levelComplete, isProcessing, playSound]);

  useEffect(() => {
    const lvl = LEVELS[currentLevel];
    if (moves === 0 && !isProcessing && !levelComplete) {
      if (score < lvl.targetScore) {
        setGameOver(true);
        playSound('lose');
      }
    }
  }, [moves, isProcessing, score, currentLevel, levelComplete, playSound]);

  // Level select screen
  if (showLevelSelect) {
    return (
      <div className={`min-h-screen flex flex-col ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>
        <header className="sticky top-0 z-10 bg-slate-950/90 border-b border-slate-800 backdrop-blur-xl">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm text-white"
            >
              ← {texts.back}
            </button>
            <span className="text-lg font-bold text-white">{texts.title}</span>
            <div className="w-16" />
          </div>
        </header>

        <main className="flex-1 p-4">
          <div className={`max-w-md mx-auto rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <h2 className={`text-2xl font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {texts.levelSelect}
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {LEVELS.map((lvl, index) => (
                <button
                  key={lvl.id}
                  onClick={() => {
                    setCurrentLevel(index);
                    initLevel(index);
                  }}
                  className={`p-4 rounded-xl text-left transition-all ${
                    isDark
                      ? 'bg-gradient-to-br from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600'
                      : 'bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500'
                  } text-white shadow-lg hover:scale-105`}
                >
                  <div className="text-lg font-bold">{lvl.id}. {isZh ? lvl.nameZh : lvl.name}</div>
                  <div className="text-sm opacity-80 mt-1">
                    {isZh ? `${lvl.gridSize}×${lvl.gridSize} 方格` : `${lvl.gridSize}×${lvl.gridSize} grid`}
                  </div>
                  <div className="text-sm opacity-80">
                    {isZh ? `目标: ${lvl.targetScore}` : `Target: ${lvl.targetScore}`}
                  </div>
                  <div className="text-sm opacity-80">
                    {isZh ? `${lvl.moves} 步` : `${lvl.moves} moves`}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <header className="sticky top-0 z-10 bg-slate-950/90 border-b border-slate-800 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm text-white"
          >
            ← {texts.back}
          </button>
          <div className="text-center">
            <div className="text-lg font-bold text-white">{texts.title}</div>
            <div className="text-xs text-slate-400">{isZh ? level.nameZh : level.name}</div>
          </div>
          <button
            onClick={() => setShowLevelSelect(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors text-sm text-white"
          >
            {texts.levelSelect}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className={`w-full max-w-md rounded-2xl shadow-2xl p-4 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          {/* Stats */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                {score}
              </div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{texts.score}</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                {level.targetScore}
              </div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{texts.target}</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${moves <= 5 ? 'text-red-500' : isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                {moves}
              </div>
              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{texts.movesLeft}</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className={`h-2 rounded-full overflow-hidden mb-4 ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${Math.min(100, (score / level.targetScore) * 100)}%` }}
            />
          </div>

          {/* Game Board - Fixed grid layout */}
          <div className="flex justify-center mb-4">
            <div
              className="grid gap-1 p-2 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 shadow-inner"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                touchAction: 'none'
              }}
            >
              {board.map((row, rowIndex) =>
                row.map((jewel, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}-${jewel.id}`}
                    onClick={() => handleClick(rowIndex, colIndex)}
                    onTouchStart={(e) => handleTouchStart(e, rowIndex, colIndex)}
                    onTouchEnd={(e) => handleTouchEnd(e, rowIndex, colIndex)}
                    className={`
                      rounded-lg cursor-pointer transition-all duration-150
                      flex items-center justify-center
                      ${JEWEL_COLORS[jewel.type] || 'bg-gray-400'}
                      ${selected?.[0] === rowIndex && selected?.[1] === colIndex
                        ? `ring-2 ring-white scale-110 shadow-lg ${JEWEL_GLOW[jewel.type] || ''}`
                        : 'hover:scale-105 hover:shadow-md'}
                      shadow-md
                    `}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      fontSize: cellSize * 0.5,
                      boxShadow: selected?.[0] === rowIndex && selected?.[1] === colIndex
                        ? `0 0 15px ${JEWEL_HEX[jewel.type]}`
                        : undefined
                    }}
                  >
                    <span className="drop-shadow-md">{JEWEL_EMOJI[jewel.type] || ''}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className={`p-3 rounded-xl mb-4 ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`}>
            <div className={`text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              {texts.howToPlay}:
            </div>
            <ul className={`text-xs space-y-0.5 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              <li>• {texts.instruction1}</li>
              <li>• {texts.instruction2}</li>
              <li>• {texts.instruction3}</li>
            </ul>
          </div>

          {/* Level Complete */}
          {levelComplete && (
            <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-green-900/50' : 'bg-green-100'}`}>
              <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                🎉 {texts.levelComplete}
              </h2>
              <p className={`text-lg mb-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                {texts.score}: {score}
              </p>
              {currentLevel < LEVELS.length - 1 ? (
                <button
                  onClick={() => {
                    setCurrentLevel(currentLevel + 1);
                    initLevel(currentLevel + 1);
                  }}
                  className="px-6 py-3 rounded-xl font-semibold bg-green-600 hover:bg-green-500 text-white"
                >
                  {texts.nextLevel} →
                </button>
              ) : (
                <div>
                  <p className={`text-xl font-bold mb-2 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    🏆 {texts.youWin}
                  </p>
                  <button
                    onClick={() => setShowLevelSelect(true)}
                    className="px-6 py-3 rounded-xl font-semibold bg-amber-600 hover:bg-amber-500 text-white"
                  >
                    {texts.levelSelect}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Game Over */}
          {gameOver && (
            <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-red-900/50' : 'bg-red-100'}`}>
              <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                {texts.gameOver}
              </h2>
              <p className={`text-lg mb-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                {texts.finalScore}: {score} / {level.targetScore}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => initLevel(currentLevel)}
                  className="px-6 py-3 rounded-xl font-semibold bg-blue-600 hover:bg-blue-500 text-white"
                >
                  {texts.playAgain}
                </button>
                <button
                  onClick={() => setShowLevelSelect(true)}
                  className="px-6 py-3 rounded-xl font-semibold bg-slate-600 hover:bg-slate-500 text-white"
                >
                  {texts.levelSelect}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
