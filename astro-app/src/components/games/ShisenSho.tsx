import React, { useState, useCallback, useEffect } from 'react';

interface Tile {
  id: string;
  suit: string;
  value: number;
  row: number;
  col: number;
  matched: boolean;
  selected: boolean;
}

const SUITS = ['🀇', '🀈', '🀉', '🀊', '🀋', '🀌', '🀍', '🀎', '🀏', // Characters
               '🀐', '🀑', '🀒', '🀓', '🀔', '🀕', '🀖', '🀗', '🀘', // Bamboos
               '🀙', '🀚', '🀛', '🀜', '🀝', '🀞', '🀟', '🀠', // Dots
               '🀀', '🀁', '🀂', '🀃']; // Winds

const GRID_ROWS = 8;
const GRID_COLS = 10;

// Create tiles for a solvable game
const createTiles = (): Tile[] => {
  const tiles: Tile[] = [];
  let id = 0;

  // Create pairs of matching tiles
  const pairsNeeded = (GRID_ROWS * GRID_COLS) / 2;

  for (let i = 0; i < pairsNeeded; i++) {
    const suitIndex = i % SUITS.length;
    const suit = SUITS[suitIndex];
    const value = (i % 9) + 1;

    // Create 2 tiles of each type (a pair)
    tiles.push({
      id: `tile-${id++}`,
      suit,
      value,
      row: 0,
      col: 0,
      matched: false,
      selected: false
    });
    tiles.push({
      id: `tile-${id++}`,
      suit,
      value,
      row: 0,
      col: 0,
      matched: false,
      selected: false
    });
  }

  // Shuffle tiles
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }

  // Assign positions
  let index = 0;
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      if (index < tiles.length) {
        tiles[index].row = row;
        tiles[index].col = col;
        index++;
      }
    }
  }

  return tiles;
};

// Check if two tiles can be connected with at most 2 turns (3 line segments)
const canConnect = (tile1: Tile, tile2: Tile, tiles: Tile[]): boolean => {
  if (tile1.row === tile2.row && tile1.col === tile2.col) return false;
  if (tile1.suit !== tile2.suit || tile1.value !== tile2.value) return false;

  const grid: (Tile | null)[][] = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(null));

  // Populate grid with unmatched tiles
  tiles.forEach(t => {
    if (!t.matched && t.id !== tile1.id && t.id !== tile2.id) {
      grid[t.row][t.col] = t;
    }
  });

  const r1 = tile1.row, c1 = tile1.col;
  const r2 = tile2.row, c2 = tile2.col;

  // Check straight line (0 turns)
  if (canConnectStraight(r1, c1, r2, c2, grid)) return true;

  // Check 1 turn (L-shape)
  // Try corner at (r1, c2)
  if (isEmpty(r1, c2, grid) && canConnectStraight(r1, c1, r1, c2, grid) && canConnectStraight(r1, c2, r2, c2, grid)) {
    return true;
  }
  // Try corner at (r2, c1)
  if (isEmpty(r2, c1, grid) && canConnectStraight(r1, c1, r2, c1, grid) && canConnectStraight(r2, c1, r2, c2, grid)) {
    return true;
  }

  // Check 2 turns (Z-shape or U-shape)
  // Try horizontal middle line at each row
  for (let r = -1; r <= GRID_ROWS; r++) {
    const pos1Empty = r === r1 || r === -1 || r === GRID_ROWS ? true : isEmpty(r, c1, grid);
    const pos2Empty = r === r2 || r === -1 || r === GRID_ROWS ? true : isEmpty(r, c2, grid);
    const midEmpty = r === -1 || r === GRID_ROWS ? true : canConnectHorizontal(r, Math.min(c1, c2) + 1, Math.max(c1, c2) - 1, grid);

    if (pos1Empty && pos2Empty && midEmpty) {
      if (canConnectStraight(r1, c1, r, c1, grid) &&
          canConnectStraight(r, c1, r, c2, grid) &&
          canConnectStraight(r, c2, r2, c2, grid)) {
        return true;
      }
    }
  }

  // Try vertical middle line at each column
  for (let c = -1; c <= GRID_COLS; c++) {
    const pos1Empty = c === c1 || c === -1 || c === GRID_COLS ? true : isEmpty(r1, c, grid);
    const pos2Empty = c === c2 || c === -1 || c === GRID_COLS ? true : isEmpty(r2, c, grid);
    const midEmpty = c === -1 || c === GRID_COLS ? true : canConnectVertical(Math.min(r1, r2) + 1, Math.max(r1, r2) - 1, c, grid);

    if (pos1Empty && pos2Empty && midEmpty) {
      if (canConnectStraight(r1, c1, r1, c, grid) &&
          canConnectStraight(r1, c, r2, c, grid) &&
          canConnectStraight(r2, c, r2, c2, grid)) {
        return true;
      }
    }
  }

  return false;
};

const isEmpty = (row: number, col: number, grid: (Tile | null)[][]): boolean => {
  if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) return true;
  return grid[row][col] === null;
};

const canConnectStraight = (r1: number, c1: number, r2: number, c2: number, grid: (Tile | null)[][]): boolean => {
  if (r1 !== r2 && c1 !== c2) return false;

  if (r1 === r2) {
    const minC = Math.min(c1, c2);
    const maxC = Math.max(c1, c2);
    for (let c = minC + 1; c < maxC; c++) {
      if (!isEmpty(r1, c, grid)) return false;
    }
  } else {
    const minR = Math.min(r1, r2);
    const maxR = Math.max(r1, r2);
    for (let r = minR + 1; r < maxR; r++) {
      if (!isEmpty(r, c1, grid)) return false;
    }
  }

  return true;
};

const canConnectHorizontal = (row: number, c1: number, c2: number, grid: (Tile | null)[][]): boolean => {
  for (let c = c1; c <= c2; c++) {
    if (!isEmpty(row, c, grid)) return false;
  }
  return true;
};

const canConnectVertical = (r1: number, r2: number, col: number, grid: (Tile | null)[][]): boolean => {
  for (let r = r1; r <= r2; r++) {
    if (!isEmpty(r, col, grid)) return false;
  }
  return true;
};

type Props = {
  settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }
  onBack?: () => void
}

export default function ShisenSho({ settings }: Props) {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  const isDark = settings.darkMode;
  const isZh = settings.language === 'zh';

  const initGame = useCallback(() => {
    const newTiles = createTiles();
    setTiles(newTiles);
    setSelectedTile(null);
    setScore(0);
    setMoves(0);
    setGameWon(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Find tiles that can be matched (hint system)
  const findHint = useCallback((): [Tile, Tile] | null => {
    const unmatched = tiles.filter(t => !t.matched);
    for (let i = 0; i < unmatched.length; i++) {
      for (let j = i + 1; j < unmatched.length; j++) {
        if (canConnect(unmatched[i], unmatched[j], tiles)) {
          return [unmatched[i], unmatched[j]];
        }
      }
    }
    return null;
  }, [tiles]);

  const handleTileClick = useCallback((tile: Tile) => {
    if (gameWon || tile.matched) return;

    if (selectedTile === null) {
      setSelectedTile(tile);
      setTiles(prev => prev.map(t =>
        t.id === tile.id ? { ...t, selected: true } : { ...t, selected: false }
      ));
    } else if (selectedTile.id === tile.id) {
      setSelectedTile(null);
      setTiles(prev => prev.map(t =>
        t.id === tile.id ? { ...t, selected: false } : t
      ));
    } else {
      // Check if tiles can be matched
      if (canConnect(selectedTile, tile, tiles)) {
        // Match found!
        setTiles(prev => prev.map(t =>
          t.id === selectedTile.id || t.id === tile.id
            ? { ...t, matched: true, selected: false }
            : t
        ));
        setScore(s => s + 10);
        setMoves(m => m + 1);
        setSelectedTile(null);

        // Check win condition
        setTimeout(() => {
          const remaining = tiles.filter(t => !t.matched).length;
          if (remaining <= 2) {
            setGameWon(true);
          }
        }, 100);
      } else {
        // Cannot match - switch selection
        setTiles(prev => prev.map(t =>
          t.id === selectedTile.id
            ? { ...t, selected: false }
            : t.id === tile.id
              ? { ...t, selected: true }
              : t
        ));
        setSelectedTile(tile);
      }
    }
  }, [selectedTile, tiles, gameWon]);

  const handleHint = useCallback(() => {
    const hint = findHint();
    if (hint) {
      setTiles(prev => prev.map(t =>
        t.id === hint[0].id || t.id === hint[1].id
          ? { ...t, selected: true }
          : { ...t, selected: false }
      ));
      setScore(s => Math.max(0, s - 5)); // Penalty for using hint
    }
  }, [findHint]);

  const remaining = tiles.filter(t => !t.matched).length;
  const hasValidMoves = findHint() !== null;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <div className={`max-w-4xl w-full rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {isZh ? '四川麻将' : 'Shisen-Sho'}
            </h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              {isZh ? '匹配相同的麻将牌！' : 'Match identical mahjong tiles!'}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
              {score}
            </div>
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              {isZh ? '分数' : 'Score'}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center mb-4">
          <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            {isZh ? '步数' : 'Moves'}: {moves}
          </div>
          <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            {isZh ? '剩余' : 'Remaining'}: {remaining}
          </div>
          {!hasValidMoves && remaining > 0 && (
            <div className="text-sm text-amber-500 font-medium">
              {isZh ? '无可消除对！' : 'No valid moves!'}
            </div>
          )}
        </div>

        {/* Game Board */}
        <div className="grid gap-1 mb-4" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))` }}>
          {tiles.filter(t => !t.matched).map(tile => (
            <button
              key={tile.id}
              onClick={() => handleTileClick(tile)}
              className={`aspect-square rounded-lg flex items-center justify-center text-lg sm:text-xl transition-all ${
                tile.selected
                  ? 'ring-2 ring-blue-500 scale-105 bg-blue-100'
                  : isDark
                    ? 'bg-slate-700 hover:bg-slate-600'
                    : 'bg-amber-50 hover:bg-amber-100'
              } ${isDark ? 'shadow-slate-900/50' : 'shadow-amber-900/20'} shadow-md`}
            >
              <span className={isDark && !tile.selected ? 'text-white' : 'text-gray-800'}>
                {tile.suit}
              </span>
            </button>
          ))}
        </div>

        {/* Instructions */}
        <div className={`p-4 rounded-xl mb-4 ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`}>
          <div className={`text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
            {isZh ? '玩法' : 'How to Play'}:
          </div>
          <ul className={`text-sm space-y-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            <li>• {isZh ? '点击两张相同的牌进行匹配' : 'Click two matching tiles to remove them'}</li>
            <li>• {isZh ? '牌之间可以用最多2个拐角的线连接' : 'Tiles must be connectable with at most 2 turns'}</li>
            <li>• {isZh ? '消除所有牌即可获胜' : 'Clear all tiles to win'}</li>
          </ul>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={initGame}
            className="flex-1 py-3 rounded-xl font-semibold transition-all bg-blue-600 hover:bg-blue-500 text-white"
          >
            {isZh ? '新游戏' : 'New Game'}
          </button>
          <button
            onClick={handleHint}
            className="flex-1 py-3 rounded-xl font-semibold transition-all bg-amber-600 hover:bg-amber-500 text-white"
          >
            {isZh ? '提示 (-5分)' : 'Hint (-5pts)'}
          </button>
        </div>

        {/* Win Message */}
        {gameWon && (
          <div className={`mt-6 p-6 rounded-xl text-center ${isDark ? 'bg-green-900/50' : 'bg-green-100'}`}>
            <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
              🎉 {isZh ? '胜利！' : 'Victory!'}
            </h2>
            <p className={`text-lg mb-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              {isZh ? `你在 ${moves} 步内清除了所有牌！` : `You cleared all tiles in ${moves} moves!`}
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
