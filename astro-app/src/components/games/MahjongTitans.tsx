import React, { useState, useCallback, useEffect, useRef } from 'react';

// Real Mahjong tile symbols
const MAHJONG_TILES = [
  // Characters (Wan)
  '🀇', '🀈', '🀉', '🀊', '🀋', '🀌', '🀍', '🀎', '🀏',
  // Bamboo (Suo)
  '🀐', '🀑', '🀒', '🀓', '🀔', '🀕', '🀖', '🀗', '🀘',
  // Circles (Tong)
  '🀙', '🀚', '🀛', '🀜', '🀝', '🀞', '🀟', '🀠', '🀡',
  // Winds
  '🀀', '🀁', '🀂', '🀃',
  // Dragons
  '🀄', '🀅', '🀆',
];

interface Tile {
  id: string;
  symbol: string;
  isRevealed: boolean;
  isMatched: boolean;
}

type Props = {
  settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }
  onBack: () => void
  toggleLanguage: () => void
  toggleTheme: () => void
  toggleSound: () => void
}

// Shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export default function MahjongTitans({ settings, onBack }: Props) {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedTile, setSelectedTile] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const isDark = settings.darkMode;
  const isZh = settings.language === 'zh';
  const audioContext = useRef<AudioContext | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const texts = {
    title: isZh ? '麻将连连看' : 'Mahjong Titans',
    back: isZh ? '返回' : 'Back',
    newGame: isZh ? '新游戏' : 'New Game',
    score: isZh ? '分数' : 'Score',
    moves: isZh ? '步数' : 'Moves',
    time: isZh ? '时间' : 'Time',
    timesUp: isZh ? '时间到！' : "Time's Up!",
    youWin: isZh ? '胜利！' : 'You Win!',
    finalScore: isZh ? '最终分数' : 'Final Score',
    playAgain: isZh ? '再玩一次' : 'Play Again',
    howToPlay: isZh ? '玩法' : 'How to Play',
    instruction1: isZh ? '点击两个相同的麻将牌消除它们' : 'Click two matching tiles to remove them',
    instruction2: isZh ? '在时间结束前消除所有牌' : 'Clear all tiles before time runs out',
    instruction3: isZh ? '连续匹配获得额外分数' : 'Chain matches for bonus points',
    tilesLeft: isZh ? '剩余' : 'Tiles',
  };

  const playSound = useCallback((type: 'select' | 'match' | 'win' | 'lose') => {
    if (!settings.soundEnabled) return;
    try {
      if (!audioContext.current) audioContext.current = new AudioContext();
      const ctx = audioContext.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'select') {
        osc.frequency.value = 440;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      } else if (type === 'match') {
        osc.frequency.value = 660;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      } else if (type === 'win') {
        osc.frequency.value = 880;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      } else {
        osc.frequency.value = 220;
        osc.type = 'sawtooth';
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      }
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch {}
  }, [settings.soundEnabled]);

  const initGame = useCallback(() => {
    // Create pairs of tiles (72 tiles = 36 pairs)
    const selectedSymbols = shuffleArray(MAHJONG_TILES).slice(0, 18);
    const tilePairs: Tile[] = [];

    selectedSymbols.forEach((symbol, index) => {
      // Each symbol appears 4 times (2 pairs)
      for (let i = 0; i < 4; i++) {
        tilePairs.push({
          id: `tile-${index}-${i}`,
          symbol,
          isRevealed: false,
          isMatched: false,
        });
      }
    });

    setTiles(shuffleArray(tilePairs));
    setSelectedTile(null);
    setScore(0);
    setMoves(0);
    setTimeLeft(180);
    setGameOver(false);
    setGameWon(false);
    setIsProcessing(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Timer - fixed to prevent negative time
  useEffect(() => {
    if (gameOver || gameWon) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameOver(true);
          playSound('lose');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameOver, gameWon, playSound]);

  // Check win condition
  useEffect(() => {
    if (tiles.length > 0 && tiles.every(t => t.isMatched) && !gameOver) {
      setGameWon(true);
      playSound('win');
    }
  }, [tiles, gameOver, playSound]);

  const handleTileClick = useCallback((clickedTile: Tile) => {
    if (gameOver || gameWon || isProcessing || clickedTile.isMatched) return;

    playSound('select');

    if (!selectedTile) {
      // First selection
      setSelectedTile(clickedTile.id);
      setTiles(prev => prev.map(t =>
        t.id === clickedTile.id ? { ...t, isRevealed: true } : t
      ));
    } else if (selectedTile === clickedTile.id) {
      // Clicked same tile - deselect
      setSelectedTile(null);
      setTiles(prev => prev.map(t =>
        t.id === clickedTile.id ? { ...t, isRevealed: false } : t
      ));
    } else {
      // Second selection - check for match
      const firstTile = tiles.find(t => t.id === selectedTile);
      if (!firstTile) return;

      setMoves(m => m + 1);
      setIsProcessing(true);

      // Reveal second tile
      setTiles(prev => prev.map(t =>
        t.id === clickedTile.id ? { ...t, isRevealed: true } : t
      ));

      if (firstTile.symbol === clickedTile.symbol) {
        // Match found!
        setTimeout(() => {
          playSound('match');
          setTiles(prev => prev.map(t =>
            t.id === selectedTile || t.id === clickedTile.id
              ? { ...t, isMatched: true }
              : t
          ));
          setScore(s => s + 100);
          setSelectedTile(null);
          setIsProcessing(false);
        }, 300);
      } else {
        // No match - hide both after delay
        setTimeout(() => {
          setTiles(prev => prev.map(t =>
            t.id === selectedTile || t.id === clickedTile.id
              ? { ...t, isRevealed: false }
              : t
          ));
          setSelectedTile(null);
          setIsProcessing(false);
        }, 800);
      }
    }
  }, [selectedTile, tiles, gameOver, gameWon, isProcessing, playSound]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const remainingTiles = tiles.filter(t => !t.isMatched).length;

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/90 border-b border-slate-800 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm text-white"
          >
            ← {texts.back}
          </button>
          <div className="text-center">
            <span className="text-lg font-bold text-white">{texts.title}</span>
          </div>
          <button
            onClick={initGame}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition-colors text-sm text-white"
          >
            {texts.newGame}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center p-4">
        <div className={`w-full max-w-lg rounded-2xl shadow-2xl p-4 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="text-center p-2 rounded-xl bg-slate-700/50">
              <div className="text-2xl font-bold text-green-400">{score}</div>
              <div className="text-xs text-slate-400">{texts.score}</div>
            </div>
            <div className="text-center p-2 rounded-xl bg-slate-700/50">
              <div className={`text-2xl font-bold ${timeLeft <= 30 ? 'text-red-400' : 'text-amber-400'}`}>
                {formatTime(timeLeft)}
              </div>
              <div className="text-xs text-slate-400">{texts.time}</div>
            </div>
            <div className="text-center p-2 rounded-xl bg-slate-700/50">
              <div className="text-2xl font-bold text-blue-400">{moves}</div>
              <div className="text-xs text-slate-400">{texts.moves}</div>
            </div>
            <div className="text-center p-2 rounded-xl bg-slate-700/50">
              <div className="text-2xl font-bold text-purple-400">{remainingTiles}</div>
              <div className="text-xs text-slate-400">{texts.tilesLeft}</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 rounded-full overflow-hidden mb-4 bg-slate-700">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${((tiles.length - remainingTiles) / tiles.length) * 100}%` }}
            />
          </div>

          {/* Game Board */}
          <div
            className="grid gap-1.5 p-3 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 mb-4"
            style={{
              gridTemplateColumns: 'repeat(6, 1fr)',
              touchAction: 'manipulation'
            }}
          >
            {tiles.map(tile => (
              <button
                key={tile.id}
                onClick={() => handleTileClick(tile)}
                disabled={gameOver || gameWon || tile.isMatched || isProcessing}
                className={`
                  aspect-square rounded-lg flex items-center justify-center
                  transition-all duration-200 text-2xl sm:text-3xl
                  ${tile.isMatched
                    ? 'opacity-0 scale-75 cursor-default'
                    : tile.isRevealed
                      ? 'bg-gradient-to-br from-amber-50 to-amber-100 shadow-lg ring-2 ring-amber-400 scale-105'
                      : selectedTile === tile.id
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg ring-2 ring-white scale-105'
                        : 'bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 hover:scale-105 shadow-md cursor-pointer'
                  }
                  disabled:cursor-not-allowed
                `}
              >
                {tile.isRevealed || tile.isMatched ? (
                  <span className="drop-shadow-md">{tile.symbol}</span>
                ) : (
                  <span className="text-white/80 text-xl">🀫</span>
                )}
              </button>
            ))}
          </div>

          {/* Instructions */}
          <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
            <div className={`text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              {texts.howToPlay}:
            </div>
            <ul className={`text-xs space-y-0.5 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              <li>• {texts.instruction1}</li>
              <li>• {texts.instruction2}</li>
              <li>• {texts.instruction3}</li>
            </ul>
          </div>

          {/* Game Over / Win Message */}
          {(gameOver || gameWon) && (
            <div className={`mt-4 p-6 rounded-xl text-center ${
              gameWon
                ? isDark ? 'bg-green-900/50' : 'bg-green-100'
                : isDark ? 'bg-red-900/50' : 'bg-red-100'
            }`}>
              <h2 className={`text-2xl font-bold mb-2 ${
                gameWon
                  ? isDark ? 'text-green-400' : 'text-green-600'
                  : isDark ? 'text-red-400' : 'text-red-600'
              }`}>
                {gameWon ? `🎉 ${texts.youWin}` : texts.timesUp}
              </h2>
              <p className={`text-lg mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                {texts.finalScore}: {score}
              </p>
              <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                {texts.moves}: {moves} | {texts.tilesLeft}: {remainingTiles}
              </p>
              <button
                onClick={initGame}
                className="px-6 py-3 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                {texts.playAgain}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
