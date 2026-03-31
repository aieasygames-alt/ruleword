import React, { useState, useCallback, useEffect, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Bullet {
  x: number;
  y: number;
}

interface Mushroom {
  x: number;
  y: number;
  health: number;
}

interface Segment {
  x: number;
  y: number;
}

const GRID_WIDTH = 400;
const GRID_HEIGHT = 500;
const PLAYER_WIDTH = 30;
const PLAYER_HEIGHT = 20;
const BULLET_SIZE = 4;
const MUSHROOM_SIZE = 20;
const SEGMENT_SIZE = 15;

export default function Centipede() {
  const [player, setPlayer] = useState<Position>({ x: GRID_WIDTH / 2, y: GRID_HEIGHT - 40 });
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [mushrooms, setMushrooms] = useState<Mushroom[]>([]);
  const [centipede, setCentipede] = useState<Segment[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [darkMode] = useState(true);
  const gameLoopRef = useRef<number>();
  const keysRef = useRef<Set<string>>(new Set());
  const playerRef = useRef(player);
  playerRef.current = player;

  // Use refs for gameOver and gameWon so the update callback stays stable
  const gameOverRef = useRef(gameOver);
  gameOverRef.current = gameOver;
  const gameWonRef = useRef(gameWon);
  gameWonRef.current = gameWon;

  const initGame = useCallback(() => {
    setPlayer({ x: GRID_WIDTH / 2, y: GRID_HEIGHT - 40 });
    setBullets([]);
    setScore(0);
    setLives(3);
    setGameOver(false);
    setGameWon(false);

    // Create mushrooms
    const newMushrooms: Mushroom[] = [];
    for (let i = 0; i < 30; i++) {
      newMushrooms.push({
        x: Math.random() * (GRID_WIDTH - MUSHROOM_SIZE),
        y: 100 + Math.random() * (GRID_HEIGHT - 200),
        health: 4
      });
    }
    setMushrooms(newMushrooms);

    // Create centipede
    const newCentipede: Segment[] = [];
    for (let i = 0; i < 10; i++) {
      newCentipede.push({ x: 50 + i * SEGMENT_SIZE, y: 30 });
    }
    setCentipede(newCentipede);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Shoot function uses refs so it doesn't need gameOver/gameWon in deps
  const shoot = useCallback(() => {
    if (gameOverRef.current || gameWonRef.current) return;
    setBullets(prev => [...prev, { x: playerRef.current.x, y: playerRef.current.y - 10 }]);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only prevent default for game keys to avoid blocking all keyboard input
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
        e.preventDefault();
      }
      keysRef.current.add(e.key);

      // Handle space/shoot directly in the window listener
      if (e.key === ' ') {
        shoot();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [shoot]);

  // Update function uses refs for gameOver/gameWon so it stays stable
  const update = useCallback(() => {
    if (gameOverRef.current || gameWonRef.current) return;

    // Move player
    setPlayer(prev => {
      const newX = prev.x + (keysRef.current.has('ArrowLeft') ? -6 : 0) + (keysRef.current.has('ArrowRight') ? 6 : 0);
      return {
        x: Math.max(PLAYER_WIDTH / 2, Math.min(GRID_WIDTH - PLAYER_WIDTH / 2, newX)),
        y: prev.y
      };
    });

    // Move bullets
    setBullets(prev => {
      const newBullets = prev
        .map(b => ({ x: b.x, y: b.y - 10 }))
        .filter(b => b.y > 0);
      return newBullets;
    });

    // Move centipede
    setCentipede(prev => {
      return prev.map((seg, index) => {
        let newX = seg.x;
        let newY = seg.y;

        if (index === 0) {
          // Head movement
          newX += 3;
          if (newX > GRID_WIDTH - SEGMENT_SIZE || newX < 0) {
            newY += SEGMENT_SIZE;
          }
        } else {
          // Follow previous segment
          const prevSeg = prev[index - 1];
          newX = prevSeg.x;
          newY = prevSeg.y;
        }

        return { x: newX, y: newY };
      });
    });

    // Check collisions
    setBullets(prevBullets => {
      let remainingBullets = [...prevBullets];

      // Bullet vs Centipede
      setCentipede(prevCentipede => {
        const newCentipede = [...prevCentipede];
        remainingBullets = remainingBullets.filter(bullet => {
          let hit = false;
          newCentipede.forEach((seg, index) => {
            if (Math.abs(bullet.x - seg.x) < SEGMENT_SIZE && Math.abs(bullet.y - seg.y) < SEGMENT_SIZE) {
              newCentipede.splice(index, 1);
              hit = true;
              setScore(s => s + 100);

              // Maybe spawn mushroom
              if (Math.random() > 0.5) {
                setMushrooms(prev => [...prev, { x: seg.x, y: seg.y, health: 4 }]);
              }
            }
          });
          return !hit;
        });

        if (newCentipede.length === 0) {
          setGameWon(true);
        }

        return newCentipede;
      });

      return remainingBullets;
    });

    // Player vs Centipede
    setCentipede(prev => {
      const hit = prev.some(seg =>
        Math.abs(playerRef.current.x - seg.x) < PLAYER_WIDTH / 2 + SEGMENT_SIZE / 2 &&
        Math.abs(playerRef.current.y - seg.y) < PLAYER_HEIGHT / 2 + SEGMENT_SIZE / 2
      );

      if (hit) {
        setLives(prevLives => {
          const newLives = prevLives - 1;
          if (newLives <= 0) {
            setGameOver(true);
          }
          return newLives;
        });
        setPlayer({ x: GRID_WIDTH / 2, y: GRID_HEIGHT - 40 });
      }

      return prev;
    });
  }, []); // Stable - uses refs instead of state values

  useEffect(() => {
    const loop = setInterval(update, 1000 / 60);
    gameLoopRef.current = loop as unknown as number;

    return () => clearInterval(loop);
  }, [update]); // update is now stable, so this only runs once

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 ${darkMode ? 'bg-slate-900' : 'bg-gray-100'}`}
      tabIndex={0}
    >
      <div className={`max-w-2xl w-full rounded-2xl shadow-2xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Centipede
            </h1>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              Destroy the centipede segments!
            </p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{score}</div>
              <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Score</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>{lives}</div>
              <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Lives</div>
            </div>
          </div>
        </div>

        {/* Responsive Game Canvas Wrapper */}
        <div className="w-full flex justify-center mb-4">
          <div
            className="relative overflow-hidden rounded-lg border-2"
            style={{
              width: GRID_WIDTH,
              height: GRID_HEIGHT,
              maxWidth: '100%',
              aspectRatio: `${GRID_WIDTH} / ${GRID_HEIGHT}`,
              borderColor: darkMode ? '#475569' : '#9ca3af',
              backgroundColor: darkMode ? '#020617' : '#f9fafb'
            }}
          >
            <div style={{ width: GRID_WIDTH, height: GRID_HEIGHT, transformOrigin: 'top left' }} className="absolute top-0 left-0" id="centipede-game-inner">
              {/* Mushrooms */}
              {mushrooms.map((mush, i) => (
                <div
                  key={i}
                  className={`absolute rounded-full ${
                    mush.health > 2 ? 'bg-red-500' : mush.health > 1 ? 'bg-orange-500' : 'bg-yellow-500'
                  }`}
                  style={{
                    left: mush.x,
                    top: mush.y,
                    width: MUSHROOM_SIZE,
                    height: MUSHROOM_SIZE,
                    opacity: mush.health / 4
                  }}
                />
              ))}

              {/* Centipede */}
              {centipede.map((seg, i) => (
                <div
                  key={i}
                  className={`absolute rounded-full ${i === 0 ? 'bg-purple-500' : 'bg-green-500'}`}
                  style={{
                    left: seg.x,
                    top: seg.y,
                    width: SEGMENT_SIZE,
                    height: SEGMENT_SIZE
                  }}
                />
              ))}

              {/* Bullets */}
              {bullets.map((bullet, i) => (
                <div
                  key={i}
                  className="absolute bg-yellow-400 rounded-full"
                  style={{
                    left: bullet.x - BULLET_SIZE / 2,
                    top: bullet.y,
                    width: BULLET_SIZE,
                    height: BULLET_SIZE * 2
                  }}
                />
              ))}

              {/* Player */}
              <div
                className={`absolute rounded ${darkMode ? 'bg-cyan-400' : 'bg-cyan-500'}`}
                style={{
                  left: player.x - PLAYER_WIDTH / 2,
                  top: player.y - PLAYER_HEIGHT / 2,
                  width: PLAYER_WIDTH,
                  height: PLAYER_HEIGHT
                }}
              />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className={`p-4 rounded-xl mb-4 ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
          <div className={`text-sm font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
            How to Play:
          </div>
          <ul className={`text-sm space-y-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            <li>Arrow Keys to move left/right</li>
            <li>Spacebar to shoot</li>
            <li>Destroy centipede segments for points</li>
            <li>Avoid or shoot mushrooms (they block shots)</li>
          </ul>
        </div>

        {/* Mobile Touch Controls */}
        {!gameOver && !gameWon && (
          <div className="flex gap-4 mt-4 sm:hidden">
            <button
              onTouchStart={() => keysRef.current.add('ArrowLeft')}
              onTouchEnd={() => keysRef.current.delete('ArrowLeft')}
              className="w-16 h-16 rounded-full bg-slate-700 active:bg-slate-600 flex items-center justify-center text-2xl"
            >
              &larr;
            </button>
            <button
              onTouchStart={() => { keysRef.current.add(' '); shoot(); }}
              onTouchEnd={() => keysRef.current.delete(' ')}
              className="flex-1 h-16 rounded-lg bg-red-600 active:bg-red-500 flex items-center justify-center text-lg font-bold"
            >
              FIRE
            </button>
            <button
              onTouchStart={() => keysRef.current.add('ArrowRight')}
              onTouchEnd={() => keysRef.current.delete('ArrowRight')}
              className="w-16 h-16 rounded-full bg-slate-700 active:bg-slate-600 flex items-center justify-center text-2xl"
            >
              &rarr;
            </button>
          </div>
        )}

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
              Game Over
            </h2>
            <p className={`text-lg mb-4 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              Final Score: {score}
            </p>
          </div>
        )}

        {gameWon && (
          <div className={`mt-6 p-6 rounded-xl text-center ${darkMode ? 'bg-green-900/50' : 'bg-green-100'}`}>
            <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              You Win!
            </h2>
            <p className={`text-lg ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              Score: {score}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
