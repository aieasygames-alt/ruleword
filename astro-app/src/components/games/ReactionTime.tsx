import React, { useState, useCallback, useEffect, useRef } from 'react';

interface Attempt {
  reactionTime: number;
  timestamp: number;
}

const TARGET_COLORS = ['#EF4444', '#22C55E', '#3B82F6', '#EAB308', '#A855F7'];

export default function ReactionTime() {
  const [gameState, setGameState] = useState<'waiting' | 'ready' | 'clicked' | 'results'>('waiting');
  const [startTime, setStartTime] = useState<number>(0);
  const [reactionTime, setReactionTime] = useState<number>(0);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [showTarget, setShowTarget] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const targetTimeoutRef = useRef<NodeJS.Timeout>();

  const startRound = useCallback(() => {
    setGameState('waiting');
    setShowTarget(false);
    setReactionTime(0);

    const delay = 2000 + Math.random() * 3000; // 2-5 seconds random delay

    timeoutRef.current = setTimeout(() => {
      setStartTime(Date.now());
      setGameState('ready');
      setShowTarget(true);

      // Target disappears after 2 seconds
      targetTimeoutRef.current = setTimeout(() => {
        if (gameState === 'ready') {
          setShowTarget(false);
          setGameState('clicked');
          setReactionTime(0); // Too slow
        }
      }, 2000);
    }, delay);
  }, [gameState]);

  useEffect(() => {
    startRound();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (targetTimeoutRef.current) clearTimeout(targetTimeoutRef.current);
    };
  }, []);

  const handleClick = useCallback(() => {
    if (gameState === 'waiting') {
      // Too early!
      clearTimeout(timeoutRef.current!);
      clearTimeout(targetTimeoutRef.current!);
      setGameState('clicked');
      setReactionTime(-1);
      setShowTarget(false);
    } else if (gameState === 'ready') {
      const endTime = Date.now();
      const time = endTime - startTime;
      setReactionTime(time);
      setGameState('clicked');
      setShowTarget(false);
      clearTimeout(targetTimeoutRef.current!);
    }
  }, [gameState, startTime]);

  const handleNextRound = useCallback(() => {
    startRound();
  }, [startRound]);

  const handleShowResults = useCallback(() => {
    setGameState('results');
  }, []);

  if (gameState === 'results') {
    const validAttempts = attempts.filter(a => a.reactionTime > 0);
    const avgTime = validAttempts.length > 0
      ? Math.round(validAttempts.reduce((sum, a) => sum + a.reactionTime, 0) / validAttempts.length)
      : 0;
    const bestTime = validAttempts.length > 0
      ? Math.min(...validAttempts.map(a => a.reactionTime))
      : 0;

    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${darkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
        <div className={`max-w-md w-full rounded-2xl shadow-2xl p-8 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <h2 className={`text-3xl font-bold mb-6 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            ⚡ Results
          </h2>

          <div className="space-y-4 mb-8">
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
              <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Attempts</div>
              <div className={`text-3xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                {attempts.length}
              </div>
            </div>

            {validAttempts.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                    <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Average</div>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {avgTime}ms
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                    <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Best</div>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                      {bestTime}ms
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                  <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Rating</div>
                  {avgTime < 200 ? (
                    <p className={`text-lg font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      🏆 Elite! Pro gamer reflexes!
                    </p>
                  ) : avgTime < 250 ? (
                    <p className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      👍 Above average! Great reaction time.
                    </p>
                  ) : avgTime < 300 ? (
                    <p className={`text-lg font-semibold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                      📊 Average. Normal human reaction.
                    </p>
                  ) : (
                    <p className={`text-lg font-semibold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                      💪 Keep practicing to improve!
                    </p>
                  )}
                </div>
              </>
            )}

            <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
              <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Recent Attempts</div>
              <div className="mt-2 space-y-1">
                {attempts.slice(-5).reverse().map((attempt, i) => (
                  <div key={i} className={`flex justify-between text-sm ${
                    attempt.reactionTime < 0
                      ? 'text-red-400'
                      : attempt.reactionTime < 200
                        ? 'text-green-400'
                        : attempt.reactionTime < 250
                          ? 'text-blue-400'
                          : 'text-yellow-400'
                  }`}>
                    <span>{attempt.reactionTime < 0 ? 'Too early!' : `${attempt.reactionTime}ms`}</span>
                    </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setAttempts([]);
              startRound();
            }}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              darkMode
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white'
            }`}
          >
            New Test
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${darkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <div className={`max-w-md w-full rounded-2xl shadow-2xl p-8 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
        {/* Instructions */}
        <div className="mb-8 text-center">
          <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Reaction Time Test</h1>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            Wait for the target to appear, then click as fast as you can!
          </p>
        </div>

        {/* Target Area */}
        <div
          onClick={handleClick}
          className={`aspect-square rounded-2xl flex items-center justify-center cursor-pointer transition-all mb-8 ${
            showTarget
              ? 'bg-green-500 scale-100'
              : gameState === 'waiting'
                ? 'bg-red-500/20 scale-100'
                : 'bg-slate-700 scale-100'
          } ${gameState === 'clicked' ? 'scale-95' : ''}`}
        >
          {showTarget ? (
            <div className="text-6xl">🎯</div>
          ) : gameState === 'waiting' ? (
            <div className={`text-center ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              <div className="text-4xl mb-2">⏳</div>
              <div className="text-lg">Wait for green...</div>
            </div>
          ) : gameState === 'clicked' ? (
            <div className="text-center">
              {reactionTime < 0 ? (
                <>
                  <div className="text-4xl mb-2">⚡</div>
                  <div className={`text-lg ${darkMode ? 'text-red-400' : 'text-red-600'}`}>Too early!</div>
                </>
              ) : (
                <>
                  <div className={`text-5xl mb-2 font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    {reactionTime}ms
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    {reactionTime < 200 ? '🔥 Excellent!' : reactionTime < 250 ? '👍 Good!' : '📊 Average'}
                  </div>
                </>
              )}
            </div>
          ) : null}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Attempts</div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {attempts.length}
            </div>
          </div>
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Last Time</div>
            <div className={`text-2xl font-bold ${
              reactionTime > 0
                ? (reactionTime < 200 ? 'text-green-400' : reactionTime < 250 ? 'text-blue-400' : 'text-yellow-400')
                : darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {reactionTime > 0 ? `${reactionTime}ms` : '-'}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleNextRound}
            disabled={gameState === 'waiting'}
            className={`py-4 rounded-xl font-bold transition-all ${
              gameState === 'waiting'
                ? 'bg-slate-600 cursor-not-allowed text-slate-400'
                : darkMode
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            Next Round
          </button>
          <button
            onClick={handleShowResults}
            className={`py-4 rounded-xl font-bold transition-all ${
              darkMode
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : 'bg-green-600 hover:bg-green-500 text-white'
            }`}
          >
            See Results
          </button>
        </div>
      </div>
    </div>
  );
}
