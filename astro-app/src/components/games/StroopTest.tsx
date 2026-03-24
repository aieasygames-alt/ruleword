import React, { useState, useCallback, useEffect } from 'react';

interface Round {
  color: string;
  text: string;
  correct: boolean;
  userAnswer?: 'match' | 'no-match';
  reactionTime?: number;
}

const COLORS = [
  { name: 'RED', hex: '#EF4444' },
  { name: 'BLUE', hex: '#3B82F6' },
  { name: 'GREEN', hex: '#22C55E' },
  { name: 'YELLOW', hex: '#EAB308' },
  { name: 'PURPLE', hex: '#A855F7' },
  { name: 'ORANGE', hex: '#F97316' }
];

const GAME_DURATION = 30; // seconds

export default function StroopTest() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'results'>('menu');
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const generateRound = useCallback((): Round => {
    const colorObj = COLORS[Math.floor(Math.random() * COLORS.length)];
    const textObj = COLORS[Math.floor(Math.random() * COLORS.length)];
    return {
      color: colorObj.name,
      text: textObj.name,
      correct: colorObj.name === textObj.name
    };
  }, []);

  const startGame = useCallback(() => {
    setGameState('playing');
    setRounds([]);
    setScore(0);
    setTimeLeft(GAME_DURATION);
    const newRound = generateRound();
    setCurrentRound(newRound);
    setRoundStartTime(Date.now());
  }, [generateRound]);

  const handleAnswer = useCallback((answer: 'match' | 'no-match') => {
    if (!currentRound || showFeedback) return;

    const reactionTime = Date.now() - roundStartTime;
    const isCorrect = (answer === 'match' && currentRound.correct) ||
                     (answer === 'no-match' && !currentRound.correct);

    const roundResult: Round = {
      ...currentRound,
      correct: isCorrect,
      userAnswer: answer,
      reactionTime
    };

    setRounds(prev => [...prev, roundResult]);

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
      const newRound = generateRound();
      setCurrentRound(newRound);
      setRoundStartTime(Date.now());
    }, 500);
  }, [currentRound, roundStartTime, showFeedback, generateRound]);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing' || timeLeft <= 0) {
      if (timeLeft <= 0 && gameState === 'playing') {
        setGameState('results');
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  // Calculate stats
  const correctCount = rounds.filter(r => r.correct).length;
  const avgReactionTime = rounds.length > 0
    ? Math.round(rounds.reduce((sum, r) => sum + (r.reactionTime || 0), 0) / rounds.length)
    : 0;
  const accuracy = rounds.length > 0 ? Math.round((correctCount / rounds.length) * 100) : 0;

  if (gameState === 'menu') {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${darkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
        <div className={`max-w-md w-full rounded-2xl shadow-2xl p-8 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <h1 className={`text-4xl font-bold mb-4 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            🎨 Stroop Test
          </h1>
          <p className={`text-center mb-8 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            Test your cognitive flexibility! Answer whether the text color matches the word meaning.
          </p>

          <div className="space-y-4 mb-8">
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
              <p className={`text-sm font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>How to Play:</p>
              <ul className={`text-sm space-y-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                <li>• You have {GAME_DURATION} seconds</li>
                <li>• Click "MATCH" if the color matches the word</li>
                <li>• Click "NO MATCH" if they differ</li>
                <li>• Go as fast as you can!</li>
              </ul>
            </div>

            <div className="flex justify-center gap-4">
              <div className="text-center">
                <div className={`text-3xl mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>RED</div>
                <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Word: red</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl mb-1`} style={{ color: '#EF4444' }}>BLUE</div>
                <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Color: {isCorrect ? '✓' : '✗'}</div>
              </div>
            </div>
          </div>

          <button
            onClick={startGame}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              darkMode
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white'
                : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white'
            }`}
          >
            Start Test
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'results') {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${darkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
        <div className={`max-w-md w-full rounded-2xl shadow-2xl p-8 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <h2 className={`text-3xl font-bold mb-6 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            🎯 Test Complete!
          </h2>

          <div className="space-y-4 mb-8">
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
              <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Score</div>
              <div className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                {correctCount}/{rounds.length}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Accuracy</div>
                <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {accuracy}%
                </div>
              </div>
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Avg Time</div>
                <div className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  {avgReactionTime}ms
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
              <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Performance</div>
              {accuracy >= 90 ? (
                <p className={`text-lg font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  🏆 Excellent! Above average cognitive flexibility!
                </p>
              ) : accuracy >= 70 ? (
                <p className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  👍 Good! Normal cognitive function.
                </p>
              ) : (
                <p className={`text-lg font-semibold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  💪 Keep practicing to improve!
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => setGameState('menu')}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              darkMode
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white'
            }`}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${darkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <div className={`max-w-md w-full rounded-2xl shadow-2xl p-8 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{score}</div>
            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Score</div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${timeLeft < 10 ? 'text-red-400' : darkMode ? 'text-white' : 'text-gray-900'}`}>
              {timeLeft}
            </div>
            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Seconds</div>
          </div>
        </div>

        {/* Stimulus */}
        {currentRound && (
          <div className="mb-8">
            <div
              className={`text-6xl font-bold text-center py-12 rounded-xl transition-all ${
                showFeedback
                  ? (currentRound.correct ? 'bg-green-500/20' : 'bg-red-500/20')
                  : darkMode ? 'bg-slate-700' : 'bg-gray-100'
              }`}
              style={{ color: COLORS.find(c => c.name === currentRound.color)?.hex }}
            >
              {currentRound.text}
            </div>
            {showFeedback && (
              <div className={`text-center mt-4 text-lg font-semibold ${
                currentRound.correct ? 'text-green-400' : 'text-red-400'
              }`}>
                {currentRound.correct ? '✓ Correct!' : '✗ Wrong!'}
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleAnswer('match')}
            disabled={showFeedback}
            className={`py-6 rounded-xl font-bold text-lg transition-all ${
              showFeedback
                ? 'bg-slate-600 cursor-not-allowed'
                : darkMode
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : 'bg-green-600 hover:bg-green-500 text-white'
            }`}
          >
            ✓ MATCH
          </button>
          <button
            onClick={() => handleAnswer('no-match')}
            disabled={showFeedback}
            className={`py-6 rounded-xl font-bold text-lg transition-all ${
              showFeedback
                ? 'bg-slate-600 cursor-not-allowed'
                : darkMode
                  ? 'bg-red-600 hover:bg-red-500 text-white'
                  : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
          >
            ✗ NO MATCH
          </button>
        </div>
      </div>
    </div>
  );
}
